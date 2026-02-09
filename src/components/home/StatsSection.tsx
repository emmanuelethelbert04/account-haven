import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 1000, suffix: '+', label: 'Accounts Sold' },
  { value: 500, suffix: '+', label: 'Happy Buyers' },
  { value: 24, suffix: '/7', label: 'Support' },
  { value: 100, suffix: '%', label: 'Secure Transactions' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-bold text-foreground">
      {count}{suffix}
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 lg:py-24 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <AnimatedCounter target={value} suffix={suffix} />
              <p className="text-muted-foreground mt-2 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
