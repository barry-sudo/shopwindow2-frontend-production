import React, { useState } from 'react';
import { ImportModal } from '../admin/ImportModal';
import '../../styles/design-tokens.css';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  onAdminClick?: () => void;
  onImportSuccess?: () => void; // NEW: Optional callback to refresh data after successful import
  activePage?: string;
}

/**
 * Header Component
 * 
 * Main navigation header for Shop Window application.
 * Displays logo, navigation buttons, and user area with admin access.
 * 
 * UPDATED: Now includes Data Import button that opens the CSV import modal.
 * The import functionality is part of regular navigation rather than admin-only,
 * since importing data is a core workflow activity for building the property database.
 */
export const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  onAdminClick,
  onImportSuccess, // NEW: Callback from parent component to refresh data after import
  activePage = 'dashboard'
}) => {
  // State management for the import modal
  // When true, the modal overlay appears; when false, it's hidden
  const [showImportModal, setShowImportModal] = useState(false);

  /**
   * Handle successful import completion
   * Closes the modal and triggers parent component's data refresh callback
   */
  const handleImportSuccess = () => {
    setShowImportModal(false);
    if (onImportSuccess) {
      onImportSuccess();
    }
  };

  return (
    <>
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

          {/* NEW: Data Import Button */}
          {/* 
            This button opens the CSV import modal. It's styled like other navigation
            buttons rather than the admin button, since data import is a regular
            workflow activity. The button doesn't need an activePage check since
            the import modal is an overlay rather than a separate page.
          */}
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: '#f0f0f0',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
          >
            Data Import
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

      {/* Import Modal - Renders as overlay when showImportModal is true */}
      {/*
        The modal is rendered outside the header element so it can overlay
        the entire page. It receives:
        - isOpen: Controls visibility
        - onClose: Closes modal and resets state
        - onImportSuccess: Handles successful import by closing modal and refreshing data
      */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};