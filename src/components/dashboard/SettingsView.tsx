import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Category, Product } from '../../types';

interface SettingsViewProps {
  onLogout: () => void;
  onViewChange: (view: string) => void;
}

type Tab = 'tables' | 'menu';

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, onViewChange }) => {
  const { 
      sections, tables, addSection, deleteSection, addTable, deleteTable,
      categories, products, addCategory, deleteCategory, addProduct, deleteProduct 
  } = useRestaurant();
  
  const [activeTab, setActiveTab] = useState<Tab>('tables');

  const [newSectionName, setNewSectionName] = useState('');
  const [newTableNames, setNewTableNames] = useState<{[sectionId: string]: string}>({});

  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [newProductState, setNewProductState] = useState<Partial<Product>>({ name: '', price: 0, description: '', image: '', categoryId: '' });

  const handleAddSection = () => {
    addSection(newSectionName);
    setNewSectionName('');
  };

  const handleAddTable = (sectionId: string) => {
    const name = newTableNames[sectionId];
    if(name) {
       addTable(name, sectionId);
       setNewTableNames(prev => ({ ...prev, [sectionId]: '' }));
    }
  };

  const handleAddCategory = () => {
      if (newCategoryName) {
          addCategory({ name: newCategoryName, icon: 'Utensils' });
          setNewCategoryName('');
      }
  }

  const handleAddProduct = () => {
      if (newProductState.name && newProductState.price && newProductState.categoryId) {
          addProduct({
              name: newProductState.name,
              price: Number(newProductState.price),
              description: newProductState.description || '',
              image: newProductState.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
              categoryId: newProductState.categoryId
          });
          setNewProductState({ name: '', price: 0, description: '', image: '', categoryId: '' });
      }
  }

  return (
    <div className="flex h-[100dvh] bg-transparent overflow-hidden font-sans text-slate-100 flex-col relative w-full">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-8 overflow-hidden">
          <header className="mb-6 lg:mb-10 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onViewChange('selection')} 
                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Sistem <span className="font-bold text-purple-400">Ayarları</span></h1>
                <p className="text-slate-400 mt-1">Sistem yapılandırmasını buradan yönetebilirsiniz.</p>
              </div>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setActiveTab('tables')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tables' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Masalar
                </button>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'menu' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Menü
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-8 touch-pan-y max-w-5xl">
            
            {activeTab === 'tables' && (
              <>
                <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl">
                  <h2 className="text-xl font-semibold mb-4 text-slate-200">Yeni Bölüm Ekle</h2>
                  <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newSectionName}
                        onChange={e => setNewSectionName(e.target.value)}
                        placeholder="Örn: Teras, Bahçe, Salon..."
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        onClick={handleAddSection}
                        disabled={!newSectionName.trim()}
                        className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 active:scale-95"
                      >
                        <Plus className="w-5 h-5"/> Ekle
                      </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-200">Mevcut Bölümler & Masalar</h2>
                  {sections.map(section => (
                      <div key={section.id} className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="text-lg font-bold text-orange-400">{section.name}</h3>
                            <button 
                              onClick={() => deleteSection(section.id)}
                              className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg transition-colors"
                              title="Bölümü Sil"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {tables.filter(t => t.sectionId === section.id).map(table => (
                              <div key={table.id} className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-200">{table.name}</span>
                                  <button onClick={() => deleteTable(table.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <input 
                              type="text" 
                              value={newTableNames[section.id] || ''}
                              onChange={e => setNewTableNames(prev => ({...prev, [section.id]: e.target.value}))}
                              placeholder="Masa Ekle (Örn: Masa 12)"
                              className="w-64 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                            />
                            <button 
                              onClick={() => handleAddTable(section.id)}
                              disabled={!newTableNames[section.id]?.trim()}
                              className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95"
                            >
                              Masa Ekle
                            </button>
                        </div>
                      </div>
                  ))}
                  {sections.length === 0 && (
                      <div className="text-slate-500 p-4 border border-white/5 rounded-2xl bg-white/5">
                        Bölüm bulunmuyor. Lütfen önce bir bölüm ekleyin.
                      </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'menu' && (
              <>
                 <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl">
                  <h2 className="text-xl font-semibold mb-4 text-slate-200">Kategori Oluştur</h2>
                  <div className="flex gap-3 text-slate-100">
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Örn: Salatalar, İçecekler..."
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                        className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 active:scale-95"
                      >
                        <Plus className="w-5 h-5"/> Ekle
                      </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 border-t border-white/10 pt-4">
                     {categories.map(cat => (
                         <div key={cat.id} className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                             <span className="text-sm font-medium text-slate-200">{cat.name}</span>
                             <button onClick={() => deleteCategory(cat.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                     ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl space-y-4">
                  <h2 className="text-xl font-semibold text-slate-200">Ürün Ekle</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input 
                         type="text" placeholder="Ürün Adı" 
                         value={newProductState.name} onChange={e => setNewProductState(p => ({...p, name: e.target.value}))}
                         className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <input 
                         type="number" placeholder="Fiyat" 
                         value={newProductState.price || ''} onChange={e => setNewProductState(p => ({...p, price: Number(e.target.value)}))}
                         className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <select 
                         value={newProductState.categoryId} onChange={e => setNewProductState(p => ({...p, categoryId: e.target.value}))}
                         className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                      >
                         <option value="">Kategori Seç...</option>
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button 
                        onClick={handleAddProduct}
                        disabled={!newProductState.name || !newProductState.price || !newProductState.categoryId}
                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95"
                      >
                         Ürün Ekle
                      </button>
                  </div>
                  <input
                    type="text" placeholder="Açıklama (Opsiyonel)"
                    value={newProductState.description} onChange={e => setNewProductState(p => ({...p, description: e.target.value}))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-200">Mevcut Ürünler</h2>
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden overflow-x-auto">
                     <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                           <tr>
                              <th className="p-4 font-medium">Ürün Adı</th>
                              <th className="p-4 font-medium">Kategori</th>
                              <th className="p-4 font-medium">Fiyat</th>
                              <th className="p-4 font-medium text-right">İşlem</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                           {products.map(product => {
                               const cat = categories.find(c => c.id === product.categoryId);
                               return (
                                   <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                       <td className="p-4 text-slate-200">{product.name}</td>
                                       <td className="p-4 text-slate-400">{cat?.name || '-'}</td>
                                       <td className="p-4 text-orange-400 font-mono font-medium">{(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                       <td className="p-4 text-right">
                                           <button onClick={() => deleteProduct(product.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg inline-flex" title="Ürünü Sil">
                                               <Trash2 className="w-4 h-4" />
                                           </button>
                                       </td>
                                   </tr>
                               );
                           })}
                        </tbody>
                     </table>
                     {products.length === 0 && (
                         <div className="p-6 text-center text-slate-500">Kayıtlı ürün bulunamadı.</div>
                     )}
                  </div>
                </div>

              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
