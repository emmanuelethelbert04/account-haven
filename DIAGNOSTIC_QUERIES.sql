-- ============================================================================
-- QUICK DIAGNOSTIC QUERIES - Run these to troubleshoot RLS issues
-- ============================================================================

-- 1. Check if RLS is enabled on wallet_transactions
SELECT tablename, relrowsecurity 
FROM pg_class 
JOIN information_schema.tables ON pg_class.relname = tables.table_name
WHERE tablename = 'wallet_transactions';

-- Expected: relrowsecurity = true

---

-- 2. List all policies on wallet_transactions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'wallet_transactions'
ORDER BY policyname;

-- Expected: Should see policies like select_own_transactions, insert_own_transactions, etc.

---

-- 3. Check support_tickets table exists
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'support_tickets'
ORDER BY ordinal_position;

-- Expected: Should see id, user_id, name, email, subject, message, status, admin_response, admin_id, created_at, updated_at

---

-- 4. Check RLS on support_tickets
SELECT tablename, relrowsecurity 
FROM pg_class 
JOIN information_schema.tables ON pg_class.relname = tables.table_name
WHERE tablename = 'support_tickets';

-- Expected: relrowsecurity = true

---

-- 5. Check all policies on support_tickets
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'support_tickets'
ORDER BY policyname;

-- Expected: Should see policies for select, insert, update

---

-- 6. Check user_roles table exists and has admin entries
SELECT * FROM public.user_roles LIMIT 10;

-- Expected: Should see user_id and role columns, with some rows having role='admin'

---

-- 7. Check current authenticated user
SELECT auth.uid() as current_user_id;

-- Expected: Should return a UUID

---

-- 8. Test: Try to insert a test transaction
-- IMPORTANT: Replace the UUIDs with real values from your database
/*
INSERT INTO public.wallet_transactions 
  (wallet_id, user_id, amount, type, status, description)
VALUES 
  (
    'wallet-uuid-here',
    auth.uid(),
    50,
    'deposit',
    'pending',
    'Test transaction'
  )
RETURNING id, user_id, status;
*/

-- This should succeed if RLS is properly configured

---

-- 9. Verify wallet_transactions columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions'
ORDER BY ordinal_position;

-- Expected columns:
-- id (UUID)
-- wallet_id (UUID)
-- user_id (UUID)
-- amount (numeric/decimal)
-- type (text)
-- description (text)
-- reference_id (text)
-- proof_url (text)
-- status (text)
-- created_at (timestamp)

---

-- 10. Check for any constraints or triggers that might block inserts
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'wallet_transactions';

-- Expected: Foreign key constraints on wallet_id and user_id

---

-- 11. List all indexes on wallet_transactions
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'wallet_transactions'
ORDER BY indexname;

-- Expected: Indexes for user_id, status, created_at, etc.

---

-- ============================================================================
-- SUMMARY
-- If all these checks pass:
-- 1. RLS is enabled
-- 2. Policies exist and are correct
-- 3. Columns are properly defined
-- 4. User is authenticated
-- 
-- Then the RLS error should NOT occur
-- ============================================================================
