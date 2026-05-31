import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { formatCurrency } from '../../../lib/utils';
import { Search, X, Instagram, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.76-5.18 2.84-6.61 1.15-.81 2.52-1.21 3.9-1.24.08 1.34.02 2.68.05 4.02-.92-.04-1.85.16-2.61.69-.97.66-1.57 1.8-1.5 2.98.05 1.05.62 2.06 1.48 2.61 1.04.66 2.39.73 3.49.27 1.56-.63 2.55-2.22 2.55-3.92V.02z"/></svg>
);

const getOptimizedImage = (url: string, width: number, height: number, crop: string = 'fill') => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_${crop},q_auto,f_auto/`);
};


export const QR4: React.FC = () => {
  const { categories, products, restaurantInfo, firmData } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
     if (!activeCategory && categories.length > 0) setActiveCategory(categories[0].id);
  }, [categories, activeCategory]);

  useEffect(() => {
     const name = restaurantInfo?.name || firmData?.name;
     if (name) document.title = `${name} QR Menü - AtlasPOS`;
     if (restaurantInfo?.logo) {
         let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
         if (!link) {
             link = document.createElement('link');
             link.rel = 'icon';
             document.head.appendChild(link);
         }
         link.href = restaurantInfo.logo;
     }
  }, [restaurantInfo, firmData]);

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

  const coverSrc = restaurantInfo?.coverImage
      ? getOptimizedImage(restaurantInfo.coverImage, 800, 400, "fill")
      : null;

  return (

    <div className="bg-[#050510] min-h-[100dvh] font-mono text-fuchsia-100 pb-20">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-[#050510] to-[#050510] z-0"></div>
      <div className="relative z-10">
          <header className="p-8 text-center border-b border-fuchsia-500/20 shadow-[0_4px_30px_rgba(217,70,239,0.1)] mb-6 bg-black/40 backdrop-blur-sm">
              <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)] uppercase">{restaurantInfo?.name || "Menü"}</h1>
              <p className="text-fuchsia-300/80 text-xs mt-3 tracking-widest uppercase">{restaurantInfo?.description}</p>
          </header>
          <div className="px-4 mb-8 overflow-x-auto scrollbar-hide py-3">
               <div className="flex gap-4 max-w-4xl mx-auto">
                  {categories.map(c => (
                      <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-5 py-2 border whitespace-nowrap text-xs tracking-widest transition-all shadow-[0_0_10px_rgba(0,0,0,0)] uppercase ${activeCategory === c.id ? 'border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] bg-cyan-950/30' : 'border-fuchsia-900/50 text-fuchsia-500 hover:border-fuchsia-500 bg-black/50'}`}>
                          {c.name}
                      </button>
                  ))}
               </div>
          </div>
          <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
               {filteredProducts.map(p => (
                   <div key={p.id} className="relative bg-[#0A0A1A]/80 backdrop-blur-sm border border-fuchsia-500/20 p-5 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] transition-all group">
                       <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-fuchsia-400"></div>
                       <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-fuchsia-400"></div>
                       <div className="flex gap-4">
                           {p.image ? <img src={getOptimizedImage(p.image, 150, 150)} className="w-24 h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer border border-fuchsia-900/50" onClick={() => setFullScreenImage(p.image)} /> : <div className="w-24 h-24 border border-fuchsia-900/30 flex items-center justify-center text-fuchsia-900 text-xs text-center">NO_IMG</div>}
                           <div className="flex-1 flex flex-col justify-center">
                               <div className="flex justify-between items-start mb-2">
                                   <h3 className="text-sm font-bold text-fuchsia-50 tracking-widest uppercase">{p.name}</h3>
                               </div>
                               <span className="text-cyan-400 text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] font-bold mb-2">{formatCurrency(p.price)}</span>
                               <p className="text-fuchsia-400/50 text-[10px] line-clamp-2 uppercase tracking-wide leading-relaxed">{p.description}</p>
                           </div>
                       </div>
                   </div>
               ))}
          </div>
      </div>
  
      <AnimatePresence>
          {fullScreenImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setFullScreenImage(null)}>
                <button className="absolute top-6 right-6 p-2 text-white" onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }}><X className="w-8 h-8" /></button>
                <img src={getOptimizedImage(fullScreenImage, 1200, 1200, "fit")} className="max-w-full max-h-[85vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
