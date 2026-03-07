import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  onClick = null 
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-card p-6';
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
