import React from 'react';
import '../../styles/design-tokens.css';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  onAdminClick?: () => void;
  activePage?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  onAdminClick,
  activePage = 'dashboard'
}) => {
  return (
    <header style={{
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-neutral-300)',
      padding: 'var(--space-3) var(--space-5)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Logo Area */}
      <div style={{
        fontWeight: 'var(--font-weight-bold)',
        fontSize: '16px',
        color: 'var(--color-primary)',
      }}>
        Shop Window
      </div>

      {/* Navigation Items */}
      <nav style={{
        display: 'flex',
        gap: 'var(--space-5)',
        alignItems: 'center'
      }}>
        <button
          onClick={() => onNavigate?.('dashboard')}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: activePage === 'dashboard' ? 'var(--color-primary)' : '#f0f0f0',
            color: activePage === 'dashboard' ? '#ffffff' : 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-base)'
          }}
        >
          Dashboard
        </button>
        
        <button
          onClick={() => onNavigate?.('properties')}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: activePage === 'properties' ? 'var(--color-primary)' : '#f0f0f0',
            color: activePage === 'properties' ? '#ffffff' : 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-base)'
          }}
        >
          Properties
        </button>
        
        <button
          onClick={() => onNavigate?.('reports')}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: activePage === 'reports' ? 'var(--color-primary)' : '#f0f0f0',
            color: activePage === 'reports' ? '#ffffff' : 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-base)'
          }}
        >
          Reports
        </button>
      </nav>

      {/* User Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)'
      }}>
        <button
          onClick={onAdminClick}
          style={{
            backgroundColor: 'var(--color-admin)',
            color: '#ffffff',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-base)'
          }}
        >
          Admin
        </button>
        
        <span style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text)'
        }}>
          Barry Gilbert
        </span>
        
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--color-neutral-300)',
          borderRadius: 'var(--radius-full)',
        }} />
      </div>
    </header>
  );
};