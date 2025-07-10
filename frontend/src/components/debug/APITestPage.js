import React, { useState, useEffect } from 'react';
import medicineService from '../../services/medicineService';
import customerService from '../../services/customerService';
import supplierService from '../../services/supplierService';
import salesService from '../../services/salesServices';
import purchaseService from '../../services/purchaseService';

const APITestPage = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test Medicine Service
    try {
      const medicines = await medicineService.getAll();
      results.medicines = { 
        status: 'success', 
        count: medicines.length,
        message: `Loaded ${medicines.length} medicines`
      };
    } catch (error) {
      results.medicines = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test Customer Service
    try {
      const customers = await customerService.getAll();
      results.customers = { 
        status: 'success', 
        count: customers.length,
        message: `Loaded ${customers.length} customers`
      };
    } catch (error) {
      results.customers = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test Supplier Service
    try {
      const suppliers = await supplierService.getAll();
      results.suppliers = { 
        status: 'success', 
        count: suppliers.length,
        message: `Loaded ${suppliers.length} suppliers`
      };
    } catch (error) {
      results.suppliers = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test Sales Service
    try {
      const sales = await salesService.getAll();
      results.sales = { 
        status: 'success', 
        count: sales.length,
        message: `Loaded ${sales.length} sales`
      };
    } catch (error) {
      results.sales = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test Purchase Service
    try {
      const purchases = await purchaseService.getAll();
      results.purchases = { 
        status: 'success', 
        count: purchases.length,
        message: `Loaded ${purchases.length} purchases`
      };
    } catch (error) {
      results.purchases = { 
        status: 'error', 
        message: error.message 
      };
    }

    // Test Medicine Search
    try {
      const searchResults = await medicineService.quickSearch('para');
      results.medicineSearch = { 
        status: 'success', 
        count: searchResults.length,
        message: `Search for 'para' returned ${searchResults.length} results`
      };
    } catch (error) {
      results.medicineSearch = { 
        status: 'error', 
        message: error.message 
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✅' : '❌';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">API Connectivity Test</h1>
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(testResults).map(([service, result]) => (
            <div key={service} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold capitalize">{service}</h3>
                <span className="text-xl">
                  {getStatusIcon(result.status)}
                </span>
              </div>
              <p className={`text-sm ${getStatusColor(result.status)}`}>
                {result.message}
              </p>
              {result.count !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Count: {result.count}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Test Summary</h3>
          <div className="flex space-x-4 text-sm">
            <span className="text-green-600">
              ✅ Passed: {Object.values(testResults).filter(r => r.status === 'success').length}
            </span>
            <span className="text-red-600">
              ❌ Failed: {Object.values(testResults).filter(r => r.status === 'error').length}
            </span>
            <span className="text-gray-600">
              Total: {Object.keys(testResults).length}
            </span>
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Running API tests...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITestPage;
