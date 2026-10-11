import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Heart, Check, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import LoginPromptModal from '@/components/login-prompt-modal';
import { useWishlist } from '@/contexts/WishlistContext';

interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  category: Category;
}

interface ShopProps {
  categorySlug?: string;
  categorySlugs?: string[];
  showAllCategories?: boolean;
  categoryRoutes?: Record<string, string>;
  excludedCategorySlugs?: string[];
  categoryPage?: string;
  hideCategorySidebar?: boolean;
  embedded?: boolean;
  defaultCategorySlug?: string;
}

const PAGE_SIZE = 12;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// In-memory cache for category lists
const categoriesMemoryCache = new Map<string, Category[]>();

function getCachedCategories(categoryPage?: string): Category[] {
  const cacheKey = categoryPage || '__all__';
  if (categoriesMemoryCache.has(cacheKey)) {
    return categoriesMemoryCache.get(cacheKey)!;
  }
  try {
    const raw = sessionStorage.getItem(`cm_cats_${cacheKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        categoriesMemoryCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function setCachedCategories(categoryPage: string | undefined, list: Category[]) {
  const cacheKey = categoryPage || '__all__';
  categoriesMemoryCache.set(cacheKey, list);
  try {
    sessionStorage.setItem(`cm_cats_${cacheKey}`, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

// In-memory cache for product listings with short TTL (session SWR)
interface CachedProductData {
  products: Product[];
  total: number;
  timestamp: number;
}
const productsMemoryCache = new Map<string, CachedProductData>();

// Shimmer Skeleton Grid matching 12-item card layout
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
      <div
        key={i}
        className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-3.5 flex flex-col justify-between animate-pulse"
      >
        <div>
          <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-3" />
          <div className="flex justify-between items-center mb-2">
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="h-3 bg-slate-100 rounded w-1/5" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-4/5 mb-1.5" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="h-5 bg-slate-100 rounded w-1/4" />
          <div className="h-8 bg-slate-100 rounded-lg w-28" />
        </div>
      </div>
    ))}
  </div>
);

const Shop = ({
  categorySlug,
  categorySlugs,
  showAllCategories = false,
  categoryRoutes = {},
  excludedCategorySlugs = [],
  categoryPage,
  hideCategorySidebar = false,
  embedded = false,
  defaultCategorySlug,
}: ShopProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Categories synchronous bootstrap
  const [categories, setCategories] = useState<Category[]>(() => getCachedCategories(categoryPage));
  const [categoriesLoaded, setCategoriesLoaded] = useState(() => categories.length > 0);

  // Synchronous initial category resolution
  const urlCategory = searchParams.get('category');
  const computeInitialCategory = () => {
    if (categorySlug) return categorySlug;
    if (urlCategory && urlCategory !== 'all') return urlCategory;
    if (defaultCategorySlug) return defaultCategorySlug;
    if (categories.length > 0) {
      const withProducts = categories.find((c) => (c._count?.products ?? 0) > 0);
      return withProducts?.slug || categories[0].slug;
    }
    return '';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(computeInitialCategory);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const { isInWishlist, addProduct, removeProduct, count: wishlistCount } = useWishlist();

  // Debounce search input without debouncing category clicks
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Load and cache categories
  useEffect(() => {
    let isMounted = true;
    api.get('/products/categories', { params: categoryPage ? { page: categoryPage } : undefined })
      .then(({ data }) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        setCachedCategories(categoryPage, list);
        setCategoriesLoaded(true);

        // Normalize selectedCategory if empty or invalid
        setSelectedCategory((prev) => {
          if (categorySlug) return categorySlug;
          const targetUrlCat = searchParams.get('category');
          if (targetUrlCat && targetUrlCat !== 'all' && list.some((c) => c.slug.toLowerCase() === targetUrlCat.toLowerCase())) {
            return targetUrlCat;
          }
          if (prev && list.some((c) => c.slug.toLowerCase() === prev.toLowerCase())) {
            return prev;
          }
          if (defaultCategorySlug && list.some((c) => c.slug.toLowerCase() === defaultCategorySlug.toLowerCase())) {
            return defaultCategorySlug;
          }
          const withProds = list.find((c) => (c._count?.products ?? 0) > 0);
          return withProds?.slug || list[0]?.slug || '';
        });
      })
      .catch(() => {
        if (isMounted) setCategoriesLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryPage, categorySlug, defaultCategorySlug, searchParams]);

  // Handle URL category changes (browser back/forward navigation)
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
      return;
    }
    const cat = searchParams.get('category');
    if (cat && cat !== 'all') {
      setSelectedCategory(cat);
    }
  }, [categorySlug, searchParams]);

  // Compute available categories for sidebar
  const availableCategories = useMemo(() => {
    return excludedCategorySlugs.length
      ? categories.filter((c) => !excludedCategorySlugs.some((ex) => ex.toLowerCase() === c.slug.toLowerCase()))
      : categories;
  }, [categories, excludedCategorySlugs]);

  const scopedCategorySlugs = useMemo(() => {
    return showAllCategories
      ? []
      : categorySlugs?.length ? categorySlugs : categorySlug ? [categorySlug] : [];
  }, [showAllCategories, categorySlugs, categorySlug]);

  const shopCategories = useMemo(() => {
    return scopedCategorySlugs.length
      ? availableCategories.filter((c) => scopedCategorySlugs.includes(c.slug))
      : availableCategories;
  }, [scopedCategorySlugs, availableCategories]);

  // Ensure selected category is valid within shopCategories
  useEffect(() => {
    if (!categoriesLoaded || shopCategories.length === 0) return;
    const isCurrentValid = shopCategories.some((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase());
    if (!isCurrentValid) {
      const fallback = (defaultCategorySlug && shopCategories.find((c) => c.slug.toLowerCase() === defaultCategorySlug.toLowerCase())?.slug)
        || shopCategories.find((c) => (c._count?.products ?? 0) > 0)?.slug
        || shopCategories[0]?.slug;
      if (fallback && fallback !== selectedCategory) {
        setSelectedCategory(fallback);
      }
    }
  }, [categoriesLoaded, shopCategories, selectedCategory, defaultCategorySlug]);

  // Products Click-to-Fetch with In-Flight Cancellation & SWR Session Cache
  useEffect(() => {
    // Wait until category is resolved
    if (!selectedCategory && shopCategories.length > 0) return;
    if ((categoryPage || excludedCategorySlugs.length > 0) && !categoriesLoaded) return;

    const activeCat = selectedCategory || (shopCategories[0]?.slug ?? '');
    if (!activeCat && !categoryPage) return;

    const cacheKey = `${activeCat}_p${page}_${sort}_${inStockOnly}_${debouncedSearch}`;
    const cachedEntry = productsMemoryCache.get(cacheKey);
    const isFresh = cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS);

    // Synchronize URL query params
    const newUrlParams: Record<string, string> = {
      category: activeCat,
      sort,
      page: String(page),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(inStockOnly ? { inStock: 'true' } : {}),
    };
    setSearchParams(newUrlParams, { replace: true });

    // 0ms instant render from memory cache
    if (isFresh) {
      setProducts(cachedEntry.products);
      setTotalProducts(cachedEntry.total);
      setLoading(false);
      return;
    }

    // Cancel any previous pending request (prevents race conditions)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);

    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      page: String(page),
      sort,
      category: activeCat,
    };

    if (inStockOnly) params.inStock = 'true';
    if (debouncedSearch) params.search = debouncedSearch;

    api.get('/products', { params, signal: controller.signal })
      .then(({ data }) => {
        if (currentRequestId !== requestIdRef.current) return;
        const prods = data.products || [];
        const total = data.total || 0;
        setProducts(prods);
        setTotalProducts(total);
        productsMemoryCache.set(cacheKey, { products: prods, total, timestamp: Date.now() });
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        if (currentRequestId === requestIdRef.current) {
          setProducts([]);
          setTotalProducts(0);
        }
      })
      .finally(() => {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    selectedCategory,
    shopCategories,
    page,
    sort,
    inStockOnly,
    debouncedSearch,
    categoryPage,
    categoriesLoaded,
    excludedCategorySlugs.length,
    setSearchParams,
  ]);

  const handleCategoryClick = (slug: string) => {
    if (selectedCategory.toLowerCase() === slug.toLowerCase()) return;
    setSelectedCategory(slug);
    setPage(1);
    setSearchQuery('');
  };

  const handleToggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      const res = await removeProduct(product.id);
      if (res.success) {
        setActionMessage(`${product.name} removed from wishlist.`);
      } else {
        setActionMessage(res.error || 'Failed to remove from wishlist.');
      }
    } else {
      const res = await addProduct(product.id);
      if (res.unauthenticated) {
        setShowLoginPrompt(true);
      } else if (res.success) {
        setActionMessage(`${product.name} added to wishlist.`);
      } else {
        setActionMessage(res.error || 'Failed to add to wishlist.');
      }
    }
  };

  const handleRemoveFromWishlist = async (product: Product) => {
    const res = await removeProduct(product.id);
    if (res.success) {
      setActionMessage(`${product.name} removed from wishlist.`);
    } else {
      setActionMessage(res.error || 'Failed to remove from wishlist.');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price || 0);

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;
  const Root: 'div' | 'main' = embedded ? 'div' : 'main';

  const activeCategoryTitle = useMemo(() => {
    const match = categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase());
    if (match) return match.name;
    if (debouncedSearch) return `Search: "${debouncedSearch}"`;
    return 'Products';
  }, [categories, selectedCategory, debouncedSearch]);

  return (
    <Root className={embedded ? undefined : 'min-h-screen bg-cm-gray'}>
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* Top Search & Wishlist Bar */}
      <div className={embedded ? 'rounded-2xl border border-gray-100 bg-white' : 'bg-white border-b'}>
        <div className={embedded ? 'px-4 py-4' : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4'}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products by name, SKU, or specification..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-cm-blue text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            {!embedded && (
              <Link
                to="/my-account?tab=wishlist"
                title="View Wishlist"
                className="relative inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-slate-700 transition-colors"
              >
                <Heart className="w-5 h-5 text-cm-blue" />
                <span className="hidden sm:inline text-xs font-bold text-slate-700">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cm-yellow px-1 text-[10px] font-bold text-cm-blue-dark">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={embedded ? 'py-6' : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8'}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          {!hideCategorySidebar && (
            <aside className="lg:w-64 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-cm-blue" />
                  <h3 className="font-bold text-cm-blue-dark text-base">Categories</h3>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {shopCategories.map((cat) => (
                    <li key={cat.id}>
                      {categoryRoutes[cat.slug] ? (
                        <Link
                          to={categoryRoutes[cat.slug]}
                          className="block w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                        >
                          <span>{cat.name}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                            selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                              ? 'bg-cm-blue text-white font-bold'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Additional Filters */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Availability</h4>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="accent-cm-blue rounded"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Products Grid & Controls */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-cm-blue-dark">
                  {activeCategoryTitle}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="shop-sort" className="text-xs text-gray-500 font-medium">Sort:</label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-gray-50 focus:outline-none focus:border-cm-blue"
                >
                  <option value="newest">Newest</option>
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {actionMessage && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <span>{actionMessage}</span>
                <button aria-label="Dismiss notification" onClick={() => setActionMessage('')}><X className="h-4 w-4" /></button>
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8">
                <p className="text-gray-600 text-lg font-medium">No products found matching your criteria.</p>
                <p className="text-gray-400 text-sm mt-1">Try clearing your search query or picking another category.</p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="mt-4 px-4 py-2 bg-cm-blue text-white text-xs font-bold rounded-lg hover:bg-cm-blue-dark transition-colors"
                  >
                    Reset Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                  const inWishlist = isInWishlist(product.id);
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div
                      key={product.id}
                      className="relative bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300 hover:-translate-y-1 flex flex-col group/card"
                    >
                      <Link to={`/product/${product.slug}`} className="cursor-pointer">
                        <div className="aspect-[4/3] overflow-hidden bg-white flex items-center justify-center p-3 group-hover/card:bg-slate-50/50 transition-colors">
                          <img
                            src={resolveMediaUrl(product.imageUrl) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'}
                            alt={product.name}
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                            className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-all duration-500"
                          />
                        </div>
                      </Link>

                      <div className="p-3.5 flex-grow flex flex-col justify-between border-t border-slate-50">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                            <span className="uppercase tracking-wider">{product.category?.name || 'General'}</span>
                            {isOutOfStock ? (
                              <span className="text-red-500 font-bold">Out of Stock</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">In Stock</span>
                            )}
                          </div>
                          <Link to={`/product/${product.slug}`} className="cursor-pointer group">
                            <h3
                              className="font-semibold text-cm-blue-dark text-xs sm:text-sm tracking-tight mb-1 group-hover:text-cm-blue transition-colors leading-snug line-clamp-2 min-h-[32px] sm:min-h-[36px]"
                              title={product.name}
                            >
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap mt-2 pt-2 border-t border-slate-100/70">
                          <span className="text-sm sm:text-base font-black text-cm-blue tracking-tight shrink-0">
                            {formatPrice(product.price)}
                          </span>

                          {inWishlist ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 text-xs font-bold whitespace-nowrap">
                                <Check className="h-3.5 w-3.5" />
                                <span>Wishlist</span>
                              </span>
                              <button
                                onClick={() => handleRemoveFromWishlist(product)}
                                aria-label={`Remove ${product.name} from wishlist`}
                                title="Remove from wishlist"
                                className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleWishlist(product)}
                              className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-cm-blue px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-cm-blue-dark focus:ring-2 focus:ring-cm-blue/20 whitespace-nowrap active:scale-95"
                            >
                              <Heart className="h-3.5 w-3.5" />
                              <span>Add to Wishlist</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center border-t border-slate-200 pt-6 px-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <div key={p} className="flex items-center">
                            {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                            <button
                              onClick={() => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                                page === p ? 'bg-cm-blue text-white' : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Root>
  );
};

export default Shop;
