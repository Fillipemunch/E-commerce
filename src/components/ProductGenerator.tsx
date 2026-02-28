
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, Loader2, ScanLine, Wand2, Plus, Edit, Trash2, Image as ImageIcon, Eye, X, Globe, Save } from 'lucide-react';
import { ProductContent, Language, StoreProduct } from '@/types';
import { UI_TEXT } from '@/constants';
import { generateProductContent, extractProductDataFromImage } from '@/services/geminiService';

interface ProductGeneratorProps {
  lang: Language;
  products: StoreProduct[];
  onAdd: (product: StoreProduct) => void;
  onUpdate: (product: StoreProduct) => void;
  onDelete: (id: number) => void;
}

const ProductGenerator: React.FC<ProductGeneratorProps> = ({ lang, products, onAdd, onUpdate, onDelete }) => {
  const t = UI_TEXT[lang];
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameDa, setNameDa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descDa, setDescDa] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [active, setActive] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // AI State
  const [loadingAI, setLoadingAI] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [complianceNote, setComplianceNote] = useState('');

  // Client Preview Modal
  const [showClientPreview, setShowClientPreview] = useState(false);

  // Initialize Form for Editing
  useEffect(() => {
    if (editingId !== null) {
      const p = products.find(prod => prod.id === editingId);
      if (p) {
        setNameEn(p.name_en);
        setNameDa(p.name_da);
        setDescEn(p.description_en);
        setDescDa(p.description_da);
        setPrice(p.price);
        setSku(p.sku);
        setStock(p.stock);
        setActive(p.active);
        setTags(p.tags);
        setPreviewUrl(p.img);
      }
    } else {
      resetForm();
    }
  }, [editingId, products]);

  const resetForm = () => {
    setNameEn('');
    setNameDa('');
    setDescEn('');
    setDescDa('');
    setPrice('');
    setSku('');
    setStock(0);
    setActive(true);
    setTags([]);
    setImage(null);
    setPreviewUrl('');
    setComplianceNote('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
      setImage(null);
      setPreviewUrl('');
  };

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const data = await extractProductDataFromImage(image);
      if (data) {
        setSku(data.sku);
        // Heuristic: Set English name and assume price
        setNameEn(data.detected_name);
        if (data.detected_price_dkk) setPrice(data.detected_price_dkk);
      }
    } catch (e) {
      console.error(e);
      alert(t.error_msg);
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!nameEn || !price) {
        alert("Please provide at least a Name (EN) and Price to generate content.");
        return;
    }
    setLoadingAI(true);
    try {
      const data = await generateProductContent(nameEn, price, image || undefined);
      if (data) {
        setNameEn(data.english.title);
        setNameDa(data.danish.title);
        setDescEn(data.english.description);
        setDescDa(data.danish.description);
        setTags([...data.english.seo_keywords, ...data.danish.seo_keywords]);
        setComplianceNote(data.compliance_note);
      }
    } catch (e) {
      alert(t.error_msg);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = () => {
    if (!nameEn || !price) {
        alert("Name and Price are required.");
        return;
    }

    const newProduct: StoreProduct = {
      id: editingId !== null ? editingId : Date.now(),
      sku: sku || `SKU-${Date.now()}`,
      name_en: nameEn,
      name_da: nameDa || nameEn, // Fallback
      description_en: descEn,
      description_da: descDa,
      price: price,
      img: previewUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600', // Default placeholder
      stock: stock,
      active: active,
      tags: tags,
      reviews: []
    };

    if (editingId !== null) {
      onUpdate(newProduct);
    } else {
      onAdd(newProduct);
    }
    setView('list');
    setEditingId(null);
  };

  const renderList = () => (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-slide-in-right">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-black text-slate-900">{t.prod_tab_list}</h2>
        <button 
          onClick={() => { setEditingId(null); setView('form'); }}
          className="bg-electricBlue text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition shadow-lg hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" /> {t.prod_tab_create}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="p-16 text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
             <FileText className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Yet</h3>
           <p className="text-slate-500 max-w-md mx-auto mb-8">Start by creating your first product using our AI generator.</p>
           <button 
             onClick={() => { setEditingId(null); setView('form'); }}
             className="text-electricBlue font-bold hover:underline"
           >
             Create Product Now
           </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
              <tr>
                <th className="px-6 py-4">{t.prod_table_img}</th>
                <th className="px-6 py-4">{t.prod_table_name}</th>
                <th className="px-6 py-4">{t.prod_table_price}</th>
                <th className="px-6 py-4">{t.prod_table_stock}</th>
                <th className="px-6 py-4">{t.prod_table_status}</th>
                <th className="px-6 py-4 text-right">{t.prod_table_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <img src={p.img} alt={p.name_en} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{lang === 'da' ? p.name_da : p.name_en}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{p.price} DKK</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{p.stock}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                       {p.active ? 'Active' : 'Inactive'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => { setEditingId(p.id); setView('form'); }} className="p-2 text-slate-400 hover:text-electricBlue hover:bg-blue-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => onDelete(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="animate-slide-in-right">
      {/* Navigation Buttons */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setView('list')}
          className="px-6 py-3 rounded-full font-bold text-sm bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          {t.prod_tab_list}
        </button>
        <button 
          className="px-6 py-3 rounded-full font-bold text-sm bg-electricBlue text-white shadow-lg shadow-blue-500/30"
        >
          {editingId ? 'Edit Product' : t.prod_tab_create}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image & AI Tools */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
             <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-900"><ImageIcon className="w-5 h-5 text-electricBlue" /> Product Image</h3>
             
             {/* Image Upload / Preview */}
             {previewUrl ? (
               <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 group mb-4">
                 <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button onClick={handleRemoveImage} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                 </div>
               </div>
             ) : (
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-electricBlue transition-all duration-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-slate-400 mb-3" />
                        <p className="text-sm text-slate-500 font-bold">{t.label_upload}</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
             )}

             {/* AI Scanner */}
             <button
                onClick={handleScan}
                disabled={!previewUrl || scanning}
                className="w-full bg-white text-slate-700 hover:text-electricBlue border-2 border-slate-200 hover:border-electricBlue font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50"
             >
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                {t.label_scan}
             </button>
          </div>

          <div className="bg-gradient-to-br from-electricBlue to-deepBlue p-8 rounded-3xl shadow-lg text-white">
             <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Wand2 className="w-5 h-5" /> AI Content Generator</h3>
             <p className="text-blue-100 text-sm mb-6">Enter a basic English name and price, then let Gemini generate bilingual descriptions and SEO tags.</p>
             <button 
               onClick={handleGenerateContent}
               disabled={loadingAI}
               className="w-full bg-white text-electricBlue font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition flex justify-center items-center gap-2 disabled:opacity-50"
             >
               {loadingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
               Generate Bilingual Content
             </button>
          </div>
        </div>

        {/* Right Column: Fields */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-slate-900">Product Details</h3>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold uppercase text-slate-500">Status:</span>
                 <button 
                   onClick={() => setActive(!active)} 
                   className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-emeraldAction' : 'bg-slate-300'}`}
                 >
                   <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${active ? 'translate-x-6' : ''}`}></div>
                 </button>
                 <span className={`text-xs font-bold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{active ? 'Active' : 'Inactive'}</span>
              </div>
           </div>

           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">SKU</label>
                    <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" placeholder="AUTO-GEN" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Stock</label>
                    <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" />
                 </div>
              </div>

              <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Price (DKK)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg" placeholder="0.00" />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">Includes 25% Moms: {price ? (Number(price) * 0.2).toFixed(2) : '0.00'} DKK</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-slate-400">English Details (Primary)</label>
                    <span className="text-xs font-bold text-electricBlue">🇬🇧 EN</span>
                 </div>
                 <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold mb-2" placeholder="Product Name (EN)" />
                 <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24" placeholder="Description (EN)" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-slate-400">Danish Translation</label>
                    <span className="text-xs font-bold text-danishRed">🇩🇰 DA</span>
                 </div>
                 <input type="text" value={nameDa} onChange={(e) => setNameDa(e.target.value)} className="w-full p-3 bg-red-50/50 border border-red-100 rounded-xl font-bold mb-2 text-slate-800" placeholder="Produktnavn (DA)" />
                 <textarea value={descDa} onChange={(e) => setDescDa(e.target.value)} className="w-full p-3 bg-red-50/50 border border-red-100 rounded-xl text-sm h-24 text-slate-800" placeholder="Beskrivelse (DA)" />
              </div>

              {complianceNote && (
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-800 border border-blue-100">
                     <Check className="w-4 h-4 mt-0.5" /> 
                     <div><span className="font-bold">Compliance Note:</span> {complianceNote}</div>
                  </div>
              )}
           </div>

           <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setShowClientPreview(true)}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex justify-center items-center gap-2"
              >
                <Eye className="w-4 h-4" /> {t.btn_client_preview}
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 bg-emeraldAction text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/30 hover:-translate-y-1 flex justify-center items-center gap-2"
              >
                <Save className="w-4 h-4" /> {t.btn_save}
              </button>
           </div>
        </div>
      </div>

      {/* Client Preview Modal */}
      {showClientPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowClientPreview(false)}></div>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-fade-in-up">
                  <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                     <span className="text-sm font-bold uppercase tracking-wider">Client Preview Mode</span>
                     <button onClick={() => setShowClientPreview(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="flex flex-col md:flex-row h-[500px]">
                      <div className="w-full md:w-1/2 bg-slate-100">
                          <img src={previewUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                          <h2 className="text-3xl font-black text-slate-900 mb-2">{lang === 'da' ? (nameDa || nameEn) : nameEn}</h2>
                          <p className="text-2xl text-electricBlue font-bold mb-6">{price} DKK</p>
                          <p className="text-slate-600 mb-8 leading-relaxed">{lang === 'da' ? (descDa || descEn) : descEn}</p>
                          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Add to Cart</button>
                          <p className="text-center text-xs text-slate-400 mt-4">This is how your customer sees the product.</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[600px]">
      {view === 'list' ? renderList() : renderForm()}
    </div>
  );
};

export default ProductGenerator;
