import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { LoginView } from './components/auth/LoginView';
import { SelectionView } from './components/dashboard/SelectionView';
import { POSView } from './components/pos/POSView';
import { CashRegisterView } from './components/dashboard/CashRegisterView';
import { SettingsView } from './components/dashboard/SettingsView';
import { QRMenuView } from './components/qrmenu/QRMenuView';
import { InstallPWA } from './components/InstallPWA';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'selection' | 'pos' | 'kasa' | 'ayarlar'>('selection');

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
          content = <CashRegisterView onBack={() => setCurrentView('selection')} />;
          break;
      case 'ayarlar':
          content = <SettingsView onLogout={handleLogout} onViewChange={handleViewChange} />;
          break;
      default:
           content = <SelectionView onSelect={setCurrentView} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col">
        {content}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <RestaurantProvider>
      <InstallPWA />
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
