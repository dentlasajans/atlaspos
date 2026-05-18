import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Category, Product } from '../../types';

interface SettingsViewProps {
  onLogout: () => void;
  onViewChange: (view: string) => void;
}

type Tab = 'tables' | 'menu' | 'users' | 'company';

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, onViewChange }) => {
  const { 
      sections, tables, addSection, deleteSection, addTable, deleteTable,
      categories, products, addCategory, deleteCategory, addProduct, deleteProduct, updateProduct,
      appUsers, addAppUser, deleteAppUser, updateAppUser,
      restaurantInfo, updateRestaurantInfo
  } = useRestaurant();
  
  const [activeTab, setActiveTab] = useState<Tab>('tables');

  const [newSectionName, setNewSectionName] = useState('');
  const [newTableNames, setNewTableNames] = useState<{[sectionId: string]: string}>({});

  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [newProductState, setNewProductState] = useState<Partial<Product>>({ name: '', price: 0, description: '', image: '', categoryId: '', hasStock: false, stockCount: 0 });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [infoState, setInfoState] = useState({
      name: restaurantInfo?.name || '',
      description: restaurantInfo?.description || '',
      logo: restaurantInfo?.logo || '',
      coverImage: restaurantInfo?.coverImage || '',
      instagram: restaurantInfo?.instagram || '',
      twitter: restaurantInfo?.twitter || '',
      facebook: restaurantInfo?.facebook || '',
      tiktok: restaurantInfo?.tiktok || '',
      wifiSsid: restaurantInfo?.wifiSsid || '',
      wifiPassword: restaurantInfo?.wifiPassword || ''
  });

  const [isUploading, setIsUploading] = useState(false);

  const generateSignature = async (timestamp: number, apiSecret: string, publicId?: string) => {
    const paramsToSign = publicId 
      ? `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
      : `timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const uploadImageToCloudinary = async (file: File) => {
    // We have the keys, but need the cloud name
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || localStorage.getItem('cloudinary_cloud_name') || "dejx0brol";
    
    if (!cloudName) {
      alert("Cloud Name eksik! Yükleme yapılamıyor.");
      return null;
    }
    
    // Save to localStorage so we don't ask again
    localStorage.setItem('cloudinary_cloud_name', cloudName);

    const apiKey = "943986857686586";
    const apiSecret = "LzarS09zBKRvsGhph9s4pQbwzEI";
    
    setIsUploading(true);
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = await generateSignature(timestamp, apiSecret);

    const data = new FormData();
    data.append("file", file);
    data.append("api_key", apiKey);
    data.append("timestamp", timestamp.toString());
    data.append("signature", signature);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: data,
        });
        const result = await res.json();
        if (result.error) {
             alert("Cloudinary Hatası: " + result.error.message);
             setIsUploading(false);
             return null;
        }
        setIsUploading(false);
        return result.secure_url as string;
    } catch (e) {
        console.error("Resim yüklenirken hata oluştu", e);
        alert("Resim yüklenemedi.");
        setIsUploading(false);
        return null;
    }
  };

  const deleteCloudinaryImage = async (url: string) => {
    if (!url || !url.includes("res.cloudinary.com")) return;
    
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return;
    const afterUpload = url.substring(uploadIndex + 8);
    const versionSlashIndex = afterUpload.indexOf("/");
    if (versionSlashIndex === -1) return;
    const publicIdWithExt = afterUpload.substring(versionSlashIndex + 1);
    const lastDot = publicIdWithExt.lastIndexOf(".");
    const publicIdFinal = lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || localStorage.getItem('cloudinary_cloud_name') || "dejx0brol";
    if (!cloudName) return;

    const apiKey = "943986857686586";
    const apiSecret = "LzarS09zBKRvsGhph9s4pQbwzEI";
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = await generateSignature(timestamp, apiSecret, publicIdFinal);

    const data = new FormData();
    data.append("public_id", publicIdFinal);
    data.append("api_key", apiKey);
    data.append("timestamp", timestamp.toString());
    data.append("signature", signature);

    try {
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            body: data,
        });
    } catch(e) {
        console.error("Cloudinary silme hatası", e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean, type: 'product' | 'logo' | 'cover' = 'product') => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = await uploadImageToCloudinary(file);
      if (url) {
          if (type === 'logo') {
               if (infoState.logo) {
                   deleteCloudinaryImage(infoState.logo);
               }
               setInfoState(prev => ({ ...prev, logo: url }));
          } else if (type === 'cover') {
               if (infoState.coverImage) {
                   deleteCloudinaryImage(infoState.coverImage);
               }
               setInfoState(prev => ({ ...prev, coverImage: url }));
          } else if (isEdit && editingProduct) {
              // Delete immediately if there is a preview image that doesn't match the original
              const originalProduct = products.find(p => p.id === editingProduct.id);
              if (originalProduct && editingProduct.image && editingProduct.image !== originalProduct.image) {
                  deleteCloudinaryImage(editingProduct.image);
              } else if (!originalProduct && editingProduct.image) {
                  deleteCloudinaryImage(editingProduct.image);
              }
              setEditingProduct({ ...editingProduct, image: url });
          } else {
              if (newProductState.image) {
                  deleteCloudinaryImage(newProductState.image);
              }
              setNewProductState(prev => ({ ...prev, image: url }));
          }
      }
  };

  const clearNewProductImage = () => {
    if (newProductState.image) {
      deleteCloudinaryImage(newProductState.image);
    }
    setNewProductState(p => ({...p, image: ''}));
  };

  const clearLogoImage = () => {
    if (infoState.logo) {
        deleteCloudinaryImage(infoState.logo);
    }
    setInfoState(p => ({...p, logo: ''}));
  };

  const clearCoverImage = () => {
    if (infoState.coverImage) {
        deleteCloudinaryImage(infoState.coverImage);
    }
    setInfoState(p => ({...p, coverImage: ''}));
  };

  const handleCancelEdit = () => {
      if (editingProduct) {
          const original = products.find(p => p.id === editingProduct.id);
          if (original && original.image !== editingProduct.image && editingProduct.image) {
              deleteCloudinaryImage(editingProduct.image);
          } else if (!original && editingProduct.image) {
              deleteCloudinaryImage(editingProduct.image);
          }
      }
      setEditingProduct(null);
  };

  const handleAddSection = async () => {
    try {
      await addSection(newSectionName);
      setNewSectionName('');
    } catch (e: any) {
      console.error(e);
      alert('Hata oluştur: ' + (e?.message || 'Bilinmeyen Hata. Lütfen Firebase Console\'dan Anonymous Auth\'un etkinleştirildiğinden emin olun.'));
    }
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
              categoryId: newProductState.categoryId,
              hasStock: newProductState.hasStock || false,
              stockCount: Number(newProductState.stockCount) || 0
          });
          setNewProductState({ name: '', price: 0, description: '', image: '', categoryId: '', hasStock: false, stockCount: 0 });
      }
  };

  const handleUpdateProduct = () => {
      if (editingProduct && editingProduct.name && editingProduct.price && editingProduct.categoryId) {
          const original = products.find(p => p.id === editingProduct.id);
          if (original && original.image && original.image !== editingProduct.image) {
              deleteCloudinaryImage(original.image);
          }

          updateProduct(editingProduct.id, {
              ...editingProduct,
              price: Number(editingProduct.price),
              stockCount: Number(editingProduct.stockCount) || 0
          });
          setEditingProduct(null);
      }
  };

  const handleDeleteProduct = (id: string) => {
      const product = products.find(p => p.id === id);
      if (product && product.image) {
          deleteCloudinaryImage(product.image);
      }
      deleteProduct(id);
  };

  const handleAddUser = () => {
      if (newUser.username && newUser.password) {
          addAppUser({ username: newUser.username, password: newUser.password });
          setNewUser({ username: '', password: '' });
      }
  };

  const handleUpdateInfo = () => {
      updateRestaurantInfo(infoState);
      alert('İşletme bilgileri güncellendi!');
  };

  return (
    <div className="flex h-[100dvh] bg-transparent overflow-hidden font-sans text-slate-100 flex-col relative w-full">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-8 overflow-hidden">
          <header className="mb-6 lg:mb-10 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => {
                  if (newProductState.image) deleteCloudinaryImage(newProductState.image);
                  onViewChange('selection');
                }} 
                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Sistem <span className="font-bold text-purple-400">Ayarları</span></h1>
                <p className="text-slate-400 mt-1">Sistem yapılandırmasını buradan yönetebilirsiniz.</p>
              </div>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
                <button 
                  onClick={() => setActiveTab('tables')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tables' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Masalar
                </button>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'menu' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Menü
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Kullanıcılar
                </button>
                <button 
                  onClick={() => setActiveTab('company')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'company' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    İşletmem
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-8 max-w-5xl">
            
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                      <div className="relative">
                          {newProductState.image ? (
                              <div className="h-full bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between px-3 overflow-hidden">
                                  <img src={newProductState.image} alt="Uploaded" className="h-8 w-8 object-cover rounded-md" />
                                  <button onClick={clearNewProductImage} className="text-red-400 text-xs hover:underline">Kaldır</button>
                              </div>
                          ) : (
                              <label className="h-full bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center px-4 cursor-pointer hover:bg-slate-800 transition-colors">
                                  <span className="text-sm text-slate-400">{isUploading ? 'Yükleniyor...' : 'Resim Yükle'}</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={isUploading} />
                              </label>
                          )}
                      </div>
                      <button 
                        onClick={handleAddProduct}
                        disabled={!newProductState.name || !newProductState.price || !newProductState.categoryId || isUploading}
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
                  <div className="flex items-center gap-4 bg-slate-900 border border-white/10 rounded-xl px-4 py-2">
                     <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newProductState.hasStock} 
                          onChange={e => setNewProductState(p => ({...p, hasStock: e.target.checked}))}
                          className="w-4 h-4 rounded border-white/10 text-purple-500 focus:ring-purple-500/50 bg-white/5"
                        />
                        Stok Takibi Yapılsın
                     </label>
                     {newProductState.hasStock && (
                        <input 
                           type="number" 
                           placeholder="Stok Adedi" 
                           value={newProductState.stockCount ?? ''} 
                           onChange={e => setNewProductState(p => ({...p, stockCount: Number(e.target.value)}))}
                           className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500 w-32"
                        />
                     )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-200">Mevcut Ürünler</h2>
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden overflow-x-auto">
                     <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                           <tr>
                              <th className="p-4 font-medium w-16">Resim</th>
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
                                       <td className="p-4">
                                           <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-slate-900" />
                                       </td>
                                       <td className="p-4 text-slate-200">{product.name}</td>
                                       <td className="p-4 text-slate-400">{cat?.name || '-'}</td>
                                       <td className="p-4 text-orange-400 font-mono font-medium">{(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                       <td className="p-4 text-right flex justify-end gap-2">
                                           <button onClick={() => setEditingProduct(product)} className="text-blue-400 hover:text-blue-300 p-2 bg-blue-400/10 rounded-lg inline-flex" title="Ürünü Düzenle">
                                               Düzenle
                                           </button>
                                           <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg inline-flex" title="Ürünü Sil">
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

                {/* Edit Product Modal */}
                {editingProduct && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCancelEdit} />
                      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 z-[101]">
                          <h2 className="text-xl font-bold mb-4">Ürünü Düzenle</h2>
                          <div className="space-y-4">
                              <div>
                                 <label className="block text-sm text-slate-400 mb-1">Ürün Adı</label>
                                 <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                              </div>
                              <div>
                                 <label className="block text-sm text-slate-400 mb-1">Fiyat</label>
                                 <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                              </div>
                              <div>
                                 <label className="block text-sm text-slate-400 mb-1">Kategori</label>
                                 <select value={editingProduct.categoryId} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500">
                                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-sm text-slate-400 mb-1">Resim</label>
                                 <div className="flex items-center gap-4">
                                     <img src={editingProduct.image} alt={editingProduct.name} className="w-16 h-16 object-cover rounded-xl" />
                                     <label className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors">
                                         <span className="text-sm">{isUploading ? 'Yükleniyor...' : 'Yeni Resim Seç'}</span>
                                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={isUploading} />
                                     </label>
                                 </div>
                              </div>
                              <div>
                                 <label className="block text-sm text-slate-400 mb-1">Açıklama</label>
                                 <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" rows={3}></textarea>
                              </div>
                              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                 <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={editingProduct.hasStock || false} 
                                      onChange={e => setEditingProduct({...editingProduct, hasStock: e.target.checked})}
                                      className="w-4 h-4 rounded border-white/10 text-purple-500 focus:ring-purple-500/50 bg-slate-900"
                                    />
                                    Stok Takibi Yapılsın
                                 </label>
                                 {editingProduct.hasStock && (
                                    <input 
                                       type="number" 
                                       placeholder="Stok Adedi" 
                                       value={editingProduct.stockCount ?? ''} 
                                       onChange={e => setEditingProduct({...editingProduct, stockCount: Number(e.target.value)})}
                                       className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500 w-32"
                                    />
                                 )}
                              </div>
                              <div className="flex justify-end gap-3 mt-6">
                                  <button onClick={handleCancelEdit} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">İptal</button>
                                  <button onClick={handleUpdateProduct} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-6 py-2 rounded-xl font-semibold transition-colors">Kaydet</button>
                              </div>
                          </div>
                      </div>
                   </div>
                )}

              </>
            )}

            {activeTab === 'users' && (
               <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl">
                     <h2 className="text-xl font-semibold mb-4 text-slate-200">Kullanıcı Ekle</h2>
                     <div className="flex gap-3">
                        <input type="text" placeholder="Kullanıcı Adı" value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                        <input type="text" placeholder="Şifre" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                        <button onClick={handleAddUser} disabled={!newUser.username || !newUser.password} className="bg-emerald-500 text-slate-950 px-6 py-2 rounded-xl font-semibold disabled:opacity-50 active:scale-95">Ekle</button>
                     </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl">
                     <h2 className="text-xl font-semibold mb-4 text-slate-200">Mevcut Kullanıcılar</h2>
                     <div className="space-y-2">
                        {appUsers.map(user => (
                           <div key={user.id} className="flex justify-between items-center bg-slate-900 border border-white/10 p-4 rounded-xl">
                              <div>
                                 <div className="font-semibold">{user.username}</div>
                                 <div className="text-sm text-slate-400">Şifre: {user.password}</div>
                              </div>
                              <button onClick={() => deleteAppUser(user.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg"><Trash2 className="w-5 h-5"/></button>
                           </div>
                        ))}
                        {appUsers.length === 0 && <div className="text-slate-500">Hiç kullanıcı yok.</div>}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'company' && (
               <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl space-y-6">
                  <h2 className="text-xl font-semibold text-slate-200">İşletme Bilgileri</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm text-slate-400 mb-1">İşletme Adı</label>
                        <input type="text" value={infoState.name} onChange={e => setInfoState(p => ({...p, name: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                     </div>
                     <div>
                        <label className="block text-sm text-slate-400 mb-1">QR Menü Arkaplan Resmi</label>
                        <div className="flex items-center gap-4">
                           {infoState.coverImage ? (
                               <div className="relative">
                                   <img src={infoState.coverImage} alt="Cover" className="w-12 h-12 rounded bg-slate-800 object-cover" />
                                   <button onClick={clearCoverImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                               </div>
                           ) : (
                               <div className="w-12 h-12 rounded bg-slate-800 border border-dashed border-white/20 flex flex-col items-center justify-center text-xs text-slate-500">...</div>
                           )}
                           <label className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors">
                               <span className="text-sm">{isUploading ? 'Yükleniyor...' : 'Arkaplan Yükle'}</span>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false, 'cover')} disabled={isUploading} />
                           </label>
                        </div>
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1">İşletme Logosu</label>
                        <div className="flex items-center gap-4">
                           {infoState.logo ? (
                               <div className="relative">
                                   <img src={infoState.logo} alt="Logo" className="w-12 h-12 rounded bg-slate-800 object-cover" />
                                   <button onClick={clearLogoImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                               </div>
                           ) : (
                               <div className="w-12 h-12 rounded bg-slate-800 border border-dashed border-white/20 flex flex-col items-center justify-center text-xs text-slate-500">...</div>
                           )}
                           <label className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors">
                               <span className="text-sm">{isUploading ? 'Yükleniyor...' : 'Logo Yükle'}</span>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false, 'logo')} disabled={isUploading} />
                           </label>
                        </div>
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1">Açıklama (QR Menüde Görünür)</label>
                        <textarea value={infoState.description} onChange={e => setInfoState(p => ({...p, description: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" rows={3}></textarea>
                     </div>
                     <div>
                        <label className="block text-sm text-slate-400 mb-1">Instagram Linki (Örn: https://instagram.com/atlaspos)</label>
                        <input type="text" value={infoState.instagram} onChange={e => setInfoState(p => ({...p, instagram: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                     </div>
                     <div>
                        <label className="block text-sm text-slate-400 mb-1">Twitter Linki (Örn: https://twitter.com/atlaspos)</label>
                        <input type="text" value={infoState.twitter} onChange={e => setInfoState(p => ({...p, twitter: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                     </div>
                     <div>
                        <label className="block text-sm text-slate-400 mb-1">Facebook Linki (Örn: https://facebook.com/atlaspos)</label>
                        <input type="text" value={infoState.facebook} onChange={e => setInfoState(p => ({...p, facebook: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                     </div>
                     <div>
                        <label className="block text-sm text-slate-400 mb-1">TikTok Linki (Örn: https://tiktok.com/@atlaspos)</label>
                        <input type="text" value={infoState.tiktok} onChange={e => setInfoState(p => ({...p, tiktok: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                     </div>
                     <div className="md:col-span-2 pt-4 border-t border-white/5">
                        <h4 className="text-lg font-medium text-slate-200 mb-4">Müşteri Wi-Fi Ayarları</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm text-slate-400 mb-1">Wi-Fi Adı (SSID)</label>
                              <input type="text" value={infoState.wifiSsid || ''} onChange={e => setInfoState(p => ({...p, wifiSsid: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Misafir Ağı" />
                           </div>
                           <div>
                              <label className="block text-sm text-slate-400 mb-1">Wi-Fi Şifresi</label>
                              <input type="text" value={infoState.wifiPassword || ''} onChange={e => setInfoState(p => ({...p, wifiPassword: e.target.value}))} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Şifre (Opsiyonel)" />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                     <button onClick={handleUpdateInfo} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                        Kaydet
                     </button>
                  </div>
               </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
