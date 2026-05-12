import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OrderItem, Product } from '../types';

interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}

type OrderAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; notes?: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_ORDER' };

const initialState: OrderState = {
  items: [],
  totalAmount: 0,
};

const calculateTotal = (items: OrderItem[]) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.product.id && item.notes === action.payload.notes
      );

      let newItems = [...state.items];
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex].quantity += 1;
      } else {
        newItems.push({ ...action.payload.product, quantity: 1, ...action.payload.notes && {notes: action.payload.notes} });
      }

      return { ...state, items: newItems, totalAmount: calculateTotal(newItems) };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload.id);
      return { ...state, items: newItems, totalAmount: calculateTotal(newItems) };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      return { ...state, items: newItems, totalAmount: calculateTotal(newItems) };
    }
    case 'CLEAR_ORDER':
      return initialState;
    default:
      return state;
  }
};

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
} | null>(null);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
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
