import React from 'react';
import Table from '../UI/Table';

const PurchaseHistoryTable = ({ purchases }) => {
  const formatCurrency = (amount) => `${(amount || 0).toFixed(2)} DH`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const columns = [
    { key: 'id', header: 'Purchase ID' },
    { key: 'date', header: 'Date', render: p => formatDate(p.date) },
    { key: 'total', header: 'Total', render: p => formatCurrency(p.total) },
    { key: 'status', header: 'Status' },
  ];

  return <Table columns={columns} data={purchases} />;
};

export default PurchaseHistoryTable;
