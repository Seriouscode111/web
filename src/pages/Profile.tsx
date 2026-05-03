import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { 
  User as UserIcon, Mail, Phone, Shield, 
  Settings, Bell, CreditCard, ChevronRight,
  LogOut, Camera, Check, Palette, Sun, Moon, Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { currency: currentCurrency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  const menuItems = [
    { id: 'orders', label: 'Orders History', icon: Package, adminOnly: false },
    { id: 'display', label: 'Display Settings', icon: Palette, adminOnly: false },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, adminOnly: true },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, adminOnly: true },
    { id: 'security', label: 'Security & Privacy', icon: Shield, adminOnly: true },
    { id: 'account', label: 'Personal Information', icon: Settings, adminOnly: false }
  ];

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({ ...prev, avatar: dataUrl }));
      // Automatically save the avatar update for better UX, or let user click save
      updateProfile({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-black min-h-screen pt-24 pb-32 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#0d0d0d] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm text-center relative overflow-hidden group">
              <div className="relative inline-block mt-4">
                <div className="w-32 h-32 rounded-full bg-gray-50 dark:bg-black border-4 border-white dark:border-white/10 shadow-xl flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-gray-200 dark:text-gray-800" />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-black dark:bg-[#00FF00] text-white dark:text-black rounded-full shadow-lg hover:bg-[#00FF00] transition-all cursor-pointer opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              <div className="mt-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">{user.name}</h2>
                <p className="text-gray-400 dark:text-gray-500 font-medium text-[10px] uppercase tracking-widest flex items-center justify-center mt-1">
                  <Shield className="h-3 w-3 mr-1 text-[#00FF00]" />
                  Verified {user.role}
                </p>
              </div>

              <div className="absolute top-0 right-0 p-4">
                <div className="bg-[#00FF00] text-[8px] font-black text-black px-3 py-1 rounded-full uppercase tracking-widest rotate-12 translate-x-4 -translate-y-2">
                  {user.role}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden p-2">
              {menuItems.filter(item => !item.adminOnly || user.role === 'admin').map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    activeTab === item.id ? 'bg-gray-50 dark:bg-white/5 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeTab === item.id ? 'bg-white dark:bg-black text-[#00FF00] shadow-sm' : 'bg-gray-50 dark:bg-black/40 text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-white/10 group-hover:text-[#00FF00]'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.adminOnly && (
                    <span className="text-[8px] font-black bg-[#00FF00]/10 text-[#00FF00] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>
                  )}
                  <ChevronRight className={`h-4 w-4 transition-all ${
                    activeTab === item.id ? 'text-[#00FF00] translate-x-1' : 'text-gray-300 dark:text-gray-700 group-hover:text-[#00FF00] group-hover:translate-x-1'
                  }`} />
                </button>
              ))}
              <button 
                onClick={logout}
                className="w-full flex items-center space-x-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all group"
              >
                <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-all">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm"
            >
            {activeTab === 'account' && (
                <div className="space-y-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Personal Information</h3>
                    <button 
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isEditing 
                          ? 'bg-[#00FF00] text-black shadow-lg shadow-[#00FF00]/20' 
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                      }`}
                    >
                      {isEditing ? <Check className="h-4 w-4" /> : null}
                      <span>{isEditing ? 'Sync Changes' : 'Edit Matrix'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white focus:border-[#00FF00] focus:outline-none transition-all disabled:opacity-70 italic"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="email" 
                          disabled
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl font-black uppercase tracking-tight text-gray-400 dark:text-gray-600 focus:outline-none transition-all cursor-not-allowed italic"
                          value={user.email}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="tel" 
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white focus:border-[#00FF00] focus:outline-none transition-all disabled:opacity-70 italic"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Account Role</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          disabled
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-2xl font-black uppercase tracking-tight text-gray-400 dark:text-gray-600 focus:outline-none transition-all cursor-not-allowed italic font-bold"
                          value={user.role.toUpperCase()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900">Your Orders</h3>
                  <a href="/orders" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</a>
                </div>
                <div className="bg-gray-50 p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold mb-6">You haven't placed any orders yet.</p>
                  <a href="/search" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Start Shopping</a>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-[#00FF00] rounded-2xl">
                    <Palette className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Display & Interface</h3>
                </div>

                <div className="space-y-6">
                  <div className="p-8 bg-gray-50 dark:bg-black/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        theme === 'dark' ? 'bg-[#00FF00]/10 text-[#00FF00]' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {theme === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Interface Mode</h4>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                          Current: {theme === 'dark' ? 'Dark Matrix' : 'Light Lab'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className="px-8 py-3 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/10 hover:border-indigo-600 dark:hover:border-[#00FF00] transition-all shadow-sm"
                    >
                      Swap Theme
                    </button>
                  </div>

                  <div className="p-8 bg-gray-50 dark:bg-black/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Global Currency</h4>
                          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Automatic pricing updates</p>
                        </div>
                      </div>
                      <select 
                        value={currentCurrency.code}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black p-4 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:border-indigo-600 dark:focus:border-[#00FF00] appearance-none"
                      >
                        {SUPPORTED_CURRENCIES.map(cur => (
                          <option key={cur.code} value={cur.code}>{cur.code} ({cur.symbol})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'notifications' || activeTab === 'payment' || activeTab === 'security') && user.role === 'admin' ? (
              <div className="space-y-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    {activeTab === 'notifications' && <Bell className="h-6 w-6" />}
                    {activeTab === 'payment' && <CreditCard className="h-6 w-6" />}
                    {activeTab === 'security' && <Shield className="h-6 w-6" />}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 capitalize">{activeTab} Management</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'notifications' && (
                    <>
                      <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">Email Notifications</span>
                          <button 
                            onClick={() => updateProfile({
                              settings: {
                                ...user.settings,
                                notifications: {
                                  push: user.settings?.notifications.push ?? false,
                                  email: !(user.settings?.notifications.email ?? true)
                                },
                                payment: user.settings?.payment ?? { currency: 'NGN', defaultMethod: 'card' },
                                security: user.settings?.security ?? { twoFactorEnabled: false, lastLoginAlert: true }
                              }
                            })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              (user.settings?.notifications.email ?? true) ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                              (user.settings?.notifications.email ?? true) ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">Receive updates about new orders and verification requests via email.</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">Push Notifications</span>
                          <button 
                            onClick={() => updateProfile({
                              settings: {
                                ...user.settings,
                                notifications: {
                                  email: user.settings?.notifications.email ?? true,
                                  push: !(user.settings?.notifications.push ?? false)
                                },
                                payment: user.settings?.payment ?? { currency: 'NGN', defaultMethod: 'card' },
                                security: user.settings?.security ?? { twoFactorEnabled: false, lastLoginAlert: true }
                              }
                            })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              (user.settings?.notifications.push ?? false) ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                              (user.settings?.notifications.push ?? false) ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">Browser alerts for real-time chat messages and price drops.</p>
                      </div>
                    </>
                  )}

                  {activeTab === 'payment' && (
                    <>
                      <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Currency</p>
                          <select 
                            value={currentCurrency.code}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-white border-none rounded-lg text-[10px] font-black p-1 text-emerald-600 shadow-sm"
                          >
                            {SUPPORTED_CURRENCIES.map(cur => (
                              <option key={cur.code} value={cur.code}>{cur.code} ({cur.symbol})</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xl font-black text-emerald-900">
                          {currentCurrency.name} ({currentCurrency.symbol})
                        </p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <p className="text-xs font-bold text-gray-700">Default Payment Method</p>
                        <select 
                           value={user.settings?.payment.defaultMethod ?? 'card'}
                           onChange={(e) => updateProfile({
                             settings: {
                               ...user.settings,
                               notifications: user.settings?.notifications ?? { email: true, push: false },
                               payment: {
                                 currency: user.settings?.payment.currency ?? 'NGN',
                                 defaultMethod: e.target.value
                               },
                               security: user.settings?.security ?? { twoFactorEnabled: false, lastLoginAlert: true }
                             }
                           })}
                           className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-50"
                        >
                          <option value="card">Credit / Debit Card</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="wallet">Digital Wallet</option>
                          <option value="mtn">MTN Mobile Money</option>
                          <option value="bitcoin">Bitcoin (BTC)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {activeTab === 'security' && (
                    <>
                      <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-700">Multi-Factor Auth</p>
                          <button 
                            onClick={() => updateProfile({
                              settings: {
                                ...user.settings,
                                notifications: user.settings?.notifications ?? { email: true, push: false },
                                payment: user.settings?.payment ?? { currency: 'NGN', defaultMethod: 'card' },
                                security: {
                                  lastLoginAlert: user.settings?.security.lastLoginAlert ?? true,
                                  twoFactorEnabled: !(user.settings?.security.twoFactorEnabled ?? false)
                                }
                              }
                            })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              (user.settings?.security.twoFactorEnabled ?? false) ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                              (user.settings?.security.twoFactorEnabled ?? false) ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Setup Authenticator</button>
                      </div>
                      <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 space-y-4">
                        <p className="text-xs font-bold text-red-600">Danger Zone</p>
                        <button className="w-full py-3 bg-white text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100 shadow-sm hover:bg-red-50 transition-colors">Sign Out All Sessions</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              activeTab !== 'account' && activeTab !== 'orders' && (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-10 w-10 text-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Access Restricted</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto mt-2">These settings are only available for system administrators.</p>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </div>
  </div>
  );
};

// Mock Package and Lock since we don't have them in lucide explicitly sometimes or for clarity
const Package = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

const Lock = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
