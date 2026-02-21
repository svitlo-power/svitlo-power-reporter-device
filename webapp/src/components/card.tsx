import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, className = '', title }) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        className={`glass-card ${className}`}
        style={{ width: '100%', maxWidth: '400px', ...style }}
      >
        {title && <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};
