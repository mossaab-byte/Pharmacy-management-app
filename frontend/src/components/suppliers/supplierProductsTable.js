import React from 'react';
import Table from '../UI/Table';

const SupplierProductsTable = ({ products = [] }) => {
  const formatCurrency = (amount) => `${(amount || 0).toFixed(2)} DH`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const columns = [
    { key: 'product_name', header: 'Product' },
    { key: 'sku', header: 'SKU' },
    { key: 'supplier_price', header: 'Supplier Price', render: p => formatCurrency(p.supplier_price) },
    { key: 'last_updated', header: 'Last Updated', render: p => formatDate(p.last_updated) },
  ];

  return <Table columns={columns} data={products} />;
};

export default SupplierProductsTable;
