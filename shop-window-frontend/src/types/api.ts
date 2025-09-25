// src/types/api.ts
// TypeScript types that exactly match Django models
// This ensures type safety between frontend and backend

// =============================================================================
// SHOPPING CENTER TYPES
// =============================================================================

export interface ShoppingCenter {
  // Identity fields
  id: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string

  // Required fields
  shopping_center_name: string;

  // Address components (EXTRACT fields from Django model)
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;

  // Contact information
  contact_name?: string | null;
  contact_phone?: string | null;

  // Property specifications
  total_gla?: number | null; // Gross Leasable Area in square feet

  // DETERMINE fields (calculated by backend)
  center_type?: CenterType | null;
  latitude?: string | null; // Django DecimalField becomes string in JSON
  longitude?: string | null;
  location?: GeoPoint | null; // PostGIS Point field
  calculated_gla?: number | null;

  // DEFINE fields (manual entry expected)
  county?: string | null;
  municipality?: string | null;
  zoning_authority?: string | null;
  year_built?: number | null;
  owner?: string | null;
  property_manager?: string | null;
  leasing_agent?: string | null;
  leasing_brokerage?: string | null;

  // Metadata fields
  data_quality_score: number; // 0-100
  import_batch?: number | null; // Foreign key ID
  last_import_batch?: number | null; // Foreign key ID

  // Related data (populated by serializers)
  tenants?: Tenant[];
  tenant_count?: number;
  occupied_tenant_count?: number;
  vacancy_rate?: number | null;
}

// Center type choices matching Django model
export type CenterType = 
  | 'Strip/Convenience'
  | 'Neighborhood Center'
  | 'Community Center'
  | 'Regional Mall'
  | 'Super-Regional Mall';

// PostGIS Point representation in JSON
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// For creating new shopping centers (excludes auto-generated fields)
export interface CreateShoppingCenterData {
  shopping_center_name: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  contact_name?: string;
  contact_phone?: string;
  total_gla?: number;
  county?: string;
  municipality?: string;
  zoning_authority?: string;
  year_built?: number;
  owner?: string;
  property_manager?: string;
  leasing_agent?: string;
  leasing_brokerage?: string;
}

// For updating existing shopping centers (all fields optional)
export interface UpdateShoppingCenterData extends Partial<CreateShoppingCenterData> {}

// =============================================================================
// TENANT TYPES
// =============================================================================

export interface Tenant {
  // Identity fields
  id: number;
  shopping_center: number; // Foreign key ID
  created_at: string;
  updated_at: string;

  // EXTRACT fields
  tenant_name: string;
  tenant_suite_number?: string | null;
  square_footage?: number | null;

  // DEFINE fields
  retail_category?: string[] | null; // ArrayField becomes array in JSON
  ownership_type?: OwnershipType | null;

  // Lease terms
  base_rent?: string | null; // DecimalField becomes string in JSON
  lease_term?: number | null; // months
  lease_commence?: string | null; // Date becomes string in JSON
  lease_expiration?: string | null;

  // Credit assessment
  credit_category?: CreditCategory | null;

  // Status fields
  is_anchor: boolean;
  occupancy_status: OccupancyStatus;

  // Related data (populated by serializers)
  shopping_center_name?: string;
  rent_per_sq_ft?: number | null;
  lease_status?: LeaseStatus;
  is_lease_expiring_soon?: boolean | null;
}

// Ownership type choices matching Django model
export type OwnershipType = 
  | 'FRANCHISE'
  | 'CORPORATE'
  | 'INDEPENDENT'
  | 'CHAIN';

// Credit category choices
export type CreditCategory = 
  | 'AAA'
  | 'AA'
  | 'A'
  | 'BBB'
  | 'BB'
  | 'B'
  | 'UNKNOWN';

// Occupancy status choices
export type OccupancyStatus = 
  | 'OCCUPIED'
  | 'VACANT'
  | 'PENDING'
  | 'UNKNOWN';

// Calculated lease status
export type LeaseStatus = 
  | 'ACTIVE'
  | 'EXPIRED'
  | 'FUTURE'
  | 'UNKNOWN';

// For creating new tenants
export interface CreateTenantData {
  shopping_center: number; // Required foreign key
  tenant_name: string;
  tenant_suite_number?: string;
  square_footage?: number;
  retail_category?: string[];
  ownership_type?: OwnershipType;
  base_rent?: number; // Will be converted to decimal string by backend
  lease_term?: number;
  lease_commence?: string; // ISO date string
  lease_expiration?: string;
  credit_category?: CreditCategory;
  is_anchor?: boolean;
  occupancy_status?: OccupancyStatus;
}

// For updating existing tenants
export interface UpdateTenantData extends Partial<CreateTenantData> {}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

export interface ShoppingCenterSearchParams {
  page?: number;
  page_size?: number;
  search?: string; // Searches name, city, state, center_type
  address_city?: string;
  address_state?: string;
  center_type?: CenterType;
  min_gla?: number;
  max_gla?: number;
  min_quality_score?: number;
  has_coordinates?: boolean;
  created_after?: string; // ISO date
  created_before?: string;
  ordering?: ShoppingCenterOrderField;
}

export type ShoppingCenterOrderField = 
  | 'shopping_center_name'
  | '-shopping_center_name'
  | 'total_gla'
  | '-total_gla'
  | 'year_built'
  | '-year_built'
  | 'created_at'
  | '-created_at'
  | 'data_quality_score'
  | '-data_quality_score';

// =============================================================================
// API RESPONSE WRAPPER TYPES
// =============================================================================

// Standard paginated response from Django REST framework
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Standard error response format
export interface ApiErrorResponse {
  detail?: string;
  [field: string]: string | string[] | undefined;
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login?: string | null;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Utility type for making all properties optional (useful for updates)
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for making specific properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Type guard functions
export const isShoppingCenter = (obj: any): obj is ShoppingCenter => {
  return obj && typeof obj === 'object' && 'shopping_center_name' in obj;
};

export const isTenant = (obj: any): obj is Tenant => {
  return obj && typeof obj === 'object' && 'tenant_name' in obj && 'shopping_center' in obj;
};

export const isApiError = (obj: any): obj is ApiErrorResponse => {
  return obj && typeof obj === 'object' && ('detail' in obj || Object.keys(obj).length > 0);
};