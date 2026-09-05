import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Check, Share2, Award, Truck, ShieldCheck, Heart, ArrowLeft } from 'lucide-react';
import api from '@/api/client';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  description?: string;
  imageUrl?: string;
  images?: string; // Stringified JSON array
  specifications?: string; // Stringified JSON object
  rating: number;
  reviewCount: number;
  stock: number;
  category?: { name: string; slug: string };
}

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [gallery, setGallery] = useState<string[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { refresh: refreshWishlistCount } = useWishlist();

  useEffect(() => {
    setLoading(true);
    // Use the get single product endpoint
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data);
        setMainImage(resolveMediaUrl(data.imageUrl) || 'https://via.placeholder.com/600x450');
        
        if (data.images) {
           try {
              const list = JSON.parse(data.images);
              if (Array.isArray(list)) setGallery(list.map((image) => resolveMediaUrl(image)));
           } catch { setGallery([]); }
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="inline-block mt-4 px-6 py-2 bg-cm-blue text-white rounded-xl">Back to Shop</Link>
      </div>
    );
  }

  // Parse specifications
  let specsObj: Record<string, string> = {};
  if (product.specifications) {
     try {
        specsObj = JSON.parse(product.specifications);
     } catch {
        specsObj = {};
     }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const addToWishlist = async () => {
    try {
      await api.post('/wishlist', { productId: product.id });
      alert('Added to wishlist');
      refreshWishlistCount();
    } catch (err: any) {
      if (err.response?.status === 401) setShowLoginPrompt(true);
      else alert(err.response?.data?.error || 'Failed to add to wishlist');
    }
  };

  const addToCart = async () => {
    try {
      await api.post('/wishlist', { productId: product.id });
      alert('Product added to cart!');
      refreshWishlistCount();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setShowLoginPrompt(true);
      } else {
        alert(err.response?.data?.error || 'Failed to add to cart.');
      }
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen pb-12">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      {/* Breadcrumb & Back Action */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Link to="/shop" className="flex items-center gap-1 text-cm-blue font-black text-xs mr-1 bg-cm-blue/5 px-2.5 py-1.5 rounded-lg hover:bg-cm-blue/10 transition-all">
             <ArrowLeft className="w-3.5 h-3.5" />
             <span>Back to List</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 mr-1" />
          
          <Link to="/" className="hover:text-cm-blue transition-colors">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/shop`} className="hover:text-cm-blue transition-colors">{product.category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-800 font-bold truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[resolveMediaUrl(product.imageUrl), ...gallery].filter(Boolean).map((img, i) => (
                  <button 
                     key={i} 
                     onClick={() => setMainImage(img || '')}
                     className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img ? 'border-cm-blue' : 'border-slate-100'}`}
                  >
                     <img src={img || ''} alt={`View ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="flex flex-col">
            <div className="pb-6 border-b border-slate-100">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            <div className="py-6 border-b border-slate-100 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-cm-blue">{formatPrice(product.price)}</span>
                <span className="text-xs text-slate-400 font-medium">Incl. all taxes</span>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden h-12">
                  <button 
                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
                     className="px-4 text-slate-600 hover:bg-slate-50 font-bold"
                  >-</button>
                  <span className="px-4 font-bold text-slate-800 w-12 text-center">{quantity}</span>
                  <button 
                     onClick={() => setQuantity(quantity + 1)}
                     className="px-4 text-slate-600 hover:bg-slate-50 font-bold"
                  >+</button>
                </div>

                <button onClick={addToCart} className="h-12 flex-1 bg-cm-blue hover:bg-cm-blue-dark text-white rounded-xl shadow-lg shadow-cm-blue/20 font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              <div className="flex gap-2">
                 <button onClick={addToWishlist} className="flex-1 h-11 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-sm text-slate-700 flex items-center justify-center gap-2 transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist
                 </button>
                 <button className="w-11 h-11 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* Micro value props grid */}
            <div className="mt-auto grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
               <div className="flex flex-col items-center text-center">
                  <Award className="w-6 h-6 text-cm-blue mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">Premium Quality</span>
               </div>
               <div className="flex flex-col items-center text-center">
                  <Truck className="w-6 h-6 text-cm-blue mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">Safe Delivery</span>
               </div>
               <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-6 h-6 text-cm-blue mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">Support Secure</span>
               </div>
            </div>
          </div>
        </div>

        {/* Continuous Information Flow - No Tabs */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
               <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Product Description</h2>
               <div className="prose prose-slate max-w-none text-slate-600 font-opensans leading-relaxed whitespace-pre-line">
                 {product.description || 'No description listed for this item yet.'}
               </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
               <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Technical Specifications</h2>
               <div className="overflow-hidden border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {Object.keys(specsObj).length > 0 ? (
                     Object.entries(specsObj).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 p-4 bg-white hover:bg-slate-50 transition-colors">
                          <div className="font-bold text-slate-800 text-sm">{key}</div>
                          <div className="col-span-2 text-slate-600 text-sm font-opensans">{value}</div>
                        </div>
                     ))
                  ) : (
                     <p className="p-4 text-slate-500 text-sm">No secondary specifications provided for this product.</p>
                  )}
               </div>
            </div>
          </div>

          {/* Side Trust/Features Column */}
          <div className="space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-black text-slate-900 mb-4 tracking-tight uppercase">Product Highlights</h3>
                <ul className="space-y-3">
                   {[
                      'Institutional Quality Verification',
                      'Safeguard Protective Loading',
                      'Manufacturer Defect Warranty',
                      'Standard Sizing Compatibility',
                      'Smooth Edge Cornering Finish'
                   ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-xs font-medium">
                         <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                         </div>
                         <span>{item}</span>
                      </li>
                   ))}
                </ul>
             </div>

             <div className="bg-gradient-to-br from-cm-blue to-cm-blue-dark rounded-3xl p-6 shadow-sm text-white">
                <Award className="w-8 h-8 text-amber-400 mb-2" />
                <h4 className="font-black text-base tracking-tight mb-1">Guarantee of Trust</h4>
                <p className="text-white/80 text-[11px] font-opensans leading-relaxed">
                   Formulated in alignment with modular institutional templates, targeting maximum structural durability for high traffic campus environments.
                </p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
