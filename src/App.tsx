import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { LoginView } from './components/auth/LoginView';
import { SelectionView } from './components/dashboard/SelectionView';
import { POSView } from './components/pos/POSView';
import { SettingsView } from './components/dashboard/SettingsView';
import { QRMenuView } from './components/qrmenu/QRMenuView';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'selection' | 'pos' | 'kasa' | 'ayarlar'>('selection');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return unsubscribe;
  }, []);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('selection');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('selection');
  };

  const handleViewChange = (view: string) => {
      if (view === 'pos' || view === 'kasa' || view === 'ayarlar' || view === 'selection') {
          setCurrentView(view as any);
      }
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  let content;
  switch (currentView) {
      case 'selection':
          content = <SelectionView onSelect={setCurrentView} onLogout={handleLogout} />;
          break;
      case 'pos':
          content = (
              <OrderProvider>
                  <POSView onLogout={handleLogout} onViewChange={handleViewChange} />
              </OrderProvider>
          );
          break;
      case 'kasa':
          content = (
              <div className="flex flex-col h-screen p-4 lg:p-8 bg-transparent relative w-full text-slate-100">
                  <header className="mb-6 lg:mb-10 shrink-0 flex items-center gap-4">
                    <button 
                      onClick={() => setCurrentView('selection')} 
                      className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    </button>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Kasa <span className="font-bold text-blue-400">Modülü</span></h1>
                      <p className="text-slate-400 mt-1">Adisyon ve fatura işlemleri.</p>
                    </div>
                  </header>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                      <p className="text-lg text-slate-400">Bu modül yapım aşamasındadır.</p>
                    </div>
                  </div>
              </div>
          );
          break;
      case 'ayarlar':
          content = <SettingsView onLogout={handleLogout} onViewChange={handleViewChange} />;
          break;
      default:
           content = <SelectionView onSelect={setCurrentView} onLogout={handleLogout} />;
  }

  return (
    <div className="h-full w-full">
        {content}
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/qrmenu" element={<QRMenuView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </RestaurantProvider>
  );
}
