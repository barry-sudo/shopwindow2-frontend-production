import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};