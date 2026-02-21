import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      <Header name="Svitlo Power Reporter" />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
