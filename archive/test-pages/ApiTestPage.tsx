import { useState } from 'react';
import { apiClient } from '../services/api';
import geocodingService from '../services/geocoding';

/**
 * API Test Page - Milestone 6 Verification
 * Tests backend connection and geocoding service
 */
export const ApiTestPage = () => {
  const [backendStatus, setBackendStatus] = useState<string>('Not tested');
  const [propertiesStatus, setPropertiesStatus] = useState<string>('Not tested');
  const [geocodingStatus, setGeocodingStatus] = useState<string>('Not tested');
  const [envVarsStatus, setEnvVarsStatus] = useState<string>('Not tested');

  // Test 1: Environment Variables
  const testEnvVars = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (apiUrl && mapsKey) {
      setEnvVarsStatus(`✅ Loaded: API=${apiUrl}, Maps Key exists`);
    } else {
      setEnvVarsStatus(`❌ Missing: API=${apiUrl}, Maps=${mapsKey ? 'exists' : 'missing'}`);
    }
  };

  // Test 2: Backend Health Check
  const testBackendHealth = async () => {
    setBackendStatus('Testing...');
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/');
      const data = await response.json();
      setBackendStatus(`✅ Backend healthy: ${JSON.stringify(data)}`);
    } catch (error) {
      setBackendStatus(`❌ Backend error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test 3: Fetch Properties
  const testFetchProperties = async () => {
    setPropertiesStatus('Testing...');
    try {
      const response = await apiClient.getShoppingCenters();
      setPropertiesStatus(`✅ Got ${response.count} properties (showing ${response.results.length})`);
    } catch (error) {
      setPropertiesStatus(`❌ Properties error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test 4: Geocoding Service
  const testGeocoding = async () => {
    setGeocodingStatus('Testing...');
    try {
      const testAddress = '1234 Brandywine Way, Wilmington, DE 19803';
      const coords = await geocodingService.geocodeAddress(testAddress);
      setGeocodingStatus(`✅ Geocoded: lat=${coords.lat.toFixed(6)}, lng=${coords.lng.toFixed(6)}`);
    } catch (error) {
      setGeocodingStatus(`❌ Geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    testEnvVars();
    await testBackendHealth();
    await testFetchProperties();
    await testGeocoding();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c5aa0', marginBottom: '10px' }}>Milestone 6: API & Geocoding Tests</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Testing backend connection and services</p>

      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={runAllTests}
          style={{
            background: '#2c5aa0',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Run All Tests
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Test 1 */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>1. Environment Variables</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Checking if .env file loaded correctly
          </p>
          <button onClick={testEnvVars} style={buttonStyle}>Test Env Vars</button>
          <div style={resultStyle}>{envVarsStatus}</div>
        </div>

        {/* Test 2 */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>2. Backend Health Check</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Testing connection to Django backend at localhost:8000
          </p>
          <button onClick={testBackendHealth} style={buttonStyle}>Test Backend</button>
          <div style={resultStyle}>{backendStatus}</div>
        </div>

        {/* Test 3 */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>3. Fetch Properties API</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Testing API service to fetch shopping centers
          </p>
          <button onClick={testFetchProperties} style={buttonStyle}>Test Properties API</button>
          <div style={resultStyle}>{propertiesStatus}</div>
        </div>

        {/* Test 4 */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>4. Geocoding Service</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Testing Google Maps Geocoding API
          </p>
          <button onClick={testGeocoding} style={buttonStyle}>Test Geocoding</button>
          <div style={resultStyle}>{geocodingStatus}</div>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#e8f5e9', 
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>Expected Results:</h4>
        <ul style={{ color: '#2e7d32', fontSize: '14px', lineHeight: '1.6' }}>
          <li>✅ Env vars should show API URL and Maps key exists</li>
          <li>✅ Backend should return {'{'}status: "healthy"{'}'}</li>
          <li>✅ Properties should return 42 shopping centers</li>
          <li>✅ Geocoding should return coordinates for test address</li>
        </ul>
      </div>
    </div>
  );
};

const buttonStyle = {
  background: '#f0f0f0',
  border: '1px solid #ddd',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500'
};

const resultStyle = {
  marginTop: '10px',
  padding: '10px',
  background: '#f8f9fa',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'monospace',
  wordBreak: 'break-all'
};
