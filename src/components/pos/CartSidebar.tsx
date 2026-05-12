import React from 'react';
import { Minus, Plus, Trash2, Receipt, ChefHat, X } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency } from '../../lib/utils';

export const CartSidebar: React.FC<{ onClose?: () => void, tableName?: string }> = ({ onClose, tableName }) => {
  const { state, dispatch } = useOrder();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  const hasItems = state.items.length > 0;
  const tax = state.totalAmount * 0.10; // %10 KDV
  const finalTotal = state.totalAmount + tax;

  return (
    <section className="w-full sm:w-[380px] bg-white/5 backdrop-blur-2xl sm:border-l border-white/10 flex flex-col h-full z-10 shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{tableName ? tableName + ' Adisyon' : 'Mevcut Sipariş'}</h2>
          <span className="text-xs text-slate-400">Yeni Sipariş</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 px-6 space-y-4 overflow-y-auto py-4 scrollbar-hide touch-pan-y">
          {hasItems ? (
            state.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 italic truncate mt-0.5">
                        {item.description.substring(0, 40)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-mono shrink-0 font-medium whitespace-nowrap text-orange-400 mt-1">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-5 h-5 text-red-400" /> : <Minus className="w-5 h-5" />}
                    </button>
                    <span className="w-6 text-center font-bold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4"
            >
              <ChefHat className="w-16 h-16 opacity-20" />
              <p className="text-sm">Henüz ürün eklenmedi</p>
            </div>
          )}
      </div>

      {/* Footer / Summary */}
      <div className="p-6 bg-slate-900/50 rounded-t-[40px] border-t border-white/10 shrink-0">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Ara Toplam</span>
            <span>{formatCurrency(state.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Servis Bedeli (%10)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-white/5">
            <span>Toplam</span>
            <span className="text-orange-400 font-mono">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            className="py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            disabled={!hasItems}
            onClick={() => dispatch({ type: 'CLEAR_ORDER' })}
          >
            İptal
          </button>
          <button 
            className="py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            disabled={!hasItems}
          >
            Yazdır
          </button>
          <button
            disabled={!hasItems}
            className="col-span-2 py-4 rounded-2xl bg-orange-500 text-slate-950 font-bold tracking-widest uppercase text-xs shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
            onClick={() => {
              alert('Ödeme Alındı!');
              dispatch({ type: 'CLEAR_ORDER' });
            }}
          >
            Ödeme Al
          </button>
        </div>
      </div>
    </section>
  );
};
