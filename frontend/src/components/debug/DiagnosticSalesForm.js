import React, { useState, useEffect } from 'react';

const DiagnosticSalesForm = () => {
  const [status, setStatus] = useState('Initializing...');
  const [logs, setLogs] = useState([]);
  const [services, setServices] = useState({});

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    diagnoseServices();
  }, []);

  const diagnoseServices = async () => {
    addLog('🔍 Starting service diagnosis...');
    
    try {
      // Test 1: Import medicineService
      addLog('📦 Importing medicineService...');
      const medicineServiceModule = await import('../../services/medicineService');
      addLog('✅ medicineService imported successfully');
      addLog(`📋 Available methods: ${Object.keys(medicineServiceModule.default).join(', ')}`);
      
      // Log all method types for debugging
      Object.keys(medicineServiceModule.default).forEach(key => {
        addLog(`  • ${key}: ${typeof medicineServiceModule.default[key]}`);
      });
      if (typeof medicineServiceModule.default.getAllMedicines === 'function') {
        addLog('✅ getAllMedicines method exists');
        setServices(prev => ({ ...prev, medicineService: medicineServiceModule.default }));
      } else {
        addLog('❌ getAllMedicines method NOT found');
        addLog(`❌ Type: ${typeof medicineServiceModule.default.getAllMedicines}`);
      }

      // Test 2: Import customerService
      addLog('📦 Importing customerService...');
      const customerServiceModule = await import('../../services/customerService');
      addLog('✅ customerService imported successfully');
      setServices(prev => ({ ...prev, customerService: customerServiceModule.default }));

      // Test 3: Try calling the services
      addLog('🌐 Testing Django backend connection...');
      
      try {
        const response = await fetch('http://localhost:8000/api/medicine/medicines/?page_size=5');
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ Django backend is running! Found ${data.count} total medicines`);
          addLog(`📊 Sample data received: ${data.results?.length || 0} medicines`);
        } else {
          addLog(`❌ Django backend error: HTTP ${response.status}`);
        }
      } catch (fetchError) {
        addLog(`❌ Cannot reach Django backend: ${fetchError.message}`);
        addLog('💡 Make sure Django server is running on port 8000');
      }

      // Test 4: Try medicineService.getAllMedicines()
      if (services.medicineService?.getAllMedicines) {
        addLog('🧪 Testing medicineService.getAllMedicines()...');
        try {
          const result = await medicineServiceModule.default.getAllMedicines();
          addLog(`✅ getAllMedicines() worked! Got ${result.data?.results?.length || 0} medicines`);
        } catch (serviceError) {
          addLog(`❌ getAllMedicines() failed: ${serviceError.message}`);
        }
      }

      setStatus('Diagnosis complete');
      addLog('🏁 Diagnosis finished');

    } catch (error) {
      addLog(`❌ Critical error during diagnosis: ${error.message}`);
      setStatus('Diagnosis failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🩺 Sales Form Diagnostic</h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p><strong>Status:</strong> {status}</p>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">{log}</div>
        ))}
      </div>

      <div className="mt-4 space-x-4">
        <button 
          onClick={diagnoseServices}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run Diagnosis Again
        </button>
        
        <button 
          onClick={() => window.open('http://localhost:8000/api/medicine/medicines/', '_blank')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Django Directly
        </button>
        
        <a 
          href="/troubleshoot"
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
        >
          Full Troubleshooting Guide
        </a>
      </div>
    </div>
  );
};

export default DiagnosticSalesForm;
