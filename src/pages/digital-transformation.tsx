import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

interface CardItem { title: string; description: string; }
interface Step { heading: string; body: string; }

const DEFAULTS = {
  heroTitle: 'Digital Transformation',
  heroSubtitle: 'Transform your campus with connected classrooms, campus automation and data-driven decision making — built around how your institution actually works.',
  heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  section1Title: 'Digital Services',
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

const DigitalTransformation = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('digital-transformation');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

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
  const heroImage = resolveMediaUrl(data.heroImage) || DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? DEFAULTS.section1Title;
  const cards: CardItem[] = (data.cards && data.cards.length > 0) ? data.cards : DEFAULTS.cards;
  const steps: Step[] = (data.sections && data.sections.length > 0) ? data.sections : DEFAULTS.sections;
  const ctaTitle = data.ctaTitle ?? DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? DEFAULTS.ctaSubtitle;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero — light band with dashboard mockup */}
      <section className="relative overflow-hidden bg-blue-50/50 py-8 sm:py-10">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cm-blue/10" aria-hidden="true" />
        <div ref={heroRef} className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-cm-blue">
              Digital Transformation
            </span>
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-cm-blue-dark sm:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-gray-500 sm:text-base">{heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#services" className="btn-primary inline-flex items-center gap-2">
                Explore Solutions <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#process" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-cm-blue-dark">
                Our Approach
              </a>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_25px_70px_-25px_rgba(26,55,101,0.25)] sm:p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-sm font-bold text-cm-blue-dark">Campus Intelligence</span>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-100" />
                <span className="h-2 w-2 rounded-full bg-blue-100" />
                <span className="h-2 w-2 rounded-full bg-blue-100" />
              </div>
            </div>
            <div className="grid grid-cols-[1.2fr_0.8fr] gap-3 pt-4">
              <div className="overflow-hidden rounded-xl border border-gray-100 p-3">
                <span className="text-[11px] font-semibold text-gray-400">Campus Overview</span>
                <img src={heroImage} alt={heroTitle} className="mt-3 h-32 w-full rounded-lg object-cover" />
              </div>
              <div className="grid gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <span className="block text-lg font-extrabold text-cm-blue">98.7%</span>
                  <span className="text-[11px] text-gray-500">System uptime</span>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <span className="block text-lg font-extrabold text-cm-blue">42%</span>
                  <span className="text-[11px] text-gray-500">Less paperwork</span>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <span className="block text-lg font-extrabold text-cm-blue">3.8x</span>
                  <span className="text-[11px] text-gray-500">Faster reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid — numbered */}
      <section id="services" className="bg-cm-gray px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-xl text-center">
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
      <section id="process" className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-xl text-center">
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
      <section className="bg-cm-blue px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-4xl">{ctaTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">{ctaSubtitle}</p>
          <Link to="/contact-us" className="btn-secondary mt-8 inline-flex items-center gap-2">
            Start The Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default DigitalTransformation;
