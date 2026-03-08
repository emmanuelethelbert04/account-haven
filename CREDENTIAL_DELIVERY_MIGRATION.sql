-- ============================================================================
-- MIGRATION: Add credential fields for automatic account delivery
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1) Add credential columns to listings (admin enters these when creating listings)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS account_email text NULL,
  ADD COLUMN IF NOT EXISTS account_password text NULL,
  ADD COLUMN IF NOT EXISTS account_2fa text NULL;

-- 2) Add credential columns to orders (copied during wallet auto-delivery)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS account_email text NULL,
  ADD COLUMN IF NOT EXISTS account_password text NULL,
  ADD COLUMN IF NOT EXISTS account_2fa text NULL,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz NULL;

-- 3) IMPORTANT: Update listings_public view to EXCLUDE credentials
-- Credentials must NEVER be exposed through the public view
-- First check if view exists, then recreate without credential columns
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public
WITH (security_invoker = on) AS
  SELECT
    id, platform, title, description,
    price, price_per_unit, minimum_price, stock_quantity,
    delivery_time, rating, success_rate, orders_count,
    followers_count, country, niche, account_age,
    images, login_screenshot_url, status, featured,
    created_at, deleted_at
  FROM public.listings;
-- NOTE: account_email, account_password, account_2fa are intentionally EXCLUDED

-- 4) Update pay_order_with_wallet to copy credentials and nullify on listing
CREATE OR REPLACE FUNCTION public.pay_order_with_wallet(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid()::uuid;
  v_order RECORD;
  v_wallet RECORD;
  v_listing RECORD;
BEGIN
  -- Ensure authenticated
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock and fetch order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Ownership check
  IF v_order.user_id IS DISTINCT FROM v_user THEN
    RAISE EXCEPTION 'Order does not belong to user';
  END IF;

  -- Order must be unpaid
  IF v_order.payment_status <> 'unpaid' THEN
    RAISE EXCEPTION 'Order already paid or submitted';
  END IF;

  -- Lock and fetch listing to ensure availability
  SELECT * INTO v_listing FROM public.listings WHERE id = v_order.listing_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  IF v_listing.status <> 'available' THEN
    RAISE EXCEPTION 'Listing unavailable';
  END IF;

  -- Lock and fetch wallet
  SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Check funds
  IF v_wallet.balance < v_order.amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Deduct wallet balance
  UPDATE public.user_wallets
    SET balance = balance - v_order.amount,
        updated_at = now()
    WHERE id = v_wallet.id;

  -- Insert transaction record
  INSERT INTO public.wallet_transactions (wallet_id, user_id, amount, type, description, status, created_at)
  VALUES (v_wallet.id, v_user, v_order.amount, 'purchase', 'Order payment via wallet', 'approved', now());

  -- Update order: copy credentials from listing, mark as delivered
  UPDATE public.orders
    SET payment_method = 'wallet',
        payment_status = 'paid',
        delivery_status = 'delivered',
        delivered_at = now(),
        paid_at = now(),
        status = 'delivered',
        account_email = v_listing.account_email,
        account_password = v_listing.account_password,
        account_2fa = v_listing.account_2fa,
        delivery_note = 'Instant delivery via wallet payment'
    WHERE id = p_order_id;

  -- Mark listing as sold and nullify credentials
  UPDATE public.listings
    SET status = 'sold',
        account_email = NULL,
        account_password = NULL,
        account_2fa = NULL
    WHERE id = v_listing.id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
EXCEPTION WHEN others THEN
  RAISE;
END;
$$;

-- 5) Grant execute
GRANT EXECUTE ON FUNCTION public.pay_order_with_wallet(uuid) TO authenticated;

-- 6) RLS: Ensure orders credential columns are only visible to the order owner
-- The existing "users_select_own_orders" policy already restricts SELECT to user_id = auth.uid()
-- This means credentials on orders are only visible to the buyer. ✅

-- ============================================================================
-- DONE! After running this:
-- 1. Admin adds credentials when creating/editing listings
-- 2. Wallet purchases auto-copy credentials to the order
-- 3. Buyer sees credentials on their order detail page
-- 4. Listing credentials are wiped after sale
-- ============================================================================
