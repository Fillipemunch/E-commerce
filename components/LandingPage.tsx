
import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Zap, Shield, TrendingUp, Globe, UserPlus, UploadCloud, Gavel, Rocket } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface LandingPageProps {
  lang: Language;
  onLoginClick: () => void;
  toggleLang: () => void;
  isEditMode?: boolean;
  customLabels?: Record<string, string>;
  onLabelChange?: (key: string, value: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, onLoginClick, toggleLang, isEditMode, customLabels, onLabelChange }) => {
  const t = { ...UI_TEXT[lang], ...customLabels };
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden selection:bg-electricBlue selection:text-white">
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-2xl py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity">
             <div className="w-10 h-10 bg-electricBlue rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/50 group-hover:rotate-6 transition-transform">N</div>
             <span className="text-2xl font-black tracking-tighter">Nordic<span className="text-electricBlue">Com</span></span>
          </div>

          <div className="flex items-center gap-6">
             {/* Nav Links */}
             <button 
                onClick={() => scrollToSection('how-it-works')}
                className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors"
             >
                {t.landing_how_it_works}
             </button>

             {/* Utility Buttons */}
             <div className="flex items-center gap-4">
                {/* Language Toggle */}
                <button 
                    onClick={toggleLang}
                    className="flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
                >
                    <Globe className="w-4 h-4 text-electricBlue" />
                    <span>{lang.toUpperCase()}</span>
                </button>

                {/* Login Button */}
                <button 
                  onClick={onLoginClick}
                  className="bg-white text-slate-900 border border-white px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 hover:bg-electricBlue hover:border-electricBlue hover:text-white hover:shadow-lg shadow-white/10 active:scale-95"
                >
                  {t.landing_login}
                </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 text-center max-w-5xl mx-auto mt-10">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electricBlue/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
         
         <div className="inline-block bg-electricBlue/10 border border-electricBlue/50 px-4 py-1.5 rounded-full text-electricBlue font-bold text-xs uppercase tracking-widest mb-8 backdrop-blur animate-fade-in-up">
            V 3.0 • Powered by Gemini AI
         </div>
         
         <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter animate-fade-in-up drop-shadow-2xl">
            {isEditMode ? (
              <textarea 
                value={t.landing_hero} 
                onChange={(e) => onLabelChange?.('landing_hero', e.target.value)}
                className="w-full bg-white/10 border-none p-3 rounded text-5xl md:text-8xl font-black text-white focus:ring-2 focus:ring-electricBlue outline-none h-48 text-center"
              />
            ) : (
              t.landing_hero
            )}
         </h1>
         <div className="mb-12 max-w-3xl mx-auto">
            {isEditMode ? (
              <textarea 
                value={t.landing_sub} 
                onChange={(e) => onLabelChange?.('landing_sub', e.target.value)}
                className="w-full bg-white/10 border-none p-3 rounded text-xl md:text-2xl text-slate-400 focus:ring-2 focus:ring-electricBlue outline-none h-32 text-center"
              />
            ) : (
              <p className="text-xl md:text-2xl text-slate-400 leading-relaxed animate-fade-in-up font-medium">
                {t.landing_sub}
              </p>
            )}
         </div>
         
         <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fade-in-up">
            <button 
               onClick={onLoginClick}
               className="bg-electricBlue text-white px-12 py-5 rounded-full font-black text-lg hover:bg-blue-600 transition shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 group"
            >
               {isEditMode ? (
                  <input 
                    type="text" 
                    value={t.landing_cta_primary} 
                    onChange={(e) => onLabelChange?.('landing_cta_primary', e.target.value)}
                    className="bg-transparent border-none p-0 w-48 focus:ring-0 outline-none text-white text-center"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  t.landing_cta_primary
                )}
               <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </section>

      {/* How It Works Section (New Replacement) */}
      <section id="how-it-works" className="py-24 bg-slate-950/50 border-t border-b border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-electricBlue/5 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">{t.landing_how_it_works}</h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">From setup to sales in 4 simple, AI-powered steps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Step 1 */}
                  <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-electricBlue to-deepBlue rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-800 h-full flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-electricBlue border-2 border-slate-700 shadow-xl font-black text-xl">1</div>
                          <div className="mb-4 p-3 bg-electricBlue/10 rounded-xl text-electricBlue"><UserPlus className="w-8 h-8"/></div>
                          <h3 className="text-xl font-bold text-white mb-2">{t.step_1_title}</h3>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">{t.step_1_desc}</p>
                      </div>
                  </div>

                  {/* Step 2 */}
                  <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-vibrantOrange to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-800 h-full flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-vibrantOrange border-2 border-slate-700 shadow-xl font-black text-xl">2</div>
                          <div className="mb-4 p-3 bg-vibrantOrange/10 rounded-xl text-vibrantOrange"><UploadCloud className="w-8 h-8"/></div>
                          <h3 className="text-xl font-bold text-white mb-2">{t.step_2_title}</h3>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">{t.step_2_desc}</p>
                      </div>
                  </div>

                  {/* Step 3 */}
                  <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emeraldAction to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-800 h-full flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-emeraldAction border-2 border-slate-700 shadow-xl font-black text-xl">3</div>
                          <div className="mb-4 p-3 bg-emeraldAction/10 rounded-xl text-emeraldAction"><Gavel className="w-8 h-8"/></div>
                          <h3 className="text-xl font-bold text-white mb-2">{t.step_3_title}</h3>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">{t.step_3_desc}</p>
                      </div>
                  </div>

                  {/* Step 4 */}
                  <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-magentaPop to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-800 h-full flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-magentaPop border-2 border-slate-700 shadow-xl font-black text-xl">4</div>
                          <div className="mb-4 p-3 bg-magentaPop/10 rounded-xl text-magentaPop"><Rocket className="w-8 h-8"/></div>
                          <h3 className="text-xl font-bold text-white mb-2">{t.step_4_title}</h3>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">{t.step_4_desc}</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid (B2B Marketing) */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-900">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <span className="text-electricBlue font-bold uppercase tracking-widest text-sm mb-4 block">Why Choose NordicCom?</span>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                {t.landing_feat_header}
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-electricBlue/50 transition group hover:-translate-y-2 duration-300 hover:shadow-2xl hover:shadow-blue-900/20">
                  <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 text-electricBlue group-hover:bg-electricBlue group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                     <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-electricBlue transition-colors">{t.landing_feat_content}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                     Instantly generate bilingual product descriptions and SEO metadata with our advanced AI Content Creator.
                  </p>
               </div>

               {/* Feature 2 */}
               <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-emeraldAction/50 transition group hover:-translate-y-2 duration-300 hover:shadow-2xl hover:shadow-emerald-900/20">
                  <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-8 text-emeraldAction group-hover:bg-emeraldAction group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                     <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emeraldAction transition-colors">{t.landing_feat_legal}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                     Automated compliance checks for GDPR and Danish Consumer Contracts Act (14-day return policy).
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-magentaPop/50 transition group hover:-translate-y-2 duration-300 hover:shadow-2xl hover:shadow-pink-900/20">
                  <div className="w-16 h-16 bg-pink-900/30 rounded-2xl flex items-center justify-center mb-8 text-magentaPop group-hover:bg-magentaPop group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                     <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-magentaPop transition-colors">{t.landing_feat_forecast}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                     Predictive inventory forecasting based on Danish seasonality trends to prevent stockouts.
                  </p>
               </div>
            </div>

            {/* Additional Features List */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {['Bilingual Chatbot', 'Fraud Detection', 'Smart Search', 'Voice Control'].map((feat, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl py-4 px-6 font-bold text-slate-300 border border-white/5 flex items-center justify-center gap-3 hover:bg-white/10 transition hover:scale-105 cursor-default">
                        <CheckCircle className="w-5 h-5 text-emeraldAction" /> {feat}
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-electricBlue font-bold uppercase tracking-widest mb-10 text-xs">Trusted by Danish SMBs</p>
              <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-24 items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                  <h3 className="text-3xl font-black text-white tracking-tighter">Nordic Living</h3>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Copenhagen Design</h3>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Aarhus Style</h3>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Odense Home</h3>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-900 text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-4 h-4" />
              <span>Copenhagen, Denmark</span>
          </div>
          <p>&copy; 2025 NordicCom. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
