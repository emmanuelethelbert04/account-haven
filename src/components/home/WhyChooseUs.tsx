import { Shield, User, Zap, MessageSquare, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyChooseUs() {
  const items = [
    {
      icon: Shield,
      title: 'Secure Escrow Protection',
      desc: 'Your payment is held safely until the account is successfully delivered and confirmed. No risks. No guesswork.',
      bg: 'from-emerald-400 to-emerald-600',
    },
    {
      icon: User,
      title: 'Verified Sellers Only',
      desc: 'We screen sellers to reduce fraud and ensure listings are legitimate, active, and accurately described.',
      bg: 'from-blue-400 to-blue-600',
    },
    {
      icon: Zap,
      title: 'Fast & Smooth Transfers',
      desc: 'Most accounts are delivered quickly with guided transfer steps so you can take ownership without confusion.',
      bg: 'from-yellow-400 to-amber-600',
    },
    {
      icon: MessageSquare,
      title: 'Real Human Support',
      desc: 'Questions or issues? Our support team is ready to help make sure every transaction goes smoothly.',
      bg: 'from-violet-400 to-violet-600',
    },
    {
      icon: Globe,
      title: 'Trusted by Buyers Worldwide',
      desc: 'With hundreds of successful transactions, Account Haven has become a reliable marketplace for digital asset trading.',
      bg: 'from-pink-400 to-pink-600',
    },
    {
      icon: RefreshCw,
      title: 'Fair Dispute Resolution',
      desc: 'If something goes wrong, our resolution system steps in to protect both buyers and sellers fairly.',
      bg: 'from-sky-400 to-sky-600',
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-10">
          <p className="text-2xl font-semibold text-primary/60">🛡️ Why Choose Account Haven</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">Why Thousands Trust Account Haven</h2>
          <p className="mt-3 text-primary/60 max-w-2xl mx-auto">A secure, vetted marketplace built to make buying and selling verified social accounts safe, fast, and reliable.</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { delay: idx * 0.06 } },
                }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/3 border border-white/6 backdrop-blur"
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br ${it.bg} text-white shadow-md flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-foreground font-semibold">{it.title}</p>
                  <p className="text-sm text-foreground/60 mt-1">{it.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}