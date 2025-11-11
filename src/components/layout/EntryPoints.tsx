import React, { useState } from 'react';
import '../../styles/design-tokens.css';

interface EntryPoint {
  icon: string; // Now holds the image path instead of emoji
  title: string;
  description: string;
  key: string;
  onClick?: () => void;
}

interface EntryPointsProps {
  onEntryPointClick?: (entryPoint: string) => void;
}

/**
 * EntryPoints Component - Three main entry cards on dashboard
 * 
 * UPDATED: Now uses custom 120x120px icon images instead of emojis
 * - Icons are 240x240px source files (retina) displayed at 120x120px
 * - Transparent PNG images with black silhouettes
 * - Images located in /public/icons/ directory
 * 
 * SAVE TO: /Users/barrygilbert/Documents/shopwindow/frontend/src/components/layout/EntryPoints.tsx
 */
export const EntryPoints: React.FC<EntryPointsProps> = ({ onEntryPointClick }) => {
  // Track which entry point is currently active (default: 'analyze')
  const [activeEntry, setActiveEntry] = useState<string>('analyze');

  const entryPoints: EntryPoint[] = [
    {
      icon: '/icons/analyze-property.png',
      title: 'Analyze Property',
      description: 'Deep dive into individual property performance, tenant mix, and market position',
      key: 'analyze',
      onClick: () => {
        setActiveEntry('analyze');
        onEntryPointClick?.('analyze');
      }
    },
    {
      icon: '/icons/portfolio-overview.png',
      title: 'Portfolio Overview',
      description: 'Compare multiple properties and analyze portfolio performance',
      key: 'portfolio',
      onClick: () => {
        setActiveEntry('portfolio');
        onEntryPointClick?.('portfolio');
      }
    },
    {
      icon: '/icons/financial-modeling.png',
      title: 'Financial Modeling',
      description: 'Create scenarios and investment thesis analysis',
      key: 'financial',
      onClick: () => {
        setActiveEntry('financial');
        onEntryPointClick?.('financial');
      }
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '30px',
      margin: '40px 30px',
      padding: '0'
    }}>
      {entryPoints.map((entry, index) => {
        const isActive = entry.key === activeEntry;
        
        return (
          <div
            key={index}
            onClick={entry.onClick}
            style={{
              backgroundColor: isActive ? '#FFFFc5' : 'var(--color-white)',
              padding: '30px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'var(--transition-base)',
              border: '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            {/* Icon - UPDATED: Now displays custom image at 120x120px */}
            <img 
              src={entry.icon}
              alt={`${entry.title} icon`}
              style={{
                width: '120px',
                height: '120px',
                display: 'block',
                margin: '0 auto 24px',
                objectFit: 'contain', // Ensures image fits without distortion
              }}
            />

            {/* Title */}
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--space-2)',
              color: 'var(--color-text)',
              margin: '0 0 var(--space-2) 0'
            }}>
              {entry.title}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-relaxed)',
              margin: 0
            }}>
              {entry.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
