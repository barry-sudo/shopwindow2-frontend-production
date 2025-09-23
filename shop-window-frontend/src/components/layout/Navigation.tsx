import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NavigationTab } from '../../types/models';

const navigationTabs: NavigationTab[] = [
  {
    id: 'map',
    label: 'Map View',
    path: '/map',
    active: false
  },
  {
    id: 'properties',
    label: 'Properties',
    path: '/properties',
    active: false
  },
  {
    id: 'import',
    label: 'Import Data',
    path: '/import',
    active: false
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    active: false
  }
];

export const Navigation: React.FC = () => {
  const location = useLocation();

  const getTabStatus = (path: string): boolean => {
    if (path === '/map') {
      return location.pathname === '/map' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="app-navigation">
      <div className="nav-content">
        <div className="tabs">
          {navigationTabs.map((tab) => {
            const isActive = getTabStatus(tab.path);
            const isImplemented = tab.path === '/map' || tab.path.startsWith('/property');
            
            return (
              <React.Fragment key={tab.id}>
                {isImplemented ? (
                  <Link
                    to={tab.path}
                    className={`tab ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {tab.label}
                  </Link>
                ) : (
                  <span 
                    className={`tab disabled ${isActive ? 'active' : ''}`}
                    title={`${tab.label} - Coming in Sprint 2+`}
                  >
                    {tab.label}
                    <span className="coming-soon">Sprint 2+</span>
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};