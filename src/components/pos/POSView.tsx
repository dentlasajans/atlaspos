import React, { useState, useEffect } from 'react';
import { TablesView } from './TablesView';
import { OrderingView } from './OrderingView';
import { Table, Section } from '../../context/RestaurantContext';
import { useOrder } from '../../context/OrderContext';

interface POSViewProps {
  onLogout: () => void;
  onViewChange: (view: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({ onLogout, onViewChange }) => {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { dispatch } = useOrder();

  useEffect(() => {
    if (selectedTable) {
      dispatch({ type: 'SET_ACTIVE_TABLE', payload: { tableId: selectedTable.id } });
    } else {
      dispatch({ type: 'SET_ACTIVE_TABLE', payload: { tableId: null } });
    }
  }, [selectedTable, dispatch]);

  if (!selectedTable) {
      return (
        <TablesView 
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          onSelectTable={setSelectedTable} 
          onLogout={onLogout} 
          onViewChange={onViewChange} 
        />
      );
  }

  return <OrderingView table={selectedTable} onBack={() => setSelectedTable(null)} onLogout={onLogout} onViewChange={onViewChange} />;
};
