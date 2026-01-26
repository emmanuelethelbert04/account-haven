import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Instagram, Music2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-foreground">SocialMarket</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              The trusted marketplace for buying verified social media accounts. Safe, secure, and guaranteed.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Platforms</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/marketplace?platform=facebook"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Facebook size={14} />
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?platform=tiktok"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Music2 size={14} />
                  TikTok
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?platform=instagram"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Instagram size={14} />
                  Instagram
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/dashboard/wallet" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SocialMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
