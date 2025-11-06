import React, { useState, useMemo } from 'react';
import type { GeocodedProperty } from '../../types/models';
import { CenterTypes } from '../../types/models';
import '../../styles/design-tokens.css';

/**
 * FilterSidebar Component - Map search filters
 * 
 * UPDATED: 2025-11-05 - Changed Shopping Center Type to use predefined categories
 * instead of dynamic extraction from properties data
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/map/FilterSidebar.tsx
 */

interface FilterSidebarProps {
  properties: GeocodedProperty[];
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  centerType: string;
  owner: string;
  propertyManagement: string;
  state: string;
  county: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  properties, 
  onFilterChange 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    centerType: '',
    owner: '',
    propertyManagement: '',
    state: '',
    county: ''
  });

  // Extract unique values from properties for each filter
  // NOTE: centerTypes now uses predefined array instead of dynamic extraction
  const filterOptions = useMemo(() => {
    const owners = new Set<string>();
    const propertyManagers = new Set<string>();
    const states = new Set<string>();
    const counties = new Set<string>();

    properties.forEach(property => {
      if (property.owner) owners.add(property.owner);
      if (property.property_manager) propertyManagers.add(property.property_manager);
      if (property.address_state) states.add(property.address_state);
      if (property.county) counties.add(property.county);
    });

    return {
      centerTypes: [...CenterTypes], // Use predefined categories from models.ts
      owners: Array.from(owners).sort(),
      propertyManagers: Array.from(propertyManagers).sort(),
      states: Array.from(states).sort(),
      counties: Array.from(counties).sort()
    };
  }, [properties]);

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      padding: '25px',
      border: '1px solid var(--color-neutral-300)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      height: 'fit-content'
    }}>
      {/* Filter Header */}
      <h3 style={{
        fontWeight: 'var(--font-weight-semibold)',
        fontSize: 'var(--font-size-lg)',
        marginBottom: '25px',
        color: 'var(--color-primary)',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '15px',
        margin: '0 0 25px 0'
      }}>
        Map Search Options
      </h3>

      {/* Shopping Center Type */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '10px',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          display: 'block'
        }}>
          Shopping Center Type
        </label>
        <select
          value={filters.centerType}
          onChange={(e) => handleFilterChange('centerType', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
        >
          <option value="">— Clear Selection —</option>
          {filterOptions.centerTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Owner */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '10px',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          display: 'block'
        }}>
          Owner
        </label>
        <select
          value={filters.owner}
          onChange={(e) => handleFilterChange('owner', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
        >
          <option value="">— Clear Selection —</option>
          {filterOptions.owners.map(owner => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>
      </div>

      {/* Property Management */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '10px',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          display: 'block'
        }}>
          Property Management
        </label>
        <select
          value={filters.propertyManagement}
          onChange={(e) => handleFilterChange('propertyManagement', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
        >
          <option value="">— Clear Selection —</option>
          {filterOptions.propertyManagers.map(manager => (
            <option key={manager} value={manager}>{manager}</option>
          ))}
        </select>
      </div>

      {/* State */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '10px',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          display: 'block'
        }}>
          State
        </label>
        <select
          value={filters.state}
          onChange={(e) => handleFilterChange('state', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
        >
          <option value="">— Clear Selection —</option>
          {filterOptions.states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* County */}
      <div style={{ marginBottom: '0' }}>
        <label style={{
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '10px',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          display: 'block'
        }}>
          County
        </label>
        <select
          value={filters.county}
          onChange={(e) => handleFilterChange('county', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
        >
          <option value="">— Clear Selection —</option>
          {filterOptions.counties.map(county => (
            <option key={county} value={county}>{county}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
