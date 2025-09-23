import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/design-tokens.css';
import './styles/globals.css';

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains a div with id="root"');
}

// Create React root and render the application
const root = ReactDOM.createRoot(rootElement);

// Add class to body to indicate app has loaded (hides loading spinner)
document.body.classList.add('app-loaded');

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Development mode logging
if (import.meta.env.DEV) {
  console.log('🚀 Shop Window Frontend - Sprint 1 Implementation');
  console.log('📋 Core Features Available:');
  console.log('  ✅ React + TypeScript foundation');
  console.log('  ✅ Complete design system with CSS tokens');
  console.log('  ✅ Google Maps integration with property markers');
  console.log('  ✅ Two-mode system (Verified/Scenario)');
  console.log('  ✅ Property search and filtering');
  console.log('  ✅ Mock API service ready for backend integration');
  console.log('  ✅ Responsive layout framework');
  console.log('  ⚠️  Set VITE_GOOGLE_MAPS_API_KEY environment variable for maps');
}