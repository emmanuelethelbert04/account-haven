-- ============================================================================
-- SIMPLE FIX: Wallet Transactions RLS Policy
-- Focus on fixing the wallet_transactions INSERT issue
-- ============================================================================

-- ============================================================================
-- 1. ENSURE RLS IS ENABLED
-- ============================================================================

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP ALL EXISTING POLICIES ON wallet_transactions
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.wallet_transactions;

-- ============================================================================
-- 3. CREATE SIMPLE RLS POLICIES FOR wallet_transactions
-- ============================================================================

-- Allow ANY authenticated user to SELECT their own transactions
CREATE POLICY "select_own_transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow ANY authenticated user to INSERT their own transactions
CREATE POLICY "insert_own_transactions"
  ON public.wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to UPDATE their own transactions
CREATE POLICY "update_own_transactions"
  ON public.wallet_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. FIX wallet_wallets POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Admins can update wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Enable insert for authenticated users own wallet" ON public.user_wallets;

-- Allow ANY authenticated user to SELECT their own wallet
CREATE POLICY "select_own_wallet"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow ANY authenticated user to INSERT their own wallet
CREATE POLICY "insert_own_wallet"
  ON public.user_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to UPDATE their own wallet
CREATE POLICY "update_own_wallet"
  ON public.user_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE support_tickets TABLE IF NOT EXISTS
-- ============================================================================

-- Drop if exists to recreate with correct schema
DROP TABLE IF EXISTS public.support_tickets CASCADE;

CREATE TABLE public.support_tickets (
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

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- ============================================================================
-- 6. RLS POLICIES FOR support_tickets
-- ============================================================================

-- Users can view their own tickets
CREATE POLICY "select_own_tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create support tickets
CREATE POLICY "insert_own_tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets
CREATE POLICY "update_own_tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. ADMIN ACCESS POLICIES (using auth.jwt() for role check)
-- ============================================================================

-- Admins can view all wallet transactions
CREATE POLICY "admin_view_all_transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update all transactions
CREATE POLICY "admin_update_transactions"
  ON public.wallet_transactions FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can view all wallets
CREATE POLICY "admin_view_all_wallets"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update all wallets
CREATE POLICY "admin_update_wallets"
  ON public.user_wallets FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can view all support tickets
CREATE POLICY "admin_view_all_tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update all support tickets
CREATE POLICY "admin_update_tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'user_role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

/*
After running this migration, verify by running these queries:

1. Check wallet_transactions RLS is enabled:
   SELECT relname, relrowsecurity FROM pg_class 
   WHERE relname = 'wallet_transactions';
   
   Expected output: relrowsecurity = true

2. Check policies on wallet_transactions:
   SELECT policyname, qual FROM pg_policies 
   WHERE tablename = 'wallet_transactions';
   
   Expected: Should see select_own_transactions, insert_own_transactions, etc.

3. Check support_tickets table exists:
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'support_tickets' 
   ORDER BY ordinal_position;

4. Check RLS on support_tickets:
   SELECT relname, relrowsecurity FROM pg_class 
   WHERE relname = 'support_tickets';

5. Try inserting a test transaction (replace with real user_id):
   INSERT INTO public.wallet_transactions 
     (wallet_id, user_id, amount, type, status)
   VALUES 
     ('wallet-uuid', auth.uid(), 50, 'deposit', 'pending')
   RETURNING id;
*/
