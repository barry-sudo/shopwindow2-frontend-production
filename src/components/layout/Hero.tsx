import React, { useState } from 'react';
import '../../styles/design-tokens.css';

/**
 * Hero Component - Landing page hero section
 * 
 * Updated header text:
 * - Title: "Shop Window"
 * - Subtitle: "Your Retail CRE Analysis Engine"
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/layout/Hero.tsx
 */

interface HeroProps {
  onSearch?: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <section style={{
      textAlign: 'center',
      padding: '50px 30px',
      background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e3a6f 100%)',
      color: '#ffffff'
    }}>
      {/* Hero Title */}
      <h1 style={{
        fontSize: '48px',
        fontFamily: "'Playfair Display', serif",
        fontWeight: '500',
        marginBottom: 'var(--space-3)',
        margin: '0 0 var(--space-3) 0',
        color: '#eddb1d'
      }}>
        Shop Window
      </h1>

      {/* Hero Subtitle */}
      <p style={{
        fontSize: '20px',
        opacity: 0.9,
        marginBottom: '40px',
        margin: '0 0 40px 0',
        color: '#ffffff'
      }}>
        Your Retail CRE Analysis Engine
      </p>

      {/* Search Bar */}
      <form 
        onSubmit={handleSearch}
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search properties, addresses, or shopping centers..."
          style={{
            width: '100%',
            padding: '18px 25px',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-size-base)',
            boxShadow: 'var(--shadow-md)',
            boxSizing: 'border-box'
          }}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            background: 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-base)',
            fontSize: 'var(--font-size-sm)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1e3a6f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
          }}
        >
          Search
        </button>
      </form>
    </section>
  );
};
