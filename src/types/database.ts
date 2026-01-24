export type Platform = 'facebook' | 'tiktok' | 'instagram';

export type ListingStatus = 'available' | 'sold' | 'hidden';

export type OrderStatus = 'pending_payment' | 'payment_submitted' | 'approved' | 'rejected' | 'delivered';

export type AppRole = 'user' | 'admin';

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

export interface Listing {
  id: string;
  platform: Platform;
  title: string;
  price: number;
  followers_count: number;
  country: string | null;
  niche: string | null;
  account_age: string | null;
  description: string | null;
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
          proof_url?: string | null;
          note?: string | null;
          admin_note?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          status?: OrderStatus;
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
