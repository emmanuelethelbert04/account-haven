import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, Clock, CheckCircle } from 'lucide-react';

export default function AdminOverviewPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [listingsRes, ordersRes, pendingRes, deliveredRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending_payment', 'payment_submitted']),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
      ]);

      return {
        totalListings: listingsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        pendingOrders: pendingRes.count || 0,
        deliveredOrders: deliveredRes.count || 0,
      };
    },
  });

  const statCards = [
    { title: 'Total Listings', value: stats?.totalListings || 0, icon: ShoppingBag, color: 'text-blue-500' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: Package, color: 'text-green-500' },
    { title: 'Pending Approval', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-500' },
    { title: 'Delivered', value: stats?.deliveredOrders || 0, icon: CheckCircle, color: 'text-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
