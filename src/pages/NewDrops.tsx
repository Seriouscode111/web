import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Star, ArrowRight, Bell, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { storage, STORAGE_KEYS } from '../services/storage';
import { Product } from '../types';

export const NewDrops = () => {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest products from Storage
    const allProducts = storage.get<Product>(STORAGE_KEYS.PRODUCTS);
    const sortedProducts = allProducts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);
    
    setProducts(sortedProducts);
    setLoading(false);
  }, []);

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen pt-24 pb-32 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <div>
            <p className="text-[#00FF00] font-black uppercase tracking-[0.5em] text-xs mb-8">Exclusive Releases</p>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
              New <br /> <span className="text-transparent border-b-2 border-gray-200 dark:border-white/20">Drop Status</span>
            </h1>
          </div>
          <div className="mt-8 md:mt-0 flex items-center space-x-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl backdrop-blur-xl">
             <div className="w-10 h-10 bg-[#00FF00] rounded-lg flex items-center justify-center text-black">
                <Bell className="h-5 w-5" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#00FF00]">Notify Me</p>
                <p className="text-xs font-bold text-gray-400">Join the priority queue</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {products.map((drop, i) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={drop.id}
              className="group relative bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/5 overflow-hidden rounded-[3.5rem] flex flex-col md:flex-row shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300"
            >
              <div className="w-full md:w-1/2 aspect-square bg-gray-50 dark:bg-black/20 flex items-center justify-center p-12 overflow-hidden">
                <motion.img 
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  src={drop.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'} 
                  alt={drop.name} 
                  className="w-full h-full object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                <div className="flex items-center space-x-3 mb-4">
                   <span className={`w-2 h-2 rounded-full animate-pulse bg-[#00FF00]`} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF00]">Active</span>
                   <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">— Live Now</span>
                </div>
                
                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-4 leading-tight">{drop.name}</h3>
                <p className="text-2xl font-black text-gray-400 mb-8">{formatPrice(drop.price)}</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => addItem({ ...drop, quantity: 1 })}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] hover:bg-[#00FF00] dark:hover:bg-[#00FF00] transition-colors rounded-xl flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Vault</span>
                  </button>
                  <div className="flex gap-2">
                    <Link to={`/product/${drop.id}`} className="flex-1 py-4 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white font-black uppercase tracking-widest text-[8px] transition-colors flex items-center justify-center space-x-2 border border-gray-100 dark:border-white/5 rounded-xl">
                      <span>Observe</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <a 
                      href={`https://wa.me/233542541199?text=Inquiry about: ${drop.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-widest text-[8px] transition-colors flex items-center justify-center space-x-2 rounded-xl"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
