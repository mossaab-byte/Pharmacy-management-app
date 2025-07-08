import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { usePagination } from '../../hooks/usePagination';
import  inventoryService  from '../../services/inventoryService';
import { useNotification } from '../../contexts/NotificationContext';

import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import StockUpdateForm from './StockUpdateForm';

const Inventory = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  const { data: inventory, loading, refetch } = useApi(inventoryService.getInventory);

  // Filter inventory by medicine name (case-insensitive)
  const filteredInventory = inventory?.filter(item =>
    item.medicine_details?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const { currentPage, setCurrentPage, paginatedData, totalPages } = usePagination(filteredInventory);

  const handleUpdateStock = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleStockUpdate = () => {
    refetch();
    handleModalClose();
  };

  const handleViewLogs = (item) => {
    navigate(`/inventory/logs/${item.id}`);
  };

  const handleViewAllLogs = () => {
    navigate('/inventory/logs');
  };

  const columns = [
    {
      key: 'medicine',
      header: 'Medicine',
      render: (item) => item.medicine_details?.name || 'N/A',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item) => (
        <span className={`${item.quantity < item.minimum_stock_level ? 'text-red-600 font-semibold' : ''}`}>
          {item.quantity}
        </span>
      ),
    },
    {
      key: 'minimum_stock_level',
      header: 'Min Stock',
      render: (item) => item.minimum_stock_level,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleUpdateStock(item)}>
            Update Stock
          </Button>
          <Button size="small" variant="secondary" onClick={() => handleViewLogs(item)}>
            View Logs
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="inventory-page max-w-7xl mx-auto p-6">
      <Card title="Inventory Management">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <div>
            <Button variant="outline" onClick={handleViewAllLogs}>
              View All Logs
            </Button>
          </div>
          <div className="flex space-x-6 text-sm font-medium">
            <span>Total Items: <span className="font-bold">{inventory?.length || 0}</span></span>
            <span className="text-red-600">
              Low Stock: <span className="font-bold">{inventory?.filter(i => i.quantity < i.minimum_stock_level).length || 0}</span>
            </span>
          </div>
        </div>

        <Table columns={columns} data={paginatedData} />

        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2"
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2"
          >
            Next
          </Button>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Update Stock">
        <StockUpdateForm
          item={selectedItem}
          onSave={handleStockUpdate}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default Inventory;
