import React from 'react';

const Table = ({ columns, data, onRowClick }) => {
  return (
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
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`border border-gray-300 cursor-pointer ${
                onRowClick ? 'hover:bg-gray-50' : ''
              }`}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-4 py-2 text-sm">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
