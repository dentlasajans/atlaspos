import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Key, Loader2, Building2 } from 'lucide-react';
import { Firm } from '../../types';

interface FirmBindingViewProps {
  onBind: (firmId: string, firmData: Firm) => void;
}

export const FirmBindingView: React.FC<FirmBindingViewProps> = ({ onBind }) => {
  const [firmCode, setFirmCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBind = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(
        collection(db, 'firms'), 
        where('firmCode', '==', firmCode.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Geçersiz Firma Kodu. Lütfen kontrol edip tekrar deneyin.');
        setLoading(false);
        return;
      }

      const firmDoc = querySnapshot.docs[0];
      const firmData = { id: firmDoc.id, ...firmDoc.data() } as Firm;

      if (!firmData.isActive) {
        setError('Bu firmanın hesabı pasif durumdadır. Sistem yöneticisi ile iletişime geçin.');
        setLoading(false);
        return;
      }

      // Check license dates
      const now = Date.now();
      if (firmData.licenseEndDate && firmData.licenseEndDate < now) {
        setError('Lisans süreniz dolmuştur. Lütfen sistem yöneticisi ile iletişime geçin.');
        setLoading(false);
        return;
      }

      onBind(firmDoc.id, firmData);
    } catch (err: any) {
      console.error(err);
      setError('Bağlantı sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md">
            <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
                    <Building2 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Firma Girişi</h1>
                <p className="text-slate-400 text-sm mt-2">Sisteme erişmek için 6 haneli firma kodunuzu girin.</p>
            </div>

            <form onSubmit={handleBind} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm text-center border border-red-500/20 font-medium">
                        {error}
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Firma Kodu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                required
                                value={firmCode}
                                onChange={(e) => setFirmCode(e.target.value.replace(/[^0-9]/g, ''))}
                                className="block w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono tracking-widest text-center"
                                placeholder="Örn: 123456"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !firmCode}
                    className="w-full flex justify-center py-4 px-4 rounded-xl shadow-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-6"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Devam Et'}
                </button>
            </form>
        </div>
    </div>
  );
};
