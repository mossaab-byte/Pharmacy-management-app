import React from 'react';
import Button from '../UI/Button';

const SupplierTable = ({ suppliers, onView }) => (
  <table className="w-full border-collapse border border-gray-200">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-3 border border-gray-200 text-left">Name</th>
        <th className="p-3 border border-gray-200 text-left">Contact</th>
        <th className="p-3 border border-gray-200 text-right">Balance</th>
        <th className="p-3 border border-gray-200 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {suppliers.map((supplier) => (
        <tr key={supplier.id} className="hover:bg-gray-50">
          <td className="p-3 border border-gray-200">{supplier.name}</td>
          <td className="p-3 border border-gray-200">{supplier.contact_person}</td>
          <td className="p-3 border border-gray-200 text-right">${supplier.current_balance.toFixed(2)}</td>
          <td className="p-3 border border-gray-200 text-center">
            <Button size="sm" onClick={() => onView(supplier.id)}>
              View
            </Button>
          </td>
        </tr>
      ))}
      {suppliers.length === 0 && (
        <tr>
          <td colSpan="4" className="p-4 text-center text-gray-500">
            No suppliers available.
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default SupplierTable;
