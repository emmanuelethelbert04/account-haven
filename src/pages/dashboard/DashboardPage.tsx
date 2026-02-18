import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ExternalLink, Wallet, AlertCircle } from 'lucide-react';
import type { Order, Listing, UserWallet } from '@/types/database';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listing:listings(*)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Order & { listing: Listing })[];
    },
    enabled: !!user,
  });

  const { data: wallet } = useQuery({
    queryKey: ['user-wallet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserWallet | null;
    },
    enabled: !!user,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ordersRemaining = wallet ? wallet.order_limit - wallet.orders_used : 5;

  return (
    <div className="container py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">Track your account purchases</p>

      {/* Wallet & Order Limit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm opacity-80">Wallet Balance</p>
                <p className="text-xl sm:text-2xl font-bold">{formatPrice(wallet?.balance || 0)}</p>
              </div>
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
            </div>
            <Button variant="secondary" size="sm" asChild className="mt-3 w-full sm:w-auto">
              <Link to="/dashboard/wallet">Manage Wallet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Orders This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {wallet?.orders_used || 0} / {wallet?.order_limit || 5}
                </p>
              </div>
              <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            {ordersRemaining <= 1 && (
              <div className="flex items-center gap-1 mt-2 text-status-pending">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{ordersRemaining === 0 ? 'Order limit reached' : '1 order remaining'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{orders?.length || 0}</p>
              </div>
              <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 sm:h-24 rounded-lg" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs sm:text-sm text-muted-foreground">
                          {order.order_code}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {order.listing?.title || 'Account'}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        {order.listing && <PlatformBadge platform={order.listing.platform} size="sm" />}
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="sm:text-right">
                      <p className="text-base sm:text-lg font-bold text-foreground">
                        {formatPrice(order.amount)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/orders/${order.id}`}>
                        <span className="sm:inline">View</span>
                        <ExternalLink className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center">
            <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Browse our marketplace to find your perfect social media account
            </p>
            <Button asChild>
              <Link to="/marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
