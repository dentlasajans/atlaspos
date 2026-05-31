import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { CategoryFilter } from '../../pos/CategoryFilter';
import { formatCurrency } from '../../../lib/utils';
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

const getThemeClasses = (themeId?: string) => {
    switch (themeId) {
        case 'minimal-light':
            return {
                bg: 'bg-white text-slate-900',
                header: 'bg-white/80 border-slate-200',
                card: 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 border',
                title: 'text-slate-900 font-bold',
                desc: 'text-slate-600',
                price: 'text-emerald-600 font-bold',
                input: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-emerald-500/50',
                icon: 'text-slate-400',
                categoryActive: 'bg-slate-900 text-white shadow-lg',
                categoryInactive: 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600',
                footer: 'bg-slate-50 border-slate-200',
                pageTitle: 'text-slate-900 bg-none drop-shadow-none',
            };
        case 'warm-woods':
            return {
                bg: 'bg-amber-50 text-amber-950',
                header: 'bg-amber-50/80 border-amber-200',
                card: 'bg-white border border-amber-100 shadow-md rounded-2xl hover:bg-orange-50/50',
                title: 'text-amber-900 font-bold',
                desc: 'text-amber-700',
                price: 'text-orange-600 font-bold',
                input: 'bg-white border border-amber-200 text-amber-900 focus:ring-orange-500/50 placeholder:text-amber-400',
                icon: 'text-amber-500',
                categoryActive: 'bg-orange-600 text-white shadow-lg shadow-orange-600/20',
                categoryInactive: 'bg-white hover:bg-amber-100 border border-amber-200 text-amber-800',
                footer: 'bg-amber-100/50 border-amber-200',
                pageTitle: 'text-amber-900 drop-shadow-none',
            };
        case 'neon-nights':
            return {
                bg: 'bg-black text-fuchsia-50',
                header: 'bg-black/90 border-fuchsia-900/50',
                card: 'bg-slate-900 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:shadow-[0_0_25px_rgba(217,70,239,0.3)] hover:bg-slate-800',
                title: 'text-fuchsia-100 font-bold',
                desc: 'text-fuchsia-300',
                price: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] font-bold',
                input: 'bg-slate-900 border border-fuchsia-500/50 text-white focus:ring-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.2)] placeholder:text-fuchsia-700',
                icon: 'text-fuchsia-400',
                categoryActive: 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]',
                categoryInactive: 'bg-slate-900 hover:bg-slate-800 border border-fuchsia-900/50 text-fuchsia-300',
                footer: 'bg-black border-fuchsia-900/50',
                pageTitle: 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]',
            };
        case 'ocean-blue':
            return {
                bg: 'bg-slate-900 text-sky-50',
                header: 'bg-slate-900/90 border-cyan-900',
                card: 'bg-slate-800 border border-cyan-800/50 hover:bg-slate-800/80',
                title: 'text-cyan-50 font-bold',
                desc: 'text-cyan-200/70',
                price: 'text-teal-400 font-bold',
                input: 'bg-slate-800 border border-cyan-800/50 text-white focus:ring-cyan-500 placeholder:text-cyan-700',
                icon: 'text-cyan-400',
                categoryActive: 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]',
                categoryInactive: 'bg-slate-800 hover:bg-slate-700 border border-cyan-900 text-cyan-200',
                footer: 'bg-slate-900 border-cyan-900',
                pageTitle: 'text-cyan-300 drop-shadow-md',
            };
        case 'pastel-dream':
            return {
                bg: 'bg-rose-50 text-rose-950',
                header: 'bg-rose-50/90 border-rose-200',
                card: 'bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]',
                title: 'text-rose-900 font-bold',
                desc: 'text-rose-600/80',
                price: 'text-pink-500 font-bold',
                input: 'bg-white border border-rose-100 rounded-full text-rose-900 focus:ring-pink-400 placeholder:text-rose-300',
                icon: 'text-rose-400',
                categoryActive: 'bg-pink-400 text-white shadow-lg shadow-pink-400/20',
                categoryInactive: 'bg-white hover:bg-rose-100 border border-rose-100 text-rose-700',
                footer: 'bg-rose-100/30 border-rose-200',
                pageTitle: 'text-rose-800 drop-shadow-sm font-serif',
            };
        case 'monochrome':
            return {
                bg: 'bg-white text-black',
                header: 'bg-white/95 border-black border-b-2',
                card: 'bg-white border-2 border-black rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all',
                title: 'text-black font-black uppercase tracking-tight',
                desc: 'text-black/80 font-medium',
                price: 'text-black font-black',
                input: 'bg-white border-2 border-black rounded-none text-black focus:ring-0 focus:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-400',
                icon: 'text-black',
                categoryActive: 'bg-black text-white rounded-none border-2 border-black',
                categoryInactive: 'bg-white hover:bg-gray-100 border-2 border-black text-black rounded-none',
                footer: 'bg-white border-black border-t-2',
                pageTitle: 'text-black font-black uppercase drop-shadow-none',
            };
        case 'forest-green':
            return {
                bg: 'bg-stone-50 text-stone-900',
                header: 'bg-stone-50/90 border-emerald-200',
                card: 'bg-white border border-emerald-100 shadow-sm rounded-xl hover:shadow-md hover:border-emerald-200',
                title: 'text-emerald-950 font-bold',
                desc: 'text-emerald-700/80',
                price: 'text-emerald-600 font-bold',
                input: 'bg-white border border-emerald-200 text-stone-900 focus:ring-emerald-500 rounded-xl placeholder:text-emerald-300',
                icon: 'text-emerald-500',
                categoryActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20',
                categoryInactive: 'bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800',
                footer: 'bg-stone-100 border-emerald-200',
                pageTitle: 'text-emerald-900 drop-shadow-none',
            };
        case 'spicy-red':
            return {
                bg: 'bg-neutral-950 text-neutral-50',
                header: 'bg-neutral-950/90 border-red-900/50',
                card: 'bg-neutral-900 border border-red-900/30 hover:border-red-500/50 transition-colors',
                title: 'text-white font-bold',
                desc: 'text-neutral-400',
                price: 'text-red-500 font-bold tracking-wider',
                input: 'bg-neutral-900 border border-red-900/50 text-white focus:ring-red-600 placeholder:text-red-900/50',
                icon: 'text-red-500',
                categoryActive: 'bg-red-600 text-white shadow-lg shadow-red-600/20',
                categoryInactive: 'bg-neutral-900 hover:bg-neutral-800 border border-red-900/50 text-neutral-300',
                footer: 'bg-neutral-950 border-red-900/50',
                pageTitle: 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] uppercase',
            };
        case 'luxury-gold':
            return {
                bg: 'bg-zinc-950 text-zinc-100',
                header: 'bg-zinc-950/95 border-yellow-900/30',
                card: 'bg-zinc-900/80 border border-yellow-700/50 hover:border-yellow-500/80 transition-colors rounded-sm',
                title: 'text-yellow-500 font-serif',
                desc: 'text-zinc-400 font-light',
                price: 'text-yellow-600 font-serif',
                input: 'bg-zinc-900 border border-yellow-900/50 text-zinc-100 focus:ring-yellow-600 rounded-sm placeholder:text-yellow-900/50',
                icon: 'text-yellow-600',
                categoryActive: 'bg-yellow-600 text-zinc-950 font-semibold rounded-sm',
                categoryInactive: 'bg-zinc-900/50 hover:bg-zinc-800 border border-yellow-900/50 text-yellow-500 rounded-sm',
                footer: 'bg-zinc-950 border-yellow-900/30',
                pageTitle: 'text-yellow-500 font-serif drop-shadow-md',
            };
        case 'classic-dark':
        default:
            return {
                bg: 'bg-slate-950 text-slate-100',
                header: 'bg-slate-950/80 border-white/5',
                card: 'bg-white/5 border border-white/10 hover:bg-white/10 rounded-3xl',
                title: 'text-slate-100 bg-clip-text',
                desc: 'text-slate-400',
                price: 'text-orange-400 font-mono font-bold',
                input: 'bg-white/10 border border-white/20 text-white focus:ring-orange-500/50 focus:border-orange-500/50 rounded-2xl placeholder:text-slate-400',
                icon: 'text-slate-400',
                categoryActive: 'bg-orange-500 text-slate-50 shadow-lg shadow-orange-500/20',
                categoryInactive: 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100',
                footer: 'bg-slate-950 border-white/5',
                pageTitle: 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent drop-shadow-lg uppercase',
            };
    }
};

export const QR8: React.FC = () => {
  const { categories, products, restaurantInfo, firmData } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
     if (!activeCategory && categories.length > 0) {
         setActiveCategory(categories[0].id);
     }
  }, [categories, activeCategory]);

  useEffect(() => {
     const name = restaurantInfo?.name || firmData?.name;
     if (name) {
         document.title = `${name} QR Menü - AtlasPOS`;
     }
     
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

  const themeStyles = useMemo(() => getThemeClasses('forest-green'), []);
// TODO: Modify this component manually rather than using dynamic themeStyles for full customization.

  return (
    <div className={`flex font-sans flex-col min-h-[100dvh] w-full relative overflow-hidden transition-colors duration-500 ${themeStyles.bg}`}>
      {/* Animated Background for classic dark only basically or custom */}
      {(!firmData?.qrTheme || firmData.qrTheme === 'classic-dark') && (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
          </div>
      )}

      <header className={`relative z-50 backdrop-blur-xl border-b transition-colors ${themeStyles.header}`}>
        {coverSrc && (
           <div className="absolute inset-0 z-[-1] overflow-hidden">
              <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-[2px]" />
              <img src={coverSrc} alt="Cover" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-20" />
           </div>
        )}
        <div className="p-6">
            <div className="flex flex-col items-center mb-6 pt-4">
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                src={logoSrc} 
                alt={restaurantInfo?.name || "Logo"} 
                className="w-24 h-24 object-cover mb-4 rounded-3xl shadow-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border-2 border-white/10" 
                referrerPolicy="no-referrer"
              />
              <motion.h1 
                 initial={{ y: 10, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.1 }}
                 className={`text-3xl tracking-widest text-center ${themeStyles.pageTitle}`}
              >
                  {restaurantInfo?.name || "Menü"}
              </motion.h1>
              {restaurantInfo?.description && (
                 <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-sm mt-3 text-center max-w-sm drop-shadow-md ${coverSrc ? 'text-white/90' : themeStyles.desc}`}
                 >
                    {restaurantInfo.description}
                 </motion.p>
              )}
            </div>
            
            <div className="relative max-w-md mx-auto pt-2">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none mt-1 ${themeStyles.icon}`} />
              <input 
                type="text" 
                placeholder="Ne yemek istersiniz?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full backdrop-blur-md py-3.5 pl-12 pr-4 text-base focus:outline-none transition-all shadow-lg ${themeStyles.input}`}
              />
            </div>
        </div>
      </header>

      <div className={`sticky top-[152px] z-40 px-4 py-2 border-b transition-colors ${themeStyles.header}`}>
        <div className="max-w-4xl mx-auto flex gap-3 overflow-x-auto scrollbar-hide py-2">
            {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-6 py-3 md:py-2.5 text-sm transition-colors whitespace-nowrap active:scale-95 ${
                        firmData?.qrTheme === 'monochrome' || firmData?.qrTheme === 'luxury-gold' ? '' : 'rounded-full'
                    } ${isActive ? themeStyles.categoryActive : themeStyles.categoryInactive}`}
                  >
                    {category.name}
                  </button>
                );
            })}
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
                        className={`transition-colors p-4 flex gap-4 overflow-hidden backdrop-blur-sm relative ${themeStyles.card} ${
                           product.hasStock && (product.stockCount || 0) <= 0 ? 'opacity-70 grayscale' : ''
                        }`}
                    >
                        {product.hasStock && (
                            <div className={`absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm z-20 ${
                               (product.stockCount || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {(product.stockCount || 0) > 0 ? `Stok: ${product.stockCount}` : 'Tükendi'}
                            </div>
                        )}
                        {product.image ? (
                            <div className="shrink-0 cursor-pointer overflow-hidden rounded-xl relative" onClick={() => setFullScreenImage(product.image)}>
                                <div className="absolute inset-0 bg-black/10 transition-colors z-10 hover:bg-transparent" />
                                <img 
                                    src={getOptimizedImage(product.image, 200, 200, "fill")} 
                                    alt={product.name} 
                                    className="w-24 h-24 object-cover transition-transform duration-500 hover:scale-110" 
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-black/5 rounded-xl shrink-0 flex items-center justify-center border border-black/10">
                                <span className={`${themeStyles.icon} text-xs font-medium`}>Görsel Yok</span>
                            </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <h3 className={`text-lg leading-tight mb-1 truncate ${themeStyles.title}`}>{product.name}</h3>
                            <p className={`text-sm line-clamp-2 mb-3 flex-1 ${themeStyles.desc}`}>{product.description}</p>
                            <span className={`text-lg ${themeStyles.price}`}>{formatCurrency(product.price)}</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
        {filteredProducts.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className={`text-center py-12 ${themeStyles.desc}`}
            >
                <p>Bu kategoride ürün bulunmuyor.</p>
            </motion.div>
        )}
      </main>
      
      <footer className={`py-8 flex flex-col items-center border-t mt-auto relative overflow-hidden transition-colors ${themeStyles.footer}`}>
         <div className="flex gap-4 mb-8 relative z-10">
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
