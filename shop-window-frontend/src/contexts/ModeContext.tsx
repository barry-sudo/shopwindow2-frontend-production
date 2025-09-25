import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface ModeContextType {
  isVerifiedMode: boolean;
  toggleMode: () => void;
  setVerifiedMode: (verified: boolean) => void;
}

// Create context with default values
const ModeContext = createContext<ModeContextType | undefined>(undefined);

// Props for the provider
interface ModeProviderProps {
  children: ReactNode;
}

// Mode Provider component
export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {
  // Default to Verified Mode (true = Verified, false = Scenario)
  const [isVerifiedMode, setIsVerifiedMode] = useState<boolean>(true);

  // Toggle between modes
  const toggleMode = () => {
    setIsVerifiedMode(prev => !prev);
  };

  // Direct setter for mode
  const setVerifiedMode = (verified: boolean) => {
    setIsVerifiedMode(verified);
  };

  // Apply CSS class to body for global styling
  useEffect(() => {
    const body = document.body;
    
    if (isVerifiedMode) {
      body.classList.add('verified-mode');
      body.classList.remove('scenario-mode');
      console.log('🔒 Switched to Verified Mode - Authoritative data display');
    } else {
      body.classList.add('scenario-mode');
      body.classList.remove('verified-mode');
      console.log('📊 Switched to Scenario Mode - Analysis workspace');
    }

    // Cleanup function
    return () => {
      body.classList.remove('verified-mode', 'scenario-mode');
    };
  }, [isVerifiedMode]);

  // Store mode in localStorage for persistence
  useEffect(() => {
    const savedMode = localStorage.getItem('shopwindow_mode');
    if (savedMode !== null) {
      setIsVerifiedMode(savedMode === 'verified');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shopwindow_mode', isVerifiedMode ? 'verified' : 'scenario');
  }, [isVerifiedMode]);

  const contextValue: ModeContextType = {
    isVerifiedMode,
    toggleMode,
    setVerifiedMode,
  };

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  );
};

// Custom hook to use the mode context
export const useModeContext = (): ModeContextType => {
  const context = useContext(ModeContext);
  
  if (context === undefined) {
    throw new Error('useModeContext must be used within a ModeProvider');
  }
  
  return context;
};

// Export the context itself for advanced usage
export { ModeContext };

// Default export
export default ModeProvider;
