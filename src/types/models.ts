/**
 * Shop Window - TypeScript Type Definitions
 * UPDATED: 2025-10-10 to match backend serializers exactly
 * UPDATED: 2025-10-22 to add avg_base_rent_psf field
 * UPDATED: 2025-10-23 to add lease_commence field (normalized from lease_start)
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/types/models.ts
 * 
 * Based on Django backend serializers:
 * - ShoppingCenterDetailSerializer (includes nested tenants)
 * - TenantListSerializer (12 fields)
 */

// ===== TENANT TYPES =====

export interface Tenant {
  id: number;
  
  // Basic info
  tenant_name: string;
  tenant_suite_number: string | null;
  square_footage: number | null;
  
  // Classification
  retail_category: string | null;
  major_group: string | null; // 8-category system for tenant mix
  ownership_type: string | null;
  
  // Financial
  base_rent: number | null;
  
  // Lease information
  lease_commence: string | null; // ISO date string - ADDED 2025-10-23
  lease_expiration: string | null; // ISO date string
  
  // Computed fields (from backend SerializerMethodFields)
  rent_per_sq_ft: number | null;
  annual_rent: number | null;
  lease_status: 'Active' | 'Expiring Soon' | 'Expired' | 'Unknown';
  is_lease_expiring_soon: boolean;
}

// ===== SHOPPING CENTER TYPES =====

export interface ShoppingCenter {
  id: number;
  shopping_center_name: string;
  
  // Address fields
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  
  // Property details
  center_type: string | null;
  total_gla: number | null;
  year_built: number | null;
  
  // Ownership & management
  owner: string | null;
  property_manager: string | null;
  leasing_agent: string | null;
  leasing_brokerage: string | null;
  
  // Geographic/regulatory
  county: string | null;
  municipality: string | null;
  zoning_authority: string | null;
  
  // Coordinates
  latitude: number | null;
  longitude: number | null;
  coordinates: [number, number] | null; // [lng, lat] for mapping
  
  // Computed fields (from backend SerializerMethodFields)
  tenant_count: number;
  occupied_tenant_count: number;
  vacancy_rate: number; // 0.0 to 100.0
  full_address: string;
  avg_base_rent_psf: number | null; // NEW - Added 2025-10-22 for LeanDashboard
  
  // Related data - CRITICAL: Backend includes nested tenants array
  tenants: Tenant[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Lean version for list views and map markers
export interface ShoppingCenterSummary {
  id: number;
  shopping_center_name: string;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  center_type: string | null;
  total_gla: number | null;
  
  // Coordinates
  latitude: number | null;
  longitude: number | null;
  
  // Computed metrics
  tenant_count: number;
  vacancy_rate: number | null;
  full_address: string;
  avg_base_rent_psf: number | null; // NEW - Added 2025-10-22 for LeanDashboard
  
  // Additional fields for map display
  owner: string | null;
  property_manager: string | null;
  county: string | null;
}

// ===== API RESPONSE TYPES =====

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

// ===== FILTER TYPES =====

export interface PropertyFilters {
  center_type?: string;
  owner?: string;
  property_manager?: string;
  state?: string;
  county?: string;
  search?: string;
}

// ===== GEOCODING TYPES =====

export interface GeocodedProperty extends ShoppingCenter {
  // Override to ensure coordinates exist after geocoding
  latitude: number;
  longitude: number;
  geocoded: boolean;
  geocode_source?: 'cache' | 'api' | 'backend';
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  success: boolean;
}

export interface GeocodeCache {
  [address: string]: GeocodeResult;
}

// ===== LEAN DASHBOARD TYPES =====

export interface LeanDashboardData {
  property_id: number;
  property_name: string;
  address: string;
  center_type: string | null;
  metrics: {
    total_sf: string; // Formatted (e.g., "156K")
    occupancy: string; // Formatted (e.g., "94%")
    avg_rent_psf: string; // Formatted (e.g., "$18.50")
    tenants: string; // Formatted (e.g., "23")
  };
}

// ===== UI STATE TYPES =====

export interface MapViewState {
  properties: GeocodedProperty[];
  selectedProperty: GeocodedProperty | null;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;
  showLeanDashboard: boolean;
}

// ===== ENUMS & CONSTANTS =====

/**
 * Shopping Center Types based on ICSC (International Council of Shopping Centers)
 * U.S. Shopping-Center Classification and Characteristics (January 2017)
 */
export const CenterTypes = [
  // General-Purpose Centers
  'Super-Regional Mall',
  'Regional Mall',
  'Community Center',
  'Neighborhood Center',
  'Strip/Convenience',
  
  // Specialized-Purpose Centers
  'Power Center',
  'Lifestyle',
  'Factory Outlet',
  'Theme/Festival',
  
  // Limited-Purpose Property
  'Airport Retail',
] as const;

export type CenterType = typeof CenterTypes[number];

/**
 * 8-Category Tenant Classification System
 * Used for tenant mix analysis and visualization
 * 
 * Backend field: major_group
 */
export const MajorGroups = [
  'anchors_majors',
  'inline_retail',
  'food_beverage',
  'services',
  'entertainment_leisure',
  'other_nonretail',
  'seasonal_popup',
  'vacant',
] as const;

export type MajorGroup = typeof MajorGroups[number];

/**
 * Display names for major groups (for UI)
 */
export const MajorGroupLabels: Record<MajorGroup, string> = {
  anchors_majors: 'Anchors & Majors',
  inline_retail: 'Inline Retail',
  food_beverage: 'Food & Beverage',
  services: 'Services',
  entertainment_leisure: 'Entertainment / Leisure',
  other_nonretail: 'Other / Non-Retail',
  seasonal_popup: 'Seasonal / Pop-Up',
  vacant: 'Vacant',
};

/**
 * Colors for major groups (for visualizations)
 */
export const MajorGroupColors: Record<MajorGroup, string> = {
  anchors_majors: '#4a6fa5',
  inline_retail: '#7dd3c0',
  food_beverage: '#f0ad4e',
  services: '#5bc0de',
  entertainment_leisure: '#9b59b6',
  other_nonretail: '#95a5a6',
  seasonal_popup: '#e74c3c',
  vacant: '#d9534f',
};

/**
 * Lease Status Types
 * From backend Tenant.get_lease_status()
 */
export type LeaseStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Unknown';

/**
 * Status badge colors for UI
 */
export const LeaseStatusColors: Record<LeaseStatus, { bg: string; text: string }> = {
  Active: { bg: '#d4edda', text: '#155724' },
  'Expiring Soon': { bg: '#fff3cd', text: '#856404' },
  Expired: { bg: '#f8d7da', text: '#721c24' },
  Unknown: { bg: '#e2e8f0', text: '#4a5568' },
};
