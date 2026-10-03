import { useState, useEffect } from 'react';
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
  hideAllCategoriesOption?: boolean;
  defaultCategorySlug?: string;
}

const PAGE_SIZE = 24;

const Shop = ({
  categorySlug,
  categorySlugs,
  showAllCategories = false,
  categoryRoutes = {},
  excludedCategorySlugs = [],
  categoryPage,
  hideCategorySidebar = false,
  embedded = false,
  hideAllCategoriesOption = false,
  defaultCategorySlug,
}: ShopProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const urlCategory = searchParams.get('category');
  const initialSelectedCategory = categorySlug || (urlCategory && urlCategory !== 'all' ? urlCategory : (hideAllCategoriesOption ? (defaultCategorySlug || '') : 'all'));
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [actionMessage, setActionMessage] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { isInWishlist, addProduct, removeProduct, count: wishlistCount } = useWishlist();
  const categorySlugKey = categorySlugs?.join(',') || '';
  const excludedCategorySlugKey = excludedCategorySlugs.join(',');

  useEffect(() => {
    setCategoriesLoaded(false);
    api.get('/products/categories', { params: categoryPage ? { page: categoryPage } : undefined })
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoaded(true));
  }, [categoryPage]);

  useEffect(() => {
    if (categorySlug) setSelectedCategory(categorySlug);
  }, [categorySlug]);

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

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const addSelectedToWishlist = async () => {
    const selected = products.filter((product) => selectedProducts.has(product.id));
    if (!selected.length) return;
    const productsToAdd = selected.filter((product) => !isInWishlist(product.id));
    if (!productsToAdd.length) {
      setActionMessage('All selected products are already in your wishlist.');
      return;
    }
    setActionMessage(`Adding ${productsToAdd.length} product${productsToAdd.length === 1 ? '' : 's'} to wishlist...`);

    let addedCount = 0;
    let authRequired = false;
    for (const prod of productsToAdd) {
      const res = await addProduct(prod.id);
      if (res.unauthenticated) {
        authRequired = true;
        break;
      }
      if (res.success) addedCount++;
    }

    if (authRequired) {
      setShowLoginPrompt(true);
    } else {
      setActionMessage(`${addedCount} product${addedCount === 1 ? '' : 's'} added to wishlist.`);
      setSelectedProducts(new Set());
    }
  };

  useEffect(() => {
    if ((categoryPage || excludedCategorySlugs.length > 0) && !categoriesLoaded) return;
    setLoading(true);

    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      page: String(page),
      sort,
    };

    if (inStockOnly) params.inStock = 'true';

    const activeCategory = categoryPage && selectedCategory !== 'all' && !categories.some((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase())
      ? 'all'
      : selectedCategory;

    if (categorySlug) params.category = categorySlug;
    else if (activeCategory !== 'all') params.category = activeCategory;
    else if (categorySlugs?.length) params.category = categorySlugs.join(',');
    else if (categoryPage) params.category = categories.map((c) => c.slug).join(',') || '__none__';
    else if (excludedCategorySlugs.length > 0) {
      const availableSlugs = categories
        .map((c) => c.slug)
        .filter((slug) => !excludedCategorySlugs.includes(slug));
      params.category = availableSlugs.join(',');
    }

    const searchTimer = window.setTimeout(() => {
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const newUrlParams: Record<string, string> = {
        ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        ...(inStockOnly ? { inStock: 'true' } : {}),
        sort,
        page: String(page),
      };
      setSearchParams(newUrlParams, { replace: true });

      api.get('/products', { params })
        .then(({ data }) => {
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(searchTimer);
  }, [categoryPage, categoriesLoaded, categorySlug, categorySlugKey, categories, excludedCategorySlugKey, selectedCategory, searchQuery, sort, inStockOnly, page, setSearchParams]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price || 0);

  const availableCategories = excludedCategorySlugs.length
    ? categories.filter((c) => !excludedCategorySlugs.some((ex) => ex.toLowerCase() === c.slug.toLowerCase()))
    : categories;

  const scopedCategorySlugs = showAllCategories
    ? []
    : categorySlugs?.length ? categorySlugs : categorySlug ? [categorySlug] : [];
  const shopCategories = scopedCategorySlugs.length
    ? availableCategories.filter((c) => scopedCategorySlugs.includes(c.slug))
    : availableCategories;

  useEffect(() => {
    if (hideAllCategoriesOption && categoriesLoaded && shopCategories.length > 0) {
      const urlCat = searchParams.get('category');
      const isSelectedValid = shopCategories.some((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase());
      if (!urlCat || urlCat === 'all' || !isSelectedValid) {
        const preferred = (defaultCategorySlug && shopCategories.find((c) => c.slug.toLowerCase() === defaultCategorySlug.toLowerCase())?.slug)
          || shopCategories[0]?.slug;
        if (preferred && selectedCategory !== preferred) {
          setSelectedCategory(preferred);
        }
      }
    }
  }, [hideAllCategoriesOption, categoriesLoaded, shopCategories, defaultCategorySlug, searchParams, selectedCategory]);

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE) || 1;
  const Root: 'div' | 'main' = embedded ? 'div' : 'main';

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
                  {!hideAllCategoriesOption && (
                    <li>
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === 'all' ? 'bg-cm-blue text-white font-bold' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>All Products</span>
                        <span className="text-xs opacity-80">{totalProducts}</span>
                      </button>
                    </li>
                  )}
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
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                            selectedCategory.toLowerCase() === cat.slug.toLowerCase() ? 'bg-cm-blue text-white font-bold' : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="truncate mr-2">{cat.name}</span>
                          {cat._count?.products !== undefined && (
                            <span className="text-xs opacity-75 shrink-0">({cat._count.products})</span>
                          )}
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
                  {categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase())?.name || 'All Products'}
                </h1>
                <span className="text-xs font-semibold text-slate-400">
                  ({totalProducts} item{totalProducts === 1 ? '' : 's'})
                </span>
                {hideCategorySidebar && categories.some((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                    className="text-xs font-semibold uppercase tracking-widest text-cm-blue hover:underline"
                  >
                    Show all
                  </button>
                )}
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

            {selectedProducts.size > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-cm-blue px-4 py-3 text-sm text-white shadow-md">
                <span>{selectedProducts.size} product{selectedProducts.size === 1 ? '' : 's'} selected</span>
                <button
                  onClick={addSelectedToWishlist}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 font-bold text-xs text-cm-blue hover:bg-slate-50 transition-colors"
                >
                  <Heart className="h-3.5 w-3.5" /> Add Selected to Wishlist
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8">
                <p className="text-gray-600 text-lg font-medium">No products found matching your criteria.</p>
                <p className="text-gray-400 text-sm mt-1">Try clearing your search query or picking another category.</p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                    className="mt-4 px-4 py-2 bg-cm-blue text-white text-xs font-bold rounded-lg hover:bg-cm-blue-dark transition-colors"
                  >
                    Reset Filters
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
                      <label className="absolute z-10 m-3 flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-2 py-1 text-xs shadow-sm font-medium">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="accent-cm-blue"
                        />
                        <span>Select</span>
                      </label>

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
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 px-2">
                <div className="text-xs text-slate-500 font-medium">
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalProducts)} of {totalProducts} products
                </div>
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
