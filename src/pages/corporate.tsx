import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Users, Target, Award, Handshake, TrendingUp, CheckCircle2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';

gsap.registerPlugin(ScrollTrigger);

const DEFAULTS = {
  heroTitle: 'About Campus Mart',
  heroSubtitle: 'We are a consortium of architects, designers, and campus innovators who strive to bring learning outcomes through the latest infrastructure and edtech solutions.',
  section1Title: 'Our Mission',
  section2Title: 'Our Core Values',
  missionTitle: 'Our Mission',
  missionBody1: 'To transform educational infrastructure across India by providing comprehensive campus solutions that blend physical spaces with cutting-edge digital technology. We aim to create learning environments that inspire, engage, and empower students and educators alike.',
  missionBody2: 'As the first company in Asia to bring curriculum-mapped innovations to the campus industry, we continue to lead the way in educational transformation.',
  missionImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  ecosystemTitle: 'Global Ecosystem',
  ecosystemSubtitle: 'Our strength lies in our network of global partners who bring the best of edtech and infrastructure to Indian soil.',
  whyBullets: [
    "India's leading Consortium for Campus Infrastructure",
    "Bespoke Design to Delivery across 100+ categories",
    "Strategic Planning for new Campuses from scratch",
    "4000+ Partner Campuses across India",
    "Exclusive access to global educational brands",
    "NEP 2020 aligned innovation & digital tools"
  ],
  team: [
    { name: 'Rajesh Kumar', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Priya Sharma', role: 'Chief Design Officer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Amit Patel', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ],
  partners: [
    'European Educational Group',
    'MAXHUB',
    'Nike',
    'ViewSonic',
    'Kidken',
    'Little Tikes',
    'ButterflyFields',
    'ALTOP',
    'Skill O Fun',
    'WriteOnWalls',
    'ICTS',
    'INFINITI',
  ]
};

const Corporate = () => {
  const { pathname } = useLocation();
  const slug = pathname === '/' ? 'home' : pathname.replace(/^\//, '');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(slug || 'about-us');

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      
      const stats = statsRef.current?.children;
      if (stats) {
        gsap.fromTo(stats, 
          { opacity: 0, y: 30 }, 
          { 
            opacity: 1, y: 0, 
            duration: 0.8, 
            stagger: 0.1, 
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
            }
          }
        );
      }

      gsap.fromTo(missionRef.current, 
        { scale: 0.95, opacity: 0 }, 
        { 
          scale: 1, opacity: 1, 
          duration: 1, 
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 80%',
          }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Building2, value: '4000+', label: 'Partner Campuses' },
    { icon: Users, value: '7+', label: 'Years of Experience' },
    { icon: Target, value: '100%', label: 'Client Satisfaction' },
    { icon: Award, value: '50+', label: 'Awards Won' },
  ];

  const values = [
    {
      icon: Handshake,
      title: 'Partnership',
      description: 'We believe in building long-term partnerships with educational institutions.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Constantly evolving to bring the latest technology and design to campuses.',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality in every project we undertake.',
    },
  ];

  return (
    <main className="min-h-screen bg-white font-opensans">
      {/* Grand Legacy Hero */}
      <section ref={heroRef} className="relative min-h-[40vh] flex items-center bg-cm-blue-dark overflow-hidden py-16 md:py-24 mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] mt-4">
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(var(--cm-blue) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="w-full mx-auto px-4 sm:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <span className="text-cm-yellow font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block">Est. 2017</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-opensans">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative z-20 -mt-10 mb-16 px-4">
        <div className="w-full mx-auto max-w-6xl bg-white shadow-xl rounded-[2rem] p-8 border border-cm-gray">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-cm-gray">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center md:px-4 group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cm-blue/5 flex items-center justify-center border border-cm-blue/10 group-hover:bg-cm-blue group-hover:scale-105 transition-all duration-500 shadow-md">
                  <Icon className="w-7 h-7 text-cm-blue group-hover:text-white" />
                </div>
                <div className="text-3xl font-bold text-cm-blue-dark mb-1 tracking-tighter">{value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Mission */}
      <section ref={missionRef} className="py-16 md:py-20 overflow-hidden">
        <div className="w-full mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-6 bg-cm-blue/10 rounded-[3rem] group-hover:rotate-1 transition-transform duration-1000" />
              <MediaImage
                src={data.missionImage}
                fallbackSrc={DEFAULTS.missionImage}
                alt="Campus Mart Mission"
                className="relative rounded-[2.5rem] shadow-xl w-full h-[360px] sm:h-[440px] object-cover translate-x-2 grayscale group-hover:grayscale-0 transition-all duration-1000 bg-slate-100"
              />
              <div className="absolute -bottom-6 -right-6 bg-cm-yellow p-6 rounded-2xl shadow-xl">
                <Building2 className="w-6 h-6 text-cm-blue-dark" />
              </div>
            </div>
            
            <div className="relative">
              <span className="text-cm-blue font-bold uppercase tracking-[0.2em] text-[10px] mb-6 block font-mono">/ Mission Statement</span>
              <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark mb-6 leading-tight tracking-tight">
                {data.missionTitle ?? data.section1Title ?? DEFAULTS.section1Title}
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-6 border-l-4 border-cm-blue pl-6 py-2">
                {data.missionBody1 ?? DEFAULTS.missionBody1}
              </p>
              <p className="text-base text-gray-400 leading-relaxed font-opensans">
                 {data.missionBody2 ?? DEFAULTS.missionBody2}
              </p>
              
              <div className="mt-8 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-cm-blue">Institutional Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Array.isArray(data.whyBullets) ? data.whyBullets : DEFAULTS.whyBullets).map((bullet: string) => (
                    <div key={bullet} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 flex items-center gap-6">
                <div className="w-12 h-1 bg-cm-blue" />
                <span className="text-cm-blue-dark font-bold uppercase tracking-widest text-sm">Designing Tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Large Typography */}
      <section className="py-12 md:py-16 bg-cm-gray/30 border-y border-cm-gray rounded-[3rem] mx-4 my-6">
        <div className="w-full mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-cm-blue-dark tracking-tighter leading-none">
              {data.section2Title ?? DEFAULTS.section2Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white p-10 rounded-[2.5rem] hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 border border-cm-gray group shadow-sm">
                <div className="w-16 h-16 rounded-full bg-cm-blue flex items-center justify-center mb-8 shadow-md group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-cm-blue-dark mb-4 tracking-tight">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-base font-opensans">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Executive Profiles */}
      <section id="team" className="py-12 md:py-16">
        <div className="w-full mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6">
            <h2 className="text-3xl md:text-5xl font-bold text-cm-blue-dark tracking-tighter leading-none">
              Governance & Leadership
            </h2>
            <div className="text-gray-400 font-bold max-w-sm text-right">Driven by a vision to revolutionize the Indian educational landscape.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(Array.isArray(data.team) ? data.team : DEFAULTS.team).map((member: any) => (
              <div key={member.name} className="group flex flex-col items-center">
                <div className="relative mb-6 w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-xl border border-gray-100">
                  <MediaImage
                    src={member.image}
                    fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cm-blue-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 left-6 text-white opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cm-yellow block mb-1 font-opensans">Executive Team</span>
                    <span className="text-lg font-bold">{member.name}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-cm-blue-dark mb-1 tracking-tight">{member.name}</h3>
                <p className="text-cm-blue font-bold uppercase text-[10px] tracking-[0.2em] font-opensans">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Network */}
      {data.hideEcosystem !== true && (
        <section id="partners" className="py-12 md:py-16 bg-cm-gray/20 border-t border-cm-gray">
          <div className="w-full mx-auto px-4 sm:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-cm-blue-dark tracking-tighter mb-4">
                {data.ecosystemTitle ?? DEFAULTS.ecosystemTitle}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {data.ecosystemSubtitle ?? DEFAULTS.ecosystemSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {(Array.isArray(data.partners) ? data.partners : DEFAULTS.partners).map((partner: string) => (
                <div key={partner} className="bg-white border border-cm-gray rounded-[2rem] p-6 flex flex-col items-center justify-center aspect-video shadow-sm hover:shadow-xl hover:border-cm-blue transition-all duration-500 group">
                  <div className="w-10 h-10 bg-cm-gray/30 rounded-full flex items-center justify-center mb-4 border border-gray-100 group-hover:bg-cm-blue group-hover:scale-110 transition-all">
                    <Handshake className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </div>
                  <span className="text-xs font-bold text-cm-blue-dark text-center uppercase tracking-tight leading-none">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
};

export default Corporate;
