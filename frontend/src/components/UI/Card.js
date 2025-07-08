import React from 'react';

const Card = ({ title, children, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 animate-fade-in ${className}`}
      role="region"
      aria-label={title || 'card'}
    >
      {title && (
        <header className="border-b border-gray-200 pb-3 mb-6 font-semibold text-xl text-gray-800">
          {title}
        </header>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
