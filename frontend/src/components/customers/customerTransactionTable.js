import React from 'react';
import { Link } from 'react-router-dom';

const CustomerTransactionTable = ({ transactions }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'Type', 'ID', 'Amount', 'Credit Change', 'Actions'].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.type === 'sale'
                      ? 'bg-blue-100 text-blue-800'
                      : transaction.type === 'payment'
                      ? 'bg-green-100 text-green-800'
                      : transaction.type === 'credit'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{transaction.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                {transaction.amount !== null && transaction.amount !== undefined
                  ? transaction.amount.toFixed(2)
                  : '-'}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  transaction.credit_change > 0
                    ? 'text-green-600'
                    : transaction.credit_change < 0
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {transaction.credit_change > 0 ? '+' : ''}
                {transaction.credit_change.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={
                    transaction.type === 'sale'
                      ? `/sales/${transaction.id}`
                      : transaction.type === 'payment'
                      ? `/payments/${transaction.id}`
                      : '#'
                  }
                  className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={`View ${transaction.type} details for #${transaction.id}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTransactionTable;
