import React, { useEffect, useRef, useState } from 'react';
import type { GeocodedProperty } from '../../types/models';
import '../../styles/design-tokens.css';

/**
 * MapContainer Component - Google Maps integration with interactive markers
 * 
 * Features:
 * - Renders property markers on Google Maps
 * - Visual selection state (orange + scaled up)
 * - Hover effects (scale up 1.2x)
 * - Click handling for property selection
 * - Zoom behavior controlled by parent (MapView)
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/map/MapContainer.tsx
 */

interface MapContainerProps {
  properties: GeocodedProperty[];
  selectedPropertyId?: number | null;
  onMarkerClick?: (propertyId: string) => void;
  onMapReady?: (map: google.maps.Map) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  properties = [], 
  selectedPropertyId = null,
  onMarkerClick,
  onMapReady
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleReady = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded, we're done
    if (checkGoogleReady()) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Missing VITE_GOOGLE_MAPS_API_KEY');
      return;
    }

    // Avoid loading script twice
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      // Wait for google to appear
      const interval = setInterval(() => {
        if (checkGoogleReady()) clearInterval(interval);
      }, 100);
      return;
    }

    // Create the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Poll until google is defined
      const interval = setInterval(() => {
        if (checkGoogleReady()) clearInterval(interval);
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 39.9892, lng: -75.5137 },  // Malvern, PA
      zoom: 10,
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
      zoomControl: true
    });

    setMap(mapInstance);
    
    // Pass map instance to parent for zoom control
    if (onMapReady) {
      onMapReady(mapInstance);
    }
  }, [isLoaded, map, onMapReady]);

  // Helper function to create marker icon
  const createMarkerIcon = (isSelected: boolean, isHovered: boolean = false) => {
    let scale = 6; // Default size
    
    if (isSelected && isHovered) {
      scale = 8.6; // Selected + hovered
    } else if (isSelected) {
      scale = 7.2; // Selected
    } else if (isHovered) {
      scale = 7.2; // Just hovered
    }
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: scale,
      fillColor: isSelected ? '#f39c12' : '#2c5aa0',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    };
  };

  // Create/update markers when properties change
  useEffect(() => {
    if (!map || !properties.length) return;

    console.log(`Updating ${properties.length} markers on map`);
    
    const currentMarkers = markersRef.current;
    const newMarkerIds = new Set(properties.map(p => p.id));
    
    // Remove markers that are no longer in the properties list
    currentMarkers.forEach((marker, id) => {
      if (!newMarkerIds.has(id)) {
        marker.setMap(null);
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    properties.forEach(property => {
      // FIXED: Use latitude/longitude directly instead of coordinates tuple
      if (
        isNaN(property.latitude) ||
        isNaN(property.longitude)
      ) {
        console.warn('Invalid coordinates for', property.shopping_center_name);
        return;
      }

      let marker = currentMarkers.get(property.id);
      const isSelected = selectedPropertyId === property.id;
      
      if (!marker) {
        // Create new marker
        // FIXED: Use { lat, lng } object instead of coordinates tuple
        marker = new google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map,
          title: property.shopping_center_name,
          icon: createMarkerIcon(isSelected)
        });

        // Add click listener - zoom/pan logic now handled by parent (MapView)
        marker.addListener('click', () => {
          console.log('Marker clicked:', property.shopping_center_name);
          onMarkerClick?.(property.id.toString());
        });

        // Add hover listeners
        // FIXED: Add guard clause for marker possibly being undefined
        marker.addListener('mouseover', () => {
          if (!marker) return;
          const currentlySelected = selectedPropertyId === property.id;
          marker.setIcon(createMarkerIcon(currentlySelected, true));
        });

        marker.addListener('mouseout', () => {
          if (!marker) return;
          const currentlySelected = selectedPropertyId === property.id;
          marker.setIcon(createMarkerIcon(currentlySelected, false));
        });

        currentMarkers.set(property.id, marker);
      } else {
        // Update existing marker icon if selection state changed
        marker.setIcon(createMarkerIcon(isSelected));
      }
    });

    console.log(`Successfully updated ${currentMarkers.size} markers`);
  }, [map, properties, selectedPropertyId, onMarkerClick]);

  // Update marker icons when selection changes
  useEffect(() => {
    const currentMarkers = markersRef.current;
    if (!currentMarkers.size) return;

    console.log('Selection changed, updating marker visuals. Selected ID:', selectedPropertyId);

    currentMarkers.forEach((marker, propertyId) => {
      const isSelected = selectedPropertyId === propertyId;
      marker.setIcon(createMarkerIcon(isSelected));
      
      if (isSelected) {
        console.log('Marker', propertyId, 'is now SELECTED (should be orange)');
      }
    });
  }, [selectedPropertyId]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-neutral-300)',
        backgroundColor: '#e8f5e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontStyle: 'italic',
        fontSize: 'var(--font-size-lg)'
      }}
    >
      {!isLoaded && 'Loading Google Maps...'}
    </div>
  );
};
