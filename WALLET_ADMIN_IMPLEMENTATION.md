# Account Haven - Wallet Admin System Implementation Guide

## 📋 Overview

This document explains the complete implementation of the wallet funding approval system and support ticket management for the Account Haven platform.

### What Was Implemented

1. **Fixed RLS (Row Level Security) Policy** - Resolved the "row level security policy" error when submitting wallet funding requests
2. **Admin Wallet Funding Dashboard** - Complete interface for admins to view, approve, and reject wallet funding requests
3. **Admin Support Tickets Dashboard** - Complete interface for admins to manage user support requests
4. **Enhanced Admin Navigation** - Added new routes and navigation items to the admin dashboard

---

## 🚀 Quick Start

### Step 1: Apply the Database Migration

The SQL migration file must be executed in your Supabase dashboard to set up proper RLS policies and tables.

**File Location**: `supabase_wallet_admin_migration.sql`

**How to Apply**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `supabase_wallet_admin_migration.sql`
6. Paste it into the editor
7. Click **Run**

**What It Does**:
- ✅ Enables RLS on `user_wallets` and `wallet_transactions` tables
- ✅ Creates `support_tickets` table if it doesn't exist
- ✅ Sets up comprehensive RLS policies for all three tables
- ✅ Creates helper functions for admin operations (`is_admin()`, `approve_wallet_transaction()`)
- ✅ Creates performance indexes
- ✅ Configures proper role-based access control

### Step 2: Verify the Deployment

After running the migration, verify everything is working:

```bash
# 1. Test wallet funding submission
# Navigate to Dashboard → My Wallet → Add Funds
# Try submitting a funding request
# Expected: Request should be created without "row level security" error

# 2. Check admin dashboard
# Navigate to /admin/wallet-funding as an admin user
# Expected: See all pending wallet funding requests

# 3. Check support tickets
# Navigate to /admin/support-tickets as an admin user
# Expected: See all support tickets
```

---

## 📂 File Changes Summary

### New Files Created

| File | Purpose |
|------|---------|
| `supabase_wallet_admin_migration.sql` | Database migration for RLS policies and support_tickets table |
| `src/pages/admin/AdminWalletFundingPage.tsx` | Admin interface for wallet funding approvals |
| `src/pages/admin/AdminSupportTicketsPage.tsx` | Admin interface for support ticket management |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/dashboard/WalletPage.tsx` | Added session-based auth and improved error handling for RLS |
| `src/App.tsx` | Added routes for new admin pages |
| `src/components/layouts/AdminLayout.tsx` | Added navigation items for wallet funding and support tickets |
| `src/pages/admin/AdminOverviewPage.tsx` | Added stats and quick action cards |

---

## 🔐 Database Schema

### New RLS Policies

#### `user_wallets` Table
- **Users**: Can view/insert/update their own wallet
- **Admins**: Can view and update all wallets

#### `wallet_transactions` Table
- **Users**: Can view/insert their own transactions
- **Admins**: Can view and update all transactions

#### `support_tickets` Table (New)
- **Users**: Can create and view their own tickets
- **Admins**: Can view and update all tickets
- **Fields**:
  - `id` (UUID, primary key)
  - `user_id` (UUID, references auth.users)
  - `name` (TEXT, non-null)
  - `email` (TEXT, non-null)
  - `subject` (TEXT, non-null)
  - `message` (TEXT, non-null)
  - `status` (TEXT, one of: open, in_progress, resolved, closed)
  - `admin_response` (TEXT, nullable)
  - `admin_id` (UUID, nullable, references auth.users)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

### Helper Functions

#### `is_admin(user_id UUID)`
Checks if a user is an admin by looking up their role in the `user_roles` table.

**Usage**:
```sql
SELECT * FROM user_wallets WHERE is_admin(auth.uid());
```

#### `approve_wallet_transaction(transaction_id UUID, new_status TEXT)`
Approves or rejects a wallet transaction and updates wallet balance.

---

## 💳 Features

### Admin Wallet Funding Dashboard

**Location**: `/admin/wallet-funding`

**Features**:
- 📊 Dashboard stats showing pending and approved funding requests
- 🔍 Search and filter functionality
- ✅ Approve funding requests with one-click
- ❌ Reject funding requests with optional reason
- 📋 View payment proof images
- 🎯 Track funding request amounts and status

**User Flow**:
1. User submits wallet funding request with payment proof
2. Admin reviews request in dashboard
3. Admin approves (balance updated) or rejects (with reason)
4. User receives notification and can see status

### Admin Support Tickets Dashboard

**Location**: `/admin/support-tickets`

**Features**:
- 📊 Dashboard stats showing ticket statuses
- 🔍 Search by email, name, or subject
- 📋 View complete ticket details
- 💬 Add admin responses to tickets
- 🏷️ Update ticket status (open → in_progress → resolved → closed)
- 📅 Track creation and last update time
- ⏱️ "Time ago" display for quick scanning

**User Flow**:
1. User submits support ticket from contact page
2. Admin reviews in support tickets dashboard
3. Admin responds and updates status
4. User can see ticket status and admin response

---

## 🛠️ Configuration

### Ensuring Admin Users Have Proper Roles

The RLS policies rely on the `user_roles` table. Make sure admin users have the correct role:

```sql
-- Check if user_roles table exists
SELECT * FROM user_roles;

-- If admin user doesn't have role, add it:
INSERT INTO user_roles (id, user_id, role)
VALUES (gen_random_uuid(), 'admin-user-id-here', 'admin')
ON CONFLICT (user_id) DO NOTHING;
```

### Environment Variables

Ensure your `.env.local` has:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 Testing Checklist

- [ ] Run the SQL migration successfully
- [ ] Verify `support_tickets` table exists
- [ ] Verify RLS is enabled on all tables
- [ ] Create a test user and log in
- [ ] Submit a wallet funding request as user
- [ ] View the request in admin wallet funding dashboard
- [ ] Approve a request and verify wallet balance updates
- [ ] Reject a request with a reason
- [ ] Create a support ticket
- [ ] View and respond to ticket as admin
- [ ] Update ticket status
- [ ] Verify all status changes work correctly

---

## 🐛 Troubleshooting

### Error: "row level security policy violation"

**Cause**: RLS policies aren't properly configured or user doesn't have correct role.

**Solution**:
1. Verify migration was run completely
2. Check that `user_roles` table has an entry for the admin user
3. Restart the browser and clear cookies
4. Check Supabase logs for specific policy errors

### Error: "relation support_tickets does not exist"

**Cause**: Migration wasn't run or failed partway through.

**Solution**:
1. Check Supabase SQL Editor for any error messages
2. Run the migration again
3. Verify all tables were created: `user_wallets`, `wallet_transactions`, `support_tickets`

### Users can't submit wallet funding requests

**Cause**: Session authentication issue.

**Solution**:
1. Make sure user is logged in
2. Check browser console for auth errors
3. Verify `auth.uid()` is returning correct user ID
4. Check that `user_wallets` table has an entry for the user

### Admin can't see any requests/tickets

**Cause**: User is not marked as admin in `user_roles` table.

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run: `SELECT * FROM user_roles WHERE user_id = 'your-user-id';`
3. If no result, add the user: `INSERT INTO user_roles (id, user_id, role) VALUES (gen_random_uuid(), 'your-user-id', 'admin');`

---

## 📚 Component Documentation

### AdminWalletFundingPage Component

```tsx
// Props: None (uses React Query for data fetching)

// Key Features:
- Real-time stats cards
- Search and filter
- Approve/reject with dialogs
- Payment proof viewing
- Transaction history with status badges
```

**Key Functions**:
- `handleApproveTransaction()` - Approves a transaction and updates wallet
- `handleRejectTransaction()` - Rejects a transaction with optional reason
- `formatCurrency()` - Formats numbers as currency
- `getStatusBadge()` - Returns styled status badge component

### AdminSupportTicketsPage Component

```tsx
// Props: None (uses React Query for data fetching)

// Key Features:
- Dashboard stats for all ticket statuses
- Search across email, name, subject
- Filter by status
- View complete ticket details
- Add admin responses
- Update ticket status
```

**Key Functions**:
- `handleUpdateTicket()` - Updates ticket status and admin response
- `formatDate()` - Formats dates for display
- `getTimeAgo()` - Shows relative time (e.g., "2h ago")
- `getStatusBadge()` - Returns styled status badge
- `getPriorityColor()` - Highlights urgent keywords

---

## 🔄 Workflow Examples

### Approving a Wallet Funding Request

1. Admin navigates to `/admin/wallet-funding`
2. Admin sees pending request: "John Doe - $50 - Pending"
3. Admin clicks "Approve"
4. Dialog appears showing:
   - User email
   - Amount to be added
   - Payment proof link
5. Admin clicks "Approve Deposit"
6. Request status changes to "Approved"
7. User's wallet balance increases by $50
8. User receives toast notification

### Resolving a Support Ticket

1. Admin navigates to `/admin/support-tickets`
2. Admin sees "Open" filter showing 5 tickets
3. Admin clicks on a ticket: "Account Login Issues"
4. Ticket details dialog opens
5. Admin types response explaining the solution
6. Admin changes status from "open" to "resolved"
7. Admin clicks "Save Changes"
8. Ticket marked as resolved
9. User can see resolved status and admin response

---

## 🚀 Performance Considerations

- **Database Indexes**: Created on frequently filtered columns (`user_id`, `status`, `created_at`)
- **React Query**: Caching configured for smart data refetching
- **RLS Filtering**: Database-level filtering reduces data transfer
- **Pagination Ready**: Components designed to support pagination in future

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase logs: Dashboard → Logs → PostgreSQL
3. Check browser console for error messages
4. Verify all files were created/modified correctly

---

## 📝 Version History

- **v1.0** (2026-01-26): Initial implementation
  - Fixed wallet funding RLS issue
  - Added admin wallet funding dashboard
  - Added admin support tickets dashboard
  - Enhanced admin navigation

---

## ✅ Deployment Checklist

- [ ] Migration file backed up
- [ ] Migration applied to database
- [ ] All tables verified in Supabase
- [ ] RLS policies verified in SQL Editor
- [ ] Admin users have roles in user_roles table
- [ ] New routes added to App.tsx
- [ ] New components created and integrated
- [ ] AdminLayout navigation updated
- [ ] Wallet page updated with better error handling
- [ ] Testing completed on staging environment
- [ ] Deployed to production
