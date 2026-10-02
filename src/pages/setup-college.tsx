import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

export type SetupArticle = {
  title: string;
  description?: string;
  category: string;
  readTime?: string;
  image: string;
  href?: string;
};

export const DEFAULTS = {
  pageTitle: 'CAMPUS SETUP',
  featured: {
    category: 'Planning · Campus Setup',
    title: 'HOW TO PLAN A FUTURE-READY COLLEGE CAMPUS',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85',
    href: '/campus-master-planning',
  },
  greenFeature: {
    category: 'Guide · Strategy',
    title: 'BUILD A STRONG FOUNDATION FOR YOUR NEW COLLEGE',
    description: 'A clear sequence helps founders move from an ambitious idea to a campus that is ready for students, faculty and long-term growth.',
  },
  greenTopics: ['START WITH YOUR INSTITUTIONAL VISION', 'MAP THE RIGHT ACADEMIC PROGRAMS', 'PLAN FOR PHASED CAMPUS GROWTH'],
  smallFeature: {
    category: 'Infrastructure · Campus Life',
    title: 'DESIGN SPACES THAT HELP STUDENTS THRIVE',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=85',
    href: '/campus-design-execution',
  },
  categories: ['Planning', 'Infrastructure', 'Academics', 'Compliance', 'Faculty', 'Technology', 'Campus Life', 'Funding', 'Admissions', 'Operations'],
  categoriesTitle: 'Explore Topics',
  categoriesButtonLabel: 'View All Topics',
  latestTitle: 'LATEST\nCAMPUS GUIDES',
  filterLabel: 'All Topics',
  cards: [
    { category: 'Planning', readTime: '06 MIN READ', title: 'THE COMPLETE ROADMAP FOR STARTING A COLLEGE', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1000&q=85', href: '/campus-master-planning' },
    { category: 'Infrastructure', readTime: '05 MIN READ', title: 'ESSENTIAL SPACES EVERY MODERN CAMPUS NEEDS', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=85', href: '/campus-design-execution' },
    { category: 'Academics', readTime: '04 MIN READ', title: 'HOW TO BUILD AN ACADEMIC MODEL THAT LASTS', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85', href: '/ai-ml' },
    { category: 'Compliance', readTime: '07 MIN READ', title: 'A PRACTICAL GUIDE TO APPROVALS AND ACCREDITATION', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=85', href: '/services' },
    { category: 'Faculty', readTime: '05 MIN READ', title: 'ATTRACTING THE RIGHT FACULTY TO YOUR CAMPUS', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85', href: '/partner-with-colleges' },
    { category: 'Technology', readTime: '06 MIN READ', title: 'THE DIGITAL SYSTEMS TO PLAN BEFORE OPENING DAY', image: 'https://images.unsplash.com/photo-1516321318423-f06a051b3e14?auto=format&fit=crop&w=1000&q=85', href: '/digital-transformation' },
  ] as SetupArticle[],
  ctaTitle: 'BUILD A CAMPUS\nTHAT MOVES\nEDUCATION FORWARD.',
  ctaButtonLabel: 'START PLANNING',
  ctaHref: '/partnership',
};

const SetupCollege = () => {
  const { data } = usePageData<any>('setup-college');
  const get = (key: string) => data[key] ?? DEFAULTS[key as keyof typeof DEFAULTS];
  const cards: SetupArticle[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const articleSlug = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <main className="setup-college-page">
      <style>{`
        .setup-college-page { --setup-cream:#f5f8e8; --setup-white:#fff; --setup-black:#090909; --setup-green:#d9f68b; --setup-lavender:#d8d1f5; --setup-purple:#a99be9; --setup-border:rgba(0,0,0,.13); background:var(--setup-cream); color:var(--setup-black); font-family:"DM Sans", "Open Sans", sans-serif; overflow:hidden; }
        .setup-college-page *, .setup-college-page *::before, .setup-college-page *::after { box-sizing:border-box; } .setup-college-page a { color:inherit; text-decoration:none; } .setup-college-page img { display:block; width:100%; }
        .setup-inner { width:min(calc(100% - 64px),1440px); margin:auto; }
        .setup-title-block { padding:67px 0 48px; } .setup-title { margin:0; font-family:"Space Grotesk", "Open Sans", sans-serif; font-size:clamp(62px,8vw,116px); line-height:.83; font-weight:700; letter-spacing:-7px; }
        .setup-featured-grid { display:grid; grid-template-columns:1fr .37fr; gap:8px; }
        .setup-article { position:relative; overflow:hidden; border-radius:28px; transition:transform .35s ease; } .setup-article:hover { transform:translateY(-3px); } .setup-article-image { position:absolute; inset:0; overflow:hidden; } .setup-article-image img { height:100%; object-fit:cover; transition:transform .5s ease; } .setup-article:hover img { transform:scale(1.035); }
        .setup-article-content { position:absolute; z-index:2; left:25px; right:25px; bottom:24px; } .setup-article-category { margin-bottom:9px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.2px; } .setup-article-title { max-width:370px; margin:0; font-family:"Space Grotesk", "Open Sans", sans-serif; font-size:28px; line-height:.98; font-weight:700; letter-spacing:-1.4px; }
        .setup-article-green { grid-column:1; background:var(--setup-green); padding:25px; } .setup-article-green .setup-article-content { position:relative; left:auto; right:auto; bottom:auto; height:100%; display:flex; flex-direction:column; } .setup-article-green .setup-article-title { max-width:620px; margin-top:4px; font-size:31px; } .setup-article-description { max-width:600px; margin:13px 0 0; font-size:11px; line-height:1.35; } .setup-topic-lines { margin-top:auto; display:flex; flex-direction:column; } .setup-topic-line { height:31px; border-top:1px solid rgba(0,0,0,.23); display:flex; align-items:center; justify-content:space-between; font-size:9px; font-weight:600; text-transform:uppercase; } .setup-topic-line span:last-child { font-size:14px; }
        .setup-article-small { grid-column:2; grid-row:2; background:#fff; } .setup-article-small .setup-article-image { right:0; left:auto; width:58%; } .setup-article-small .setup-article-content { bottom:20px; left:20px; width:52%; } .setup-article-small .setup-article-title { max-width:190px; font-size:17px; letter-spacing:-.7px; } .setup-article-small .setup-article-category { margin-bottom:6px; font-size:8px; }
        .setup-categories { grid-column:3; grid-row:1 / 3; display:flex; flex-direction:column; overflow:hidden; padding:20px; border-radius:28px; background:var(--setup-lavender); } .setup-categories-title { margin-bottom:14px; font-family:"Space Grotesk", "Open Sans", sans-serif; font-size:10px; font-weight:700; } .setup-category-list { display:flex; flex-wrap:wrap; align-content:flex-start; gap:6px; } .setup-category-pill { border:0; border-radius:100px; padding:7px 10px; background:var(--setup-purple); cursor:pointer; font-size:9px; font-weight:600; white-space:nowrap; transition:.2s ease; } .setup-category-pill:hover,.setup-category-pill.active { background:var(--setup-black); color:#fff; transform:translateY(-1px); } .setup-category-footer { margin-top:auto; padding-top:20px; } .setup-category-button { width:100%; height:40px; border:0; border-radius:100px; background:var(--setup-black); color:#fff; cursor:pointer; font-size:10px; font-weight:600; transition:.25s ease; } .setup-category-button:hover { background:#fff; color:#000; }
        .setup-blog-section { padding:24px 0 60px; } .setup-section-header { display:flex; align-items:flex-end; justify-content:flex-end; margin-bottom:28px; } .setup-section-title { white-space:pre-line; margin:0; font-family:"Space Grotesk", "Open Sans", sans-serif; font-size:50px; line-height:.9; letter-spacing:-3px; } .setup-section-filter { border:1px solid var(--setup-border); border-radius:100px; padding:12px 17px; background:#fff; cursor:pointer; font-size:11px; }
        .setup-blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; } .setup-blog-card { display:block; overflow:hidden; border-radius:22px; background:#fff; transition:transform .3s ease; } .setup-blog-card:hover { transform:translateY(-4px); } .setup-blog-card-image { height:285px; overflow:hidden; } .setup-blog-card-image img { height:100%; object-fit:cover; transition:transform .45s ease; } .setup-blog-card:hover img { transform:scale(1.04); } .setup-blog-card-body { padding:21px; } .setup-blog-meta { margin-bottom:10px; font-size:9px; font-weight:600; text-transform:uppercase; opacity:.65; } .setup-blog-card-title { margin:0 0 15px; font-family:"Space Grotesk", "Open Sans", sans-serif; font-size:24px; line-height:1; letter-spacing:-1px; font-weight:700; } .setup-blog-card-link { display:inline-flex; align-items:center; gap:7px; font-size:10px; font-weight:600; } .setup-card-arrow { display:grid; width:22px; height:22px; place-items:center; border-radius:50%; background:var(--setup-black); color:#fff; font-size:12px; }
        .setup-cta { display:flex; align-items:center; justify-content:space-between; gap:28px; margin-bottom:40px; padding:38px 42px; border-radius:22px; background:var(--setup-green); } .setup-cta h2 { max-width:650px; margin:0; white-space:pre-line; font-family:"Space Grotesk", "Open Sans", sans-serif; font-size:clamp(32px,4vw,58px); line-height:.9; letter-spacing:-3px; } .setup-cta-button { border:0; border-radius:100px; padding:14px 20px; background:var(--setup-black); color:#fff; cursor:pointer; font-size:11px; font-weight:600; white-space:nowrap; transition:.25s ease; } .setup-cta-button:hover { background:#fff; color:#000; }
        @media (max-width:1100px) { .setup-categories { display:none; } .setup-blog-card-image { height:240px; } }
        @media (max-width:760px) { .setup-inner { width:calc(100% - 30px); } .setup-featured-grid { display:block; } .setup-article-green { min-height:350px; } .setup-blog-section { padding:20px 0 45px; } .setup-section-header { align-items:center; } .setup-section-title { font-size:42px; letter-spacing:-2.5px; } .setup-blog-grid { grid-template-columns:1fr; } .setup-blog-card-image { height:290px; } .setup-cta { flex-direction:column; align-items:flex-start; padding:30px 22px; } .setup-cta h2 { letter-spacing:-2px; } }
        @media (max-width:420px) { .setup-article-content { left:18px; right:18px; bottom:18px; } .setup-article-green { min-height:330px; padding:20px; } .setup-topic-line { height:29px; } .setup-section-title { font-size:37px; } }
      `}</style>

      <div className="setup-inner">
        <section className="setup-blog-section"><div className="setup-blog-grid">{cards.map((card, index) => <Link to={`/setup-college/${articleSlug(card.title)}`} className="setup-blog-card" key={`${card.title}-${index}`}><div className="setup-blog-card-image"><img src={resolveMediaUrl(card.image)} alt={card.title} /></div><div className="setup-blog-card-body"><div className="setup-blog-meta">{card.category} · {card.readTime}</div><h3 className="setup-blog-card-title">{card.title}</h3><span className="setup-blog-card-link">Read guide <span className="setup-card-arrow"><ArrowUpRight size={13} /></span></span></div></Link>)}</div></section>

        <section className="setup-cta"><h2>{get('ctaTitle')}</h2><a href={get('ctaHref')} className="setup-cta-button">{get('ctaButtonLabel')} <ArrowUpRight size={14} className="inline" /></a></section>
      </div>
    </main>
  );
};

export default SetupCollege;