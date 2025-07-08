import React from 'react';
import Card from '../UI/Card';

const SupplierStats = ({ supplier = {} }) => {
  const formatCurrency = (amount) => `$${(amount ?? 0).toFixed(2)}`;

  return (
    <div className="supplier-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <div className="text-lg font-bold">{formatCurrency(supplier.current_balance)}</div>
        <div className="text-sm text-gray-600">Outstanding Balance</div>
      </Card>
      <Card>
        <div className="text-lg font-bold">{formatCurrency(supplier.credit_limit)}</div>
        <div className="text-sm text-gray-600">Credit Limit</div>
      </Card>
      <Card>
        <div className="text-lg font-bold">{supplier.payment_terms || 'N/A'}</div>
        <div className="text-sm text-gray-600">Payment Terms</div>
      </Card>
      <Card>
        <div className="text-lg font-bold">{supplier.delivery_schedule || 'N/A'}</div>
        <div className="text-sm text-gray-600">Delivery Schedule</div>
      </Card>
    </div>
  );
};

export default SupplierStats;
