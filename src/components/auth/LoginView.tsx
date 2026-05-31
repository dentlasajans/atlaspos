import React, { useState, useEffect } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface LoginViewProps {
  onLoginSuccess: (userRole: string, userName: string, userId: string) => void;
  onUnbind: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onUnbind }) => {
  const { appUsers, firmData } = useRestaurant();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const checkPin = (currentPin: string) => {
    // Check main admin fallback pin
    if (currentPin === '1234') {
        setPin(''); // clear pin on success so it doesn't linger
        onLoginSuccess('admin', 'Admin', 'admin_fallback');
        return;
    }

    // Check staff pins
    const staff = appUsers.find(u => u.pin === currentPin);
    if (staff) {
        setPin('');
        onLoginSuccess(staff.role || 'waiter', staff.name, staff.id);
    } else {
        setError(true);
        setTimeout(() => setPin(''), 1000);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // only digits
    if (value.length <= 8) {
      setPin(value);
      setError(false);
    }
  };

  const handleNumpadClick = (num: string) => {
    if (pin.length < 8) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
    }
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      checkPin(pin);
    }
  };



  return (
    <div className="flex bg-transparent font-sans text-slate-100 flex-col items-center justify-between w-full min-h-[100dvh] p-4 relative z-10">
      
      {/* Top action bar */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={onUnbind}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800/80 border border-white/10 rounded-xl text-sm font-medium transition-colors backdrop-blur-md text-slate-300"
        >
          <LogOut className="w-4 h-4" />
          Cihaz Bağlantısını Kes
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center max-w-sm w-full p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572429/Blue_and_Black_Minimalist_Brand_Logo_20260120_225431_0000_s2isk5.png" 
              alt="AtlasPOS Logo" 
              className="w-20 h-20 object-contain mb-3 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
              referrerPolicy="no-referrer"
            />
            <h2 className="text-lg font-bold tracking-widest text-orange-400 uppercase">AtlasPOS</h2>
          </div>

          <h1 className="text-2xl font-light tracking-tight mb-2">{firmData?.name || 'Sisteme Giriş'}</h1>
          <p className="text-slate-400 text-sm mb-4 text-center px-4">Devam etmek için 4-8 haneli PIN kodunuzu giriniz.</p>

          {appUsers.length === 0 && (
            <div className="mb-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl flex items-center gap-3 w-full text-sm">
                Varsayılan sistem yöneticisi PIN kodu: 1234
            </div>
          )}

          {/* PIN Indicators */}
          <div className="flex gap-4 mb-2 h-6 items-center justify-center">
              {pin.length === 0 ? (
                  <span className="text-slate-500 text-sm">PIN giriniz...</span>
              ) : (
                  Array.from({ length: pin.length }).map((_, i) => (
                      <div 
                          key={i} 
                          className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                            error ? 'bg-red-500 border-red-500' : 'bg-orange-500 border-orange-500'
                          }`}
                      />
                  ))
              )}
          </div>
          
          {/* Error message slot */}
          <div className="h-6 mb-4">
              {error && <span className="text-red-400 text-sm">Hatalı PIN kodu</span>}
          </div>

          {/* Hidden input for keyboard support */}
          <input 
              type="password"
              maxLength={8}
              value={pin}
              onChange={handlePinChange}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
              }}
              className="opacity-0 absolute -z-10 focus:outline-none"
              autoFocus
          />

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                      key={num}
                      onClick={() => handleNumpadClick(num.toString())}
                      className="h-14 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 flex items-center justify-center text-xl font-medium transition-colors"
                  >
                      {num}
                  </button>
              ))}
              <button
                  onClick={() => setPin(prev => prev.slice(0, -1))}
                  className="h-14 rounded-full hover:bg-red-500/10 active:bg-red-500/20 flex items-center justify-center text-sm font-medium transition-colors text-slate-400 hover:text-red-400"
              >
                  Sil
              </button>
              <button
                  onClick={() => handleNumpadClick('0')}
                  className="h-14 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 flex items-center justify-center text-xl font-medium transition-colors"
              >
                  0
              </button>
              <button
                  onClick={handleSubmit}
                  disabled={pin.length < 4}
                  className="h-14 rounded-full bg-orange-500 hover:bg-orange-600 focus:outline-none disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center text-sm font-bold transition-all text-white active:scale-95"
              >
                  Giriş
              </button>
          </div>
        </div>
      </div>

      <div className="pb-4 mt-8 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-500 mb-2 tracking-wider">Powered by</span>
        <img 
          src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png" 
          alt="Dentlas Ajans" 
          className="h-8 object-contain opacity-80" 
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
