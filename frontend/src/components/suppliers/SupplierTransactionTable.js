import React from 'react';
import Table from '../UI/Table';

const SupplierTransactionsTable = ({ transactions }) => {
  const formatCurrency = (amount) => `${(amount || 0).toFixed(2)} DH`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const columns = [
    { key: 'date', header: 'Date', render: tx => formatDate(tx.date) },
    { key: 'type', header: 'Type', render: tx => tx.type === 'purchase' ? 'Purchase' : 'Payment' },
    { key: 'reference', header: 'Reference' },
    {
      key: 'amount',
      header: 'Amount',
      render: tx => {
        const sign = tx.type === 'purchase' ? '+' : '-';
        const colorClass = tx.type === 'purchase' ? 'text-green-600' : 'text-red-600';
        return (
          <span className={`${colorClass} text-right block`}>
            {sign}{formatCurrency(tx.amount)}
          </span>
        );
      }
    },
    {
      key: 'running_balance',
      header: 'Balance',
      render: tx => <span className="text-right block">{formatCurrency(tx.running_balance)}</span>
    },
  ];

  return <Table columns={columns} data={transactions} />;
};

export default SupplierTransactionsTable;
