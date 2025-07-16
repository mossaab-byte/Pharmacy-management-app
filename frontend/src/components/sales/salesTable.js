import React from 'react';
import Button from '../UI/Button';

const SalesTable = ({ sales, onView, onDelete }) => (
  <table className="w-full border-collapse text-left">
    <thead>
      <tr className="bg-gray-100">
        <th scope="col" className="p-2 border">Date</th>
        <th scope="col" className="p-2 border">Customer</th>
        <th scope="col" className="p-2 border">Total</th>
        <th scope="col" className="p-2 border">Actions</th>
      </tr>
    </thead>
    <tbody>
      {sales.map((sale) => (
        <tr key={sale.id} className="hover:bg-gray-50">
          <td className="p-2 border">{new Date(sale.date).toLocaleDateString()}</td>
          <td className="p-2 border">{sale.customer_name}</td>
          <td className="p-2 border">{sale.total.toFixed(2)} DH</td>
          <td className="p-2 border space-x-2">
            <Button size="sm" onClick={() => onView(sale.id)} className="cursor-pointer">
              View
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(sale.id)} className="cursor-pointer">
              Delete
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default SalesTable;
