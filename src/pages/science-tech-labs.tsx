import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Check, Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import {
  SCIENCE_TECH_LABS_PAGE_SLUG,
  SCIENCE_TECH_LABS_DEFAULTS,
  slugifyScienceLabTitle,
  type ScienceTechLabsCard,
} from './science-tech-labs.data';

const ScienceTechLabs = () => {
  const { data, loading } = usePageData<any>(SCIENCE_TECH_LABS_PAGE_SLUG);
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } =
    useDesignWishlist('science-tech-labs');

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [subscribed, setSubscribed] = useState(false);

  const value = (key: string) => data[key] ?? SCIENCE_TECH_LABS_DEFAULTS[key as keyof typeof SCIENCE_TECH_LABS_DEFAULTS];

  const featured = {
    ...SCIENCE_TECH_LABS_DEFAULTS.featured,
    ...(data.featured ?? {}),
  };

  const rawCards: ScienceTechLabsCard[] = Array.isArray(data.cards) && data.cards.length > 0
    ? data.cards
    : SCIENCE_TECH_LABS_DEFAULTS.cards;

  const filters: string[] = Array.isArray(data.filters) && data.filters.length > 0
    ? data.filters
    : SCIENCE_TECH_LABS_DEFAULTS.filters;

  // Filter cards based on selectedFilter
  const visibleCards = useMemo(() => {
    if (selectedFilter === 'All') return rawCards;
    const filterLower = selectedFilter.toLowerCase();
    return rawCards.filter((card) => {
      const cardCat = card.category?.toLowerCase();
      const cardCats = (card.categories || []).map((c) => c.toLowerCase());
      return cardCat === filterLower || cardCats.includes(filterLower);
    });
  }, [rawCards, selectedFilter]);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
    event.currentTarget.reset();
  };

  const cardTarget = (card: ScienceTechLabsCard) =>
    card.href?.trim() || `/${SCIENCE_TECH_LABS_PAGE_SLUG}/${card.slug?.trim() || slugifyScienceLabTitle(card.title)}`;

  const featuredTarget = featured.href?.trim() || `/${SCIENCE_TECH_LABS_PAGE_SLUG}/${featured.slug?.trim() || slugifyScienceLabTitle(featured.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

  return (
    <main className="ai-guide-page science-tech-labs-page">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <style>{`
        .science-tech-labs-page {
          --ai-cream: #f4efe6;
          --ai-orange: #d97706;
          --ai-brown: #78350f;
          --ai-dark: #1e293b;
          --ai-teal: #0d9488;
          --ai-blue: #0284c7;
          --ai-white: #ffffff;
          background: #faf8f5;
          color: var(--ai-dark);
          font-family: "DM Sans", "Open Sans", system-ui, sans-serif;
          min-height: 100vh;
        }
        .science-tech-labs-page *, .science-tech-labs-page *::before, .science-tech-labs-page *::after {
          box-sizing: border-box;
        }
        .science-tech-labs-page img {
          width: 100%;
          display: block;
        }
        .science-tech-labs-page button, .science-tech-labs-page input {
          font: inherit;
        }
        .science-tech-content {
          max-width: 1240px;
          margin: auto;
          padding: 36px 32px 56px;
          background: var(--ai-white);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(30, 41, 59, 0.03);
        }
        .science-tech-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(30, 41, 59, 0.08);
        }
        .science-tech-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--ai-teal);
        }
        .science-tech-label::before {
          content: "";
          width: 22px;
          height: 2px;
          background: var(--ai-teal);
        }
        .science-tech-section-heading h1 {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(32px, 3.8vw, 44px);
          font-weight: 600;
          letter-spacing: -.03em;
          color: var(--ai-dark);
          line-height: 1.1;
        }
        .science-tech-section-heading p {
          max-width: 520px;
          margin: 0;
          color: #475569;
          font-size: 15px;
          line-height: 1.6;
          text-align: right;
        }
        .science-tech-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 26px;
        }
        .science-tech-filter {
          border: 1px solid rgba(30, 41, 59, 0.16);
          border-radius: 30px;
          padding: 7px 18px;
          color: var(--ai-dark);
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all .2s ease;
        }
        .science-tech-filter.active, .science-tech-filter:hover {
          border-color: var(--ai-teal);
          background: var(--ai-teal);
          color: #fff;
        }
        .science-tech-featured {
          position: relative;
          display: grid;
          grid-template-columns: 1.18fr 0.82fr;
          min-height: 320px;
          margin-bottom: 34px;
          overflow: hidden;
          border-radius: 12px;
          background: #f0fdf4;
          border: 1px solid rgba(13, 148, 136, 0.15);
          transition: transform .25s ease, box-shadow .25s ease;
          text-decoration: none;
          color: inherit;
        }
        .science-tech-featured:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(13, 148, 136, 0.1);
        }
        .science-tech-featured-image {
          min-height: 320px;
          overflow: hidden;
          background: #e2e8f0;
          position: relative;
        }
        .science-tech-featured-image img {
          height: 100%;
          object-fit: cover;
          transition: transform .6s ease;
        }
        .science-tech-featured:hover img {
          transform: scale(1.03);
        }
        .science-tech-featured-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 36px 38px;
        }
        .science-tech-featured-copy h2 {
          margin: 0 0 14px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(24px, 2.6vw, 32px);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -.025em;
          color: var(--ai-dark);
        }
        .science-tech-featured-copy p {
          margin: 0 0 20px;
          color: #475569;
          font-size: 15px;
          line-height: 1.65;
        }
        .science-tech-read-more {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: max-content;
          border-bottom: 2px solid var(--ai-teal);
          padding-bottom: 3px;
          font-size: 13px;
          font-weight: 700;
          color: var(--ai-teal);
          transition: color .2s ease;
        }
        .science-tech-read-more svg {
          transition: transform .2s ease;
        }
        .science-tech-featured:hover .science-tech-read-more svg {
          transform: translateX(4px);
        }
        .science-tech-articles-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .science-tech-articles-heading h3 {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          color: var(--ai-dark);
        }
        .science-tech-view-all {
          font-size: 12px;
          font-weight: 700;
          color: var(--ai-teal);
          text-decoration: none;
        }
        .science-tech-articles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .science-tech-card-wrapper {
          position: relative;
          display: flex;
        }
        .science-tech-card {
          width: 100%;
          overflow: hidden;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
          display: flex;
          flex-direction: column;
          color: inherit;
          text-decoration: none;
        }
        .science-tech-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
          border-color: rgba(13, 148, 136, 0.3);
        }
        .science-tech-card-image {
          height: 195px;
          overflow: hidden;
          position: relative;
          background: #f1f5f9;
        }
        .science-tech-card-image img {
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }
        .science-tech-card:hover img {
          transform: scale(1.04);
        }
        .science-tech-card-body {
          padding: 20px 22px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .science-tech-card-body h4 {
          margin: 0 0 10px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 19px;
          font-weight: 600;
          line-height: 1.25;
          letter-spacing: -.015em;
          color: var(--ai-dark);
        }
        /* Min 4-5 lines of text in card */
        .science-tech-card-body p {
          margin: 0 0 16px;
          color: #475569;
          font-size: 13.5px;
          line-height: 1.6;
          min-height: 5.6rem;
          flex: 1;
        }
        .science-tech-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #64748b;
          font-size: 12px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid rgba(226, 232, 240, 0.9);
        }
        .science-tech-card-meta .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: var(--ai-teal);
        }
        .science-tech-card-meta .meta-link {
          font-weight: 700;
          color: var(--ai-dark);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .science-tech-newsletter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          margin-top: 48px;
          overflow: hidden;
          position: relative;
          border-radius: 12px;
          padding: 34px 44px;
          background: #0f172a;
          color: #fff;
        }
        .science-tech-newsletter-copy {
          position: relative;
          z-index: 1;
        }
        .science-tech-newsletter .newsletter-eyebrow {
          color: #2dd4bf;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .science-tech-newsletter h3 {
          margin: 0 0 10px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(24px, 2.8vw, 30px);
          font-weight: 600;
          line-height: 1.2;
        }
        .science-tech-newsletter p {
          max-width: 480px;
          margin: 0;
          color: rgba(255, 255, 255, .82);
          font-size: 13.5px;
          line-height: 1.6;
        }
        .science-tech-newsletter-form {
          display: flex;
          width: 380px;
          position: relative;
          z-index: 1;
        }
        .science-tech-newsletter-form input {
          flex: 1;
          height: 44px;
          border: 0;
          border-radius: 6px 0 0 6px;
          padding: 0 16px;
          outline: 0;
          font-size: 13.5px;
          color: #1e293b;
          background: #ffffff;
        }
        .science-tech-newsletter-form button {
          width: 120px;
          border: 0;
          border-radius: 0 6px 6px 0;
          background: var(--ai-teal);
          color: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: background .2s ease;
        }
        .science-tech-newsletter-form button:hover {
          background: #0f766e;
        }
        @media (max-width: 980px) {
          .science-tech-featured {
            grid-template-columns: 1fr;
          }
          .science-tech-featured-image {
            min-height: 240px;
          }
          .science-tech-featured-copy {
            padding: 28px 24px;
          }
          .science-tech-articles {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .science-tech-newsletter {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding: 30px 24px;
          }
          .science-tech-newsletter-form {
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .science-tech-content {
            padding: 24px 16px 40px;
          }
          .science-tech-section-heading {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .science-tech-section-heading p {
            text-align: left;
          }
          .science-tech-articles {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .science-tech-card-image {
            height: 200px;
          }
          .science-tech-newsletter-form {
            flex-direction: column;
          }
          .science-tech-newsletter-form input {
            border-radius: 6px;
            margin-bottom: 8px;
            width: 100%;
          }
          .science-tech-newsletter-form button {
            border-radius: 6px;
            width: 100%;
            height: 42px;
          }
        }
      `}</style>

      <section className="science-tech-content">
        {/* Section Heading */}
        <div className="science-tech-section-heading">
          <div>
            <div className="science-tech-label">{value('sectionLabel')}</div>
            <h1>{value('sectionTitle')}</h1>
          </div>
          <p>{value('sectionDescription')}</p>
        </div>

        {/* Filter Pills */}
        <div className="science-tech-filters" aria-label="Filter laboratory programmes">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`science-tech-filter ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Featured Showcase Lab */}
        {!data.hideFeatured && featured && featured.title && (
          <div className="relative mb-8">
            <Link to={featuredTarget} className="science-tech-featured">
              <div className="science-tech-featured-image">
                <MediaImage
                  src={featured.image || SCIENCE_TECH_LABS_DEFAULTS.featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="science-tech-featured-copy">
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <span className="science-tech-read-more">
                  {featured.readMoreLabel || value('readMoreLabel')} <ArrowRight size={13} />
                </span>
              </div>
            </Link>

            {/* Featured Wishlist Button */}
            <div className="absolute top-4 right-4 z-20">
              {isSaved({ title: featured.title, image: featured.image }) ? (
                <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-md border border-slate-200">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Saved</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove({ title: featured.title, image: featured.image });
                    }}
                    disabled={isPending({ title: featured.title, image: featured.image })}
                    className="text-red-500 hover:text-red-700 ml-1 p-0.5"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    add({ title: featured.title, image: featured.image });
                  }}
                  disabled={isPending({ title: featured.title, image: featured.image })}
                  className="flex items-center gap-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-red-600 px-3.5 py-1.5 text-xs font-bold shadow-md transition-all backdrop-blur-sm border border-slate-200/60"
                >
                  <Heart className="h-3.5 w-3.5 text-red-500" /> Wishlist
                </button>
              )}
            </div>
          </div>
        )}

        {/* Latest Insights / Labs Header */}
        <div className="science-tech-articles-heading">
          <h3>{value('latestTitle')}</h3>
          <a href="#science-tech-articles" className="science-tech-view-all">
            {value('viewAllLabel')} <ArrowRight size={11} className="inline ml-1" />
          </a>
        </div>

        {/* 3-Column Lab Grid */}
        {!data.hideCards && (
          <div id="science-tech-articles" className="science-tech-articles">
            {visibleCards.map((card, index) => {
              const target = cardTarget(card);
              const cardImage = card.image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85';
              const isCardSaved = isSaved({ title: card.title, image: card.image });

              return (
                <div className="science-tech-card-wrapper" key={`${card.title}-${index}`}>
                  <Link to={target} className="science-tech-card">
                    <div className="science-tech-card-image">
                      <MediaImage
                        src={cardImage}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="science-tech-card-body">
                      {/* NO category text badge per client instruction */}
                      <h4>{card.title}</h4>
                      {/* Min 4-5 lines of text */}
                      <p>{card.description}</p>
                      {/* Clean meta footer with NO category text */}
                      <div className="science-tech-card-meta">
                        <span className="meta-badge">{card.readTime || 'Full Specs Available'}</span>
                        <span className="meta-link">
                          Explore <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Card Wishlist Button (Top Right) */}
                  <div className="absolute top-3 right-3 z-20">
                    {isCardSaved ? (
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md border border-slate-200">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[11px] font-bold text-emerald-700">Saved</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            remove({ title: card.title, image: card.image });
                          }}
                          disabled={isPending({ title: card.title, image: card.image })}
                          className="text-red-500 hover:text-red-700 ml-0.5 p-0.5"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          add({ title: card.title, image: card.image });
                        }}
                        disabled={isPending({ title: card.title, image: card.image })}
                        className="flex items-center gap-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-red-600 px-3 py-1 text-[11px] font-bold shadow-md transition-all backdrop-blur-sm border border-slate-200/60"
                      >
                        <Heart className="h-3.5 w-3.5 text-red-500" /> Wishlist
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Newsletter / Consultation Section */}
        {!data.hideNewsletter && (
          <section className="science-tech-newsletter">
            <div className="science-tech-newsletter-copy">
              <div className="newsletter-eyebrow">{value('newsletterLabel')}</div>
              <h3>{value('newsletterTitle')}</h3>
              <p>{value('newsletterDescription')}</p>
            </div>
            <form className="science-tech-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={value('newsletterPlaceholder')}
                aria-label={value('newsletterPlaceholder')}
                required
              />
              <button type="submit">
                {subscribed ? 'Submitted!' : value('newsletterButtonLabel')}
              </button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
};

export default ScienceTechLabs;
