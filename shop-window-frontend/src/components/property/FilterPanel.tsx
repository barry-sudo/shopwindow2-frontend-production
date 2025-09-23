import React, { useState } from 'react';
import { PropertyFilters, PropertyType } from '../../types/models';

interface FilterPanelProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  totalProperties: number;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  totalProperties,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePropertyTypeChange = (type: PropertyType, checked: boolean) => {
    const currentTypes = filters.property_type || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    onFiltersChange({
      ...filters,
      property_type: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const handleGLAChange = (field: 'min_gla' | 'max_gla', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFiltersChange({
      ...filters,
      [field]: numValue
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`filter-panel ${className}`}>
      <div className="filter-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>Filters</span>
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </button>
        
        <div className="filter-summary">
          <span className="property-count">{totalProperties} properties</span>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearAllFilters}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Property Type Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Property Type</h4>
            <div className="checkbox-group">
              {Object.values(PropertyType).map((type) => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(filters.property_type || []).includes(type)}
                    onChange={(e) => handlePropertyTypeChange(type, e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* GLA Range Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Gross Leasable Area (sq ft)</h4>
            <div className="range-inputs">
              <div className="range-input-group">
                <label className="range-label">Min:</label>
                <input
                  type="number"
                  value={filters.min_gla || ''}
                  onChange={(e) => handleGLAChange('min_gla', e.target.value)}
                  placeholder="0"
                  className="form-control range-input"
                  min="0"
                  step="1000"
                />
              </div>
              
              <div className="range-separator">—</div>
              
              <div className="range-input-group">
                <label className="range-label">Max:</label>
                <input
                  type="number"
                  value={filters.max_gla || ''}
                  onChange={(e) => handleGLAChange('max_gla', e.target.value)}
                  placeholder="∞"
                  className="form-control range-input"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};