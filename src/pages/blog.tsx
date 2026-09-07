import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import { getCardCover } from '@/lib/card-covers';

interface Category { id: number; name: string; slug: string; }
interface Post { id: number; title: string; excerpt: string; publishedAt?: string; imageUrl?: string; slug: string; category?: Category; blogcategory?: Category }

const PAGE_SIZE = 6;

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
};

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (activeCategory) params.set('category', activeCategory);

    Promise.all([
      api.get('/blog?' + params.toString()),
      api.get('/blog/categories'),
    ]).then(([postsRes, catRes]) => {
      setPosts(postsRes.data.posts.map((post: Post) => ({ ...post, category: post.category ?? post.blogcategory })));
      setCategories(catRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    setVisibleCount(PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          !searchQuery ||
          (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [posts, searchQuery],
  );

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <main className="min-h-screen bg-white">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-cm-blue-dark sm:text-3xl">Latest Articles</h1>
            <label className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 sm:w-56">
              <Search className="h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Left menu */}
            <aside className="hidden lg:block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-cm-blue-dark">Categories</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`block w-full rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                    activeCategory === null ? 'bg-cm-blue text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`block w-full rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                      activeCategory === cat.slug ? 'bg-cm-blue text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="px-1 text-xs text-slate-400">No categories yet. Add one in Admin &rarr; Blog Posts.</p>
                )}
              </div>

              <div className="mt-8 rounded-3xl bg-cm-blue-dark/5 p-4">
                <p className="mb-3 text-sm font-semibold text-cm-blue-dark">Showing</p>
                <p className="text-4xl font-black text-cm-blue-dark">{filteredPosts.length}</p>
                <p className="mt-2 text-sm text-slate-500">{activeCategory ? categories.find((c) => c.slug === activeCategory)?.name : 'All'} articles</p>
              </div>
            </aside>

            {/* Article grid */}
            <div className="min-w-0">
              {/* Mobile category chips (sidebar is hidden below lg) */}
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    activeCategory === null ? 'border-cm-blue/20 bg-blue-50 text-cm-blue' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                      activeCategory === cat.slug ? 'border-cm-blue/20 bg-blue-50 text-cm-blue' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" />
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">
                  No articles found matching your criteria.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                    {visiblePosts.map((post, index) => {
                      const cover = getCardCover(index);
                      const image = resolveMediaUrl(post.imageUrl);
                      return (
                        <Link key={post.id} to={`/blog/${post.slug}`} className="group block min-w-0">
                          <div className="relative h-48 overflow-hidden rounded-xl" style={{ background: cover.background }}>
                            {image && <img src={image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                            <span
                              className="absolute bottom-0 left-0 h-7 w-7 rounded-tr-xl rounded-bl-xl"
                              style={{ background: cover.accent }}
                            />
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
                            <span className="font-bold text-cm-blue">{post.category?.name || 'General'}</span>
                            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                          </div>
                          <h3 className="mt-1.5 text-base font-extrabold leading-snug tracking-tight text-cm-blue-dark line-clamp-2 group-hover:text-cm-blue sm:text-lg">
                            {post.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>
                        </Link>
                      );
                    })}
                  </div>

                  {hasMore && (
                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-cm-blue hover:text-cm-blue"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Blog;
