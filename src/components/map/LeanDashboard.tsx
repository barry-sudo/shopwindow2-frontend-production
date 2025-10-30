import React from 'react';
import type { GeocodedProperty } from '../../types/models';
import '../../styles/design-tokens.css';

/**
 * Lean Dashboard Component - Mini property preview overlay on map
 * 
 * Displays when user clicks a property marker on the map.
 * Shows key metrics and provides quick navigation to full property analysis.
 * 
 * Per wireframe Section 1 specifications.
 * 
 * UPDATED: 2025-10-22 to display avg_base_rent_psf from API
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/map/LeanDashboard.tsx
 */

interface LeanDashboardProps {
  property: GeocodedProperty;
  onClose: () => void;
  onFullAnalysis: (propertyId: number) => void;
}

export const LeanDashboard: React.FC<LeanDashboardProps> = ({
  property,
  onClose,
  onFullAnalysis
}) => {
  // Calculate metrics
  const totalSF = property.total_gla 
    ? property.total_gla.toLocaleString() 
    : '—';
  
  const occupancy = property.vacancy_rate !== undefined && property.vacancy_rate !== null
    ? `${(100 - property.vacancy_rate).toFixed(1)}%`
    : '—';
  
  // FIXED: Read avg_base_rent_psf from property object (comes from backend serializer)
  const avgRentPSF = property.avg_base_rent_psf !== undefined && property.avg_base_rent_psf !== null
    ? `$${property.avg_base_rent_psf.toFixed(2)}`
    : '—';
  
  const tenantCount = property.tenant_count !== undefined && property.tenant_count !== null
    ? property.tenant_count 
    : '—';

  return (
    <div style={{
      position: 'absolute',
      bottom: '25px',
      left: '25px',
      right: '25px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      padding: '25px',
      border: '1px solid #ddd',
      zIndex: 1000
    }}>
      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        {/* Left: Property Info */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#2c5aa0',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: 1.2
          }}>
            {property.shopping_center_name}
          </h3>
          
          <p style={{
            margin: '0 0 4px 0',
            color: '#666',
            fontSize: '14px'
          }}>
            {property.full_address || `${property.address_street || ''}, ${property.address_city}, ${property.address_state}`}
            {property.center_type && ` • ${property.center_type}`}
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 15px',
              border: '1px solid #ddd',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              color: '#666',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            ✕
          </button>
          
          <button
            onClick={() => onFullAnalysis(property.id)}
            style={{
              padding: '8px 15px',
              background: '#2c5aa0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#1e3a6f';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(44,90,160,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#2c5aa0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Full Analysis
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        {/* Metric 1: Total SF */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#2c5aa0',
            marginBottom: '5px'
          }}>
            {totalSF}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Total SF
          </div>
        </div>

        {/* Metric 2: Occupancy */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#2c5aa0',
            marginBottom: '5px'
          }}>
            {occupancy}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Occupancy
          </div>
        </div>

        {/* Metric 3: Avg Rent PSF */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#2c5aa0',
            marginBottom: '5px'
          }}>
            {avgRentPSF}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Avg Rent PSF
          </div>
        </div>

        {/* Metric 4: Tenants */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#2c5aa0',
            marginBottom: '5px'
          }}>
            {tenantCount}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Tenants
          </div>
        </div>
      </div>
    </div>
  );
};