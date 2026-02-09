import { Lock, UserCheck, ShieldCheck, Zap } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'All transactions are protected with bank-level security and verified before account transfer.',
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    icon: UserCheck,
    title: 'Verified Listings',
    description: 'Every account is manually reviewed and verified by our team before listing.',
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Moderation',
    description: 'Dedicated admin team monitors all transactions and resolves disputes quickly.',
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    icon: Zap,
    title: 'Instant Wallet Delivery',
    description: 'Fund your wallet and get instant delivery on every purchase — no waiting.',
    color: 'from-amber-500/20 to-amber-600/10',
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-3">Trust & Safety</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Your Safety Comes First
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} mb-5`}>
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
