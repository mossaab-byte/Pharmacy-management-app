import React from 'react';

const Textarea = ({ 
  className = '', 
  rows = 4, 
  placeholder = '', 
  value = '', 
  onChange, 
  disabled = false,
  required = false,
  ...props 
}) => {
  return (
    <textarea
      className={`
        block w-full px-3 py-2 border border-gray-300 rounded-md 
        shadow-sm placeholder-gray-400 
        focus:outline-none focus:ring-blue-500 focus:border-blue-500 
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default Textarea;
