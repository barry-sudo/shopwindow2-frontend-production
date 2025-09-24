import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModeProvider } from './contexts/ModeContext';
import { Layout } from './components/layout/Layout';
import { MapView } from './pages/MapView';
import { PropertyDetail } from './pages/PropertyDetail';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/design-tokens.css';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <ModeProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                {/* Default route - redirect to map view */}
                <Route path="/" element={<Navigate to="/map" replace />} />
                
                {/* Main map view - prioritized per PM guidance */}
                <Route path="/map" element={<MapView />} />
                
                {/* Property detail view */}
                <Route path="/property/:propertyId" element={<PropertyDetail />} />
                
                {/* Future routes ready for Sprint 2+ */}
                {/* <Route path="/import" element={<ImportView />} /> */}
                {/* <Route path="/admin" element={<AdminPortal />} /> */}
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/map" replace />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </ModeProvider>
    </ErrorBoundary>
  );
}

export default App;
