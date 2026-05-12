import React, { useState } from 'react';
import { TablesView } from './TablesView';
import { OrderingView } from './OrderingView';
import { Table } from '../../context/RestaurantContext';

interface POSViewProps {
  onLogout: () => void;
  onViewChange: (view: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({ onLogout, onViewChange }) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  if (!selectedTable) {
      return <TablesView onSelectTable={setSelectedTable} onLogout={onLogout} onViewChange={onViewChange} />;
  }

  return <OrderingView table={selectedTable} onBack={() => setSelectedTable(null)} onLogout={onLogout} onViewChange={onViewChange} />;
};
