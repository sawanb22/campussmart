import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePageData } from '@/hooks/usePageData';

interface CardItem { title: string; description: string; }

const DEFAULTS = {
  heroTitle: 'Learning Management System',
  heroSubtitle: 'Robust LMS platforms tailored for educational institutions. Deliver, track, and evaluate online and blended learning.',
  cards: [
    { title: 'Course Management', description: 'Complete learning management solution.' },
    { title: 'Student Tracking', description: 'Complete learning management solution.' },
    { title: 'Assessment Tools', description: 'Complete learning management solution.' }
  ] as CardItem[]
};

const LMS = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('lms');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const cards: CardItem[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;

  return (
    <main className="min-h-screen">
      <section ref={heroRef} className="bg-cm-blue py-6">
        <div className="w-full mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{heroTitle}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-4">
        <div className="w-full mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {cards.map((c: CardItem) => (
              <div key={c.title} className="bg-white rounded-xl p-8 shadow-sm text-center transition-shadow hover:shadow-sm-hover duration-300">
                <h3 className="text-xl font-bold text-cm-blue-dark mb-4">{c.title}</h3>
                <p className="text-gray-600">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default LMS;
