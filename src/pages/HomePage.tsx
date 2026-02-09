import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { FeaturedListingsSection } from '@/components/home/FeaturedListingsSection';
import { TrustSection } from '@/components/home/TrustSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { StatsSection } from '@/components/home/StatsSection';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedListingsSection />
      <TrustSection />
      <TestimonialsSection />
      <StatsSection />
      <CTASection />
    </div>
  );
}
