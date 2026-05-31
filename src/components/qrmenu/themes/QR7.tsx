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


export const QR7: React.FC = () => {
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

    <div className="bg-white min-h-[100dvh] font-mono text-black pb-20 selection:bg-black selection:text-white">
      <header className="border-b-4 border-black p-8 bg-[#EBEBEB]">
          <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto text-center">
               <img src={logoSrc} className="w-24 h-24 object-cover border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
               <div>
                   <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{restaurantInfo?.name || "Menü"}</h1>
                   <p className="text-sm uppercase mt-4 font-bold bg-black text-white px-3 py-1 inline-block">{restaurantInfo?.description}</p>
               </div>
          </div>
      </header>

      <div className="border-b-4 border-black bg-white sticky top-0 z-40">
          <div className="flex overflow-x-auto scrollbar-hide max-w-4xl mx-auto">
              {categories.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-8 py-5 uppercase font-black whitespace-nowrap border-r-4 border-black transition-all text-sm tracking-wider ${activeCategory === c.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#EBEBEB]'}`}>
                      {c.name}
                  </button>
              ))}
          </div>
      </div>

      <div className="p-6 grid grid-cols-1 gap-8 max-w-4xl mx-auto mt-6">
          {filteredProducts.map(p => (
              <div key={p.id} className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row hover:-translate-y-1 hover:translate-x-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex-1 p-6 flex flex-col justify-between order-2 sm:order-1">
                      <div>
                          <h3 className="text-2xl font-black uppercase leading-none mb-3">{p.name}</h3>
                          <p className="text-sm font-bold mt-2 max-w-sm tracking-tight">{p.description}</p>
                      </div>
                      <span className="text-xl font-black uppercase mt-6 bg-[#EBEBEB] w-fit px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{formatCurrency(p.price)}</span>
                  </div>
                  {p.image && <img src={getOptimizedImage(p.image, 300, 300)} className="w-full sm:w-48 h-48 sm:h-auto object-cover border-b-4 sm:border-b-0 sm:border-l-4 border-black order-1 sm:order-2 cursor-pointer grayscale hover:grayscale-0 transition-all" onClick={() => setFullScreenImage(p.image)} />}
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
