import React from 'react';
import { useMode } from '../../contexts/ModeContext';
import { DataSourceType } from '../../types/models';

export const Header: React.FC = () => {
  const { mode, toggleMode, isScenarioMode } = useMode();

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo and Title */}
        <div className="header-brand">
          <h1 className="brand-title">Shop Window</h1>
          <span className="brand-subtitle">Retail CRE Intelligence</span>
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle-container">
          <div className="mode-toggle">
            <button
              onClick={toggleMode}
              className={`mode-badge ${isScenarioMode ? 'scenario' : 'verified'}`}
              aria-label={`Switch to ${isScenarioMode ? 'Verified' : 'Scenario'} mode`}
              title={`Currently in ${isScenarioMode ? 'Scenario' : 'Verified'} mode. Click to switch.`}
            >
              {isScenarioMode ? (
                <>
                  <span className="mode-icon">🔧</span>
                  <span className="mode-text">SCENARIO MODE</span>
                </>
              ) : (
                <>
                  <span className="mode-icon">✓</span>
                  <span className="mode-text">VERIFIED DATA</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mode-description">
            {isScenarioMode ? (
              <span className="mode-desc-text">Internal analysis workspace</span>
            ) : (
              <span className="mode-desc-text">Authoritative market data</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
