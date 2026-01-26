import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingBag, Wallet, Headphones } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-foreground hidden xs:inline">
              SocialMarket
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-4">
            <Link
              to="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 lg:px-3 py-2"
            >
              Marketplace
            </Link>
            <Link
              to="/marketplace?platform=facebook"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 lg:px-3 py-2"
            >
              Facebook
            </Link>
            <Link
              to="/marketplace?platform=tiktok"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 lg:px-3 py-2"
            >
              TikTok
            </Link>
            <Link
              to="/marketplace?platform=instagram"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 lg:px-3 py-2"
            >
              Instagram
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 lg:px-3 py-2"
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
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/wallet" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm" className="text-sm">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-sm">
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 absolute left-0 right-0 shadow-lg">
          <div className="flex flex-col gap-2">
            <Link
              to="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/marketplace?platform=facebook"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Facebook Accounts
            </Link>
            <Link
              to="/marketplace?platform=tiktok"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              TikTok Accounts
            </Link>
            <Link
              to="/marketplace?platform=instagram"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Instagram Accounts
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Support
            </Link>
            
            <div className="border-t border-border pt-3 mt-2 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    My Orders
                  </Link>
                  <Link
                    to="/dashboard/wallet"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-3 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} 
                    className="w-full justify-start gap-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
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
