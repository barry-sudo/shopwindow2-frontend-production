// Shop Window - TypeScript Model Interfaces
// Based on Django backend models and API specification

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  full_address?: string;
}

export enum PropertyType {
  SHOPPING_CENTER = 'shopping_center',
  STRIP_MALL = 'strip_mall',
  RETAIL_PLAZA = 'retail_plaza',
  LIFESTYLE_CENTER = 'lifestyle_center',
  OUTLET_CENTER = 'outlet_center',
  DEPARTMENT_STORE = 'department_store',
  BIG_BOX = 'big_box',
  OTHER = 'other'
}

export enum DataSourceType {
  VERIFIED = 'verified',
  SCENARIO = 'scenario'
}

// Updated Property interface for hook compatibility
export interface Property {
  id: string;
  name: string;
  address: Address;
  property_type: PropertyType;
  owner: string;
  property_manager: string;
  gla_total: number; // Gross Leasable Area in sq ft
  coordinates: Coordinates; // This is what useGoogleMaps hook expects
  year_built?: number;
  last_renovated?: number;
  parking_spaces?: number;
  anchor_tenants?: string[];
  created_at: string;
  updated_at: string;
  
  // Additional fields for compatibility with existing components
  square_footage?: number; // Alias for gla_total
  occupancy_rate?: number;
  data_quality_score?: number;
  tenant_count?: number;
  
  // Django API compatibility
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] - Django format
  };
}

// Shopping Center interface (for Django API compatibility)
export interface ShoppingCenter {
  id: number;
  shopping_center_name: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  latitude?: string;
  longitude?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  total_gla?: number;
  center_type?: string;
  owner?: string;
  property_manager?: string;
  tenant_count: number;
  occupancy_rate: number;
  data_quality_score: number;
  quality_score_display: {
    score: number;
    label: string;
    percentage: string;
  };
  created_at: string;
  updated_at: string;
}

export enum TenantCategory {
  ANCHOR = 'anchor',
  RESTAURANT = 'restaurant',
  RETAIL = 'retail',
  SERVICE = 'service',
  ENTERTAINMENT = 'entertainment',
  HEALTH_FITNESS = 'health_fitness',
  PROFESSIONAL = 'professional',
  OTHER = 'other'
}

export interface Tenant {
  id: string;
  property_id: string;
  name: string;
  suite_number: string;
  square_footage: number;
  category: TenantCategory;
  base_rent: number; // per sq ft annually
  lease_expiration: string; // ISO date string
  lease_start: string; // ISO date string
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  
  // Django API compatibility fields
  tenant_name?: string;
  tenant_suite_number?: string;
  shopping_center?: number;
  occupancy_status?: 'OCCUPIED' | 'VACANT' | 'PENDING' | 'UNKNOWN';
  is_anchor?: boolean;
  retail_category?: string[];
  ownership_type?: string;
  lease_status?: string;
}

export interface DataSource {
  field_id: string;
  property_id: string;
  tenant_id?: string;
  source_type: DataSourceType;
  source_name: string; // e.g., "CBRE Market Report", "Manual Entry", "Scenario Analysis"
  confidence_level: number; // 0-100
  last_verified: string;
  notes?: string;
}

export interface ImportBatch {
  id: string;
  filename: string;
  import_type: 'csv' | 'pdf' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  failed_records: number;
  error_log?: string;
  created_at: string;
  completed_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Enhanced API Error interface for hooks compatibility
export interface ApiError {
  message: string;
  code?: string;
  field_errors?: Record<string, string[]>;
  status_code: number;
  details?: string; // Added for useApi hook compatibility
}

// Form Types
export interface PropertyFormData {
  name: string;
  address: Address;
  property_type: PropertyType;
  owner: string;
  property_manager: string;
  gla_total: number;
  coordinates: Coordinates;
  year_built?: number;
  parking_spaces?: number;
}

export interface TenantFormData {
  property_id: string;
  name: string;
  suite_number: string;
  square_footage: number;
  category: TenantCategory;
  base_rent: number;
  lease_expiration: string;
  lease_start: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

// Map-related Types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PropertyMarker {
  property: Property;
  position: Coordinates;
  isSelected?: boolean;
  isHovered?: boolean;
}

// Two-Mode System Types
export interface ModeContext {
  mode: DataSourceType;
  toggleMode: () => void;
  isScenarioMode: boolean;
}

// Enhanced Filter and Search Types
export interface PropertyFilters {
  property_type?: PropertyType[];
  min_gla?: number;
  max_gla?: number;
  city?: string[];
  state?: string[];
  owner?: string[];
  has_vacancy?: boolean;
  search_query?: string;
  
  // Additional filter fields for component compatibility
  searchTerm?: string;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minOccupancy?: number;
  maxOccupancy?: number;
  minDataQuality?: number;
  centerType?: string;
}

export interface SearchResult {
  properties: Property[];
  total_count: number;
  filters_applied: PropertyFilters;
}

// Component Props Types
export interface PropertyCardProps {
  property: Property;
  mode: DataSourceType;
  onClick?: () => void;
  className?: string;
}

export interface MapViewProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect: (property: Property) => void;
  bounds?: MapBounds;
  zoom?: number;
  center?: Coordinates;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: ApiError | null;
  data?: any;
}

// Local Storage Types for Scenario Mode
export interface ScenarioData {
  property_id: string;
  modifications: {
    field_name: string;
    original_value: any;
    scenario_value: any;
    notes?: string;
  }[];
  created_at: string;
  name?: string;
}

// Analytics and Metrics Types
export interface PropertyMetrics {
  total_gla: number;
  occupied_gla: number;
  vacancy_rate: number;
  average_rent_psf: number;
  tenant_count: number;
  anchor_tenant_count: number;
}

export interface MarketMetrics {
  total_properties: number;
  total_gla: number;
  average_vacancy_rate: number;
  median_rent_psf: number;
  property_types_distribution: Record<PropertyType, number>;
}

// Navigation Types
export interface RouteParams {
  propertyId?: string;
  view?: 'map' | 'list' | 'detail';
}

export interface NavigationTab {
  id: string;
  label: string;
  path: string;
  active: boolean;
}

// Export utility type for ensuring all required props
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Hook-specific types
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

// Google Maps hook types
export interface UseGoogleMapsOptions {
  center: Coordinates;
  zoom: number;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  onCenterChanged?: (center: Coordinates) => void;
  onZoomChanged?: (zoom: number) => void;
}

// Scenario storage hook types
export interface ScenarioStorageData {
  [propertyId: string]: {
    [field: string]: any;
    lastModified: string;
  };
}
