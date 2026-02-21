import React from 'react';
import { Card } from './card';

interface FormCardProps {
  children: React.ReactNode;
  onSubmit: (e: React.SyntheticEvent) => void;
  title: string;
  style?: React.CSSProperties;
  className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({ children, onSubmit, title, style, className }) => {
  return (
    <Card title={title} style={style} className={className}>
      <form onSubmit={onSubmit}>
        {children}
      </form>
    </Card>
  );
};
