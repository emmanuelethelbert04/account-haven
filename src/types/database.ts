export type Platform = 'facebook' | 'tiktok' | 'instagram';

export type ListingStatus = 'available' | 'sold' | 'hidden';

export type OrderStatus = 'pending_payment' | 'payment_submitted' | 'approved' | 'rejected' | 'delivered';

export type AppRole = 'user' | 'admin';

export type WalletTransactionType = 'deposit' | 'withdrawal' | 'purchase' | 'refund';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Profile {
  id: string;
  email: string;
  created_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface UserWallet {
  id: string;
  user_id: string;
  balance: number;
  order_limit: number;
  orders_used: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: WalletTransactionType;
  description: string | null;
  reference_id: string | null;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  platform: Platform;
  title: string;
  description: string | null;

  // pricing/stock
  price: number;
  price_per_unit?: number;
  minimum_price?: number;
  stock_quantity?: number;

  // performance metadata
  delivery_time?: string | null;
  rating?: number | null;          // e.g. 4.8
  success_rate?: number | null;    // percentage
  orders_count?: number | null;

  // legacy fields (may still exist in database)
  followers_count: number;
  country: string | null;
  niche: string | null;
  account_age: string | null;

  images: string[];
  login_screenshot_url: string | null;
  status: ListingStatus;
  featured: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  listing_id: string;
  amount: number;
  status: OrderStatus;
  payment_method?: 'wallet' | 'bank_transfer';
  payment_status?: 'unpaid' | 'submitted' | 'paid' | 'rejected';
  delivery_status?: 'not_delivered' | 'delivered';
  delivered_at?: string | null;
  proof_url: string | null;
  note: string | null;
  admin_note: string | null;
  rejection_reason: string | null;
  created_at: string;
  // Joined fields
  listing?: Listing;
  profile?: Profile;
}

export interface BankSettings {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  instructions: string;
  updated_at: string;
}

// Supabase Database type
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: { id: string; email: string };
        Update: { email?: string };
      };
      user_roles: {
        Row: UserRoleRow;
        Insert: { user_id: string; role: AppRole };
        Update: { role?: AppRole };
      };
      user_wallets: {
        Row: UserWallet;
        Insert: { user_id: string; balance?: number; order_limit?: number };
        Update: { balance?: number; order_limit?: number; orders_used?: number };
      };
      wallet_transactions: {
        Row: WalletTransaction;
        Insert: {
          wallet_id: string;
          user_id: string;
          amount: number;
          type: WalletTransactionType;
          description?: string | null;
          reference_id?: string | null;
          proof_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: {
          user_id?: string | null;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: SupportTicketStatus;
        };
        Update: {
          status?: SupportTicketStatus;
          admin_response?: string | null;
        };
      };
      listings: {
        Row: Listing;
        Insert: {
          platform: Platform;
          title: string;
          price: number;
          followers_count?: number;
          country?: string | null;
          niche?: string | null;
          account_age?: string | null;
          description?: string | null;
          images?: string[];
          login_screenshot_url?: string | null;
          status?: ListingStatus;
          featured?: boolean;
        };
        Update: {
          platform?: Platform;
          title?: string;
          price?: number;
          followers_count?: number;
          country?: string | null;
          niche?: string | null;
          account_age?: string | null;
          description?: string | null;
          images?: string[];
          login_screenshot_url?: string | null;
          status?: ListingStatus;
          featured?: boolean;
        };
      };
      orders: {
        Row: Order;
        Insert: {
          order_code: string;
          user_id: string;
          listing_id: string;
          amount: number;
          status?: OrderStatus;
          payment_method?: 'wallet' | 'bank_transfer';
          payment_status?: 'unpaid' | 'submitted' | 'paid' | 'rejected';
          delivery_status?: 'not_delivered' | 'delivered';
          delivered_at?: string | null;
          proof_url?: string | null;
          note?: string | null;
          admin_note?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          status?: OrderStatus;
          payment_method?: 'wallet' | 'bank_transfer';
          payment_status?: 'unpaid' | 'submitted' | 'paid' | 'rejected';
          delivery_status?: 'not_delivered' | 'delivered';
          delivered_at?: string | null;
          proof_url?: string | null;
          note?: string | null;
          admin_note?: string | null;
          rejection_reason?: string | null;
        };
      };
      bank_settings: {
        Row: BankSettings;
        Insert: {
          bank_name: string;
          account_number: string;
          account_name: string;
          instructions: string;
        };
        Update: {
          bank_name?: string;
          account_number?: string;
          account_name?: string;
          instructions?: string;
        };
      };
    };
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
    };
  };
};
