import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, ArrowRight, Download } from 'lucide-react';

const Resources = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  const resourcesList = [
    { title: 'AI Implementation Guide', icon: BookOpen, desc: 'A comprehensive guide for implementing AI in educational institutions', link: '/ai-guide' },
    { title: 'Setting Up a College in India', icon: FileText, desc: 'Step-by-step masterclass to establishing a new college in India', link: '/setup-college' },
    { title: 'UGC Guidelines for Digital Campus', icon: Download, desc: 'Latest UGC guidelines for the digital transformation of campuses', link: '/ugc-guidelines' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        <div ref={heroRef} className="bg-gradient-to-r from-cm-blue to-blue-700 rounded-2xl py-8 sm:py-10 md:py-12 px-6 sm:px-8 lg:px-12 max-w-5xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">Resources & Guides</h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Explore our curated guides, product catalogs, and official frameworks to inspire your next campus project.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {resourcesList.map((item) => (
              <Link key={item.title} to={item.link} className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100">
                <item.icon className="w-16 h-16 text-cm-blue mb-6" />
                <h3 className="text-xl md:text-2xl font-bold text-cm-blue-dark mb-3">{item.title}</h3>
                <p className="text-gray-600 text-base mb-6">{item.desc}</p>
                <span className="inline-flex items-center gap-2 text-cm-blue font-bold text-sm hover:gap-3 transition-all">
                  Explore <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Resources;
