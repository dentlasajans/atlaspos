import React from 'react';
import { UtensilsCrossed, Calculator, Settings } from 'lucide-react';

interface SelectionViewProps {
  onSelect: (view: 'pos' | 'kasa' | 'ayarlar') => void;
  onLogout: () => void;
}

export const SelectionView: React.FC<SelectionViewProps> = ({ onSelect, onLogout }) => {
  return (
    <div className="flex bg-transparent font-sans text-slate-100 flex-col items-center justify-center w-full h-full p-4 relative z-10">
      
      <div className="w-full max-w-4xl flex flex-col">
        <header className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Hoş Geldiniz, <span className="font-bold text-orange-400">Admin</span></h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">Lütfen işlem yapmak istediğiniz modülü seçin.</p>
            </div>
            <button 
              onClick={onLogout}
              className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-full text-sm font-medium active:scale-95"
            >
              Çıkış Yap
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
                onClick={() => onSelect('pos')}
                className="group flex flex-col items-center p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors text-center active:scale-95"
            >
                <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Servis</h3>
                <p className="text-slate-400 text-sm">Sipariş oluşturma ve masa yönetimi modülü.</p>
            </button>

            <button 
                onClick={() => onSelect('kasa')}
                className="group flex flex-col items-center p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors text-center active:scale-95"
            >
                <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                    <Calculator className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Kasa</h3>
                <p className="text-slate-400 text-sm">Adisyon, fatura kesimi ve ödeme işlemleri.</p>
            </button>

            <button 
                onClick={() => onSelect('ayarlar')}
                className="group flex flex-col items-center p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors text-center active:scale-95"
            >
                <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                    <Settings className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-slate-100">Ayarlar</h3>
                <p className="text-slate-400 text-sm">Menü, personel ve sistem yapılandırması.</p>
            </button>
        </div>
      </div>
      
    </div>
  );
};
