// Mock API Service for Shop Window
// Implements realistic API responses matching Django backend structure
// Ready to swap with real API once backend is deployed

import { 
  Property, 
  Tenant, 
  PropertyType, 
  TenantCategory, 
  ApiResponse, 
  PaginatedResponse,
  PropertyFilters,
  SearchResult,
  DataSourceType,
  Coordinates
} from '../types/models';

// Mock data generation
const generateMockProperties = (): Property[] => [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    name: 'Brandywine Mills Shopping Center',
    address: {
      street: '3300 Wilmington Pike',
      city: 'Wilmington',
      state: 'DE',
      zip: '19808',
      full_address: '3300 Wilmington Pike, Wilmington, DE 19808'
    },
    property_type: PropertyType.SHOPPING_CENTER,
    owner: 'Brandywine Realty Trust',
    property_manager: 'CBRE Property Management',
    gla_total: 285000,
    coordinates: { lat: 39.7391, lng: -75.6918 },
    year_built: 1995,
    last_renovated: 2018,
    parking_spaces: 1200,
    anchor_tenants: ['Target', 'Best Buy', 'HomeGoods'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-09-10T14:25:00Z'
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    name: 'Shoppes at Dilworthtown Crossing',
    address: {
      street: '1500 W Chester Pike',
      city: 'West Chester',
      state: 'PA',
      zip: '19382',
      full_address: '1500 W Chester Pike, West Chester, PA 19382'
    },
    property_type: PropertyType.STRIP_MALL,
    owner: 'Kimco Realty Corporation',
    property_manager: 'Kimco Property Services',
    gla_total: 125000,
    coordinates: { lat: 39.9526, lng: -75.5927 },
    year_built: 2003,
    parking_spaces: 650,
    anchor_tenants: ['Giant Food', 'CVS Pharmacy'],
    created_at: '2024-02-20T09:15:00Z',
    updated_at: '2024-09-15T16:45:00Z'
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    name: 'Christiana Fashion Center',
    address: {
      street: '132 Christiana Fashion Center',
      city: 'Newark',
      state: 'DE',
      zip: '19702',
      full_address: '132 Christiana Fashion Center, Newark, DE 19702'
    },
    property_type: PropertyType.LIFESTYLE_CENTER,
    owner: 'Brookfield Properties',
    property_manager: 'Brookfield Properties Retail',
    gla_total: 456000,
    coordinates: { lat: 39.6779, lng: -75.6525 },
    year_built: 1987,
    last_renovated: 2015,
    parking_spaces: 2100,
    anchor_tenants: ['Macy\'s', 'JCPenney', 'Target', 'Barnes & Noble'],
    created_at: '2024-01-10T11:20:00Z',
    updated_at: '2024-09-12T13:30:00Z'
  },
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
    name: 'Pike Creek Shopping Center',
    address: {
      street: '5301 Limestone Rd',
      city: 'Wilmington',
      state: 'DE',
      zip: '19808',
      full_address: '5301 Limestone Rd, Wilmington, DE 19808'
    },
    property_type: PropertyType.SHOPPING_CENTER,
    owner: 'Regency Centers Corporation',
    property_manager: 'Regency Centers',
    gla_total: 98000,
    coordinates: { lat: 39.7589, lng: -75.6847 },
    year_built: 1998,
    last_renovated: 2020,
    parking_spaces: 420,
    anchor_tenants: ['Acme Markets', 'Rite Aid'],
    created_at: '2024-03-05T08:45:00Z',
    updated_at: '2024-09-08T12:15:00Z'
  },
  {
    id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    name: 'Concord Plaza',
    address: {
      street: '4737 Concord Pike',
      city: 'Wilmington',
      state: 'DE',
      zip: '19803',
      full_address: '4737 Concord Pike, Wilmington, DE 19803'
    },
    property_type: PropertyType.RETAIL_PLAZA,
    owner: 'Brixmor Property Group',
    property_manager: 'Brixmor Property Management',
    gla_total: 167000,
    coordinates: { lat: 39.7956, lng: -75.5442 },
    year_built: 1985,
    last_renovated: 2019,
    parking_spaces: 750,
    anchor_tenants: ['ShopRite', 'PetSmart'],
    created_at: '2024-02-12T14:20:00Z',
    updated_at: '2024-09-14T10:35:00Z'
  }
];

const generateMockTenants = (): Tenant[] => [
  {
    id: 't1a2b3c4-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    property_id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    name: 'Target',
    suite_number: '100',
    square_footage: 120000,
    category: TenantCategory.ANCHOR,
    base_rent: 15.50,
    lease_expiration: '2029-12-31',
    lease_start: '2019-01-01',
    contact_name: 'Regional Property Manager',
    contact_phone: '(302) 555-0100',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-09-10T14:25:00Z'
  },
  {
    id: 't2b3c4d5-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    property_id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    name: 'Starbucks',
    suite_number: '205',
    square_footage: 2100,
    category: TenantCategory.RESTAURANT,
    base_rent: 45.00,
    lease_expiration: '2027-06-30',
    lease_start: '2022-07-01',
    contact_name: 'Store Manager',
    contact_phone: '(302) 555-0205',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-09-10T14:25:00Z'
  },
  {
    id: 't3c4d5e6-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    property_id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    name: 'Giant Food',
    suite_number: '1',
    square_footage: 55000,
    category: TenantCategory.ANCHOR,
    base_rent: 18.75,
    lease_expiration: '2031-03-31',
    lease_start: '2021-04-01',
    contact_name: 'District Manager',
    contact_phone: '(610) 555-0001',
    created_at: '2024-02-20T09:15:00Z',
    updated_at: '2024-09-15T16:45:00Z'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockApiService {
  private properties: Property[] = generateMockProperties();
  private tenants: Tenant[] = generateMockTenants();

  // Properties API
  async getProperties(filters?: PropertyFilters): Promise<ApiResponse<PaginatedResponse<Property>>> {
    await delay(500); // Simulate network delay
    
    let filteredProperties = [...this.properties];
    
    if (filters) {
      if (filters.property_type && filters.property_type.length > 0) {
        filteredProperties = filteredProperties.filter(p => 
          filters.property_type!.includes(p.property_type)
        );
      }
      
      if (filters.min_gla) {
        filteredProperties = filteredProperties.filter(p => p.gla_total >= filters.min_gla!);
      }
      
      if (filters.max_gla) {
        filteredProperties = filteredProperties.filter(p => p.gla_total <= filters.max_gla!);
      }
      
      if (filters.city && filters.city.length > 0) {
        filteredProperties = filteredProperties.filter(p => 
          filters.city!.includes(p.address.city)
        );
      }
      
      if (filters.search_query) {
        const query = filters.search_query.toLowerCase();
        filteredProperties = filteredProperties.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.address.city.toLowerCase().includes(query) ||
          p.owner.toLowerCase().includes(query)
        );
      }
    }
    
    return {
      data: {
        results: filteredProperties,
        count: filteredProperties.length,
        next: null,
        previous: null
      },
      status: 'success'
    };
  }

  async getProperty(id: string): Promise<ApiResponse<Property>> {
    await delay(300);
    
    const property = this.properties.find(p => p.id === id);
    
    if (!property) {
      throw new Error(`Property with ID ${id} not found`);
    }
    
    return {
      data: property,
      status: 'success'
    };
  }

  async createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Property>> {
    await delay(800);
    
    const newProperty: Property = {
      ...propertyData,
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.properties.push(newProperty);
    
    return {
      data: newProperty,
      status: 'success',
      message: 'Property created successfully'
    };
  }

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    await delay(600);
    
    const propertyIndex = this.properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      throw new Error(`Property with ID ${id} not found`);
    }
    
    const updatedProperty: Property = {
      ...this.properties[propertyIndex],
      ...propertyData,
      updated_at: new Date().toISOString()
    };
    
    this.properties[propertyIndex] = updatedProperty;
    
    return {
      data: updatedProperty,
      status: 'success',
      message: 'Property updated successfully'
    };
  }

  // Tenants API
  async getTenants(propertyId?: string): Promise<ApiResponse<PaginatedResponse<Tenant>>> {
    await delay(400);
    
    let filteredTenants = [...this.tenants];
    
    if (propertyId) {
      filteredTenants = filteredTenants.filter(t => t.property_id === propertyId);
    }
    
    return {
      data: {
        results: filteredTenants,
        count: filteredTenants.length,
        next: null,
        previous: null
      },
      status: 'success'
    };
  }

  async getTenant(id: string): Promise<ApiResponse<Tenant>> {
    await delay(250);
    
    const tenant = this.tenants.find(t => t.id === id);
    
    if (!tenant) {
      throw new Error(`Tenant with ID ${id} not found`);
    }
    
    return {
      data: tenant,
      status: 'success'
    };
  }

  // Search API
  async searchProperties(query: string, filters?: PropertyFilters): Promise<ApiResponse<SearchResult>> {
    await delay(600);
    
    const searchFilters: PropertyFilters = {
      ...filters,
      search_query: query
    };
    
    const response = await this.getProperties(searchFilters);
    
    return {
      data: {
        properties: response.data.results,
        total_count: response.data.count,
        filters_applied: searchFilters
      },
      status: 'success'
    };
  }

  // Map-specific API
  async getPropertiesInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<ApiResponse<Property[]>> {
    await delay(400);
    
    const propertiesInBounds = this.properties.filter(property => {
      const { lat, lng } = property.coordinates;
      return lat <= bounds.north && 
             lat >= bounds.south && 
             lng <= bounds.east && 
             lng >= bounds.west;
    });
    
    return {
      data: propertiesInBounds,
      status: 'success'
    };
  }

  // Health check endpoint (matching backend)
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    await delay(100);
    
    return {
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      status: 'success'
    };
  }
}

// Export singleton instance
export const mockApi = new MockApiService();

// Export individual API functions for easier importing
export const propertiesApi = {
  getAll: (filters?: PropertyFilters) => mockApi.getProperties(filters),
  getById: (id: string) => mockApi.getProperty(id),
  create: (data: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => mockApi.createProperty(data),
  update: (id: string, data: Partial<Property>) => mockApi.updateProperty(id, data),
  search: (query: string, filters?: PropertyFilters) => mockApi.searchProperties(query, filters),
  getInBounds: (bounds: { north: number; south: number; east: number; west: number }) => 
    mockApi.getPropertiesInBounds(bounds)
};

export const tenantsApi = {
  getAll: (propertyId?: string) => mockApi.getTenants(propertyId),
  getById: (id: string) => mockApi.getTenant(id)
};

// API configuration that can be easily swapped for production
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' ? 
    'https://shop-window-api.render.com' : 
    'http://localhost:8000',
  USE_MOCK: process.env.NODE_ENV !== 'production' || !process.env.REACT_APP_API_URL,
  TIMEOUT: 10000
};

// Function to switch between mock and real API
export const getApiService = () => {
  if (API_CONFIG.USE_MOCK) {
    console.log('🔧 Using Mock API Service - Switch to real API when backend is ready');
    return mockApi;
  }
  
  // TODO: Import and return real API service when backend is deployed
  // import { realApiService } from './realApi';
  // return realApiService;
  return mockApi;
};