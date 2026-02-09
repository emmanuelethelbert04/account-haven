# 🔒 Storage Policy Error - Quick Fix

## The Error You're Seeing
```
"new row violates row-level security policy"
statusCode: 403
```

This means the `payment-proofs` bucket exists BUT it doesn't have the right permissions configured.

---

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Click your project
3. Click **"Storage"** in the left sidebar

### Step 2: Click the payment-proofs bucket
- You should see `payment-proofs` in the bucket list
- Click on it

### Step 3: Go to Policies Tab
- Click **"Policies"** tab at the top of the bucket page

### Step 4: Create INSERT Policy
Click **"Create policy"** or **"+ New policy"**

**Policy Settings:**
- **Operation:** SELECT
- **Name:** `allow authenticated reads`
- **Definition:** 
  ```
  (bucket_id = 'payment-proofs')
  ```

Click **"Save"**

### Step 5: Create SELECT Policy  
Click **"Create policy"** again

**Policy Settings:**
- **Operation:** INSERT
- **Name:** `allow authenticated uploads`
- **Definition:**
  ```
  (bucket_id = 'payment-proofs')
  ```

Click **"Save"**

### Step 6: Test
1. Go back to your app
2. Press Ctrl+Shift+Delete to clear cookies
3. Refresh the page (F5)
4. Log in again
5. Try uploading a wallet funding proof

**Should now see:** ✓ File uploaded successfully: ...

---

## 📋 Verification Checklist

After creating policies, verify:

```
☐ Bucket name is exactly: payment-proofs
☐ Bucket is PRIVATE (not public)
☐ Two policies exist:
   ☐ Policy 1: SELECT with (bucket_id = 'payment-proofs')
   ☐ Policy 2: INSERT with (bucket_id = 'payment-proofs')
☐ No other RLS policies exist on the bucket
☐ Browser cookies cleared
☐ Page refreshed
```

---

## 🐛 If It Still Fails

### Error: "bucket not found" (404)
- Bucket doesn't exist
- Create it: Storage → "Create a new bucket" → name: `payment-proofs`
- Make it PRIVATE

### Error: "Permission denied" (403)
- Policies missing or wrong
- Go to Policies tab
- Make sure BOTH policies exist
- Check exact spelling: `(bucket_id = 'payment-proofs')`

### Error: "Network error"
- Internet problem
- Try again in a few seconds

---

## 📸 Visual Guide

```
Supabase Dashboard
├── Your Project
├── Storage (← click here)
│   ├── payment-proofs (← click here)
│   │   ├── Policies (← click this tab)
│   │   │   ├── + New policy
│   │   │   ├── Policy 1: SELECT
│   │   │   │   └── (bucket_id = 'payment-proofs')
│   │   │   └── Policy 2: INSERT  
│   │   │       └── (bucket_id = 'payment-proofs')
```

---

## ✨ After It Works

You'll see in browser console (F12):

```
✓ File uploaded successfully: wallet-[user-id]-[timestamp].jpg
✓ Public URL generated: https://...
✓ Transaction created successfully: {...}
```

Then:
1. Success message appears: "Your funding request has been submitted"
2. Dialog closes
3. Admin can see request in /admin/wallet-funding
4. Admin can approve → wallet balance updates ✨

---

## Need Help?

If something is wrong:
1. Copy the exact error from F12 Console
2. Check the troubleshooting section above
3. Make sure you followed all 6 steps
4. Clear cookies and refresh
5. Try again

**Most common fix:** Missing the INSERT policy step!

---

Good luck! 🚀
