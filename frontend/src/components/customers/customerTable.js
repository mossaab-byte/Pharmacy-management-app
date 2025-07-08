import React from 'react';
import Button from '../UI/Button';

const CustomerTable = ({ customers, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map(customer => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                  {customer.user.first_name} {customer.user.last_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.phone || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.user.email}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                customer.balance > 0 ? 'text-green-600' : 
                customer.balance < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {customer.balance.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                <Button 
                  size="sm"
                  onClick={() => onView(customer.id)}
                >
                  View
                </Button>
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(customer.id)}
                >
                  Edit
                </Button>
                <Button 
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(customer.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;