
import React, { useState } from 'react';
import { TrendingUp, Package, Percent, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { Language, PromotionAnalysis, StoreProduct } from '../types';
import { UI_TEXT } from '../constants';
import { analyzePromotions } from '../services/geminiService';

interface PromotionAnalystProps {
  lang: Language;
  products: StoreProduct[];
}

const PromotionAnalyst: React.FC<PromotionAnalystProps> = ({ lang, products }) => {
  const [analysis, setAnalysis] = useState<PromotionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const t = UI_TEXT[lang];

  // Helper to get name based on lang
  const getName = (p: StoreProduct) => lang === 'da' ? p.name_da : p.name_en;

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      // Create a simplified inventory representation for the AI
      const inventoryData = products.map(p => ({
          productId: p.id,
          name: p.name_en, // Use English for reasoning consistency for now
          category: p.tags[0] || 'General',
          stockLevel: p.stock,
          salesLast30Days: Math.floor(Math.random() * 20) // Simulated sales data for analysis
      }));

      const inventoryStr = JSON.stringify(inventoryData, null, 2);
      const result = await analyzePromotions(inventoryStr);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert(t.error_msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Data Overview */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                <Package className="w-5 h-5 text-slate-900" />
            </div>
            Inventory & Sales Data
          </h2>
          <button
            onClick={handleAnalysis}
            disabled={loading || products.length === 0}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-70 hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t.loading}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-neonYellow fill-current" />
                {t.btn_analyze}
              </>
            )}
          </button>
        </div>
        
        {products.length === 0 ? (
             <div className="p-12 text-center">
                 <p className="text-slate-400 font-bold">No products to analyze.</p>
                 <p className="text-sm text-slate-300">Add inventory in Product AI tab.</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                <tr>
                    <th className="px-8 py-4">Product</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4">Stock</th>
                    <th className="px-8 py-4">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-800">{getName(item)}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{item.tags[0] || 'General'}</td>
                    <td className="px-8 py-5 text-slate-500 font-mono">{item.stock}</td>
                    <td className="px-8 py-5">
                        {item.stock > 50 ? (
                        <span className="bg-orange-100 text-orange-700 text-[10px] uppercase font-bold px-3 py-1 rounded-full">High Stock</span>
                        ) : item.stock < 5 ? (
                        <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-3 py-1 rounded-full">Low Stock</span>
                        ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-3 py-1 rounded-full">Healthy</span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl shadow-xl border border-red-100 p-8 md:p-10 animate-fade-in-up relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-danishRed/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          
          <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-xs font-black text-danishRed uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-danishRed rounded-full animate-pulse"></span>
                    AI Strategy
                </h3>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                  {lang === 'da' ? analysis.marketing_title_da : analysis.marketing_title_en}
                </h2>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-2xl">{analysis.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-danishRed/30 transition-colors">
                   <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">🇩🇰 Dansk Title</p>
                   <p className="font-bold text-slate-800 text-lg">{analysis.marketing_title_da}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-electricBlue/30 transition-colors">
                   <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">🇬🇧 English Title</p>
                   <p className="font-bold text-slate-800 text-lg">{analysis.marketing_title_en}</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-96 bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-danishRed to-orange-500"></div>
              <div className="w-16 h-16 bg-red-50 text-danishRed rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
                <Percent className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Generated Promo Code</p>
              <div className="bg-slate-900 text-white text-2xl font-mono font-black py-4 px-6 rounded-xl mb-6 tracking-widest border-2 border-slate-900 border-dashed relative group-hover:border-danishRed transition-colors">
                {analysis.promotion_code}
                <div className="absolute -top-3 -right-3 bg-neonYellow text-black text-xs font-bold px-2 py-1 rounded shadow-sm transform rotate-12">
                    {analysis.discount_rate}
                </div>
              </div>
              
              <button className="w-full bg-danishRed hover:bg-danishRedDark text-white py-4 rounded-xl text-sm font-bold transition shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                Launch Campaign <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionAnalyst;
