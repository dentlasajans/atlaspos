import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Firm } from '../../types';
import { signOut } from 'firebase/auth';
import { Building2, Key, Users, Settings, LogOut, Plus, Trash2, ShieldCheck, Mail, Calendar } from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
    const [firms, setFirms] = useState<Firm[]>([]);
    const [isAddingFirm, setIsAddingFirm] = useState(false);
    const [newFirm, setNewFirm] = useState<Partial<Firm> & { adminName?: string, adminPin?: string }>({ 
        plan: 'basic', 
        isActive: true, 
        firmCode: '',
        adminName: '',
        adminPin: '',
        licenseStartDate: Date.now(), 
        licenseEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days default
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'firms'), (snapshot) => {
            const firmsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Firm));
            setFirms(firmsData);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const generateFirmCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleAddFirm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const id = crypto.randomUUID();
            const firmCode = newFirm.firmCode || generateFirmCode();

            const firmData: Firm = {
                id,
                name: newFirm.name || 'Yeni Firma',
                adminEmail: newFirm.adminEmail || '', // keeping it for record if needed or empty
                firmCode: firmCode,
                plan: newFirm.plan || 'basic',
                isActive: newFirm.isActive !== false,
                licenseStartDate: newFirm.licenseStartDate || Date.now(),
                licenseEndDate: newFirm.licenseEndDate || Date.now() + 30 * 24 * 60 * 60 * 1000,
                createdAt: Date.now()
            };

            await setDoc(doc(db, 'firms', id), firmData);

            // Create default admin user for this firm
            if (newFirm.adminName && newFirm.adminPin) {
                const adminUserId = 'admin_' + Date.now();
                await setDoc(doc(db, 'firms', id, 'appusers', adminUserId), {
                    name: newFirm.adminName,
                    pin: newFirm.adminPin,
                    role: 'admin'
                });
            }

            setIsAddingFirm(false);
            setNewFirm({ plan: 'basic', isActive: true, firmCode: '', adminName: '', adminPin: '', licenseStartDate: Date.now(), licenseEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000 });
        } catch (error) {
            console.error("Firma eklenirken hata: ", error);
            alert("Kullanıcı/Firma oluşturulamadı! Hata: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const handleDeleteFirm = async (id: string) => {
        if (window.confirm('Bu firmayı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteDoc(doc(db, 'firms', id));
            } catch (error) {
                console.error("Firma silinirken hata: ", error);
            }
        }
    };

    const toggleFirmStatus = async (firm: Firm) => {
        try {
            await setDoc(doc(db, 'firms', firm.id), { isActive: !firm.isActive }, { merge: true });
        } catch (error) {
            console.error("Durum güncellenirken hata:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-900 border-r border-white/5 flex flex-col hidden md:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight">AtlasPOS</h2>
                            <p className="text-xs text-slate-400">Yönetim Paneli</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500/10 text-purple-400 rounded-xl font-medium transition-colors">
                        <Building2 className="w-5 h-5" />
                        Firmalar
                    </button>
                    {/* Placeholder items for future scale */}
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-xl font-medium transition-colors">
                        <Users className="w-5 h-5" />
                        Tüm Kullanıcılar
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-xl font-medium transition-colors">
                        <Settings className="w-5 h-5" />
                        Sistem Ayarları
                    </button>
                </nav>
                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl font-medium transition-colors">
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-purple-400" />
                    <h2 className="font-bold text-lg">AtlasPOS Admin</h2>
                </div>
                <button onClick={handleLogout} className="p-2 text-red-400 bg-red-400/10 rounded-lg">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Lisans ve Firma Yönetimi</h1>
                        <p className="text-slate-400 mt-1">Sisteme kayıtlı işletmeleri ve lisans durumlarını yönetin.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddingFirm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Firma Ekle
                    </button>
                </div>

                {isAddingFirm && (
                    <div className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-400" />
                                Yeni Firma Tanımla
                            </h2>
                            <button onClick={() => setIsAddingFirm(false)} className="text-slate-400 hover:text-white p-2">
                                Kapat
                            </button>
                        </div>
                        <form onSubmit={handleAddFirm} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Firma Adı</label>
                                <input required type="text" value={newFirm.name || ''} onChange={e => setNewFirm({...newFirm, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Örn: Lezzet Restoranı" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Firma Kodu</label>
                                <input type="text" value={newFirm.firmCode || ''} onChange={e => setNewFirm({...newFirm, firmCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 8)})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-mono" placeholder="Boş bırakırsanız otomatik oluşturulur" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici Adı Soyadı</label>
                                <input required type="text" value={newFirm.adminName || ''} onChange={e => setNewFirm({...newFirm, adminName: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Örn: Ahmet Yılmaz" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici PIN Kodu</label>
                                <input required type="text" value={newFirm.adminPin || ''} onChange={e => setNewFirm({...newFirm, adminPin: e.target.value.replace(/[^0-9]/g, '').slice(0, 8)})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest" placeholder="4-8 Haneli PIN (Örn: 1234)" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici E-posta (İsteğe Bağlı)</label>
                                <input type="email" value={newFirm.adminEmail || ''} onChange={e => setNewFirm({...newFirm, adminEmail: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="admin@firma.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Lisans Planı</label>
                                <select value={newFirm.plan} onChange={e => setNewFirm({...newFirm, plan: e.target.value as any})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500">
                                    <option value="basic">Basic Plan</option>
                                    <option value="pro">Pro Plan</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Lisans Bitiş Tarihi</label>
                                <input 
                                    required 
                                    type="date" 
                                    value={newFirm.licenseEndDate ? new Date(newFirm.licenseEndDate).toISOString().split('T')[0] : ''} 
                                    onChange={e => setNewFirm({...newFirm, licenseEndDate: new Date(e.target.value).getTime()})} 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" 
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={newFirm.isActive} onChange={() => setNewFirm({...newFirm, isActive: !newFirm.isActive})} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                  <span className="ml-3 text-sm font-medium text-slate-300">Aktif</span>
                                </label>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-400 transition-colors">
                                    Firmayı Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {firms.length === 0 ? (
                        <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Henüz firma yok</h3>
                            <p className="text-slate-400">Sisteme kayıtlı hiç firma bulunamadı. Yeni bir firma ekleyerek başlayın.</p>
                        </div>
                    ) : (
                        firms.map(firm => (
                            <div key={firm.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                                {/* Decorator Line */}
                                <div className={`absolute top-0 left-0 w-full h-1 ${firm.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-100">{firm.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5 text-sm">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <span className="text-slate-400">{firm.adminEmail}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                        firm.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                        firm.plan === 'pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                        'bg-slate-800 text-slate-300 border-white/10'
                                    }`}>
                                        {firm.plan.toUpperCase()}
                                    </span>
                                </div>

                                <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Firma Kodu</span>
                                        <Building2 className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="font-mono text-xl font-bold text-slate-200 tracking-widest select-all bg-white/5 px-3 py-2 rounded-lg text-center border border-white/5 shadow-inner">
                                        {firm.firmCode}
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Kayıt: {new Date(firm.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div className={`font-semibold ${firm.licenseEndDate && firm.licenseEndDate < Date.now() ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            Bitiş: {firm.licenseEndDate ? new Date(firm.licenseEndDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => toggleFirmStatus(firm)}
                                            className={`p-2 rounded-lg transition-colors ${firm.isActive ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                                            title={firm.isActive ? "Pasife Al" : "Aktife Al"}
                                        >
                                            <ShieldCheck className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteFirm(firm.id)}
                                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                                            title="Firmayı Sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
