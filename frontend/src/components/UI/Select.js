import React from 'react';

const Select = ({ 
  options = [], 
  value, 
  onChange, 
  disabled = false, 
  placeholder = 'Select an option', 
  ...rest 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...rest}
      className={`block w-full rounded border border-gray-300 bg-white py-2 px-3
        text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
      `}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map(({ value: optionValue, label }) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default Select;
