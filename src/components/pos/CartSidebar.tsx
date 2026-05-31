import React, { useState } from 'react';
import { Minus, Plus, Trash2, Receipt, ChefHat, X, Banknote, CreditCard, CheckCircle2 } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency } from '../../lib/utils';

export const CartSidebar: React.FC<{ onClose?: () => void, tableName?: string, onSend?: () => void }> = ({ onClose, tableName, onSend }) => {
  const { state, dispatch } = useOrder();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [customPayAmountStr, setCustomPayAmountStr] = useState<string>('');

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  const hasItems = state.items.length > 0;
  const finalTotal = state.totalAmount;

  return (
    <section className="w-full sm:w-[380px] bg-white/5 backdrop-blur-2xl sm:border-l border-white/10 flex flex-col h-full z-10 shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{tableName ? tableName + ' Adisyon' : 'Mevcut Sipariş'}</h2>
          <span className="text-xs text-slate-400">Yeni Sipariş</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 px-6 space-y-4 overflow-y-auto py-4 scrollbar-hide">
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
                  {!item.id.toString().startsWith('partial_') && (
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
                  )}
                  {item.id.toString().startsWith('partial_') && (
                      <span className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg font-medium">
                          Tahsil Edildi
                      </span>
                  )}
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
          <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-white/5">
            <span>Toplam</span>
            <span className="text-orange-400 font-mono">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            className="col-span-2 py-4 rounded-2xl bg-orange-600 text-white font-bold tracking-widest uppercase text-xs shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
            disabled={!hasItems}
            onClick={() => {
              if (onSend) onSend();
            }}
          >
            Siparişi Masaya Gönder
          </button>
          
          <button 
            className="py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
            disabled={!hasItems}
            onClick={() => {
              dispatch({ type: 'CLEAR_ORDER' })
              if (onSend) onSend();
            }}
          >
            Adisyonu İptal Et
          </button>
          
          <button
            disabled={!hasItems}
            className="py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Ödeme Al
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !paymentSuccess && setIsPaymentModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[101] animate-in fade-in zoom-in duration-200">
            {paymentSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Ödeme Alındı</h3>
                <p className="text-slate-400">Teşekkür ederiz.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Ödeme Al</h3>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center mb-4 bg-slate-950 p-6 rounded-2xl border border-white/5">
                  <span className="text-sm text-slate-400 mb-1">Kalan Toplam Tutar</span>
                  <span className="text-3xl font-mono text-orange-400 font-bold">{formatCurrency(finalTotal)}</span>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex bg-slate-800 p-1 rounded-xl">
                      <button onClick={() => setCustomPayAmountStr((finalTotal / 2).toFixed(2))} className="flex-1 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">1/2</button>
                      <button onClick={() => setCustomPayAmountStr((finalTotal / 3).toFixed(2))} className="flex-1 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">1/3</button>
                      <button onClick={() => setCustomPayAmountStr((finalTotal / 4).toFixed(2))} className="flex-1 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">1/4</button>
                      <button onClick={() => setCustomPayAmountStr('')} className="flex-1 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-orange-400">Tümü</button>
                  </div>
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₺</span>
                      <input 
                        type="number"
                        placeholder="Ödenecek Tutarı Girin..."
                        value={customPayAmountStr}
                        onChange={(e) => setCustomPayAmountStr(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-4 py-3 font-mono text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const amountToPay = customPayAmountStr ? parseFloat(customPayAmountStr) : finalTotal;
                      if (isNaN(amountToPay) || amountToPay <= 0) return;
                      
                      setPaymentSuccess(true);
                      setTimeout(() => {
                        setIsPaymentModalOpen(false);
                        setPaymentSuccess(false);
                        
                        // Handle partial or full
                        // Avoid float precision issues
                        if (Math.abs(amountToPay - finalTotal) < 0.01) {
                            dispatch({ type: 'CHECKOUT_ORDER', payload: { paymentMethod: 'nakit' } });
                        } else {
                            dispatch({ type: 'PARTIAL_CHECKOUT', payload: { amount: amountToPay, paymentMethod: 'nakit' } });
                        }
                        
                        if (onSend) onSend();
                      }, 1500);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="font-semibold text-emerald-400">Nakit Tahsil Et</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      const amountToPay = customPayAmountStr ? parseFloat(customPayAmountStr) : finalTotal;
                      if (isNaN(amountToPay) || amountToPay <= 0) return;

                      setPaymentSuccess(true);
                      setTimeout(() => {
                        setIsPaymentModalOpen(false);
                        setPaymentSuccess(false);
                        
                        if (Math.abs(amountToPay - finalTotal) < 0.01) {
                            dispatch({ type: 'CHECKOUT_ORDER', payload: { paymentMethod: 'kredi_karti' } });
                        } else {
                            dispatch({ type: 'PARTIAL_CHECKOUT', payload: { amount: amountToPay, paymentMethod: 'kredi_karti' } });
                        }
                        
                        if (onSend) onSend();
                      }, 1500);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="font-semibold text-blue-400">Kredi Kartı Tahsil Et</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
