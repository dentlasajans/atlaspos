import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard = React.memo(({ product, onAdd }: ProductCardProps) => {
  return (
    <div
      onClick={() => onAdd(product)}
      className="group bg-white/5 border border-white/10 p-3 md:p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col active:scale-95"
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="h-24 md:h-32 bg-slate-800 rounded-xl md:rounded-2xl mb-3 md:mb-4 overflow-hidden relative shrink-0 pointer-events-none">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
             <span className="text-slate-500 text-xs text-center px-2">Resim Yok</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="absolute bottom-2 left-2 md:left-3 font-semibold text-slate-100 text-sm md:text-base leading-tight">{product.name}</div>
      </div>
      
      <div className="flex-1 hidden md:block pointer-events-none">
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 md:mb-3">
          {product.description}
        </p>
      </div>

      <div className="flex justify-between items-center mt-auto pointer-events-none">
        <span className="text-orange-400 font-mono font-medium tracking-wide text-xs md:text-sm">
          {formatCurrency(product.price)}
        </span>
        <button
          className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 text-slate-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-slate-950 transition-all shadow-lg"
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
