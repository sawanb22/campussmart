import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Filter, Heart, Check, Trash2, X } from 'lucide-react';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import LoginPromptModal from '@/components/login-prompt-modal';
import { useWishlist } from '@/contexts/WishlistContext';

interface Category { id: number; name: string; slug: string; }
interface Product { id: number; name: string; slug: string; price: number; imageUrl?: string; rating: number; reviewCount: number; category: Category; }

interface ShopProps {
  categorySlug?: string;
  categorySlugs?: string[];
  showAllCategories?: boolean;
  categoryRoutes?: Record<string, string>;
  excludedCategorySlugs?: string[];
  categoryPage?: string;
  /** Hide the category sidebar — used where categories are picked on the parent page instead. */
  hideCategorySidebar?: boolean;
}

const Shop = ({ categorySlug, categorySlugs, showAllCategories = false, categoryRoutes = {}, excludedCategorySlugs = [], categoryPage, hideCategorySidebar = false }: ShopProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [wishlistProducts, setWishlistProducts] = useState<Set<number>>(new Set());
  const [removingProducts, setRemovingProducts] = useState<Set<number>>(new Set());
  const [actionMessage, setActionMessage] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { refresh: refreshWishlistCount } = useWishlist();
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

  useEffect(() => {
    if (!localStorage.getItem('cm_token')) return;
    api.get('/wishlist')
      .then(({ data }) => setWishlistProducts(new Set(data.map((item: { productId: number; product?: { id: number } }) => item.productId || item.product?.id))))
      .catch(() => setWishlistProducts(new Set()));
  }, []);

  const addToWishlist = async (product: Product) => {
    if (wishlistProducts.has(product.id)) return;
    setWishlistProducts((previous) => new Set(previous).add(product.id));
    try {
      await api.post('/wishlist', { productId: product.id });
      setActionMessage(`${product.name} added to wishlist.`);
      refreshWishlistCount();
    } catch (err: any) {
      setWishlistProducts((previous) => {
        const next = new Set(previous);
        next.delete(product.id);
        return next;
      });
      if (err.response?.status === 401) {
        setShowLoginPrompt(true);
      } else {
        setActionMessage(err.response?.data?.error || 'Failed to add to wishlist.');
      }
    }
  };

  const removeFromWishlist = async (product: Product) => {
    setRemovingProducts((previous) => new Set(previous).add(product.id));
    try {
      await api.delete(`/wishlist/${product.id}`);
      setWishlistProducts((previous) => {
        const next = new Set(previous);
        next.delete(product.id);
        return next;
      });
      setActionMessage(`${product.name} removed from wishlist.`);
      refreshWishlistCount();
    } catch (err: any) {
      setActionMessage(err.response?.data?.error || 'Failed to remove from wishlist.');
    } finally {
      setRemovingProducts((previous) => {
        const next = new Set(previous);
        next.delete(product.id);
        return next;
      });
    }
  };

  const toggleProduct = (productId: number) => {
    setSelectedProducts((previous) => {
      const next = new Set(previous);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const addSelectedToWishlist = async () => {
    const selected = products.filter((product) => selectedProducts.has(product.id));
    if (!selected.length) return;
    const productsToAdd = selected.filter((product) => !wishlistProducts.has(product.id));
    if (!productsToAdd.length) {
      setActionMessage('All selected products are already in your wishlist.');
      return;
    }
    setWishlistProducts((previous) => new Set([...previous, ...productsToAdd.map((product) => product.id)]));
    setActionMessage(`Adding ${productsToAdd.length} product${productsToAdd.length === 1 ? '' : 's'}...`);
    try {
      await Promise.all(productsToAdd.map((product) => api.post('/wishlist', { productId: product.id })));
      setActionMessage(`${productsToAdd.length} product${productsToAdd.length === 1 ? '' : 's'} added to wishlist.`);
      setSelectedProducts(new Set());
      refreshWishlistCount();
    } catch (err: any) {
      setWishlistProducts((previous) => {
        const next = new Set(previous);
        productsToAdd.forEach((product) => next.delete(product.id));
        return next;
      });
      if (err.response?.status === 401) setShowLoginPrompt(true);
      else setActionMessage('Some products could not be added.');
    }
  };

  useEffect(() => {
    if ((categoryPage || excludedCategorySlugs.length > 0) && !categoriesLoaded) return;
    setLoading(true);
    const params: Record<string, string> = { limit: '50', sort };
    // A ?category= slug that does not belong to this page falls back to the whole page.
    const activeCategory = categoryPage && selectedCategory !== 'all' && !categories.some((category) => category.slug === selectedCategory)
      ? 'all'
      : selectedCategory;
    if (categorySlug) params.category = categorySlug;
    else if (activeCategory !== 'all') params.category = activeCategory;
    else if (categorySlugs?.length) params.category = categorySlugs.join(',');
    // '__none__' matches no category, so a page with no categories yet shows nothing instead of every product.
    else if (categoryPage) params.category = categories.map((category) => category.slug).join(',') || '__none__';
    else if (excludedCategorySlugs.length > 0) {
      const availableSlugs = categories
        .map((category) => category.slug)
        .filter((slug) => !excludedCategorySlugs.includes(slug));
      params.category = availableSlugs.join(',');
    }
    const searchTimer = window.setTimeout(() => {
      if (searchQuery.trim()) params.search = searchQuery.trim();
      setSearchParams({ ...(activeCategory !== 'all' ? { category: activeCategory } : {}), ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}), sort }, { replace: true });
      api.get('/products', { params })
        .then(({ data }) => setProducts(data.products))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(searchTimer);
  }, [categoryPage, categoriesLoaded, categorySlug, categorySlugKey, categories, excludedCategorySlugKey, selectedCategory, searchQuery, sort, setSearchParams]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const scopedCategorySlugs = showAllCategories
    ? excludedCategorySlugs.length ? categories.map((category) => category.slug).filter((slug) => !excludedCategorySlugs.includes(slug)) : []
    : categorySlugs?.length ? categorySlugs : categorySlug ? [categorySlug] : [];
  const shopCategories = scopedCategorySlugs.length
    ? categories.filter((category) => scopedCategorySlugs.includes(category.slug))
    : categories;

  return (
    <main className="min-h-screen bg-cm-gray">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-cm-blue"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <Link to="/my-account" className="relative p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Sidebar */}
          {!hideCategorySidebar && (
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-cm-blue" />
                  <h3 className="font-bold text-cm-blue-dark">Categories</h3>
                </div>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-cm-blue text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      All Products
                    </button>
                  </li>
                  {shopCategories.map((cat) => (
                    <li key={cat.id}>
                      {categoryRoutes[cat.slug] ? (
                        <Link
                          to={categoryRoutes[cat.slug]}
                          className="block w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                        >
                          {cat.name}
                        </Link>
                      ) : (
                        <button
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.slug ? 'bg-cm-blue text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                          {cat.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-cm-blue-dark">
                  {categories.find((c) => c.slug === selectedCategory)?.name || 'All Products'}
                </h1>
                {hideCategorySidebar && categories.some((c) => c.slug === selectedCategory) && (
                  <button onClick={() => setSelectedCategory('all')} className="text-xs font-semibold uppercase tracking-widest text-cm-blue hover:underline">
                    Show all
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-gray-600">Sort by:</label>
                <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 bg-white rounded-lg border hover:bg-gray-50">
                  <option value="newest">Newest</option>
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
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
              <div className="mb-4 flex items-center justify-between rounded-lg bg-cm-blue px-4 py-3 text-sm text-white">
                <span>{selectedProducts.size} product{selectedProducts.size === 1 ? '' : 's'} selected</span>
                <button onClick={addSelectedToWishlist} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-cm-blue hover:bg-gray-100">
                  <Heart className="h-4 w-4" /> Add selected to wishlist
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="relative bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300 hover:-translate-y-1 flex flex-col group/card">
                    <label className="absolute z-10 m-3 flex cursor-pointer items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs shadow-sm">
                      <input type="checkbox" checked={selectedProducts.has(product.id)} onChange={() => toggleProduct(product.id)} className="accent-cm-blue" />
                      Select
                    </label>
                    <Link to={`/product/${product.slug}`} className="cursor-pointer">
                      <div className="aspect-[4/3] overflow-hidden bg-white flex items-center justify-center p-2 group-hover/card:bg-slate-50/50 transition-colors">
                        <img
                          src={resolveMediaUrl(product.imageUrl) || 'https://via.placeholder.com/400x300'}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-all duration-500"
                        />
                      </div>
                    </Link>
                    <div className="p-3.5 flex-grow flex flex-col justify-between border-t border-slate-50">
                      <div>
                        <Link to={`/product/${product.slug}`} className="cursor-pointer group">
                          <h3 className="font-semibold text-cm-blue-dark text-xs sm:text-sm tracking-tight mb-1 cursor-pointer group-hover:text-cm-blue transition-colors leading-snug line-clamp-2 min-h-[32px] sm:min-h-[36px]" title={product.name}>
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60">
                        <span className="text-sm sm:text-base font-bold text-cm-blue tracking-tight">{formatPrice(product.price)}</span>
                        {wishlistProducts.has(product.id) ? (
                          <div className="flex items-center gap-1.5">
                            <button disabled className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white sm:px-3 sm:py-2">
                              <Check className="h-3.5 w-3.5" />
                              <span>Added to wishlist</span>
                            </button>
                            <button
                              onClick={() => removeFromWishlist(product)}
                              disabled={removingProducts.has(product.id)}
                              aria-label={`Remove ${product.name} from wishlist`}
                              title="Remove from wishlist"
                              className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToWishlist(product)} className="flex items-center justify-center gap-1.5 rounded-lg bg-cm-blue px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-cm-blue-dark hover:shadow focus:ring-2 focus:ring-cm-blue/20 sm:px-3 sm:py-2">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Add to cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Shop;
