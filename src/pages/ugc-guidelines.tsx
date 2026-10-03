import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import MediaImage from '@/components/ui/media-image';

type Article = { title: string; description?: string; category: string; readTime: string; image: string; href?: string; author?: string; authorImage?: string };
type MoreCard = { title: string; category: string; href?: string; image?: string; description?: string };

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
    { category: 'Digital Campus', readTime: '5 min read', title: 'What a connected campus needs before launch', description: 'A clear checklist for infrastructure, systems and teams preparing for a more connected institution.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', author: 'CampusMart Team', authorImage: '', href: '/tech-infra' },
    { category: 'Governance', readTime: '6 min read', title: 'Make student data privacy part of the design', description: 'Build trust into campus technology with practical privacy and access decisions from day one.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=85', author: 'CampusMart Team', authorImage: '', href: '/services' },
    { category: 'Student Experience', readTime: '4 min read', title: 'Digital services that keep students moving', description: 'Thoughtful digital touchpoints can make everyday campus journeys simpler and more inclusive.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85', author: 'CampusMart Team', authorImage: '', href: '/campus-automation' },
  ] as Article[],
  moreTitle: 'More campus resources',
  moreCards: [
    { category: 'Campus planning', title: 'Plan spaces around the way students learn', description: 'Shape learning environments around real student journeys.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=85', href: '/campus-master-planning' },
    { category: 'Operations', title: 'Spend less time on manual campus work', description: 'Connect everyday workflows so staff can focus on students.', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85', href: '/campus-automation' },
    { category: 'Technology', title: 'Choose tools that help teams do more', description: 'Build a practical digital foundation for your institution.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', href: '/digital-transformation' },
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
  const categories: string[] = Array.isArray(data.categories) ? data.categories : DEFAULTS.categories;
  const cards: Article[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const featured = { ...DEFAULTS.featured, ...(data.featured ?? {}) };
  const visibleCards = useMemo(() => selectedCategory === categories[0] ? cards : cards.filter(card => card.category === selectedCategory), [cards, categories, selectedCategory]);

  return (
    <main className="ugc-journal-page">
      <style>{`
        .ugc-journal-page {
          --ugc-cream: #f5f4ef;
          --ugc-paper: #f8f8f4;
          --ugc-green: #155b51;
          --ugc-green-dark: #124d46;
          --ugc-green-soft: #dfe9e4;
          --ugc-orange: #f47b20;
          --ugc-blue: #8ca8d9;
          --ugc-text: #173e39;
          --ugc-muted: #5e6b66;
          background: var(--ugc-cream);
          color: var(--ugc-text);
          font-family: "DM Sans", "Open Sans", sans-serif;
          min-height: 100vh;
          padding: 16px 3vw;
        }
        .ugc-journal-page *, .ugc-journal-page *::before, .ugc-journal-page *::after { box-sizing: border-box; }
        .ugc-journal-page a { color: inherit; text-decoration: none; }
        .ugc-journal-page img { display: block; width: 100%; }

        .ugc-website {
          position: relative;
          width: min(1160px, 100%);
          overflow: hidden;
          margin: auto;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          background: var(--ugc-paper);
          box-shadow: 0 16px 45px rgba(14, 35, 30, 0.1);
        }

        .ugc-header {
          position: relative;
          z-index: 2;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 36px;
        }
        .ugc-logo { display: flex; align-items: center; gap: 8px; color: var(--ugc-text); font-size: 15px; font-weight: 700; letter-spacing: -0.5px; }
        .ugc-logo-mark { position: relative; width: 22px; height: 22px; border: 2px solid var(--ugc-orange); border-radius: 50%; }
        .ugc-logo-mark::before { content: ""; position: absolute; width: 8px; height: 8px; top: 5px; left: 5px; border-radius: 50%; background: var(--ugc-orange); }
        .ugc-logo-mark::after { content: ""; position: absolute; right: -4px; bottom: 3px; width: 10px; height: 2px; background: var(--ugc-green); transform: rotate(-40deg); }

        .ugc-nav { display: flex; align-items: center; gap: 28px; margin-right: 28px; }
        .ugc-nav a { position: relative; color: #45615c; font-size: 13px; font-weight: 600; }
        .ugc-nav a:hover { color: var(--ugc-green); }

        .ugc-header-action { display: inline-block; border: 1px solid #d6ddd8; border-radius: 20px; padding: 7px 15px; color: var(--ugc-green); background: rgba(255, 255, 255, 0.75); font-size: 12px; font-weight: 700; transition: all 0.2s ease; }
        .ugc-header-action:hover { background: var(--ugc-green); color: #fff; }

        .ugc-main { padding: 4px 36px 28px; }
        .ugc-page-title { margin: 0 0 14px; color: var(--ugc-green); font-size: clamp(30px, 3.5vw, 44px); line-height: 1.05; letter-spacing: -1.2px; font-weight: 700; }

        .ugc-categories { width: min(690px, 100%); min-height: 38px; display: flex; align-items: center; gap: 4px; overflow-x: auto; scrollbar-width: none; margin-bottom: 18px; padding: 4px 8px; border-radius: 30px; background: var(--ugc-green); }
        .ugc-categories::-webkit-scrollbar { display: none; }
        .ugc-category { flex: 0 0 auto; border: 0; border-radius: 20px; padding: 6px 14px; background: transparent; color: rgba(255, 255, 255, 0.78); cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease; }
        .ugc-category:hover, .ugc-category.active { background: rgba(255, 255, 255, 0.2); color: #fff; }

        /* Featured article card */
        .ugc-featured { display: grid; grid-template-columns: 1.15fr 0.85fr; overflow: hidden; border-radius: 18px; background: var(--ugc-green); min-height: 270px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .ugc-featured:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(21, 91, 81, 0.16); }
        .ugc-featured-copy { position: relative; display: flex; flex-direction: column; justify-content: center; padding: 28px 32px; color: #fff; }
        .ugc-eyebrow { margin-bottom: 10px; color: #a3c9c1; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .ugc-featured-title { max-width: 480px; margin: 0; font-size: clamp(22px, 2.6vw, 34px); line-height: 1.18; letter-spacing: -0.8px; font-weight: 700; }
        .ugc-featured-description { max-width: 460px; margin: 12px 0 18px; color: rgba(255, 255, 255, 0.9); font-size: clamp(14px, 1.2vw, 15px); line-height: 1.6; }
        .ugc-read-link { display: inline-flex; align-items: center; gap: 8px; width: max-content; color: #fff; font-size: 13px; font-weight: 700; }
        .ugc-read-link span { display: grid; width: 22px; height: 22px; place-items: center; border-radius: 50%; background: var(--ugc-orange); transition: transform 0.2s ease; font-size: 13px; }
        .ugc-featured:hover .ugc-read-link span { transform: translateX(4px); }
        .ugc-featured-art { min-height: 270px; overflow: hidden; background: var(--ugc-green-soft); position: relative; }
        .ugc-featured-art img { width: 100%; height: 100%; object-fit: cover; }

        /* Articles list */
        .ugc-articles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 20px; }
        .ugc-article-card { min-width: 0; display: flex; flex-direction: column; background: #fff; border: 1px solid #e2eae5; border-radius: 16px; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .ugc-article-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(21, 91, 81, 0.08); }
        .ugc-article-image { height: 175px; width: 100%; overflow: hidden; background: #d9ded8; }
        .ugc-article-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .ugc-article-card:hover .ugc-article-image img { transform: scale(1.04); }
        .ugc-article-content { padding: 14px 16px 16px; display: flex; flex-direction: column; flex: 1; }
        .ugc-article-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; color: #6e7e78; font-size: 11px; font-weight: 600; }
        .ugc-article-category { color: var(--ugc-orange); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; }
        .ugc-article-title { margin: 0 0 6px; color: var(--ugc-green); font-size: 16px; line-height: 1.3; letter-spacing: -0.3px; font-weight: 700; }
        .ugc-article-desc { margin: 0 0 12px; color: #50615b; font-size: 13px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
        .ugc-author { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid #eef3f0; color: #5a6b65; font-size: 12px; font-weight: 600; }
        .ugc-avatar { width: 22px; height: 22px; flex: 0 0 22px; overflow: hidden; border-radius: 50%; background: #c2ccc6; display: grid; place-items: center; font-size: 10px; color: #155b51; font-weight: 700; }

        /* More section */
        .ugc-more { margin-top: 32px; padding-top: 20px; border-top: 1px solid #dce1dc; }
        .ugc-more-heading { margin: 0 0 16px; color: var(--ugc-green); font-size: 22px; letter-spacing: -0.4px; font-weight: 700; }
        .ugc-more-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ugc-simple-card { display: flex; flex-direction: column; border-radius: 14px; background: #eef3ef; overflow: hidden; transition: all 0.2s ease; border: 1px solid #dce5df; }
        .ugc-simple-card:hover { background: #e3ede6; transform: translateY(-2px); }
        .ugc-simple-card-image { height: 120px; width: 100%; overflow: hidden; background: #d9ded8; }
        .ugc-simple-card-image img { width: 100%; height: 100%; object-fit: cover; }
        .ugc-simple-card-body { padding: 12px 14px 14px; flex: 1; }
        .ugc-simple-card small { color: var(--ugc-orange); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 3px; }
        .ugc-simple-card h3 { margin: 0 0 4px; color: var(--ugc-green); font-size: 15px; font-weight: 700; line-height: 1.25; }
        .ugc-simple-card-desc { margin: 0; color: #50615b; font-size: 13px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Footer */
        .ugc-footer { display: flex; align-items: flex-start; justify-content: space-between; margin-top: 32px; padding: 20px 0 0; border-top: 1px solid #dce1dc; }
        .ugc-footer-brand { max-width: 300px; }
        .ugc-footer-brand p { margin: 8px 0 0; color: var(--ugc-muted); font-size: 13px; line-height: 1.5; }
        .ugc-footer-links { display: flex; gap: 52px; }
        .ugc-footer-column { display: flex; flex-direction: column; gap: 7px; }
        .ugc-footer-column strong { margin-bottom: 2px; color: var(--ugc-green); font-size: 13px; font-weight: 700; }
        .ugc-footer-column a { color: #5a6d67; font-size: 12px; transition: color 0.2s; }
        .ugc-footer-column a:hover { color: var(--ugc-green); }
        .ugc-copyright { margin-top: 20px; padding: 12px 0 4px; border-top: 1px solid #e0e3df; color: #828f89; font-size: 11px; }

        /* Responsive overrides */
        @media (max-width: 900px) {
          .ugc-journal-page { padding: 14px 16px; }
          .ugc-header { padding: 0 20px; }
          .ugc-main { padding: 4px 20px 24px; }
          .ugc-nav { gap: 16px; margin-right: 0; }
          .ugc-header-action { display: none; }
          .ugc-featured { grid-template-columns: 1fr; }
          .ugc-featured-art { min-height: 200px; max-height: 240px; }
        }
        @media (max-width: 680px) {
          .ugc-journal-page { padding: 0; }
          .ugc-website { border-radius: 0; border: 0; box-shadow: none; }
          .ugc-header { height: 58px; padding: 0 16px; }
          .ugc-nav { display: none; }
          .ugc-main { padding: 6px 16px 20px; }
          .ugc-page-title { margin-bottom: 10px; font-size: 28px; }
          .ugc-featured { border-radius: 14px; }
          .ugc-featured-copy { padding: 20px 16px; }
          .ugc-articles { grid-template-columns: 1fr; gap: 14px; }
          .ugc-more-grid { grid-template-columns: 1fr; gap: 12px; }
          .ugc-footer { flex-direction: column; gap: 20px; }
          .ugc-footer-links { width: 100%; justify-content: space-between; gap: 14px; }
        }
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
        <main id="ugc-journal-content" className="ugc-main">
          <h1 className="ugc-page-title">{get('pageTitle')}</h1>
          <div className="ugc-categories" role="tablist">
            {categories.map(category => (
              <button
                type="button"
                key={category}
                className={`ugc-category ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <Link to={`/ugc-guidelines/${slugify(featured.title)}`} className="ugc-featured">
            <div className="ugc-featured-copy">
              <div className="ugc-eyebrow">{featured.eyebrow}</div>
              <h2 className="ugc-featured-title">{featured.title}</h2>
              <p className="ugc-featured-description">{featured.description}</p>
              <span className="ugc-read-link"><span>→</span>{featured.readMoreLabel || 'Read the guidance'}</span>
            </div>
            {featured.image && (
              <div className="ugc-featured-art">
                <MediaImage src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
              </div>
            )}
          </Link>

          <section className="ugc-articles" aria-label="Latest digital campus guidance">
            {visibleCards.map((card, index) => (
              <Link to={`/ugc-guidelines/${slugify(card.title)}`} className="ugc-article-card" key={`${card.title}-${index}`}>
                <div className="ugc-article-image">
                  <MediaImage src={card.image} alt={card.title} className="w-full h-full object-cover" />
                </div>
                <div className="ugc-article-content">
                  <div className="ugc-article-meta">
                    <span className="ugc-article-category">{card.category}</span>
                    <span>{card.readTime}</span>
                  </div>
                  <h3 className="ugc-article-title">{card.title}</h3>
                  {card.description && <p className="ugc-article-desc">{card.description}</p>}
                  <div className="ugc-author">
                    <span className="ugc-avatar">
                      {card.authorImage ? (
                        <MediaImage
                          src={card.authorImage}
                          alt={card.author || ''}
                          className="w-full h-full object-cover rounded-full"
                          fallbackNode={<span>{(card.author || 'CM').charAt(0)}</span>}
                        />
                      ) : (
                        <span>{(card.author || 'CM').charAt(0)}</span>
                      )}
                    </span>
                    <span>{card.author || 'CampusMart Team'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <section className="ugc-more">
            <h2 className="ugc-more-heading">{get('moreTitle')}</h2>
            <div className="ugc-more-grid">
              {(Array.isArray(data.moreCards) ? data.moreCards : DEFAULTS.moreCards).map((card: MoreCard, index: number) => (
                <Link to={`/ugc-guidelines/${slugify(card.title)}`} className="ugc-simple-card" key={`${card.title}-${index}`}>
                  {card.image && (
                    <div className="ugc-simple-card-image">
                      <MediaImage src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="ugc-simple-card-body">
                    <small>{card.category}</small>
                    <h3>{card.title}</h3>
                    {card.description && <p className="ugc-simple-card-desc">{card.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <footer className="ugc-footer">
            <div className="ugc-footer-brand">
              <Link to="/" className="ugc-logo"><span className="ugc-logo-mark" />{get('brandName')}</Link>
              <p>{get('footerDescription')}</p>
            </div>
            <div className="ugc-footer-links">
              {(Array.isArray(data.footerColumns) ? data.footerColumns : DEFAULTS.footerColumns).map((column: { title: string; links: string[] }) => (
                <div className="ugc-footer-column" key={column.title}>
                  <strong>{column.title}</strong>
                  {column.links.map(link => {
                    const target = resolveJournalFooterUrl(link);
                    return target.isExternal && target.href ? (
                      <a key={link} href={target.href} target="_blank" rel="noopener noreferrer">{link}</a>
                    ) : (
                      <Link key={link} to={target.to || '/'}>{link}</Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </footer>
          <div className="ugc-copyright">{get('copyright')}</div>
        </main>
      </div>
    </main>
  );
};

export default UGCGuidelines;