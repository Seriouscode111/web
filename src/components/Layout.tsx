import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Phone, MessageCircle, HelpCircle, X, Headphones, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Layout = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Help Component */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-72 bg-white dark:bg-[#0d0d0d] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 bg-black dark:bg-[#00FF00] text-white dark:text-black">
                <h3 className="text-sm font-black uppercase tracking-widest italic">Operations Support</h3>
                <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest mt-1">24/7 Digital Intake</p>
              </div>
              <div className="p-4 space-y-2">
                <a 
                  href="tel:+233542541199"
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Call Agent</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">Live Voice Link</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/233542541199?text=I%20need%20help%20with%20my%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">WhatsApp Help</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">Instant Message</p>
                  </div>
                </a>

                <Link 
                  to="/chat?seller=sneakerx"
                  onClick={() => setIsHelpOpen(false)}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Internal Chat</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">App Messaging</p>
                  </div>
                </Link>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 text-center">
                <Link 
                  to="/contact" 
                  onClick={() => setIsHelpOpen(false)}
                  className="text-[10px] font-black text-indigo-600 dark:text-[#00FF00] uppercase tracking-widest hover:underline"
                >
                  View All Contact Points
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className={`group relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            isHelpOpen 
              ? 'bg-black text-white dark:bg-white dark:text-black rotate-90 scale-90' 
              : 'bg-[#00FF00] text-black hover:scale-110 hover:rotate-12'
          }`}
        >
          {!isHelpOpen && (
            <span className="absolute right-full mr-4 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Need Help?
            </span>
          )}
          {isHelpOpen ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};
