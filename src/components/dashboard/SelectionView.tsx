import React, { useState } from 'react';
import { UtensilsCrossed, Calculator, Settings, QrCode, X, Wifi } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { QRCodeSVG } from 'qrcode.react';

interface SelectionViewProps {
  onSelect: (view: 'pos' | 'kasa' | 'ayarlar') => void;
  onLogout: () => void;
}

export const SelectionView: React.FC<SelectionViewProps> = ({ onSelect, onLogout }) => {
  const { restaurantInfo } = useRestaurant();
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTab, setQrTab] = useState<'menu' | 'wifi'>('menu');

  // Standard format for WiFi QR: WIFI:S:<SSID>;T:<WEP|WPA|blank>;P:<PASSWORD>;H:<true|false|blank>;;
  const wifiQRString = `WIFI:S:${restaurantInfo?.wifiSsid || ''};T:WPA;P:${restaurantInfo?.wifiPassword || ''};;`;
  const menuUrl = window.location.origin + window.location.pathname + '#/qrmenu';

  return (
    <div className="flex bg-transparent font-sans text-slate-100 flex-col items-center justify-center w-full min-h-[100dvh] py-10 px-4 relative z-10">
      
      <div className="w-full max-w-4xl flex flex-col">
        <header className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Hoş Geldiniz, <span className="font-bold text-orange-400">Admin</span></h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">Lütfen işlem yapmak istediğiniz modülü seçin.</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-full text-slate-300 active:scale-95 flex items-center justify-center"
                  title="QR Kodlar"
                >
                  <QrCode className="w-5 h-5" />
                </button>
                <button 
                  onClick={onLogout}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-full text-sm font-medium active:scale-95"
                >
                  Çıkış Yap
                </button>
            </div>
        </header>

        {showQRModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">QR Kodlar</h2>
                        <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                           <button 
                             onClick={() => setQrTab('menu')}
                             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex justify-center items-center gap-2 ${qrTab === 'menu' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                           >
                             <QrCode className="w-4 h-4" /> QR Menü
                           </button>
                           <button 
                             onClick={() => setQrTab('wifi')}
                             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex justify-center items-center gap-2 ${qrTab === 'wifi' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                           >
                             <Wifi className="w-4 h-4" /> Wi-Fi
                           </button>
                        </div>

                        <div className="flex justify-center p-4 bg-white rounded-2xl">
                           {qrTab === 'menu' ? (
                               <QRCodeSVG value={menuUrl} size={256} className="w-full max-w-[200px] h-auto" />
                           ) : (
                               restaurantInfo?.wifiSsid ? (
                                   <QRCodeSVG value={wifiQRString} size={256} className="w-full max-w-[200px] h-auto" />
                               ) : (
                                   <div className="w-[200px] h-[200px] flex items-center justify-center text-center text-slate-500 font-medium p-4 border-2 border-dashed border-slate-300 rounded-xl">
                                       Ayarlar kısmından Wi-Fi bilgilerinizi giriniz.
                                   </div>
                               )
                           )}
                        </div>

                        <div className="mt-6 text-center text-slate-400 text-sm">
                            {qrTab === 'menu' ? 'Müşterileriniz bu kodu okutarak QR menüye ulaşabilir.' : 'Müşterileriniz bu kodu okutarak Wi-Fi ağına bağlanabilir.'}
                        </div>
                    </div>
                </div>
            </div>
        )}

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
