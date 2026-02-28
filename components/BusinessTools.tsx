import React, { useState } from 'react';
import { ShieldAlert, FileText, TrendingUp, AlertTriangle, CheckCircle, Download, FileCheck, MessageCircle, Languages, Tag, RefreshCw, Copy, Check, Eye, Lock, LayoutTemplate, Accessibility, Mic, CreditCard, DollarSign } from 'lucide-react';
import { Language, ComplianceResult, CompetitorInsight, SocialResponse, SmartCouponResult, FraudAnalysis, ForecastRecommendation, AccessibilityAudit, VoiceCommandIntent } from '../types';
import { UI_TEXT, MOCK_INVENTORY, MOCK_TRANSACTION } from '../constants';
import { checkCompliance, analyzeCompetitorPricing, generateSocialResponses, translateBusinessText, generateSmartCoupon, analyzeFraudRisk, predictInventory, generateLandingPage, auditAccessibility, parseVoiceCommand } from '../services/geminiService';

interface BusinessToolsProps {
  lang: Language;
}

const BusinessTools: React.FC<BusinessToolsProps> = ({ lang }) => {
  const t = UI_TEXT[lang];
  const [activeTool, setActiveTool] = useState<'compliance' | 'pricing' | 'invoice' | 'social' | 'translator' | 'coupons' | 'fraud' | 'forecast' | 'landing' | 'access' | 'voice' | 'chatbot' | 'search'>('compliance');

  // Compliance State
  const [complianceText, setComplianceText] = useState('');
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [loadingCompliance, setLoadingCompliance] = useState(false);

  // Pricing State
  const [pricingResults, setPricingResults] = useState<Record<string, CompetitorInsight>>({});
  const [loadingPricing, setLoadingPricing] = useState<string | null>(null);

  // Social State
  const [socialInput, setSocialInput] = useState('');
  const [socialResult, setSocialResult] = useState<SocialResponse | null>(null);
  const [loadingSocial, setLoadingSocial] = useState(false);

  // Translator State
  const [transInput, setTransInput] = useState('');
  const [transResult, setTransResult] = useState('');
  const [loadingTrans, setLoadingTrans] = useState(false);

  // Coupon State
  const [cartValue, setCartValue] = useState<number>(0);
  const [couponResult, setCouponResult] = useState<SmartCouponResult | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Fraud State
  const [fraudResult, setFraudResult] = useState<FraudAnalysis | null>(null);
  const [loadingFraud, setLoadingFraud] = useState(false);

  // Forecast State
  const [forecastResult, setForecastResult] = useState<ForecastRecommendation[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Landing Page State
  const [landingGoal, setLandingGoal] = useState('');
  const [landingHtml, setLandingHtml] = useState('');
  const [loadingLanding, setLoadingLanding] = useState(false);

  // Accessibility State
  const [accessInput, setAccessInput] = useState('');
  const [accessResult, setAccessResult] = useState<AccessibilityAudit | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<VoiceCommandIntent | null>(null);

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string }>>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Handlers
  const handleCheckCompliance = async () => {
    if (!complianceText) return;
    setLoadingCompliance(true);
    const res = await checkCompliance(complianceText);
    setComplianceResult(res);
    setLoadingCompliance(false);
  };

  const handleAnalyzePrice = async (productId: string, name: string, price: number) => {
    setLoadingPricing(productId);
    const res = await analyzeCompetitorPricing(name, price.toString());
    if (res) {
        setPricingResults(prev => ({ ...prev, [productId]: res }));
    }
    setLoadingPricing(null);
  };

  const handleSocialGenerate = async () => {
      if (!socialInput) return;
      setLoadingSocial(true);
      const res = await generateSocialResponses(socialInput);
      setSocialResult(res);
      setLoadingSocial(false);
  };

  const handleTranslate = async () => {
      if (!transInput) return;
      setLoadingTrans(true);
      const res = await translateBusinessText(transInput);
      setTransResult(res);
      setLoadingTrans(false);
  };

  const handleGenerateCoupon = async () => {
      setLoadingCoupon(true);
      const res = await generateSmartCoupon(cartValue, true);
      setCouponResult(res);
      setLoadingCoupon(false);
  };

  const handleAnalyzeFraud = async () => {
      setLoadingFraud(true);
      const res = await analyzeFraudRisk(MOCK_TRANSACTION);
      setFraudResult(res);
      setLoadingFraud(false);
  };

  const handleGenerateForecast = async () => {
      setLoadingForecast(true);
      const res = await predictInventory(MOCK_INVENTORY);
      setForecastResult(res);
      setLoadingForecast(false);
  };

  const handleGenerateLanding = async () => {
      if (!landingGoal) return;
      setLoadingLanding(true);
      const html = await generateLandingPage(landingGoal);
      setLandingHtml(html);
      setLoadingLanding(false);
  };

  const handleAuditAccess = async () => {
      if (!accessInput) return;
      setLoadingAccess(true);
      const res = await auditAccessibility(accessInput);
      setAccessResult(res);
      setLoadingAccess(false);
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Browser does not support Speech Recognition");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'da' ? 'da-DK' : 'en-US';
    recognition.start();
    setIsListening(true);
    setVoiceTranscript('');
    setVoiceResult(null);

    recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setIsListening(false);
        const intent = await parseVoiceCommand(transcript);
        setVoiceResult(intent);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleChat = async () => {
    if (!chatInput) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoadingChat(true);
    
    // Import chatWithAI dynamically or use it if already imported
    const { chatWithAI } = await import('../services/geminiService');
    const response = await chatWithAI(userMsg, chatHistory);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setLoadingChat(false);
  };


  const renderCompliance = () => (
    <div className="space-y-6 animate-slide-in-right">
       <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
             <div className="bg-red-50 p-2 rounded-xl text-danishRed"><ShieldAlert className="w-6 h-6" /></div> 
             {t.tool_compliance}
          </h3>
          <textarea 
            className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-danishRed focus:bg-white outline-none mb-6 text-sm font-medium transition-all"
            placeholder={t.compliance_placeholder}
            value={complianceText}
            onChange={(e) => setComplianceText(e.target.value)}
          />
          <button 
             onClick={handleCheckCompliance}
             disabled={loadingCompliance || !complianceText}
             className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
          >
             {loadingCompliance ? t.loading : t.btn_check_compliance}
          </button>
       </div>

       {complianceResult && (
           <div className={`p-8 rounded-3xl border-2 ${complianceResult.is_compliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-fade-in-up`}>
              <div className="flex items-center gap-3 mb-4">
                  {complianceResult.is_compliant ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                  <h4 className={`text-2xl font-black ${complianceResult.is_compliant ? 'text-green-800' : 'text-red-800'}`}>
                      {complianceResult.is_compliant ? t.compliance_pass : t.compliance_fail}
                  </h4>
              </div>
              
              {!complianceResult.is_compliant && (
                  <ul className="list-disc list-inside space-y-2 mb-6 text-sm font-medium text-red-800 bg-white/50 p-4 rounded-xl border border-red-100">
                      {complianceResult.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <strong className="block text-[10px] uppercase font-black text-slate-400 mb-2">Dansk Suggestion</strong>
                      <p className="text-sm font-medium text-slate-700">{complianceResult.suggestion_da}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <strong className="block text-[10px] uppercase font-black text-slate-400 mb-2">English Suggestion</strong>
                      <p className="text-sm font-medium text-slate-700">{complianceResult.suggestion_en}</p>
                  </div>
              </div>
           </div>
       )}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6 animate-slide-in-right">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
            <div className="p-8 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><TrendingUp className="w-6 h-6" /></div>
                    {t.tool_pricing}
                </h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                    <tr>
                        <th className="px-8 py-4">Product</th>
                        <th className="px-8 py-4">Our Price</th>
                        <th className="px-8 py-4">Competitor Insight</th>
                        <th className="px-8 py-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {MOCK_INVENTORY.map(item => (
                        <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-8 py-5 font-bold text-slate-800">{item.name}</td>
                            <td className="px-8 py-5 font-mono text-slate-600">1299 DKK</td>
                            <td className="px-8 py-5">
                                {pricingResults[item.productId] ? (
                                    <div className="text-xs bg-blue-50 p-3 rounded-lg border border-blue-100 animate-fade-in-up">
                                        <p className="font-bold text-slate-800">{pricingResults[item.productId].competitor_name}</p>
                                        <p className="text-slate-500 font-mono">{pricingResults[item.productId].competitor_price}</p>
                                        <p className="text-blue-600 font-bold mt-1">{pricingResults[item.productId].suggestion}</p>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-xs italic">No data yet</span>
                                )}
                            </td>
                            <td className="px-8 py-5">
                                <button 
                                   onClick={() => handleAnalyzePrice(item.productId, item.name, 1299)}
                                   disabled={loadingPricing === item.productId}
                                   className="text-danishRed hover:text-white hover:bg-danishRed border border-danishRed px-3 py-1.5 rounded-lg font-bold text-xs transition-all"
                                >
                                    {loadingPricing === item.productId ? 'Analyzing...' : 'Analyze Market'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {MOCK_INVENTORY.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold">
                                No products in inventory to analyze. Add products first.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderInvoice = () => (
      <div className="space-y-6 animate-slide-in-right">
          
          {/* Metrics Overview (Clean Start) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">{t.metric_invoiced}</p>
                      <h4 className="text-2xl font-black text-slate-900">0 DKK</h4>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><DollarSign className="w-5 h-5"/></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">{t.metric_due}</p>
                      <h4 className="text-lg font-black text-slate-900">{t.metric_na}</h4>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><CreditCard className="w-5 h-5"/></div>
              </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-electricBlue to-deepBlue"></div>
              
              <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                  <div>
                      <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">NORVOSS Shop</h1>
                      <p className="text-sm font-medium text-slate-500">Strøget 1, 1100 København K</p>
                      <p className="text-sm font-medium text-slate-500">CVR: 12345678</p>
                  </div>
                  <div className="text-right">
                      <h2 className="text-2xl font-mono font-bold text-slate-800">{t.invoice_title}</h2>
                      <p className="text-sm font-medium text-slate-500 mt-1">Dato: {new Date().toLocaleDateString('da-DK')}</p>
                  </div>
              </div>

              <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-center min-h-[100px]">
                  <p className="text-slate-400 font-bold text-sm italic">Select a customer to bill...</p>
              </div>

              <table className="w-full text-sm mb-10">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                      <tr>
                          <th className="px-6 py-3 text-left rounded-l-lg">Description</th>
                          <th className="px-6 py-3 text-right">Qty</th>
                          <th className="px-6 py-3 text-right">Price</th>
                          <th className="px-6 py-3 text-right rounded-r-lg">Total</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      <tr>
                          <td className="px-6 py-8 text-center text-slate-400 italic" colSpan={4}>No items added to invoice.</td>
                      </tr>
                  </tbody>
              </table>

              <div className="flex justify-end pt-6">
                  <div className="text-right space-y-2">
                      <p className="text-sm font-medium text-slate-500">Subtotal: 0,00 DKK</p>
                      <p className="text-sm font-medium text-slate-500">Moms (25%): 0,00 DKK</p>
                      <div className="bg-slate-900 text-white px-6 py-3 rounded-xl mt-4">
                          <p className="text-xl font-black">{t.invoice_total}: 0,00 DKK</p>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="flex justify-center">
             <button disabled className="bg-slate-200 text-slate-400 px-8 py-4 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                 <Download className="w-5 h-5" /> Download PDF (Empty)
             </button>
          </div>
      </div>
  );

  const renderSocial = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><MessageCircle className="w-6 h-6" /></div>
                  {t.tool_social}
              </h3>
              <textarea 
                  className="w-full h-32 p-5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none mb-6 text-sm font-medium transition-all"
                  placeholder={t.social_placeholder}
                  value={socialInput}
                  onChange={(e) => setSocialInput(e.target.value)}
              />
              <button 
                 onClick={handleSocialGenerate}
                 disabled={loadingSocial || !socialInput}
                 className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
              >
                 {loadingSocial ? t.loading : 'Generate Responses'}
              </button>
          </div>

          {socialResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                  {[
                      { title: 'Formal', text: socialResult.formal, bg: 'bg-slate-50', border: 'border-slate-200' },
                      { title: 'Casual (Hygge)', text: socialResult.casual, bg: 'bg-orange-50', border: 'border-orange-100' },
                      { title: 'Optimistic', text: socialResult.optimistic, bg: 'bg-green-50', border: 'border-green-100' }
                  ].map((card, i) => (
                      <div key={i} className={`p-6 rounded-2xl border ${card.border} ${card.bg} shadow-sm relative group hover:shadow-md transition-all`}>
                           <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-3">{card.title}</h4>
                           <p className="text-slate-800 text-sm font-medium leading-relaxed">{card.text}</p>
                           <button className="absolute top-4 right-4 p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-slate-400 hover:text-electricBlue" title="Copy"><Copy className="w-4 h-4"/></button>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderTranslator = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-purple-50 p-2 rounded-xl text-purple-600"><Languages className="w-6 h-6" /></div>
                  {t.tool_translator}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Input (DA/EN)</label>
                       <textarea 
                           className="w-full h-48 p-5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-purple-500 focus:bg-white outline-none text-sm font-medium transition-all"
                           placeholder={t.translate_placeholder}
                           value={transInput}
                           onChange={(e) => setTransInput(e.target.value)}
                       />
                  </div>
                  <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Translation</label>
                       <div className="w-full h-48 p-5 bg-purple-50/50 border-2 border-purple-50 rounded-xl text-sm font-medium overflow-y-auto text-slate-700">
                           {loadingTrans ? <span className="text-purple-400 animate-pulse font-bold">{t.loading}</span> : transResult || <span className="text-slate-400 italic">Result appears here...</span>}
                       </div>
                  </div>
              </div>
              <div className="mt-6">
                  <button 
                     onClick={handleTranslate}
                     disabled={loadingTrans || !transInput}
                     className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
                  >
                     <RefreshCw className={`w-4 h-4 ${loadingTrans ? 'animate-spin' : ''}`} /> {t.translate_btn}
                  </button>
              </div>
          </div>
      </div>
  );

  const renderCoupons = () => (
      <div className="space-y-6 animate-slide-in-right">
          
           {/* Metrics Overview (Clean Start) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">{t.metric_coupons}</p>
                      <h4 className="text-2xl font-black text-slate-900">0</h4>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Tag className="w-5 h-5"/></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">{t.metric_redemption}</p>
                      <h4 className="text-lg font-black text-slate-900">0%</h4>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><TrendingUp className="w-5 h-5"/></div>
              </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-green-50 p-2 rounded-xl text-green-600"><Tag className="w-6 h-6" /></div>
                  {t.tool_coupons}
               </h3>
               
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Simulate Cart Value (DKK)</p>
                        <input 
                            type="number" 
                            value={cartValue}
                            onChange={(e) => setCartValue(Number(e.target.value))}
                            className="text-3xl font-black text-slate-900 bg-transparent border-b-2 border-slate-300 focus:border-danishRed outline-none w-full"
                            placeholder="0"
                        />
                    </div>
                    <button 
                       onClick={handleGenerateCoupon}
                       disabled={loadingCoupon || cartValue <= 0}
                       className="bg-danishRed text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-danishRedDark transition shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {loadingCoupon ? t.loading : t.coupon_generate}
                    </button>
               </div>

               {couponResult && (
                   <div className="border-4 border-dashed border-danishRed/20 bg-red-50/20 p-8 rounded-3xl text-center relative overflow-hidden animate-fade-in-up">
                       <div className="absolute top-0 right-0 bg-danishRed text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl uppercase tracking-widest">AI Generated</div>
                       
                       <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Recommended Action</h4>
                       <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">{couponResult.discount} OFF</div>
                       <div className="inline-block bg-white border-2 border-slate-200 px-6 py-3 rounded-xl font-mono font-black text-xl mb-6 text-danishRed shadow-sm">
                           {couponResult.code}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mt-2">
                           <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black uppercase text-slate-400 mb-1">DK Message</p>
                               <p className="text-sm font-bold text-slate-800 italic">"{couponResult.message_da}"</p>
                           </div>
                           <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black uppercase text-slate-400 mb-1">EN Message</p>
                               <p className="text-sm font-bold text-slate-800 italic">"{couponResult.message_en}"</p>
                           </div>
                       </div>
                   </div>
               )}
          </div>
      </div>
  );

  const renderFraud = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-orange-50 p-2 rounded-xl text-orange-600"><Lock className="w-6 h-6" /></div>
                  {t.tool_fraud}
              </h3>
              
              <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-sm font-mono border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Transaction ID</p>
                      <p className="font-bold text-slate-800">{MOCK_TRANSACTION.id}</p>
                  </div>
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Amount</p>
                      <p className="font-bold text-slate-800">{MOCK_TRANSACTION.amount} {MOCK_TRANSACTION.currency}</p>
                  </div>
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Locations</p>
                      <p className="font-bold text-slate-800">IP: {MOCK_TRANSACTION.ip_country} / Card: {MOCK_TRANSACTION.card_country}</p>
                  </div>
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Email</p>
                      <p className="font-bold text-slate-800">{MOCK_TRANSACTION.customer_email}</p>
                  </div>
              </div>

              <button 
                onClick={handleAnalyzeFraud}
                disabled={loadingFraud}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg disabled:opacity-50"
              >
                  {loadingFraud ? t.loading : t.fraud_analyze_btn}
              </button>
          </div>

          {fraudResult && (
              <div className={`p-8 rounded-3xl border-2 ${fraudResult.risk_level === 'High' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} animate-fade-in-up`}>
                  <div className="flex items-center gap-4 mb-4">
                       <AlertTriangle className={`w-8 h-8 ${fraudResult.risk_level === 'High' ? 'text-red-600' : 'text-yellow-600'}`} />
                       <h4 className={`text-2xl font-black ${fraudResult.risk_level === 'High' ? 'text-red-800' : 'text-yellow-800'}`}>
                          Risk Level: {fraudResult.risk_level}
                       </h4>
                       <div className="bg-white/50 px-3 py-1 rounded-full text-sm font-black border border-black/5">Score: {fraudResult.score}/100</div>
                  </div>
                  <p className="font-bold text-lg mb-4 text-slate-800">Recommendation: {fraudResult.action_recommendation}</p>
                  <ul className="list-disc list-inside text-sm font-medium opacity-80 space-y-1">
                      {fraudResult.reasons.map((r,i) => <li key={i}>{r}</li>)}
                  </ul>
              </div>
          )}
      </div>
  );

  const renderForecast = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><TrendingUp className="w-6 h-6" /></div>
                  {t.tool_forecast}
               </h3>
               <button 
                   onClick={handleGenerateForecast}
                   disabled={loadingForecast}
                   className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 mb-8"
               >
                  {loadingForecast ? t.loading : t.forecast_btn}
               </button>

               {forecastResult.length > 0 && (
                   <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
                       {forecastResult.map((rec, i) => (
                           <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-200 transition-colors">
                               <div>
                                   <div className="flex items-center gap-3 mb-1">
                                       <p className="font-black text-lg text-slate-900">{rec.product_name}</p>
                                       <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${rec.action === 'Restock' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                           {rec.action}
                                       </span>
                                   </div>
                                   <p className="text-sm text-slate-500 font-medium">{lang === 'da' ? rec.reasoning_da : rec.reasoning_en}</p>
                               </div>
                               <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center min-w-[100px]">
                                   <p className="text-[10px] font-black text-slate-400 uppercase">Suggestion</p>
                                   <p className="text-xl font-black text-indigo-600">{rec.quantity_suggestion}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
          </div>
      </div>
  );

  const renderLanding = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-pink-50 p-2 rounded-xl text-pink-500"><LayoutTemplate className="w-6 h-6" /></div>
                  {t.tool_landing}
               </h3>
               <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-pink-500 focus:bg-white outline-none font-medium mb-6"
                  placeholder={t.landing_placeholder}
                  value={landingGoal}
                  onChange={(e) => setLandingGoal(e.target.value)}
               />
               <button 
                  onClick={handleGenerateLanding}
                  disabled={loadingLanding || !landingGoal}
                  className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg shadow-pink-500/30 disabled:opacity-50"
               >
                   {loadingLanding ? t.loading : t.landing_btn}
               </button>
          </div>
          {landingHtml && (
              <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
                  <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs font-bold text-center text-slate-500 uppercase tracking-widest">Live Preview</div>
                  <iframe 
                      title="Landing Page Preview"
                      srcDoc={landingHtml}
                      className="w-full h-[600px] bg-white"
                  />
              </div>
          )}
      </div>
  );

  const renderAccess = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                  <div className="bg-teal-50 p-2 rounded-xl text-teal-600"><Accessibility className="w-6 h-6" /></div>
                  {t.tool_access}
               </h3>
               <textarea 
                  className="w-full h-48 p-5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-teal-500 focus:bg-white outline-none mb-6 text-sm font-mono text-slate-600"
                  placeholder={t.access_placeholder}
                  value={accessInput}
                  onChange={(e) => setAccessInput(e.target.value)}
               />
               <button 
                   onClick={handleAuditAccess}
                   disabled={loadingAccess || !accessInput}
                   className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-500/30 disabled:opacity-50"
               >
                   {loadingAccess ? t.loading : t.access_btn}
               </button>
          </div>
          
          {accessResult && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg animate-fade-in-up">
                  <div className="flex items-center gap-6 mb-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black border-4 ${accessResult.score > 80 ? 'border-green-100 text-green-600 bg-green-50' : 'border-red-100 text-red-600 bg-red-50'}`}>
                          {accessResult.score}
                      </div>
                      <div>
                          <h4 className="text-lg font-black text-slate-900">WCAG Compliance Score</h4>
                          <p className="text-sm font-medium text-slate-500">Based on analysis of provided HTML snippet.</p>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Issues Found</p>
                      <ul className="space-y-2">
                          {accessResult.issues.map((issue, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                  {issue}
                              </li>
                          ))}
                      </ul>
                  </div>
                   <div className="mt-6">
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Fixed HTML Snippet</p>
                      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                        {accessResult.fixed_html_snippet || "No fix provided."}
                      </div>
                   </div>
              </div>
          )}
      </div>
  );

  const renderVoice = () => (
    <div className="space-y-6 animate-slide-in-right">
       <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg text-center">
            <h3 className="text-xl font-black mb-6 flex items-center justify-center gap-3 text-slate-900">
                <div className="bg-rose-50 p-2 rounded-xl text-rose-600"><Mic className="w-6 h-6" /></div>
                {t.tool_voice}
            </h3>
            
            <div className="mb-8">
               <button 
                 onClick={handleVoiceCommand}
                 className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 scale-110 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
               >
                  <Mic className="w-10 h-10" />
               </button>
               <p className="mt-4 text-sm font-bold text-slate-500">{isListening ? t.voice_listening : 'Click to Speak'}</p>
            </div>

            {voiceTranscript && (
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 inline-block max-w-lg">
                  <p className="text-slate-600 italic">"{voiceTranscript}"</p>
               </div>
            )}

            {voiceResult && (
               <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl max-w-lg mx-auto animate-fade-in-up">
                   <div className="flex items-center justify-center gap-2 mb-2 text-emerald-700 font-bold">
                      <CheckCircle className="w-5 h-5" /> Intent Recognized
                   </div>
                   <p className="text-lg font-black text-slate-900 mb-2 uppercase">{voiceResult.action}</p>
                   <p className="text-slate-600 mb-4">{voiceResult.confirmation_msg}</p>
                   <div className="text-xs font-mono bg-white/50 p-2 rounded border border-emerald-100 text-emerald-800">
                      Params: {JSON.stringify(voiceResult.parameters)}
                   </div>
               </div>
            )}
       </div>
    </div>
  );

  const renderChatbot = () => (
    <div className="space-y-6 animate-slide-in-right">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg flex flex-col h-[600px]">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><MessageCircle className="w-6 h-6" /></div>
                {t.tool_chatbot}
            </h3>
            
            <div className="flex-1 overflow-y-auto mb-6 space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {chatHistory.length === 0 && (
                    <div className="text-center py-10 text-slate-400 font-medium italic">
                        Start a conversation with your AI assistant.
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loadingChat && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask anything..."
                    className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none font-medium"
                />
                <button 
                    onClick={handleChat}
                    disabled={loadingChat || !chatInput}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-slide-in-right">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><Eye className="w-6 h-6" /></div>
                {t.tool_search}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <h4 className="font-black text-emerald-800 mb-2">Intent-Based Search</h4>
                        <p className="text-sm text-emerald-700 font-medium">Our AI doesn't just look for keywords. It understands what the customer is looking for, even with typos or vague descriptions.</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h4 className="font-black text-blue-800 mb-2">Bilingual Support</h4>
                        <p className="text-sm text-blue-700 font-medium">Search works seamlessly in both Danish and English, automatically detecting the language and intent.</p>
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h4 className="font-black mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Active on Storefront</h4>
                    <ul className="space-y-3 text-sm font-medium text-slate-300">
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full"></div> Synonyms Recognition</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full"></div> Visual Search Ready</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full"></div> Personalized Results</li>
                    </ul>
                </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center">
                <p className="text-slate-500 font-bold mb-4 italic">"Smart Search is automatically integrated into your NORVOSS storefront."</p>
                <button 
                    onClick={() => window.open('/store', '_blank')}
                    className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                    Test on Storefront
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
       {/* Tools Navigation */}
       <div className="w-full lg:w-64 space-y-2">
           {[
               { id: 'compliance', label: t.tool_compliance, icon: ShieldAlert, color: 'text-red-500' },
               { id: 'pricing', label: t.tool_pricing, icon: TrendingUp, color: 'text-blue-500' },
               { id: 'invoice', label: t.tool_invoice, icon: FileText, color: 'text-slate-500' },
               { id: 'social', label: t.tool_social, icon: MessageCircle, color: 'text-blue-400' },
               { id: 'translator', label: t.tool_translator, icon: Languages, color: 'text-purple-500' },
               { id: 'coupons', label: t.tool_coupons, icon: Tag, color: 'text-green-500' },
               { id: 'fraud', label: t.tool_fraud, icon: Lock, color: 'text-orange-500' },
               { id: 'forecast', label: t.tool_forecast, icon: TrendingUp, color: 'text-indigo-500' },
               { id: 'landing', label: t.tool_landing, icon: LayoutTemplate, color: 'text-pink-500' },
               { id: 'access', label: t.tool_access, icon: Accessibility, color: 'text-teal-500' },
               { id: 'voice', label: t.tool_voice, icon: Mic, color: 'text-rose-500' },
               { id: 'chatbot', label: t.tool_chatbot, icon: MessageCircle, color: 'text-indigo-500' },
               { id: 'search', label: t.tool_search, icon: Eye, color: 'text-emerald-500' },
           ].map((tool) => (
               <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTool === tool.id ? 'bg-white shadow-lg text-slate-900 ring-1 ring-slate-100' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
               >
                   <tool.icon className={`w-5 h-5 ${tool.color}`} />
                   {tool.label}
               </button>
           ))}
       </div>

       {/* Tool Content */}
       <div className="flex-1">
           {activeTool === 'compliance' && renderCompliance()}
           {activeTool === 'pricing' && renderPricing()}
           {activeTool === 'invoice' && renderInvoice()}
           {activeTool === 'social' && renderSocial()}
           {activeTool === 'translator' && renderTranslator()}
           {activeTool === 'coupons' && renderCoupons()}
           {activeTool === 'fraud' && renderFraud()}
           {activeTool === 'forecast' && renderForecast()}
           {activeTool === 'landing' && renderLanding()}
           {activeTool === 'access' && renderAccess()}
           {activeTool === 'voice' && renderVoice()}
           {activeTool === 'chatbot' && renderChatbot()}
           {activeTool === 'search' && renderSearch()}
       </div>
    </div>
  );
};

export default BusinessTools;