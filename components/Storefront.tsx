
import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { ShoppingBag, Search, MapPin, CheckCircle, Smartphone, X, MessageCircle, CalendarClock, Eye, Mic, Star, Truck, ShieldCheck, RefreshCw, Zap, ArrowLeft, CreditCard, ExternalLink, Copy, Rocket, Edit3, Image as ImageIcon, Save } from 'lucide-react';
import { Language, StoreProduct, ReviewSummary, StoreCustomization } from '../types';
import { UI_TEXT, MOCK_PAKKESHOPS, MOCK_SHOP_LOOK, MOCK_DELIVERY_SLOTS } from '../constants';
import { searchProductsWithAI, getRecommendations, summarizeReviews } from '../services/geminiService';

interface StorefrontProps {
  lang: Language;
  products: StoreProduct[];
  storeUrl?: string;
  isStoreLaunched?: boolean;
  onLaunch?: () => void;
  customization: StoreCustomization;
  onUpdateCustomization: (updates: Partial<StoreCustomization>) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ 
  lang, 
  products, 
  storeUrl, 
  isStoreLaunched, 
  onLaunch,
  customization,
  onUpdateCustomization
}) => {
  const t = UI_TEXT[lang];

  // State
  const [view, setView] = useState<'home' | 'search' | 'checkout' | 'success'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Customization State
  const [isEditMode, setIsEditMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingTarget, setEditingTarget] = useState<'hero' | 'shopLook' | 'logo' | null>(null);
  
  // Filter only active products
  const activeProducts = products.filter(p => p.active);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>(activeProducts);
  
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState<number[]>([]);
  
  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [deliveryDetails, setDeliveryDetails] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      zip: '',
      city: ''
  });
  
  const [selectedPakkeshop, setSelectedPakkeshop] = useState<string | null>(null);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mobilepay' | 'card' | null>(null);
  
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);
  
  // Modal & Reviews
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // Voice Search State
  const [isListening, setIsListening] = useState(false);

  // Toast for Link Copied
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Helper for bilingual Name
  const getName = (p: StoreProduct) => lang === 'da' ? p.name_da : p.name_en;
  // Helper for bilingual Desc
  const getDesc = (p: StoreProduct) => lang === 'da' ? p.description_da : p.description_en;

  // Search Handler
  const performSearch = async (query: string) => {
      if (!query.trim()) {
        setFilteredProducts(activeProducts);
        setView('home');
        return;
      }
      setIsSearching(true);
      setView('search');
      
      const matchedIds = await searchProductsWithAI(query, activeProducts.map(p => ({ id: p.id, name: p.name_en, tags: p.tags })));
      const results = activeProducts.filter(p => matchedIds.includes(p.id));
      setFilteredProducts(results.length > 0 ? results : []); 
      setIsSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const startVoiceSearch = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Browser does not support Voice Search");
          return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'da' ? 'da-DK' : 'en-US';
      recognition.start();
      setIsListening(true);
      
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          performSearch(transcript);
          setIsListening(false);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
  };

  const addToCart = async (id: number) => {
    setCart([...cart, id]);
    const product = activeProducts.find(p => p.id === id);
    if (product) {
       const recIds = await getRecommendations(product.name_en, activeProducts.filter(p => p.id !== id).map(p => ({ id: p.id, name: p.name_en })));
       setRecommendations(activeProducts.filter(p => recIds.includes(p.id)));
    }
    setSelectedProduct(null);
  };

  const openProductModal = async (product: StoreProduct) => {
      setSelectedProduct(product);
      setReviewSummary(null);
      if (product.reviews && product.reviews.length > 0) {
          setLoadingSummary(true);
          const summary = await summarizeReviews(product.reviews);
          setReviewSummary(summary);
          setLoadingSummary(false);
      }
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const canProceedFromStep1 = () => {
      return deliveryDetails.name && deliveryDetails.email && deliveryDetails.address && deliveryDetails.zip;
  };

  const getSubtotal = () => {
      return cart.reduce((acc, id) => {
          const p = activeProducts.find(p => p.id === id);
          return acc + (p ? Number(p.price) : 0);
      }, 0);
  };

  const getShippingCost = () => {
      if (!selectedDeliverySlot) return 0;
      const slot = MOCK_DELIVERY_SLOTS.find(s => s.id === selectedDeliverySlot);
      return slot ? parseInt(slot.cost) : 0;
  };

  const handleCopyLink = () => {
      if (storeUrl) {
          navigator.clipboard.writeText(storeUrl);
          setShowCopiedToast(true);
          setTimeout(() => setShowCopiedToast(false), 2000);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingTarget === 'hero') onUpdateCustomization({ heroImage: reader.result as string });
        if (editingTarget === 'shopLook') onUpdateCustomization({ shopLookImage: reader.result as string });
        if (editingTarget === 'logo') onUpdateCustomization({ logoImage: reader.result as string });
        setEditingTarget(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageEdit = (target: 'hero' | 'shopLook' | 'logo') => {
    setEditingTarget(target);
    fileInputRef.current?.click();
  };

  const CheckoutFlow = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-8 animate-fade-in-up">
      
      {/* Steps Container */}
      <div className="flex-1">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
              {[1, 2, 3].map(step => (
                  <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-500 ${checkoutStep >= step ? 'bg-electricBlue text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {step}
                  </div>
              ))}
          </div>

          <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
              {checkoutStep === 1 && t.checkout_step1}
              {checkoutStep === 2 && t.checkout_step2}
              {checkoutStep === 3 && t.checkout_step3}
          </h2>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl min-h-[400px]">
              
              {/* STEP 1: Delivery Details */}
              {checkoutStep === 1 && (
                  <div className="space-y-4 animate-slide-in-right">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">{t.label_fullname}</label>
                              <input 
                                  type="text" 
                                  name="name"
                                  value={deliveryDetails.name}
                                  onChange={handleDeliveryChange}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-electricBlue focus:ring-0 outline-none transition" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">{t.label_phone}</label>
                              <input 
                                  type="tel" 
                                  name="phone"
                                  value={deliveryDetails.phone}
                                  onChange={handleDeliveryChange}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-electricBlue focus:ring-0 outline-none transition" 
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">{t.label_email}</label>
                          <input 
                              type="email" 
                              name="email"
                              value={deliveryDetails.email}
                              onChange={handleDeliveryChange}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-electricBlue focus:ring-0 outline-none transition" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">{t.label_address}</label>
                          <input 
                              type="text" 
                              name="address"
                              value={deliveryDetails.address}
                              onChange={handleDeliveryChange}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-electricBlue focus:ring-0 outline-none transition" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">{t.label_zip}</label>
                              <input 
                                  type="text" 
                                  name="zip"
                                  value={deliveryDetails.zip}
                                  onChange={handleDeliveryChange}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-electricBlue focus:ring-0 outline-none transition" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">{t.label_city}</label>
                              <input 
                                  type="text" 
                                  name="city"
                                  value={deliveryDetails.city}
                                  onChange={handleDeliveryChange}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-electricBlue focus:ring-0 outline-none transition" 
                              />
                          </div>
                      </div>

                      <div className="flex justify-end pt-4">
                           <button 
                              onClick={() => setCheckoutStep(2)}
                              disabled={!canProceedFromStep1()}
                              className="bg-electricBlue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {t.btn_continue_shipping}
                           </button>
                      </div>
                  </div>
              )}

              {/* STEP 2: Shipping Options */}
              {checkoutStep === 2 && (
                  <div className="space-y-6 animate-slide-in-right">
                       <div>
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-electricBlue" /> {t.checkout_pakkeshop}
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                                {MOCK_PAKKESHOPS.map(shop => (
                                    <div 
                                    key={shop.id}
                                    onClick={() => setSelectedPakkeshop(shop.id)}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPakkeshop === shop.id ? 'border-electricBlue bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                            <p className="font-bold text-slate-900 text-sm">{shop.name}</p>
                                            <p className="text-xs text-slate-500">{shop.address}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${shop.carrier === 'PostNord' ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-black'}`}>
                                                {shop.carrier}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                       </div>

                       <div>
                           <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-vibrantOrange" /> {t.checkout_delivery_time}
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {MOCK_DELIVERY_SLOTS.map(slot => (
                                    <div 
                                        key={slot.id} 
                                        onClick={() => setSelectedDeliverySlot(slot.id)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedDeliverySlot === slot.id ? 'border-vibrantOrange bg-orange-50' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <p className="font-bold text-sm text-slate-900">{slot.date}</p>
                                        <p className="text-xs text-slate-600 mb-1">{slot.time}</p>
                                        <p className="text-xs font-bold text-electricBlue">{slot.cost}</p>
                                    </div>
                                ))}
                            </div>
                       </div>

                       <div className="flex justify-between pt-4">
                           <button onClick={() => setCheckoutStep(1)} className="text-slate-400 font-bold hover:text-slate-600 transition flex items-center gap-1">
                               <ArrowLeft className="w-4 h-4" /> {t.btn_back}
                           </button>
                           <button 
                              onClick={() => setCheckoutStep(3)}
                              disabled={!selectedPakkeshop || !selectedDeliverySlot}
                              className="bg-electricBlue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {t.btn_continue_payment}
                           </button>
                       </div>
                  </div>
              )}

              {/* STEP 3: Payment */}
              {checkoutStep === 3 && (
                   <div className="space-y-6 animate-slide-in-right">
                       <h3 className="font-bold text-lg mb-4 text-center">Choose Payment Method</h3>
                       
                       <div className="grid grid-cols-2 gap-4">
                           <div 
                              onClick={() => setPaymentMethod('mobilepay')}
                              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-center group ${paymentMethod === 'mobilepay' ? 'border-[#5a78ff] bg-blue-50 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}
                           >
                               <div className="w-12 h-12 bg-[#5a78ff] text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
                                  <Smartphone className="w-6 h-6" />
                               </div>
                               <p className="font-bold text-slate-900">MobilePay</p>
                           </div>

                           <div 
                              onClick={() => setPaymentMethod('card')}
                              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-center group ${paymentMethod === 'card' ? 'border-slate-900 bg-slate-50 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}
                           >
                               <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
                                  <CreditCard className="w-6 h-6" />
                               </div>
                               <p className="font-bold text-slate-900">Card</p>
                           </div>
                       </div>

                       <div className="flex justify-between pt-8 border-t border-slate-100 mt-8">
                           <button onClick={() => setCheckoutStep(2)} className="text-slate-400 font-bold hover:text-slate-600 transition flex items-center gap-1">
                               <ArrowLeft className="w-4 h-4" /> {t.btn_back}
                           </button>
                           <button 
                              onClick={() => setView('success')}
                              disabled={!paymentMethod}
                              className="bg-emeraldAction text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 hover:-translate-y-1 active:scale-95"
                           >
                              {t.btn_pay_now}
                           </button>
                       </div>
                   </div>
              )}

          </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="w-full md:w-80 h-fit bg-slate-50 p-6 rounded-3xl border border-slate-200 sticky top-24">
          <h3 className="font-black text-lg mb-6 text-slate-900 uppercase tracking-wide">{t.summary_header}</h3>
          
          <div className="space-y-4 mb-6">
              {cart.map((id, index) => {
                  const p = activeProducts.find(p => p.id === id);
                  if(!p) return null;
                  return (
                      <div key={index} className="flex justify-between items-start text-sm">
                          <span className="text-slate-600 font-medium truncate w-32">{getName(p)}</span>
                          <span className="font-bold text-slate-900">{p.price} DKK</span>
                      </div>
                  )
              })}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.summary_subtotal}</span>
                  <span className="font-bold text-slate-900">{getSubtotal()} DKK</span>
              </div>
              <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.summary_shipping}</span>
                  <span className="font-bold text-slate-900">{getShippingCost()} DKK</span>
              </div>
          </div>

          <div className="border-t-2 border-slate-200 pt-4 mt-4 flex justify-between items-center">
               <span className="font-black text-slate-900 uppercase">{t.summary_total}</span>
               <span className="font-black text-2xl text-electricBlue">{getSubtotal() + getShippingCost()} DKK</span>
          </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="max-w-md mx-auto py-24 px-6 text-center animate-fade-in-up">
       <div className="relative inline-block">
          <div className="w-24 h-24 bg-emeraldAction rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-emerald-500/40 animate-pulse">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-emerald-200 animate-ripple"></div>
       </div>
       
       <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{t.checkout_success}</h2>
       <p className="text-slate-500 mb-10 font-medium">{t.checkout_notification}</p>
       
       <div className="bg-white p-6 rounded-2xl border border-slate-100 text-left mb-10 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 bg-emeraldAction h-full"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Message Preview</p>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
             "Tak for dit køb hos NORVOSS, {deliveryDetails.name}! Din ordre #2392 er modtaget. Du får besked når den lander i {MOCK_PAKKESHOPS.find(s => s.id === selectedPakkeshop)?.name}."
          </p>
       </div>

       <button onClick={() => { setCart([]); setDeliveryDetails({name:'', email:'', phone:'', address:'', zip:'', city:''}); setCheckoutStep(1); setView('home'); }} className="text-electricBlue font-bold hover:text-deepBlue hover:underline transition">
          Return to Store
       </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden relative">
      
      {/* 0. Admin Toolbar (Visible only if storeUrl passed) */}
      {storeUrl && (
          <div className="bg-slate-900 text-white p-3 shadow-lg border-b border-slate-800 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${isStoreLaunched ? 'bg-emeraldAction' : 'bg-yellow-400'}`}></div>
                          <span className="font-bold text-sm tracking-wide">
                              {isStoreLaunched ? t.url_active_title : t.launch_desc}
                          </span>
                      </div>
                      
                      <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isEditMode ? 'bg-electricBlue text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {isEditMode ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                        {isEditMode ? 'Save Design' : 'Customize Store'}
                      </button>
                  </div>
                  
                  {isStoreLaunched ? (
                      <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                          <div className="px-3 py-1.5 text-xs text-slate-300 font-mono select-all">
                             {storeUrl}
                          </div>
                          <button 
                             onClick={handleCopyLink}
                             className="bg-electricBlue hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 group"
                          >
                             {showCopiedToast ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                             {showCopiedToast ? t.msg_copied : t.btn_copy}
                          </button>
                      </div>
                  ) : (
                       <button 
                          onClick={onLaunch}
                          className="bg-gradient-to-r from-emeraldAction to-emerald-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                       >
                           <Rocket className="w-3 h-3" /> {t.btn_launch}
                       </button>
                  )}
              </div>
          </div>
      )}

      {/* 1. Header */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-all duration-300" style={{top: storeUrl ? '0' : '0'}}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div 
            onClick={() => setView('home')}
            className="text-2xl font-black tracking-tighter text-slate-900 cursor-pointer flex-shrink-0 hover:text-electricBlue transition-colors flex items-center gap-2"
          >
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={customization.logoText} 
                  onChange={(e) => onUpdateCustomization({ logoText: e.target.value })}
                  className="bg-slate-100 border-none p-1 rounded font-black tracking-tighter w-32 focus:ring-2 focus:ring-electricBlue outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerImageEdit('logo'); }}
                  className="p-1 bg-slate-100 rounded hover:bg-slate-200 transition"
                  title="Upload Logo Image"
                >
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                </button>
                {customization.logoImage && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateCustomization({ logoImage: null }); }}
                    className="p-1 bg-red-50 rounded hover:bg-red-100 transition"
                    title="Remove Logo Image"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            ) : (
              customization.logoImage ? (
                <img src={customization.logoImage} alt={customization.logoText} className="h-8 w-auto object-contain" />
              ) : (
                customization.logoText
              )
            )}
            <span className="text-electricBlue">.</span>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={t.search_placeholder}
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-full py-3 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-electricBlue focus:bg-white transition-all shadow-sm group-hover:shadow-md"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-electricBlue transition-colors" />
              
              <button 
                 type="button" 
                 onClick={startVoiceSearch}
                 className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all hover:scale-110 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-electricBlue'}`}
              >
                  <Mic className="w-5 h-5" />
              </button>

              {isSearching && <div className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-electricBlue border-t-transparent rounded-full animate-spin"></div>}
            </form>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="relative group" onClick={() => cart.length > 0 && setView('checkout')}>
              <ShoppingBag className={`w-6 h-6 cursor-pointer transition-transform group-hover:scale-110 ${view === 'checkout' ? 'text-electricBlue' : 'text-slate-900'}`} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-electricBlue text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce shadow-lg shadow-blue-500/50">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-xs font-black bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">{lang}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Router */}
      {view === 'checkout' ? (
        <CheckoutFlow />
      ) : view === 'success' ? (
        <SuccessView />
      ) : (
        <>
          {/* 2. Hero Section */}
          {view === 'home' && (
            <section className="relative h-[600px] w-full flex items-center overflow-hidden bg-slate-900">
              {/* Background with Gradient Overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={customization.heroImage} 
                  alt="Fashion" 
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
              </div>

              {isEditMode && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group">
                  <button 
                    onClick={() => triggerImageEdit('hero')}
                    className="bg-white/90 backdrop-blur text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition active:scale-95"
                  >
                    <ImageIcon className="w-5 h-5" /> Change Hero Photo
                  </button>
                </div>
              )}

              <div className="relative z-10 max-w-7xl mx-auto px-6 w-full animate-fade-in-up">
                <div className="max-w-2xl">
                    <span className="inline-block py-1 px-3 rounded-full bg-electricBlue/20 text-electricBlue border border-electricBlue/50 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                        New Collection 2025
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-[0.9] tracking-tighter">
                        {isEditMode ? (
                          <input 
                            type="text" 
                            value={customization.heroTitle} 
                            onChange={(e) => onUpdateCustomization({ heroTitle: e.target.value })}
                            className="bg-white/10 border-none p-1 rounded w-full focus:ring-2 focus:ring-electricBlue outline-none text-white"
                          />
                        ) : (
                          customization.heroTitle
                        )}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-neonYellow">
                            {isEditMode ? (
                              <input 
                                type="text" 
                                value={customization.heroAccentTitle} 
                                onChange={(e) => onUpdateCustomization({ heroAccentTitle: e.target.value })}
                                className="bg-white/10 border-none p-1 rounded w-full focus:ring-2 focus:ring-electricBlue outline-none text-electricBlue"
                              />
                            ) : (
                              customization.heroAccentTitle
                            )}
                        </span>
                    </h1>
                    <div className="mb-10">
                      {isEditMode ? (
                        <textarea 
                          value={customization.heroSubtitle} 
                          onChange={(e) => onUpdateCustomization({ heroSubtitle: e.target.value })}
                          className="w-full bg-white/10 border-none p-3 rounded text-lg md:text-xl font-medium text-slate-300 focus:ring-2 focus:ring-electricBlue outline-none h-24"
                        />
                      ) : (
                        <p className="text-lg md:text-xl font-medium text-slate-300 max-w-lg leading-relaxed">
                          {customization.heroSubtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-emeraldAction text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/30 hover-scale active-scale flex items-center gap-2">
                            {isEditMode ? (
                              <input 
                                type="text" 
                                value={customization.ctaBuyText} 
                                onChange={(e) => onUpdateCustomization({ ctaBuyText: e.target.value })}
                                className="bg-transparent border-none p-0 w-24 focus:ring-0 outline-none text-white text-center"
                              />
                            ) : (
                              customization.ctaBuyText
                            )} <Zap className="w-5 h-5 fill-current" />
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition hover-scale">
                            {isEditMode ? (
                              <input 
                                type="text" 
                                value={customization.ctaExploreText} 
                                onChange={(e) => onUpdateCustomization({ ctaExploreText: e.target.value })}
                                className="bg-transparent border-none p-0 w-28 focus:ring-0 outline-none text-white text-center"
                              />
                            ) : (
                              customization.ctaExploreText
                            )}
                        </button>
                    </div>
                </div>
              </div>
            </section>
          )}

          {/* 3. Shop the Look */}
          {view === 'home' && (
             <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Eye className="w-8 h-8 text-electricBlue"/> 
                        {isEditMode ? (
                          <input 
                            type="text" 
                            value={customization.sectionShopLookTitle} 
                            onChange={(e) => onUpdateCustomization({ sectionShopLookTitle: e.target.value })}
                            className="bg-slate-100 border-none p-1 rounded focus:ring-2 focus:ring-electricBlue outline-none"
                          />
                        ) : (
                          customization.sectionShopLookTitle
                        )}
                    </h2>
                    <div className="h-1 flex-1 bg-slate-100 ml-6 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-slate-900 rounded-full"></div>
                    </div>
                </div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 aspect-video md:aspect-[2.35/1] group cursor-crosshair">
                    <img src={customization.shopLookImage} alt={MOCK_SHOP_LOOK.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-500"></div>
                    
                    {isEditMode && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
                        <button 
                          onClick={() => triggerImageEdit('shopLook')}
                          className="bg-white/90 backdrop-blur text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition active:scale-95"
                        >
                          <ImageIcon className="w-5 h-5" /> Change Look Photo
                        </button>
                      </div>
                    )}

                    {MOCK_SHOP_LOOK.items.map(item => {
                        const product = activeProducts.find(p => p.id === item.product_id);
                        if (!product) return null;
                        
                        return (
                            <div 
                                key={item.id} 
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{ top: `${item.y}%`, left: `${item.x}%` }}
                            >
                                <div className="group/hotspot relative">
                                    <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] z-10 hover:scale-125 transition flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-electricBlue rounded-full animate-pulse"></div>
                                    </button>
                                    
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white p-4 rounded-2xl shadow-xl opacity-0 invisible group-hover/hotspot:opacity-100 group-hover/hotspot:visible transition-all duration-300 transform translate-y-4 group-hover/hotspot:translate-y-0 z-20">
                                        <div className="flex gap-3 mb-3">
                                            <img src={product.img} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 leading-tight">{getName(product)}</div>
                                                <div className="text-xs text-slate-500 mt-1">{product.price} DKK</div>
                                            </div>
                                        </div>
                                        <button 
                                           onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                                           className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-electricBlue transition shadow-md"
                                        >
                                           Quick Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </section>
          )}

          {/* 4. Products Grid */}
          <section className="py-12 max-w-7xl mx-auto px-6 min-h-[50vh]">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {view === 'search' ? `${t.search_results} "${searchQuery}"` : (
                  isEditMode ? (
                    <input 
                      type="text" 
                      value={customization.sectionNewTitle} 
                      onChange={(e) => onUpdateCustomization({ sectionNewTitle: e.target.value })}
                      className="bg-slate-100 border-none p-1 rounded focus:ring-2 focus:ring-electricBlue outline-none"
                    />
                  ) : (
                    customization.sectionNewTitle
                  )
                )}
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
               <div className="text-center py-20 bg-slate-50 rounded-3xl">
                   {activeProducts.length === 0 ? (
                       <>
                         <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                         <h3 className="text-xl font-bold text-slate-900 mb-2">Store Launch Pending</h3>
                         <p className="text-slate-400 font-medium text-lg">Add products in the Dashboard to see them here.</p>
                       </>
                   ) : (
                       <p className="text-slate-400 font-medium text-lg">No cool stuff found here.</p>
                   )}
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group cursor-pointer" onClick={() => openProductModal(product)}>
                    <div className="relative overflow-hidden bg-slate-100 rounded-2xl aspect-[3/4] mb-5 shadow-sm group-hover:shadow-2xl group-hover:shadow-slate-200/50 transition-all duration-500">
                      <img 
                        src={product.img} 
                        alt={getName(product)}
                        loading="lazy" 
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300"></div>
                      <div className="absolute bottom-4 right-4 translate-y-full group-hover:translate-y-0 transition duration-300 ease-out">
                        <button className="bg-white text-slate-900 w-12 h-12 flex items-center justify-center shadow-lg rounded-full hover:bg-electricBlue hover:text-white transition">
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-electricBlue transition-colors">{getName(product)}</h3>
                            {product.tags[0] && <p className="text-slate-500 text-sm font-medium mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded">{product.tags[0]}</p>}
                        </div>
                        <p className="text-lg font-bold text-slate-900">{product.price} <span className="text-xs align-top">DKK</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* AI Recommendations */}
          {recommendations.length > 0 && view !== 'search' && (
             <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                       <div className="bg-yellow-400 p-1.5 rounded text-black"><Star className="w-4 h-4 fill-current" /></div>
                       {t.recommendations}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       {recommendations.map(p => (
                          <div key={p.id} onClick={() => openProductModal(p)} className="cursor-pointer group bg-white p-3 rounded-2xl border border-slate-100 hover:border-slate-300 transition hover:-translate-y-1 hover:shadow-lg">
                             <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-3">
                                <img src={p.img} alt={getName(p)} className="w-full h-full object-cover group-hover:scale-105 transition" />
                             </div>
                             <p className="text-sm font-bold text-slate-900 truncate">{getName(p)}</p>
                             <p className="text-xs font-bold text-electricBlue">{p.price} DKK</p>
                          </div>
                       ))}
                    </div>
                </div>
             </section>
          )}

          {/* 5. Modern USPs */}
          {view === 'home' && (
            <section className="py-20 border-t border-slate-100 bg-white">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {customization.uspData.map((usp, i) => {
                    const Icon = (Icons as any)[usp.iconName] || Icons.Zap;
                    return (
                        <div key={i} className="flex flex-col items-center text-center gap-4 group">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center shadow-sm group-hover:scale-110 transition duration-300 group-hover:rotate-3">
                                <Icon className="w-8 h-8 text-electricBlue" />
                            </div>
                            {isEditMode ? (
                              <input 
                                type="text" 
                                value={usp.title} 
                                onChange={(e) => {
                                  const newData = [...customization.uspData];
                                  newData[i].title = e.target.value;
                                  onUpdateCustomization({ uspData: newData });
                                }}
                                className="bg-slate-100 border-none p-1 rounded font-bold text-center w-full focus:ring-2 focus:ring-electricBlue outline-none"
                              />
                            ) : (
                              <h3 className="font-bold text-lg text-slate-900">{usp.title}</h3>
                            )}
                        </div>
                    );
                })}
              </div>
            </section>
          )}

          {/* 6. Footer */}
          <footer className="bg-slate-900 text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="text-3xl font-black tracking-tighter text-white mb-6">
                  {isEditMode ? (
                    <input 
                      type="text" 
                      value={customization.logoText} 
                      onChange={(e) => onUpdateCustomization({ logoText: e.target.value })}
                      className="bg-white/10 border-none p-1 rounded font-black tracking-tighter w-32 focus:ring-2 focus:ring-electricBlue outline-none text-white"
                    />
                  ) : (
                    customization.logoText
                  )}
                  <span className="text-electricBlue">.</span>
                </div>
                {isEditMode ? (
                  <textarea 
                    value={customization.footerDesc} 
                    onChange={(e) => onUpdateCustomization({ footerDesc: e.target.value })}
                    className="w-full bg-white/10 border-none p-3 rounded text-slate-400 focus:ring-2 focus:ring-electricBlue outline-none h-24"
                  />
                ) : (
                  <p className="text-slate-400 max-w-sm text-lg leading-relaxed">{customization.footerDesc}</p>
                )}
              </div>
              <div>
                <h4 className="font-bold mb-6 text-slate-200">Shop</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="hover:text-white cursor-pointer transition">New Arrivals</li>
                  <li className="hover:text-white cursor-pointer transition">Best Sellers</li>
                  <li className="hover:text-white cursor-pointer transition">Sustainability</li>
                </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6 text-slate-200">Payment</h4>
                 <div className="flex gap-3 items-center opacity-80">
                    <div className="h-8 px-3 bg-white rounded text-[10px] font-bold text-blue-800 flex items-center">MobilePay</div>
                    <div className="h-8 px-3 bg-white rounded text-[10px] font-bold text-red-700 flex items-center">Dankort</div>
                    <div className="h-8 px-3 bg-white rounded text-[10px] font-bold text-slate-800 flex items-center">VISA</div>
                 </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 flex justify-between items-center text-xs text-slate-500 font-medium">
              <p>&copy; 2025 NORVOSS Demo Store.</p>
              <p>Designed with Gemini</p>
            </div>
          </footer>
        </>
      )}

      {/* Hidden File Input for Customization */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row z-10 animate-fade-in-up overflow-hidden">
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full z-20 transition backdrop-blur">
                      <X className="w-5 h-5 text-slate-900" />
                  </button>

                  <div className="w-full md:w-1/2 bg-slate-100 relative">
                      <img src={selectedProduct.img} alt={getName(selectedProduct)} className="w-full h-full object-cover" />
                  </div>

                  <div className="w-full md:w-1/2 p-10 flex flex-col">
                      <div className="flex-1">
                          <h2 className="text-4xl font-black text-slate-900 mb-2 leading-tight">{getName(selectedProduct)}</h2>
                          <p className="text-3xl text-electricBlue font-bold mb-8">{selectedProduct.price} DKK</p>
                          
                          <div className="space-y-6 mb-10">
                              <p className="text-slate-600 leading-relaxed text-lg">
                                  {getDesc(selectedProduct)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                  {selectedProduct.tags.map(tag => (
                                      <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full uppercase tracking-wide">{tag}</span>
                                  ))}
                              </div>
                          </div>

                          {/* AI Review Summary */}
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 opacity-10">
                                <MessageCircle className="w-24 h-24 text-slate-900" />
                              </div>
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  AI Summary
                              </h3>
                              
                              {loadingSummary ? (
                                  <div className="text-sm font-medium text-slate-400 animate-pulse flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin"></div>
                                      Analyzing reviews...
                                  </div>
                              ) : reviewSummary ? (
                                  <div className="space-y-4 relative z-10">
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                              reviewSummary.overall_sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                              {reviewSummary.overall_sentiment} Feedback
                                          </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-6">
                                          <div>
                                              <p className="text-xs font-bold text-emerald-600 mb-2 uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Pros</p>
                                              <ul className="text-sm text-slate-600 space-y-1">
                                                  {lang === 'da' ? reviewSummary.pros_da.map((p,i) => <li key={i}>• {p}</li>) : reviewSummary.pros_en.map((p,i) => <li key={i}>• {p}</li>)}
                                              </ul>
                                          </div>
                                          <div>
                                              <p className="text-xs font-bold text-red-500 mb-2 uppercase flex items-center gap-1"><X className="w-3 h-3"/> Cons</p>
                                              <ul className="text-sm text-slate-600 space-y-1">
                                                  {lang === 'da' ? reviewSummary.cons_da.map((p,i) => <li key={i}>• {p}</li>) : reviewSummary.cons_en.map((p,i) => <li key={i}>• {p}</li>)}
                                              </ul>
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <p className="text-sm text-slate-400 italic">No reviews yet.</p>
                              )}
                          </div>
                      </div>

                      <button 
                        onClick={() => addToCart(selectedProduct.id)}
                        className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-lg hover:bg-black transition shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
                      >
                          <ShoppingBag className="w-6 h-6" /> Add to Cart
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Storefront;
