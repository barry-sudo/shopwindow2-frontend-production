import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Property, Tenant, ApiError } from '../types/models';
import { propertiesApi, tenantsApi } from '../services/mockApi';
import { useMode } from '../contexts/ModeContext';
import { LoadingSpinner } from '../components/common/CommonComponents';
import { ErrorMessage } from '../components/common/CommonComponents';

export const PropertyDetail: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { mode, isScenarioMode } = useMode();

  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyId) {
        setError({ message: 'Property ID not provided', status_code: 400 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load property and tenants in parallel
        const [propertyResponse, tenantsResponse] = await Promise.all([
          propertiesApi.getById(propertyId),
          tenantsApi.getAll(propertyId)
        ]);

        setProperty(propertyResponse.data);
        setTenants(tenantsResponse.data.results);

        console.log(`📍 Loaded property details for ${propertyResponse.data.name} in ${mode} mode`);
      } catch (err) {
        const apiError: ApiError = {
          message: err instanceof Error ? err.message : 'Failed to load property details',
          status_code: 500
        };
        setError(apiError);
        console.error('Error loading property details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId, mode]);

  if (loading) {
    return (
      <div className="property-detail loading">
        <LoadingSpinner size="large" message="Loading property details..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-detail error">
        <ErrorMessage
          title="Failed to Load Property"
          message={error?.message || 'Property not found'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatSquareFootage = (sqft: number): string => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  const formatPropertyType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateOccupancyRate = (): number => {
    const occupiedSpace = tenants.reduce((total, tenant) => total + tenant.square_footage, 0);
    return property.gla_total > 0 ? (occupiedSpace / property.gla_total) * 100 : 0;
  };

  const calculateAverageRent = (): number => {
    if (tenants.length === 0) return 0;
    const totalRent = tenants.reduce((total, tenant) => total + tenant.base_rent, 0);
    return totalRent / tenants.length;
  };

  return (
    <div className={`property-detail ${isScenarioMode ? 'scenario-mode' : 'verified-mode'}`}>
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <Link to="/map" className="breadcrumb-link">Map View</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{property.name}</span>
      </div>

      {/* Property Header */}
      <div className="property-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="property-title">{property.name}</h1>
            <div className="property-subtitle">
              <span className="property-address">
                {property.address.full_address || 
                 `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`}
              </span>
              <span className="property-type-badge">
                {formatPropertyType(property.property_type)}
              </span>
            </div>
          </div>

          <div className="header-actions">
            <div className={`mode-indicator ${isScenarioMode ? 'scenario' : 'verified'}`}>
              {isScenarioMode ? (
                <>
                  <span className="mode-icon">🔧</span>
                  <span>Scenario Analysis</span>
                </>
              ) : (
                <>
                  <span className="mode-icon">✓</span>
                  <span>Verified Data</span>
                </>
              )}
            </div>
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/map')}
            >
              Back to Map
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="metrics-dashboard">
        <div className="metrics-grid">
          <div className={`metric-card ${isScenarioMode ? 'editable' : ''}`}>
            <div className="metric-value">{formatSquareFootage(property.gla_total)}</div>
            <div className="metric-label">Total GLA (sq ft)</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{calculateOccupancyRate().toFixed(1)}%</div>
            <div className="metric-label">Occupancy Rate</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{tenants.length}</div>
            <div className="metric-label">Total Tenants</div>
          </div>

          <div className={`metric-card ${isScenarioMode ? 'editable' : ''}`}>
            <div className="metric-value">{formatCurrency(calculateAverageRent())}</div>
            <div className="metric-label">Avg Rent PSF</div>
          </div>
        </div>
      </div>

      {/* Property Details Sections */}
      <div className="detail-sections">
        {/* Property Information */}
        <section className="detail-section">
          <h2 className="section-title">Property Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Owner</span>
              <span className="detail-value">{property.owner}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Property Manager</span>
              <span className="detail-value">{property.property_manager}</span>
            </div>

            {property.year_built && (
              <div className="detail-item">
                <span className="detail-label">Year Built</span>
                <span className="detail-value">{property.year_built}</span>
              </div>
            )}

            {property.last_renovated && (
              <div className="detail-item">
                <span className="detail-label">Last Renovated</span>
                <span className="detail-value">{property.last_renovated}</span>
              </div>
            )}

            {property.parking_spaces && (
              <div className="detail-item">
                <span className="detail-label">Parking Spaces</span>
                <span className="detail-value">{formatSquareFootage(property.parking_spaces)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Anchor Tenants */}
        {property.anchor_tenants && property.anchor_tenants.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Anchor Tenants</h2>
            <div className="anchor-tenants">
              {property.anchor_tenants.map((tenant, index) => (
                <div key={index} className="anchor-tenant-card">
                  <span className="anchor-tenant-name">{tenant}</span>
                  <span className="anchor-tenant-badge">Anchor</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tenant List */}
        <section className="detail-section">
          <h2 className="section-title">
            Tenant Directory
            <span className="tenant-count">({tenants.length} tenants)</span>
          </h2>
          
          {tenants.length > 0 ? (
            <div className="tenant-list">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="tenant-card">
                  <div className="tenant-header">
                    <h4 className="tenant-name">{tenant.name}</h4>
                    <div className="tenant-meta">
                      <span className="suite-number">Suite {tenant.suite_number}</span>
                      <span className="tenant-category">
                        {tenant.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  
                  <div className="tenant-details">
                    <div className="tenant-metrics">
                      <div className="tenant-metric">
                        <span className="metric-value">{formatSquareFootage(tenant.square_footage)}</span>
                        <span className="metric-label">sq ft</span>
                      </div>
                      
                      <div className={`tenant-metric ${isScenarioMode ? 'editable' : ''}`}>
                        <span className="metric-value">{formatCurrency(tenant.base_rent)}</span>
                        <span className="metric-label">Base Rent PSF</span>
                      </div>
                      
                      <div className="tenant-metric">
                        <span className="metric-value">{formatDate(tenant.lease_expiration)}</span>
                        <span className="metric-label">Lease Expires</span>
                      </div>
                    </div>
                    
                    {tenant.contact_name && (
                      <div className="tenant-contact">
                        <span className="contact-name">{tenant.contact_name}</span>
                        {tenant.contact_phone && (
                          <span className="contact-phone">{tenant.contact_phone}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <div className="empty-title">No tenant data available</div>
              <div className="empty-description">
                Tenant information will appear here once data is imported.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
