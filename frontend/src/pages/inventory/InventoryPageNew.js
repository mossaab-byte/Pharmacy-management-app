import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import MedicineSearchWithBarcode from '../../components/common/MedicineSearchWithBarcode';
import { Package, AlertTriangle, TrendingUp, Plus, Minus, History, Search } from 'lucide-react';

// Mock service if the real one fails
const mockInventoryService = {
  getInventory: async () => ({
    data: {
      results: [
        {
          id: 1,
          medicine_name: 'Paracetamol 500mg',
          stock: 100,
          minimum_stock_level: 20,
          price: 5.99,
          expiry_date: '2025-12-31'
        },
        {
          id: 2,
          medicine_name: 'Aspirin 325mg',
          stock: 5,
          minimum_stock_level: 10,
          price: 7.50,
          expiry_date: '2025-08-15'
        }
      ],
      count: 2
    }
  }),
  getLowStockItems: async () => ({
    data: [
      {
        id: 2,
        medicine_name: 'Aspirin 325mg',
        stock: 5,
        minimum_stock_level: 10,
        price: 7.50
      }
    ]
  }),
  getInventoryStats: async () => ({
    data: {
      total_items: 2,
      total_value: 1349.50,
      low_stock_count: 1,
      expired_count: 0
    }
  }),
  addStock: async (id, data) => ({
    data: { message: 'Stock added successfully' }
  }),
  removeStock: async (id, data) => ({
    data: { message: 'Stock removed successfully' }
  })
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    amount: '',
    reason: '',
    type: 'add' // 'add' or 'remove'
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    total_items: 0,
    total_value: 0,
    low_stock_count: 0,
    expired_count: 0
  });

  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const itemsPerPage = 20;

  useEffect(() => {
    fetchInventory();
    fetchLowStockItems();
    fetchInventoryStats();
  }, [currentPage]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let inventoryService;
      try {
        inventoryService = (await import('../../services/inventoryService')).default;
      } catch (importError) {
        console.warn('Failed to load inventory service, using mock:', importError);
        inventoryService = mockInventoryService;
      }

      const response = await inventoryService.getInventory({
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm
      });
      
      const data = response.data || response;
      setInventory(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      
      if (addNotification) {
        addNotification({
          type: 'success',
          message: `Loaded ${data.results?.length || data.length || 0} inventory items`
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to load inventory. Please try again.';
      setError(errorMessage);
      setInventory([]);
      console.error('Error fetching inventory:', err);
      
      if (addNotification) {
        addNotification({
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      let inventoryService;
      try {
        inventoryService = (await import('../../services/inventoryService')).default;
      } catch (importError) {
        inventoryService = mockInventoryService;
      }

      const response = await inventoryService.getLowStockItems();
      setLowStockItems(response.data || []);
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      setLowStockItems([]);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      let inventoryService;
      try {
        inventoryService = (await import('../../services/inventoryService')).default;
      } catch (importError) {
        inventoryService = mockInventoryService;
      }

      const response = await inventoryService.getInventoryStats();
      setInventoryStats(response.data || {
        total_items: 0,
        total_value: 0,
        low_stock_count: 0,
        expired_count: 0
      });
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
      setInventoryStats({
        total_items: 0,
        total_value: 0,
        low_stock_count: 0,
        expired_count: 0
      });
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem || !stockAdjustment.amount) return;

    try {
      let inventoryService;
      try {
        inventoryService = (await import('../../services/inventoryService')).default;
      } catch (importError) {
        inventoryService = mockInventoryService;
      }

      const adjustmentData = {
        amount: parseInt(stockAdjustment.amount),
        reason: stockAdjustment.reason
      };

      if (stockAdjustment.type === 'add') {
        await inventoryService.addStock(selectedItem.id, adjustmentData);
      } else {
        await inventoryService.removeStock(selectedItem.id, adjustmentData);
      }

      if (addNotification) {
        addNotification({
          type: 'success',
          message: `Stock ${stockAdjustment.type === 'add' ? 'added' : 'removed'} successfully`
        });
      }

      setShowStockModal(false);
      setStockAdjustment({ amount: '', reason: '', type: 'add' });
      setSelectedItem(null);
      fetchInventory();
      fetchInventoryStats();
    } catch (err) {
      console.error('Error adjusting stock:', err);
      if (addNotification) {
        addNotification({
          type: 'error',
          message: 'Failed to adjust stock. Please try again.'
        });
      }
    }
  };

  const handleRetry = () => {
    fetchInventory();
    fetchLowStockItems();
    fetchInventoryStats();
  };

  const getStockStatus = (stock, minLevel) => {
    const safeStock = Number(stock) || 0;
    const safeMinLevel = Number(minLevel) || 0;
    
    if (safeStock <= safeMinLevel) return 'low';
    if (safeStock <= safeMinLevel * 1.5) return 'medium';
    return 'high';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (item.medicine_name && item.medicine_name.toLowerCase().includes(search)) ||
      (item.code && item.code.toLowerCase().includes(search))
    );
  });

  const columns = [
    { key: 'medicine_name', label: 'Medicine' },
    { key: 'stock', label: 'Stock' },
    { key: 'minimum_stock_level', label: 'Min Level' },
    { key: 'price', label: 'Price', render: (value) => `$${Number(value || 0).toFixed(2)}` },
    { 
      key: 'status', 
      label: 'Status', 
      render: (_, item) => {
        const status = getStockStatus(item.stock, item.minimum_stock_level);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem(item);
              setStockAdjustment(prev => ({ ...prev, type: 'add' }));
              setShowStockModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem(item);
              setStockAdjustment(prev => ({ ...prev, type: 'remove' }));
              setShowStockModal(true);
            }}
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-gray-600">Manage your pharmacy stock</p>
          </div>
          <LoadingSpinner />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-gray-600">Manage your pharmacy stock</p>
          </div>
          <Button
            onClick={() => setShowAddMedicineModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.total_items}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${Number(inventoryStats.total_value || 0).toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.low_stock_count}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <History className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.expired_count}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
            </div>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{item.medicine_name}</span>
                  <span className="text-sm text-gray-600">
                    Stock: {item.stock} / Min: {item.minimum_stock_level}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <Table
            columns={columns}
            data={filteredInventory}
            loading={loading}
            emptyMessage="No inventory items found"
          />
        </Card>

        {/* Stock Adjustment Modal */}
        <Modal
          isOpen={showStockModal}
          onClose={() => setShowStockModal(false)}
          title={`${stockAdjustment.type === 'add' ? 'Add' : 'Remove'} Stock - ${selectedItem?.medicine_name}`}
        >
          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              value={stockAdjustment.amount}
              onChange={(e) => setStockAdjustment(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter amount"
              required
            />
            <Input
              label="Reason"
              type="text"
              value={stockAdjustment.reason}
              onChange={(e) => setStockAdjustment(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for adjustment"
            />
            <div className="flex gap-2 pt-4">
              <Button onClick={handleStockAdjustment}>
                {stockAdjustment.type === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Button>
              <Button variant="outline" onClick={() => setShowStockModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Medicine Modal */}
        <Modal
          isOpen={showAddMedicineModal}
          onClose={() => setShowAddMedicineModal(false)}
          title="Add Medicine to Inventory"
        >
          <div className="space-y-4">
            <MedicineSearchWithBarcode
              onSelect={(medicine) => {
                console.log('Selected medicine:', medicine);
                setShowAddMedicineModal(false);
                // Here you would typically add the medicine to inventory
              }}
              placeholder="Search for medicine to add..."
            />
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddMedicineModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default InventoryPage;
