import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingBag, Wallet, Headphones } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isHomePage && !scrolled && !mobileMenuOpen;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm'
      )}
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className={cn(
              'h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-colors',
              isTransparent ? 'bg-white/15' : 'bg-primary'
            )}>
              <ShoppingBag className={cn(
                'h-4 w-4 sm:h-5 sm:w-5',
                isTransparent ? 'text-white' : 'text-primary-foreground'
              )} />
            </div>
            <span className={cn(
              'font-bold text-lg sm:text-xl hidden xs:inline transition-colors',
              isTransparent ? 'text-white' : 'text-foreground'
            )}>
              SocialMarket
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-4">
            {[
              { to: '/marketplace', label: 'Marketplace' },
              { to: '/marketplace?platform=facebook', label: 'Facebook' },
              { to: '/marketplace?platform=tiktok', label: 'TikTok' },
              { to: '/marketplace?platform=instagram', label: 'Instagram' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors px-2 lg:px-3 py-2',
                  isTransparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className={cn(
                'text-sm font-medium transition-colors px-2 lg:px-3 py-2',
                isTransparent
                  ? 'text-white/70 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="hidden lg:inline">Support</span>
              <Headphones className="h-4 w-4 lg:hidden" />
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(isTransparent && 'text-white hover:bg-white/10')}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/wallet" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Wallet
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm" className={cn('text-sm', isTransparent && 'text-white hover:bg-white/10')}>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className={cn(
                'text-sm',
                isTransparent && 'bg-white text-[hsl(222,47%,15%)] hover:bg-white/90'
              )}>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn('md:hidden h-9 w-9', isTransparent && 'text-white hover:bg-white/10')}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 absolute left-0 right-0 shadow-lg">
          <div className="flex flex-col gap-2">
            {[
              { to: '/marketplace', label: 'Marketplace' },
              { to: '/marketplace?platform=facebook', label: 'Facebook Accounts' },
              { to: '/marketplace?platform=tiktok', label: 'TikTok Accounts' },
              { to: '/marketplace?platform=instagram', label: 'Instagram Accounts' },
              { to: '/contact', label: 'Contact Support' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border pt-3 mt-2 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> My Orders
                  </Link>
                  <Link to="/dashboard/wallet" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                    <Wallet className="h-4 w-4" /> Wallet
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <Button variant="ghost" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full justify-start gap-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
