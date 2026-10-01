import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

type Article = { title: string; description?: string; category: string; readTime: string; image: string; href?: string; author?: string; authorImage?: string };
type MoreCard = { title: string; category: string; href?: string; image?: string; description?: string };

export const DEFAULTS = {
  brandName: 'CampusMart Journal',
  headerActionLabel: 'Explore Campus Solutions',
  headerActionHref: '/solutions',
  navLinks: ['Guidelines', 'Campus Planning', 'Technology', 'Resources'],
  pageTitle: 'Campus Digital Journal',
  categories: ['All guidance', 'Digital Campus', 'Governance', 'Technology', 'Student Experience', 'UGC'],
  featured: {
    eyebrow: 'Featured guidance',
    title: 'Building a responsible digital campus from the ground up',
    description: 'A practical starting point for education teams planning connected learning environments, secure data practices and better digital experiences for every student.',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=85',
    href: '/digital-transformation',
    readMoreLabel: 'Read the guidance',
  },
  cards: [
    { category: 'Digital Campus', readTime: '5 min read', title: 'What a connected campus needs before launch', description: 'A clear checklist for infrastructure, systems and teams preparing for a more connected institution.', image: 'https://images.unsplash.com/photo-1516321318423-f06a051b3e14?auto=format&fit=crop&w=900&q=85', author: 'CampusMart Team', authorImage: 'https://i.pravatar.cc/80?img=12', href: '/tech-infra' },
    { category: 'Governance', readTime: '6 min read', title: 'Make student data privacy part of the design', description: 'Build trust into campus technology with practical privacy and access decisions from day one.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=85', author: 'CampusMart Team', authorImage: 'https://i.pravatar.cc/80?img=32', href: '/services' },
    { category: 'Student Experience', readTime: '4 min read', title: 'Digital services that keep students moving', description: 'Thoughtful digital touchpoints can make everyday campus journeys simpler and more inclusive.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85', author: 'CampusMart Team', authorImage: 'https://i.pravatar.cc/80?img=47', href: '/campus-automation' },
  ] as Article[],
  moreTitle: 'More campus resources',
  moreCards: [
    { category: 'Campus planning', title: 'Plan spaces around the way students learn', description: 'Shape learning environments around real student journeys.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=85', href: '/campus-master-planning' },
    { category: 'Operations', title: 'Spend less time on manual campus work', description: 'Connect everyday workflows so staff can focus on students.', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85', href: '/campus-automation' },
    { category: 'Technology', title: 'Choose tools that help teams do more', description: 'Build a practical digital foundation for your institution.', image: 'https://images.unsplash.com/photo-1516321318423-f06a051b3e14?auto=format&fit=crop&w=900&q=85', href: '/digital-transformation' },
  ] as MoreCard[],
  footerDescription: 'Practical guidance for education leaders building safer, smarter and more human campuses.',
  footerColumns: [
    { title: 'Explore', links: ['Campus Planning', 'Technology', 'Resources'] },
    { title: 'Company', links: ['About CampusMart', 'Contact', 'Partnerships'] },
    { title: 'Connect', links: ['LinkedIn', 'Instagram', 'YouTube'] },
  ],
  copyright: '© 2026 CampusMart. All rights reserved.',
};

const resolveJournalFooterUrl = (label: string): { to?: string; href?: string; isExternal?: boolean } => {
  const norm = label.toLowerCase().trim();
  if (norm.includes('planning')) return { to: '/campus-master-planning' };
  if (norm.includes('tech')) return { to: '/tech-infra' };
  if (norm.includes('resource')) return { to: '/resources' };
  if (norm.includes('about')) return { to: '/about-us' };
  if (norm.includes('contact')) return { to: '/contact-us' };
  if (norm.includes('partner')) return { to: '/partnership' };
  if (norm.includes('linkedin')) return { href: 'https://www.linkedin.com/company/campusmart/', isExternal: true };
  if (norm.includes('instagram')) return { href: 'https://www.instagram.com/campusmart.in/', isExternal: true };
  if (norm.includes('youtube')) return { href: 'https://www.youtube.com/@campusmartindia', isExternal: true };
  return { to: '/resources' };
};

const UGCGuidelines = () => {
  const { data } = usePageData<any>('ugc-guidelines');
  const [selectedCategory, setSelectedCategory] = useState('All guidance');
  const get = (key: string) => data[key] ?? DEFAULTS[key as keyof typeof DEFAULTS];
  const categories: string[] = data.categories?.length ? data.categories : DEFAULTS.categories;
  const cards: Article[] = data.cards?.length ? data.cards : DEFAULTS.cards;
  const featured = { ...DEFAULTS.featured, ...(data.featured ?? {}) };
  const visibleCards = useMemo(() => selectedCategory === categories[0] ? cards : cards.filter(card => card.category === selectedCategory), [cards, categories, selectedCategory]);

  return (
    <main className="ugc-journal-page">
      <style>{`
        .ugc-journal-page { --ugc-cream:#f5f4ef; --ugc-paper:#f8f8f4; --ugc-green:#155b51; --ugc-green-dark:#124d46; --ugc-green-soft:#dfe9e4; --ugc-orange:#f47b20; --ugc-blue:#8ca8d9; --ugc-text:#173e39; --ugc-muted:#6b7772; background:var(--ugc-cream); color:var(--ugc-text); font-family:"DM Sans","Open Sans",sans-serif; min-height:100vh; padding:7vh 5vw; }
        .ugc-journal-page *, .ugc-journal-page *::before, .ugc-journal-page *::after { box-sizing:border-box; } .ugc-journal-page a { color:inherit; text-decoration:none; } .ugc-journal-page img { display:block; width:100%; }
        .ugc-website { position:relative; width:min(1160px,100%); overflow:hidden; margin:auto; border:1px solid rgba(255,255,255,.75); border-radius:30px; background:var(--ugc-paper); box-shadow:0 25px 70px rgba(14,35,30,.2); } .ugc-header { position:relative; z-index:2; height:82px; display:flex; align-items:center; justify-content:space-between; padding:0 54px; } .ugc-logo { display:flex; align-items:center; gap:8px; color:var(--ugc-text); font-size:15px; font-weight:700; letter-spacing:-.5px; } .ugc-logo-mark { position:relative; width:23px; height:23px; border:2px solid var(--ugc-orange); border-radius:50%; } .ugc-logo-mark::before { content:""; position:absolute; width:8px; height:8px; top:5px; left:5px; border-radius:50%; background:var(--ugc-orange); } .ugc-logo-mark::after { content:""; position:absolute; right:-4px; bottom:3px; width:10px; height:2px; background:var(--ugc-green); transform:rotate(-40deg); }
        .ugc-nav { display:flex; align-items:center; gap:32px; margin-right:40px; } .ugc-nav a { position:relative; color:#45615c; font-size:11px; font-weight:600; } .ugc-nav a::after { content:""; position:absolute; left:0; right:0; bottom:-6px; height:2px; border-radius:2px; background:var(--ugc-orange); transform:scaleX(0); transition:transform .2s ease; } .ugc-nav a:hover { color:var(--ugc-green); } .ugc-nav a:hover::after { transform:scaleX(1); } .ugc-header-action { display:inline-block; border:1px solid #d6ddd8; border-radius:20px; padding:7px 13px; color:var(--ugc-green); background:rgba(255,255,255,.65); font-size:9px; font-weight:700; transition:all .2s ease; } .ugc-header-action:hover { background:var(--ugc-green); color:#fff; }
        .ugc-main { padding:4px 54px 68px; } .ugc-page-title { margin:0 0 21px; color:var(--ugc-green); font-size:clamp(34px,4vw,49px); line-height:.95; letter-spacing:-2.5px; font-weight:700; } .ugc-categories { width:min(690px,100%); min-height:37px; display:flex; align-items:center; gap:3px; overflow-x:auto; scrollbar-width:none; margin-bottom:24px; padding:4px 8px; border-radius:30px; background:var(--ugc-green); } .ugc-categories::-webkit-scrollbar { display:none; } .ugc-category { flex:0 0 auto; border:0; border-radius:20px; padding:7px 15px; background:transparent; color:rgba(255,255,255,.73); cursor:pointer; font-size:8px; font-weight:600; } .ugc-category:hover,.ugc-category.active { background:rgba(255,255,255,.16); color:#fff; }
        .ugc-featured { min-height:310px; display:grid; grid-template-columns:1fr 1fr; overflow:hidden; border-radius:25px; background:var(--ugc-green-soft); } .ugc-featured-copy { position:relative; display:flex; flex-direction:column; justify-content:center; padding:40px 39px; background:var(--ugc-green); color:#fff; } .ugc-eyebrow { margin-bottom:15px; color:#9fc1b8; font-size:8px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; } .ugc-featured-title { max-width:400px; margin:0; font-size:clamp(28px,3.3vw,43px); line-height:.97; letter-spacing:-1.8px; font-weight:700; } .ugc-featured-description { max-width:370px; margin:18px 0 25px; color:rgba(255,255,255,.74); font-size:10px; line-height:1.55; } .ugc-read-link { display:inline-flex; align-items:center; gap:8px; width:max-content; color:#fff; font-size:9px; font-weight:700; } .ugc-read-link span { display:grid; width:19px; height:19px; place-items:center; border-radius:50%; background:var(--ugc-orange); transition:transform .2s ease; } .ugc-read-link:hover span { transform:translateX(3px); } .ugc-featured-art { min-height:310px; overflow:hidden; background:var(--ugc-green-soft); } .ugc-featured-art img { height:100%; object-fit:cover; }
        .ugc-articles { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:24px; } .ugc-article-card { min-width:0; } .ugc-article-image { height:177px; overflow:hidden; border-radius:17px; background:#d9ded8; } .ugc-article-image img { height:100%; object-fit:cover; transition:transform .45s ease; } .ugc-article-card:hover .ugc-article-image img { transform:scale(1.05); } .ugc-article-meta { display:flex; align-items:center; justify-content:space-between; margin:8px 1px 7px; color:#87918d; font-size:7px; } .ugc-article-category { color:var(--ugc-orange); font-weight:700; text-transform:uppercase; } .ugc-article-title { max-width:95%; margin:0; color:var(--ugc-green); font-size:14px; line-height:1.13; letter-spacing:-.35px; font-weight:700; } .ugc-author { display:flex; align-items:center; gap:7px; margin-top:11px; color:#71807a; font-size:7px; } .ugc-avatar { width:18px; height:18px; flex:0 0 18px; overflow:hidden; border-radius:50%; background:#b7c2bb; } .ugc-avatar img { height:100%; object-fit:cover; }
        .ugc-more { margin-top:68px; padding-top:38px; border-top:1px solid #dce1dc; } .ugc-more-heading { margin:0 0 25px; color:var(--ugc-green); font-size:27px; letter-spacing:-1px; } .ugc-more-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; } .ugc-simple-card { display:block; padding:22px; border-radius:17px; background:#e8ede8; } .ugc-simple-card small { color:var(--ugc-orange); font-size:8px; font-weight:700; text-transform:uppercase; } .ugc-simple-card h3 { margin:10px 0 0; color:var(--ugc-green); font-size:16px; line-height:1.1; } .ugc-simple-card:hover { background:var(--ugc-green-soft); }
        .ugc-footer { display:flex; align-items:flex-start; justify-content:space-between; margin-top:68px; padding:38px 0 0; border-top:1px solid #dce1dc; } .ugc-footer-brand { max-width:280px; } .ugc-footer-brand p { margin:12px 0 0; color:var(--ugc-muted); font-size:10px; line-height:1.5; } .ugc-footer-links { display:flex; gap:65px; } .ugc-footer-column { display:flex; flex-direction:column; gap:9px; } .ugc-footer-column strong { margin-bottom:4px; color:var(--ugc-green); font-size:10px; } .ugc-footer-column a { color:#73807b; font-size:9px; transition:color .2s; } .ugc-footer-column a:hover { color:var(--ugc-green); } .ugc-copyright { margin-top:38px; padding:17px 0 5px; border-top:1px solid #e0e3df; color:#929b97; font-size:8px; }
        @media (max-width:900px) { .ugc-journal-page { padding:30px 20px; } .ugc-header { padding:0 30px; } .ugc-main { padding-left:30px; padding-right:30px; } .ugc-nav { gap:18px; margin-right:0; } .ugc-header-action { display:none; } .ugc-featured { grid-template-columns:1fr; } .ugc-featured-copy { min-height:290px; } .ugc-featured-art { min-height:270px; } } @media (max-width:680px) { .ugc-journal-page { padding:0; background:var(--ugc-cream); } .ugc-website { min-height:100vh; border:0; border-radius:0; box-shadow:none; } .ugc-header { height:72px; padding:0 22px; } .ugc-nav { display:none; } .ugc-main { padding:10px 22px 45px; } .ugc-page-title { margin:15px 0 19px; font-size:40px; } .ugc-featured { border-radius:20px; } .ugc-featured-copy { min-height:285px; padding:32px 27px; } .ugc-featured-title { font-size:34px; } .ugc-featured-art { min-height:250px; } .ugc-articles { grid-template-columns:1fr; gap:28px; } .ugc-article-image { height:220px; border-radius:16px; } .ugc-article-title { font-size:17px; } .ugc-article-meta,.ugc-author { font-size:8px; } .ugc-more-grid { grid-template-columns:1fr; } .ugc-footer { flex-direction:column; gap:35px; } .ugc-footer-links { width:100%; justify-content:space-between; gap:20px; } } @media (max-width:420px) { .ugc-featured-copy { min-height:300px; } .ugc-featured-title { font-size:31px; } .ugc-article-image { height:195px; } }
        .ugc-journal-page { padding:24px 5vw; }
        .ugc-main { padding:4px 54px 42px; }
        .ugc-page-title { margin-bottom:16px; }
        .ugc-categories { margin-bottom:16px; }
        .ugc-featured { display:block; min-height:260px; }
        .ugc-featured-copy { min-height:260px; padding:34px 39px; }
        .ugc-featured-art { display:none; }
        .ugc-articles { margin-top:18px; gap:16px; }
        .ugc-more { margin-top:40px; padding-top:24px; }
        .ugc-more-grid { gap:16px; }
        .ugc-simple-card { padding:0; overflow:hidden; }
        .ugc-simple-card-body { padding:16px 18px 19px; }
        .ugc-footer { margin-top:40px; padding-top:24px; }
        .ugc-copyright { margin-top:24px; }
        @media (max-width:680px) { .ugc-journal-page { padding:0; } .ugc-header { height:64px; } .ugc-main { padding:8px 22px 32px; } .ugc-page-title { margin:8px 0 14px; } .ugc-featured-copy { min-height:260px; padding:28px 27px; } .ugc-more-grid { grid-template-columns:1fr; } }
      `}</style>
      <div className="ugc-website">
        <header className="ugc-header">
          <Link to="/" className="ugc-logo"><span className="ugc-logo-mark" />{get('brandName')}</Link>
          <nav className="ugc-nav" aria-label="Journal navigation">
            <a href="#ugc-journal-content">Guidelines</a>
            <Link to="/campus-master-planning">Campus Planning</Link>
            <Link to="/tech-infra">Technology</Link>
            <Link to="/resources">Resources</Link>
          </nav>
          <Link to={get('headerActionHref') || '/solutions'} className="ugc-header-action">
            {get('headerActionLabel') || 'Explore Campus Solutions'}
          </Link>
        </header>
        <main id="ugc-journal-content" className="ugc-main"><h1 className="ugc-page-title">{get('pageTitle')}</h1><div className="ugc-categories" role="tablist">{categories.map(category => <button type="button" key={category} className={`ugc-category ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
          <Link to={`/ugc-guidelines/${featured.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="ugc-featured"><div className="ugc-featured-copy"><div className="ugc-eyebrow">{featured.eyebrow}</div><h2 className="ugc-featured-title">{featured.title}</h2><p className="ugc-featured-description">{featured.description}</p><span className="ugc-read-link"><span>→</span>{featured.readMoreLabel}</span></div></Link>
          <section className="ugc-articles" aria-label="Latest digital campus guidance">{visibleCards.map((card, index) => <Link to={`/ugc-guidelines/${card.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="ugc-article-card" key={`${card.title}-${index}`}><div className="ugc-article-image"><img src={resolveMediaUrl(card.image)} alt={card.title} loading="lazy" /></div><div className="ugc-article-meta"><span className="ugc-article-category">{card.category}</span><span>{card.readTime}</span></div><h3 className="ugc-article-title">{card.title}</h3><div className="ugc-author"><span className="ugc-avatar">{card.authorImage && <img src={resolveMediaUrl(card.authorImage)} alt="" />}</span><span>{card.author || 'CampusMart Team'}</span></div></Link>)}</section>
          <section className="ugc-more"><h2 className="ugc-more-heading">{get('moreTitle')}</h2><div className="ugc-more-grid">{(data.moreCards?.length ? data.moreCards : DEFAULTS.moreCards).map((card: MoreCard, index: number) => <Link to={`/ugc-guidelines/${card.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="ugc-simple-card" key={`${card.title}-${index}`}><div className="ugc-simple-card-body"><small>{card.category}</small><h3>{card.title}</h3></div></Link>)}</div></section>
          <footer className="ugc-footer"><div className="ugc-footer-brand"><Link to="/" className="ugc-logo"><span className="ugc-logo-mark" />{get('brandName')}</Link><p>{get('footerDescription')}</p></div><div className="ugc-footer-links">{(data.footerColumns?.length ? data.footerColumns : DEFAULTS.footerColumns).map((column: { title: string; links: string[] }) => <div className="ugc-footer-column" key={column.title}><strong>{column.title}</strong>{column.links.map(link => { const target = resolveJournalFooterUrl(link); return target.isExternal && target.href ? <a key={link} href={target.href} target="_blank" rel="noopener noreferrer">{link}</a> : <Link key={link} to={target.to || '/'}>{link}</Link>; })}</div>)}</div></footer><div className="ugc-copyright">{get('copyright')}</div>
        </main>
      </div>
    </main>
  );
};

export default UGCGuidelines;