import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { OrderItem, Product } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection, updateDoc, increment } from 'firebase/firestore';

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

  const globalStateRef = React.useRef(globalState);
  useEffect(() => {
    globalStateRef.current = globalState;
  }, [globalState]);

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

  const dispatch = React.useCallback(async (action: any) => {
    const currentState = globalStateRef.current;
    
    switch (action.type) {
      case 'SET_ACTIVE_TABLE': {
        setGlobalState(prev => {
          if (prev.activeTableId === action.payload.tableId) return prev;
          return { ...prev, activeTableId: action.payload.tableId };
        });
        break;
      }
      case 'ADD_ITEM': {
        if (!currentState.activeTableId) return;
        const tableId = currentState.activeTableId;
        const tableOrder = currentState.orders[tableId] || { items: [], totalAmount: 0 };
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
          
          if (action.payload.product.hasStock) {
            await updateDoc(doc(db, 'products', action.payload.product.id), {
              stockCount: increment(-1)
            });
          }
        } catch(e) {
          handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        break;
      }
      case 'REMOVE_ITEM': {
        if (!currentState.activeTableId) return;
        const tableId = currentState.activeTableId;
        const tableOrder = currentState.orders[tableId];
        if (!tableOrder) return;
        
        const removedItem = tableOrder.items.find(item => item.id === action.payload.id);
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
           
           if (removedItem && removedItem.hasStock) {
              await updateDoc(doc(db, 'products', removedItem.id), {
                 stockCount: increment(removedItem.quantity)
              });
           }
        } catch(e) {
           handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        break;
      }
      case 'UPDATE_QUANTITY': {
        if (!currentState.activeTableId) return;
        const tableId = currentState.activeTableId;
        const tableOrder = currentState.orders[tableId];
        if (!tableOrder) return;
        
        const itemToUpdate = tableOrder.items.find(item => item.id === action.payload.id);
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

          if (itemToUpdate && itemToUpdate.hasStock) {
             const quantityDiff = action.payload.quantity - itemToUpdate.quantity;
             await updateDoc(doc(db, 'products', itemToUpdate.id), {
                stockCount: increment(-quantityDiff)
             });
          }
        } catch(e) {
          handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        break;
      }
      case 'CLEAR_ORDER': {
         if (!currentState.activeTableId) return;
         const tableOrderToClear = currentState.orders[currentState.activeTableId];

         try {
           await deleteDoc(doc(db, 'orders', currentState.activeTableId));

           if (tableOrderToClear && tableOrderToClear.items) {
              for (const item of tableOrderToClear.items) {
                 if (item.hasStock) {
                    await updateDoc(doc(db, 'products', item.id), {
                       stockCount: increment(item.quantity)
                    });
                 }
              }
           }
         } catch(e) {
           handleFirestoreError(e, OperationType.DELETE, 'orders');
         }
         break;
      }
    }
  }, []);

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
