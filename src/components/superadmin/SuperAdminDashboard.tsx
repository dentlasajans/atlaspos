import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Firm, AppUser } from '../../types';
import { signOut } from 'firebase/auth';
import { Building2, Key, Users, Settings, LogOut, Plus, Trash2, ShieldCheck, Mail, Calendar, X, Edit, LayoutGrid } from 'lucide-react';

const AVAILABLE_MODULES = [
    { id: 'pos', name: 'Servis (Garson)' },
    { id: 'cashier', name: 'Kasa' },
    { id: 'kitchen', name: 'Mutfak' },
    { id: 'reports', name: 'Raporlar' },
    { id: 'settings', name: 'Ayarlar' }
];

export const SuperAdminDashboard: React.FC = () => {
    const [firms, setFirms] = useState<Firm[]>([]);
    const [selectedFirmForUsers, setSelectedFirmForUsers] = useState<Firm | null>(null);
    const [firmUsers, setFirmUsers] = useState<AppUser[]>([]);
    
    // User Management
    const [editingUser, setEditingUser] = useState<Partial<AppUser> | null>(null);

    // Firm Management
    const [editingFirm, setEditingFirm] = useState<Partial<Firm> & { adminName?: string, adminPin?: string } | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'firms'), (snapshot) => {
            const firmsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Firm));
            setFirms(firmsData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!selectedFirmForUsers) {
            setFirmUsers([]);
            return;
        }
        const unsubscribe = onSnapshot(collection(db, 'firms', selectedFirmForUsers.id, 'appusers'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
            setFirmUsers(usersData);
        });
        return () => unsubscribe();
    }, [selectedFirmForUsers]);

    const handleSaveFirmUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFirmForUsers || !editingUser || !editingUser.name || !editingUser.pin || editingUser.pin.length < 4 || editingUser.pin.length > 8) return;
        try {
            const id = editingUser.id || 'user_' + Date.now();
            await setDoc(doc(db, 'firms', selectedFirmForUsers.id, 'appusers', id), {
                name: editingUser.name,
                pin: editingUser.pin,
                role: editingUser.role || 'waiter',
                modules: editingUser.modules || []
            }, { merge: true });
            setEditingUser(null);
        } catch (error) {
            console.error("Kullanıcı kaydedilirken hata: ", error);
            alert("Kullanıcı kaydedilemedi.");
        }
    };

    const handleDeleteFirmUser = async (userId: string) => {
        if (!selectedFirmForUsers) return;
        if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            try {
                await deleteDoc(doc(db, 'firms', selectedFirmForUsers.id, 'appusers', userId));
            } catch (error) {
                console.error("Kullanıcı silinirken hata:", error);
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const generateLicenseKey = () => {
        const generateSegment = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            return Array(5).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        };
        return `${generateSegment()}-${generateSegment()}-${generateSegment()}`;
    };

    const handleSaveFirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingFirm) return;

        try {
            const id = editingFirm.id || crypto.randomUUID();
            const licenseKey = editingFirm.licenseKey || generateLicenseKey();

            const firmData: Partial<Firm> = {
                name: editingFirm.name || 'Yeni Firma',
                adminEmail: editingFirm.adminEmail || '',
                licenseKey: licenseKey,
                plan: 'pro',
                isActive: editingFirm.isActive !== false,
                licenseStartDate: editingFirm.licenseStartDate || Date.now(),
                licenseEndDate: editingFirm.licenseEndDate || Date.now() + 30 * 24 * 60 * 60 * 1000,
                modules: editingFirm.modules || []
            };

            if (!editingFirm.id) {
                // New firm
                firmData.createdAt = Date.now();
            }

            await setDoc(doc(db, 'firms', id), firmData, { merge: true });

            // Create default admin user for this firm if it's new and has admin details
            if (!editingFirm.id && editingFirm.adminName && editingFirm.adminPin) {
                const adminUserId = 'admin_' + Date.now();
                await setDoc(doc(db, 'firms', id, 'appusers', adminUserId), {
                    name: editingFirm.adminName,
                    pin: editingFirm.adminPin,
                    role: 'admin',
                    modules: editingFirm.modules || []
                });
            }

            setEditingFirm(null);
        } catch (error) {
            console.error("Firma kaydedilirken hata: ", error);
            alert("Firma kaydedilemedi! Hata: " + (error instanceof Error ? error.message : String(error)));
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
                        onClick={() => setEditingFirm({ plan: 'pro', isActive: true, licenseKey: '', adminName: '', adminPin: '', licenseStartDate: Date.now(), licenseEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000, modules: AVAILABLE_MODULES.map(m => m.id) })}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Firma Ekle
                    </button>
                </div>

                {editingFirm && (
                    <div className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-400" />
                                {editingFirm.id ? 'Firmayı Düzenle' : 'Yeni Firma Tanımla'}
                            </h2>
                            <button onClick={() => setEditingFirm(null)} className="text-slate-400 hover:text-white p-2">
                                Kapat
                            </button>
                        </div>
                        <form onSubmit={handleSaveFirm} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Firma Adı</label>
                                <input required type="text" value={editingFirm.name || ''} onChange={e => setEditingFirm({...editingFirm, name: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Örn: Lezzet Restoranı" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Lisans Anahtarı</label>
                                <input type="text" value={editingFirm.licenseKey || ''} onChange={e => setEditingFirm({...editingFirm, licenseKey: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-mono" placeholder="Boş bırakırsanız otomatik oluşturulur" />
                            </div>
                            
                            {!editingFirm.id && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici Adı Soyadı</label>
                                        <input required type="text" value={editingFirm.adminName || ''} onChange={e => setEditingFirm({...editingFirm, adminName: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Örn: Ahmet Yılmaz" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici PIN Kodu</label>
                                        <input required type="text" value={editingFirm.adminPin || ''} onChange={e => setEditingFirm({...editingFirm, adminPin: e.target.value.replace(/[^0-9]/g, '').slice(0, 8)})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest" placeholder="4-8 Haneli PIN (Örn: 1234)" />
                                    </div>
                                </>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici E-posta (İsteğe Bağlı)</label>
                                <input type="email" value={editingFirm.adminEmail || ''} onChange={e => setEditingFirm({...editingFirm, adminEmail: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="admin@firma.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Lisans Bitiş Tarihi</label>
                                <input 
                                    required 
                                    type="date" 
                                    value={editingFirm.licenseEndDate ? new Date(editingFirm.licenseEndDate).toISOString().split('T')[0] : ''} 
                                    onChange={e => setEditingFirm({...editingFirm, licenseEndDate: new Date(e.target.value).getTime()})} 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" 
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> Eklentiler / Modüller</label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {AVAILABLE_MODULES.map(module => (
                                        <label key={module.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-900 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-950"
                                                checked={editingFirm.modules?.includes(module.id)}
                                                onChange={(e) => {
                                                    const current = editingFirm.modules || [];
                                                    const updated = e.target.checked ? [...current, module.id] : current.filter(m => m !== module.id);
                                                    setEditingFirm({...editingFirm, modules: updated});
                                                }}
                                            />
                                            <span className="text-sm font-medium text-slate-300">{module.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={editingFirm.isActive} onChange={() => setEditingFirm({...editingFirm, isActive: !editingFirm.isActive})} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                  <span className="ml-3 text-sm font-medium text-slate-300">Aktif İşletme</span>
                                </label>
                            </div>
                            <div className="md:col-span-2 pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setEditingFirm(null)} className="px-6 py-3 rounded-xl font-semibold text-slate-300 hover:bg-white/5 transition-colors">
                                    İptal
                                </button>
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
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lisans Anahtarı</span>
                                        <Key className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="font-mono text-xl font-bold text-slate-200 tracking-widest select-all bg-white/5 px-3 py-2 rounded-lg text-center border border-white/5 shadow-inner">
                                        {firm.licenseKey}
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
                                            onClick={() => setEditingFirm(firm)}
                                            className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                                            title="Düzenle"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => setSelectedFirmForUsers(firm)}
                                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Kullanıcıları Yönet"
                                        >
                                            <Users className="w-5 h-5" />
                                        </button>
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

            {/* Firm Users Modal */}
            {selectedFirmForUsers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    {selectedFirmForUsers.name} - Kullanıcı Yönetimi
                                </h3>
                            </div>
                            <button onClick={() => setSelectedFirmForUsers(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Add/Edit User Form */}
                            <form onSubmit={handleSaveFirmUser} className="bg-slate-950 p-5 rounded-xl border border-white/5 mb-6 flex flex-col gap-4">
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <h4 className="text-sm font-semibold text-white">{editingUser?.id ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</h4>
                                    {editingUser?.id && (
                                        <button type="button" onClick={() => setEditingUser(null)} className="text-xs text-slate-400 hover:text-white">İptal/Yeni Ekle</button>
                                    )}
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Ad Soyad</label>
                                        <input required type="text" value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Örn: Veli K." />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">PIN Kodu</label>
                                        <input required type="text" value={editingUser?.pin || ''} onChange={e => setEditingUser({...editingUser, pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 8)})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono" placeholder="4-8 Haneli" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Rol</label>
                                        <select value={editingUser?.role || 'waiter'} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                                            <option value="waiter">Garson</option>
                                            <option value="cashier">Kasiyer</option>
                                            <option value="admin">Yönetici</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Erişilebilir Modüller</label>
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_MODULES.filter(m => (selectedFirmForUsers?.modules || []).includes(m.id)).map(module => (
                                            <label key={module.id} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-3 h-3 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-950"
                                                    checked={(editingUser?.modules || []).includes(module.id)}
                                                    onChange={(e) => {
                                                        const current = editingUser?.modules || [];
                                                        const updated = e.target.checked ? [...current, module.id] : current.filter(m => m !== module.id);
                                                        setEditingUser({...editingUser, modules: updated});
                                                    }}
                                                />
                                                <span className="text-xs font-medium text-slate-300">{module.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors whitespace-nowrap">
                                        {editingUser?.id ? 'Güncelle' : 'Kullanıcı Ekle'}
                                    </button>
                                </div>
                            </form>

                            {/* Users List */}
                            <div className="space-y-3">
                                {firmUsers.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 border border-dashed border-white/5 rounded-xl">
                                        Bu firmaya ait henüz kullanıcı yok.
                                    </div>
                                ) : (
                                    firmUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                    user.role === 'cashier' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-slate-800 text-slate-300'
                                                }`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white">{user.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs">
                                                        <span className="text-slate-400 capitalize">{user.role}</span>
                                                        <span className="text-slate-500 flex items-center gap-1 font-mono tracking-widest"><Key className="w-3 h-3"/> {user.pin}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditingUser(user)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Düzenle">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteFirmUser(user.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Kullanıcıyı Sil">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
