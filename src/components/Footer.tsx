import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Instagram, Music2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">SocialMarket</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The trusted marketplace for buying verified social media accounts. Safe, secure, and guaranteed.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Platforms</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/marketplace?platform=facebook"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Facebook size={16} />
                  Facebook Accounts
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?platform=tiktok"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Music2 size={16} />
                  TikTok Accounts
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?platform=instagram"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <Instagram size={16} />
                  Instagram Accounts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="text-sm text-muted-foreground hover:text-foreground">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SocialMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
