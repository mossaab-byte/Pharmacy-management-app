import React, { useState, useEffect } from 'react';
import { Button } from '../UI';

// Import all services to test database connectivity
import medicineService from '../../services/medicineService';
import salesServices from '../../services/salesServices';
import purchaseService from '../../services/purchaseService';
import customerService from '../../services/customerService';
import supplierService from '../../services/supplierService';
import exchangeService from '../../services/exchangeService';
import dashboardService from '../../services/dashboardService';

const DatabaseConnectivityTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [summary, setSummary] = useState({});

  const tests = [
    {
      name: 'Medicine Database (5000+ records)',
      key: 'medicines',
      test: async () => {
        // Test direct database connection
        const allMedicines = await medicineService.getAllMedicines();
        const searchTest = await medicineService.quickSearch('Doliprane', 10);
        const barcodeTest = await medicineService.searchByCode('6118000041252');
        
        return { 
          success: true,
          totalMedicines: allMedicines?.data?.results?.length || allMedicines?.data?.count || 0,
          searchResults: searchTest?.data?.results?.length || 0,
          barcodeFound: !!barcodeTest?.data,
          databaseConnected: allMedicines?.data?.results?.length > 3, // More than fallback data
          sample: allMedicines?.data?.results?.[0] || allMedicines?.data?.[0]
        };
      }
    },
    {
      name: 'Customer Database',
      key: 'customers',
      test: async () => {
        const result = await customerService.getAll();
        return { 
          success: true,
          count: result?.data?.results?.length || result?.length || 0,
          databaseConnected: result?.data?.results?.length > 3,
          sample: result?.data?.results?.[0] || result?.[0]
        };
      }
    },
    {
      name: 'Supplier Database',
      key: 'suppliers',
      test: async () => {
        const result = await supplierService.getAll();
        return { 
          success: true,
          count: result?.data?.results?.length || result?.length || 0,
          databaseConnected: result?.data?.results?.length > 3,
          sample: result?.data?.results?.[0] || result?.[0]
        };
      }
    },
    {
      name: 'Sales Database',
      key: 'sales',
      test: async () => {
        const result = await salesServices.getAll();
        return { 
          success: true,
          count: result?.data?.results?.length || result?.length || 0,
          databaseConnected: result?.data?.results?.length > 2,
          sample: result?.data?.results?.[0] || result?.[0]
        };
      }
    },
    {
      name: 'Purchase Database',
      key: 'purchases',
      test: async () => {
        const result = await purchaseService.getAll();
        return { 
          success: true,
          count: result?.data?.results?.length || result?.length || 0,
          databaseConnected: result?.data?.results?.length > 2,
          sample: result?.data?.results?.[0] || result?.[0]
        };
      }
    },
    {
      name: 'Exchange System',
      key: 'exchanges',
      test: async () => {
        const exchanges = await exchangeService.getExchanges();
        const partners = await exchangeService.getPartnerPharmacies();
        return { 
          success: true,
          exchangeCount: exchanges?.length || 0,
          partnerCount: partners?.length || 0,
          databaseConnected: partners?.length > 2
        };
      }
    },
    {
      name: 'Dashboard Metrics',
      key: 'dashboard',
      test: async () => {
        const result = await dashboardService.getDashboardData();
        return { 
          success: true,
          hasStats: !!(result?.stats || result?.summary),
          hasCharts: !!(result?.charts || result?.salesData),
          databaseConnected: !!(result?.stats?.totalSales > 0),
          sample: result
        };
      }
    },
    {
      name: 'Medicine Search Performance',
      key: 'searchPerformance',
      test: async () => {
        const startTime = Date.now();
        
        // Test multiple search queries
        const searches = await Promise.all([
          medicineService.quickSearch('Doliprane'),
          medicineService.quickSearch('Aspirin'),
          medicineService.quickSearch('Ibuprofen'),
          medicineService.quickSearch('Paracetamol'),
          medicineService.quickSearch('Amoxicilline')
        ]);
        
        const endTime = Date.now();
        const totalResults = searches.reduce((sum, search) => 
          sum + (search?.data?.results?.length || 0), 0
        );
        
        return {
          success: true,
          searchTime: endTime - startTime,
          totalResults,
          avgResultsPerSearch: Math.round(totalResults / searches.length),
          performanceGood: (endTime - startTime) < 2000 // Under 2 seconds
        };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    
    let totalTests = tests.length;
    let passedTests = 0;
    let databaseConnected = 0;
    
    for (const test of tests) {
      setCurrentTest(test.name);
      try {
        const result = await test.test();
        setTestResults(prev => ({
          ...prev,
          [test.key]: { ...result, status: 'success' }
        }));
        passedTests++;
        if (result.databaseConnected) databaseConnected++;
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
    
    setSummary({
      totalTests,
      passedTests,
      databaseConnected,
      allPassed: passedTests === totalTests,
      mostlyDatabaseConnected: databaseConnected >= (totalTests * 0.7)
    });
    
    setCurrentTest('');
    setIsRunning(false);
  };

  const getStatusIcon = (status, connected) => {
    if (status === 'error') return '❌';
    if (connected) return '🟢'; // Database connected
    return '🟡'; // Using fallback data
  };

  const getStatusColor = (status, connected) => {
    if (status === 'error') return 'text-red-600';
    if (connected) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Database Connectivity & Performance Test</h2>
        <Button 
          onClick={runAllTests}
          disabled={isRunning}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? 'Testing Database...' : 'Test Database Connection'}
        </Button>
      </div>

      {isRunning && currentTest && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">Currently testing: <strong>{currentTest}</strong></p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '50%'}}></div>
          </div>
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
                  {getStatusIcon(result?.status, result?.databaseConnected)}
                </span>
              </div>
              
              {result && (
                <div className="space-y-2 text-sm">
                  <div className={`font-medium ${getStatusColor(result.status, result.databaseConnected)}`}>
                    {result.databaseConnected ? 'Database Connected' : 
                     result.success ? 'Using Fallback Data' : 'Error'}
                  </div>
                  
                  {result.totalMedicines && (
                    <div className="text-gray-600">
                      Total Medicines: {result.totalMedicines.toLocaleString()}
                    </div>
                  )}
                  
                  {result.searchResults !== undefined && (
                    <div className="text-gray-600">
                      Search Results: {result.searchResults}
                    </div>
                  )}
                  
                  {result.searchTime && (
                    <div className="text-gray-600">
                      Search Time: {result.searchTime}ms
                      {result.performanceGood && <span className="text-green-600"> ✓ Fast</span>}
                    </div>
                  )}
                  
                  {result.count !== undefined && (
                    <div className="text-gray-600">
                      Records: {result.count}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-red-600 text-xs">
                      Error: {result.error}
                    </div>
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
          
          {summary.allPassed ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <h4 className="font-semibold text-green-800">🎉 All Tests Passed!</h4>
              <p className="text-green-700">
                {summary.databaseConnected}/{summary.totalTests} services connected to database
              </p>
              {summary.mostlyDatabaseConnected && (
                <p className="text-green-700 font-medium">
                  ✅ Database connectivity is excellent!
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <h4 className="font-semibold text-yellow-800">⚠️ Mixed Results</h4>
              <p className="text-yellow-700">
                {summary.passedTests}/{summary.totalTests} tests passed, 
                {summary.databaseConnected} database connections active
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.passedTests}/{summary.totalTests}
              </div>
              <div className="text-sm text-gray-600">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.databaseConnected}
              </div>
              <div className="text-sm text-gray-600">DB Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {summary.totalTests - summary.databaseConnected}
              </div>
              <div className="text-sm text-gray-600">Using Fallback</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${summary.mostlyDatabaseConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                {summary.mostlyDatabaseConnected ? '✅' : '⚠️'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Database Optimization Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">✅ Performance Optimizations</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Pagination for 5000+ medicines</li>
              <li>• Debounced search (250ms)</li>
              <li>• Optimized API endpoints</li>
              <li>• Efficient field selection</li>
              <li>• Batch loading by IDs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">✅ Database Features</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Direct database connection</li>
              <li>• Fast search by name/DCI/code</li>
              <li>• Barcode lookup</li>
              <li>• Low stock monitoring</li>
              <li>• Real-time inventory</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectivityTest;
