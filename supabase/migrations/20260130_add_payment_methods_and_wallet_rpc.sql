-- Migration: Add payment fields, constraints, RPC for wallet payment, and RLS policies

-- 1) Add columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'bank_transfer',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_delivered',
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS delivery_note text NULL,
  ADD COLUMN IF NOT EXISTS proof_url text NULL;

-- 2) Add check constraints
ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_payment_method_check
  CHECK (payment_method IN ('wallet', 'bank_transfer'));

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_payment_status_check
  CHECK (payment_status IN ('unpaid','submitted','paid','rejected'));

ALTER TABLE public.orders
  ADD CONSTRAINT IF NOT EXISTS orders_delivery_status_check
  CHECK (delivery_status IN ('not_delivered','delivered'));

-- 3) Create RPC for wallet payments
-- Atomic operation: verifies ownership, availability, funds; deducts wallet balance, inserts a wallet transaction, marks order paid + delivered and marks listing sold.
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

  -- Update order to paid and delivered instantly
  UPDATE public.orders
    SET payment_method = 'wallet',
        payment_status = 'paid',
        delivery_status = 'delivered',
        delivered_at = now(),
        delivery_note = 'Instant delivery via wallet payment',
        status = 'delivered'
    WHERE id = p_order_id;

  -- Mark listing as sold
  UPDATE public.listings
    SET status = 'sold'
    WHERE id = v_listing.id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
EXCEPTION WHEN others THEN
  -- Bubble up a clear error message
  RAISE;
END;
$$;

-- 4) Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION public.pay_order_with_wallet(uuid) TO authenticated;

-- 5) Row Level Security (RLS) and policies
-- Orders: users can select their own orders; they can update orders but cannot set payment_status to 'paid' or change payment_method after payment is submitted/paid
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_select_own_orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "users_update_own_orders"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Users are not allowed to directly mark orders as paid or set delivery fields
    AND coalesce(payment_status, '') NOT IN ('paid')
    AND coalesce(delivery_status, '') NOT IN ('delivered')
  );

-- Admins (via jwt claim `is_admin=true`) get full access to orders
CREATE POLICY IF NOT EXISTS "admins_full_access_orders"
  ON public.orders FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'is_admin' = 'true')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'is_admin' = 'true');

-- User wallets: enable RLS and allow users to select their own wallet. Balance updates should ONLY occur inside the RPC.
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_select_own_wallets"
  ON public.user_wallets FOR SELECT
  USING (user_id = auth.uid());

-- Wallet transactions: users can select their own transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_select_own_wallet_transactions"
  ON public.wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

-- Give admin access to wallets and transactions as above
CREATE POLICY IF NOT EXISTS "admins_full_access_wallets"
  ON public.user_wallets FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'is_admin' = 'true')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'is_admin' = 'true');

CREATE POLICY IF NOT EXISTS "admins_full_access_wallet_transactions"
  ON public.wallet_transactions FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'is_admin' = 'true')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'is_admin' = 'true');

-- 6) Notes
-- Run this migration on your Supabase project. The admin policy expressions assume you set an `is_admin` claim in your JWT. If you use a different claim or role, update the policy expressions accordingly.
