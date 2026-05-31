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


export const QR10: React.FC = () => {
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

    <div className="bg-[#0B0D0F] min-h-[100dvh] font-serif text-[#D4AF37] pb-20">
      <header className="pt-16 pb-10 px-6 text-center flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
          <img src={logoSrc} className="w-24 h-24 rounded-full object-cover border-[3px] border-[#D4AF37]/50 mb-6 p-1 bg-[#0B0D0F]" />
          <h1 className="text-4xl tracking-[0.25em] uppercase font-light text-[#F3E5AB]">{restaurantInfo?.name || "Menu"}</h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-6 mb-4 mx-auto"></div>
          <p className="text-[#D4AF37]/60 text-xs tracking-[0.2em] uppercase max-w-md leading-relaxed">{restaurantInfo?.description}</p>
      </header>

      <div className="px-8 mb-12">
          <div className="flex justify-center gap-10 overflow-x-auto scrollbar-hide py-4 border-y border-[#D4AF37]/20 max-w-4xl mx-auto">
              {categories.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`py-2 uppercase tracking-[0.2em] text-xs transition-all whitespace-nowrap ${activeCategory === c.id ? 'text-[#F3E5AB] font-bold border-b-2 border-[#F3E5AB]' : 'text-[#D4AF37]/50 hover:text-[#D4AF37]'}`}>
                      {c.name}
                  </button>
              ))}
          </div>
      </div>

      <div className="px-6 flex flex-col gap-12 max-w-3xl mx-auto">
          {filteredProducts.map(p => (
              <div key={p.id} className="flex flex-col items-center text-center group">
                  {p.image && <img src={getOptimizedImage(p.image, 400, 300)} className="w-full max-w-[320px] h-48 object-cover mb-6 border border-[#D4AF37]/30 brightness-90 grayscale-[40%] group-hover:grayscale-0 group-hover:brightness-100 transition-all cursor-pointer" onClick={() => setFullScreenImage(p.image)} />}
                  <div className="w-full flex justify-between items-baseline gap-6 mb-3 px-4">
                      <h3 className="text-lg tracking-[0.15em] text-[#F3E5AB] uppercase flex-shrink-0 font-medium">{p.name}</h3>
                      <div className="flex-1 border-b-[1.5px] border-dotted border-[#D4AF37]/30"></div>
                      <span className="text-lg font-sans tracking-widest flex-shrink-0 text-[#F3E5AB] font-light">{formatCurrency(p.price)}</span>
                  </div>
                  <p className="text-sm text-[#D4AF37]/60 italic w-full max-w-lg leading-relaxed">{p.description}</p>
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
