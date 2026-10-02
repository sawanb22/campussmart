import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePageData } from '@/hooks/usePageData';

interface CardItem { title: string; description: string; }

const DEFAULTS = {
  heroTitle: 'Student Assessment System',
  heroSubtitle: 'Automated assessment platforms for higher education. From theory exams to lab practicals with analytics-driven tracking.',
  cards: [
    { title: 'Online Exams', description: 'Comprehensive assessment solution.' },
    { title: 'Plagiarism Check', description: 'Comprehensive assessment solution.' },
    { title: 'Performance Analytics', description: 'Comprehensive assessment solution.' }
  ] as CardItem[]
};

const AssessmentSystem = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('assessment-system');

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
      <section ref={heroRef} className="bg-cm-red py-6">
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
              <div key={c.title} className="bg-white rounded-xl p-8 shadow-sm text-center hover:shadow-sm-hover transition-shadow duration-300">
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

export default AssessmentSystem;
