-- ============================================================================
-- FIXED Wallet Admin System Migration
-- Fixes RLS policies and ensures support_tickets table has correct schema
-- ============================================================================

-- ============================================================================
-- 1. DROP EXISTING support_tickets TABLE (if it exists) AND RECREATE
-- ============================================================================

DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- Create support_tickets table with correct schema
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

-- ============================================================================
-- 2. ENABLE RLS ON ALL REQUIRED TABLES
-- ============================================================================

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. DROP EXISTING RLS POLICIES (Clean slate)
-- ============================================================================

-- Drop wallet policies
DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Admins can update wallets" ON public.user_wallets;

-- Drop transaction policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.wallet_transactions;

-- Drop support ticket policies
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

-- ============================================================================
-- 4. CREATE OR REPLACE USER ROLE CHECK FUNCTION
-- ============================================================================

-- Drop function if it exists
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

-- Create a function to check if user is admin
CREATE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. RLS POLICIES FOR user_wallets TABLE
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
-- 6. RLS POLICIES FOR wallet_transactions TABLE
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
-- 7. RLS POLICIES FOR support_tickets TABLE
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
-- 8. CREATE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- ============================================================================
-- Enforce minimum deposit amount via trigger
-- ============================================================================

-- Drop function if it exists
DROP FUNCTION IF EXISTS public.enforce_min_deposit_amount() CASCADE;

-- Create a trigger function that raises a specific error when a deposit is below $1000
CREATE FUNCTION public.enforce_min_deposit_amount()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF (NEW.type = 'deposit' AND (NEW.amount IS NULL OR NEW.amount < 1000)) THEN
      RAISE EXCEPTION 'Minimum wallet funding amount is $1000.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to wallet_transactions
DROP TRIGGER IF EXISTS trg_enforce_min_deposit_amount ON public.wallet_transactions;
CREATE TRIGGER trg_enforce_min_deposit_amount
  BEFORE INSERT OR UPDATE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_min_deposit_amount();

-- ============================================================================
-- 9. GRANT APPROPRIATE PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION STEPS
-- ============================================================================

/*
After running this migration, verify:

1. Check table exists:
   SELECT tablename FROM pg_tables WHERE tablename = 'support_tickets';

2. Check columns exist:
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'support_tickets' 
   ORDER BY ordinal_position;

3. Check RLS is enabled:
   SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'support_tickets';

4. Check policies exist:
   SELECT policyname FROM pg_policies WHERE tablename = 'support_tickets';

5. Check indexes exist:
   SELECT indexname FROM pg_indexes WHERE tablename = 'support_tickets';
*/
