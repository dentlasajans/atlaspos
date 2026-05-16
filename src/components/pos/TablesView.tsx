import React, { useState } from 'react';
import { useRestaurant, Table, Section } from '../../context/RestaurantContext';
import { useOrder } from '../../context/OrderContext';
import { ArrowLeft, LayoutDashboard, Receipt } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface TablesViewProps {
  selectedSection: Section | null;
  onSelectSection: (section: Section | null) => void;
  onLogout: () => void;
  onViewChange: (view: string) => void;
  onSelectTable: (table: Table) => void;
}

export const TablesView: React.FC<TablesViewProps> = ({ selectedSection, onSelectSection, onLogout, onViewChange, onSelectTable }) => {
  const { sections, tables } = useRestaurant();
  const { globalState } = useOrder();

  return (
    <div className="flex h-[100dvh] bg-transparent overflow-hidden font-sans text-slate-100 flex-col relative w-full">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-8 overflow-hidden">
          <header className="mb-6 lg:mb-10 shrink-0 flex items-center gap-4">
            <button 
              onClick={() => {
                if (selectedSection) onSelectSection(null);
                else onViewChange('selection');
              }} 
              className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight">
                {selectedSection ? selectedSection.name : 'Bölüm'} <span className="font-bold text-orange-400">Seçimi</span>
              </h1>
              <p className="text-slate-400 mt-1">
                {selectedSection ? 'Sipariş almak veya görüntülemek için bir masa seçin.' : 'Lütfen işlem yapmak istediğiniz bölümü seçin.'}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-8 touch-pan-y">
            {!selectedSection ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {sections.length === 0 && (
                    <div className="text-slate-500 col-span-full">Henüz bölüm eklenmemiş. Ayarlar modülünden bölüm ve masa ekleyebilirsiniz.</div>
                 )}
                 {sections.map(section => {
                    const sectionTables = tables.filter(t => t.sectionId === section.id);
                    const occupiedCount = sectionTables.filter(t => globalState.orders[t.id] && globalState.orders[t.id].items.length > 0).length;

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSelectSection(section)}
                            className="group flex flex-col items-center p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors text-center active:scale-95"
                        >
                            <div className="w-20 h-20 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2 text-slate-100">{section.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                                <span>{sectionTables.length} Masa</span>
                                {occupiedCount > 0 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                    <span className="text-orange-400">{occupiedCount} Dolu</span>
                                  </>
                                )}
                            </div>
                        </button>
                    );
                 })}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-3xl">
                 {(() => {
                   const sectionTables = tables.filter(t => t.sectionId === selectedSection.id);
                   if (sectionTables.length === 0) {
                     return <p className="text-slate-500">Bu bölümde henüz masa yok.</p>;
                   }
                   return (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                       {sectionTables.map(table => {
                          const tableOrder = globalState.orders[table.id];
                          const hasOrder = tableOrder && tableOrder.items.length > 0;
                          const total = tableOrder ? tableOrder.totalAmount : 0;
                          
                          return (
                            <button
                                key={table.id}
                                onClick={() => onSelectTable(table)}
                                className={`group border p-4 lg:p-6 rounded-2xl transition-all text-center flex flex-col items-center gap-2 active:scale-95 ${
                                  hasOrder 
                                    ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                                    : 'bg-slate-900 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-transform group-hover:scale-110 ${
                                  hasOrder ? 'bg-orange-500 text-slate-900' : 'bg-slate-800 text-slate-300'
                                }`}>
                                   {table.name.replace('Masa', '').replace('masa', '').trim()}
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className={`font-medium text-sm lg:text-base ${hasOrder ? 'text-orange-400' : 'text-slate-200'}`}>
                                    {table.name}
                                  </span>
                                  {hasOrder && (
                                    <span className="text-xs font-mono font-bold mt-1 text-slate-300 bg-slate-950/50 px-2 py-0.5 rounded-md border border-white/5">
                                      {formatCurrency(total)}
                                    </span>
                                  )}
                                </div>
                            </button>
                          );
                       })}
                     </div>
                   );
                 })()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
