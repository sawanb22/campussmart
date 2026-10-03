import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';

interface CardItem { title: string; description: string; image?: string; categories?: string[]; href?: string; }

export const CAMPUS_AUTOMATION_PAGE_SLUG = 'campus-automation';

export function slugifyCampusAutomationTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'module'
  );
}

export const CAMPUS_AUTOMATION_DEFAULTS = {
  heroTitle: 'Turn everyday operations into automated workflows.',
  heroSubtitle: 'Admissions, attendance, finance, scheduling and reporting — automated so your staff can spend less time on paperwork and more time with students.',
  section1Title: 'Automation Modules',
  cards: [
    {
      title: 'Automated Admissions',
      description: 'Move applicants from enquiry to enrolment with online forms, document checks and status tracking that runs itself — no more chasing paperwork.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85',
      categories: ['Admissions'],
    },
    {
      title: 'Smart Attendance',
      description: 'Biometric and RFID attendance that syncs straight to parent alerts and academic records.',
      image: 'https://images.unsplash.com/photo-1596496181848-3091d4878b24?auto=format&fit=crop&w=800&q=85',
      categories: ['Attendance'],
    },
    {
      title: 'Finance & Fee Automation',
      description: 'Automated fee reminders, online payments and real-time reconciliation that keeps accounts audit-ready.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=85',
      categories: ['Finance'],
    },
    {
      title: 'Timetable Scheduling',
      description: 'Generate conflict-free timetables in minutes and adjust instantly when a class or faculty member changes.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=85',
      categories: ['Scheduling'],
    },
    {
      title: 'Research & Compliance Tracking',
      description: 'Track grants, publications and regulatory filings in one dashboard instead of scattered spreadsheets.',
      image: 'https://images.unsplash.com/photo-1554774853-b415df9eeb92?auto=format&fit=crop&w=800&q=85',
      categories: ['Research'],
    },
    {
      title: 'Operations Dashboard',
      description: 'A single real-time view of admissions, attendance and finance for administrators and leadership.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85',
      categories: ['Analytics'],
    },
  ] as CardItem[],
  ctaTitle: 'Ready to automate your campus operations?',
  ctaSubtitle: "Tell us which processes eat up the most staff time — we'll show you what can run itself.",
};

const CampusAutomation = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('campus-automation');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' } }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const section1Title = data.section1Title ?? CAMPUS_AUTOMATION_DEFAULTS.section1Title;
  const allCards: CardItem[] = Array.isArray(data.cards) ? data.cards : CAMPUS_AUTOMATION_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? CAMPUS_AUTOMATION_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? CAMPUS_AUTOMATION_DEFAULTS.ctaSubtitle;

  const [featured, ...rest] = allCards;
  const filterOptions = useMemo(
    () => Array.from(new Set(rest.flatMap((card) => card.categories ?? []))),
    [rest]
  );
  const filteredCards = activeFilter === 'All' ? rest : rest.filter((card) => card.categories?.includes(activeFilter));

  const cardLink = (card: CardItem) => card.href?.trim() || `/${CAMPUS_AUTOMATION_PAGE_SLUG}/${slugifyCampusAutomationTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      <section id="modules" className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Filter pills */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                activeFilter === option ? 'border-cm-blue-dark bg-cm-blue-dark text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Featured module */}
        {featured && (
          <article className="mb-4 grid grid-cols-1 overflow-hidden rounded-xl bg-cm-gray lg:grid-cols-[1.2fr_1fr]">
            <div className="h-56 overflow-hidden lg:h-auto">
              <MediaImage src={featured.image} alt={featured.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cm-blue">
                Featured {featured.categories?.[0] ? `· ${featured.categories[0]}` : ''}
              </span>
              <h2 className="mb-3 text-2xl font-bold leading-tight text-cm-blue-dark sm:text-3xl">{featured.title}</h2>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">{featured.description}</p>
              <Link to="/contact-us" className="inline-flex w-fit items-center gap-2 border-b-2 border-cm-blue-dark pb-1 text-sm font-bold text-cm-blue-dark">
                Talk to us about it <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        )}

        {/* Modules grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cm-blue-dark sm:text-2xl">{section1Title}</h2>
        </div>
        {filteredCards.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50 py-16 text-center text-gray-500">No modules in this category yet.</div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => (
              <Link
                key={card.title}
                to={cardLink(card)}
                className="block overflow-hidden rounded-lg bg-cm-gray transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-44 overflow-hidden">
                  <MediaImage src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cm-blue">{card.categories?.[0] ?? 'Module'}</span>
                  <h3 className="mt-2 mb-1.5 text-lg font-bold leading-snug text-cm-blue-dark">{card.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-gray-500">{card.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-bold uppercase tracking-wide text-cm-blue-dark/70">{card.categories?.[0] ?? 'Automation'}</span>
                    <span>Fully automated</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-4 pb-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-xl bg-cm-blue-dark px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-white/15" aria-hidden="true" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cm-yellow">Stay Ahead</span>
              <h2 className="mt-2 max-w-md text-2xl font-bold text-white sm:text-3xl">{ctaTitle}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{ctaSubtitle}</p>
            </div>
            <Link to="/contact-us" className="btn-secondary inline-flex flex-shrink-0 items-center gap-2">
              Talk to Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CampusAutomation;
