// src/pages/PropertyListPage.tsx
// Main page component for displaying property listings

import React from 'react';
import { PropertyList } from '../components/properties/PropertyList';

export const PropertyListPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Page Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '24px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: 700,
            color: '#111827'
          }}>
            Commercial Properties
          </h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Discover and analyze retail commercial real estate opportunities across your target markets
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <PropertyList />
      </div>
    </div>
  );
};