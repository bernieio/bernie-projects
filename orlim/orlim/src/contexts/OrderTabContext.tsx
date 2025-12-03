import { createContext, useContext, useState, type ReactNode } from 'react';

export type OrderTab = 'standard' | 'oco' | 'tif';

interface OrderTabContextType {
  activeTab: OrderTab;
  setActiveTab: (tab: OrderTab) => void;
}

const OrderTabContext = createContext<OrderTabContextType | undefined>(undefined);

export function OrderTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<OrderTab>('standard');

  return (
    <OrderTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </OrderTabContext.Provider>
  );
}

export function useOrderTab() {
  const context = useContext(OrderTabContext);
  if (!context) {
    throw new Error('useOrderTab must be used within OrderTabProvider');
  }
  return context;
}

