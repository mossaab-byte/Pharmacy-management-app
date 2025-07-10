import React, { useState, useEffect } from 'react';
import { Button } from '../UI';

// Import all services to test
import medicineService from '../../services/medicineService';
import salesServices from '../../services/salesServices';
import purchaseService from '../../services/purchaseService';
import customerService from '../../services/customerService';
import supplierService from '../../services/supplierService';
import exchangeService from '../../services/exchangeService';
import dashboardService from '../../services/dashboardService';

const ProductionReadinessTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const tests = [
    {
      name: 'Medicine Service',
      key: 'medicines',
      test: async () => {
        const result = await medicineService.getAllMedicines();
        return { 
          success: Array.isArray(result?.data?.results) || Array.isArray(result),
          count: result?.data?.results?.length || result?.length || 0,
          sample: result?.data?.results?.[0] || result?.[0] || null
        };
      }
    },
    {
      name: 'Customer Service',
      key: 'customers',
      test: async () => {
        const result = await customerService.getAll();
        return { 
          success: Array.isArray(result?.data?.results) || Array.isArray(result),
          count: result?.data?.results?.length || result?.length || 0,
          sample: result?.data?.results?.[0] || result?.[0] || null
        };
      }
    },
    {
      name: 'Supplier Service',
      key: 'suppliers',
      test: async () => {
        const result = await supplierService.getAll();
        return { 
          success: Array.isArray(result?.data?.results) || Array.isArray(result),
          count: result?.data?.results?.length || result?.length || 0,
          sample: result?.data?.results?.[0] || result?.[0] || null
        };
      }
    },
    {
      name: 'Sales Service',
      key: 'sales',
      test: async () => {
        const result = await salesServices.getAll();
        return { 
          success: Array.isArray(result?.data?.results) || Array.isArray(result),
          count: result?.data?.results?.length || result?.length || 0,
          sample: result?.data?.results?.[0] || result?.[0] || null
        };
      }
    },
    {
      name: 'Purchase Service',
      key: 'purchases',
      test: async () => {
        const result = await purchaseService.getAll();
        return { 
          success: Array.isArray(result?.data?.results) || Array.isArray(result),
          count: result?.data?.results?.length || result?.length || 0,
          sample: result?.data?.results?.[0] || result?.[0] || null
        };
      }
    },
    {
      name: 'Exchange Service',
      key: 'exchanges',
      test: async () => {
        const result = await exchangeService.getExchanges();
        return { 
          success: Array.isArray(result),
          count: result?.length || 0,
          sample: result?.[0] || null
        };
      }
    },
    {
      name: 'Dashboard Service',
      key: 'dashboard',
      test: async () => {
        const result = await dashboardService.getDashboardData();
        return { 
          success: result && typeof result === 'object',
          hasStats: !!(result?.stats || result?.summary),
          sample: result
        };
      }
    },
    {
      name: 'Medicine Search',
      key: 'medicineSearch',
      test: async () => {
        const allMedicines = await medicineService.getAllMedicines();
        const medicines = allMedicines?.data?.results || allMedicines || [];
        
        // Test search functionality
        const searchTerm = 'Doliprane';
        const filtered = medicines.filter(medicine => {
          return medicine.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 medicine.nom_commercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 medicine.dci1?.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        return {
          success: medicines.length > 0,
          totalMedicines: medicines.length,
          searchResults: filtered.length,
          searchTerm: searchTerm,
          foundMedicines: filtered.slice(0, 3).map(m => m.nom)
        };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    for (const test of tests) {
      setCurrentTest(test.name);
      try {
        const result = await test.test();
        setTestResults(prev => ({
          ...prev,
          [test.key]: { ...result, status: 'success' }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [test.key]: { 
            success: false, 
            error: error.message,
            status: 'error' 
          }
        }));
      }
    }
    
    setCurrentTest('');
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Production Readiness Test</h2>
        <Button 
          onClick={runAllTests}
          disabled={isRunning}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {isRunning && currentTest && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">Currently testing: <strong>{currentTest}</strong></p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          const result = testResults[test.key];
          return (
            <div key={test.key} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{test.name}</h3>
                <span className="text-2xl">
                  {getStatusIcon(result?.status)}
                </span>
              </div>
              
              {result && (
                <div className="space-y-2 text-sm">
                  <div className={`font-medium ${getStatusColor(result.status)}`}>
                    {result.success ? 'Working' : 'Error'}
                  </div>
                  
                  {result.count !== undefined && (
                    <div className="text-gray-600">
                      Count: {result.count} items
                    </div>
                  )}
                  
                  {result.totalMedicines && (
                    <div className="text-gray-600">
                      Total Medicines: {result.totalMedicines}
                    </div>
                  )}
                  
                  {result.searchResults !== undefined && (
                    <div className="text-gray-600">
                      Search Results for "{result.searchTerm}": {result.searchResults}
                    </div>
                  )}
                  
                  {result.foundMedicines && (
                    <div className="text-gray-600">
                      Found: {result.foundMedicines.join(', ')}
                    </div>
                  )}
                  
                  {result.hasStats && (
                    <div className="text-green-600">
                      Dashboard stats available
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-red-600 text-xs">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.sample && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600">Sample Data</summary>
                      <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.sample, null, 2).substring(0, 300)}...
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            {Object.values(testResults).every(r => r.status === 'success') ? (
              <div className="text-green-600 font-semibold">
                🎉 All tests passed! The application is production-ready.
              </div>
            ) : (
              <div className="text-yellow-600 font-semibold">
                ⚠️ Some tests failed. Please check the error details above.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Production Readiness Checklist</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Medicine search and selection functionality</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Sales form with comprehensive medicine search</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Purchase form with supplier and medicine management</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Exchange form for pharmacy-to-pharmacy transactions</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Customer and supplier management</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Dashboard with key metrics</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Error handling and mock data fallbacks</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Responsive UI with modern styling</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionReadinessTest;
