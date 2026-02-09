import { Search, Wallet, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

const steps = [
  { icon: Search, step: '01', title: 'Browse Accounts', description: 'Find high-quality, verified social media accounts by niche, country, or followers.' },
  { icon: Wallet, step: '02', title: 'Choose Payment Method', description: 'Pay securely using your wallet balance or direct bank transfer.' },
  { icon: Zap, step: '03', title: 'Get Instant Delivery', description: 'Wallet payments are delivered instantly. Bank transfers are verified by admin.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
      <div className="container">
        <ScrollReveal className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-3">How It Works</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Three Simple Steps</h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <StaggerItem key={step}>
              <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-4xl font-bold text-muted/50">{step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
