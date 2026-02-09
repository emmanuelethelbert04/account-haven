import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,15%)] via-[hsl(230,40%,20%)] to-[hsl(240,35%,14%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--premium-glow)/0.1)] rounded-full blur-[120px]" />

      <div className="container relative z-10 text-center">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Buy or sell social accounts securely today. Join our growing community of trusted traders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 bg-white text-[hsl(222,47%,15%)] hover:bg-white/90 font-semibold shadow-xl text-base">
              <Link to="/marketplace">
                Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 border-white/20 text-white bg-white/10 hover:text-base text-base">
              <Link to="/auth/register">Create Account</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
