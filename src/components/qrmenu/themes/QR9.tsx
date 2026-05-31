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


export const QR9: React.FC = () => {
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

    <div className="bg-[#1A0F0D] min-h-[100dvh] font-sans text-white pb-20">
      <header className="relative">
         {coverSrc ? <img src={coverSrc} className="w-full h-64 object-cover opacity-50 mix-blend-luminosity" /> : <div className="w-full h-64 bg-red-950/40"></div>}
         <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0D] via-[#1A0F0D]/50 to-transparent"></div>
         <div className="absolute bottom-4 left-0 w-full p-6 text-center">
             <img src={logoSrc} className="w-16 h-16 mx-auto rounded-full object-cover mb-4 border-2 border-[#E63946] shadow-[0_0_15px_rgba(230,57,70,0.5)]" />
             <h1 className="text-5xl font-black uppercase italic tracking-tighter text-[#E63946] drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">{restaurantInfo?.name || "Menü"}</h1>
             <p className="text-white/80 text-sm mt-2 font-medium tracking-wide">{restaurantInfo?.description}</p>
         </div>
      </header>

      <div className="px-4 mb-8 mt-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 max-w-2xl mx-auto">
              {categories.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-6 py-3 font-black uppercase text-sm skew-x-[-15deg] whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-[#E63946] text-white shadow-[4px_4px_0_#F4A261] translate-x-[-2px] translate-y-[-2px]' : 'bg-[#e63946]/10 text-[#E63946] border-2 border-[#e63946]/30 hover:bg-[#e63946]/20'}`}>
                      <div className="skew-x-[15deg] tracking-wider">{c.name}</div>
                  </button>
              ))}
          </div>
      </div>

      <div className="px-4 flex flex-col gap-5 max-w-2xl mx-auto">
          {filteredProducts.map(p => (
              <div key={p.id} className="bg-[#261614] border-l-[6px] border-[#E63946] p-5 flex gap-4 shadow-lg hover:bg-[#2F1B19] transition-colors group">
                  <div className="flex-1 flex flex-col justify-between">
                      <div>
                          <h3 className="text-xl font-black uppercase text-white tracking-widest">{p.name}</h3>
                          <p className="text-sm text-white/60 mt-2 line-clamp-2">{p.description}</p>
                      </div>
                      <span className="text-2xl font-black text-[#F4A261] mt-4 self-start bg-[#1A0F0D] px-3 py-1">{formatCurrency(p.price)}</span>
                  </div>
                  {p.image && <img src={getOptimizedImage(p.image, 200, 200)} className="w-28 h-28 object-cover border-2 border-[#E63946]/30 group-hover:border-[#F4A261] transition-colors cursor-pointer" onClick={() => setFullScreenImage(p.image)} />}
              </div>
          ))}
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
