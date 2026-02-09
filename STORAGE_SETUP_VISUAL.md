# 🎨 Storage Bucket Setup - Visual Guide

## Where to Create the Bucket

```
┌─────────────────────────────────────────────────────────┐
│  SUPABASE DASHBOARD                                     │
│  https://supabase.com/dashboard                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Your Project                                     │   │
│  │                                                  │   │
│  │ LEFT SIDEBAR:                                    │   │
│  │ ├─ SQL Editor                                    │   │
│  │ ├─ Database                                      │   │
│  │ ├─ Authentication                                │   │
│  │ ├─ Storage  ← CLICK HERE                         │   │
│  │ │   ├─ payment-proofs ← CREATE THIS             │   │
│  │ │   │   ├─ Policies ← ADD POLICIES HERE         │   │
│  │ │   │   └─ Settings                              │   │
│  │ ├─ Functions                                      │   │
│  │ └─ More                                           │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Step-by-Step Visual Flow

### Step 1: Create Bucket
```
Storage Section
      ↓
"Create a new bucket" button
      ↓
┌─────────────────────────────────────┐
│ Create Bucket Dialog                │
│                                     │
│ Name: [payment-proofs]              │
│       ↑ (exact spelling, lowercase) │
│                                     │
│ ☑ Public bucket  ← UNCHECK THIS    │
│                                     │
│ [Cancel]  [Create] ← Click this    │
└─────────────────────────────────────┘
```

### Step 2: Add Policies
```
After bucket created
      ↓
Click "payment-proofs" bucket
      ↓
Click "Policies" tab
      ↓
┌──────────────────────────────────────┐
│ Policies for payment-proofs          │
│                                      │
│ [+ Create policy]                    │
│                                      │
│ First Policy:                        │
│ ├─ Operation: INSERT                 │
│ ├─ Name: Allow authenticated uploads │
│ ├─ Definition: (bucket_id =          │
│ │              'payment-proofs')     │
│ └─ [Save]                            │
│                                      │
│ Second Policy:                       │
│ ├─ Operation: SELECT                 │
│ ├─ Name: Allow authenticated reads   │
│ ├─ Definition: (bucket_id =          │
│ │              'payment-proofs')     │
│ └─ [Save]                            │
└──────────────────────────────────────┘
```

## Complete Setup Flow

```
START
  ↓
[Login to Supabase Dashboard]
  ↓
[Click Storage on left]
  ↓
[Click "Create new bucket"]
  ↓
[Fill: Name = "payment-proofs"]
  ↓
[UNCHECK "Public bucket"]
  ↓
[Click Create]
  ↓
[Bucket appears in list]
  ↓
[Click on payment-proofs bucket]
  ↓
[Click Policies tab]
  ↓
[Create INSERT policy]
  ├─ Operation: INSERT
  ├─ Name: Allow authenticated uploads
  ├─ Definition: (bucket_id = 'payment-proofs')
  └─ Save
  ↓
[Create SELECT policy]
  ├─ Operation: SELECT
  ├─ Name: Allow authenticated reads
  ├─ Definition: (bucket_id = 'payment-proofs')
  └─ Save
  ↓
[Close Supabase]
  ↓
[Clear browser cookies]
  ↓
[Refresh your app]
  ↓
[Log in]
  ↓
[Test: Dashboard → My Wallet → Add Funds]
  ↓
[Upload image + submit]
  ↓
[Check console (F12) for ✓ success logs]
  ↓
✓ SUCCESS - Bucket working!
```

## Before & After

### BEFORE (Error State)
```
┌─────────────────────────────────────┐
│ Supabase Storage                    │
│                                     │
│ No buckets created                  │
│                                     │
│ (empty)                             │
└─────────────────────────────────────┘
        ↓
User tries to upload
        ↓
App: "Upload to payment-proofs"
        ↓
Supabase: "❌ payment-proofs doesn't exist!"
```

### AFTER (Working State)
```
┌──────────────────────────────────────────┐
│ Supabase Storage                         │
│                                          │
│ Buckets:                                 │
│ ├─ ✓ payment-proofs (private)           │
│ │   ├─ Policies:                         │
│ │   │  ├─ INSERT: Allow authenticated   │
│ │   │  └─ SELECT: Allow authenticated   │
│ │   ├─ Files:                            │
│ │   │  ├─ wallet-uuid-12345.jpg        │
│ │   │  ├─ wallet-uuid-12346.png        │
│ │   │  └─ ...                           │
│ │   └─ Settings                          │
│                                          │
└──────────────────────────────────────────┘
        ↓
User uploads payment proof
        ↓
App: "Upload to payment-proofs"
        ↓
Supabase: "✓ Uploaded! URL: https://..."
        ↓
App: "Create transaction"
        ↓
Database: "✓ Transaction created"
        ↓
Admin: "New funding request to approve!"
```

## Troubleshooting Diagram

```
                    Upload Failed
                          |
                    /-----+-----\
                   /             \
                  /               \
          "Not found"          "Access Denied"
            (404)                (403)
             |                     |
             |                     |
      Bucket doesn't          No policies
      exist yet              configured
             |                     |
      FIX:                    FIX:
      Create                  Add INSERT
      bucket                  & SELECT
                              policies
             |                     |
             └────────┬────────────┘
                      |
                  Try again
                      |
                      ↓
            ✓ Upload succeeds!
```

## Policy Definition Reference

### INSERT Policy (Upload)
```
Definition box:
(bucket_id = 'payment-proofs')

This allows: Any authenticated user to UPLOAD to this bucket
```

### SELECT Policy (Read)
```
Definition box:
(bucket_id = 'payment-proofs')

This allows: Any authenticated user to READ from this bucket
```

## Final Verification

After setup, you should see:

```
Supabase Dashboard → Storage → payment-proofs

✓ Bucket exists
✓ Bucket is PRIVATE (not public)
✓ INSERT policy exists
✓ SELECT policy exists
✓ No files yet (empty is OK)
✓ Ready for first upload!

In your app:
✓ Can upload image
✓ Can see success message
✓ Admin can view request
✓ Can approve request
✓ Wallet balance updates
```

All ✓ = System is working perfectly!

---

## Copy-Paste Reference

### Policy 1 Definition (INSERT)
```
(bucket_id = 'payment-proofs')
```

### Policy 2 Definition (SELECT)
```
(bucket_id = 'payment-proofs')
```

Just copy these exact lines when creating policies!
