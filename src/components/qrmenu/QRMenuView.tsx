import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { CategoryFilter } from '../pos/CategoryFilter';
import { formatCurrency } from '../../lib/utils';
import { Search } from 'lucide-react';

export const QRMenuView: React.FC = () => {
  const { categories, products } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="flex bg-slate-950 font-sans text-slate-100 flex-col min-h-[100dvh] w-full">
      <header className="p-6 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572429/Blue_and_Black_Minimalist_Brand_Logo_20260120_225431_0000_s2isk5.png" 
            alt="Logo" 
            className="w-16 h-16 object-contain mb-3 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-bold tracking-widest text-orange-400 uppercase">Menü</h1>
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
            {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex gap-4 overflow-hidden">
                    {product.image ? (
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-24 h-24 object-cover rounded-2xl shrink-0" 
                        />
                    ) : (
                        <div className="w-24 h-24 bg-white/5 rounded-2xl shrink-0 flex items-center justify-center">
                            <span className="text-slate-500 text-xs">Resim Yok</span>
                        </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 text-lg leading-tight mb-1 truncate">{product.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-2 flex-1">{product.description}</p>
                        <span className="text-orange-400 font-mono font-medium">{formatCurrency(product.price)}</span>
                    </div>
                </div>
            ))}
        </div>
        {filteredProducts.length === 0 && (
            <div className="text-center text-slate-500 py-12">
                <p>Bu kategoride ürün bulunmuyor.</p>
            </div>
        )}
      </main>
      
      <footer className="py-6 flex flex-col items-center border-t border-white/5 bg-slate-950 mt-auto">
         <span className="text-xs text-slate-500 mb-2 tracking-wider">Powered by</span>
         <img 
            src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png" 
            alt="Dentlas Ajans" 
            className="h-6 object-contain opacity-60" 
            referrerPolicy="no-referrer"
         />
      </footer>
    </div>
  );
};
