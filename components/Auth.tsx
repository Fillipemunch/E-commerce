
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Check, ArrowLeft, Store } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface AuthProps {
  lang: Language;
  onLogin: (storeName?: string) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ lang, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const t = UI_TEXT[lang];

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [gdprChecked, setGdprChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !storeName.trim()) {
        alert(t.error_store_required);
        return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin(storeName);
    }, 1500);
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
  };

  const strength = getPasswordStrength(password);
  const strengthColor = ['bg-slate-200', 'bg-red-500', 'bg-yellow-500', 'bg-emeraldAction'][strength];
  const strengthText = ['-', 'Weak', 'Medium', 'Strong'][strength];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up border border-slate-100 relative">
        
        {/* Back Button */}
        <button 
            onClick={onBack}
            className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white transition"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-electricBlue p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-electricBlue to-deepBlue opacity-90 z-0"></div>
          <div className="relative z-10 pt-4">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">NORDIC<span className="text-neonYellow">.</span></h1>
            <p className="text-blue-100 font-medium">{isLogin ? t.hero_subtitle : t.auth_signup_title}</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                  <div className="relative group">
                    <User className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-electricBlue transition-colors" />
                    <input
                      type="text"
                      placeholder={t.auth_fullname}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electricBlue focus:border-transparent outline-none transition-all hover:bg-white"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <Store className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-electricBlue transition-colors" />
                    <input
                      type="text"
                      placeholder={t.auth_storename}
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electricBlue focus:border-transparent outline-none transition-all hover:bg-white"
                      required
                    />
                  </div>
              </>
            )}

            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-electricBlue transition-colors" />
              <input
                type="email"
                placeholder={t.auth_email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electricBlue focus:border-transparent outline-none transition-all hover:bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-electricBlue transition-colors" />
                <input
                  type="password"
                  placeholder={t.auth_password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electricBlue focus:border-transparent outline-none transition-all hover:bg-white"
                  required
                />
              </div>
              
              {!isLogin && password.length > 0 && (
                 <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">{t.auth_pass_strength}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full ${strengthColor} transition-all duration-500`} style={{ width: `${(strength / 3) * 100}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-700">{strengthText}</span>
                 </div>
              )}
            </div>

            {!isLogin && (
               <div className="relative group">
                 <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-electricBlue transition-colors" />
                 <input
                   type="password"
                   placeholder={t.auth_confirm_pass}
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electricBlue focus:border-transparent outline-none transition-all hover:bg-white"
                   required
                 />
               </div>
            )}

            {!isLogin && (
               <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${gdprChecked ? 'bg-electricBlue border-electricBlue' : 'border-slate-300 bg-white'}`}>
                     {gdprChecked && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={gdprChecked} onChange={() => setGdprChecked(!gdprChecked)} required />
                  <span className="text-sm text-slate-500 leading-tight group-hover:text-slate-700 transition-colors">{t.auth_gdpr}</span>
               </label>
            )}

            {isLogin && (
               <div className="flex justify-end">
                  <button type="button" className="text-sm text-electricBlue font-semibold hover:underline">
                     {t.auth_forgot}
                  </button>
               </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !gdprChecked)}
              className="w-full bg-emeraldAction text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover-scale active-scale transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                 <>
                   {isLogin ? t.auth_btn_login : t.auth_btn_signup}
                   <ArrowRight className="w-5 h-5" />
                 </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <button 
               onClick={() => { setIsLogin(!isLogin); setPassword(''); }}
               className="text-sm font-medium text-slate-500 hover:text-electricBlue transition-colors"
             >
                {isLogin ? t.auth_switch_signup : t.auth_switch_login}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
