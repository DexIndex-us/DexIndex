import React from 'react';
import { TYPE_COLORS } from '../types';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const colorClass = TYPE_COLORS[type] || 'bg-gray-400';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`${colorClass} ${sizeClasses[size]} text-white rounded-full font-medium capitalize shadow-sm inline-block mr-1 last:mr-0`}>
      {type}
    </span>
  );
};