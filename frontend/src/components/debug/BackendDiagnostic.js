import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Server, Database, Link } from 'lucide-react';
import { Button } from '../UI';

const BackendDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    backendServer: 'checking',
    salesAPI: 'checking',
    authStatus: 'checking',
    inventoryAPI: 'checking'
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-10), { timestamp, message, type }]);
    console.log(`🔍 ${timestamp}: ${message}`);
  };

  const testBackendServer = async () => {
    try {
      addLog('Testing backend server connection...', 'info');
      const response = await fetch('http://localhost:8000/admin/', { 
        method: 'GET',
        mode: 'no-cors' 
      });
      
      // Even with no-cors, if we don't get an error, server is likely running
      setDiagnostics(prev => ({ ...prev, backendServer: 'success' }));
      addLog('✅ Backend server is responding', 'success');
      return true;
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, backendServer: 'error' }));
      addLog(`❌ Backend server not responding: ${error.message}`, 'error');
      return false;
    }
  };

  const testSalesAPI = async () => {
    try {
      addLog('Testing sales API endpoint...', 'info');
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8000/api/sales/sales/', {
        headers: headers
      });

      addLog(`Sales API response status: ${response.status}`, 'info');

      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : (data.results ? data.results.length : 0);
        setDiagnostics(prev => ({ ...prev, salesAPI: 'success' }));
        addLog(`✅ Sales API working - found ${count} sales`, 'success');
        return true;
      } else if (response.status === 401) {
        setDiagnostics(prev => ({ ...prev, salesAPI: 'warning', authStatus: 'error' }));
        addLog('⚠️ Sales API requires authentication', 'warning');
        return false;
      } else if (response.status === 404) {
        setDiagnostics(prev => ({ ...prev, salesAPI: 'error' }));
        addLog('❌ Sales API endpoint not found (404) - check URL path', 'error');
        return false;
      } else {
        setDiagnostics(prev => ({ ...prev, salesAPI: 'error' }));
        addLog(`❌ Sales API error: ${response.status} ${response.statusText}`, 'error');
        return false;
      }
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, salesAPI: 'error' }));
      addLog(`❌ Sales API connection failed: ${error.message}`, 'error');
      return false;
    }
  };

  const testInventoryAPI = async () => {
    try {
      addLog('Testing inventory API endpoint...', 'info');
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8000/api/pharmacy/pharmacy-medicines/', {
        headers: headers
      });

      addLog(`Inventory API response status: ${response.status}`, 'info');

      if (response.ok) {
        const data = await response.json();
        addLog(`Inventory API raw response: ${JSON.stringify(data).substring(0, 200)}...`, 'info');
        
        const count = Array.isArray(data) ? data.length : (data.results ? data.results.length : 0);
        setDiagnostics(prev => ({ ...prev, inventoryAPI: 'success' }));
        addLog(`✅ Inventory API working - found ${count} items`, 'success');
        
        if (count > 0) {
          const firstItem = Array.isArray(data) ? data[0] : data.results[0];
          addLog(`First inventory item: ${JSON.stringify(firstItem)}`, 'info');
        }
        
        return true;
      } else if (response.status === 401) {
        setDiagnostics(prev => ({ ...prev, inventoryAPI: 'warning' }));
        addLog('⚠️ Inventory API requires authentication', 'warning');
        return false;
      } else if (response.status === 404) {
        setDiagnostics(prev => ({ ...prev, inventoryAPI: 'error' }));
        addLog('❌ Inventory API endpoint not found (404) - check URL path', 'error');
        return false;
      } else {
        setDiagnostics(prev => ({ ...prev, inventoryAPI: 'error' }));
        addLog(`❌ Inventory API error: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, inventoryAPI: 'error' }));
      addLog(`❌ Inventory API connection failed: ${error.message}`, 'error');
      return false;
    }
  };

  const testAuthStatus = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setDiagnostics(prev => ({ ...prev, authStatus: 'success' }));
      addLog('✅ User authentication found', 'success');
      return true;
    } else {
      setDiagnostics(prev => ({ ...prev, authStatus: 'warning' }));
      addLog('⚠️ No authentication found - some APIs may fail', 'warning');
      return false;
    }
  };

  const runAllDiagnostics = async () => {
    setLoading(true);
    addLog('🔍 Starting comprehensive backend diagnostic...', 'info');
    
    // Reset diagnostics
    setDiagnostics({
      backendServer: 'checking',
      salesAPI: 'checking',
      authStatus: 'checking',
      inventoryAPI: 'checking'
    });

    // Run tests in sequence
    await testBackendServer();
    testAuthStatus();
    await testSalesAPI();
    await testInventoryAPI();
    
    addLog('🏁 Diagnostic complete!', 'info');
    setLoading(false);
  };

  useEffect(() => {
    runAllDiagnostics();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Working';
      case 'warning': return 'Warning';
      case 'error': return 'Failed';
      default: return 'Checking...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Server className="h-6 w-6 mr-2 text-blue-600" />
          Backend Diagnostic Tool
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Backend Server</span>
              {getStatusIcon(diagnostics.backendServer)}
            </div>
            <div className="text-sm text-gray-600">
              {getStatusText(diagnostics.backendServer)} - http://localhost:8000
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Authentication</span>
              {getStatusIcon(diagnostics.authStatus)}
            </div>
            <div className="text-sm text-gray-600">
              {getStatusText(diagnostics.authStatus)} - User login status
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Sales API</span>
              {getStatusIcon(diagnostics.salesAPI)}
            </div>
            <div className="text-sm text-gray-600">
              {getStatusText(diagnostics.salesAPI)} - /sales/sales/
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Inventory API</span>
              {getStatusIcon(diagnostics.inventoryAPI)}
            </div>
            <div className="text-sm text-gray-600">
              {getStatusText(diagnostics.inventoryAPI)} - /pharmacy/pharmacy-medicines/
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Button
            onClick={runAllDiagnostics}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Diagnostic Log:</h3>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-500">{log.timestamp}</span>
                <span className={`ml-2 ${
                  log.type === 'error' ? 'text-red-600' : 
                  log.type === 'warning' ? 'text-yellow-600' : 
                  log.type === 'success' ? 'text-green-600' : 'text-gray-700'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Quick Fixes:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• If Backend Server fails: Start Django with `python manage.py runserver 8000`</li>
            <li>• If Authentication fails: Try logging out and back in</li>
            <li>• If APIs fail: Check CORS settings and network connectivity</li>
            <li>• Check browser console (F12) for detailed errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackendDiagnostic;
