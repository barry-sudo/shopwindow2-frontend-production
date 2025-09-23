import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Map } from '../components/map/Map';
import { PropertyCard } from '../components/property/PropertyCard';
import { SearchBar } from '../components/common/SearchBar';
import { FilterPanel } from '../components/property/FilterPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { propertiesApi } from '../services/mockApi';
import { useMode } from '../contexts/ModeContext';
import { Property, PropertyFilters, Coordinates, ApiError } from '../types/models';

// Default map center - Wilmington, DE area (our primary market)
const DEFAULT_CENTER: Coordinates = { lat: 39.7391, lng: -75.6918 };
const DEFAULT_ZOOM = 11;

export const MapView: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useMode();
  
  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM);

  // Load properties data
  const loadProperties = useCallback(async (appliedFilters?: PropertyFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await propertiesApi.getAll(appliedFilters);
      setProperties(response.data.results);
      
      console.log(`📍 Loaded ${response.data.results.length} properties in ${mode} mode`);
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Failed to load properties',
        status_code: 500
      };
      setError(apiError);
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      const searchFilters: PropertyFilters = { ...filters, search_query: query };
      await loadProperties(searchFilters);
    } else {
      await loadProperties(filters);
    }
  }, [filters, loadProperties]);

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    const searchFilters = searchQuery ? { ...newFilters, search_query: searchQuery } : newFilters;
    await loadProperties(searchFilters);
  }, [searchQuery, loadProperties]);

  // Handle property selection
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
    setMapCenter(property.coordinates);
    setMapZoom(15); // Zoom in when selecting a property
  }, []);

  // Handle property card click (navigate to detail view)
  const handlePropertyCardClick = useCallback((property: Property) => {
    navigate(`/property/${property.id}`);
  }, [navigate]);

  // Handle map bounds change (for future optimization)
  const handleMapBoundsChange = useCallback((bounds: google.maps.LatLngBounds) => {
    // Future enhancement: Load only properties within visible bounds
    console.log('Map bounds changed:', bounds.toJSON());
  }, []);

  // Initial load
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Render error state
  if (error && !loading) {
    return (
      <div className="map-view error-state">
        <div className="error-container">
          <ErrorMessage 
            title="Failed to Load Properties"
            message={error.message}
            onRetry={() => loadProperties()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="map-view">
      {/* Search and Filter Controls */}
      <div className="map-controls">
        <div className="controls-container">
          <div className="search-section">
            <SearchBar
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search properties, locations, or owners..."
              className="property-search"
            />
          </div>
          
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
            totalProperties={properties.length}
            className="map-filters"
          />
        </div>
      </div>

      {/* Main Map and Property Display */}
      <div className="map-content">
        {/* Google Map */}
        <div className="map-container">
          {loading ? (
            <div className="map-loading">
              <LoadingSpinner size="large" message="Loading properties..." />
            </div>
          ) : (
            <Wrapper 
              apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
              render={(status) => {
                if (status === 'LOADING') return <LoadingSpinner message="Loading map..." />;
                if (status === 'FAILURE') return <ErrorMessage title="Map failed to load" message="Check Google Maps API key configuration" />;
                return null;
              }}
            >
              <Map
                center={mapCenter}
                zoom={mapZoom}
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                onBoundsChanged={handleMapBoundsChange}
                mode={mode}
              />
            </Wrapper>
          )}
        </div>

        {/* Selected Property Card */}
        {selectedProperty && !loading && (
          <div className="property-sidebar">
            <div className="selected-property">
              <div className="sidebar-header">
                <h3>Selected Property</h3>
                <button 
                  className="close-button"
                  onClick={() => setSelectedProperty(null)}
                  aria-label="Close property details"
                >
                  ×
                </button>
              </div>
              
              <PropertyCard
                property={selectedProperty}
                mode={mode}
                onClick={() => handlePropertyCardClick(selectedProperty)}
                className="selected-property-card"
              />
            </div>
          </div>
        )}
      </div>

      {/* Properties Summary */}
      <div className="map-footer">
        <div className="properties-summary">
          {loading ? (
            <span>Loading properties...</span>
          ) : (
            <span>
              Showing {properties.length} properties
              {searchQuery && ` for "${searchQuery}"`}
              {Object.keys(filters).length > 0 && ' (filtered)'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};