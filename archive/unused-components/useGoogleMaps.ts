import { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinates, Property } from '../types/models';

interface UseGoogleMapsOptions {
  center: Coordinates;
  zoom: number;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  onCenterChanged?: (center: Coordinates) => void;
  onZoomChanged?: (zoom: number) => void;
}

export function useGoogleMaps(containerId: string, options: UseGoogleMapsOptions) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { center, zoom, onBoundsChanged, onCenterChanged, onZoomChanged } = options;

  // Initialize map
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || map) return;

    const mapInstance = new google.maps.Map(container, {
      center,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#444444' }]
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }]
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'simplified' }]
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 45 }]
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
        }
      ],
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    });

    // Add event listeners
    if (onBoundsChanged) {
      mapInstance.addListener('bounds_changed', () => {
        const bounds = mapInstance.getBounds();
        if (bounds) onBoundsChanged(bounds);
      });
    }

    if (onCenterChanged) {
      mapInstance.addListener('center_changed', () => {
        const center = mapInstance.getCenter();
        if (center) {
          onCenterChanged({
            lat: center.lat(),
            lng: center.lng()
          });
        }
      });
    }

    if (onZoomChanged) {
      mapInstance.addListener('zoom_changed', () => {
        onZoomChanged(mapInstance.getZoom() || zoom);
      });
    }

    setMap(mapInstance);
    setIsLoaded(true);
  }, [containerId, center, zoom, onBoundsChanged, onCenterChanged, onZoomChanged]);

  // Update map center and zoom
  const updateMapView = useCallback((newCenter: Coordinates, newZoom?: number) => {
    if (map) {
      map.setCenter(newCenter);
      if (newZoom !== undefined) {
        map.setZoom(newZoom);
      }
    }
  }, [map]);

  // Add markers to map
  const addMarkers = useCallback((properties: Property[], onMarkerClick?: (property: Property) => void) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    properties.forEach(property => {
      const marker = new google.maps.Marker({
        position: property.coordinates,
        map,
        title: property.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#1a365d',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 6
        }
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(property));
      }

      markersRef.current.set(property.id, marker);
    });
  }, [map]);

  // Update marker appearance
  const updateMarkerAppearance = useCallback((propertyId: string, options: {
    fillColor?: string;
    scale?: number;
    fillOpacity?: number;
  }) => {
    const marker = markersRef.current.get(propertyId);
    if (marker) {
      const currentIcon = marker.getIcon() as google.maps.Symbol;
      marker.setIcon({
        ...currentIcon,
        ...options
      });
    }
  }, []);

  // Show info window
  const showInfoWindow = useCallback((propertyId: string, content: string) => {
    const marker = markersRef.current.get(propertyId);
    if (!marker || !map) return;

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    infoWindowRef.current = new google.maps.InfoWindow({
      content,
      maxWidth: 300
    });

    infoWindowRef.current.open(map, marker);
  }, [map]);

  // Close info window
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  // Fit map to bounds
  const fitToBounds = useCallback((properties: Property[]) => {
    if (!map || properties.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    properties.forEach(property => {
      bounds.extend(property.coordinates);
    });

    map.fitBounds(bounds);
  }, [map]);

  // Get current map bounds
  const getCurrentBounds = useCallback(() => {
    if (!map) return null;
    return map.getBounds();
  }, [map]);

  // Clean up
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current.clear();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  return {
    map,
    isLoaded,
    updateMapView,
    addMarkers,
    updateMarkerAppearance,
    showInfoWindow,
    closeInfoWindow,
    fitToBounds,
    getCurrentBounds
  };
}