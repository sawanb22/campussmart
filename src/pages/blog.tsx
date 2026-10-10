import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import MediaImage from '@/components/ui/media-image';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  excerpt: string;
  body?: string;
  publishedAt?: string;
  imageUrl?: string;
  slug: string;
  category?: Category;
  blogcategory?: Category;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85',
];

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
};

const estimateReadTime = (content?: string) => {
  if (!content) return '4 min read';
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 150));
  return `${minutes} min read`;
};

const PAGE_SIZE = 9;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [subscribed, setSubscribed] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    api.get('/blog/categories')
      .then((catRes) => {
        if (!isMounted) return;
        const fetchedCategories: Category[] = Array.isArray(catRes.data) ? catRes.data : [];
        setCategories(fetchedCategories);

        const urlCat = searchParams.get('category');
        if (urlCat && fetchedCategories.some((c) => c.slug.toLowerCase() === urlCat.toLowerCase())) {
          setActiveCategory(urlCat);
        } else {
          setActiveCategory('all');
        }
      })
      .catch((err) => {
        console.error('Failed to load blog categories:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync category if URL parameter changes
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (!urlCat) {
      setActiveCategory('all');
    } else if (categories.length > 0 && categories.some((c) => c.slug.toLowerCase() === urlCat.toLowerCase())) {
      if (activeCategory !== urlCat) {
        setActiveCategory(urlCat);
      }
    }
  }, [searchParams, categories, activeCategory]);

  // Fetch posts (all or category-filtered)
  useEffect(() => {
    let isMounted = true;
    setLoadingPosts(true);
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (activeCategory && activeCategory !== 'all') {
      params.set('category', activeCategory);
    }

    api.get('/blog?' + params.toString())
      .then((postsRes) => {
        if (!isMounted) return;
        setPosts(
          (postsRes.data?.posts || []).map((post: Post) => ({
            ...post,
            category: post.category ?? post.blogcategory,
          }))
        );
      })
      .catch((err) => {
        console.error('Failed to load posts:', err);
        if (isMounted) setPosts([]);
      })
      .finally(() => {
        if (isMounted) setLoadingPosts(false);
      });

    setVisibleCount(PAGE_SIZE);
    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  const handleCategorySelect = (slug: string) => {
    setActiveCategory(slug);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug === 'all') {
        next.delete('category');
      } else {
        next.set('category', slug);
      }
      return next;
    });
  };

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
    event.currentTarget.reset();
  };

  const loading = loadingCategories || loadingPosts;

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          !searchQuery ||
          (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [posts, searchQuery]
  );

  // Featured post is first post when not searching, or first matching post
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1, visibleCount) : [];
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <main className="ai-guide-page">
      <style>{`
        .ai-guide-page {
          --ai-cream: #f1e5c4;
          --ai-orange: #ed9816;
          --ai-brown: #89614d;
          --ai-dark: #3c2f26;
          --ai-teal: #54a4a0;
          --ai-blue: #3d718f;
          --ai-white: #fffdf8;
          background: #faf8f0;
          color: var(--ai-dark);
          font-family: "DM Sans", "Open Sans", sans-serif;
          min-height: 100vh;
        }
        .ai-guide-page *, .ai-guide-page *::before, .ai-guide-page *::after {
          box-sizing: border-box;
        }
        .ai-guide-page img {
          width: 100%;
          display: block;
        }
        .ai-guide-page button, .ai-guide-page input {
          font: inherit;
        }
        .ai-guide-content {
          max-width: 1240px;
          margin: auto;
          padding: 36px 48px 50px;
          background: var(--ai-white);
        }
        .ai-guide-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--ai-brown);
        }
        .ai-guide-label::before {
          content: "";
          width: 20px;
          height: 2px;
          background: var(--ai-orange);
        }
        .ai-guide-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }
        .ai-guide-section-heading h1 {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(32px, 3.8vw, 44px);
          font-weight: 600;
          letter-spacing: -.04em;
        }
        .ai-guide-section-heading p {
          max-width: 520px;
          margin: 0;
          color: #594d45;
          font-size: 15px;
          line-height: 1.6;
          text-align: right;
        }
        .ai-guide-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(60, 47, 38, .1);
        }
        .ai-guide-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ai-guide-filter {
          border: 1px solid rgba(60, 47, 38, .18);
          border-radius: 30px;
          padding: 6px 16px;
          color: var(--ai-dark);
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all .2s ease;
        }
        .ai-guide-filter.active, .ai-guide-filter:hover {
          border-color: var(--ai-dark);
          background: var(--ai-dark);
          color: #fff;
        }
        .ai-guide-search {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(60, 47, 38, .2);
          border-radius: 30px;
          padding: 6px 16px;
          background: #fff;
          width: 260px;
        }
        .ai-guide-search input {
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 13px;
          width: 100%;
          color: var(--ai-dark);
        }
        .ai-guide-featured, .ai-guide-card {
          color: inherit;
          text-decoration: none;
        }
        .ai-guide-featured {
          display: grid;
          grid-template-columns: 1.22fr .78fr;
          min-height: 320px;
          margin-bottom: 36px;
          overflow: hidden;
          border-radius: 12px;
          background: #dce9e5;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .ai-guide-featured:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(60, 47, 38, .1);
        }
        .ai-guide-featured-image {
          min-height: 320px;
          overflow: hidden;
          background: var(--ai-teal);
        }
        .ai-guide-featured-image img {
          height: 100%;
          object-fit: cover;
          transition: transform .6s ease;
        }
        .ai-guide-featured:hover img {
          transform: scale(1.03);
        }
        .ai-guide-featured-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 36px 38px;
        }
        .ai-guide-category {
          margin-bottom: 10px;
          color: var(--ai-orange);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .ai-guide-featured-copy h3 {
          margin: 0 0 12px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(22px, 2.5vw, 32px);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -.03em;
        }
        .ai-guide-featured-copy p {
          margin: 0 0 20px;
          color: #594d45;
          font-size: 15px;
          line-height: 1.6;
        }
        .ai-guide-read-more {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: max-content;
          border-bottom: 1px solid var(--ai-dark);
          padding-bottom: 3px;
          font-size: 13px;
          font-weight: 700;
        }
        .ai-guide-read-more svg {
          transition: transform .2s ease;
        }
        .ai-guide-read-more:hover svg {
          transform: translateX(4px);
        }
        .ai-guide-articles-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        .ai-guide-articles-heading h3 {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 26px;
          font-weight: 600;
        }
        .ai-guide-view-all {
          font-size: 12px;
          font-weight: 700;
          color: var(--ai-dark);
        }
        .ai-guide-articles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ai-guide-card {
          overflow: hidden;
          border-radius: 10px;
          background: #f7f2e7;
          transition: transform .25s ease, box-shadow .25s ease;
          display: flex;
          flex-direction: column;
        }
        .ai-guide-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(60, 47, 38, .1);
        }
        .ai-guide-card-image {
          height: 190px;
          overflow: hidden;
        }
        .ai-guide-card-image img {
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }
        .ai-guide-card:hover img {
          transform: scale(1.04);
        }
        .ai-guide-card-body {
          padding: 18px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .ai-guide-card-body h4 {
          margin: 0 0 8px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.3;
          letter-spacing: -.02em;
        }
        .ai-guide-card-body p {
          margin: 0 0 16px;
          color: #594d45;
          font-size: 13px;
          line-height: 1.55;
          flex: 1;
        }
        .ai-guide-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #786c62;
          font-size: 11px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(60, 47, 38, .1);
        }
        .ai-guide-card-meta strong {
          color: var(--ai-brown);
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          font-size: 11px;
        }
        .ai-guide-newsletter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 36px;
          margin-top: 48px;
          overflow: hidden;
          position: relative;
          border-radius: 12px;
          padding: 32px 40px;
          background: var(--ai-dark);
          color: #fff;
        }
        .ai-guide-newsletter-copy {
          position: relative;
          z-index: 1;
        }
        .ai-guide-newsletter .ai-guide-category {
          color: var(--ai-cream);
        }
        .ai-guide-newsletter h3 {
          margin: 0 0 8px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 28px;
          font-weight: 500;
          line-height: 1.15;
        }
        .ai-guide-newsletter p {
          max-width: 440px;
          margin: 0;
          color: rgba(255, 255, 255, .82);
          font-size: 13px;
          line-height: 1.6;
        }
        .ai-guide-newsletter-form {
          display: flex;
          width: 360px;
          position: relative;
          z-index: 1;
        }
        .ai-guide-newsletter-form input {
          flex: 1;
          height: 42px;
          border: 0;
          border-radius: 4px 0 0 4px;
          padding: 0 14px;
          outline: 0;
          font-size: 13px;
        }
        .ai-guide-newsletter-form button {
          width: 95px;
          border: 0;
          border-radius: 0 4px 4px 0;
          background: var(--ai-orange);
          color: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }
        @media (max-width: 760px) {
          .ai-guide-content {
            padding: 24px 16px 36px;
          }
          .ai-guide-section-heading {
            display: block;
          }
          .ai-guide-section-heading h1 {
            margin-bottom: 8px;
            font-size: 30px;
          }
          .ai-guide-section-heading p {
            text-align: left;
            font-size: 14px;
          }
          .ai-guide-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .ai-guide-search {
            width: 100%;
          }
          .ai-guide-featured {
            grid-template-columns: 1fr;
          }
          .ai-guide-featured-image {
            min-height: 220px;
          }
          .ai-guide-featured-copy {
            padding: 24px 20px;
          }
          .ai-guide-articles {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .ai-guide-card-image {
            height: 200px;
          }
          .ai-guide-newsletter {
            display: block;
            padding: 26px 20px;
          }
          .ai-guide-newsletter-form {
            width: 100%;
            margin-top: 20px;
          }
        }
      `}</style>

      <section className="ai-guide-content">
        <div className="ai-guide-section-heading">
          <div>
            <div className="ai-guide-label">Campus Mart Articles</div>
            <h1>Insights & Perspectives</h1>
          </div>
          <p>
            Helpful perspectives for education leaders, campus planners, and teams shaping the next generation of learning environments.
          </p>
        </div>

        {/* Toolbar: Category Filters + Search */}
        <div className="ai-guide-toolbar">
          <div className="ai-guide-filters" aria-label="Filter blog categories">
            <button
              type="button"
              className={`ai-guide-filter ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('all')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`ai-guide-filter ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <label className="ai-guide-search">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3c2f26] border-t-transparent" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#89614d]/30 bg-[#faf8f0] py-20 text-center text-[#594d45]">
            No articles found matching your criteria.
          </div>
        ) : (
          <>
            {/* Featured Post Hero */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`} className="ai-guide-featured">
                <div className="ai-guide-featured-image">
                  <MediaImage
                    src={featuredPost.imageUrl ? resolveMediaUrl(featuredPost.imageUrl) : FALLBACK_IMAGES[0]}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ai-guide-featured-copy">
                  <div className="ai-guide-category">
                    {featuredPost.category?.name || 'Featured Story'}
                  </div>
                  <h3>{featuredPost.title}</h3>
                  <p>{featuredPost.excerpt}</p>
                  <span className="ai-guide-read-more">
                    Read article <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            )}

            {/* Latest Articles Heading */}
            {gridPosts.length > 0 && (
              <div className="ai-guide-articles-heading">
                <h3>Latest Articles</h3>
              </div>
            )}

            {/* 3-Column Articles Grid */}
            {gridPosts.length > 0 && (
              <div className="ai-guide-articles">
                {gridPosts.map((post, idx) => {
                  const fallbackImg = FALLBACK_IMAGES[(idx + 1) % FALLBACK_IMAGES.length];
                  const imgSrc = post.imageUrl ? resolveMediaUrl(post.imageUrl) : fallbackImg;
                  const postCategoryName = post.category?.name || 'General';

                  return (
                    <Link to={`/blog/${post.slug}`} className="ai-guide-card" key={post.id}>
                      <div className="ai-guide-card-image">
                        <MediaImage
                          src={imgSrc}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ai-guide-card-body">
                        <div className="ai-guide-category">{postCategoryName}</div>
                        <h4>{post.title}</h4>
                        <p>{post.excerpt}</p>
                        <div className="ai-guide-card-meta">
                          <strong>{postCategoryName}</strong>
                          <span>{post.publishedAt ? formatDate(post.publishedAt) : estimateReadTime(post.excerpt)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Load More Pagination */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="rounded-full border border-[rgba(60,47,38,0.25)] bg-white px-8 py-3 text-xs font-bold text-[#3c2f26] transition-all hover:bg-[#3c2f26] hover:text-white"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}

        {/* Newsletter Section matching ai-guide */}
        <section className="ai-guide-newsletter">
          <div className="ai-guide-newsletter-copy">
            <div className="ai-guide-category">Stay curious</div>
            <h3>Good ideas, occasionally.</h3>
            <p>
              Get useful campus infrastructure perspectives, new trends, and practical stories delivered to your inbox. No noise, just things worth reading.
            </p>
          </div>
          <form className="ai-guide-newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Your email address"
              required
            />
            <button type="submit">
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default Blog;

