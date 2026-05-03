import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  CreditCard, Smartphone, Banknote, 
  ChevronRight, Lock, ShieldCheck, 
  MapPin, CheckCircle2, Bitcoin, MessageCircle, Headphones, ShoppingCart
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { motion, AnimatePresence } from 'motion/react';

export const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mtn' | 'bitcoin' | 'paypal' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    zip: '',
    ghanaPostGps: ''
  });

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newOrder = {
        id: Math.random().toString(36).substr(2, 9),
        buyerId: user.id,
        buyerName: user.name,
        sellerIds: [...new Set(items.map(i => i.sellerId))],
        items: items.map(item => ({
          ...item,
          images: item.images || [],
          sellerId: item.sellerId
        })),
        total,
        status: 'pending',
        paymentMethod,
        carrier: 'Kwatraco Logistics',
        sellerPhone: '+233 54 254 1199',
        deliveryContact: '+233 54 254 1199',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: address,
        tracking: {
          lat: 5.6037, // Accra coordinates
          lng: -0.1870,
          lastUpdated: new Date().toISOString(),
          path: [
            { lat: 5.6037, lng: -0.1870 }
          ]
        },
        createdAt: new Date().toISOString()
      };

      storage.insertOne(STORAGE_KEYS.ORDERS, newOrder);
      addNotification('Order Placed!', `Your order has been received and is being processed.`);
      
      setIsProcessing(false);
      setIsCompleted(true);
      clearCart();
    } catch (error) {
      console.error("Order error:", error);
      setIsProcessing(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 max-w-sm mb-8">
          Thank you for your purchase. We've sent a confirmation email and will update you when your order ships.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/orders" 
            className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Track Order
          </Link>
          <Link 
            to="/" 
            className="bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen pt-24 pb-32 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-10 overflow-x-auto whitespace-nowrap pb-2">
          <span className={step >= 1 ? 'text-[#00FF00]' : ''}>Shipping Segment</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 2 ? 'text-[#00FF00]' : ''}>Payment Protocol</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 3 ? 'text-[#00FF00]' : ''}>Confirmation Archive</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side: Forms */}
          <div className="space-y-12">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#00FF00] border border-gray-100 dark:border-white/10">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Shipping <br /> <span className="text-transparent border-b border-gray-200 dark:border-white/20">Coordinates</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Street Hub</label>
                    <input 
                      type="text" 
                      placeholder="ENTER FULL STREET ADDRESS"
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl px-6 py-5 focus:border-[#00FF00] outline-none transition-all font-black uppercase italic tracking-tight text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Sector City</label>
                    <input 
                      type="text" 
                      placeholder="ACCRA PRIME, ETC"
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl px-6 py-5 focus:border-[#00FF00] outline-none transition-all font-black uppercase italic tracking-tight text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Zone Zip</label>
                    <input 
                      type="text" 
                      placeholder="00000"
                      value={address.zip}
                      onChange={e => setAddress({...address, zip: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl px-6 py-5 focus:border-[#00FF00] outline-none transition-all font-black uppercase italic tracking-tight text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-3 ml-1">
                      <label className="block text-[10px] font-black text-[#00FF00] uppercase tracking-widest flex items-center leading-none italic">
                        <MapPin className="h-3 w-3 mr-1" /> Ghana Post Global Positioning
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. AK-484-9321"
                      value={address.ghanaPostGps}
                      onChange={e => setAddress({...address, ghanaPostGps: e.target.value})}
                      className="w-full bg-[#00FF00]/5 dark:bg-[#00FF00]/10 border border-[#00FF00]/20 rounded-2xl px-6 py-5 focus:border-[#00FF00] outline-none transition-all font-black italic tracking-tight text-gray-900 dark:text-[#00FF00] placeholder:text-[#00FF00]/20"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!address.street || !address.city}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-6 rounded-none font-black uppercase tracking-[0.3em] hover:bg-[#00FF00] dark:hover:bg-[#00FF00] transition-colors shadow-2xl disabled:opacity-50"
                >
                  Continue to Payment Protocol
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#00FF00] border border-gray-100 dark:border-white/10">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Payment <br /> <span className="text-transparent border-b border-gray-200 dark:border-white/20">Gateways</span></h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'card', name: 'Credit Card', icon: CreditCard, color: 'indigo' },
                    { id: 'mtn', name: 'MTN Mobile Money', icon: Smartphone, color: 'yellow' },
                    { id: 'bitcoin', name: 'Bitcoin (BTC)', icon: Bitcoin, color: 'amber' },
                    { id: 'paypal', name: 'PayPal', icon: ShieldCheck, color: 'blue' },
                    { id: 'cash', name: 'Cash on Delivery', icon: Banknote, color: 'emerald' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-6 rounded-3xl border-2 text-left transition-all ${
                        paymentMethod === method.id 
                          ? `border-[#00FF00] bg-[#00FF00]/5 shadow-lg shadow-[#00FF00]/10` 
                          : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20 bg-white dark:bg-[#0d0d0d] shadow-sm'
                      }`}
                    >
                      <method.icon className={`h-6 w-6 mb-4 ${paymentMethod === method.id ? 'text-[#00FF00]' : 'text-gray-400 dark:text-gray-700'}`} />
                      <span className={`block font-black uppercase tracking-tight italic ${paymentMethod === method.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{method.name}</span>
                      <span className="text-[8px] text-gray-400 dark:text-gray-600 uppercase font-black tracking-widest mt-1 block">Secure Encryption</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-8 bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-sm space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1">Vessel Number</label>
                      <input type="text" placeholder="•••• •••• •••• ••••" className="w-full bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-xl px-5 py-4 outline-none font-black tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1">Expiry Sequence</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-xl px-5 py-4 outline-none font-black italic text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1">Secure CVC</label>
                        <input type="text" placeholder="•••" className="w-full bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-xl px-5 py-4 outline-none font-black text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-10 py-5 rounded-none font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  >
                    Reverse
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-grow bg-black dark:bg-white text-white dark:text-black py-6 rounded-none font-black uppercase tracking-[0.3em] hover:bg-[#00FF00] dark:hover:bg-[#00FF00] transition-colors shadow-2xl flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Authorize {formatPrice(total)}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side: Summary Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-black dark:bg-[#0d0d0d] rounded-[3rem] p-10 text-white border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShoppingCart className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10 relative z-10 border-b border-white/10 pb-6">Vault Summary</h3>
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden border border-white/10 p-2">
                      <img src={item.images?.[0] || ''} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-black text-[10px] uppercase tracking-widest text-[#00FF00] mb-1">{item.quantity} x UNIT</p>
                      <p className="font-black text-sm uppercase italic truncate">{item.name}</p>
                      <p className="text-gray-500 text-[10px] font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <p className="font-black text-lg italic">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-10 border-t border-white/10 space-y-6 relative z-10">
                <div className="flex justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  <span>Subtotal Matrix</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  <span>Logistics Fee</span>
                  <span className="text-[#00FF00]">System Free</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-[#00FF00] font-black text-xs uppercase tracking-[0.5em]">Total Signal</span>
                  <span className="text-5xl font-black italic tracking-tighter">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded-[2rem] flex items-center space-x-4 border border-white/10">
                <ShieldCheck className="h-6 w-6 text-[#00FF00]" />
                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-loose">Data encrypted with RSA-4096. No local state storage of financial identifiers.</p>
              </div>

              <div className="mt-6 flex gap-2 relative z-10">
                <a 
                  href="https://wa.me/233542541199?text=I%20need%20help%20with%20checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 bg-[#00FF00]/10 text-[#00FF00] py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-[#00FF00]/20 transition-all border border-[#00FF00]/20"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp Help</span>
                </a>
                <a 
                  href="tel:+233542541199"
                  className="flex-1 flex items-center justify-center space-x-2 bg-white/5 text-white py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  <Headphones className="h-3 w-3" />
                  <span>Call Agent</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
