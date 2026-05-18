import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: any) => {
       if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
       } else {
          console.log('User dismissed the install prompt');
       }
    });
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <AnimatePresence>
      {supportsPWA && (
        <motion.div 
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="bg-slate-900 border border-white/10 shadow-2xl p-4 rounded-3xl flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
               <img src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572429/Blue_and_Black_Minimalist_Brand_Logo_20260120_225431_0000_s2isk5.png" alt="Icon" className="w-6 h-6 object-contain" />
             </div>
             <div className="flex-1">
               <h3 className="text-slate-100 font-semibold text-sm">Uygulamayı Yükle</h3>
               <p className="text-slate-400 text-xs">Ana ekrana ekle ve daha hızlı eriş.</p>
             </div>
             <button 
               onClick={onClick}
               className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
             >
               <Download className="w-4 h-4" />
               Yükle
             </button>
             <button 
                onClick={() => setSupportsPWA(false)} 
                className="text-slate-400 hover:text-white p-2"
             >
                ✕
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
