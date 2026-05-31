import React, { useState, useEffect } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { formatCurrency } from '../../lib/utils';
import { OrderItem } from '../../types';
import { ArrowLeft, Clock, CalendarDays, Calendar as CalendarMonth, Wallet, CreditCard, Banknote, TrendingUp, Users, BarChart3, Activity } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface Sale {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'nakit' | 'kredi_karti';
  createdAt: number;
}

interface CashRegisterViewProps {
  onBack: () => void;
}

type ReportPeriod = 'daily' | 'yesterday' | 'weekly' | 'monthly' | 'custom';

export const CashRegisterView: React.FC<CashRegisterViewProps> = ({ onBack }) => {
  const { tables, firmId } = useRestaurant();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('daily');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    if (!firmId) return;

    const q = query(collection(db, 'firms', firmId, 'sales'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedSales: Sale[] = [];
      snapshot.forEach(docSnap => {
        try {
          const data = docSnap.data();
          loadedSales.push({
            id: docSnap.id,
            tableId: data.tableId,
            items: JSON.parse(data.items || '[]'),
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            createdAt: data.createdAt
          });
        } catch (e) {
          console.error("Parse error for sale", docSnap.id, e);
        }
      });
      setSales(loadedSales);
      setIsLoading(false);
    }, error => handleFirestoreError(error, OperationType.LIST, 'sales'));

    return unsub;
  }, [firmId]);

  const getFilteredSales = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - (24 * 60 * 60 * 1000);
    const endOfYesterday = startOfToday - 1;
    const startOfWeek = startOfToday - (6 * 24 * 60 * 60 * 1000); // Last 7 days
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter(sale => {
      if (reportPeriod === 'daily') return sale.createdAt >= startOfToday;
      if (reportPeriod === 'yesterday') return sale.createdAt >= startOfYesterday && sale.createdAt <= endOfYesterday;
      if (reportPeriod === 'weekly') return sale.createdAt >= startOfWeek;
      if (reportPeriod === 'monthly') return sale.createdAt >= startOfMonth;
      if (reportPeriod === 'custom') {
         if (!customStartDate) return true;
         const start = new Date(customStartDate).getTime();
         const end = customEndDate ? new Date(customEndDate).getTime() + (24 * 60 * 60 * 1000) - 1 : new Date().getTime();
         return sale.createdAt >= start && sale.createdAt <= end;
      }
      return true;
    });
  };

  const filteredSales = getFilteredSales();

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const cashRevenue = filteredSales.filter(s => s.paymentMethod === 'nakit').reduce((acc, sale) => acc + sale.totalAmount, 0);
  const cardRevenue = filteredSales.filter(s => s.paymentMethod === 'kredi_karti').reduce((acc, sale) => acc + sale.totalAmount, 0);

  // Calculate sold products data and personnel data
  const productStats: Record<string, { name: string; quantity: number; totalSold: number }> = {};
  const personnelStats: Record<string, { id: string; name: string; itemsSold: number; totalRevenue: number; soldProducts: Record<string, number> }> = {};
  
  // For Hourly Analysis
  const hourlyDataMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyDataMap[i] = 0;

  // For Weekly Density Graph
  const weeklyDataMap: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 0:0 }; // 0 is Sunday in JS Date

  filteredSales.forEach(sale => {
    // Add to weekly density based on sale creation (or could use item addition, sale is easier for density)
    const saleDate = new Date(sale.createdAt);
    weeklyDataMap[saleDate.getDay()] += sale.totalAmount;

    sale.items.forEach(item => {
      // Products
      if (!productStats[item.id]) {
        productStats[item.id] = { name: item.name, quantity: 0, totalSold: 0 };
      }
      productStats[item.id].quantity += item.quantity;
      const itemTotal = (item.price * item.quantity);
      productStats[item.id].totalSold += itemTotal;

      // Personnel
      if (item.addedBy && item.addedBy.id) {
         const pId = item.addedBy.id;
         if (!personnelStats[pId]) {
            personnelStats[pId] = { id: pId, name: item.addedBy.name, itemsSold: 0, totalRevenue: 0, soldProducts: {} };
         }
         personnelStats[pId].itemsSold += item.quantity;
         personnelStats[pId].totalRevenue += itemTotal;
         
         if(!personnelStats[pId].soldProducts[item.name]) {
             personnelStats[pId].soldProducts[item.name] = 0;
         }
         personnelStats[pId].soldProducts[item.name] += item.quantity;
      }

      // Hourly Income
      const timeToUse = item.addedAt || sale.createdAt;
      const hour = new Date(timeToUse).getHours();
      hourlyDataMap[hour] += itemTotal;
    });
  });

  const sortedProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
  const sortedPersonnel = Object.values(personnelStats).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const hourlyChartData = Object.keys(hourlyDataMap).map(h => ({
      hour: `${h}:00`,
      gelir: hourlyDataMap[parseInt(h)]
  }));

  const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const weeklyChartData = [1, 2, 3, 4, 5, 6, 0].map(dayIndex => ({
       gun: daysOfWeek[dayIndex],
       yogunluk: weeklyDataMap[dayIndex]
  }));

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center p-8 text-slate-100">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-transparent overflow-hidden font-sans text-slate-100 flex-col relative w-full">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-8 overflow-hidden">
          <header className="mb-6 lg:mb-10 shrink-0 flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full xl:w-auto">
              <button 
                onClick={onBack} 
                className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Kasa <span className="font-bold text-blue-400">Raporları</span></h1>
                <p className="text-slate-400 mt-1">Özet ve detaylı satış raporları</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
                  <button 
                    onClick={() => setReportPeriod('daily')}
                    className={`px-4 lg:px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'daily' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <Clock className="w-4 h-4" /> Bugün
                  </button>
                  <button 
                    onClick={() => setReportPeriod('yesterday')}
                    className={`px-4 lg:px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'yesterday' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <Clock className="w-4 h-4" /> Dün
                  </button>
                  <button 
                    onClick={() => setReportPeriod('weekly')}
                    className={`px-4 lg:px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'weekly' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <CalendarDays className="w-4 h-4" /> Bu Hafta
                  </button>
                  <button 
                    onClick={() => setReportPeriod('monthly')}
                    className={`px-4 lg:px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'monthly' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <CalendarMonth className="w-4 h-4" /> Bu Ay
                  </button>
                  <button 
                    onClick={() => setReportPeriod('custom')}
                    className={`px-4 lg:px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'custom' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      <CalendarMonth className="w-4 h-4" /> Özel
                  </button>
              </div>

              {reportPeriod === 'custom' && (
                <div className="flex items-center gap-2">
                   <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                   <span className="text-slate-400">-</span>
                   <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-8 max-w-7xl mx-auto w-full">
            
            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
                 <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Wallet className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                    <h3 className="text-slate-400 text-sm font-medium">Toplam Ciro</h3>
                    <p className="text-2xl font-mono text-white font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                 </div>
               </div>
               
               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
                 <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Banknote className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                    <h3 className="text-slate-400 text-sm font-medium">Nakit Tahsilat</h3>
                    <p className="text-2xl font-mono text-emerald-400 font-bold mt-1">{formatCurrency(cashRevenue)}</p>
                 </div>
               </div>

               <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
                 <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                 </div>
                 <div>
                    <h3 className="text-slate-400 text-sm font-medium">Kredi Kartı</h3>
                    <p className="text-2xl font-mono text-purple-400 font-bold mt-1">{formatCurrency(cardRevenue)}</p>
                 </div>
               </div>
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Income Graph */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Saatlik Gelir Analizi (Sipariş Saati)
                    </h3>
                    <div className="h-[300px] w-full min-w-0 min-h-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
                                <Tooltip 
                                   cursor={{fill: '#ffffff05'}}
                                   contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px'}}
                                   formatter={(value: number) => [formatCurrency(value), 'Gelir']}
                                />
                                <Bar dataKey="gelir" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Density Graph */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Haftalık Yoğunluk (Ciro)
                    </h3>
                    <div className="h-[300px] w-full min-w-0 min-h-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="gun" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
                                <Tooltip 
                                   contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px'}}
                                   formatter={(value: number) => [formatCurrency(value), 'Ciro']}
                                />
                                <Line type="monotone" dataKey="yogunluk" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Product Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Satılan Ürünler
                </h3>
                {sortedProducts.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-slate-500">
                     Bu dönemde henüz satış yapılmamış.
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                      <thead className="sticky top-0 bg-slate-900 border-b border-white/10">
                        <tr>
                           <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ürün</th>
                           <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Adet</th>
                           <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sortedProducts.map((stat, i) => (
                           <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-slate-200">{stat.name}</td>
                              <td className="p-4 text-right">
                                <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-lg text-sm">{stat.quantity}</span>
                              </td>
                              <td className="p-4 text-right font-mono text-orange-400 font-medium">
                                {formatCurrency(stat.totalSold)}
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Personnel Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Personel Analizi
                </h3>
                {sortedPersonnel.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-slate-500">
                     Bu dönemde personel satışı kaydedilmemiş.
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                      <thead className="sticky top-0 bg-slate-900 border-b border-white/10">
                        <tr>
                           <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Personel</th>
                           <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Ürünler</th>
                           <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Ciro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sortedPersonnel.map((person, i) => (
                           <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-slate-200">{person.name}</td>
                              <td className="p-4 text-center">
                                 <div className="flex flex-col items-center gap-1 text-xs text-slate-400">
                                     {Object.entries(person.soldProducts).slice(0, 2).map(([pName, pQt], idx) => (
                                         <span key={idx}>{pName} ({pQt})</span>
                                     ))}
                                     {Object.keys(person.soldProducts).length > 2 && (
                                         <span className="text-slate-500 italic">+{Object.keys(person.soldProducts).length - 2} daha...</span>
                                     )}
                                 </div>
                              </td>
                              <td className="p-4 text-right font-mono text-emerald-400 font-medium">
                                {formatCurrency(person.totalRevenue)}
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
