import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

export interface CardItem { title: string; description: string; image?: string; }
interface Step { heading: string; body: string; }

export const DIGITAL_TRANSFORMATION_PAGE_SLUG = 'digital-transformation';

export function slugifyDigitalTransformationCard(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'card'
  );
}

export const DIGITAL_TRANSFORMATION_DEFAULTS = {
  heroTitle: 'Digital Transformation',
  heroSubtitle: 'Transform your campus with connected classrooms, campus automation and data-driven decision making — built around how your institution actually works.',
  heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  section1Title: 'Digital Services',
  section2Title: 'Why Go Digital',
  section2Cards: [
    { title: 'Faster Decision-Making', description: 'Live dashboards give leadership the numbers they need the moment they need them, instead of waiting on end-of-month reports.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
    { title: 'Lower Operating Costs', description: 'Automating routine admin work cuts paperwork and the staff hours spent on repetitive tasks.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80' },
    { title: 'Better Student Experience', description: 'Connected classrooms and digital services make everyday campus life smoother for students and parents.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
    { title: 'Audit-Ready Compliance', description: 'Centralised digital records make audits, inspections and accreditation reviews far less stressful.', image: 'https://images.unsplash.com/photo-1554774853-b415df9eeb92?auto=format&fit=crop&w=600&q=80' },
  ] as CardItem[],
  section2Description: 'Most institutions we work with see measurable results within the first two semesters — shorter admin turnaround times, fewer manual errors, and a campus that runs on data instead of guesswork. Our team stays engaged after go-live to make sure adoption sticks across every department.',
  cards: [
    { title: 'Smart Classrooms', description: 'Interactive displays, connected devices and digital content that keep every lesson engaging.' },
    { title: 'Campus Automation', description: 'Automate attendance, access control, timetabling and routine administrative work.' },
    { title: 'Digital Learning (LMS)', description: 'A single platform for coursework, assessments and communication with students.' },
    { title: 'Campus Analytics', description: 'Real-time dashboards that turn operational data into decisions administrators can act on.' },
    { title: 'Cybersecurity & Access', description: 'Protect student data and campus systems with modern security and access controls.' },
    { title: 'Digital Signage & Communication', description: 'Keep students, staff and visitors informed across every building on campus.' },
  ] as CardItem[],
  sections: [
    { heading: 'Assess', body: 'Review current systems, infrastructure and the outcomes your campus wants from going digital.' },
    { heading: 'Design', body: 'Plan the platform, integrations and rollout sequence around your calendar and budget.' },
    { heading: 'Implement', body: 'Deploy hardware and software, migrate data, and train staff and faculty.' },
    { heading: 'Support & Scale', body: 'Monitor adoption, resolve issues quickly and expand to more campuses or buildings.' },
  ] as Step[],
  ctaTitle: 'Have a digital transformation project in mind?',
  ctaSubtitle: 'Tell us what you want to build, automate or connect — our team will help you plan it.',
};

const DEFAULTS = DIGITAL_TRANSFORMATION_DEFAULTS;

const DigitalTransformation = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(DIGITAL_TRANSFORMATION_PAGE_SLUG);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.08,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? DEFAULTS.section1Title;
  const cards: CardItem[] = (data.cards && data.cards.length > 0) ? data.cards : DEFAULTS.cards;
  const steps: Step[] = (data.sections && data.sections.length > 0) ? data.sections : DEFAULTS.sections;
  const section2Title = data.section2Title ?? DEFAULTS.section2Title;
  const section2Cards: CardItem[] = (data.section2Cards && data.section2Cards.length > 0) ? data.section2Cards : DEFAULTS.section2Cards;
  const section2Description = data.section2Description ?? DEFAULTS.section2Description;
  const ctaTitle = data.ctaTitle ?? DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? DEFAULTS.ctaSubtitle;

  return (
    <main className="min-h-screen bg-white">
      {/* Standard Hero Section */}
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner mt-4 mb-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 text-left text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
              <span>Campus Innovation</span>
              <span className="text-white/60">/</span>
              <span className="text-white">Digital Transformation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight text-white leading-tight">
              {heroTitle}
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/contact-us" className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md">
                Schedule Campus Audit
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative w-full">
            <img
              src={resolveMediaUrl(heroImage)}
              alt={heroTitle}
              className="rounded-2xl shadow-xl w-full h-[240px] sm:h-[260px] object-cover border-2 border-cm-blue-dark relative z-10"
            />
          </div>
        </div>
      </section>

      {/* Why go digital — image cards */}
      <section id="why-digital" className="bg-cm-gray px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-5 max-w-xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cm-blue">The Impact</span>
            <h2 className="mt-3 text-2xl font-bold text-cm-blue-dark sm:text-3xl">{section2Title}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {section2Cards.map((card) => {
              const image = resolveMediaUrl(card.image);
              return (
                <Link
                  key={card.title}
                  to={`/${DIGITAL_TRANSFORMATION_PAGE_SLUG}/${slugifyDigitalTransformationCard(card.title)}`}
                  className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {image && (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="mb-2 text-base font-bold text-cm-blue-dark group-hover:text-cm-blue">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          {section2Description && (
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-gray-500 sm:text-base">
              {section2Description}
            </p>
          )}
        </div>
      </section>

      {/* Services grid — numbered */}
      <section id="services" className="bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-5 max-w-xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cm-blue">Our Expertise</span>
            <h2 className="mt-3 text-2xl font-bold text-cm-blue-dark sm:text-3xl">{section1Title}</h2>
          </div>
          <div ref={cardsRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => (
              <div key={card.title} className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="text-xs font-extrabold text-cm-blue">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 mb-2 text-lg font-bold text-cm-blue-dark">{card.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-5 max-w-xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cm-blue">How We Work</span>
            <h2 className="mt-3 text-2xl font-bold text-cm-blue-dark sm:text-3xl">From Assessment to Adoption</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.heading} className="border-t-2 border-cm-blue pt-5">
                <span className="text-4xl font-black text-blue-100">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-1 mb-2 text-base font-bold text-cm-blue-dark">{step.heading}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cm-blue px-4 py-6 text-center sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-4xl">{ctaTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">{ctaSubtitle}</p>
          <Link to="/contact-us" className="btn-secondary mt-6 inline-flex items-center gap-2">
            Start The Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default DigitalTransformation;
