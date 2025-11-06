import React from 'react';
import '../../styles/design-tokens.css';

interface EntryPoint {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

interface EntryPointsProps {
  onEntryPointClick?: (entryPoint: string) => void;
}

export const EntryPoints: React.FC<EntryPointsProps> = ({ onEntryPointClick }) => {
  const entryPoints: EntryPoint[] = [
    {
      icon: '🏢',
      title: 'Analyze Property',
      description: 'Deep dive into individual property performance, tenant mix, and market position',
      onClick: () => onEntryPointClick?.('analyze')
    },
    {
      icon: '📊',
      title: 'Portfolio Overview',
      description: 'Compare multiple properties and analyze portfolio performance',
      onClick: () => onEntryPointClick?.('portfolio')
    },
    {
      icon: '💰',
      title: 'Financial Modeling',
      description: 'Create scenarios and investment thesis analysis',
      onClick: () => onEntryPointClick?.('financial')
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
      {entryPoints.map((entry, index) => (
        <div
          key={index}
          onClick={entry.onClick}
          style={{
            backgroundColor: 'var(--color-white)',
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
          {/* Icon */}
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#8dc8f2ff',
            borderRadius: 'var(--radius-full)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            {entry.icon}
          </div>

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
      ))}
    </div>
  );
};
