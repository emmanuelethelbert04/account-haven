# 🎯 Complete Wallet Funding Setup Guide

## The Problem
You're getting "failed to upload payment proof" error. This means the Supabase Storage bucket doesn't exist or isn't accessible.

## The Solution
Follow these steps in order:

---

## ✅ Step 1: Create the Storage Bucket

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Left sidebar → Click "Storage"

3. **Create new bucket**
   - Click "Create a new bucket" button
   - Name: `payment-proofs` (exactly this, lowercase, with hyphen)
   - **Important:** Uncheck "Public bucket" (keep it private)
   - Click "Create"

4. **Verify bucket exists**
   - You should see "payment-proofs" in your buckets list
   - Screenshot it for reference

---

## ✅ Step 2: Set Up Storage Policies

1. **Click on payment-proofs bucket**
   - In the Storage list, click the "payment-proofs" bucket name

2. **Go to Policies tab**
   - You should see "Policies" at the top
   - Click it

3. **Create INSERT policy for authenticated users**
   - Click "Create policy" or "New policy"
   - Choose: **For INSERT**
   - Policy name: `Allow authenticated uploads`
   - Definition (in the policy editor):
     ```
     (bucket_id = 'payment-proofs')
     ```
   - Click "Save"

4. **Create SELECT policy for authenticated users**
   - Click "Create policy"
   - Choose: **For SELECT**
   - Policy name: `Allow authenticated reads`
   - Definition:
     ```
     (bucket_id = 'payment-proofs')
     ```
   - Click "Save"

5. **Verify policies are created**
   - You should see both policies listed

---

## ✅ Step 3: Test the Setup

1. **Clear your browser**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "All time"
   - Check "Cookies and cached images"
   - Click "Clear data"

2. **Refresh your app**
   - Close and reopen the browser tab

3. **Log in again**
   - Go to your app
   - Log in to your account

4. **Test wallet funding**
   - Go to Dashboard → My Wallet → Add Funds
   - Fill in:
     - Amount: `50`
     - Upload: Any JPG or PNG image (must be less than 10MB)
   - Click "Submit Request"

5. **Check results**
   - Should see success message: "Your funding request has been submitted"
   - Open browser console (F12) to see detailed logs
   - Look for ✓ checkmarks showing each step completed

---

## 🔍 Step 4: Verify in Admin Dashboard

1. **Log in as admin** (different user or if you have admin role)

2. **Go to `/admin/wallet-funding`**
   - You should see the pending funding request
   - It will show:
     - User email
     - Amount requested
     - Status: Pending
     - Payment proof image link

3. **Try approving it**
   - Click "Approve"
   - Confirm
   - Check wallet balance increased

---

## 🐛 Troubleshooting

### Error: "The resource does not exist"
**Cause:** Bucket name is wrong or doesn't exist
**Fix:**
1. Go to Storage
2. Check bucket name is exactly `payment-proofs`
3. If it doesn't exist, create it following Step 1

### Error: "Access denied" or "permission denied"
**Cause:** Storage policies not created
**Fix:**
1. Go to payment-proofs bucket → Policies
2. Create INSERT and SELECT policies following Step 2
3. Try uploading again

### Error: "The request signature does not match"
**Cause:** Authentication issue
**Fix:**
1. Clear cookies and log in again
2. Make sure you're logged in (check browser console)
3. Try again

### File uploads but transaction fails
**Cause:** RLS policies on database table
**Fix:**
1. Make sure you ran the v3 migration
2. Run diagnostic queries to verify RLS is set up
3. Check you're logged in (auth.uid() should return a UUID)

### Can't see the file in dashboard
**Cause:** File uploaded but storage read policy missing
**Fix:**
1. Add SELECT storage policy
2. Refresh the page
3. Image should load

---

## 📋 Checklist Before Testing

- [ ] Created bucket named `payment-proofs`
- [ ] Bucket is NOT public (private)
- [ ] Created INSERT policy for authenticated users
- [ ] Created SELECT policy for authenticated users
- [ ] Ran v3 database migration
- [ ] Cleared browser cookies
- [ ] Logged in again
- [ ] Wallet exists (checked in Dashboard)

If all checked, wallet funding should work!

---

## 🔑 Key Points

1. **Bucket name must be:** `payment-proofs` (lowercase, with hyphen)
2. **Bucket must be:** Private (not public)
3. **Policies needed:** INSERT and SELECT for authenticated users
4. **Database:** v3 migration must be applied
5. **User:** Must be logged in (auth.uid() returns UUID)

---

## 📞 If Issues Persist

**Check the console logs:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try submitting a funding request
4. Look for logs like:
   - `✓ Current user ID: ...`
   - `✓ File details: ...`
   - `→ Uploading file: ...`
   - `✓ File uploaded successfully: ...`
   - `✓ Public URL generated: ...`
   - `✓ Transaction created successfully: ...`

**Share these logs** if you're still having issues.

---

## 🚀 Success Indicators

✓ **File uploads** - Console shows `✓ File uploaded successfully`
✓ **URL generated** - Console shows `✓ Public URL generated`
✓ **Transaction created** - Console shows `✓ Transaction created successfully`
✓ **UI confirmation** - Toast message says "Your funding request has been submitted"
✓ **Admin can see it** - Request appears in `/admin/wallet-funding`
✓ **Admin can approve** - Balance updates when approved

All 6 = Success! Your wallet funding system is working!
