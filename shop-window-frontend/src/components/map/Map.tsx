import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Property, Coordinates, DataSourceType } from '../../types/models';

interface MapProps {
  center: Coordinates;
  zoom: number;
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  mode: DataSourceType;
  className?: string;
}

export const Map: React.FC<MapProps> = ({
  center,
  zoom,
  properties,
  selectedProperty,
  onPropertySelect,
  onBoundsChanged,
  mode,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        // Custom map styling for professional look
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

    // Add bounds changed listener
    if (onBoundsChanged) {
      mapInstanceRef.current.addListener('bounds_changed', () => {
        const bounds = mapInstanceRef.current?.getBounds();
        if (bounds) {
          onBoundsChanged(bounds);
        }
      });
    }

    console.log('📍 Google Map initialized');
  }, [center, zoom, onBoundsChanged]);

  // Update map center and zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Create property marker
  const createPropertyMarker = useCallback((property: Property): google.maps.Marker => {
    const isSelected = selectedProperty?.id === property.id;
    const isScenarioMode = mode === DataSourceType.SCENARIO;

    // Create custom marker icon based on mode and selection state
    const markerIcon: google.maps.Icon = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isScenarioMode ? '#f39c12' : '#1a365d', // Scenario orange or primary blue
      fillOpacity: isSelected ? 1.0 : 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: isSelected ? 8 : 6,
    };

    const marker = new google.maps.Marker({
      position: property.coordinates,
      map: mapInstanceRef.current,
      title: property.name,
      icon: markerIcon,
      animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
      zIndex: isSelected ? 1000 : 100
    });

    // Add click listener
    marker.addListener('click', () => {
      onPropertySelect(property);
    });

    // Add hover effect
    marker.addListener('mouseover', () => {
      if (!isSelected) {
        marker.setIcon({
          ...markerIcon,
          scale: 7,
          fillOpacity: 1.0
        });
      }
    });

    marker.addListener('mouseout', () => {
      if (!isSelected) {
        marker.setIcon({
          ...markerIcon,
          scale: 6,
          fillOpacity: 0.8
        });
      }
    });

    return marker;
  }, [selectedProperty, mode, onPropertySelect]);

  // Create info window content
  const createInfoWindowContent = useCallback((property: Property): string => {
    const isScenarioMode = mode === DataSourceType.SCENARIO;
    const modeClass = isScenarioMode ? 'scenario-mode' : 'verified-mode';

    return `
      <div class="property-info-window ${modeClass}">
        <div class="info-header">
          <h4 style="margin: 0 0 8px 0; color: ${isScenarioMode ? '#f39c12' : '#1a365d'}; font-size: 16px;">
            ${property.name}
          </h4>
          <div class="mode-badge ${modeClass}" style="
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 11px; 
            font-weight: 600; 
            text-transform: uppercase;
            background: ${isScenarioMode ? '#fff3cd' : '#e3f2fd'};
            color: ${isScenarioMode ? '#856404' : '#0c5460'};
          ">
            ${isScenarioMode ? '🔧 Scenario' : '✓ Verified'}
          </div>
        </div>
        <div class="info-content" style="font-size: 14px; color: #4a5568; line-height: 1.4;">
          <div style="margin: 4px 0;">${property.address.full_address || `${property.address.street}, ${property.address.city}, ${property.address.state}`}</div>
          <div style="margin: 4px 0;"><strong>Type:</strong> ${property.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          <div style="margin: 4px 0;"><strong>GLA:</strong> ${property.gla_total.toLocaleString()} sq ft</div>
          <div style="margin: 4px 0;"><strong>Owner:</strong> ${property.owner}</div>
          ${property.anchor_tenants && property.anchor_tenants.length > 0 ? 
            `<div style="margin: 4px 0;"><strong>Anchors:</strong> ${property.anchor_tenants.join(', ')}</div>` : ''
          }
        </div>
        <div style="text-align: center; margin-top: 12px;">
          <button 
            onclick="window.location.href='/property/${property.id}'" 
            style="
              background: ${isScenarioMode ? '#f39c12' : '#1a365d'}; 
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 4px; 
              font-size: 12px; 
              cursor: pointer;
              font-weight: 500;
            "
          >
            View Details
          </button>
        </div>
      </div>
    `;
  }, [mode]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    // Close existing info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Create new markers
    properties.forEach(property => {
      const marker = createPropertyMarker(property);
      markersRef.current.set(property.id, marker);

      // Add info window on marker click
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        infoWindowRef.current = new google.maps.InfoWindow({
          content: createInfoWindowContent(property),
          maxWidth: 300
        });

        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });
    });

    console.log(`📍 Updated ${properties.length} property markers in ${mode} mode`);
  }, [properties, createPropertyMarker, createInfoWindowContent, mode]);

  // Update selected property marker
  useEffect(() => {
    markersRef.current.forEach((marker, propertyId) => {
      const isSelected = selectedProperty?.id === propertyId;
      const isScenarioMode = mode === DataSourceType.SCENARIO;
      
      const markerIcon: google.maps.Icon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: isScenarioMode ? '#f39c12' : '#1a365d',
        fillOpacity: isSelected ? 1.0 : 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: isSelected ? 8 : 6,
      };

      marker.setIcon(markerIcon);
      marker.setAnimation(isSelected ? google.maps.Animation.BOUNCE : undefined);
      marker.setZIndex(isSelected ? 1000 : 100);
    });
  }, [selectedProperty, mode]);

  return (
    <div 
      ref={mapRef} 
      className={`google-map ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '600px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};