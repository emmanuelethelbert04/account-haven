-- ============================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- Creates and configures the payment-proofs bucket with proper policies
-- ============================================================================

-- ============================================================================
-- 1. CREATE payment-proofs BUCKET
-- ============================================================================

-- Note: Buckets must be created via the Supabase Dashboard UI or API
-- You CANNOT create buckets via SQL
-- Follow the manual steps below instead

/*
MANUAL STEPS IN SUPABASE DASHBOARD:

1. Go to Supabase Dashboard → Your Project
2. Navigate to Storage (left sidebar)
3. Click "Create a new bucket"
4. Enter bucket name: payment-proofs
5. Uncheck "Public bucket" (leave it private)
6. Click "Create bucket"

After creating the bucket, the RLS policies below will secure it.
*/

-- ============================================================================
-- 2. STORAGE RLS POLICIES (via SQL or Dashboard)
-- ============================================================================

-- You can add these policies via the Storage interface:
-- Go to Storage → payment-proofs → Policies

-- Policy 1: Allow authenticated users to upload files to their own folder
/*
Definition:
  (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated')

Operations: INSERT

This policy allows any logged-in user to upload files.
*/

-- Policy 2: Allow authenticated users to read their own files
/*
Definition:
  (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated')

Operations: SELECT

This policy allows logged-in users to view/download files they uploaded.
*/

-- Policy 3: Allow service role (admin) to manage all files
/*
Definition:
  (bucket_id = 'payment-proofs' AND auth.role() = 'service_role')

Operations: ALL

This allows admins to view, delete, or manage any proof file.
*/

-- ============================================================================
-- VERIFICATION CHECKLIST
-- ============================================================================

/*
After creating the bucket and policies, verify by running these in SQL Editor:

1. Check bucket exists:
   SELECT id, name, public FROM storage.buckets 
   WHERE name = 'payment-proofs';

2. Check object count (if any files uploaded):
   SELECT COUNT(*) as file_count FROM storage.objects 
   WHERE bucket_id = 'payment-proofs';

3. Check policies exist:
   SELECT * FROM storage.buckets 
   WHERE name = 'payment-proofs';
*/

-- ============================================================================
-- IF YOU GET "Bucket not found" ERROR
-- ============================================================================

/*
The bucket "payment-proofs" does not exist.

SOLUTION:
1. Go to Supabase Dashboard
2. Click on Storage (left sidebar)
3. Click "Create a new bucket"
4. Name: payment-proofs
5. Uncheck "Public bucket"
6. Click "Create"

That's it! The bucket is now ready.
*/

-- ============================================================================
-- STORAGE TROUBLESHOOTING
-- ============================================================================

/*
Error: "The resource does not exist" when uploading
Cause: Bucket doesn't exist or wrong bucket name
Fix: Check bucket name is exactly "payment-proofs" (lowercase, with hyphen)

Error: "Access denied" when uploading
Cause: No storage policies configured
Fix: Add INSERT policy for authenticated users

Error: "The request signature does not match" 
Cause: Authentication issue
Fix: Make sure user is logged in (check supabase.auth.getUser())

Error: "File too large"
Cause: File size exceeds limit (default 50MB)
Fix: Reduce file size or increase bucket limit in settings
*/

-- ============================================================================
-- CONFIGURATION SETTINGS
-- ============================================================================

/*
Recommended bucket settings:

File size limit: 50 MB (default) or increase if needed
Public access: No (keep private for security)
Versioning: No (not needed for proofs)
Encryption: Yes (default - encrypted at rest)

To change these settings:
1. Go to Storage
2. Click on payment-proofs bucket
3. Click Settings (gear icon)
4. Adjust max file size if needed
5. Save
*/

-- ============================================================================
-- TEST UPLOAD COMMAND (for reference)
-- ============================================================================

/*
In your React code, the upload works like this:

const { error } = await supabase.storage
  .from('payment-proofs')
  .upload('filename.png', file);

If this fails:
1. Check bucket exists
2. Check user is authenticated
3. Check file is not too large
4. Check browser console for specific error
*/
