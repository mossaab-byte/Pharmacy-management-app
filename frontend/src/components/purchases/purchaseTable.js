import React from 'react';
import Button from '../UI/Button';

const statusStyles = {
  completed: 'text-green-700 bg-green-100 px-2 py-1 rounded',
  pending: 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded',
  cancelled: 'text-red-700 bg-red-100 px-2 py-1 rounded',
};

const PurchaseTable = ({ purchases, onView, onDelete, deletingId }) => (
  <table className="w-full border border-gray-200 text-left border-collapse">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-3 border border-gray-200">Date</th>
        <th className="p-3 border border-gray-200">Supplier</th>
        <th className="p-3 border border-gray-200">Total</th>
        <th className="p-3 border border-gray-200">Status</th>
        <th className="p-3 border border-gray-200">Actions</th>
      </tr>
    </thead>
    <tbody>
      {purchases.map(p => (
        <tr key={p.id} className="hover:bg-gray-50">
          <td className="p-3 border border-gray-200">{new Date(p.date).toLocaleDateString()}</td>
          <td className="p-3 border border-gray-200">{p.supplier_name}</td>
          <td className="p-3 border border-gray-200">
            {p.total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </td>
          <td className="p-3 border border-gray-200 capitalize">
            <span className={statusStyles[p.status] || 'text-gray-700'}>
              {p.status}
            </span>
          </td>
          <td className="p-3 border border-gray-200 space-x-2">
            <Button
              size="sm"
              onClick={() => onView(p.id)}
              aria-label={`View purchase ${p.id}`}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(p.id)}
              disabled={deletingId === p.id}
              aria-label={`Delete purchase ${p.id}`}
            >
              {deletingId === p.id ? 'Deleting...' : 'Delete'}
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default PurchaseTable;
