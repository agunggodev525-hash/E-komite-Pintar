import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'text' | 'table' | 'circle';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = 'text', count = 1, className = '' }: SkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => i);

  const getBaseClass = () => {
    switch (type) {
      case 'card':
        return 'w-full h-32 rounded-xl';
      case 'table':
        return 'w-full h-12 rounded-lg';
      case 'circle':
        return 'w-12 h-12 rounded-full';
      case 'text':
      default:
        return 'w-full h-4 rounded';
    }
  };

  return (
    <>
      {elements.map((key) => (
        <div
          key={key}
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 mb-2 ${getBaseClass()} ${className}`}
        />
      ))}
    </>
  );
}
