import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { ProductCard } from './ProductCard';
import { CartSidebar } from './CartSidebar';
import { Search, Receipt, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { Table, useRestaurant } from '../../context/RestaurantContext';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface OrderingViewProps {
  table: Table;
  onBack: () => void;
  onLogout: () => void;
  onViewChange: (view: string) => void;
}

export const OrderingView: React.FC<OrderingViewProps> = ({ table, onBack, onLogout, onViewChange }) => {
  const { state, dispatch } = useOrder();
  const { categories, products } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
     if (!activeCategory && categories.length > 0) {
         setActiveCategory(categories[0].id);
     }
  }, [categories, activeCategory]);

  // Removed clear order effect to persist orders

  const handleSendOrder = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleAddToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: { product } });
  }, [dispatch]);

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
    <div className="flex h-[100dvh] bg-transparent overflow-hidden font-sans text-slate-100 flex-col md:flex-row relative w-full">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Center Panel (Products) */}
        <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-8 overflow-hidden">
          {/* Header */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 shrink-0 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
              >
                 <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">{table.name} <span className="font-bold text-orange-400">Adisyon</span></h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto mt-2 lg:mt-0">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Ürün ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2.5 pl-10 lg:pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-500 text-slate-100"
                />
              </div>
            </div>
          </header>

          {/* Categories */}
          <div className="mb-4 lg:mb-8 shrink-0 -mx-4 lg:mx-0 px-4 lg:px-0 scrollbar-hide overflow-x-auto">
            <CategoryFilter 
              categories={categories} 
              activeCategoryId={activeCategory} 
              onSelect={setActiveCategory} 
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pb-28 md:pb-8 scrollbar-hide -mx-2 lg:mx-0 px-2 lg:px-0">
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
                ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 col-span-full">
                <p className="text-lg font-medium">Bu kategoride ürün bulunamadı.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Cart) */}
        <aside className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out w-full lg:w-[380px] shrink-0 lg:relative lg:transform-none bg-slate-900 border-l border-white/10 ${isCartOpen ? 'translate-x-0' : 'translate-x-[100%]'} lg:flex`}>
          <div className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm lg:hidden ${!isCartOpen ? 'hidden' : ''}`} onClick={() => setIsCartOpen(false)} aria-hidden="true" />
          <div className={`absolute inset-y-0 right-0 w-full sm:w-[380px] lg:w-full lg:static lg:h-full flex flex-col shadow-2xl bg-slate-900 ${!isCartOpen ? 'translate-x-[100%]' : 'translate-x-0'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <CartSidebar onClose={() => setIsCartOpen(false)} tableName={table.name} onSend={handleSendOrder} />
          </div>
        </aside>

      </main>

      {/* Cart Bottom Bar */}
      {state.items.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-30 flex justify-center pointer-events-none lg:hidden">
          <button 
            className="w-full max-w-2xl bg-slate-800 text-slate-100 p-4 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 active:scale-95 transition-transform pointer-events-auto"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center relative shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-6 h-6 text-slate-950" />
                <span className="absolute -top-2 -right-2 bg-slate-100 text-slate-900 font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-800">
                  {state.items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm text-slate-400">Siparişi Görüntüle</span>
                <span className="font-bold text-xl text-orange-400">
                  {formatCurrency(state.totalAmount)}
                </span>
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl flex items-center gap-2">
              <span className="font-medium hidden sm:block pr-2">Adisyon</span>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
}
