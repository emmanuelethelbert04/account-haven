This folder contains SQL migrations and helpers for Supabase.

Migration added (2026-01-30):
- `20260130_add_payment_methods_and_wallet_rpc.sql`
  - Adds `payment_method`, `payment_status`, `paid_at` to `orders` with checks.
  - Creates `pay_order_with_wallet(p_order_id uuid)` RPC (SECURITY DEFINER) to atomically deduct user wallet, insert `wallet_transactions`, and mark order as paid.
  - Grants execute to `authenticated` role.
  - Adds RLS policies for orders, user_wallets, and wallet_transactions.

Notes:
- The admin policies assume you set an `is_admin` JWT claim (set `is_admin=true`). If your auth uses a different claim, update the policy condition accordingly.
- Run this migration via Supabase SQL editor or your migration tooling.
- After running migration, check your RLS policies and adjust the admin check expression to match your environment.
