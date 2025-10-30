import React, { useState, useMemo } from 'react';
import type { ShoppingCenter, MajorGroup } from '../../types/models';
import { MajorGroupLabels, MajorGroupColors, LeaseStatusColors } from '../../types/models';
import '../../styles/design-tokens.css';

/**
 * Tenants Tab Component - Property Analysis Page
 * 
 * Displays tenant rent roll table with visualizations.
 * Section 3 from wireframe (complete_wireframe_assembly_v3_3.html)
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/property/TenantsTab.tsx
 * 
 * UPDATED: 2025-10-14 - Fixed Annual Rent to use annual_rent field from API
 * UPDATED: 2025-10-23 - Fixed Lease Start to use lease_commence field (normalized from lease_start)
 */

interface TenantsTabProps {
  property: ShoppingCenter;
}

type SortField = 'tenant_name' | 'suite' | 'square_footage' | 'rent_psf' | 'lease_expiration';
type SortDirection = 'asc' | 'desc' | null;

export const TenantsTab: React.FC<TenantsTabProps> = ({ property }) => {
  
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('tenant_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  
  // ========================================================================
  // CALCULATIONS - SUMMARY CARDS
  // ========================================================================
  
  const totalTenants = property.tenant_count;
  const vacantUnits = totalTenants - property.occupied_tenant_count;
  
  const occupiedGLA = useMemo(() => {
    if (!property.tenants || property.tenants.length === 0) return 0;
    return property.tenants
      .filter(t => t.tenant_name !== 'Vacant')
      .reduce((sum, t) => sum + (t.square_footage || 0), 0);
  }, [property.tenants]);
  
  const occupancyRate = property.vacancy_rate !== null 
    ? (100 - property.vacancy_rate).toFixed(1) 
    : '—';
  
  const avgLeaseTermRemaining = useMemo(() => {
    const activeTenants = property.tenants.filter(
      t => t.lease_expiration && t.tenant_name !== 'Vacant'
    );
    
    if (activeTenants.length === 0) return '—';
    
    const totalMonthsRemaining = activeTenants.reduce((sum, t) => {
      const expiration = new Date(t.lease_expiration!);
      const today = new Date();
      const monthsRemaining = Math.max(0, 
        (expiration.getFullYear() - today.getFullYear()) * 12 + 
        (expiration.getMonth() - today.getMonth())
      );
      return sum + monthsRemaining;
    }, 0);
    
    const avgMonths = totalMonthsRemaining / activeTenants.length;
    const years = Math.floor(avgMonths / 12);
    const months = Math.round(avgMonths % 12);
    
    return `${years}.${months} years`;
  }, [property.tenants]);
  
  const expiringWithin12Months = useMemo(() => {
    return property.tenants.filter(t => t.is_lease_expiring_soon).length;
  }, [property.tenants]);
  
  // ========================================================================
  // FILTERING AND SORTING
  // ========================================================================
  
  const filteredAndSortedTenants = useMemo(() => {
    let filtered = [...property.tenants];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tenant => 
        tenant.tenant_name.toLowerCase().includes(query) ||
        (tenant.tenant_suite_number && tenant.tenant_suite_number.toLowerCase().includes(query)) ||
        (tenant.retail_category && tenant.retail_category.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        
        switch (sortField) {
          case 'tenant_name':
            aVal = a.tenant_name.toLowerCase();
            bVal = b.tenant_name.toLowerCase();
            break;
          case 'suite':
            aVal = a.tenant_suite_number || '';
            bVal = b.tenant_suite_number || '';
            break;
          case 'square_footage':
            aVal = a.square_footage || 0;
            bVal = b.square_footage || 0;
            break;
          case 'rent_psf':
            aVal = a.rent_per_sq_ft || 0;
            bVal = b.rent_per_sq_ft || 0;
            break;
          case 'lease_expiration':
            aVal = a.lease_expiration ? new Date(a.lease_expiration).getTime() : 0;
            bVal = b.lease_expiration ? new Date(b.lease_expiration).getTime() : 0;
            break;
          default:
            return 0;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [property.tenants, searchQuery, sortField, sortDirection]);
  
  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or clear
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('tenant_name');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleExportCSV = () => {
    // CSV headers
    const headers = [
      'Tenant Name',
      'Category',
      'Subcategory',
      'Suite #',
      'Space (SF)',
      'Base Rent/SF',
      'Annual Rent',
      'Lease Start',
      'Lease End',
      'Status'
    ];
    
    const rows = filteredAndSortedTenants.map(tenant => [
      tenant.tenant_name,
      tenant.major_group ? MajorGroupLabels[tenant.major_group as MajorGroup] : '',
      tenant.retail_category || '',
      tenant.tenant_suite_number || '',
      tenant.square_footage?.toString() || '',
      tenant.rent_per_sq_ft?.toString() || '',
      tenant.annual_rent?.toString() || '', // FIXED: Use annual_rent from API
      tenant.lease_commence || '', // FIXED: Use lease_commence field
      tenant.lease_expiration || '',
      tenant.lease_status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${property.shopping_center_name}_tenants.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };
  
  // ========================================================================
  // VISUALIZATIONS - TENANT MIX PIE CHART
  // ========================================================================
  
  const tenantMixData = useMemo(() => {
    const categoryCounts = property.tenants.reduce((acc, tenant) => {
      const group = tenant.major_group || 'other_nonretail';
      const sqft = tenant.square_footage || 0;
      
      if (!acc[group]) {
        acc[group] = { count: 0, sqft: 0 };
      }
      acc[group].count += 1;
      acc[group].sqft += sqft;
      
      return acc;
    }, {} as Record<string, { count: number; sqft: number }>);
    
    // Convert to array and sort by sqft (largest first)
    return Object.entries(categoryCounts)
      .map(([group, data]) => ({
        group: group as MajorGroup,
        label: MajorGroupLabels[group as MajorGroup],
        color: MajorGroupColors[group as MajorGroup],
        count: data.count,
        sqft: data.sqft,
        percentage: property.total_gla ? (data.sqft / property.total_gla * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.sqft - a.sqft);
  }, [property.tenants, property.total_gla]);
  
  // ========================================================================
  // VISUALIZATIONS - LEASE EXPIRATION TIMELINE
  // ========================================================================
  
  const leaseTimelineData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearBuckets: Record<string, number> = {};
    
    property.tenants.forEach(tenant => {
      if (!tenant.lease_expiration || tenant.tenant_name === 'Vacant') return;
      
      const expYear = new Date(tenant.lease_expiration).getFullYear();
      const yearKey = expYear <= currentYear + 4 ? expYear.toString() : '2030+';
      
      yearBuckets[yearKey] = (yearBuckets[yearKey] || 0) + 1;
    });
    
    // Create array sorted by year
    const years = [
      currentYear.toString(),
      (currentYear + 1).toString(),
      (currentYear + 2).toString(),
      (currentYear + 3).toString(),
      (currentYear + 4).toString(),
      '2030+'
    ];
    
    return years.map(year => ({
      year,
      count: yearBuckets[year] || 0
    }));
  }, [property.tenants]);
  
  const maxLeaseCount = Math.max(...leaseTimelineData.map(d => d.count), 1);
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <div style={{ padding: '0 30px 40px 30px' }}>
      
      {/* TENANT SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '25px'
      }}>
        
        {/* Card 1: Total Tenants */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          padding: '18px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Total Tenants
          </div>
          <div style={{
            fontSize: '26px',
            fontWeight: 600,
            color: '#333'
          }}>
            {totalTenants}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            marginTop: '4px'
          }}>
            {vacantUnits} vacant units
          </div>
        </div>
        
        {/* Card 2: Occupied GLA */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          padding: '18px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Occupied GLA
          </div>
          <div style={{
            fontSize: '26px',
            fontWeight: 600,
            color: '#333'
          }}>
            {occupiedGLA.toLocaleString()} SF
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            marginTop: '4px'
          }}>
            {occupancyRate}% occupancy
          </div>
        </div>
        
        {/* Card 3: Avg Lease Term Remaining */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          padding: '18px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Avg Lease Term Remaining
          </div>
          <div style={{
            fontSize: '26px',
            fontWeight: 600,
            color: '#333'
          }}>
            {avgLeaseTermRemaining}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            marginTop: '4px'
          }}>
            {expiringWithin12Months} expiring within 12 mos
          </div>
        </div>
        
        {/* Card 4: Tenant Data Notes */}
        <div style={{
          background: '#fffbf0',
          border: '1px solid #f0e68c',
          borderRadius: '6px',
          padding: '18px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Tenant Data Notes
          </div>
          <div style={{
            fontSize: '13px',
            color: '#856404',
            lineHeight: '1.6'
          }}>
            • {property.occupied_tenant_count} leases verified from records<br/>
            • {totalTenants - property.occupied_tenant_count} rent rates from market data<br/>
            • Lease dates current Feb 2025<br/>
            • CAM charges excluded
          </div>
        </div>
        
      </div>
      
      {/* MAIN TWO-COLUMN LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '20px'
      }}>
        
        {/* LEFT COLUMN: TENANT RENT ROLL TABLE */}
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          
          {/* Table Controls */}
          <div style={{
            background: '#f8f9fa',
            padding: '15px 20px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#333'
            }}>
              Tenant Rent Roll
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  width: '180px'
                }}
              />
              <button
                onClick={handleExportCSV}
                style={{
                  padding: '6px 12px',
                  background: '#4a6fa5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                ↓ Export CSV
              </button>
            </div>
          </div>
          
          {/* Table */}
          <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0', zIndex: 10 }}>
                <tr>
                  <th 
                    onClick={() => handleSort('tenant_name')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#333',
                      borderBottom: '2px solid #ddd',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Tenant Name {sortField === 'tenant_name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>
                    Subcategory
                  </th>
                  <th 
                    onClick={() => handleSort('suite')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#333',
                      borderBottom: '2px solid #ddd',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Suite # {sortField === 'suite' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSort('square_footage')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#333',
                      borderBottom: '2px solid #ddd',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Space (SF) {sortField === 'square_footage' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th 
                    onClick={() => handleSort('rent_psf')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#333',
                      borderBottom: '2px solid #ddd',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Base Rent/SF {sortField === 'rent_psf' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>
                    Annual Rent
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>
                    Lease Start
                  </th>
                  <th 
                    onClick={() => handleSort('lease_expiration')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#333',
                      borderBottom: '2px solid #ddd',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Lease End {sortField === 'lease_expiration' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => setSelectedTenantId(tenant.id)}
                    style={{
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      background: selectedTenantId === tenant.id ? '#e8f0f8' : 'white',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => {
                      if (selectedTenantId !== tenant.id) {
                        e.currentTarget.style.background = '#f8f9fa';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedTenantId !== tenant.id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <td style={{ padding: '12px', color: '#4a6fa5', fontWeight: 500 }}>
                      {tenant.tenant_name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {tenant.major_group && (
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          background: '#e8f0f8',
                          color: '#4a6fa5'
                        }}>
                          {MajorGroupLabels[tenant.major_group as MajorGroup]}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.retail_category || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.tenant_suite_number || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.square_footage?.toLocaleString() || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.rent_per_sq_ft ? `$${tenant.rent_per_sq_ft.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.annual_rent ? `$${tenant.annual_rent.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.lease_commence 
                        ? new Date(tenant.lease_commence).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '—'
                      }
                    </td>
                    <td style={{ padding: '12px', color: '#333' }}>
                      {tenant.lease_expiration 
                        ? new Date(tenant.lease_expiration).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '—'
                      }
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: LeaseStatusColors[tenant.lease_status].bg,
                        color: LeaseStatusColors[tenant.lease_status].text
                      }}>
                        {tenant.lease_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Scroll Indicator */}
          <div style={{
            textAlign: 'center',
            padding: '8px',
            background: '#f8f9fa',
            borderTop: '1px solid #ddd',
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            ← Scroll horizontally to view additional columns →
          </div>
          
        </div>
        
        {/* RIGHT COLUMN: VISUALIZATIONS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Tenant Mix Pie Chart */}
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '12px 15px',
              borderBottom: '1px solid #ddd',
              fontWeight: 600,
              fontSize: '14px',
              color: '#333'
            }}>
              Tenant Mix by Category
            </div>
            <div style={{ padding: '15px' }}>
              {/* Pie Chart Placeholder - Would use Chart.js or similar in production */}
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'conic-gradient(' +
                  tenantMixData.map((item, index) => {
                    const prevPercentage = tenantMixData
                      .slice(0, index)
                      .reduce((sum, i) => sum + parseFloat(i.percentage), 0);
                    const currentPercentage = parseFloat(item.percentage);
                    return `${item.color} ${prevPercentage}% ${prevPercentage + currentPercentage}%`;
                  }).join(', ') +
                  ')',
                margin: '0 auto 15px'
              }} />
              
              {/* Legend */}
              <div style={{ fontSize: '12px' }}>
                {tenantMixData.map((item) => (
                  <div
                    key={item.group}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        background: item.color
                      }} />
                      <span>{item.label}</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {(item.sqft / 1000).toFixed(1)}K SF ({item.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Lease Expiration Timeline */}
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '12px 15px',
              borderBottom: '1px solid #ddd',
              fontWeight: 600,
              fontSize: '14px',
              color: '#333'
            }}>
              Lease Expirations by Year
            </div>
            <div style={{ padding: '15px' }}>
              <div style={{ marginTop: '10px' }}>
                {leaseTimelineData.map((yearData) => (
                  <div key={yearData.year} style={{ marginBottom: '15px' }}>
                    <div style={{
                      fontWeight: 600,
                      color: '#4a6fa5',
                      fontSize: '13px',
                      marginBottom: '6px'
                    }}>
                      {yearData.year}
                    </div>
                    <div style={{
                      height: '24px',
                      background: '#e8f0f8',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: '#4a6fa5',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 600,
                        width: `${(yearData.count / maxLeaseCount) * 100}%`,
                        minWidth: yearData.count > 0 ? '30px' : '0'
                      }}>
                        {yearData.count > 0 ? yearData.count : ''}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px'
                    }}>
                      {yearData.count} {yearData.count === 1 ? 'lease' : 'leases'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
};
