import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { OrderItem, Product } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}

interface GlobalOrderState {
  activeTableId: string | null;
  orders: Record<string, OrderState>;
}

const OrderContext = createContext<{
  globalState: GlobalOrderState;
  state: OrderState;
  dispatch: (action: any) => void;
} | null>(null);

const calculateTotal = (items: OrderItem[]) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [globalState, setGlobalState] = useState<GlobalOrderState>({
    activeTableId: null,
    orders: {}
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orders: Record<string, OrderState> = {};
      snapshot.forEach(docSnap => {
        try {
           const data = docSnap.data();
           const items = JSON.parse(data.items || '[]');
           orders[docSnap.id] = {
             items,
             totalAmount: data.totalAmount
           };
        } catch (e) {
           console.error("Error parsing order items for", docSnap.id, e);
        }
      });
      setGlobalState(prev => ({ ...prev, orders }));
    }, error => handleFirestoreError(error, OperationType.LIST, 'orders'));

    return unsub;
  }, []);

  const dispatch = async (action: any) => {
    switch (action.type) {
      case 'SET_ACTIVE_TABLE': {
        setGlobalState(prev => ({ ...prev, activeTableId: action.payload.tableId }));
        break;
      }
      case 'ADD_ITEM': {
        if (!globalState.activeTableId) return;
        const tableId = globalState.activeTableId;
        const tableOrder = globalState.orders[tableId] || { items: [], totalAmount: 0 };
        const existingItemIndex = tableOrder.items.findIndex(
          (item) => item.id === action.payload.product.id && item.notes === action.payload.notes
        );

        let newItems = [...tableOrder.items];
        if (existingItemIndex >= 0) {
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + 1
          };
        } else {
          newItems.push({ ...action.payload.product, quantity: 1, ...action.payload.notes && {notes: action.payload.notes} });
        }
        
        const totalAmount = calculateTotal(newItems);
        try {
          await setDoc(doc(db, 'orders', tableId), {
            tableId,
            items: JSON.stringify(newItems),
            totalAmount,
            updatedAt: Date.now()
          });
        } catch(e) {
          handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        break;
      }
      case 'REMOVE_ITEM': {
        if (!globalState.activeTableId) return;
        const tableId = globalState.activeTableId;
        const tableOrder = globalState.orders[tableId];
        if (!tableOrder) return;
        
        const newItems = tableOrder.items.filter((item) => item.id !== action.payload.id);
        const totalAmount = calculateTotal(newItems);
        
        try {
           if (newItems.length === 0) {
             await deleteDoc(doc(db, 'orders', tableId));
           } else {
             await setDoc(doc(db, 'orders', tableId), {
                tableId,
                items: JSON.stringify(newItems),
                totalAmount,
                updatedAt: Date.now()
             });
           }
        } catch(e) {
           handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        break;
      }
      case 'UPDATE_QUANTITY': {
        if (!globalState.activeTableId) return;
        const tableId = globalState.activeTableId;
        const tableOrder = globalState.orders[tableId];
        if (!tableOrder) return;
        
        const newItems = tableOrder.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        );
        const totalAmount = calculateTotal(newItems);
        
        try {
          await setDoc(doc(db, 'orders', tableId), {
            tableId,
            items: JSON.stringify(newItems),
            totalAmount,
            updatedAt: Date.now()
          });
        } catch(e) {
          handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        break;
      }
      case 'CLEAR_ORDER': {
         if (!globalState.activeTableId) return;
         try {
           await deleteDoc(doc(db, 'orders', globalState.activeTableId));
         } catch(e) {
           handleFirestoreError(e, OperationType.DELETE, 'orders');
         }
         break;
      }
    }
  };

  return (
    <OrderContext.Provider value={{
      globalState,
      state: globalState.activeTableId && globalState.orders[globalState.activeTableId] 
        ? globalState.orders[globalState.activeTableId] 
        : { items: [], totalAmount: 0 },
      dispatch
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
