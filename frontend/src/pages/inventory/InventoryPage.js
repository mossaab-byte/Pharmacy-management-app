import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import inventoryService from '../../services/inventoryService';
import medicineService from '../../services/medicineService';
import MedicineSearchWithBarcode from '../../components/common/MedicineSearchWithBarcode';
import { Package, AlertTriangle, TrendingUp, Plus, Minus, History } from 'lucide-react';

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
  const [inventoryStats, setInventoryStats] = useState(null);

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
      const response = await inventoryService.getInventory({
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm
      });
      setInventory(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await inventoryService.getLowStockItems();
      setLowStockItems(response.data || []);
    } catch (err) {
      console.error('Error fetching low stock items:', err);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const response = await inventoryService.getInventoryStats();
      setInventoryStats(response.data);
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInventory();
  };

  const handleAddMedicine = async (medicine) => {
    try {
      await inventoryService.addMedicine({
        medicine_id: medicine.id,
        quantity: 0,
        minimum_stock_level: 10,
        price: medicine.public_price || 0
      });
      
      addNotification('Medicine added to inventory', 'success');
      setShowAddMedicineModal(false);
      fetchInventory();
    } catch (err) {
      addNotification('Failed to add medicine to inventory', 'error');
      console.error('Error adding medicine:', err);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem || !stockAdjustment.amount) {
      addNotification('Please fill all required fields', 'error');
      return;
    }

    try {
      const amount = parseInt(stockAdjustment.amount);
      const endpoint = stockAdjustment.type === 'add' ? 'addStock' : 'removeStock';
      
      await inventoryService[endpoint](selectedItem.id, {
        amount: Math.abs(amount),
        reason: stockAdjustment.reason || 'Manual adjustment'
      });

      addNotification(`Stock ${stockAdjustment.type === 'add' ? 'added' : 'removed'} successfully`, 'success');
      setShowStockModal(false);
      setSelectedItem(null);
      setStockAdjustment({ amount: '', reason: '', type: 'add' });
      fetchInventory();
      fetchLowStockItems();
    } catch (err) {
      addNotification('Failed to adjust stock', 'error');
      console.error('Error adjusting stock:', err);
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (item.quantity <= item.minimum_stock_level) return { status: 'low', color: 'yellow', text: 'Low Stock' };
    return { status: 'normal', color: 'green', text: 'In Stock' };
  };

  const columns = [
    {
      key: 'medicine_name',
      header: 'Medicine',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-blue-600">{value}</div>
          <div className="text-sm text-gray-500">{row.medicine_code}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Current Stock',
      render: (value, row) => {
        const stockStatus = getStockStatus(row);
        return (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
              stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {value}
            </span>
            {stockStatus.status !== 'normal' && (
              <AlertTriangle className={`ml-2 h-4 w-4 ${
                stockStatus.color === 'red' ? 'text-red-500' : 'text-yellow-500'
              }`} />
            )}
          </div>
        );
      }
    },
    {
      key: 'minimum_stock_level',
      header: 'Min Level',
      render: (value) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      key: 'price',
      header: 'Unit Price',
      render: (value) => value ? `${parseFloat(value).toFixed(2)} MAD` : 'N/A'
    },
    {
      key: 'total_value',
      header: 'Total Value',
      render: (value, row) => {
        const total = (row.quantity || 0) * (row.price || 0);
        return `${total.toFixed(2)} MAD`;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem(row);
              setStockAdjustment({ ...stockAdjustment, type: 'add' });
              setShowStockModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem(row);
              setStockAdjustment({ ...stockAdjustment, type: 'remove' });
              setShowStockModal(true);
            }}
            disabled={row.quantity <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/inventory/${row.id}/history`)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filteredInventory = inventory.filter(item =>
    item.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.medicine_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Manage your pharmacy's medicine stock levels</p>
      </div>

      {/* Statistics Cards */}
      {inventoryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Package className="h-12 w-12 text-blue-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.total_items}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-12 w-12 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.total_value?.toFixed(2)} MAD</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.out_of_stock || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="p-4 mb-6 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-medium text-yellow-800">
              {lowStockItems.length} item(s) are running low on stock
            </span>
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
            <Button onClick={() => setShowAddMedicineModal(true)}>
              Add Medicine to Inventory
            </Button>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        {error && <ErrorMessage message={error} className="m-6" />}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Inventory Items ({filteredInventory.length})
              </h2>
            </div>

            <Table 
              columns={columns} 
              data={filteredInventory}
              className="w-full"
            />
          </>
        )}
      </Card>

      {/* Add Medicine Modal */}
      <Modal
        isOpen={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        title="Add Medicine to Inventory"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Search for a medicine to add to your inventory:
          </p>
          <MedicineSearchWithBarcode
            onMedicineSelect={(medicine) => {
              handleAddMedicine(medicine);
            }}
            placeholder="Search medicine by name or scan barcode..."
          />
        </div>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => {
          setShowStockModal(false);
          setSelectedItem(null);
          setStockAdjustment({ amount: '', reason: '', type: 'add' });
        }}
        title={`${stockAdjustment.type === 'add' ? 'Add' : 'Remove'} Stock`}
      >
        <div className="p-6">
          {selectedItem && (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold">{selectedItem.medicine_name}</h3>
                <p className="text-sm text-gray-600">Current Stock: {selectedItem.quantity}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to {stockAdjustment.type}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={stockAdjustment.amount}
                    onChange={(e) => setStockAdjustment(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <Input
                    type="text"
                    value={stockAdjustment.reason}
                    onChange={(e) => setStockAdjustment(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    placeholder="Enter reason for adjustment"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleStockAdjustment}>
                    {stockAdjustment.type === 'add' ? 'Add Stock' : 'Remove Stock'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStockModal(false);
                      setSelectedItem(null);
                      setStockAdjustment({ amount: '', reason: '', type: 'add' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InventoryPage;
