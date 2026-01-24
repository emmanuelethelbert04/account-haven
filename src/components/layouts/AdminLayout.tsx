import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Package, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
            <span className="text-xl font-bold text-foreground">Admin Dashboard</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card hidden md:block">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
          <div className="flex justify-around p-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-md text-xs transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
