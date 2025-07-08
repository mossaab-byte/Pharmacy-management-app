import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
}) => {
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span aria-hidden="true" className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full rounded-md border ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
