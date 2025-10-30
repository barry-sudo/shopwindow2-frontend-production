import React from 'react';
import type { ShoppingCenter } from '../../types/models';
import '../../styles/design-tokens.css';

/**
 * Overview Tab Component - Property Analysis Page
 * 
 * Displays key performance metrics and data notes for a shopping center.
 * Section 2 from wireframe (complete_wireframe_assembly_v3_3.html)
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/property/OverviewTab.tsx
 */

interface OverviewTabProps {
  property: ShoppingCenter;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ property }) => {
  
  // ========================================================================
  // METRIC CALCULATIONS
  // ========================================================================
  
  /**
   * Calculate occupancy rate from backend vacancy_rate
   * Backend provides vacancy_rate (0-100), we need occupancy (0-100)
   */
  const getOccupancyRate = (): string => {
    if (property.vacancy_rate === null || property.vacancy_rate === undefined) {
      return '—';
    }
    const occupancy = 100 - property.vacancy_rate;
    return `${occupancy.toFixed(1)}%`;
  };
  
  /**
   * Calculate weighted average base rent per square foot
   * 
   * Uses rent_per_sq_ft field (already computed by backend)
   * Weighted by square footage: sum(rent_per_sq_ft × SF) / sum(SF)
   * 
   * FIXED: Use rent_per_sq_ft instead of base_rent
   * FIXED: Calculate weighted average for accurate portfolio-level metric
   */
  const getAvgRentPSF = (): string => {
    if (!property.tenants || property.tenants.length === 0) {
      return '—';
    }
    
    // Filter out vacant units and tenants without rent data
    const occupiedTenants = property.tenants.filter(
      tenant => 
        tenant.tenant_name !== 'Vacant' && 
        tenant.rent_per_sq_ft !== null && 
        tenant.square_footage !== null &&
        tenant.square_footage > 0
    );
    
    if (occupiedTenants.length === 0) {
      return '—';
    }
    
    // Calculate weighted average: sum(rent_per_sq_ft × square_footage) for all tenants
    const weightedRentTotal = occupiedTenants.reduce(
      (sum, tenant) => {
        const rentPSF = parseFloat(String(tenant.rent_per_sq_ft || 0));
        const sqft = tenant.square_footage || 0;
        return sum + (rentPSF * sqft);
      }, 
      0
    );
    
    // Total square footage of occupied tenants
    const totalSF = occupiedTenants.reduce(
      (sum, tenant) => sum + (tenant.square_footage || 0), 
      0
    );
    
    if (totalSF === 0) {
      return '—';
    }
    
    // Weighted average rent per SF
    const avgRentPSF = weightedRentTotal / totalSF;
    return `$${avgRentPSF.toFixed(2)}`;
  };
  
  /**
   * Format Total GLA with comma separators
   */
  const formatGLA = (): string => {
    if (!property.total_gla) {
      return '—';
    }
    return property.total_gla.toLocaleString();
  };
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <div style={{ padding: '0 30px 40px 30px' }}>
      {/* Dashboard Grid: 2fr 1fr */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        marginBottom: '30px'
      }}>
        
        {/* LEFT COLUMN: Key Performance Metrics Card */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          border: '1px solid #ddd',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {/* Card Header */}
          <div style={{
            padding: '20px 30px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            fontWeight: 600,
            fontSize: '18px',
            color: '#333'
          }}>
            Key Performance Metrics
          </div>
          
          {/* Card Body */}
          <div style={{ padding: '30px' }}>
            {/* Metrics Grid: 2x2 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '25px'
            }}>
              
              {/* Metric 1: Total GLA (SF) */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: property.total_gla ? '#2c5aa0' : '#999',
                  marginBottom: '8px',
                  fontStyle: property.total_gla ? 'normal' : 'italic'
                }}>
                  {formatGLA()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Total GLA (SF)
                </div>
              </div>
              
              {/* Metric 2: Occupancy Rate */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: property.vacancy_rate !== null ? '#2c5aa0' : '#999',
                  marginBottom: '8px',
                  fontStyle: property.vacancy_rate !== null ? 'normal' : 'italic'
                }}>
                  {getOccupancyRate()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Occupancy Rate
                </div>
              </div>
              
              {/* Metric 3: Avg Base Rent PSF */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: getAvgRentPSF() !== '—' ? '#2c5aa0' : '#999',
                  marginBottom: '8px',
                  fontStyle: getAvgRentPSF() !== '—' ? 'normal' : 'italic'
                }}>
                  {getAvgRentPSF()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Avg Base Rent PSF
                </div>
              </div>
              
              {/* Metric 4: Total Tenants */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#2c5aa0',
                  marginBottom: '8px'
                }}>
                  {property.tenant_count}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Total Tenants
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN: Data Notes Card */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '25px',
          textAlign: 'left',
          maxWidth: '400px'
        }}>
          <div style={{
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '15px',
            color: '#856404'
          }}>
            Data Notes
          </div>
          <div style={{
            fontSize: '14px',
            color: '#856404',
            lineHeight: '1.6'
          }}>
            • Tenant rent data estimated from market comparables (Mar 2024)<br/>
            • Demographics from 2020 Census ACS<br/>
            • Traffic counts verified March 2024<br/>
            • {property.tenant_count - property.occupied_tenant_count} vacant units pending lease verification<br/>
            • Cap rate based on comparable sales analysis
          </div>
        </div>
        
      </div>
    </div>
  );
};
