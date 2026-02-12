import React from 'react';

interface HeaderProps {
  name: string;
}

export const Header: React.FC<HeaderProps> = ({ name }) => {

  return (
    <header style={{
      padding: '.8rem 2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
      borderBottom: '1px solid var(--border)',
      background: 'var(--card-bg)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      justifyContent: 'center'
    }}>
      <img src="/logo192.png" alt="Logo" style={{ width: '32px', height: '32px' }} />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{name}</h1>
    </header>
  );
};
