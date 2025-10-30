import React, { useState, useRef } from 'react';
import { apiClient } from '../../services/api';
import '../../styles/design-tokens.css';

/**
 * ImportModal Component
 * 
 * Handles CSV file uploads for importing shopping center and tenant data.
 * Displays three distinct states:
 * 1. Initial state - File selection interface with drag-and-drop styling
 * 2. Uploading state - Loading spinner while backend processes the file
 * 3. Results state - Success/error statistics from the import operation
 * 
 * This is the first modal component in the application and establishes the
 * pattern for modal styling and interaction. The modal uses a fixed overlay
 * that centers the content and prevents interaction with the page beneath it.
 */

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void; // Optional callback to refresh map data after successful import
}

// Define the shape of the backend response to match actual API format
interface ImportStats {
  centers_created: number;
  geocoding_success: number;
  tenants_created: number;
  rows_processed: number;
  errors?: string[];
}

interface ImportResult {
  success: boolean;
  stats: ImportStats;
  message?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  // Component state management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to programmatically trigger file input when user clicks the upload area
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from the file input
   * Validates that the file has a .csv extension before accepting it
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic file validation - check extension
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file (.csv extension required)');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  /**
   * Handle the actual file upload to the backend
   * This function communicates with the /api/v1/imports/csv/ endpoint
   * and manages the loading and result states throughout the process
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Call the API client method that will be added to api.ts
      // The uploadCSV method creates FormData and posts to the imports endpoint
      const response = await apiClient.uploadCSV(selectedFile);
      
      setResult(response);
      setUploading(false);

      // If import was successful and callback provided, trigger parent to refresh data
      if (response.success && onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  /**
   * Reset modal to initial state and close
   * Called when user clicks close button or backdrop
   */
  const handleClose = () => {
    setSelectedFile(null);
    setUploading(false);
    setResult(null);
    setError(null);
    onClose();
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop - Semi-transparent overlay that closes modal when clicked */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        {/* Modal Content - Prevent clicks from closing modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: 'var(--space-5)',
              borderBottom: '1px solid var(--color-neutral-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                margin: 0,
              }}
            >
              Import CSV Data
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--color-neutral-500)',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Modal Body - Content changes based on current state */}
          <div style={{ padding: 'var(--space-5)' }}>
            
            {/* State 1: Initial file selection interface */}
            {!uploading && !result && (
              <>
                {/* Hidden file input - triggered programmatically */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Visual upload area styled like drag-and-drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--color-neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-8)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-neutral-50)',
                    transition: 'var(--transition-base)',
                    marginBottom: 'var(--space-4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-info-bg)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)';
                    e.currentTarget.style.borderColor = 'var(--color-neutral-300)';
                  }}
                >
                  <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-3)' }}>
                    📊
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--color-neutral-700)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
                    Supports shopping center and tenant data
                  </div>
                </div>

                {/* Error message display */}
                {error && (
                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-error-bg)',
                      color: '#742a2a',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      marginBottom: 'var(--space-4)',
                      border: '1px solid var(--color-error-light)',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      backgroundColor: 'white',
                      color: 'var(--color-neutral-700)',
                      border: '1px solid var(--color-neutral-300)',
                      borderRadius: 'var(--radius-base)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      cursor: 'pointer',
                      transition: 'var(--transition-base)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      backgroundColor: selectedFile ? 'var(--color-primary)' : 'var(--color-neutral-300)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      cursor: selectedFile ? 'pointer' : 'not-allowed',
                      transition: 'var(--transition-base)',
                    }}
                  >
                    Upload & Import
                  </button>
                </div>
              </>
            )}

            {/* State 2: Uploading - Show loading spinner */}
            {uploading && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                {/* CSS spinner animation will be added to design-tokens.css */}
                <div
                  className="spinner"
                  style={{
                    margin: '0 auto var(--space-4)',
                    width: '48px',
                    height: '48px',
                  }}
                />
                <div
                  style={{
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-neutral-700)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Importing data...
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
                  This may take a few seconds. Properties are being geocoded automatically.
                </div>
              </div>
            )}

            {/* State 3: Results - Display import statistics */}
            {result && !uploading && (
              <>
                {/* Success/Error header */}
                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: result.success ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                    color: result.success ? '#22543d' : '#742a2a',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-5)',
                    border: result.success
                      ? '1px solid var(--color-success-light)'
                      : '1px solid var(--color-error-light)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {result.success ? '✓ Import Successful' : '⚠ Import Completed with Issues'}
                  </div>
                  {result.message && (
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>{result.message}</div>
                  )}
                </div>

                {/* Statistics grid - Shows detailed import results */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-5)',
                  }}
                >
                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-neutral-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      Shopping Centers
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {result.stats.centers_created}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      created
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-neutral-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      Geocoding
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-success)',
                      }}
                    >
                      {result.stats.geocoding_success}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      successful
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-neutral-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      Tenants
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {result.stats.tenants_created}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      created
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-neutral-600)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 'var(--space-2)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      Rows Processed
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-neutral-700)',
                      }}
                    >
                      {result.stats.rows_processed}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      total
                    </div>
                  </div>
                </div>

                {/* Display any errors that occurred during import */}
                {result.stats.errors && result.stats.errors.length > 0 && (
                  <div
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--color-warning-bg)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--space-5)',
                      border: '1px solid var(--color-warning-light)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: '#975a16',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      Import Warnings:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', color: '#975a16' }}>
                      {result.stats.errors.map((err, idx) => (
                        <li key={idx} style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Close button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      cursor: 'pointer',
                      transition: 'var(--transition-base)',
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};