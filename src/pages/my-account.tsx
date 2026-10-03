import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, LogOut, Edit, Package, Check, Send } from 'lucide-react';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import { useWishlist } from '@/contexts/WishlistContext';
import { getUserSession, isUserLoggedIn, clearUserSession, setUserSession, getUserToken } from '@/lib/auth-session';

interface Address {
  id: number;
  type: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  orderitem: { id: number; qty: number; product: { name: string } }[];
  items?: { id: number; qty: number; product: { name: string } }[];
}

type AddressForm = Omit<Address, 'id'>;

const emptyAddress: AddressForm = {
  type: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const MyAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = getUserSession();
  const isLoggedIn = isUserLoggedIn();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    initialTab && ['profile', 'orders', 'wishlist', 'addresses'].includes(initialTab) ? initialTab : 'profile'
  );

  const { items: wishlist, loading: wishlistLoading, removeProduct, removeDesign } = useWishlist();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', phone: currentUser?.phone || '', institution: currentUser?.institution || '' });

  const handleLogout = () => {
    clearUserSession();
    navigate('/login');
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    setOrdersLoading(true);
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'addresses') return;
    setAddressesLoading(true);
    api.get('/addresses')
      .then(({ data }) => setAddresses(data))
      .catch((err: any) => setAddressError(err.response?.data?.error || 'Failed to load addresses.'))
      .finally(() => setAddressesLoading(false));
  }, [activeTab, isLoggedIn]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'wishlist', 'addresses'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      const token = getUserToken() || '';
      setUserSession(token, data);
      setProfileEditing(false);
      window.location.reload();
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Profile update failed.');
    } finally {
      setProfileSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setAddressError('');
    setAddressFormOpen(true);
  };

  const openEditAddressForm = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      type: address.type,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: Boolean(address.isDefault),
    });
    setAddressError('');
    setAddressFormOpen(true);
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddressSaving(true);
    setAddressError('');
    try {
      const request = editingAddressId
        ? api.put(`/addresses/${editingAddressId}`, addressForm)
        : api.post('/addresses', addressForm);
      const { data } = await request;
      setAddresses((current) => {
        if (data.isDefault) {
          const updated = current.map((address) => ({ ...address, isDefault: false }));
          return editingAddressId
            ? updated.map((address) => (address.id === editingAddressId ? data : address))
            : [data, ...updated];
        }
        return editingAddressId
          ? current.map((address) => (address.id === editingAddressId ? data : address))
          : [...current, data];
      });
      setAddressFormOpen(false);
    } catch (err: any) {
      setAddressError(err.response?.data?.error || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address.id === id,
        })).sort((a, b) => (b.id === id ? 1 : 0) - (a.id === id ? 1 : 0))
      );
    } catch (err: any) {
      setAddressError(err.response?.data?.error || 'Failed to set default address.');
    }
  };

  const deleteAddress = async (id: number) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (err: any) {
      setAddressError(err.response?.data?.error || 'Failed to delete address.');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-cm-gray flex items-center justify-center py-4">
        <div className="bg-white rounded-2xl p-8 shadow-card max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cm-blue/10 flex items-center justify-center">
            <User className="w-10 h-10 text-cm-blue" />
          </div>
          <h1 className="text-2xl font-bold text-cm-blue-dark mb-4">
            Welcome to Campus Mart
          </h1>
          <p className="text-gray-600 mb-8">
            Please login or create an account to access your profile, orders, and wishlist.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="btn-primary w-full block">
              Login
            </Link>
            <Link to="/registration" className="btn-secondary w-full block">
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cm-gray py-8">
      <div className="w-full mx-auto px-2 sm:px-4">
        <h1 className="text-3xl font-bold text-cm-blue-dark mb-8">My Account</h1>

        <div className="flex flex-col lg:flex-row gap-2">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-6 bg-cm-blue text-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-center">{currentUser?.name || 'User'}</h2>
                <p className="text-white/80 text-center text-sm">{currentUser?.email || ''}</p>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                          ? 'bg-cm-blue text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        {tab.id === 'wishlist' && wishlist.length > 0 && (
                          <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-cm-blue/10 text-cm-blue'}`}>
                            {wishlist.length}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl p-8 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-cm-blue-dark">Profile Information</h2>
                  <button onClick={() => { setProfileEditing(true); setProfileForm({ name: currentUser?.name || '', phone: currentUser?.phone || '', institution: currentUser?.institution || '' }); }} className="flex items-center gap-2 text-cm-blue hover:underline">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                {profileError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{profileError}</div>}
                {profileEditing ? (
                  <form onSubmit={saveProfile} className="space-y-4">
                    <input required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="form-input" placeholder="Full name" />
                    <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="form-input" placeholder="Phone" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" minLength={10} maxLength={14} />
                    <input value={profileForm.institution} onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })} className="form-input" placeholder="Institution" />
                    <div className="flex gap-3"><button type="submit" disabled={profileSaving} className="btn-primary disabled:opacity-60">{profileSaving ? 'Saving...' : 'Save Changes'}</button><button type="button" onClick={() => setProfileEditing(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button></div>
                  </form>
                ) : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-semibold text-cm-blue-dark">{currentUser?.name || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-semibold text-cm-blue-dark">{currentUser?.email || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-semibold text-cm-blue-dark">{currentUser?.phone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Institution</label>
                    <p className="font-semibold text-cm-blue-dark">{currentUser?.institution || '—'}</p>
                  </div>
                </div>}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl p-8 shadow-card">
                <h2 className="text-xl font-bold text-cm-blue-dark mb-6">My Orders</h2>
                {ordersLoading ? (
                  <p className="text-sm text-gray-500">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-600">No orders yet.</p>
                    <p className="mt-2 text-sm text-gray-500">Completed institutional orders will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const items = order.items || order.orderitem || [];
                      const totalQty = items.reduce((total, item) => total + (item?.qty || 0), 0);
                      return (
                        <div key={order.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-bold text-cm-blue-dark">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-cm-blue">₹{order.total.toLocaleString('en-IN')}</p>
                              <span className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            {totalQty} item{totalQty === 1 ? '' : 's'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl p-8 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-cm-blue-dark">
                    My Wishlist {wishlist.length > 0 && <span className="text-base font-semibold text-gray-400">({wishlist.length})</span>}
                  </h2>
                  {wishlist.length > 0 && (
                    <Link
                      to="/request-quote?fromWishlist=true"
                      className="btn-primary text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
                    >
                      <Send className="w-4 h-4" /> Request Quote for Wishlist
                    </Link>
                  )}
                </div>
                {wishlistLoading ? (
                  <div className="text-sm text-slate-500">Loading wishlist...</div>
                ) : wishlist.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-600 font-medium">Your wishlist is empty.</p>
                    <p className="mt-1 text-sm text-gray-500">Save products or custom designs while browsing our catalog.</p>
                    <Link to="/shop" className="btn-primary inline-block mt-4 text-sm">
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {wishlist.map((item) => item.product ? (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4 flex gap-4 hover:border-slate-300 transition-colors">
                        <Link to={`/product/${item.product.slug}`} className="shrink-0">
                          <img
                            src={resolveMediaUrl(item.product.imageUrl) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'}
                            alt={item.product.name}
                            onError={(e) => {
                              const fallback = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
                              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                            }}
                            className="w-20 h-20 object-cover rounded-lg bg-slate-50 border border-slate-100"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.product.slug}`} className="font-semibold text-cm-blue-dark hover:text-cm-blue line-clamp-1">
                            {item.product.name}
                          </Link>
                          <p className="text-cm-blue font-bold mt-1">₹{item.product.price.toLocaleString()}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <Link
                              to={`/request-quote?product=${encodeURIComponent(item.product.name)}&qty=1`}
                              className="text-xs font-semibold text-cm-blue hover:underline"
                            >
                              Request Quote
                            </Link>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => removeProduct(item.product!.id)}
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4 flex gap-4 hover:border-slate-300 transition-colors">
                        {(() => {
                          const [pageSlug, cardSlug] = (item.designKey || '').split(':');
                          const targetUrl = pageSlug && cardSlug ? `/${pageSlug}/${cardSlug}` : (item.pageSlug ? `/${item.pageSlug}` : null);
                          const thumbImg = (
                            <img
                              src={resolveMediaUrl(item.designImage || undefined) || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80'}
                              alt={item.designTitle || 'Design'}
                              onError={(e) => {
                                const fallback = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80';
                                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                              }}
                              className="w-20 h-20 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                            />
                          );
                          return (
                            <>
                              {targetUrl ? (
                                <Link to={targetUrl} className="shrink-0 hover:opacity-90 transition-opacity">
                                  {thumbImg}
                                </Link>
                              ) : (
                                thumbImg
                              )}
                              <div className="flex-1 min-w-0">
                                {targetUrl ? (
                                  <Link to={targetUrl} className="font-semibold text-cm-blue-dark hover:text-cm-blue line-clamp-1">
                                    {item.designTitle || 'Custom Design'}
                                  </Link>
                                ) : (
                                  <h3 className="font-semibold text-cm-blue-dark line-clamp-1">{item.designTitle || 'Custom Design'}</h3>
                                )}
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Saved Design</p>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                  <Link
                                    to="/request-quote?fromWishlist=true"
                                    className="text-xs font-semibold text-cm-blue hover:underline"
                                  >
                                    Quote Design
                                  </Link>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => removeDesign(item.designKey!)}
                                    className="text-xs font-semibold text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl p-8 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-cm-blue-dark">Saved Addresses</h2>
                  <button onClick={openNewAddressForm} className="btn-primary text-sm">Add New Address</button>
                </div>
                {addressError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{addressError}</div>}
                {addressFormOpen && (
                  <form onSubmit={saveAddress} className="mb-6 border rounded-lg p-4 space-y-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input required value={addressForm.type} onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })} className="form-input" placeholder="Label (Home, Office...)" />
                      <input required inputMode="numeric" pattern="[1-9][0-9]{5}" minLength={6} maxLength={6} value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="form-input" placeholder="6-digit pincode" />
                    </div>
                    <input required value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} className="form-input" placeholder="Address line 1" />
                    <input value={addressForm.line2 || ''} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} className="form-input" placeholder="Address line 2 (optional)" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="form-input" placeholder="City" />
                      <input required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="form-input" placeholder="State" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="addressIsDefault"
                        checked={Boolean(addressForm.isDefault)}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-cm-blue focus:ring-cm-blue"
                      />
                      <label htmlFor="addressIsDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Set as default address
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={addressSaving} className="btn-primary disabled:opacity-60">{addressSaving ? 'Saving...' : editingAddressId ? 'Save Changes' : 'Add Address'}</button>
                      <button type="button" onClick={() => setAddressFormOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                    </div>
                  </form>
                )}
                {addressesLoading ? <p className="text-sm text-gray-500">Loading addresses...</p> : addresses.length === 0 ? (
                  <p className="text-sm text-gray-500">No saved addresses. Add an address to get started.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className={`border rounded-lg p-4 transition-all ${address.isDefault ? 'border-cm-blue bg-blue-50/20 shadow-sm' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-cm-blue-dark">{address.type}</span>
                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 bg-cm-blue text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Default
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{[address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ')}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <button onClick={() => openEditAddressForm(address)} className="text-sm text-cm-blue hover:underline">Edit</button>
                          <button onClick={() => deleteAddress(address.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                          {!address.isDefault && (
                            <button onClick={() => setDefaultAddress(address.id)} className="text-sm text-gray-600 hover:text-cm-blue ml-auto font-medium">Set as Default</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyAccount;
