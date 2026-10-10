import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { FileText, MoveUpRight } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useContactAction } from '@/hooks/useContactAction';
import ContactActionModal from '@/components/ui/contact-action-modal';
import { resolveMediaUrl } from '@/lib/media-url';

gsap.registerPlugin(ScrollTrigger);

const defaultFeatures = [
  { title: 'Digital Transformation', description: 'Cutting-edge digital infrastructure transforming how modern campuses operate and learn.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=90', href: '/digital-transformation', tag: 'Digital', color: '#3B82F6', h: 340 },
  { title: 'AI-Powered Learning Stations', description: 'Intelligent AI stations personalising education for every student at every level.', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=90', href: '/ai-stations', tag: 'AI & Tech', color: '#8B5CF6', h: 220 },
  { title: 'Innovation Centres', description: 'Purpose-built spaces designed to unlock creativity, collaboration and breakthrough thinking.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=90', href: '/innovation-centres', tag: 'Innovation', color: '#EC4899', h: 270 },
  { title: 'Smart Classrooms', description: 'IoT-connected rooms with interactive boards, real-time analytics and immersive tools.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=90', href: '/smart-classrooms', tag: 'Tech Infra', color: '#06B6D4', h: 220 },
  { title: 'Campus Furniture Design', description: 'Thoughtfully engineered, ergonomic furniture that elevates the academic experience.', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=90', href: '/campus-furniture-design', tag: 'Furniture', color: '#F59E0B', h: 360 },
  { title: 'Sports Infrastructure', description: 'World-class athletic facilities nurturing champions, wellness, and team spirit.', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=90', href: '/sports-infra', tag: 'Sports', color: '#10B981', h: 240 },
  { title: 'Library Management', description: 'AI-driven smart library solutions providing seamless access to global knowledge.', image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=90', href: '/library-management', tag: 'Library', color: '#6366F1', h: 300 },
  { title: 'Science & Tech Labs', description: 'Fully equipped STEM laboratories built for discovery, experimentation and innovation.', image: 'https://images.unsplash.com/photo-1532094349884-543290e34c7d?auto=format&fit=crop&w=800&q=90', href: '/science-tech-labs', tag: 'Labs', color: '#14B8A6', h: 200 },
  { title: 'Campus Master Planning', description: 'Visionary campus planning from concept to construction, built to inspire generations.', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=90', href: '/campus-master-planning', tag: 'Planning', color: '#F97316', h: 320 },
  { title: 'AR / VR Learning', description: 'Immersive reality experiences bringing complex concepts to vivid, unforgettable life.', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=90', href: '/ar-vr-experiences', tag: 'AR / VR', color: '#A855F7', h: 240 },
  { title: 'Campus Automation', description: 'Smart systems automating admissions, attendance, finance and governance seamlessly.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=90', href: '/campus-automation', tag: 'Automation', color: '#0EA5E9', h: 200 },
  { title: 'Collaboration Spaces', description: 'Dynamic, flexible zones engineered for productive teamwork and creative ideation.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=90', href: '/collaboration-spaces', tag: 'Spaces', color: '#EF4444', h: 260 },
];

const defaultSidebar = {
  classifieds: [
    { label: 'Colleges / Universities for Sale', href: '/colleges-universities-for-sale' },
    { label: 'Education Infra Funding', href: '/classifieds' },
    { label: 'Partner with Running Colleges', href: '/partner-with-colleges' },
  ],
  resources: [
    { label: 'Complete Guide on AI Implementation', href: '/ai-guide' },
    { label: 'Setting Up a College in India', href: '/setup-college' },
    { label: 'UGC Guidelines for Digital Campus', href: '/ugc-guidelines' },
    { label: 'Product Catalog 2025', href: '/catalogues' },
    { label: 'Lookbook – Play Furniture', href: '/furniture' },
  ],
  completedProjects: [
    { label: 'Campus Master Planning', href: '/campus-master-planning' },
    { label: '20 Stunning College Buildings', href: '/campus-master-planning' },
    { label: 'Academic buildings', href: '/campus-master-planning' },
    { label: 'Research facilities', href: '/innovation-centres' },
    { label: 'Student life centers', href: '/innovation-centres' },
    { label: 'Athletic complexes', href: '/sports-infra' },
  ],
  contacts: [
    { bg: '#FFD700', title: 'DESIGN & ARCHITECTURE', contact: 'info@campusmart.in', href: 'mailto:info@campusmart.in', isEmail: true, queryText: 'FOR QUERIES ON' },
    { bg: '#00c4cc', title: 'CAMPUS INNOVATIONS', contact: 'call us on 9966109191', href: 'tel:+919966109191', isEmail: false, queryText: 'FOR QUERIES ON' },
    { bg: '#C8FF00', title: 'PARTNER CAMPUS', contact: 'call us on 9866091111', href: 'tel:+919866091111', isEmail: false, queryText: 'FOR QUERIES ON' },
  ]
};

const getCanonicalFeatureHref = (title: string): string | null => {
  switch (title) {
    case 'Smart Classrooms': return '/smart-classrooms';
    case 'AR / VR Learning':
    case 'AR/VR Learning': return '/ar-vr-experiences';
    case 'Innovation Centres':
    case 'Innovation Centers': return '/innovation-centres';
    case 'Science & Tech Labs': return '/science-tech-labs';
    case 'Campus Master Planning': return '/campus-master-planning';
    case 'Campus Furniture Design': return '/campus-furniture-design';
    case 'Sports Infrastructure': return '/sports-infra';
    case 'Collaboration Spaces': return '/collaboration-spaces';
    default: return null;
  }
};

const getCanonicalProjectHref = (label: string): string => {
  if (label === 'Research facilities' || label === 'Student life centers') return '/innovation-centres';
  if (label === 'Athletic complexes') return '/sports-infra';
  return '/campus-master-planning';
};

const FeatureCards = () => {
  const { content } = useSiteContent();
  const rawFeatures = content.home_features;
  const featuresList: any[] = Array.isArray(rawFeatures)
    ? rawFeatures
    : (rawFeatures === undefined ? defaultFeatures : []);
  const features = featuresList.map((feature: any) => ({
    ...feature,
    href: (feature.href && feature.href !== '/')
      ? feature.href
      : (getCanonicalFeatureHref(feature.title) || feature.href || '/'),
  }));
  const rawSidebar = (typeof content.home_sidebar === 'object' && content.home_sidebar !== null) ? content.home_sidebar : defaultSidebar;
  const classifieds = (Array.isArray(rawSidebar.classifieds) ? rawSidebar.classifieds : defaultSidebar.classifieds).map((item: any) =>
    item.label === 'Colleges / Universities for Sale'
      ? { ...item, href: '/colleges-universities-for-sale' }
      : item
  );
  const resources = (Array.isArray(rawSidebar.resources) ? rawSidebar.resources : defaultSidebar.resources).map((item: any) =>
    item.label?.toLowerCase().includes('product catalog') || item.label?.toLowerCase().includes('product catalogue')
      ? { ...item, href: '/catalogues' }
      : item
  );
  const completedProjects = (Array.isArray(rawSidebar.completedProjects) ? rawSidebar.completedProjects : defaultSidebar.completedProjects).map((item: any) => ({
    ...item,
    href: (item.href && item.href !== '/') ? item.href : (getCanonicalProjectHref(item.label) || item.href || '/'),
  }));
  const contacts = Array.isArray(rawSidebar.contacts) ? rawSidebar.contacts : defaultSidebar.contacts;
  const { modalState, closeModal, triggerContact } = useContactAction();

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only run animation on desktop to avoid WebKit column rendering bugs with transforms
    const isMobile = window.innerWidth < 1024;
    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.fc-card');
      if (!cards) return;

      if (isMobile) {
        // Safe animation for mobile WebKit CSS columns: NO transforms, NO opacity 0 start
        // Set explicitly to opacity 1 just to be safe
        gsap.set(cards, { opacity: 1, clearProps: 'all' });
      } else {
        // Full animation for desktop
        gsap.fromTo(cards,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.5, stagger: 0.05, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 92%', toggleActions: 'play none none none' },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const [cols, setCols] = useState(3);

  useLayoutEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCols(1);
      else if (w < 1024) setCols(2);
      else setCols(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section ref={sectionRef} className="py-2 sm:py-4 px-3 bg-[#f0f2f5] sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">

          {/* ─── Masonry Grid (Pure Flexbox to fix WebKit bugs) ─── */}
          <div className="w-full min-w-0 flex gap-3 md:flex-1 md:gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="flex flex-1 flex-col gap-3 md:gap-4">
                {features.filter((_: any, i: number) => i % cols === colIndex).map(({ title, description, image, href, tag, color, h }: any) => {
                  const cardHeight = window.innerWidth < 640 ? Math.min(h || 220, 220) : (window.innerWidth < 1024 ? Math.min(h || 240, 240) : (h || 240));

                  return (
                    <Link
                      key={title}
                      to={href}
                      className="fc-card group flex w-full flex-col overflow-hidden rounded-2xl relative shadow-lg"
                      style={{ height: cardHeight }}
                    >
                    {/* Background image */}
                    <img
                      src={resolveMediaUrl(image) || ''}
                      alt={title}
                      onError={(e) => {
                        const fallback = defaultFeatures.find((f) => f.title === title)?.image || '';
                        const target = e.currentTarget;
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Permanent subtle vignette — branded white/blue gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00173d]/85 via-[#002868]/25 to-white/10 transition-opacity duration-500 group-hover:from-[#001e4d]/90" />

                    {/* Category badge */}
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow"
                      style={{ background: color + 'CC' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0"
                        style={{ boxShadow: '0 0 4px white' }}
                      />
                      {tag}
                    </div>

                    {/* Arrow icon — top right on hover */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400">
                      <MoveUpRight className="w-4 h-4 text-white" />
                    </div>

                    {/* Bottom content — always visible and readable with deep blue-to-transparent gradient */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 bg-gradient-to-t from-[#001438]/95 via-[#002058]/65 to-transparent">
                      <h3
                        className="mb-1 text-white font-extrabold text-[12px] leading-snug drop-shadow-lg break-words sm:text-[14px] md:text-lg"
                        style={{ textShadow: '0 2px 10px rgba(0, 20, 50, 0.9)' }}
                      >
                        {title}
                      </h3>

                      <div className="overflow-hidden">
                        <p className="text-[10px] leading-snug font-medium text-white/90 sm:text-[11px] md:text-sm md:leading-relaxed">
                          {description}
                        </p>
                        <div className="mt-2 flex items-center sm:mt-3">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-transform group-hover:translate-x-1 duration-300 sm:text-[11px] md:text-sm"
                            style={{ color }}
                          >
                            Explore <MoveUpRight className="w-3.5 h-3.5 ml-1 sm:w-4 sm:h-4" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hover border ring */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all duration-400 group-hover:ring-2"
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                    />
                  </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="w-full md:w-[230px] md:flex-shrink-0 flex flex-col gap-3">

            <Link
              to="/request-quote"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0a2463] text-white font-bold uppercase tracking-widest rounded-xl hover:bg-[#1a3a8f] transition-all text-xs shadow-md"
            >
              <FileText className="w-4 h-4" />
              Request a Quote
            </Link>

            {/* Classifieds */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="py-2.5 px-4" style={{ background: '#00c4cc' }}>
                <h3 className="text-white font-extrabold uppercase tracking-[0.15em] text-center text-[11px]">Classifieds</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {classifieds.map(({ label, href }: any) => (
                  <li key={label}>
                    <Link to={href} className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="py-2.5 px-4" style={{ background: '#00c4cc' }}>
                <h3 className="text-white font-extrabold uppercase tracking-[0.15em] text-center text-[11px]">Resources</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {resources.map(({ label, href }: any) => (
                  <li key={label}>
                    <Link to={href} className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
                    Completed Projects
                  </div>
                </li>
                {completedProjects.map(({ label, href }: any) => (
                  <li key={label}>
                    <Link to={href} className="flex items-center gap-2 px-4 py-2 text-[11px] text-blue-600 hover:bg-blue-50/60 hover:underline transition-colors">
                      <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {contacts.map(({ bg, title, contact, href, queryText }: any) => {
              const target = href || contact;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => triggerContact(target, title)}
                  className="block w-full py-4 px-4 rounded-xl text-center transition-all hover:brightness-95 hover:-translate-y-0.5 shadow-md border-b-4 border-black/10 cursor-pointer text-left"
                  style={{ background: bg }}
                  title={`Contact Campus Mart for ${title}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 text-center">{queryText || 'FOR QUERIES ON'}</p>
                  <p className="text-[14px] font-black uppercase tracking-wider text-black leading-tight mt-1 text-center">{title}</p>
                  <p className="text-[12px] text-black/80 mt-1.5 font-bold text-center">{contact}</p>
                </button>
              );
            })}

          </div>
        </div>
      </div>
      <ContactActionModal state={modalState} onClose={closeModal} />
    </section>
  );
};

export default FeatureCards;
