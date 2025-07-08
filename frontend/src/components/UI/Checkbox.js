import React from 'react';

const Checkbox = ({ label, name, checked, onChange, className = '' }) => {
  return (
    <label className={`inline-flex items-center space-x-2 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-pharmacy-accent rounded focus:ring-2 focus:ring-pharmacy-accent focus:ring-opacity-50"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default Checkbox;
