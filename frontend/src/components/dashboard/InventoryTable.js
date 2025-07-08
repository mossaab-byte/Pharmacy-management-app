import React from 'react';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';

const InventoryTable = ({ data }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  const getStockStatus = (stock, minLevel) => {
    // Ensure values are numbers
    const safeStock = Number(stock) || 0;
    const safeMinLevel = Number(minLevel) || 1;

    if (safeStock <= safeMinLevel) return 'low';
    if (safeStock <= safeMinLevel * 1.5) return 'medium';
    return 'high';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Package className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medicine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.map((item, index) => {
              // Safely access properties with fallbacks
              const stock = item?.stock || 0;
              const minStockLevel = item?.minimum_stock_level || 0;
              const medicineName = item?.name || item?.medicine_name || 'Unknown Medicine';
              const price = typeof item?.prix_public === 'number' ? item.prix_public : 
                          typeof item?.price === 'number' ? item.price : 0;
              
              const status = getStockStatus(stock, minStockLevel);
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {medicineName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{minStockLevel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status === 'low' ? 'Low Stock' : status === 'medium' ? 'Medium' : 'Good'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default InventoryTable;
