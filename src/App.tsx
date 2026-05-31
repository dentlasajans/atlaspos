import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { LoginView } from './components/auth/LoginView';
import { FirmBindingView } from './components/auth/FirmBindingView';
import { SelectionView } from './components/dashboard/SelectionView';
import { POSView } from './components/pos/POSView';
import { CashRegisterView } from './components/dashboard/CashRegisterView';
import { SettingsView } from './components/dashboard/SettingsView';
import { QRMenuView } from './components/qrmenu/QRMenuView';
import { InstallPWA } from './components/InstallPWA';
import { auth, db } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Firm } from './types';
import { Loader2, AlertTriangle } from 'lucide-react';

function MainApp({ firmId, onUnbind }: { firmId: string, onUnbind: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authState = localStorage.getItem('isAuthenticated');
    const lastActivity = localStorage.getItem('lastActivity');
    const userRole = localStorage.getItem('userRole');
    
    if (authState === 'true' && lastActivity && userRole) {
      const now = Date.now();
      const last = parseInt(lastActivity, 10);
      const TEN_MINUTES = 10 * 60 * 1000;
      
      if (now - last < TEN_MINUTES) {
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
        if (now - lastUpdate > 60000) {
          localStorage.setItem('lastActivity', now.toString());
          lastUpdate = now;
        }
        
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          handleLogout();
        }, 10 * 60 * 1000);
      }
    };

    if (isAuthenticated) {
      handleActivity();
      
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

  const handleLoginSuccess = (userRole: string, userName: string, userId: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('lastActivity', Date.now().toString());
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userId', userId);
    setCurrentView('selection');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    setCurrentView('selection');
  };

  const handleViewChange = (view: string) => {
      if (view === 'pos' || view === 'kasa' || view === 'ayarlar' || view === 'selection') {
          setCurrentView(view as any);
      }
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} onUnbind={onUnbind} />;
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

import { SuperAdminApp } from './components/superadmin/SuperAdminApp';

export default function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loadingFirm, setLoadingFirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Parse hash to see if we are deep linking specifically to qrmenu with a firm ID
  let hashFirmId = null;
  const isQRMenuUrl = window.location.hash.startsWith('#/qrmenu');
  if (isQRMenuUrl) {
     const params = new URLSearchParams(window.location.hash.split('?')[1]);
     hashFirmId = params.get('firmId');
  }

  const [firmId, setFirmId] = useState<string | null>(hashFirmId || localStorage.getItem('firmId'));
  const [firmData, setFirmData] = useState<Firm | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user && window.location.hash !== '#/admin') {
        try {
          await signInAnonymously(auth);
          // Don't set authInitialized to true here, wait for the next onAuthStateChanged trigger with the user.
        } catch (error: any) {
          console.error('Auth Error:', error);
          if (error.code === 'auth/admin-restricted-operation') {
              setAuthError('Firebase Authentication ayarlarında "Anonymous" (Anonim) giriş sağlayıcısı etkinleştirilmemiş veya "Enable create (sign-up)" kapatılmış.');
              console.warn('Firebase Anonymous Auth is not enabled or user creation is disabled in Firebase console.');
          }
          setAuthInitialized(true); // Fallback so we don't hang
        }
      } else {
         setAuthInitialized(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkFirm = async () => {
      if (!firmId) return;
      setLoadingFirm(true);
      try {
        const firmDoc = await getDoc(doc(db, 'firms', firmId));
        if (firmDoc.exists()) {
          const data = { id: firmDoc.id, ...firmDoc.data() } as Firm;
          if (!data.isActive) {
            if (!isQRMenuUrl) handleUnbind();
            alert('Firma hesabı pasife alınmış.');
            return;
          }
          
          if (data.licenseEndDate && data.licenseEndDate < Date.now()) {
            if (!isQRMenuUrl) handleUnbind();
            alert('Lisans süreniz dolmuştur.');
            return;
          }
          
          setFirmData(data);
        } else {
          if (!isQRMenuUrl) handleUnbind();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFirm(false);
      }
    };
    
    if (authInitialized) {
       checkFirm();
    }
  }, [firmId, authInitialized, isQRMenuUrl]);

  const handleBind = (id: string, data: Firm) => {
    localStorage.setItem('firmId', id);
    setFirmId(id);
    setFirmData(data);
  };

  const handleUnbind = () => {
    localStorage.removeItem('firmId');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setFirmId(null);
    setFirmData(null);
  };

  if (authError) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
              <div className="bg-slate-900 border border-red-500/20 p-8 rounded-2xl max-w-md w-full text-center">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Kimlik Doğrulama Hatası</h2>
                  <p className="text-slate-400 mb-6">{authError}</p>
                  <p className="text-sm text-slate-500 mb-6">
                      Lütfen Firebase konsoluna gidin, <strong>Authentication &gt; Sign-in method</strong> sekmesinden <strong>Anonymous</strong> sağlayıcısını aktifleştirin.
                  </p>
                  <a href="#/admin" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Admin Paneline Git
                  </a>
              </div>
          </div>
      );
  }

  if (!authInitialized || loadingFirm) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Admin route bypasses firm binding
  if (window.location.hash === '#/admin') {
     return (
        <HashRouter>
          <Routes>
            <Route path="/admin" element={<SuperAdminApp />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </HashRouter>
     );
  }

  if (!firmId || !firmData) {
    return <FirmBindingView onBind={handleBind} />;
  }

  return (
    <RestaurantProvider firmId={firmId} firmData={firmData}>
      <InstallPWA />
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainApp firmId={firmId} onUnbind={handleUnbind} />} />
          <Route path="/qrmenu" element={<QRMenuView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </RestaurantProvider>
  );
}
