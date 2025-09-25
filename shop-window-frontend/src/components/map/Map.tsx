import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Types for our component
interface Property {
  id: string;
  name: string;
  address: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
  square_footage?: number;
  occupancy_rate?: number;
  data_quality_score: number;
}

interface MapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  className?: string;
}

// Google Maps component that renders after API is loaded
const GoogleMapComponent: React.FC<{
  center: google.maps.LatLngLiteral;
  zoom: number;
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  onMapLoad?: (map: google.maps.Map) => void;
}> = ({ center, zoom, properties, onPropertyClick, onMapLoad }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    console.log('🗺️ Initializing Google Map...');
    
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Initialize InfoWindow
      const infoWindow = new window.google.maps.InfoWindow();
      infoWindowRef.current = infoWindow;

      setMap(mapInstance);
      onMapLoad?.(mapInstance);
      
      console.log('✅ Google Map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Map:', error);
    }
  }, [center, zoom, onMapLoad]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markers.forEach(marker => {
      marker.setMap(null);
    });
    setMarkers([]);
  }, [markers]);

  // Create markers for properties
  useEffect(() => {
    if (!map || !window.google || !properties.length) return;

    console.log(`📍 Creating ${properties.length} property markers...`);
    clearMarkers();

    const newMarkers: google.maps.Marker[] = [];

    properties.forEach((property) => {
      try {
        if (!property.location?.coordinates) {
          console.warn(`⚠️ Property ${property.name} has no coordinates`);
          return;
        }

        const [lng, lat] = property.location.coordinates;
        
        // Validate coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          console.warn(`⚠️ Invalid coordinates for ${property.name}:`, { lat, lng });
          return;
        }

        // Create marker with proper constructor
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: property.name,
          // Custom icon based on data quality
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: property.data_quality_score > 75 ? '#10B981' : 
                      property.data_quality_score > 50 ? '#F59E0B' : '#EF4444',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            const content = `
              <div style="padding: 12px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #1a365d; font-size: 16px; font-weight: 600;">
                  ${property.name}
                </h3>
                <p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">
                  📍 ${property.address}
                </p>
                ${property.square_footage ? 
                  `<p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">
                    📐 ${property.square_footage.toLocaleString()} sq ft
                  </p>` : ''
                }
                ${property.occupancy_rate !== undefined ? 
                  `<p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">
                    📊 ${Math.round(property.occupancy_rate * 100)}% occupied
                  </p>` : ''
                }
                <p style="margin: 4px 0 0 0; color: #4a5568; font-size: 12px;">
                  Data Quality: ${property.data_quality_score}%
                </p>
                <button 
                  onclick="window.handlePropertyClick('${property.id}')" 
                  style="margin-top: 8px; background: #1a365d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  View Details
                </button>
              </div>
            `;
            
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, marker);
          }
          
          onPropertyClick?.(property);
        });

        newMarkers.push(marker);
      } catch (error) {
        console.error(`❌ Error creating marker for ${property.name}:`, error);
      }
    });

    setMarkers(newMarkers);
    
    // Fit bounds to show all properties if we have multiple
    if (newMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
    }

    console.log(`✅ Created ${newMarkers.length} markers successfully`);
  }, [map, properties, onPropertyClick, clearMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [clearMarkers]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

// Loading component
const MapSkeleton: React.FC = () => (
  <div 
    className="map-skeleton"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px'
    }}
  >
    <div style={{ textAlign: 'center', color: '#4a5568' }}>
      <div 
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #1a365d',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 12px'
        }}
      />
      <p style={{ margin: 0, fontSize: '14px' }}>Loading map...</p>
    </div>
  </div>
);

// Error component
const MapError: React.FC<{ status: Status }> = ({ status }) => (
  <div 
    className="map-error"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fed7d7',
      border: '1px solid #feb2b2',
      borderRadius: '8px'
    }}
  >
    <div style={{ textAlign: 'center', color: '#c53030', padding: '20px' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
        Map Loading Error
      </h3>
      <p style={{ margin: 0, fontSize: '14px' }}>
        Status: {status}
      </p>
      {status === Status.FAILURE && (
        <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
          Please check your Google Maps API key configuration.
        </p>
      )}
    </div>
  </div>
);

// Render function for Wrapper
const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <MapSkeleton />;
    case Status.FAILURE:
      return <MapError status={status} />;
    case Status.SUCCESS:
      return null; // Will be replaced by GoogleMapComponent
  }
};

// Main Map component
export const Map: React.FC<MapProps> = ({
  properties = [],
  center = { lat: 39.9526, lng: -75.1652 }, // Philadelphia default
  zoom = 11,
  onPropertyClick,
  className = ''
}) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  // Handle property click from InfoWindow button
  useEffect(() => {
    // @ts-ignore
    window.handlePropertyClick = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      if (property && onPropertyClick) {
        onPropertyClick(property);
      }
    };

    return () => {
      // @ts-ignore
      delete window.handlePropertyClick;
    };
  }, [properties, onPropertyClick]);

  // Get API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`map-container ${className}`} style={{ width: '100%', height: '100%' }}>
        <MapError status={Status.FAILURE} />
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`} style={{ width: '100%', height: '100%' }}>
      <Wrapper 
        apiKey={apiKey} 
        render={render}
        libraries={['places']}
        version="weekly"
      >
        <GoogleMapComponent
          center={center}
          zoom={zoom}
          properties={properties}
          onPropertyClick={onPropertyClick}
          onMapLoad={setMapInstance}
        />
      </Wrapper>
      
      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Map;
