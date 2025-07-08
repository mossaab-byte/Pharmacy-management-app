import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

const Table = ({ columns, data, onRowClick }) => {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  return (
    <ErrorBoundary>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border border-gray-300 ${
                  onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''
                }`}
              >
                {columns.map((column, colIndex) => {
                  // Safe rendering of cell content
                  let cellContent;
                  
                  if (column.render) {
                    // Use the custom render function
                    try {
                      cellContent = column.render(row[column.key], row);
                    } catch (error) {
                      console.error(`Error rendering column ${column.key}:`, error);
                      cellContent = 'Error';
                    }
                  } else {
                    // Default rendering with safety checks
                    const value = row[column.key];
                    if (value === null || value === undefined) {
                      cellContent = '';
                    } else if (typeof value === 'object') {
                      try {
                        cellContent = JSON.stringify(value);
                      } catch (error) {
                        cellContent = 'Invalid object';
                      }
                    } else {
                      cellContent = value;
                    }
                  }
                  
                  return (
                    <td key={colIndex} className="border border-gray-300 px-4 py-2 text-sm">
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ErrorBoundary>
  );
};

export default Table;
