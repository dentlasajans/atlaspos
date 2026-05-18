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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authState = localStorage.getItem('isAuthenticated');
    const lastActivity = localStorage.getItem('lastActivity');
    const userRole = localStorage.getItem('userRole');
    
    if (authState === 'true' && lastActivity && userRole) {
      const now = Date.now();
      const last = parseInt(lastActivity, 10);
      const TEN_MINUTES = 10 * 60 * 1000;
      
      if (now - last < TEN_MINUTES) {
        // Still valid, update last activity
        localStorage.setItem('lastActivity', now.toString());
        return true;
      } else {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
      }
    }
    return false;
  });

  const [currentView, setCurrentView] = useState<'selection' | 'pos' | 'kasa' | 'ayarlar'>('selection');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let lastUpdate = 0;

    const handleActivity = () => {
      if (isAuthenticated) {
        const now = Date.now();
        // Throttle localStorage updates to every 1 minute max
        if (now - lastUpdate > 60000) {
          localStorage.setItem('lastActivity', now.toString());
          lastUpdate = now;
        }
        
        // Clear existing timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        // Set new timeout for 10 minutes (600,000 ms)
        timeoutId = setTimeout(() => {
          handleLogout();
        }, 10 * 60 * 1000);
      }
    };

    if (isAuthenticated) {
      // Set initial timeout
      handleActivity();
      
      // Add event listeners for activity tracking
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('touchstart', handleActivity);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = (userRole: string, userName: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('lastActivity', Date.now().toString());
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', userName);
    setCurrentView('selection');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
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
