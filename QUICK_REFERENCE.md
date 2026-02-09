# 🚀 Quick Reference: Wallet Funding System Setup

## 3-Step Quick Setup

### Step 1️⃣: Create Storage Bucket (5 minutes)
```
Supabase Dashboard → Storage → Create new bucket
├─ Name: payment-proofs
├─ Public: ✗ (uncheck - keep private)
└─ Click: Create
```

### Step 2️⃣: Add Storage Policies (3 minutes)
```
Payment-proofs bucket → Policies → New Policy
├─ Policy 1: INSERT (for authenticated users)
├─ Policy 2: SELECT (for authenticated users)
└─ Save both
```

### Step 3️⃣: Test Upload (2 minutes)
```
Dashboard → My Wallet → Add Funds
├─ Amount: 50
├─ Image: Upload any JPG/PNG
├─ Submit
└─ Check console for ✓ success logs
```

---

## System Architecture

```
User (WalletPage)
    ↓
    ├─→ Auth Check (supabase.auth.getUser())
    │
    ├─→ File Upload (storage.upload → payment-proofs bucket)
    │
    ├─→ Get Public URL (storage.getPublicUrl)
    │
    └─→ Create Transaction (INSERT into wallet_transactions)
            ↓
            [RLS Policy Check: auth.uid() = user_id]
            ↓
        ✓ Transaction Created
        ✓ Wallet marked as "pending"
        ↓
Admin Dashboard (AdminWalletFundingPage)
    ↓
    Sees all pending requests
    ├─→ Approve (wallet balance updated)
    └─→ Reject (transaction marked as rejected)
```

---

## Error Resolution Tree

```
"Failed to upload payment proof"
├─ Bucket doesn't exist
│  └─ FIX: Create payment-proofs bucket in Storage
│
├─ No upload permission
│  └─ FIX: Add INSERT policy to bucket
│
├─ File too large (>10MB)
│  └─ FIX: Upload smaller image
│
├─ Wrong file type
│  └─ FIX: Upload JPG/PNG instead
│
└─ Network error
   └─ FIX: Check internet, refresh page, try again
```

---

## Complete Flow Checklist

- [ ] **Database Setup**
  - [x] RLS enabled on wallet_transactions
  - [x] Insert policy allows authenticated users
  - [x] v3 migration applied
  - [x] Indexes created

- [ ] **Storage Setup** ← YOU ARE HERE
  - [ ] payment-proofs bucket created
  - [ ] Bucket is private (not public)
  - [ ] INSERT policy added
  - [ ] SELECT policy added

- [ ] **Frontend Ready**
  - [x] WalletPage component updated
  - [x] Better error handling added
  - [x] Console logging added
  - [x] Admin dashboard ready

- [ ] **Testing**
  - [ ] Clear browser cookies
  - [ ] Log in as regular user
  - [ ] Submit funding request
  - [ ] Check browser console logs
  - [ ] Verify success message
  - [ ] Log in as admin
  - [ ] View request in /admin/wallet-funding
  - [ ] Approve request
  - [ ] Check wallet balance updated

---

## Console Logs You'll See

### Success Flow (all ✓):
```
✓ Current user ID: 550e8400-e29b-41d4-a716-446655440000
✓ File details: {name: 'proof.jpg', size: '245.50KB', type: 'image/jpeg'}
→ Uploading file: wallet-550e8400-...-1674734400000.jpg
✓ File uploaded successfully: wallet-550e8400-...-1674734400000.jpg
✓ Public URL generated: https://...
→ Creating transaction with: {wallet_id: '...', user_id: '...', amount: 50}
✓ Transaction created successfully: [{id: '...', status: 'pending', ...}]
```

### Storage Error (bucket missing):
```
✗ Upload error details: {
  message: 'The resource does not exist.',
  statusCode: 404
}
```
**Fix:** Create payment-proofs bucket

### Storage Error (no permission):
```
✗ Upload error details: {
  message: 'Access Denied',
  statusCode: 403
}
```
**Fix:** Add INSERT policy to bucket

---

## Files in This Project

| File | Purpose |
|------|---------|
| `WALLET_FUNDING_SETUP.md` | ← **Start here** - Step-by-step setup |
| `STORAGE_BUCKET_SETUP.md` | Storage bucket configuration details |
| `RLS_TROUBLESHOOTING.md` | Database RLS issues troubleshooting |
| `supabase_wallet_admin_migration_v3.sql` | Database migration (already applied) |
| `DIAGNOSTIC_QUERIES.sql` | Test queries to verify setup |
| `WalletPage.tsx` | Updated with better logging |
| `AdminWalletFundingPage.tsx` | Admin approval interface |
| `AdminSupportTicketsPage.tsx` | Support tickets management |

---

## Next Actions

### Right Now:
1. Open Supabase Dashboard
2. Go to Storage
3. Create `payment-proofs` bucket (private)
4. Add INSERT and SELECT policies
5. Test upload in your app

### If It Works:
1. Open browser console (F12)
2. Submit a test funding request
3. Verify ✓ logs appear
4. Check admin dashboard sees it

### If It Fails:
1. Copy error from console
2. Check console logs for ✗ details
3. Refer to "Error Resolution Tree" above
4. Apply the suggested fix
5. Try again

---

## Support

**Error not in list?** Open browser console (F12) and look for:
- Exact error message
- Error code/type
- Full error details

Then refer to `RLS_TROUBLESHOOTING.md` or `STORAGE_BUCKET_SETUP.md`

**Still stuck?** Share:
1. Screenshot of error toast
2. Full console error message
3. Console logs with all ✓/✗ marks
4. Which step you're on
