import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DataSourceType, ModeContext as IModeContext } from '../types/models';

// Context definition
const ModeContext = createContext<IModeContext | undefined>(undefined);

// Hook for consuming the mode context
export const useMode = (): IModeContext => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

interface ModeProviderProps {
  children: ReactNode;
  defaultMode?: DataSourceType;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ 
  children, 
  defaultMode = DataSourceType.VERIFIED 
}) => {
  const [mode, setMode] = useState<DataSourceType>(defaultMode);

  const toggleMode = useCallback(() => {
    setMode(prevMode => 
      prevMode === DataSourceType.VERIFIED 
        ? DataSourceType.SCENARIO 
        : DataSourceType.VERIFIED
    );
  }, []);

  const isScenarioMode = mode === DataSourceType.SCENARIO;

  // Apply mode-specific CSS custom properties to document root
  React.useEffect(() => {
    const root = document.documentElement;
    
    if (isScenarioMode) {
      // Apply scenario mode CSS variables
      root.style.setProperty('--current-mode-primary', 'var(--color-scenario)');
      root.style.setProperty('--current-mode-bg', 'var(--color-scenario-bg)');
      root.style.setProperty('--current-mode-border', 'var(--color-scenario-border)');
      root.style.setProperty('--current-mode-hover', 'var(--color-scenario-hover)');
      
      // Add scenario mode class to body for component-level styling
      document.body.classList.add('scenario-mode');
      document.body.classList.remove('verified-mode');
      
      console.log('🔧 Switched to Scenario Mode - Analysis workspace activated');
    } else {
      // Apply verified mode CSS variables
      root.style.setProperty('--current-mode-primary', 'var(--color-primary)');
      root.style.setProperty('--current-mode-bg', '#ffffff');
      root.style.setProperty('--current-mode-border', 'var(--color-neutral-200)');
      root.style.setProperty('--current-mode-hover', 'var(--color-primary-hover)');
      
      // Add verified mode class to body
      document.body.classList.add('verified-mode');
      document.body.classList.remove('scenario-mode');
      
      console.log('✅ Switched to Verified Mode - Authoritative data display');
    }
  }, [isScenarioMode]);

  const contextValue: IModeContext = {
    mode,
    toggleMode,
    isScenarioMode
  };

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
};