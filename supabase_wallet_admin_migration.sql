-- ============================================================================
-- Wallet Admin System Migration
-- Fixes RLS policies for wallet operations and adds admin approval system
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON REQUIRED TABLES
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP EXISTING RLS POLICIES (Clean slate)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.user_wallets;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.wallet_transactions;

DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

-- ============================================================================
-- 3. CREATE USER ROLE CHECK FUNCTION
-- ============================================================================

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. RLS POLICIES FOR user_wallets TABLE
-- ============================================================================

-- Policy: Users can view their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own wallet (for initial creation)
CREATE POLICY "Users can insert own wallet"
  ON public.user_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own wallet (balance updates)
CREATE POLICY "Users can update own wallet"
  ON public.user_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
  ON public.user_wallets FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy: Admins can update wallet balance (for approvals)
CREATE POLICY "Admins can update wallets"
  ON public.user_wallets FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- 5. RLS POLICIES FOR wallet_transactions TABLE
-- ============================================================================

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transaction records
CREATE POLICY "Users can insert own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.wallet_transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy: Admins can update transaction status (approve/reject)
CREATE POLICY "Admins can update transactions"
  ON public.wallet_transactions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- 6. RLS POLICIES FOR support_tickets TABLE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = admin_id);

-- Policy: Users can create support tickets
CREATE POLICY "Users can create support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tickets
CREATE POLICY "Users can update own tickets"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy: Admins can update tickets (add response)
CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- 7. CREATE HELPER FUNCTION FOR TRANSACTION APPROVAL
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_wallet_transaction(
  transaction_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  tx_amount DECIMAL;
  tx_user_id UUID;
  wallet_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can approve transactions';
  END IF;

  -- Get transaction details
  SELECT amount, user_id, wallet_id INTO tx_amount, tx_user_id, wallet_id
  FROM public.wallet_transactions
  WHERE id = transaction_id;

  -- Update transaction status
  UPDATE public.wallet_transactions
  SET status = new_status
  WHERE id = transaction_id;

  -- If approved, update wallet balance
  IF new_status = 'approved' THEN
    UPDATE public.user_wallets
    SET balance = balance + tx_amount
    WHERE user_id = tx_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. CREATE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- ============================================================================
-- 9. GRANT APPROPRIATE PERMISSIONS
-- ============================================================================

-- Grant execute permission on is_admin function
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_wallet_transaction(UUID, TEXT) TO authenticated;

-- ============================================================================
-- NOTES FOR DEPLOYMENT
-- ============================================================================
/*
1. Run this migration in Supabase SQL Editor
2. Verify RLS is enabled on all tables: Dashboard → SQL Editor → see "enabled" status
3. Test the following scenarios:
   - User can submit wallet funding request
   - Admin can view all pending wallet requests
   - Admin can approve/reject requests
   - User balance updates after admin approval
   - Users can create support tickets
   - Admins can view and respond to tickets

4. If you get "permission denied" errors:
   - Check that user_roles table has 'admin' entries for admins
   - Verify auth.uid() is returning correct user ID
   - Ensure RLS policies have 'TO authenticated' clause

5. Common issues and solutions:
   - "row level security policy" error: The is_admin() function needs user_roles table to exist
     If it doesn't, create: CREATE TABLE user_roles (id UUID, user_id UUID UNIQUE, role TEXT);
   - Profile update fails: The user_roles table must have an entry for that user
*/
