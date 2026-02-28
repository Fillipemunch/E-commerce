
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, MessageSquare, BarChart3, Globe, Store, Briefcase, LogOut, User } from 'lucide-react';
import { Tab, Language, StoreProduct, StoreCustomization } from '@/types';
import { UI_TEXT, MOCK_STATS, MOCK_PRODUCTS, MOCK_SHOP_LOOK } from '@/constants';
import ProductGenerator from '@/components/ProductGenerator';
import PromotionAnalyst from '@/components/PromotionAnalyst';
import Storefront from '@/components/Storefront';
import BusinessTools from '@/components/BusinessTools';
import Auth from '@/components/Auth';
import LandingPage from '@/components/LandingPage';

type ViewState = 'LANDING' | 'AUTH' | 'DASHBOARD';

const App: React.FC = () => {
  // Check for demo flag in URL to support "View Demo" feature
  const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';

  const [viewState, setViewState] = useState<ViewState>(isDemo ? 'DASHBOARD' : 'LANDING');
  // Default language set to English
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<Tab>(isDemo ? Tab.STOREFRONT : Tab.DASHBOARD);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [storeName, setStoreName] = useState('NORVOSS');
  const [isStoreLaunched, setIsStoreLaunched] = useState(false);
  
  // Lifted Product State for CRUD
  const [products, setProducts] = useState<StoreProduct[]>(MOCK_PRODUCTS);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('nordic_custom_labels');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });
  
  // Customization State
  const [customization, setCustomization] = useState<StoreCustomization>(() => {
    const saved = localStorage.getItem('nordic_customization');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      logoText: 'NORVOSS',
      logoImage: null,
      heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000',
      heroTitle: 'Unleash Your Style.',
      heroAccentTitle: 'Shop the Future.',
      heroSubtitle: 'High energy, bold design. Experience the new wave of NORVOSS style.',
      ctaBuyText: 'Explore Now',
      ctaExploreText: 'View Collection',
      shopLookImage: MOCK_SHOP_LOOK.imageUrl,
      sectionShopLookTitle: 'Shop the Look',
      sectionNewTitle: 'New Arrivals',
      footerDesc: 'NORVOSS is the leading AI-powered e-commerce platform for Danish businesses.',
      uspData: [
        { title: 'Lightning Delivery', iconName: 'Zap' },
        { title: 'Secure MobilePay', iconName: 'Shield' },
        { title: 'Easy Returns', iconName: 'TrendingUp' },
        { title: 'Danish Quality', iconName: 'Globe' }
      ],
      landingHero: 'Unleash Your Store with Gemini AI.',
      landingSub: 'The all-in-one e-commerce platform for Danish SMBs.',
      landingCta: 'Start Your Free Trial Now',
      landingHeroImage: null
    };
  });

  React.useEffect(() => {
    localStorage.setItem('nordic_customization', JSON.stringify(customization));
  }, [customization]);

  React.useEffect(() => {
    localStorage.setItem('nordic_custom_labels', JSON.stringify(customLabels));
  }, [customLabels]);

  const t = { ...UI_TEXT[lang], ...customLabels };

  // Derive URL from store name
  const storeUrl = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.norvoss.com';

  const toggleLang = () => setLang(prev => prev === 'da' ? 'en' : 'da');

  const handleLoginSuccess = (name?: string) => {
      if (name) setStoreName(name);
      setViewState('DASHBOARD');
      setActiveTab(Tab.DASHBOARD);
  };

  const handleLogout = () => {
      setViewState('LANDING');
      setIsGlobalEditMode(false);
      setShowLogoutToast(true);
      setTimeout(() => setShowLogoutToast(false), 3000);
  };

  const handleLaunchStore = () => {
      setIsStoreLaunched(true);
  };

  // Product CRUD Handlers
  const handleAddProduct = (product: StoreProduct) => {
    setProducts([...products, product]);
  };

  const handleUpdateProduct = (updatedProduct: StoreProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // --- RENDER LOGIC ---

  if (viewState === 'LANDING') {
      return (
          <div className="font-sans antialiased text-slate-800 relative">
              <div className="animate-slide-in-right">
                 <LandingPage 
                    lang={lang} 
                    onLoginClick={() => setViewState('AUTH')} 
                    toggleLang={toggleLang} 
                    isEditMode={isGlobalEditMode}
                    customLabels={customLabels}
                    onLabelChange={(key, value) => {
                       if (key === '_toggle_edit') setIsGlobalEditMode(!isGlobalEditMode);
                       else setCustomLabels(prev => ({ ...prev, [key]: value }));
                    }}
                    customization={customization}
                    onUpdateCustomization={(updates) => setCustomization(prev => ({ ...prev, ...updates }))}
                 />
              </div>

              {/* Logout Toast */}
              {showLogoutToast && (
                  <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emeraldAction text-white px-8 py-4 rounded-full shadow-2xl font-bold animate-fade-in-up flex items-center gap-3 z-[100] border border-white/20 backdrop-blur-md">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                      {t.auth_logout_success}
                  </div>
              )}
          </div>
      );
  }

  if (viewState === 'AUTH') {
      return (
        <div className="font-sans antialiased text-slate-800 relative animate-slide-in-right">
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={toggleLang}
                    className="flex items-center gap-2 text-xs font-black bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg hover:bg-white transition text-slate-900 border border-slate-200"
                >
                    <Globe className="w-4 h-4 text-electricBlue" />
                    <span>{lang.toUpperCase()}</span>
                </button>
            </div>
            <Auth lang={lang} onLogin={handleLoginSuccess} onBack={() => setViewState('LANDING')} />
        </div>
      );
  }

  // --- DASHBOARD VIEW ---

  const renderContent = () => {
    switch (activeTab) {
      case Tab.PRODUCT_GEN:
        return (
          <div key="prod" className="animate-slide-in-right">
            <ProductGenerator 
              lang={lang} 
              products={products}
              onAdd={handleAddProduct}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          </div>
        );
      case Tab.PROMO_ANALYST:
        return <div key="promo" className="animate-slide-in-right"><PromotionAnalyst lang={lang} products={products} /></div>;
      case Tab.BUSINESS_TOOLS:
        return <div key="tools" className="animate-slide-in-right"><BusinessTools lang={lang} /></div>;
      case Tab.STOREFRONT:
        return (
          <div key="store" className="animate-slide-in-right">
            <Storefront 
              lang={lang} 
              products={products} 
              storeUrl={storeUrl}
              isStoreLaunched={isStoreLaunched}
              onLaunch={handleLaunchStore}
              customization={customization}
              onUpdateCustomization={(updates) => setCustomization(prev => ({ ...prev, ...updates }))}
            />
          </div>
        );
      case Tab.LANDING_PAGE:
        return (
          <div key="landing-edit" className="animate-slide-in-right bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
              <h3 className="text-white font-bold">Landing Page Editor</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emeraldAction rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Live Preview & Edit</span>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <LandingPage 
                lang={lang} 
                onLoginClick={() => {}} 
                toggleLang={toggleLang} 
                isEditMode={true}
                customLabels={customLabels}
                onLabelChange={(key, value) => setCustomLabels(prev => ({ ...prev, [key]: value }))}
                customization={customization}
                onUpdateCustomization={(updates) => setCustomization(prev => ({ ...prev, ...updates }))}
              />
            </div>
          </div>
        );
      default:
        return (
          <div key="dash" className="space-y-8 animate-slide-in-right">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_STATS.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 group">
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-400 group-hover:text-electricBlue transition-colors">{lang === 'da' ? stat.label_da : stat.label_en}</p>
                  <div className="flex items-end justify-between mt-3">
                    <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    {/* NEUTRAL STATE LOGIC */}
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      stat.change.includes('--') 
                        ? 'bg-slate-100 text-slate-500' 
                        : stat.change.startsWith('+') 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-2xl font-black text-slate-900 mt-8 tracking-tight">
              {isGlobalEditMode ? (
                <input 
                  type="text" 
                  value={t.dashboard_quick_launch || 'Quick Launch'} 
                  onChange={(e) => setCustomLabels(prev => ({ ...prev, dashboard_quick_launch: e.target.value }))}
                  className="bg-slate-100 border-none p-1 rounded focus:ring-2 focus:ring-electricBlue outline-none"
                />
              ) : (
                t.dashboard_quick_launch || 'Quick Launch'
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <button 
                onClick={() => setActiveTab(Tab.PRODUCT_GEN)}
                className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-electricBlue hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-electricBlue/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 group-hover:bg-electricBlue/10"></div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-electricBlue group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <ShoppingBag className="w-7 h-7 text-electricBlue group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-electricBlue transition-colors">{t.nav_product}</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Bilingual content generation.</p>
              </button>

              <button 
                 onClick={() => setActiveTab(Tab.PROMO_ANALYST)}
                 className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-emeraldAction hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emeraldAction/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 group-hover:bg-emeraldAction/10"></div>
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emeraldAction group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <BarChart3 className="w-7 h-7 text-emeraldAction group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-emeraldAction transition-colors">{t.nav_promo}</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Smart Sales & Promotions.</p>
              </button>

              <button 
                 onClick={() => setActiveTab(Tab.BUSINESS_TOOLS)}
                 className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-magentaPop hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-magentaPop/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 group-hover:bg-magentaPop/10"></div>
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-magentaPop group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <Briefcase className="w-7 h-7 text-magentaPop group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-magentaPop transition-colors">{t.nav_business}</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Compliance, Invoices & More.</p>
              </button>

              {/* New Storefront Quick Link */}
              <button 
                 onClick={() => setActiveTab(Tab.STOREFRONT)}
                 className="group p-8 bg-slate-900 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden col-span-1 md:col-span-2 lg:col-span-2"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-6 relative z-10">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 text-white transition-all duration-300 shadow-inner">
                      <Store className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="font-black text-2xl text-white tracking-tight">{t.nav_storefront}</h3>
                      <p className="text-slate-400 mt-1 font-medium">Launch the live customer experience preview.</p>
                   </div>
                </div>
              </button>
            </div>
            
            <div className="mt-8 bg-blue-50/50 rounded-2xl p-4 border border-blue-100 text-center flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              {isGlobalEditMode ? (
                <input 
                  type="text" 
                  value={t.compliance_warning} 
                  onChange={(e) => setCustomLabels(prev => ({ ...prev, compliance_warning: e.target.value }))}
                  className="bg-transparent border-none p-1 rounded text-xs font-bold text-blue-800 uppercase tracking-wide focus:ring-2 focus:ring-blue-500 outline-none w-full text-center"
                />
              ) : (
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                  {t.compliance_warning} GDPR Compliant.
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 bg-[#f8fafc]">
      
      {/* Sidebar Navigation (Desktop) - Only show if not demo mode or strictly dashboard */}
      {!isDemo && (
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-slate-300 sticky top-0 h-screen z-20 shadow-2xl">
        <div className="p-8 cursor-pointer" onClick={() => setActiveTab(Tab.DASHBOARD)}>
           <div className="flex items-center gap-2 text-white mb-2 group">
             <div className="w-10 h-10 bg-electricBlue rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/50 group-hover:scale-105 transition-transform">N</div>
             {isGlobalEditMode ? (
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)}
                  className="bg-white/10 border-none p-1 rounded font-black text-2xl tracking-tighter w-full focus:ring-2 focus:ring-electricBlue outline-none text-white"
                />
              ) : (
                <span className="font-black text-2xl tracking-tighter">NORVOSS</span>
              )}
           </div>
           {isGlobalEditMode ? (
              <input 
                type="text" 
                value={t.dashboard_subtitle || 'SaaS for Denmark'} 
                onChange={(e) => setCustomLabels(prev => ({ ...prev, dashboard_subtitle: e.target.value }))}
                className="bg-white/10 border-none p-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest w-full focus:ring-2 focus:ring-white outline-none"
              />
            ) : (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{t.dashboard_subtitle || 'SaaS for Denmark'}</p>
            )}
        </div>

        <nav className="flex-1 px-4 space-y-3">
          <button 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group ${activeTab === Tab.DASHBOARD ? 'bg-electricBlue text-white shadow-lg shadow-blue-900/50 translate-x-2' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === Tab.DASHBOARD ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            {isGlobalEditMode ? (
              <input 
                type="text" 
                value={t.nav_dashboard} 
                onChange={(e) => setCustomLabels(prev => ({ ...prev, nav_dashboard: e.target.value }))}
                className="bg-white/10 border-none p-1 rounded font-bold text-sm tracking-wide w-full focus:ring-2 focus:ring-white outline-none text-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="font-bold text-sm tracking-wide">{t.nav_dashboard}</span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab(Tab.PRODUCT_GEN)}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group ${activeTab === Tab.PRODUCT_GEN ? 'bg-electricBlue text-white shadow-lg shadow-blue-900/50 translate-x-2' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingBag className={`w-5 h-5 ${activeTab === Tab.PRODUCT_GEN ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            {isGlobalEditMode ? (
              <input 
                type="text" 
                value={t.nav_product} 
                onChange={(e) => setCustomLabels(prev => ({ ...prev, nav_product: e.target.value }))}
                className="bg-white/10 border-none p-1 rounded font-bold text-sm tracking-wide w-full focus:ring-2 focus:ring-white outline-none text-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="font-bold text-sm tracking-wide">{t.nav_product}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab(Tab.PROMO_ANALYST)}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group ${activeTab === Tab.PROMO_ANALYST ? 'bg-electricBlue text-white shadow-lg shadow-blue-900/50 translate-x-2' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === Tab.PROMO_ANALYST ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            {isGlobalEditMode ? (
              <input 
                type="text" 
                value={t.nav_promo} 
                onChange={(e) => setCustomLabels(prev => ({ ...prev, nav_promo: e.target.value }))}
                className="bg-white/10 border-none p-1 rounded font-bold text-sm tracking-wide w-full focus:ring-2 focus:ring-white outline-none text-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="font-bold text-sm tracking-wide">{t.nav_promo}</span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab(Tab.BUSINESS_TOOLS)}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group ${activeTab === Tab.BUSINESS_TOOLS ? 'bg-electricBlue text-white shadow-lg shadow-blue-900/50 translate-x-2' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <Briefcase className={`w-5 h-5 ${activeTab === Tab.BUSINESS_TOOLS ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            {isGlobalEditMode ? (
              <input 
                type="text" 
                value={t.nav_business} 
                onChange={(e) => setCustomLabels(prev => ({ ...prev, nav_business: e.target.value }))}
                className="bg-white/10 border-none p-1 rounded font-bold text-sm tracking-wide w-full focus:ring-2 focus:ring-white outline-none text-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="font-bold text-sm tracking-wide">{t.nav_business}</span>
            )}
          </button>

          <div className="mt-8 border-t border-slate-800 pt-6 mx-2">
             <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Consumer View</p>
             <button 
               onClick={() => setActiveTab(Tab.LANDING_PAGE)}
               className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group mb-2 ${activeTab === Tab.LANDING_PAGE ? 'bg-white text-slate-900 shadow-xl shadow-black/20 translate-x-2' : 'hover:bg-white/10 hover:text-white'}`}
             >
               <Globe className={`w-5 h-5 ${activeTab === Tab.LANDING_PAGE ? 'text-slate-900' : 'text-slate-500 group-hover:text-white'}`} />
               {isGlobalEditMode ? (
                <input 
                  type="text" 
                  value={t.nav_landing_page || 'Landing Page'} 
                  onChange={(e) => setCustomLabels(prev => ({ ...prev, nav_landing_page: e.target.value }))}
                  className="bg-white/10 border-none p-1 rounded font-bold text-sm tracking-wide w-full focus:ring-2 focus:ring-white outline-none text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-bold text-sm tracking-wide">{t.nav_landing_page || 'Landing Page'}</span>
              )}
             </button>
             <button 
               onClick={() => setActiveTab(Tab.STOREFRONT)}
               className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 group ${activeTab === Tab.STOREFRONT ? 'bg-white text-slate-900 shadow-xl shadow-black/20 translate-x-2' : 'hover:bg-white/10 hover:text-white'}`}
             >
               <Store className={`w-5 h-5 ${activeTab === Tab.STOREFRONT ? 'text-slate-900' : 'text-slate-500 group-hover:text-white'}`} />
               {isGlobalEditMode ? (
                <input 
                  type="text" 
                  value={t.nav_storefront} 
                  onChange={(e) => setCustomLabels(prev => ({ ...prev, nav_storefront: e.target.value }))}
                  className="bg-white/10 border-none p-1 rounded font-bold text-sm tracking-wide w-full focus:ring-2 focus:ring-white outline-none text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-bold text-sm tracking-wide">{t.nav_storefront}</span>
              )}
             </button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-3">
           <button 
             onClick={() => setIsGlobalEditMode(!isGlobalEditMode)}
             className={`flex items-center gap-3 text-xs font-bold w-full px-3 py-2 rounded-lg transition-all ${isGlobalEditMode ? 'bg-electricBlue text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
           >
             <Briefcase className="w-4 h-4" />
             <span>{isGlobalEditMode ? 'Save Dashboard' : 'Edit Dashboard'}</span>
           </button>
           <button 
             onClick={toggleLang}
             className="flex items-center gap-3 text-xs font-bold text-slate-400 hover:text-white transition w-full px-3 py-2 rounded-lg hover:bg-white/5"
           >
             <Globe className="w-4 h-4" />
             <span>{lang === 'da' ? 'Sprog: Dansk' : 'Language: English'}</span>
           </button>
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 text-xs font-bold text-slate-400 hover:text-red-400 transition w-full px-3 py-2 rounded-lg hover:bg-white/5"
           >
             <LogOut className="w-4 h-4" />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col relative overflow-hidden bg-[#f8fafc]">
        {/* Mobile Header */}
        {!isDemo && (
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-lg">
           <div className="font-black text-lg">NORVOSS</div>
           <button onClick={toggleLang} className="text-xs font-bold bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">
             {lang.toUpperCase()}
           </button>
        </header>
        )}

        {/* Top Bar (Desktop) */}
        {!isDemo && activeTab !== Tab.STOREFRONT && (
          <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 justify-between items-center sticky top-0 z-10 transition-all">
             <div className="animate-fade-in-up">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTab === Tab.DASHBOARD ? `Dashboard for ${storeName}` : 
                     activeTab === Tab.PRODUCT_GEN ? t.nav_product :
                     activeTab === Tab.PROMO_ANALYST ? t.nav_promo :
                     t.nav_business}
                </h1>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Welcome to your intelligent workspace.</p>
             </div>
             
             <div className="flex items-center gap-6">
                <div className="text-right hidden lg:block">
                   <p className="text-sm font-bold text-slate-900">Master Admin</p>
                   <p className="text-[10px] font-bold text-electricBlue uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">Admin</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-tr from-electricBlue to-magentaPop rounded-full p-[3px] shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform">
                   <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                      <User className="w-6 h-6 text-slate-400" />
                   </div>
                </div>
             </div>
          </header>
        )}

        {/* Content Area */}
        <div className={`${activeTab === Tab.STOREFRONT ? 'p-0' : 'p-4 md:p-8 max-w-7xl mx-auto'} w-full flex-1 overflow-y-auto overflow-x-hidden`}>
           {renderContent()}
        </div>

        {/* Mobile Navigation (Bottom) */}
        {!isDemo && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
           <button onClick={() => setActiveTab(Tab.DASHBOARD)} className={`p-2 rounded-lg flex flex-col items-center ${activeTab === Tab.DASHBOARD ? 'text-electricBlue' : 'text-slate-400'}`}>
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-bold mt-1">Dash</span>
           </button>
           <button onClick={() => setActiveTab(Tab.PRODUCT_GEN)} className={`p-2 rounded-lg flex flex-col items-center ${activeTab === Tab.PRODUCT_GEN ? 'text-electricBlue' : 'text-slate-400'}`}>
              <ShoppingBag className="w-6 h-6" />
              <span className="text-[10px] font-bold mt-1">AI</span>
           </button>
           <button onClick={() => setActiveTab(Tab.STOREFRONT)} className={`relative -top-6 bg-gradient-to-r from-electricBlue to-deepBlue text-white p-4 rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center transform transition-transform active:scale-95`}>
              <Store className="w-6 h-6" />
           </button>
           <button onClick={() => setActiveTab(Tab.BUSINESS_TOOLS)} className={`p-2 rounded-lg flex flex-col items-center ${activeTab === Tab.BUSINESS_TOOLS ? 'text-electricBlue' : 'text-slate-400'}`}>
              <Briefcase className="w-6 h-6" />
              <span className="text-[10px] font-bold mt-1">Tools</span>
           </button>
           <button onClick={handleLogout} className={`p-2 rounded-lg flex flex-col items-center text-slate-400`}>
              <LogOut className="w-6 h-6" />
              <span className="text-slate-400 text-[10px] font-bold mt-1">Exit</span>
           </button>
        </div>
        )}
      </main>
    </div>
  );
};

export default App;
