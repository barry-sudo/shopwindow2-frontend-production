// src/App.tsx
// Updated main App component with property listing functionality

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PropertyListPage } from './pages/PropertyListPage';

function App() {
  return (
    <Router>
      <div style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        {/* Simple Navigation Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1f2937'
            }}>
              Shop Window
            </div>
            
            <nav style={{ display: 'flex', gap: '24px' }}>
              <a 
                href="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#3b82f6', 
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Properties
              </a>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>Map View (Coming Soon)</span>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>Analytics (Coming Soon)</span>
            </nav>

            <div style={{
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Barry Gilbert
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<PropertyListPage />} />
            <Route path="/properties" element={<PropertyListPage />} />
            <Route 
              path="*" 
              element={
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <h2>Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <a 
                    href="/"
                    style={{
                      color: '#3b82f6',
                      textDecoration: 'underline'
                    }}
                  >
                    Go back to Properties
                  </a>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          marginTop: '60px',
          padding: '24px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0 }}>
              Shop Window &copy; 2025 - Commercial Real Estate Analytics Platform
            </p>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <span>Sprint 1 - Property Discovery</span>
              <span>•</span>
              <span>Philadelphia/Wilmington Metro Focus</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;