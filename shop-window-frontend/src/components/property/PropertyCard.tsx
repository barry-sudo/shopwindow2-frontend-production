import React from 'react';
import { Property, DataSourceType, PropertyCardProps } from '../../types/models';

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  mode,
  onClick,
  className = ''
}) => {
  const isScenarioMode = mode === DataSourceType.SCENARIO;
  const cardClasses = [
    'card',
    'property-card',
    isScenarioMode ? 'scenario-mode' : 'verified-mode',
    className
  ].filter(Boolean).join(' ');

  const formatPropertyType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatSquareFootage = (sqft: number): string => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Mode Badge */}
      <div className="card-header">
        <div className={`mode-badge ${isScenarioMode ? 'scenario' : 'verified'}`}>
          {isScenarioMode ? (
            <>
              <span className="mode-icon">🔧</span>
              <span className="mode-text">SCENARIO</span>
            </>
          ) : (
            <>
              <span className="mode-icon">✓</span>
              <span className="mode-text">VERIFIED</span>
            </>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Property Header */}
        <div className="property-header">
          <h3 className="property-name">{property.name}</h3>
          <div className="property-address">
            {property.address.full_address || 
             `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`
            }
          </div>
          <div className="property-type">
            {formatPropertyType(property.property_type)}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-section">
          <div className="metrics-row">
            <div className={`metric ${isScenarioMode ? 'editable' : ''}`}>
              <div className="metric-value">
                {formatSquareFootage(property.gla_total)}
              </div>
              <div className="metric-label">Total GLA (sq ft)</div>
            </div>

            <div className="metric">
              <div className="metric-value">
                {property.year_built || 'N/A'}
              </div>
              <div className="metric-label">Year Built</div>
            </div>

            <div className="metric">
              <div className="metric-value">
                {property.parking_spaces ? formatSquareFootage(property.parking_spaces) : 'N/A'}
              </div>
              <div className="metric-label">Parking Spaces</div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="property-details">
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">Owner:</span>
              <span className="detail-value">{property.owner}</span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">Manager:</span>
              <span className="detail-value">{property.property_manager}</span>
            </div>
          </div>

          {property.anchor_tenants && property.anchor_tenants.length > 0 && (
            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">Anchor Tenants:</span>
                <span className="detail-value">
                  {property.anchor_tenants.slice(0, 2).join(', ')}
                  {property.anchor_tenants.length > 2 && (
                    <span className="additional-count">
                      {' '}+{property.anchor_tenants.length - 2} more
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {onClick && (
        <div className="card-footer">
          <span className="view-details-text">
            Click to view full property details
          </span>
        </div>
      )}
    </div>
  );
};