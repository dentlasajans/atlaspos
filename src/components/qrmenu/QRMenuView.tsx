import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { CategoryFilter } from '../pos/CategoryFilter';
import { formatCurrency } from '../../lib/utils';
import { Search, X, Instagram, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.76-5.18 2.84-6.61 1.15-.81 2.52-1.21 3.9-1.24.08 1.34.02 2.68.05 4.02-.92-.04-1.85.16-2.61.69-.97.66-1.57 1.8-1.5 2.98.05 1.05.62 2.06 1.48 2.61 1.04.66 2.39.73 3.49.27 1.56-.63 2.55-2.22 2.55-3.92V.02z"/>
  </svg>
);

const getOptimizedImage = (url: string, width: number, height: number, crop: string = 'fill') => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_${crop},q_auto,f_auto/`);
};

export const QRMenuView: React.FC = () => {
  const { categories, products, restaurantInfo } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
     if (!activeCategory && categories.length > 0) {
         setActiveCategory(categories[0].id);
     }
  }, [categories, activeCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = product.categoryId === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (searchQuery) return matchesSearch;
      return matchesCategory;
    });
  }, [activeCategory, searchQuery, products]);

  const logoSrc = restaurantInfo?.logo 
      ? getOptimizedImage(restaurantInfo.logo, 200, 200, "fit") 
      : getOptimizedImage("https://res.cloudinary.com/dejx0brol/image/upload/v1778572429/Blue_and_Black_Minimalist_Brand_Logo_20260120_225431_0000_s2isk5.png", 200, 200, "fit");

  return (
    <div className="flex bg-slate-950 font-sans text-slate-100 flex-col min-h-[100dvh] w-full relative">
      <header className="p-6 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex flex-col items-center mb-6">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            src={logoSrc} 
            alt={restaurantInfo?.name || "Logo"} 
            className="w-20 h-20 object-cover mb-4 rounded-[2rem] shadow-[0_0_30px_rgba(249,115,22,0.2)] bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10" 
            referrerPolicy="no-referrer"
          />
          <motion.h1 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-2xl font-bold tracking-widest bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent uppercase"
          >
              {restaurantInfo?.name || "Menü"}
          </motion.h1>
          {restaurantInfo?.description && (
             <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-sm mt-3 text-center max-w-sm"
             >
                {restaurantInfo.description}
             </motion.p>
          )}
        </div>
        
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Ne yemek istersiniz?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </header>

      <div className="sticky top-[152px] z-40 bg-slate-950 px-4 py-2 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
            <CategoryFilter 
                categories={categories} 
                activeCategoryId={activeCategory} 
                onSelect={setActiveCategory} 
            />
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        key={product.id} 
                        className={`bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-4 rounded-3xl flex gap-4 overflow-hidden shadow-lg backdrop-blur-sm relative ${
                           product.hasStock && (product.stockCount || 0) <= 0 ? 'opacity-60 grayscale' : ''
                        }`}
                    >
                        {product.hasStock && (
                            <div className={`absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 shadow-sm z-20 ${
                               (product.stockCount || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {(product.stockCount || 0) > 0 ? `Stok: ${product.stockCount}` : 'Tükendi'}
                            </div>
                        )}
                        {product.image ? (
                            <div className="shrink-0 cursor-pointer overflow-hidden rounded-2xl relative" onClick={() => setFullScreenImage(product.image)}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                                <img 
                                    src={getOptimizedImage(product.image, 200, 200, "fill")} 
                                    alt={product.name} 
                                    className="w-24 h-24 object-cover transition-transform duration-500 hover:scale-110" 
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shrink-0 flex items-center justify-center border border-white/5">
                                <span className="text-slate-500 text-xs">Resim Yok</span>
                            </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <h3 className="font-semibold text-slate-100 text-lg leading-tight mb-1 truncate">{product.name}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-3 flex-1">{product.description}</p>
                            <span className="text-orange-400 font-mono font-bold text-lg">{formatCurrency(product.price)}</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
        {filteredProducts.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center text-slate-500 py-12"
            >
                <p>Bu kategoride ürün bulunmuyor.</p>
            </motion.div>
        )}
      </main>
      
      <footer className="py-8 flex flex-col items-center border-t border-white/5 bg-slate-950 mt-auto relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
         <div className="flex gap-4 mb-8">
            {restaurantInfo?.instagram && (
                <a href={restaurantInfo.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-orange-500 hover:text-white transition-all text-slate-400 hover:scale-110 active:scale-95">
                    <Instagram className="w-5 h-5" />
                </a>
            )}
            {restaurantInfo?.twitter && (
                <a href={restaurantInfo.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-sky-500 hover:text-white transition-all text-slate-400 hover:scale-110 active:scale-95">
                    <Twitter className="w-5 h-5" />
                </a>
            )}
            {restaurantInfo?.facebook && (
                <a href={restaurantInfo.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white transition-all text-slate-400 hover:scale-110 active:scale-95">
                    <Facebook className="w-5 h-5" />
                </a>
            )}
            {restaurantInfo?.tiktok && (
                <a href={restaurantInfo.tiktok} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-pink-500 hover:text-white transition-all text-slate-400 hover:scale-110 active:scale-95">
                    <TiktokIcon className="w-5 h-5" />
                </a>
            )}
         </div>
         <span className="text-xs text-slate-500 mb-2 tracking-wider">Powered by</span>
         <img 
            src={getOptimizedImage("https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png", 300, 100, "fit")} 
            alt="Dentlas Ajans" 
            className="h-6 object-contain opacity-60" 
            referrerPolicy="no-referrer"
         />
      </footer>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
          {fullScreenImage && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4"
                onClick={() => setFullScreenImage(null)}
            >
                <button 
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[101]"
                    onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }}
                >
                    <X className="w-6 h-6" />
                </button>
                <motion.img 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    src={getOptimizedImage(fullScreenImage, 1200, 1200, "fit")} 
                    alt="Fullscreen product" 
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
                    onClick={(e) => e.stopPropagation()}
                    referrerPolicy="no-referrer"
                />
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
