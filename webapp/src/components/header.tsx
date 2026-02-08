import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../stores/store';

interface HeaderProps {
  name: string;
}

export const Header: React.FC<HeaderProps> = ({ name }) => {
  const appState = useSelector((s: RootState) => s.app);

  return (
    <header style={{
        padding: '.8rem 2rem',
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.75rem',
        width: '100%',
        borderBottom: '1px solid var(--border)',
        background: 'var(--card-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{name}</h1>
        { !appState.loading && <span style={{
          fontSize: '0.875rem',
          color: 'var(--text-dimmed)',
          fontWeight: 500,
          opacity: 0.8
        }}>v{appState.appVer}/{appState.fsVer}</span> }
    </header>
  );
};
