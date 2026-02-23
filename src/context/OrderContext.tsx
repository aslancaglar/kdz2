import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrderItem } from '../types/order';

const STORAGE_KEY = 'karadeniz_order_items';

interface OrderContextType {
  orderItems: OrderItem[];
  addToOrder: (item: OrderItem) => void;
  removeFromOrder: (itemId: string) => void;
  clearOrder: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function loadOrderItems(): OrderItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load order items from localStorage:', error);
  }
  return [];
}

function saveOrderItems(items: OrderItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save order items to localStorage:', error);
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(loadOrderItems);

  useEffect(() => {
    saveOrderItems(orderItems);
  }, [orderItems]);

  const addToOrder = (item: OrderItem) => {
    setOrderItems(prev => [...prev, item]);
  };

  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getItemCount = () => {
    return orderItems.length;
  };

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        addToOrder,
        removeFromOrder,
        clearOrder,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
