import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { OverviewTab } from '../components/property/OverviewTab';
import { TenantsTab } from '../components/property/TenantsTab';
import { apiClient } from '../services/api';
import type { ShoppingCenter } from '../types/models';
import '../styles/design-tokens.css';

/**
 * Property Analysis Page - Complete property detail view with tabs
 * 
 * Route: /property/:id
 * 
 * Features:
 * - Property header with owner/manager info
 * - Tab navigation (Overview, Tenants, Financial, Market, Demographics)
 * - Real-time data from backend API
 * 
 * MVP COMPLETE: Overview + Tenants tabs fully implemented
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/pages/PropertyDetailPage.tsx
 */

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<ShoppingCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'financial' | 'market' | 'demographics'>('tenants');

  // Fetch property data on mount
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('No property ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching property detail for ID: ${id}`);
        
        const propertyData = await apiClient.getShoppingCenter(parseInt(id));
        console.log('Property data loaded:', propertyData);
        
        setProperty(propertyData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        
        if (err.status === 404) {
          setError('Property not found');
        } else if (err.isNetworkError && err.isNetworkError()) {
          setError('Network error. Please check your connection and ensure the backend is running.');
        } else {
          setError('Failed to load property details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Navigation handlers
  const handleNavigation = (page: string) => {
    if (page === 'dashboard') {
      navigate('/');
    } else {
      console.log('Navigate to:', page);
    }
  };

  const handleAdminClick = () => {
    console.log('Navigate to admin portal');
  };

  const handleBreadcrumbClick = (target: 'dashboard' | 'properties') => {
    if (target === 'dashboard') {
      navigate('/');
    } else {
      console.log('Navigate to properties list');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        fontFamily: 'var(--font-family-base)'
      }}>
        <Header
          activePage="properties"
          onNavigate={handleNavigation}
          onAdminClick={handleAdminClick}
        />
        
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #2c5aa0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ 
            fontSize: 'var(--font-size-base)',
            fontStyle: 'italic' 
          }}>
            Loading property details...
          </p>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        fontFamily: 'var(--font-family-base)'
      }}>
        <Header
          activePage="properties"
          onNavigate={handleNavigation}
          onAdminClick={handleAdminClick}
        />
        
        <div style={{
          maxWidth: '600px',
          margin: '60px auto',
          padding: '30px',
          backgroundColor: '#fed7d7',
          border: '1px solid #fc8181',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ 
            fontSize: 'var(--font-size-2xl)', 
            marginBottom: '12px',
            color: '#c53030' 
          }}>
            {error}
          </h2>
          {id && (
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: '#742a2a',
              marginBottom: '24px' 
            }}>
              Property ID: {id}
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2c5aa0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1e3a6f';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#2c5aa0';
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Property not loaded (shouldn't happen, but TypeScript safety)
  if (!property) {
    return null;
  }

  // Main Content - Property Detail View
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      fontFamily: 'var(--font-family-base)'
    }}>
      {/* Header Navigation */}
      <Header
        activePage="properties"
        onNavigate={handleNavigation}
        onAdminClick={handleAdminClick}
      />

      {/* Breadcrumb Navigation */}
      <div style={{
        padding: '15px 25px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        fontSize: '14px',
        color: '#666'
      }}>
        <span 
          onClick={() => handleBreadcrumbClick('dashboard')}
          style={{
            color: '#2c5aa0',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Dashboard
        </span>
        {' > '}
        <span 
          onClick={() => handleBreadcrumbClick('properties')}
          style={{
            color: '#2c5aa0',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Properties
        </span>
        {' > '}
        <span style={{ color: '#666' }}>
          {property.shopping_center_name}
        </span>
      </div>

      {/* Property Header */}
      <div style={{
        margin: '0 30px 25px 30px',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '10px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        {/* Property Information */}
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '10px',
            color: '#2c5aa0',
            lineHeight: 1.2
          }}>
            {property.shopping_center_name}
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '15px'
          }}>
            {property.full_address || `${property.address_city}, ${property.address_state}`}
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {property.center_type && (
              <div style={{
                background: '#e3f2fd',
                color: '#2c5aa0',
                padding: '8px 15px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500
              }}>
                {property.center_type}
              </div>
            )}
            
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              {property.owner && `Owner: ${property.owner}`}
              {property.property_manager && ` • Property Manager: ${property.property_manager}`}
              {property.year_built && ` • Year Built: ${property.year_built}`}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button style={{
              padding: '10px 20px',
              background: '#2c5aa0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Open Financial Model
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'white',
              color: '#2c5aa0',
              border: '1px solid #2c5aa0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Compare Properties
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'white',
              color: '#2c5aa0',
              border: '1px solid #2c5aa0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Generate Report
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'white',
              color: '#2c5aa0',
              border: '1px solid #2c5aa0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Update Data
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '3px solid #f0f0f0',
        margin: '0 30px 30px 30px',
        background: 'white'
      }}>
        {(['overview', 'tenants', 'financial', 'market', 'demographics'] as const).map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '18px 30px',
              cursor: 'pointer',
              borderBottom: `4px solid ${activeTab === tab ? '#2c5aa0' : 'transparent'}`,
              fontWeight: 500,
              fontSize: '16px',
              transition: 'all 0.2s',
              color: activeTab === tab ? '#2c5aa0' : '#666',
              background: activeTab === tab ? '#f8f9fa' : 'transparent'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#f8f9fa';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab property={property} />}
        
        {activeTab === 'tenants' && <TenantsTab property={property} />}

        {(activeTab === 'financial' || activeTab === 'market' || activeTab === 'demographics') && (
          <div style={{ padding: '0 30px 40px 30px' }}>
            <div style={{
              padding: '40px',
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #ddd',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                marginBottom: '12px',
                color: '#666' 
              }}>
                Coming Soon
              </h2>
              <p style={{ color: '#666' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab will be available in a future release
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
