import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/layout/Hero';
import { EntryPoints } from '../components/layout/EntryPoints';
import { FilterSidebar } from '../components/map/FilterSidebar';
import { MapContainer } from '../components/map/MapContainer';
import { LeanDashboard } from '../components/map/LeanDashboard';
import type { FilterState } from '../components/map/FilterSidebar';
import { apiClient } from '../services/api';
import type { GeocodedProperty } from '../types/models';
import '../styles/design-tokens.css';

/**
 * MapView Page - Landing page with interactive map
 * 
 * Features:
 * - Zoom behavior: Level 10 (default) → Level 7 (on marker click)
 * - Smooth animated zoom and pan
 * - Toggle behavior: Click same marker twice to zoom out
 * - Auto zoom-out when closing LeanDashboard
 * - Import integration: Map refreshes automatically after CSV import success
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/pages/MapView.tsx
 */

// Constants for map behavior
const DEFAULT_MAP_CENTER = { lat: 39.9892, lng: -75.5137 }; // Malvern, PA
const DEFAULT_ZOOM_LEVEL = 10;
const ZOOMED_IN_LEVEL = 13;

export const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [allProperties, setAllProperties] = useState<GeocodedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<GeocodedProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<GeocodedProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  /**
   * CHANGE: Extracted property fetching logic into reusable function
   * 
   * This function handles all the logic for fetching properties from the API,
   * filtering out those without coordinates, and transforming them into the
   * GeocodedProperty format that the map expects.
   * 
   * By extracting this from the useEffect, we can now call it both on initial
   * page load AND after a successful CSV import, giving users immediate feedback
   * when new properties are added to the database.
   */
  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('Fetching shopping centers from API...');
      
      // Fetch all shopping centers - now with lat/lng from database
      const response = await apiClient.getShoppingCenters({ page_size: 100 });
      console.log(`Fetched ${response.results.length} shopping centers`);
      
      // Transform to GeocodedProperty format (coordinates now from backend)
      const propertiesWithCoords: GeocodedProperty[] = response.results
        .filter(property => {
          // Only include properties with valid coordinates
          if (property.latitude === null || property.longitude === null) {
            console.warn(`Property ${property.shopping_center_name} missing coordinates, skipping`);
            return false;
          }
          return true;
        })
        .map(property => ({
          ...property,
          // FIXED: Convert DecimalField strings to numbers for Google Maps
          // Django REST Framework serializes DecimalField as strings to preserve precision
          // But Google Maps requires actual number types for lat/lng coordinates
          latitude: parseFloat(property.latitude as any),
          longitude: parseFloat(property.longitude as any),
          geocoded: true,                 // Required by GeocodedProperty interface
          geocode_source: 'backend' as const // Optional field indicating source
        }));
      
      console.log(`${propertiesWithCoords.length} properties have valid coordinates`);
      
      setAllProperties(propertiesWithCoords);
      setFilteredProperties(propertiesWithCoords); // Initially show all
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * NEW: Import success handler
   * 
   * This callback is passed to the Header component and gets triggered when
   * a CSV import completes successfully. By calling fetchProperties again,
   * we refresh the map data to include the newly imported properties.
   * 
   * The user will see their newly imported properties appear as markers on
   * the map immediately after the import modal closes, without needing to
   * manually refresh their browser page.
   */
  const handleImportSuccess = () => {
    console.log('Import succeeded - refreshing property data');
    fetchProperties();
  };

  // Fetch all properties on mount - now using the extracted function
  useEffect(() => {
    fetchProperties();
  }, []);

  const handleNavigation = (page: string) => {
    console.log('Navigate to:', page);
    if (page === 'dashboard') {
      navigate('/');
    }
    // TODO: Implement other navigation when routes are set up
  };

  const handleAdminClick = () => {
    console.log('Navigate to admin portal');
    // TODO: Implement admin portal navigation
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const handleEntryPointClick = (entryPoint: string) => {
    console.log('Entry point clicked:', entryPoint);
    // TODO: Implement entry point navigation
  };

  const handleFilterChange = (filters: FilterState) => {
    console.log('Filters changed:', filters);
    
    // Filter properties client-side based on selected filters
    let filtered = allProperties;

    if (filters.centerType) {
      filtered = filtered.filter(p => p.center_type === filters.centerType);
    }

    if (filters.owner) {
      filtered = filtered.filter(p => p.owner === filters.owner);
    }

    if (filters.propertyManagement) {
      filtered = filtered.filter(p => p.property_manager === filters.propertyManagement);
    }

    if (filters.state) {
      filtered = filtered.filter(p => p.address_state === filters.state);
    }

    if (filters.county) {
      filtered = filtered.filter(p => p.county === filters.county);
    }

    console.log(`Filtered from ${allProperties.length} to ${filtered.length} properties`);
    setFilteredProperties(filtered);
  };

  const handleMarkerClick = (propertyId: string) => {
    console.log('Property marker clicked:', propertyId);
    const property = filteredProperties.find(p => p.id.toString() === propertyId);
    
    if (!property || !mapInstance) {
      return;
    }

    // Check if clicking the same marker (toggle behavior)
    const isSameMarker = selectedProperty?.id.toString() === propertyId;
    
    if (isSameMarker) {
      // Toggle: Zoom out and deselect
      console.log('Same marker clicked - zooming out and deselecting');
      mapInstance.setZoom(DEFAULT_ZOOM_LEVEL);
      mapInstance.panTo(DEFAULT_MAP_CENTER);
      setSelectedProperty(null);
    } else {
      // New marker: Zoom in and select
      console.log('New marker clicked - zooming in to level 7');
      console.log('Property details:', property);
      mapInstance.setZoom(ZOOMED_IN_LEVEL);
      // FIXED: Use latitude/longitude directly instead of coordinates tuple
      mapInstance.panTo({ lat: property.latitude, lng: property.longitude });
      setSelectedProperty(property);
    }
  };

  const handleCloseDashboard = () => {
    console.log('Closing LeanDashboard - zooming out to default view');
    
    if (mapInstance) {
      // Smooth zoom out and pan back to default center
      mapInstance.setZoom(DEFAULT_ZOOM_LEVEL);
      mapInstance.panTo(DEFAULT_MAP_CENTER);
    }
    
    setSelectedProperty(null);
  };

  const handleFullAnalysis = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  const handleMapReady = (map: google.maps.Map) => {
    console.log('Map instance received from MapContainer');
    setMapInstance(map);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      fontFamily: 'var(--font-family-base)'
    }}>
      {/* Header Navigation - CHANGE: Now receives onImportSuccess callback */}
      <Header
        activePage="dashboard"
        onNavigate={handleNavigation}
        onAdminClick={handleAdminClick}
        onImportSuccess={handleImportSuccess}
      />

      {/* Hero Section */}
      <Hero onSearch={handleSearch} />

      {/* Entry Points */}
      <EntryPoints onEntryPointClick={handleEntryPointClick} />

      {/* Loading/Error State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic'
        }}>
          Loading properties from database...
        </div>
      )}

      {error && (
        <div style={{
          margin: '20px 30px',
          padding: '15px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: 'var(--radius-md)',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {/* Map Interface - Grid Layout */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          gap: '30px',
          margin: '0 30px 40px 30px',
          height: '600px'
        }}>
          {/* Left: Filter Sidebar */}
          <FilterSidebar 
            properties={allProperties}
            onFilterChange={handleFilterChange} 
          />

          {/* Right: Map Container with Lean Dashboard */}
          <div style={{ position: 'relative' }}>
            <MapContainer 
              properties={filteredProperties}
              selectedPropertyId={selectedProperty?.id ?? null}
              onMarkerClick={handleMarkerClick}
              onMapReady={handleMapReady}
            />
            
            {/* Lean Dashboard Overlay */}
            {selectedProperty && (
              <LeanDashboard
                property={selectedProperty}
                onClose={handleCloseDashboard}
                onFullAnalysis={handleFullAnalysis}
              />
            )}
          </div>
        </div>
      )}

      {/* Property Count */}
      {!loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)'
        }}>
          Displaying {filteredProperties.length} of {allProperties.length} properties
        </div>
      )}
    </div>
  );
};
