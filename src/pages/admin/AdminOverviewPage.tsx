import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Clock, CheckCircle, Wallet, MessageSquare, TrendingUp, Users } from 'lucide-react';

export default function AdminOverviewPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [listingsRes, ordersRes, pendingRes, deliveredRes, walletRes, ticketsRes, usersRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending_payment', 'payment_submitted']),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('wallet_transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalListings: listingsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        pendingOrders: pendingRes.count || 0,
        deliveredOrders: deliveredRes.count || 0,
        pendingWalletFunding: walletRes.count || 0,
        openSupportTickets: ticketsRes.count || 0,
        totalUsers: usersRes.count || 0,
      };
    },
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', href: null },
    { title: 'Total Listings', value: stats?.totalListings || 0, icon: ShoppingBag, color: 'text-blue-500', href: '/admin/listings' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: Package, color: 'text-green-500', href: '/admin/orders' },
    { title: 'Pending Approval', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-yellow-500', href: '/admin/orders' },
    { title: 'Delivered Orders', value: stats?.deliveredOrders || 0, icon: CheckCircle, color: 'text-purple-500', href: '/admin/orders' },
    { title: 'Wallet Funding Requests', value: stats?.pendingWalletFunding || 0, icon: Wallet, color: 'text-orange-500', href: '/admin/wallet-funding', highlight: stats?.pendingWalletFunding ? true : false },
    { title: 'Open Support Tickets', value: stats?.openSupportTickets || 0, icon: MessageSquare, color: 'text-red-500', href: '/admin/support-tickets', highlight: stats?.openSupportTickets ? true : false },
  ];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Admin Overview</h1>
      <p className="text-muted-foreground mb-6 sm:mb-8">Welcome back! Here's what's happening with your platform.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card className={`transition-all ${stat.highlight ? 'border-orange-500/50 shadow-md' : ''}`}>
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

          return stat.href ? (
            <Link key={stat.title} to={stat.href} className="hover:shadow-lg transition-shadow">
              {content}
            </Link>
          ) : (
            <div key={stat.title}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="h-6 w-6 text-orange-500" />
                <h3 className="font-semibold text-foreground">Wallet Funding Approvals</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Review and approve user wallet funding requests.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/wallet-funding">Manage Requests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-red-500" />
                <h3 className="font-semibold text-foreground">Support Tickets</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Respond to and manage user support requests.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/support-tickets">View Tickets</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold text-foreground">Manage Orders</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Review orders and approve or reject submissions.
              </p>
              <Button asChild className="w-full">
                <Link to="/admin/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
