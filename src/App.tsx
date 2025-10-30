import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapView } from './pages/MapView';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import './styles/design-tokens.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Map-First Discovery */}
        <Route path="/" element={<MapView />} />
        
        {/* Property Detail Page */}
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        
        {/* 404 Not Found */}
        <Route 
          path="*" 
          element={
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-secondary)'
            }}>
              <h2 style={{ 
                fontSize: 'var(--font-size-2xl)',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-text)'
              }}>
                Page Not Found
              </h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                The page you're looking for doesn't exist.
              </p>
              <a 
                href="/"
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'underline',
                  fontSize: 'var(--font-size-base)'
                }}
              >
                Go back to Dashboard
              </a>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
