import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, AlertTriangle, Search, History, RefreshCw } from 'lucide-react';
import { Button } from '../../components/UI';
import inventoryService from '../../services/inventoryService';

const SimpleInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    amount: '',
    reason: 'PURCHASE',
    type: 'add'
  });
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-10), `${timestamp}: ${message}`]);
    console.log(`📦 ${timestamp}: ${message}`);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      addDebug('Fetching inventory...');
      
      const response = await inventoryService.getInventory();
      addDebug(`Raw response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
      let inventoryData = [];
      
      if (Array.isArray(response.data)) {
        inventoryData = response.data;
        addDebug(`Data is array with ${inventoryData.length} items`);
      } else if (response.data && Array.isArray(response.data.results)) {
        inventoryData = response.data.results;
        addDebug(`Data has results array with ${inventoryData.length} items`);
      } else {
        addDebug(`Unexpected data structure: ${typeof response.data}`);
        console.log('Full response data:', response.data);
      }
      
      addDebug(`Setting inventory state with ${inventoryData.length} items`);
      
      if (inventoryData.length > 0) {
        addDebug(`First item: ${JSON.stringify(inventoryData[0]).substring(0, 100)}...`);
      }
      
      setInventory(inventoryData);
      setError(null);
      
    } catch (error) {
      addDebug(`Error loading inventory: ${error.message}`);
      console.error('Full error:', error);
      setError(`Failed to load inventory: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem || !stockAdjustment.amount) {
      addDebug('Missing data for stock adjustment');
      return;
    }

    try {
      addDebug(`${stockAdjustment.type === 'add' ? 'Adding' : 'Removing'} ${stockAdjustment.amount} stock for ${selectedItem.medicine?.nom || 'Unknown medicine'}`);
      
      const adjustmentData = {
        amount: parseInt(stockAdjustment.amount),
        reason: stockAdjustment.reason || 'ADJUSTMENT'
      };

      let response;
      if (stockAdjustment.type === 'add') {
        response = await inventoryService.addStock(selectedItem.id, adjustmentData);
      } else {
        response = await inventoryService.removeStock(selectedItem.id, adjustmentData);
      }

      addDebug(`Stock adjustment successful: ${JSON.stringify(response.data)}`);
      
      // Refresh inventory
      await fetchInventory();
      
      // Reset modal
      setShowStockModal(false);
      setSelectedItem(null);
      setStockAdjustment({
        amount: '',
        reason: 'PURCHASE',
        type: 'add'
      });

    } catch (error) {
      addDebug(`Stock adjustment failed: ${error.message}`);
      console.error('Stock adjustment error:', error);
    }
  };

  const openStockModal = (item, type) => {
    addDebug(`Opening stock modal for ${item.medicine?.nom || 'Unknown'} - ${type}`);
    setSelectedItem(item);
    setStockAdjustment({
      amount: '',
      reason: type === 'add' ? 'PURCHASE' : 'ADJUSTMENT',
      type: type
    });
    setShowStockModal(true);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => {
    try {
      if (!item) {
        console.log('🚨 Filter Debug: Item is null/undefined');
        return false;
      }
      
      if (!item.medicine) {
        console.log('� Filter Debug: Item has no medicine property:', item);
        return false;
      }
      
      // If no search term, show all items
      if (!searchTerm || searchTerm.trim() === '') {
        return true;
      }
      
      const medicineName = (item.medicine.nom || '').toLowerCase();
      const medicineCode = (item.medicine.code || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase().trim();
      
      const matches = medicineName.includes(searchLower) || medicineCode.includes(searchLower);
      
      return matches;
    } catch (error) {
      console.error('🚨 Filter error for item:', item, error);
      return false;
    }
  });

  // Add debug for render state
  useEffect(() => {
    if (inventory.length > 0) {
      console.log('📊 Inventory State:', {
        totalItems: inventory.length,
        filteredItems: filteredInventory.length,
        sampleItem: inventory[0],
        searchTerm: searchTerm
      });
    }
  }, [inventory, filteredInventory.length, searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Package className="mr-3 h-8 w-8 text-blue-600" />
            Stock Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your pharmacy inventory</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={fetchInventory}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-2">Debug Log:</h3>
        <div className="max-h-24 overflow-y-auto text-xs">
          {debugInfo.map((info, index) => (
            <div key={index} className="text-gray-700">{info}</div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      ) : (
        <>
          {/* Inventory Summary */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Inventory Summary</h2>
                <p className="text-sm text-gray-600">
                  Total Items: {inventory.length} | Showing: {filteredInventory.length}
                  {searchTerm && ` | Search: "${searchTerm}"`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min. Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item.id || item.medicine} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.medicine_name || item.medicine?.nom || 'Unknown Medicine'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Code: {item.medicine_code || item.medicine?.code || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {item.quantity || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.minimum_stock_level || 10}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.price ? `${item.price} MAD` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.in_inventory === false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Not in Inventory
                          </span>
                        ) : item.quantity <= (item.minimum_stock_level || 10) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {item.in_inventory === false ? (
                            <Button
                              size="sm"
                              onClick={async () => {
                                addDebug(`Adding medicine ${item.medicine_name} to inventory...`);
                                try {
                                  await inventoryService.addMedicine({
                                    medicine: item.medicine,
                                    pharmacy: item.pharmacy,
                                    quantity: 0,
                                    minimum_stock_level: 10
                                  });
                                  addDebug(`Medicine ${item.medicine_name} added to inventory.`);
                                  await fetchInventory();
                                } catch (err) {
                                  addDebug(`Failed to add medicine: ${err.message}`);
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="h-4 w-4" /> Add
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => openStockModal(item, 'add')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openStockModal(item, 'remove')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={item.quantity === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInventory.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding medicines to your inventory.'}
                </p>
                {/* Debug info when we have inventory but no filtered results */}
                {inventory.length > 0 && filteredInventory.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-100 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Debug: {inventory.length} items loaded but not displaying. 
                      Search term: "{searchTerm}"
                    </p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-sm bg-yellow-200 px-3 py-1 rounded hover:bg-yellow-300"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {stockAdjustment.type === 'add' ? 'Add Stock' : 'Remove Stock'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine
                </label>
                <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {selectedItem?.medicine?.nom || 'Unknown Medicine'}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock
                </label>
                <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {selectedItem?.quantity || 0} units
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockAdjustment.amount}
                  onChange={(e) => setStockAdjustment(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <select
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {stockAdjustment.type === 'add' ? (
                    <>
                      <option value="PURCHASE">Purchase</option>
                      <option value="TRANSFER_IN">Transfer In</option>
                      <option value="ADJUSTMENT">Manual Adjustment</option>
                    </>
                  ) : (
                    <>
                      <option value="SALE">Sale</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="DAMAGED">Damaged</option>
                      <option value="TRANSFER_OUT">Transfer Out</option>
                      <option value="ADJUSTMENT">Manual Adjustment</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowStockModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStockAdjustment}
                  className={stockAdjustment.type === 'add' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  {stockAdjustment.type === 'add' ? 'Add Stock' : 'Remove Stock'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleInventoryPage;
