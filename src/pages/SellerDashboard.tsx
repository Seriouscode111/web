import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, User, Order } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';
import { 
  Package, Plus, Trash2, Edit3, 
  LayoutGrid, List, AlertCircle, 
  Image as ImageIcon, Check, X,
  ShieldCheck, ShieldAlert, Shield, Clock,
  Truck, Printer, Phone, ShoppingBag, MessageSquare,
  Settings, Camera, User as UserIcon, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { TrackingModal } from '../components/TrackingModal';
import { InvoiceModal } from '../components/InvoiceModal';

export const SellerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [idDocument, setIdDocument] = useState<string | null>(user?.idDocument || null);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [profileFormData, setProfileFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessType: user?.businessType || '',
    avatar: user?.avatar || '',
    bannerImage: user?.bannerImage || ''
  });

  useEffect(() => {
    if (user) {
      setProfileFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessType: user.businessType || '',
        avatar: user.avatar || '',
        bannerImage: user.bannerImage || ''
      });
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [] as string[]
  });

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingId(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setIdDocument(dataUrl);
      
      if (user) {
        try {
          await updateProfile({ idDocument: dataUrl, verificationStatus: 'pending' });
          setIsUploadingId(false);
          alert("ID successfully uploaded! Please wait for admin verification.");
        } catch (error) {
          console.error("Error updating ID status:", error);
          setIsUploadingId(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList: File[] = (Array.from(files) as File[]).slice(0, 3);
    
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 3)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'bannerImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileFormData(prev => ({
        ...prev,
        [field]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile(profileFormData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Fetch from Storage
    const allProducts = storage.get<Product>(STORAGE_KEYS.PRODUCTS);
    setProducts(allProducts.filter(p => p.sellerId === user.id));

    const allOrders = storage.get<Order>(STORAGE_KEYS.ORDERS);
    setOrders(allOrders.filter(o => o.sellerIds.includes(user.id)));
  }, [user]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      images: product.images || []
    });
    setIsAddModalOpen(true);
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const images = formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

    if (editingProduct) {
      // Update Logic
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        images: images,
        stock: parseInt(formData.stock),
      };

      storage.updateOne<Product>(STORAGE_KEYS.PRODUCTS, editingProduct.id, updatedProduct);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
    } else {
      // Add Logic
      const newProduct: Omit<Product, 'id'> = {
        sellerId: user.id,
        sellerName: user.name,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        images: images,
        stock: parseInt(formData.stock),
        rating: 0,
        reviewsCount: 0,
        createdAt: new Date().toISOString()
      };

      const insertedProduct = storage.insertOne<Product>(STORAGE_KEYS.PRODUCTS, newProduct);
      setProducts(prev => [insertedProduct, ...prev]);
    }

    setIsAddModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '', description: '', price: '', category: '', 
      stock: '', images: []
    });
  };

  const handleDelete = async (id: string) => {
    storage.deleteOne<Product>(STORAGE_KEYS.PRODUCTS, id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const isVerified = user?.verificationStatus === 'verified';
  const status = user?.verificationStatus || 'idle';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Verification Status Banner */}
      {!isVerified && (
        <div className={`p-6 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 ${
          status === 'pending' ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20' : status === 'rejected' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20' : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/20'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
            }`}>
              {status === 'pending' ? <Shield className="h-7 w-7" /> : status === 'rejected' ? <ShieldAlert className="h-7 w-7" /> : <Shield className="h-7 w-7" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {status === 'pending' ? 'Verification Pending' : status === 'rejected' ? 'Verification Rejected' : 'Verify Your Identity'}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {status === 'pending' 
                  ? 'We are currently reviewing your identification. You will be able to list products once verified.' 
                  : status === 'rejected' 
                  ? 'Your verification was rejected. Please upload a valid identification card again.' 
                  : 'To start selling, you must provide a valid identification card for admin verification.'}
              </p>
            </div>
          </div>
          
          {(status === 'idle' || status === 'rejected') && (
            <label className="flex items-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 cursor-pointer">
              <Plus className="h-5 w-5" />
              <span>{isUploadingId ? 'Uploading...' : 'Upload ID Card'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleIdUpload} disabled={isUploadingId} />
            </label>
          )}

          {status === 'pending' && (
            <div className="bg-white/50 px-6 py-3 rounded-2xl border border-amber-200">
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Review in progress
              </span>
            </div>
          )}
        </div>
      )}

      {isVerified && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[2rem] flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Verified Seller</h3>
            <p className="text-sm font-medium text-emerald-700/70 dark:text-emerald-400/70">Your account is fully verified. You can list and manage products freely.</p>
          </div>
        </div>
      )}

      <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Orders
            {orders.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full ring-2 ring-white">{orders.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Profile
          </button>
        </div>
        
        {activeTab === 'products' && (
          <button 
            onClick={() => {
              if (!isVerified) {
                alert("Verification Required: Please upload your ID and wait for admin approval before listing products.");
                return;
              }
              setIsAddModalOpen(true);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black transition-all shadow-xl ${
              isVerified 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {activeTab === 'products' ? (
        <React.Fragment key="products-tab">
          {/* Product List Header */}
          <div className="flex justify-between items-center bg-white dark:bg-[#0d0d0d] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-50 dark:bg-white/5 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600 dark:text-[#00FF00]' : 'text-gray-400'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600 dark:text-[#00FF00]' : 'text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{products.length} Products</span>
            </div>
          </div>

          {/* Grid Display */}
          {products.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
              {products.map((product, index) => (
                <motion.div
                  layout
                  key={`seller-product-${product.id}-${index}`}
                  className={`bg-white dark:bg-[#0d0d0d] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm group hover:shadow-xl transition-all duration-300 ${
                    viewMode === 'list' ? 'flex items-center p-4 gap-6' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'w-24 h-24 rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden' : 'h-48 overflow-hidden'}>
                    <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <div className={`p-6 flex-grow ${viewMode === 'list' ? 'p-0' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-[#00FF00] bg-indigo-50 dark:bg-[#00FF00]/10 px-2 py-0.5 rounded-full">{product.category}</span>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">{product.name}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-[#00FF00] hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                              handleDelete(product.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/40 shadow-sm"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Price</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Stock</p>
                        <p className={`text-sm font-black ${product.stock < 5 ? 'text-red-500' : 'text-emerald-500 dark:text-emerald-400'}`}>{product.stock} left</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't listed any products yet</h3>
              <p className="text-gray-400 max-w-xs mx-auto mb-8 font-medium">Start selling your products by adding them to the marketplace.</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </React.Fragment>
      ) : activeTab === 'orders' ? (
        <div key="orders-tab" className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order, orderIdx) => (
              <div key={`seller-order-${order.id}-${orderIdx}`} className="bg-white dark:bg-[#0d0d0d] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-black text-indigo-600 dark:text-[#00FF00] uppercase tracking-widest">#{order.id}</span>
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase">{order.status}</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{order.items?.[0]?.name || 'Unknown Item'} {order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-400 font-medium">Buyer: {order.shippingAddress?.ghanaPostGps || 'Customer'}</p>
                    <a 
                      href="tel:+233542541199"
                      className="text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-[#00FF00] font-bold underline"
                    >
                      Call Buyer
                    </a>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="mt-2 text-[10px] font-black text-indigo-600 dark:text-[#00FF00] uppercase tracking-widest bg-indigo-50 dark:bg-[#00FF00]/10 inline-block px-3 py-1 rounded-lg">
                      Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right mr-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Income</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/chat?seller=${order.buyerId}`}
                      className="p-3 bg-white dark:bg-white/5 text-indigo-600 dark:text-[#00FF00] border border-indigo-50 dark:border-white/10 rounded-2xl hover:bg-indigo-600 dark:hover:bg-[#00FF00] hover:text-white dark:hover:text-black transition-all"
                      title="Chat with Buyer"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => setTrackingOrder(order)}
                      className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
                      title="Track Package"
                    >
                      <Truck className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => setInvoiceOrder(order)}
                      className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-900 hover:text-white transition-all"
                      title="View Invoice"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                    {order.deliveryContact && (
                      <a 
                        href={`tel:${order.deliveryContact}`}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"
                        title="Contact Courier"
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-400 max-w-xs mx-auto font-medium">As soon as customers buy your products, they will appear here.</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          key="profile-tab"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="relative">
              <div className="h-64 w-full rounded-[2.5rem] bg-gray-100 overflow-hidden relative group border-4 border-white shadow-lg">
                {profileFormData.bannerImage ? (
                  <img src={profileFormData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                    <ImageIcon className="h-12 w-12 text-indigo-200" />
                  </div>
                )}
                <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-indigo-600 p-3 rounded-2xl cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleProfileImageUpload(e, 'bannerImage')} />
                </label>
              </div>

              <div className="absolute -bottom-12 left-12 group">
                <div className="w-32 h-32 rounded-[2rem] bg-indigo-600 border-4 border-white shadow-xl overflow-hidden relative">
                  {profileFormData.avatar ? (
                    <img src={profileFormData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                      {profileFormData.name.charAt(0)}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="h-6 w-6 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleProfileImageUpload(e, 'avatar')} />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Info */}
              <div className="bg-white dark:bg-[#0d0d0d] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF00] flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Business Identity
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 dark:text-gray-600" />
                      <input 
                        type="text" 
                        value={profileFormData.name}
                        onChange={e => setProfileFormData({...profileFormData, name: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization</label>
                    <input 
                      type="text" 
                      value={profileFormData.businessType}
                      onChange={e => setProfileFormData({...profileFormData, businessType: e.target.value})}
                      placeholder="e.g. Rare Collectibles, Tech Gear"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-[#0d0d0d] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-[#00FF00] flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Communication Hub
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dispatch Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 dark:text-gray-600" />
                      <input 
                        type="email" 
                        value={profileFormData.email}
                        onChange={e => setProfileFormData({...profileFormData, email: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Voice Comms (Phone)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 dark:text-gray-600" />
                      <input 
                        type="tel" 
                        value={profileFormData.phone}
                        onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSavingProfile}
                className="bg-indigo-600 text-white px-12 py-4 rounded-3xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center space-x-3 disabled:bg-gray-400"
              >
                {isSavingProfile ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Save Mission Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div key="add-product-modal-container" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              key="add-product-modal-backdrop"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsAddModalOpen(false)} 
            />
            <motion.div 
              key="add-product-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#0d0d0d] w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar border border-gray-100 dark:border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                  {editingProduct && (
                    <button 
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this product permanently?')) {
                          handleDelete(editingProduct.id);
                          setIsAddModalOpen(false);
                          setEditingProduct(null);
                        }
                      }}
                      className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline mt-1"
                    >
                      Delete Product
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddOrUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" required 
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    required rows={3}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price ($)</label>
                  <input 
                    type="number" step="0.01" required 
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <input 
                    type="text" required 
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Electronics, Fashion"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                  <input 
                    type="number" required 
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>

                {/* Images Upload Section */}
                <div className="md:col-span-2 mt-4 space-y-4">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    Product Images (Up to 3)
                  </h3>
                  
                  <div className="flex flex-wrap gap-4">
                    {formData.images.map((img, imgIdx) => (
                      <div key={`modal-form-image-${imgIdx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-100 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(imgIdx)}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {formData.images.length < 3 && (
                      <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                        <Plus className="h-6 w-6 text-gray-300 group-hover:text-indigo-400" />
                        <span className="text-[10px] font-black text-gray-400 group-hover:text-indigo-400 mt-1 uppercase">Add</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                  {formData.images.length === 0 && (
                    <p className="text-xs text-gray-400 font-medium italic">At least one image is recommended. Defaults to placeholder if empty.</p>
                  )}
                </div>

                <button 
                  className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-3xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-6"
                >
                  {editingProduct ? 'Update Product Details' : 'Confirm Listing'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
