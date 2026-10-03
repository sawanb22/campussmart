import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';

export type Article = { title: string; description: string; category: string; readTime: string; image: string };

export const DEFAULTS = {
  sectionLabel: 'Explore the guide',
  sectionTitle: 'AI, your way.',
  sectionDescription: 'Helpful perspectives for leaders, faculty and teams shaping the next generation of learning environments.',
  featured: {
    category: 'Featured · Strategy',
    title: 'Where should your campus begin with AI?',
    description: 'A thoughtful starting point can turn a complex technology decision into a sequence of useful, measurable steps for your institution.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
  },
  filters: ['All', 'Strategy', 'Learning', 'Operations', 'People'],
  cards: [
    { category: 'Learning', title: 'Design an AI-ready learning space', description: 'The practical ingredients that help students experiment, collaborate and build confidence with emerging tools.', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=85' },
    { category: 'Operations', title: 'Start with the campus problems worth solving', description: 'A focused way to find high-value opportunities for automation without losing the human side of campus life.', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=85' },
    { category: 'People', title: 'Help faculty lead the change', description: 'Build the trust, skills and shared language teams need before introducing AI into everyday work.', readTime: '4 min read', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=85' },
    { category: 'Strategy', title: 'A simple roadmap for responsible AI', description: 'Move from first conversation to pilot project with governance that is useful rather than intimidating.', readTime: '7 min read', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=85' },
    { category: 'Learning', title: 'Make AI literacy part of campus culture', description: 'Small, consistent learning moments can make new technology feel accessible across every department.', readTime: '4 min read', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=85' },
    { category: 'Operations', title: 'Measure what better looks like', description: 'Choose signals that show whether a new digital tool is improving learning, time and experience on campus.', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85' },
  ] as Article[],
  latestTitle: 'Latest insights',
  viewAllLabel: 'View all',
  readMoreLabel: 'Read article',
  newsletterLabel: 'Stay curious',
  newsletterTitle: 'Good ideas, occasionally.',
  newsletterDescription: 'Get useful campus technology ideas, new guides and practical stories delivered to your inbox. No noise, just things worth reading.',
  newsletterPlaceholder: 'Your email address',
  newsletterButtonLabel: 'Subscribe',
};

const AIGuide = () => {
  const { data } = usePageData<any>('ai-guide');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [subscribed, setSubscribed] = useState(false);
  const value = (key: string) => data[key] ?? DEFAULTS[key as keyof typeof DEFAULTS];
  const featured = { ...DEFAULTS.featured, ...(data.featured ?? {}) };
  const cards: Article[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const filters: string[] = Array.isArray(data.filters) ? data.filters : DEFAULTS.filters;
  const visibleCards = useMemo(() => selectedFilter === 'All' ? cards : cards.filter(card => card.category?.toLowerCase() === selectedFilter.toLowerCase()), [cards, selectedFilter]);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubscribed(true); event.currentTarget.reset(); };
  const articleSlug = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <main className="ai-guide-page">
      <style>{`
        .ai-guide-page { --ai-cream:#f1e5c4; --ai-orange:#ed9816; --ai-brown:#89614d; --ai-dark:#3c2f26; --ai-teal:#54a4a0; --ai-blue:#3d718f; --ai-white:#fffdf8; background:#faf8f0; color:var(--ai-dark); font-family:"DM Sans", "Open Sans", sans-serif; }
        .ai-guide-page *, .ai-guide-page *::before, .ai-guide-page *::after { box-sizing:border-box; }
        .ai-guide-page img { width:100%; display:block; } .ai-guide-page button,.ai-guide-page input { font:inherit; }
        .ai-guide-hero { min-height:360px; background:var(--ai-cream); border-bottom:1px solid rgba(60,47,38,.12); overflow:hidden; position:relative; }
        .ai-guide-hero-inner { max-width:1240px; min-height:360px; margin:auto; padding:40px 60px 36px; display:flex; align-items:center; position:relative; }
        .ai-guide-hero-copy { width:57%; position:relative; z-index:2; } .ai-guide-label { display:inline-flex; align-items:center; gap:8px; margin-bottom:12px; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ai-brown); } .ai-guide-label::before { content:""; width:20px; height:2px; background:var(--ai-orange); }
        .ai-guide-hero h1 { max-width:650px; margin:0 0 16px; font-family:"Playfair Display",Georgia,serif; font-size:clamp(40px,5.2vw,70px); font-weight:500; line-height:.96; letter-spacing:-.055em; } .ai-guide-hero p { max-width:480px; color:#594d45; font-size:15px; line-height:1.6; }
        .ai-guide-sun { position:absolute; width:300px; height:300px; right:90px; bottom:-90px; border-radius:50%; background:var(--ai-orange); } .ai-guide-person { position:absolute; right:145px; bottom:0; width:205px; height:285px; z-index:1; } .ai-guide-person::before { content:""; position:absolute; width:81px; height:83px; top:4px; left:62px; border-radius:52% 48% 35% 40%; background:var(--ai-dark); } .ai-guide-person::after { content:""; position:absolute; width:143px; height:174px; left:31px; top:103px; border-radius:60px 60px 0 0; background:var(--ai-teal); } .ai-guide-face { position:absolute; width:73px; height:78px; top:19px; left:68px; z-index:1; border-radius:48% 48% 45% 45%; background:#c9936f; } .ai-guide-star { position:absolute; right:65px; top:58px; z-index:2; color:var(--ai-blue); font-size:27px; }
        .ai-guide-content { max-width:1240px; margin:auto; padding:28px 48px 40px; background:var(--ai-white); } .ai-guide-section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:20px; } .ai-guide-section-heading h2 { margin:0; font-family:"Playfair Display",Georgia,serif; font-size:clamp(30px,3.5vw,40px); font-weight:500; letter-spacing:-.04em; } .ai-guide-section-heading p { max-width:520px; margin:0; color:#594d45; font-size:15px; line-height:1.6; text-align:right; }
        .ai-guide-filters { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; } .ai-guide-filter { border:1px solid rgba(60,47,38,.18); border-radius:30px; padding:6px 15px; color:var(--ai-dark); background:transparent; cursor:pointer; font-size:12px; font-weight:600; transition:all .2s ease; } .ai-guide-filter.active,.ai-guide-filter:hover { border-color:var(--ai-dark); background:var(--ai-dark); color:#fff; }
        .ai-guide-featured,.ai-guide-card { color:inherit; text-decoration:none; } .ai-guide-featured { display:grid; grid-template-columns:1.22fr .78fr; min-height:300px; margin-bottom:28px; overflow:hidden; border-radius:10px; background:#dce9e5; transition:transform .2s ease,box-shadow .2s ease; } .ai-guide-featured:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(60,47,38,.1); } .ai-guide-featured-image { min-height:300px; overflow:hidden; background:var(--ai-teal); } .ai-guide-featured-image img { height:100%; object-fit:cover; transition:transform .6s ease; } .ai-guide-featured:hover img { transform:scale(1.03); } .ai-guide-featured-copy { display:flex; flex-direction:column; justify-content:center; padding:32px 34px; } .ai-guide-category { margin-bottom:10px; color:var(--ai-orange); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; } .ai-guide-featured-copy h3 { margin:0 0 12px; font-family:"Playfair Display",Georgia,serif; font-size:clamp(22px,2.5vw,30px); font-weight:500; line-height:1.15; letter-spacing:-.03em; } .ai-guide-featured-copy p { margin:0 0 18px; color:#594d45; font-size:15px; line-height:1.6; } .ai-guide-read-more { display:inline-flex; align-items:center; gap:8px; width:max-content; border-bottom:1px solid var(--ai-dark); padding-bottom:3px; font-size:13px; font-weight:700; } .ai-guide-read-more svg { transition:transform .2s ease; } .ai-guide-read-more:hover svg { transform:translateX(4px); }
        .ai-guide-articles-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; } .ai-guide-articles-heading h3 { margin:0; font-family:"Playfair Display",Georgia,serif; font-size:24px; font-weight:500; } .ai-guide-view-all { font-size:12px; font-weight:700; } .ai-guide-articles { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; } .ai-guide-card { overflow:hidden; border-radius:8px; background:#f7f2e7; transition:transform .25s ease,box-shadow .25s ease; display:flex; flex-direction:column; } .ai-guide-card:hover { transform:translateY(-4px); box-shadow:0 12px 25px rgba(60,47,38,.1); } .ai-guide-card-image { height:180px; overflow:hidden; } .ai-guide-card-image img { height:100%; object-fit:cover; transition:transform .5s ease; } .ai-guide-card:hover img { transform:scale(1.04); } .ai-guide-card-body { padding:16px 18px 18px; flex:1; display:flex; flex-direction:column; } .ai-guide-card-body h4 { margin:0 0 8px; font-family:"Playfair Display",Georgia,serif; font-size:18px; font-weight:500; line-height:1.25; letter-spacing:-.02em; } .ai-guide-card-body p { margin:0 0 14px; color:#594d45; font-size:13px; line-height:1.55; flex:1; } .ai-guide-card-meta { display:flex; align-items:center; justify-content:space-between; color:#786c62; font-size:11px; margin-top:auto; padding-top:10px; border-top:1px solid rgba(60,47,38,.1); } .ai-guide-card-meta strong { color:var(--ai-brown); font-weight:700; letter-spacing:.06em; text-transform:uppercase; font-size:11px; }
        .ai-guide-newsletter { display:flex; align-items:center; justify-content:space-between; gap:36px; margin-top:36px; overflow:hidden; position:relative; border-radius:9px; padding:28px 36px; background:var(--ai-dark); color:#fff; } .ai-guide-newsletter-copy { position:relative; z-index:1; } .ai-guide-newsletter .ai-guide-category { color:var(--ai-cream); } .ai-guide-newsletter h3 { margin:0 0 8px; font-family:"Playfair Display",Georgia,serif; font-size:28px; font-weight:500; line-height:1.15; } .ai-guide-newsletter p { max-width:440px; margin:0; color:rgba(255,255,255,.82); font-size:13px; line-height:1.6; } .ai-guide-newsletter-form { display:flex; width:360px; position:relative; z-index:1; } .ai-guide-newsletter-form input { flex:1; height:42px; border:0; border-radius:4px 0 0 4px; padding:0 14px; outline:0; font-size:13px; } .ai-guide-newsletter-form button { width:95px; border:0; border-radius:0 4px 4px 0; background:var(--ai-orange); color:#fff; cursor:pointer; font-size:13px; font-weight:700; }
        @media (max-width:760px) { .ai-guide-hero,.ai-guide-hero-inner { min-height:420px; } .ai-guide-hero-inner { align-items:flex-start; padding:36px 20px; } .ai-guide-hero-copy { width:100%; } .ai-guide-hero h1 { font-size:42px; } .ai-guide-content { padding:24px 16px 36px; } .ai-guide-section-heading { display:block; } .ai-guide-section-heading h2 { margin-bottom:8px; font-size:30px; } .ai-guide-section-heading p { text-align:left; font-size:14px; } .ai-guide-featured { grid-template-columns:1fr; } .ai-guide-featured-image { min-height:220px; } .ai-guide-featured-copy { padding:24px 20px; } .ai-guide-articles { grid-template-columns:1fr; gap:16px; } .ai-guide-card-image { height:200px; } .ai-guide-newsletter { display:block; padding:26px 20px; } .ai-guide-newsletter-form { width:100%; margin-top:20px; } } @media (max-width:420px) { .ai-guide-hero h1 { font-size:36px; } .ai-guide-newsletter-form { display:block; } .ai-guide-newsletter-form input,.ai-guide-newsletter-form button { width:100%; height:40px; border-radius:4px; } .ai-guide-newsletter-form button { margin-top:8px; } }
      `}</style>
      <section className="ai-guide-content">
        <div className="ai-guide-section-heading">
          <div>
            <div className="ai-guide-label">{value('sectionLabel')}</div>
            <h2>{value('sectionTitle')}</h2>
          </div>
          <p>{value('sectionDescription')}</p>
        </div>
        <div className="ai-guide-filters" aria-label="Filter articles">
          {filters.map(filter => (
            <button
              key={filter}
              className={`ai-guide-filter ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <Link to={`/ai-guide/${articleSlug(featured.title)}`} className="ai-guide-featured">
          <div className="ai-guide-featured-image">
            <MediaImage src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
          </div>
          <div className="ai-guide-featured-copy">
            <div className="ai-guide-category">{featured.category}</div>
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
            <span className="ai-guide-read-more">{value('readMoreLabel')} <ArrowRight size={13} /></span>
          </div>
        </Link>
        <div className="ai-guide-articles-heading">
          <h3>{value('latestTitle')}</h3>
          <a href="#ai-guide-articles" className="ai-guide-view-all">
            {value('viewAllLabel')} <ArrowRight size={11} className="inline" />
          </a>
        </div>
        <div id="ai-guide-articles" className="ai-guide-articles">
          {visibleCards.map((card, index) => (
            <Link to={`/ai-guide/${articleSlug(card.title)}`} className="ai-guide-card" key={`${card.title}-${index}`}>
              <div className="ai-guide-card-image">
                <MediaImage src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
              <div className="ai-guide-card-body">
                <div className="ai-guide-category">{card.category}</div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
                <div className="ai-guide-card-meta">
                  <strong>{card.category}</strong>
                  <span>{card.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <section className="ai-guide-newsletter">
          <div className="ai-guide-newsletter-copy">
            <div className="ai-guide-category">{value('newsletterLabel')}</div>
            <h3>{value('newsletterTitle')}</h3>
            <p>{value('newsletterDescription')}</p>
          </div>
          <form className="ai-guide-newsletter-form" onSubmit={handleSubscribe}>
            <input type="email" placeholder={value('newsletterPlaceholder')} aria-label={value('newsletterPlaceholder')} required />
            <button type="submit">{subscribed ? 'Subscribed' : value('newsletterButtonLabel')}</button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default AIGuide;