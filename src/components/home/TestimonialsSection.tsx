import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'James K.',
    role: 'Digital Marketer',
    text: 'Fast delivery and secure process. I bought 3 accounts and all were exactly as described. Highly recommended!',
    initials: 'JK',
  },
  {
    name: 'Sarah M.',
    role: 'Social Media Manager',
    text: 'Best place to buy TikTok accounts safely. The wallet system makes purchases instant. Love it!',
    initials: 'SM',
  },
  {
    name: 'David O.',
    role: 'E-Commerce Entrepreneur',
    text: 'The admin moderation gives me confidence. Every account I purchased was verified and delivered on time.',
    initials: 'DO',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-3">Testimonials</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            What Our Buyers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map(({ name, role, text, initials }) => (
            <div
              key={name}
              className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
