import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface LoginViewProps {
  onLoginSuccess: (userRole: string, userName: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { appUsers } = useRestaurant();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const checkPin = (currentPin: string) => {
    // Check main admin fallback pin
    if (currentPin === '1234') {
        onLoginSuccess('admin', 'Admin');
        return;
    }

    // Check staff pins
    const staff = appUsers.find(u => u.pin === currentPin);
    if (staff) {
        onLoginSuccess(staff.role || 'waiter', staff.name);
    } else {
        setError(true);
        setTimeout(() => setPin(''), 1000);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // only digits
    if (value.length <= 4) {
      setPin(value);
      setError(false);
      
      // Auto login when 4 digits are entered
      if (value.length === 4) {
        checkPin(value);
      }
    }
  };

  const handleNumpadClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        checkPin(newPin);
      }
    }
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 4; i++) {
        const isFilled = i < pin.length;
        dots.push(
            <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                  isFilled 
                    ? (error ? 'bg-red-500 border-red-500' : 'bg-orange-500 border-orange-500') 
                    : 'bg-transparent border-slate-600'
                }`}
            />
        );
    }
    return dots;
  };

  return (
    <div className="flex bg-transparent font-sans text-slate-100 flex-col items-center justify-between w-full min-h-[100dvh] p-4 relative z-10">
      
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

          <h1 className="text-2xl font-light tracking-tight mb-2">Sisteme Giriş</h1>
          <p className="text-slate-400 text-sm mb-8 text-center px-4">Devam etmek için 4 haneli PIN kodunuzu giriniz.</p>

          {/* PIN Indicators */}
          <div className="flex gap-4 mb-2 h-6">
              {renderPinDots()}
          </div>
          
          {/* Error message slot */}
          <div className="h-6 mb-4">
              {error && <span className="text-red-400 text-sm">Hatalı PIN kodu</span>}
          </div>

          {/* Hidden input for keyboard support */}
          <input 
              type="password"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
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
                  onClick={() => setPin('')}
                  className="h-14 rounded-full hover:bg-white/5 flex items-center justify-center text-sm font-medium transition-colors text-slate-400"
              >
                  Temizle
              </button>
              <button
                  onClick={() => handleNumpadClick('0')}
                  className="h-14 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 flex items-center justify-center text-xl font-medium transition-colors"
              >
                  0
              </button>
              <button
                  onClick={() => setPin(prev => prev.slice(0, -1))}
                  className="h-14 rounded-full hover:bg-white/5 flex items-center justify-center text-sm font-medium transition-colors text-slate-400"
              >
                  Sil
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
