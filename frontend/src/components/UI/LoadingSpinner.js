import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Dynamically set border color classes based on `color` prop
  const borderColor = `border-${color}-500`;
  const borderTopColor = `border-t-transparent`;

  return (
    <div className="flex justify-center items-center py-4">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-solid ${borderColor} ${borderTopColor}`}
      />
    </div>
  );
};

export default LoadingSpinner;
