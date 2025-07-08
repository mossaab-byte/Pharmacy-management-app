import React from 'react';

const variantStyles = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-gray-400 text-gray-700 hover:bg-gray-100',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  medium: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      className={`
        rounded focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
