import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const ecosystemItems = [
  { number: '01', title: 'Campus Design\n& Planning', href: '/campus-design' },
  { number: '02', title: 'Academic\nInfrastructure', href: '/services' },
  { number: '03', title: 'Research &\nInnovation', href: '/innovation-centres' },
  { number: '04', title: 'Sports &\nWellness', href: '/sports-infra' },
  { number: '05', title: 'Digital\nInfrastructure', href: '/tech-infra' },
  { number: '06', title: 'AI & Smart\nCampus', href: '/digital-transformation' },
  { number: '07', title: 'Sustainability\n& ESG', href: '/contact-us' },
];

const Ecosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gridRef.current?.querySelectorAll('.eco-item');
      if (!items) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 90%', toggleActions: 'play none none none' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl py-6 sm:py-8 md:py-8 px-6 sm:px-8 lg:px-10">
          <div className="mb-6">
            <div className="text-xs md:text-sm font-black uppercase tracking-widest text-blue-300 mb-2">The CampusMart Ecosystem</div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">Everything your campus needs. All under one roof.</h3>
          </div>

          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 md:gap-3">
            {ecosystemItems.map((item) => (
              <Link
                key={item.number}
                to={item.href}
                className="eco-item bg-blue-800/40 backdrop-blur-sm hover:bg-blue-700/60 transition-all duration-300 p-3 sm:p-4 text-center rounded-lg border border-blue-700/50"
              >
                <div className="text-lg sm:text-xl font-black text-blue-300 mb-1">{item.number}</div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-pre-line leading-tight text-sm">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ecosystem;
