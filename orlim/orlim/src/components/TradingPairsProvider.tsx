import { useState, useMemo, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { TRADING_PAIRS } from '../constants/contracts';
import type { TradingPair, PairTab } from '../types/orlim';

// Create context for trading pairs
interface TradingPairsContextType {
  activeTabs: PairTab[];
  selectedPair: TradingPair;
  selectedPairId: string;
  selectPair: (pairId: string) => void;
  selectPairByTabId: (tabId: string) => void;
  addPairTab: (pair: TradingPair) => void;
  removePairTab: (tabId: string) => void;
}

const TradingPairsContext = createContext<TradingPairsContextType | undefined>(undefined);

/**
 * Provider component for trading pairs context
 */
export function TradingPairsProvider({ children }: { children: ReactNode }) {
  // Initialize with 3 main pairs as pinned tabs
  const [activeTabs, setActiveTabs] = useState<PairTab[]>(() => {
    return TRADING_PAIRS.map((pair, index) => ({
      id: `tab-${index}`,
      pair,
      isPinned: true,
    }));
  });

  // Currently selected pair (default to first pair)
  const [selectedPairId, setSelectedPairId] = useState<string>(() => {
    const tabs = TRADING_PAIRS.map((pair, index) => ({
      id: `tab-${index}`,
      pair,
      isPinned: true,
    }));
    return tabs[0]?.id || '';
  });

  // Get current selected pair
  const selectedPair = useMemo(() => {
    return activeTabs.find((tab) => tab.id === selectedPairId)?.pair || TRADING_PAIRS[0];
  }, [selectedPairId, activeTabs]);

  // Switch to a different pair
  const selectPair = (pairId: string) => {
    const tab = activeTabs.find((t) => t.pair.pool_id === pairId);
    if (tab) {
      setSelectedPairId(tab.id);
    }
  };

  // Switch to a pair by tab ID
  const selectPairByTabId = (tabId: string) => {
    const tab = activeTabs.find((t) => t.id === tabId);
    if (tab) {
      setSelectedPairId(tabId);
    }
  };

  // Add a new pair tab (for future "+ Add Pair" functionality)
  const addPairTab = (pair: TradingPair) => {
    const newTab: PairTab = {
      id: `tab-${Date.now()}`,
      pair,
      isPinned: false,
    };
    setActiveTabs((prev) => [...prev, newTab]);
    setSelectedPairId(newTab.id);
  };

  // Remove a pair tab (for unpinned pairs)
  const removePairTab = (tabId: string) => {
    setActiveTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== tabId);
      // If removing selected tab, switch to first available
      if (selectedPairId === tabId && filtered.length > 0) {
        setSelectedPairId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <TradingPairsContext.Provider
      value={{
        activeTabs,
        selectedPair,
        selectedPairId,
        selectPair,
        selectPairByTabId,
        addPairTab,
        removePairTab,
      }}
    >
      {children}
    </TradingPairsContext.Provider>
  );
}

/**
 * Hook to manage trading pairs and tabs
 */
export function useTradingPairs() {
  const context = useContext(TradingPairsContext);
  if (!context) {
    // Fallback for components not wrapped in provider (shouldn't happen, but safe fallback)
    const defaultTabs: PairTab[] = TRADING_PAIRS.map((pair, index) => ({
      id: `tab-${index}`,
      pair,
      isPinned: true,
    }));
    return {
      activeTabs: defaultTabs,
      selectedPair: TRADING_PAIRS[0],
      selectedPairId: defaultTabs[0]?.id || '',
      selectPair: () => {},
      selectPairByTabId: () => {},
      addPairTab: () => {},
      removePairTab: () => {},
    };
  }
  return context;
}

