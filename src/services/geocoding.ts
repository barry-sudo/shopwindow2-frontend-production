/**
 * Shop Window - Geocoding Service
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/services/geocoding.ts
 * 
 * Handles address-to-coordinate conversion using Google Maps Geocoding API
 * Includes caching to prevent duplicate API calls
 */

import type {
  ShoppingCenter,
  GeocodedProperty,
  GeocodeResult,
  GeocodeCache,
} from '../types/models';
import { formatAddressForGeocoding } from './api';

// Google Maps API Key - should be in environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// In-memory cache for geocoded addresses
let geocodeCache: GeocodeCache = {};

/**
 * Load cache from localStorage on initialization
 */
function loadCacheFromStorage(): void {
  try {
    const cached = localStorage.getItem('geocodeCache');
    if (cached) {
      geocodeCache = JSON.parse(cached);
      console.log(`Loaded ${Object.keys(geocodeCache).length} cached geocode results`);
    }
  } catch (error) {
    console.warn('Failed to load geocode cache from localStorage:', error);
  }
}

/**
 * Save cache to localStorage
 */
function saveCacheToStorage(): void {
  try {
    localStorage.setItem('geocodeCache', JSON.stringify(geocodeCache));
  } catch (error) {
    console.warn('Failed to save geocode cache to localStorage:', error);
  }
}

/**
 * Initialize cache on module load
 */
loadCacheFromStorage();

/**
 * Geocode a single address using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  // Check cache first
  if (geocodeCache[address]) {
    console.log(`Cache hit for address: ${address}`);
    return geocodeCache[address];
  }

  // Validate API key
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env');
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', address);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    console.log(`Geocoding address: ${address}`);
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const geocodeResult: GeocodeResult = {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        success: true,
      };

      // Cache the result
      geocodeCache[address] = geocodeResult;
      saveCacheToStorage();

      return geocodeResult;
    } else {
      // Handle API errors (ZERO_RESULTS, OVER_QUERY_LIMIT, etc.)
      console.warn(`Geocoding failed for ${address}: ${data.status}`);
      
      const errorResult: GeocodeResult = {
        latitude: 0,
        longitude: 0,
        formatted_address: address,
        success: false,
      };

      // Don't cache failures - might succeed on retry
      return errorResult;
    }
  } catch (error) {
    console.error(`Geocoding error for ${address}:`, error);
    
    return {
      latitude: 0,
      longitude: 0,
      formatted_address: address,
      success: false,
    };
  }
}

/**
 * Geocode a shopping center property
 * Returns null if geocoding fails (property will not appear on map)
 */
export async function geocodeProperty(
  property: ShoppingCenter
): Promise<GeocodedProperty | null> {
  // If property already has valid coordinates from backend, use those
  if (
    property.latitude !== null &&
    property.longitude !== null &&
    property.latitude !== 0 &&
    property.longitude !== 0
  ) {
    return {
      ...property,
      latitude: property.latitude,
      longitude: property.longitude,
      geocoded: true,
      geocode_source: 'backend',
    } as GeocodedProperty;
  }

  // Otherwise, geocode the address
  const address = formatAddressForGeocoding(property);
  const geocodeResult = await geocodeAddress(address);

  if (geocodeResult.success) {
    return {
      ...property,
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      geocoded: true,
      geocode_source: geocodeCache[address] ? 'cache' : 'api',
    } as GeocodedProperty;
  }

  // Geocoding failed - property will not appear on map
  console.warn(`Geocoding failed for: ${property.shopping_center_name}`, {
    address,
    property_id: property.id,
    error: 'Address could not be converted to coordinates',
  });
  
  return null;
}

/**
 * Geocode multiple properties with rate limiting
 * Google has a limit of 50 requests per second
 * Failed geocodes are excluded from results (properties won't appear on map)
 */
export async function geocodeProperties(
  properties: ShoppingCenter[]
): Promise<GeocodedProperty[]> {
  const geocodedProperties: GeocodedProperty[] = [];
  const failedProperties: string[] = [];
  const BATCH_SIZE = 10; // Process 10 at a time
  const DELAY_MS = 200; // 200ms delay between batches (5 batches/second)

  console.log(`Geocoding ${properties.length} properties...`);

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(property => geocodeProperty(property))
    );
    
    // Filter out null results (failed geocodes) and track failures
    batchResults.forEach((result, index) => {
      if (result !== null) {
        geocodedProperties.push(result);
      } else {
        failedProperties.push(batch[index].shopping_center_name);
      }
    });

    // Log progress
    const processed = Math.min(i + BATCH_SIZE, properties.length);
    console.log(`Geocoded ${processed}/${properties.length} properties`);

    // Delay before next batch (except for last batch)
    if (i + BATCH_SIZE < properties.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Summary
  const fromBackend = geocodedProperties.filter(p => p.geocode_source === 'backend').length;
  const fromCache = geocodedProperties.filter(p => p.geocode_source === 'cache').length;
  const fromApi = geocodedProperties.filter(p => p.geocode_source === 'api').length;
  const failed = failedProperties.length;

  console.log('Geocoding complete:', {
    total: properties.length,
    successful: geocodedProperties.length,
    fromBackend,
    fromCache,
    fromApi,
    failed,
  });

  if (failed > 0) {
    console.warn(`${failed} properties failed geocoding and will not appear on map:`, failedProperties);
  }

  return geocodedProperties;
}

/**
 * Clear the geocode cache
 * Useful for testing or if cache becomes corrupted
 */
export function clearGeocodeCache(): void {
  geocodeCache = {};
  try {
    localStorage.removeItem('geocodeCache');
    console.log('Geocode cache cleared');
  } catch (error) {
    console.warn('Failed to clear geocode cache from localStorage:', error);
  }
}

/**
 * Get cache statistics
 */
export function getGeocodeStats(): {
  cacheSize: number;
  cacheKeys: string[];
} {
  return {
    cacheSize: Object.keys(geocodeCache).length,
    cacheKeys: Object.keys(geocodeCache),
  };
}

/**
 * Preload cache with known coordinates
 * Useful for testing or seeding with known good data
 */
export function preloadCache(entries: Record<string, GeocodeResult>): void {
  Object.assign(geocodeCache, entries);
  saveCacheToStorage();
  console.log(`Preloaded ${Object.keys(entries).length} entries into geocode cache`);
}

// Export geocoding service as default
export default {
  geocodeAddress,
  geocodeProperty,
  geocodeProperties,
  clearGeocodeCache,
  getGeocodeStats,
  preloadCache,
};