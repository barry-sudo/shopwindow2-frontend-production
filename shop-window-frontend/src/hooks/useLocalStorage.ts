import { useState, useEffect } from 'react';

/**
 * Hook for managing localStorage with React state synchronization
 * @param key - The localStorage key
 * @param initialValue - Initial value if no stored value exists
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Handle functional updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Listen for changes in localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing scenario data in localStorage
 * Specifically for Shop Window's scenario mode functionality
 */
export function useScenarioStorage() {
  const [scenarioData, setScenarioData, clearScenarioData] = useLocalStorage<Record<string, any>>(
    'shop-window-scenario-data',
    {}
  );

  const updatePropertyScenario = (propertyId: string, updates: Record<string, any>) => {
    setScenarioData(prev => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        ...updates,
        lastModified: new Date().toISOString()
      }
    }));
  };

  const getPropertyScenario = (propertyId: string) => {
    return scenarioData[propertyId] || {};
  };

  const clearPropertyScenario = (propertyId: string) => {
    setScenarioData(prev => {
      const newData = { ...prev };
      delete newData[propertyId];
      return newData;
    });
  };

  return {
    scenarioData,
    updatePropertyScenario,
    getPropertyScenario,
    clearPropertyScenario,
    clearAllScenarios: clearScenarioData
  };
}