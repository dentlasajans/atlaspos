import React, { useState, useEffect } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { formatCurrency } from '../../lib/utils';
import { OrderItem } from '../../types';
import { ArrowLeft, Clock, CalendarDays, Calendar as CalendarMonth, Wallet, CreditCard, Banknote, TrendingUp } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

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

export const CashRegisterView: React.FC<CashRegisterViewProps> = ({ onBack }) => {
  const { tables } = useRestaurant();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
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
  }, []);

  const getFilteredSales = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // For weekly, let's say last 7 days including today
    const startOfWeek = startOfToday - (6 * 24 * 60 * 60 * 1000);
    // For monthly, 1st of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter(sale => {
      if (reportPeriod === 'daily') return sale.createdAt >= startOfToday;
      if (reportPeriod === 'weekly') return sale.createdAt >= startOfWeek;
      if (reportPeriod === 'monthly') return sale.createdAt >= startOfMonth;
      return true;
    });
  };

  const filteredSales = getFilteredSales();

  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const cashRevenue = filteredSales.filter(s => s.paymentMethod === 'nakit').reduce((acc, sale) => acc + sale.totalAmount, 0);
  const cardRevenue = filteredSales.filter(s => s.paymentMethod === 'kredi_karti').reduce((acc, sale) => acc + sale.totalAmount, 0);

  // Calculate sold products data out of filtered sales
  const productStats: Record<string, { name: string; quantity: number; totalSold: number }> = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productStats[item.id]) {
        productStats[item.id] = { name: item.name, quantity: 0, totalSold: 0 };
      }
      productStats[item.id].quantity += item.quantity;
      productStats[item.id].totalSold += (item.price * item.quantity);
    });
  });

  const sortedProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);

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
          <header className="mb-6 lg:mb-10 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
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
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
                <button 
                  onClick={() => setReportPeriod('daily')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'daily' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Clock className="w-4 h-4" /> Bugün
                </button>
                <button 
                  onClick={() => setReportPeriod('weekly')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'weekly' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <CalendarDays className="w-4 h-4" /> Bu Hafta
                </button>
                <button 
                  onClick={() => setReportPeriod('monthly')}
                  className={`px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${reportPeriod === 'monthly' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <CalendarMonth className="w-4 h-4" /> Bu Ay
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-8 max-w-6xl mx-auto w-full">
            
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

            {/* Content Switcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product Stats */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Satılan Ürünler
                </h3>
                {sortedProducts.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-slate-500">
                     Bu dönemde henüz satış yapılmamış.
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/10">
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

              {/* Transactions List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Son İşlemler</h3>
                {filteredSales.slice(0, 15).map(sale => (
                   <div key={sale.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-2">
                       <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">
                             {tables.find(t => t.id === sale.tableId)?.name || `Masa ${sale.tableId}`}
                             <span className="text-xs text-slate-500 ml-2 font-normal">
                               {new Date(sale.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                             {sale.paymentMethod === 'nakit' ? 'Nakit' : 'Kredi Kartı'}
                          </span>
                       </div>
                       <span className="font-mono text-white font-medium">
                          {formatCurrency(sale.totalAmount)}
                       </span>
                   </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
