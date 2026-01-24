import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import type { Order, Listing } from '@/types/database';

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-8">Track your account purchases</p>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm text-muted-foreground">
                          {order.order_code}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {order.listing?.title || 'Account'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {order.listing && <PlatformBadge platform={order.listing.platform} size="sm" />}
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatPrice(order.amount)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/orders/${order.id}`}>
                        View
                        <ExternalLink className="ml-2 h-4 w-4" />
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
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">
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
