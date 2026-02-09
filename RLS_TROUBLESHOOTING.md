# 🔧 RLS Error Troubleshooting Guide

## Error: "new row violates row-level security policy"

This error occurs when a user tries to insert a wallet transaction, but the RLS (Row Level Security) policy blocks the insert. Here's how to fix it:

---

## 🎯 Quick Fix Steps

### Step 1: Run the Latest Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Open file: `supabase_wallet_admin_migration_v3.sql`
6. Copy all contents and paste into SQL editor
7. Click **Run**
8. Wait for "Executed successfully" message

**What this does:**
- ✅ Drops and recreates RLS policies correctly
- ✅ Creates `support_tickets` table
- ✅ Sets up admin access policies
- ✅ Creates proper indexes

### Step 2: Verify the Migration Worked

Open **SQL Editor** and run the diagnostic queries from `DIAGNOSTIC_QUERIES.sql`:

```sql
-- Check RLS is enabled
SELECT tablename, relrowsecurity 
FROM pg_class 
JOIN information_schema.tables ON pg_class.relname = tables.table_name
WHERE tablename = 'wallet_transactions';
```

**Expected result:** `relrowsecurity = true`

### Step 3: Test the Wallet Funding

1. **Clear your browser cache and cookies**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "All time"
   - Check "Cookies and cached images"
   - Click "Clear data"

2. **Refresh the page** and log in again

3. **Go to Dashboard → My Wallet → Add Funds**

4. **Fill in the form:**
   - Amount: `50` (or any amount > 0)
   - Upload a test image
   - Click "Submit Request"

5. **Check browser console** for detailed error messages:
   - Press `F12` to open Developer Tools
   - Go to **Console** tab
   - Look for error logs with details

---

## 🔍 Troubleshooting by Error Type

### Error: "column 'admin_id' does not exist"

**Cause:** `support_tickets` table doesn't have the correct schema

**Fix:**
```sql
-- Check if table exists
SELECT * FROM information_schema.columns 
WHERE table_name = 'support_tickets';

-- If it doesn't have admin_id column, run v3 migration again
```

### Error: "relation wallet_transactions does not exist"

**Cause:** Table wasn't created or was deleted

**Fix:**
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'wallet_transactions';

-- If it doesn't exist, the table was never created
-- Run v3 migration
```

### Error: "permission denied for schema public"

**Cause:** User doesn't have proper permissions

**Fix:** Contact Supabase support or check IAM settings

### Error: "row level security policy violation" (still persists)

**Cause:** RLS policies aren't matching the user ID correctly

**Diagnosis Steps:**

1. Check if user is authenticated:
```sql
SELECT auth.uid() as current_user_id;
```
Should return a UUID, not null.

2. Check if user_id matches:
```sql
-- Open browser console and run:
const user = supabase.auth.getUser();
console.log(user); // Check user.data.user.id
```

3. Check if wallet exists:
```sql
SELECT * FROM user_wallets 
WHERE user_id = 'your-user-id-here';
```
Should return a wallet row.

4. Test RLS policy directly:
```sql
-- This should work if RLS is correct
INSERT INTO wallet_transactions 
  (wallet_id, user_id, amount, type, status)
VALUES 
  ('valid-wallet-uuid', auth.uid(), 50, 'deposit', 'pending')
RETURNING id;
```

---

## 📊 How RLS Works

The RLS policy for `wallet_transactions` INSERT requires:

```sql
WITH CHECK (auth.uid() = user_id)
```

This means:
- `auth.uid()` = Current logged-in user's ID (from Supabase Auth)
- `user_id` = The user_id being inserted in the record

**They MUST match** for the insert to succeed.

---

## ✅ Verification Checklist

Run these in Supabase SQL Editor:

- [ ] RLS is enabled on `wallet_transactions`
  ```sql
  SELECT relrowsecurity FROM pg_class WHERE relname = 'wallet_transactions';
  ```
  Expected: `true`

- [ ] Insert policy exists
  ```sql
  SELECT policyname FROM pg_policies 
  WHERE tablename = 'wallet_transactions' AND policyname LIKE '%insert%';
  ```
  Expected: Should return a policy name

- [ ] User can authenticate
  ```sql
  SELECT auth.uid();
  ```
  Expected: UUID (not null)

- [ ] User's wallet exists
  ```sql
  SELECT id FROM user_wallets WHERE user_id = auth.uid();
  ```
  Expected: At least one row

- [ ] Test insert works
  ```sql
  INSERT INTO wallet_transactions 
    (wallet_id, user_id, amount, type, status)
  VALUES 
    ('wallet-uuid', auth.uid(), 50, 'deposit', 'pending')
  RETURNING id;
  ```
  Expected: Success

---

## 🐛 Debugging with Console Logs

The updated `WalletPage.tsx` now includes detailed console logging. To view it:

1. Open Developer Tools: Press `F12`
2. Go to **Console** tab
3. Refresh the page
4. Try submitting a wallet funding request
5. Look for logs like:
   - `Current user ID: <uuid>`
   - `Proof uploaded. URL: ...`
   - `Creating transaction with: {wallet_id, user_id, amount}`
   - `Transaction created successfully: ...`
   - Or error details if it fails

Copy these logs to help diagnose issues.

---

## 🚀 If All Else Fails

1. **Check Supabase Status:** https://status.supabase.com
2. **Check Project Logs:**
   - Go to Supabase Dashboard
   - Navigate to **Logs** → **PostgreSQL**
   - Look for errors related to RLS
3. **Enable RLS Debugging:**
   - Create a test admin user with full permissions
   - Try inserting as admin (different RLS path)
4. **Contact Supabase Support:** Provide all console logs and SQL error messages

---

## 📝 Version History

- **v3** (Latest): Simplified RLS, proper admin checks
- **v2**: Fixed table schema with admin_id
- **v1**: Initial implementation (had issues)

Use **v3** - it's the most stable and tested version.

---

## 💡 Key Points

1. **RLS must be enabled** on the table
2. **INSERT policy must allow authenticated users** with `WITH CHECK (auth.uid() = user_id)`
3. **User must be logged in** (auth.uid() must return a UUID)
4. **user_id in the insert** must match auth.uid()
5. **Wallet must exist** before inserting transaction

If all 5 points are true, the insert will succeed!
