// src/components/properties/PropertyList.tsx
// Main property listing component - displays shopping centers from backend

import React, { useState, useEffect } from 'react';
import { useAsyncOperation, AsyncStateWrapper } from '../common/ErrorHandling';
import { apiClient } from '../../services/api';
import { ShoppingCenter, ShoppingCenterSearchParams } from '../../types/api';

interface PropertyListProps {
  className?: string;
}

export const PropertyList: React.FC<PropertyListProps> = ({ className = '' }) => {
  const [searchParams, setSearchParams] = useState<ShoppingCenterSearchParams>({
    page: 1,
    page_size: 20,
  });
  
  const { data, loading, error, execute } = useAsyncOperation<{
    results: ShoppingCenter[];
    count: number;
    next: string | null;
    previous: string | null;
  }>();

  // Load data when component mounts or search params change
  useEffect(() => {
    loadProperties();
  }, [searchParams]);

  const loadProperties = async () => {
    await execute(() => apiClient.getShoppingCenters(searchParams));
  };

  const handleSearch = (searchTerm: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: searchTerm,
      page: 1, // Reset to first page on new search
    }));
  };

  const handleFilterChange = (filters: Partial<ShoppingCenterSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...filters,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className={`property-list ${className}`} style={{ padding: '20px' }}>
      {/* Search and Filters */}
      <div style={{ marginBottom: '24px' }}>
        <PropertyFilters 
          searchParams={searchParams}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Results */}
      <AsyncStateWrapper
        data={data}
        loading={loading}
        error={error}
        onRetry={loadProperties}
        loadingMessage="Loading properties..."
        emptyMessage="No properties found matching your criteria"
      >
        {(propertyData) => (
          <div>
            {/* Results header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
                Shopping Centers
              </h2>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {propertyData.count} properties found
              </span>
            </div>

            {/* Property cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {propertyData.results.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>

            {/* Pagination */}
            {(propertyData.next || propertyData.previous) && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  disabled={!propertyData.previous}
                  onClick={() => handlePageChange(searchParams.page! - 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: propertyData.previous ? '#3b82f6' : '#e5e7eb',
                    color: propertyData.previous ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: propertyData.previous ? 'pointer' : 'not-allowed'
                  }}
                >
                  ← Previous
                </button>
                
                <span style={{ color: '#6b7280' }}>
                  Page {searchParams.page}
                </span>
                
                <button
                  disabled={!propertyData.next}
                  onClick={() => handlePageChange(searchParams.page! + 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: propertyData.next ? '#3b82f6' : '#e5e7eb',
                    color: propertyData.next ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: propertyData.next ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </AsyncStateWrapper>
    </div>
  );
};

// =============================================================================
// PROPERTY CARD COMPONENT
// =============================================================================

interface PropertyCardProps {
  property: ShoppingCenter;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  className = '',
}) => {
  const formatGLA = (gla: number | null | undefined) => {
    if (!gla) return 'N/A';
    return `${gla.toLocaleString()} sq ft`;
  };

  const getQualityBadgeColor = (score: number) => {
    if (score >= 80) return { bg: '#dcfce7', color: '#15803d' };
    if (score >= 60) return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#fecaca', color: '#dc2626' };
  };

  const qualityColors = getQualityBadgeColor(property.data_quality_score);

  return (
    <div 
      className={`property-card ${className}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Property Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            lineHeight: '1.3'
          }}>
            {property.shopping_center_name}
          </h3>
          {property.center_type && (
            <span style={{
              fontSize: '12px',
              padding: '4px 8px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              borderRadius: '4px',
              fontWeight: 500
            }}>
              {property.center_type}
            </span>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div style={{ marginBottom: '16px' }}>
        {/* Address */}
        {(property.address_city || property.address_state) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <span>📍</span>
            <span>
              {property.address_city ? `${property.address_city}, ` : ''}{property.address_state}
            </span>
          </div>
        )}

        {/* GLA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <span>🏢</span>
          <span>{formatGLA(property.total_gla)}</span>
        </div>

        {/* Tenant Count */}
        {property.tenant_count !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <span>🏪</span>
            <span>{property.tenant_count} tenant{property.tenant_count !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Vacancy Rate */}
        {property.vacancy_rate !== null && property.vacancy_rate !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <span>📊</span>
            <span>{property.vacancy_rate}% vacancy</span>
          </div>
        )}
      </div>

      {/* Property Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f3f4f6'
      }}>
        {/* Data Quality Score */}
        <span style={{
          padding: '4px 8px',
          backgroundColor: qualityColors.bg,
          color: qualityColors.color,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {property.data_quality_score}% Complete
        </span>

        {/* Year Built */}
        {property.year_built && (
          <span style={{
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            Built {property.year_built}
          </span>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// PROPERTY FILTERS COMPONENT
// =============================================================================

interface PropertyFiltersProps {
  searchParams: ShoppingCenterSearchParams;
  onSearchChange: (searchTerm: string) => void;
  onFilterChange: (filters: Partial<ShoppingCenterSearchParams>) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  searchParams,
  onSearchChange,
  onFilterChange,
}) => {
  const states = [
    '', 'CA', 'TX', 'NY', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MD', 'MO', 'WI'
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      {/* Search Input */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#374151',
          marginBottom: '6px' 
        }}>
          Search Properties
        </label>
        <input
          type="text"
          placeholder="Search by name or city..."
          value={searchParams.search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* State Filter */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#374151',
          marginBottom: '6px' 
        }}>
          State
        </label>
        <select
          value={searchParams.address_state || ''}
          onChange={(e) => onFilterChange({ 
            address_state: e.target.value || undefined 
          })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="">All States</option>
          {states.slice(1).map(state => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Quality Score Filter */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#374151',
          marginBottom: '6px' 
        }}>
          Data Quality
        </label>
        <select
          value={searchParams.min_quality_score || ''}
          onChange={(e) => onFilterChange({ 
            min_quality_score: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Any Quality</option>
          <option value="80">80%+ (High)</option>
          <option value="60">60%+ (Medium)</option>
          <option value="40">40%+ (Low)</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      <div style={{ display: 'flex', alignItems: 'end' }}>
        <button
          onClick={() => {
            onSearchChange('');
            onFilterChange({
              address_state: undefined,
              min_quality_score: undefined,
            });
          }}
          style={{
            padding: '9px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};