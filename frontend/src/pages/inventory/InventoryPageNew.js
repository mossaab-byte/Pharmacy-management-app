import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import MedicineSearchWithBarcode from '../../components/common/MedicineSearchWithBarcode';
import inventoryService from '../../services/inventoryService';
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
  const [allInventory, setAllInventory] = useState([]); // Store ALL inventory items
  const [displayedInventory, setDisplayedInventory] = useState([]); // Current page items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch ALL inventory on mount and when search changes
  useEffect(() => {
    fetchAllInventory();
  }, [debouncedSearchTerm]);

  // Update displayed items when page changes or inventory changes
  useEffect(() => {
    updateDisplayedItems();
  }, [currentPage, allInventory]);

  // Reset to first page when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  // Fetch other data on mount
  useEffect(() => {
    fetchLowStockItems();
    fetchInventoryStats();
    
    // Listen for inventory update events from sales or other operations
    const handleInventoryUpdate = (event) => {
      console.log('🔄 Inventory page received update event:', event.detail);
      // Refresh all inventory data when updated
      fetchAllInventory();
      fetchLowStockItems();
      fetchInventoryStats();
    };
    
    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
    
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, []);

  const fetchAllInventory = async () => {
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

      console.log('🔍 Fetching ALL inventory items for global sorting...');
      
      // Fetch ALL inventory items (no pagination on backend)
      const params = {
        page_size: 10000, // Large number to get all items
        search: debouncedSearchTerm.trim(),
      };

      const response = await inventoryService.getInventory(params);
      const data = response.data || response;
      const results = data.results || [];
      
      console.log(`📦 Fetched ${results.length} total inventory items`);
      
      // Apply global smart sorting to ALL items
      const globalSortedResults = sortInventoryItems(results);
      
      setAllInventory(globalSortedResults);
      setTotalItems(globalSortedResults.length);
      setTotalPages(Math.ceil(globalSortedResults.length / itemsPerPage));
      
      console.log(`✅ Global sorting applied: ${globalSortedResults.length} items sorted globally`);
      
      if (addNotification && results.length > 0) {
        addNotification({
          type: 'success',
          message: `Loaded ${results.length} inventory items${debouncedSearchTerm ? ` matching "${debouncedSearchTerm}"` : ''} - Sorted globally`
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to load inventory. Please try again.';
      setError(errorMessage);
      setAllInventory([]);
      setTotalPages(1);
      setTotalItems(0);
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

  // Update displayed items based on current page
  const updateDisplayedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = allInventory.slice(startIndex, endIndex);
    
    setDisplayedInventory(pageItems);
    
    console.log(`📄 Page ${currentPage}: Showing items ${startIndex + 1}-${Math.min(endIndex, allInventory.length)} of ${allInventory.length}`);
  };

  // Smart sorting function for inventory - ALWAYS puts available medicines first GLOBALLY
  const sortInventoryItems = (items) => {
    console.log('🔄 GLOBAL sorting inventory items...', items.length, 'total items');
    
    // Debug: Log first item structure to understand the data
    if (items.length > 0) {
      console.log('🔍 Sample inventory item structure:', items[0]);
      console.log('🔍 Available fields in first item:', Object.keys(items[0]));
    }
    
    const availableItems = [];
    const outOfStockItems = [];
    
    // Separate ALL items by stock availability
    items.forEach(item => {
      const stock = Number(item.stock || item.quantity || 0);
      if (stock > 0) {
        availableItems.push(item);
      } else {
        outOfStockItems.push(item);
      }
    });
    
    console.log(`📊 GLOBAL SORT: ${availableItems.length} available medicines, ${outOfStockItems.length} out-of-stock medicines`);

    // Sort available items by stock/quantity (highest to lowest)
    availableItems.sort((a, b) => {
      const stockA = Number(a.stock || a.quantity || 0);
      const stockB = Number(b.stock || b.quantity || 0);
      return stockB - stockA; // Descending order (highest stock first)
    });

    // Sort out-of-stock items by medicine name (ascending)
    outOfStockItems.sort((a, b) => {
      const nameA = (
        a.medicine_name || 
        a.medicine?.nom_commercial || 
        a.nom_commercial || 
        'Unknown'
      ).toLowerCase();
      const nameB = (
        b.medicine_name || 
        b.medicine?.nom_commercial || 
        b.nom_commercial || 
        'Unknown'
      ).toLowerCase();
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });

    const sortedItems = [...availableItems, ...outOfStockItems];
    console.log('✅ GLOBAL sorting complete: ALL available medicines first across entire inventory, then alphabetical out-of-stock');
    console.log(`🎯 Result: First ${availableItems.length} items have stock, remaining ${outOfStockItems.length} are out-of-stock`);
    return sortedItems;
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
    if (!selectedItem || !stockAdjustment.amount) {
      console.error('Missing selectedItem or amount:', { selectedItem, amount: stockAdjustment.amount });
      return;
    }

    // Debug: Check the selectedItem structure
    console.log('🔍 selectedItem structure:', selectedItem);
    console.log('🔍 Available ID fields:', {
      id: selectedItem.id,
      medicine: selectedItem.medicine,
      pharmacyMedicineId: selectedItem.pharmacy_medicine_id,
      medicineId: selectedItem.medicine_id,
      pk: selectedItem.pk,
      itemId: selectedItem.item_id,
      allKeys: Object.keys(selectedItem)
    });

    // Check if we have a valid pharmacy-medicine ID
    let pharmacyMedicineId = selectedItem.id;

    // If we don't have the pharmacy-medicine ID (like in search results), 
    // we need to find it from the full inventory or add the medicine to pharmacy
    if (!pharmacyMedicineId && selectedItem.medicine) {
      console.log('🔄 No pharmacy-medicine ID found, searching in full inventory for medicine:', selectedItem.medicine);
      
      try {
        // Find the pharmacy-medicine record from our all inventory
        console.log('🔍 Searching for medicine ID:', selectedItem.medicine, 'in', allInventory.length, 'inventory items');
        console.log('🔍 First 3 inventory items for reference:', allInventory.slice(0, 3).map(item => ({
          id: item.id,
          medicine: item.medicine,
          medicine_name: item.medicine_name
        })));
        
        const matchingItem = allInventory.find(item => 
          item.medicine === selectedItem.medicine || 
          item.medicine_id === selectedItem.medicine
        );
        
        console.log('🔍 Search result for medicine', selectedItem.medicine, ':', matchingItem);
        
        if (matchingItem && matchingItem.id) {
          pharmacyMedicineId = matchingItem.id;
          console.log('✅ Found pharmacy-medicine ID from inventory:', pharmacyMedicineId);
        } else {
          // Medicine doesn't exist in pharmacy inventory - we need to add it first
          console.log('🏥 Medicine not in pharmacy inventory, adding it first...');
          
          if (addNotification) {
            addNotification({
              type: 'info',
              message: `Adding ${selectedItem.medicine_name} to pharmacy inventory first...`
            });
          }
          
          try {
            // Add the medicine to pharmacy inventory with initial stock
            const addResult = await inventoryService.addMedicineToPharmacy(
              selectedItem.medicine, 
              parseInt(stockAdjustment.amount), 
              stockAdjustment.reason || 'Initial stock addition'
            );
            
            console.log('✅ Medicine added to pharmacy successfully:', addResult.data);
            
            if (addNotification) {
              addNotification({
                type: 'success',
                message: `Successfully added ${selectedItem.medicine_name} to pharmacy with ${stockAdjustment.amount} units`
              });
            }
            
            // Refresh inventory to get the new pharmacy-medicine record
            await fetchAllInventory();
            
            // Close the modal and reset all states
            setSelectedItem(null);
            setStockAdjustment({ type: 'add', amount: '', reason: '' }); // Reset to 'add' type
            setShowStockModal(false);
            return;
            
          } catch (addError) {
            console.error('❌ Error adding medicine to pharmacy:', addError);
            if (addNotification) {
              addNotification({
                type: 'error',
                message: `Failed to add medicine to pharmacy: ${addError.message}`
              });
            }
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error finding pharmacy-medicine record:', error);
        if (addNotification) {
          addNotification({
            type: 'error',
            message: 'Error finding medicine record. Please try again.'
          });
        }
        return;
      }
    }
    
    if (!pharmacyMedicineId) {
      console.error('❌ No valid pharmacy-medicine ID found:', selectedItem);
      if (addNotification) {
        addNotification({
          type: 'error',
          message: 'Cannot identify pharmacy-medicine ID. Please try again.'
        });
      }
      return;
    }

    console.log('✅ Using pharmacy-medicine ID for stock adjustment:', pharmacyMedicineId);

    try {
      let inventoryService;
      try {
        inventoryService = (await import('../../services/inventoryService')).default;
      } catch (importError) {
        inventoryService = mockInventoryService;
      }

      const adjustmentData = {
        amount: parseInt(stockAdjustment.amount),
        reason: stockAdjustment.reason || 'Manual adjustment'
      };

      console.log('📤 Sending stock adjustment:', {
        pharmacyMedicineId: pharmacyMedicineId,
        type: stockAdjustment.type,
        data: adjustmentData
      });

      if (stockAdjustment.type === 'add') {
        await inventoryService.addStock(pharmacyMedicineId, adjustmentData);
      } else {
        await inventoryService.removeStock(pharmacyMedicineId, adjustmentData);
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
      fetchAllInventory(); // Refresh all inventory
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
    fetchAllInventory();
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

  // Pagination helper functions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPaginationInfo = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return `Showing ${start}-${end} of ${totalItems} items${debouncedSearchTerm ? ` for "${debouncedSearchTerm}"` : ''} (globally sorted)`;
  };

  const columns = [
    { 
      key: 'medicine_name', 
      label: 'Medicine',
      render: (value, item) => (
        <div>
          <div className="font-medium">{value || item.medicine?.nom_commercial || 'Unknown'}</div>
          {item.medicine?.forme && (
            <div className="text-sm text-gray-500">{item.medicine.forme}</div>
          )}
        </div>
      )
    },
    { 
      key: 'stock', 
      label: 'Current Stock',
      render: (value, item) => {
        const stock = Number(value || item.quantity || 0);
        const isAvailable = stock > 0;
        return (
          <div className="text-center">
            <div className={`font-semibold ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
              {stock}
            </div>
            <div className="text-xs text-gray-500">
              {isAvailable ? 'available' : 'out of stock'}
            </div>
          </div>
        );
      }
    },
    { 
      key: 'minimum_stock_level', 
      label: 'Min Level',
      render: (value) => (
        <div className="text-center text-sm">{value || 0}</div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (_, item) => {
        const stock = item.stock || item.quantity || 0;
        const minLevel = item.minimum_stock_level || 0;
        const status = getStockStatus(stock, minLevel);
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
      render: (_, item) => {
        const hasStock = item.id && (item.quantity > 0 || item.stock > 0);
        const isInPharmacy = item.id !== null && item.id !== undefined;
        
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedItem(item);
                setStockAdjustment(prev => ({ ...prev, type: 'add' }));
                setShowStockModal(true);
              }}
              title={isInPharmacy ? "Add more stock" : "Add medicine to pharmacy"}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {/* Only show minus button for medicines that are in pharmacy inventory */}
            {isInPharmacy && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedItem(item);
                  setStockAdjustment(prev => ({ ...prev, type: 'remove' }));
                  setShowStockModal(true);
                }}
                title="Remove stock"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      }
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

        {/* Search & Info */}
        <Card className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search medicines by name, code, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {/* Search Results Info */}
          {!loading && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                {renderPaginationInfo()}
              </div>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                🌍 Global Smart Sort: Available medicines first across ALL {totalItems} items
              </div>
            </div>
          )}
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
            data={displayedInventory}
            loading={loading}
            emptyMessage={
              debouncedSearchTerm 
                ? `No medicines found matching "${debouncedSearchTerm}"`
                : "No medicines in inventory"
            }
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                {renderPaginationInfo()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="min-w-[2.5rem]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Stock Adjustment Modal */}
        <Modal
          isOpen={showStockModal}
          onClose={() => setShowStockModal(false)}
          title={`${stockAdjustment.type === 'add' ? 'Add' : 'Remove'} Stock - ${
            selectedItem?.medicine_name || 
            selectedItem?.medicine?.nom_commercial || 
            selectedItem?.nom_commercial || 
            'Unknown Medicine'
          }`}
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
