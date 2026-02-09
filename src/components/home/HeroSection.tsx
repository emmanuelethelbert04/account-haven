import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Users, Star, Shield } from 'lucide-react';
import { PlatformBadge } from '@/components/PlatformBadge';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--hero-gradient-start))] min-h-[85vh] flex items-center">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,15%)] via-[hsl(230,40%,20%)] to-[hsl(240,35%,12%)]" />
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--premium-glow)/0.15)] rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(var(--instagram)/0.1)] rounded-full blur-[100px]" />

      <div className="container relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-6 backdrop-blur-sm">
              <Shield size={14} className="text-emerald-400" />
              Trusted by 500+ buyers worldwide
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Buy & Sell Premium{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Social Media Accounts
              </span>{' '}
              Safely
            </h1>

            <p className="text-lg lg:text-xl text-white/60 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Secure marketplace for verified Facebook, TikTok, and Instagram accounts. Instant wallet payments. Trusted transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base h-12 px-8 bg-white text-[hsl(222,47%,15%)] hover:bg-white/90 font-semibold shadow-xl">
                <Link to="/marketplace">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base h-12 px-8 border-white/20 text-white hover:bg-white/10 hover:text-white">
                <a href="#how-it-works">How It Works</a>
              </Button>
            </div>

            {/* Social proof mini stats */}
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-[hsl(222,47%,15%)] flex items-center justify-center text-[10px] text-white font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/50">
                <span className="text-white font-semibold">1,000+</span> accounts sold
              </div>
              <div className="hidden sm:flex items-center gap-1 text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                <span className="text-sm text-white/50 ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right - Mockup card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold text-lg">Featured Listings</h3>
                  <span className="text-xs text-white/40">Live</span>
                </div>
                {[
                  { platform: 'facebook' as const, title: 'US Facebook Account', followers: '125K', price: '$450' },
                  { platform: 'tiktok' as const, title: 'TikTok Creator Account', followers: '89K', price: '$320' },
                  { platform: 'instagram' as const, title: 'IG Fashion Page', followers: '200K', price: '$780' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group">
                    <div className="flex items-center gap-3">
                      <PlatformBadge platform={item.platform} size="sm" />
                      <div>
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-white/40 text-xs flex items-center gap-1">
                          <Users size={10} /> {item.followers} followers
                        </p>
                      </div>
                    </div>
                    <span className="text-white font-bold text-sm">{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 rounded-xl bg-emerald-500/90 backdrop-blur px-3 py-2 shadow-lg">
                <p className="text-white text-xs font-semibold flex items-center gap-1">
                  <Shield size={12} /> Verified Seller
                </p>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white/10 backdrop-blur border border-white/10 px-3 py-2 shadow-lg">
                <p className="text-white text-xs font-medium">⚡ Instant Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-white/30" size={24} />
      </div>
    </section>
  );
}
