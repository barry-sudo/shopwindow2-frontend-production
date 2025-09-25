import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from '../components/map/Map';
import { MapErrorBoundary } from '../components/common/MapErrorBoundary';
import { PropertyCard } from '../components/property/PropertyCard';
import { FilterPanel } from '../components/property/FilterPanel';
import { useModeContext } from '../contexts/ModeContext';

// Import your API service (adjust path as needed)
// import { apiService } from '../services/api';

// Mock data for development - replace with actual API call
const mockProperties = [
  {
    id: '1',
    name: 'Philadelphia Premium Outlets',
    address: '18 West Lightcap Road, Pottstown, PA 19464',
    location: { coordinates: [-75.6224, 40.2732] },
    square_footage: 850000,
    occupancy_rate: 0.92,
    data_quality_score: 85,
    tenant_count: 120,
    anchor_tenants: ['Nike', 'Coach', 'Kate Spade']
  },
  {
    id: '2', 
    name: 'King of Prussia Mall',
    address: '160 N Gulph Rd, King of Prussia, PA 19406',
    location: { coordinates: [-75.3896, 40.0892] },
    square_footage: 2900000,
    occupancy_rate: 0.96,
    data_quality_score: 95,
    tenant_count: 450,
    anchor_tenants: ['Nordstrom', 'Macy\'s', 'Bloomingdale\'s']
  },
  {
    id: '3',
    name: 'Cherry Hill Mall',
    address: '2000 RT-38, Cherry Hill, NJ 08002',
    location: { coordinates: [-75.0308, 39.9343] },
    square_footage: 1200000,
    occupancy_rate: 0.88,
    data_quality_score: 78,
    tenant_count: 160,
    anchor_tenants: ['Macy\'s', 'JCPenney', 'Barnes & Noble']
  },
  {
    id: '4',
    name: 'Deptford Mall',
    address: '1750 Deptford Center Rd, Deptford Township, NJ 08096',
    location: { coordinates: [-75.1190, 39.8176] },
    square_footage: 900000,
    occupancy_rate: 0.84,
    data_quality_score: 72,
    tenant_count: 110,
    anchor_tenants: ['Macy\'s', 'Boscov\'s', 'AMC']
  },
  {
    id: '5',
    name: 'Willow Grove Park Mall',
    address: '2500 W Moreland Rd, Willow Grove, PA 19090',
    location: { coordinates: [-75.1157, 40.1440] },
    square_footage: 1100000,
    occupancy_rate: 0.90,
    data_quality_score: 82,
    tenant_count: 140,
    anchor_tenants: ['Macy\'s', 'JCPenney', 'Dick\'s Sporting Goods']
  }
];

interface Property {
  id: string;
  name: string;
  address: string;
  location: {
    coordinates: [number, number];
  };
  square_footage?: number;
  occupancy_rate?: number;
  data_quality_score: number;
  tenant_count?: number;
  anchor_tenants?: string[];
}

interface Filters {
  searchTerm: string;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minOccupancy?: number;
  minDataQuality?: number;
}

export const MapView: React.FC = () => {
  const navigate = useNavigate();
  const { isVerifiedMode } = useModeContext();
  
  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<Filters>({ searchTerm: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Load properties data
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        console.log(`🔄 Loading properties in ${isVerifiedMode ? 'Verified' : 'Scenario'} mode...`);
        
        // For development, use mock data
        // In production, replace with actual API call:
        // const response = await apiService.getShoppingCenters();
        // setProperties(response.results);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProperties(mockProperties);
        console.log(`✅ Loaded ${mockProperties.length} properties in ${isVerifiedMode ? 'Verified' : 'Scenario'} mode`);
        
      } catch (err) {
        console.error('❌ Error loading properties:', err);
        setError('Failed to load properties. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [isVerifiedMode]);

  // Filter properties based on current filters
  const applyFilters = useMemo(() => {
    return properties.filter(property => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          property.name.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.anchor_tenants?.some(tenant => 
            tenant.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Square footage filters
      if (filters.minSquareFootage && property.square_footage && 
          property.square_footage < filters.minSquareFootage) return false;
      if (filters.maxSquareFootage && property.square_footage && 
          property.square_footage > filters.maxSquareFootage) return false;

      // Occupancy filter
      if (filters.minOccupancy && property.occupancy_rate && 
          property.occupancy_rate < filters.minOccupancy / 100) return false;

      // Data quality filter
      if (filters.minDataQuality && 
          property.data_quality_score < filters.minDataQuality) return false;

      return true;
    });
  }, [properties, filters]);

  // Update filtered properties when filters change
  useEffect(() => {
    setFilteredProperties(applyFilters);
    console.log(`📊 Applied filters: ${applyFilters.length} of ${properties.length} properties match`);
  }, [applyFilters, properties.length]);

  // Handle property selection
  const handlePropertyClick = (property: Property) => {
    console.log('🎯 Property clicked:', property.name);
    setSelectedProperty(property);
  };

  // Handle property detail view
  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  // Map center calculation
  const mapCenter = useMemo(() => {
    if (filteredProperties.length === 0) {
      return { lat: 39.9526, lng: -75.1652 }; // Philadelphia default
    }

    const avgLat = filteredProperties.reduce((sum, p) => 
      sum + p.location.coordinates[1], 0) / filteredProperties.length;
    const avgLng = filteredProperties.reduce((sum, p) => 
      sum + p.location.coordinates[0], 0) / filteredProperties.length;

    return { lat: avgLat, lng: avgLng };
  }, [filteredProperties]);

  if (isLoading) {
    return (
      <div className="map-view loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a365d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#4a5568', fontSize: '16px', margin: 0 }}>
            Loading properties...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-view error" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#fed7d7',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#c53030', marginBottom: '12px' }}>Loading Error</h2>
          <p style={{ color: '#742a2a', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1a365d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view" style={{ 
      height: '100vh', 
      display: 'flex',
      backgroundColor: '#ffffff'
    }}>
      {/* Sidebar */}
      {showSidebar && (
        <div 
          className="map-sidebar"
          style={{
            width: '400px',
            height: '100%',
            backgroundColor: '#f7fafc',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ 
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a365d'
              }}>
                Properties ({filteredProperties.length})
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#4a5568',
                  padding: '4px'
                }}
                title="Hide sidebar"
              >
                ×
              </button>
            </div>

            {/* Mode indicator */}
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: isVerifiedMode ? '#d69e2e' : '#38a169',
              color: 'white'
            }}>
              {isVerifiedMode ? '🔒 Verified Mode' : '📊 Scenario Mode'}
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: '20px', backgroundColor: 'white' }}>
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              propertyCount={filteredProperties.length}
            />
          </div>

          {/* Property List */}
          <div style={{ 
            flex: 1,
            overflow: 'auto',
            padding: '0 20px 20px'
          }}>
            {filteredProperties.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#4a5568'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏪</div>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  No properties match your current filters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                    onViewDetails={() => handleViewDetails(property.id)}
                    isSelected={selectedProperty?.id === property.id}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <div style={{ 
        flex: 1,
        height: '100%',
        position: 'relative'
      }}>
        {/* Toggle sidebar button when hidden */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 10,
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="Show sidebar"
          >
            ☰ Properties ({filteredProperties.length})
          </button>
        )}

        {/* Map with Error Boundary */}
        <MapErrorBoundary>
          <Map
            properties={filteredProperties}
            center={mapCenter}
            zoom={11}
            onPropertyClick={handlePropertyClick}
            className="main-map"
          />
        </MapErrorBoundary>

        {/* Selected Property Info */}
        {selectedProperty && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '300px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              zIndex: 5
            }}
          >
            <div style={{ 
              padding: '16px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f7fafc'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h3 style={{ 
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1a365d',
                  flex: 1,
                  paddingRight: '12px'
                }}>
                  {selectedProperty.name}
                </h3>
                <button
                  onClick={() => setSelectedProperty(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: '#4a5568',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#4a5568'
              }}>
                📍 {selectedProperty.address}
              </p>
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {selectedProperty.square_footage && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: 600 }}>
                      SIZE
                    </div>
                    <div style={{ fontSize: '14px', color: '#1a365d', fontWeight: 600 }}>
                      {selectedProperty.square_footage.toLocaleString()} sq ft
                    </div>
                  </div>
                )}
                
                {selectedProperty.occupancy_rate !== undefined && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: 600 }}>
                      OCCUPANCY
                    </div>
                    <div style={{ fontSize: '14px', color: '#1a365d', fontWeight: 600 }}>
                      {Math.round(selectedProperty.occupancy_rate * 100)}%
                    </div>
                  </div>
                )}
                
                {selectedProperty.tenant_count && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: 600 }}>
                      TENANTS
                    </div>
                    <div style={{ fontSize: '14px', color: '#1a365d', fontWeight: 600 }}>
                      {selectedProperty.tenant_count}
                    </div>
                  </div>
                )}
                
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: 600 }}>
                    DATA QUALITY
                  </div>
                  <div style={{ fontSize: '14px', color: '#1a365d', fontWeight: 600 }}>
                    {selectedProperty.data_quality_score}%
                  </div>
                </div>
              </div>

              {selectedProperty.anchor_tenants && selectedProperty.anchor_tenants.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#718096', 
                    fontWeight: 600,
                    marginBottom: '6px'
                  }}>
                    ANCHOR TENANTS
                  </div>
                  <div style={{ fontSize: '14px', color: '#4a5568' }}>
                    {selectedProperty.anchor_tenants.join(', ')}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleViewDetails(selectedProperty.id)}
                style={{
                  width: '100%',
                  backgroundColor: '#1a365d',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2d3748'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1a365d'}
              >
                View Full Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add spinning animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MapView;
