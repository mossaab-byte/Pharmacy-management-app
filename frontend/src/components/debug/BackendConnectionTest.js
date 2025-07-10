import React, { useState, useEffect } from 'react';

const BackendConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const results = [];
    
    // Test 1: Basic fetch
    try {
      results.push('🔗 Testing basic connection...');
      const response = await fetch('http://localhost:8000/api/medicine/medicines/?page_size=5');
      if (response.ok) {
        const data = await response.json();
        results.push(`✅ Django backend is running! Found ${data.count} total medicines`);
        results.push(`📋 First 5 medicines loaded: ${data.results?.length || 0} items`);
        if (data.results?.[0]) {
          results.push(`📝 Sample medicine: ${data.results[0].nom}`);
        }
      } else {
        results.push(`❌ Django backend responded with error: ${response.status}`);
      }
    } catch (error) {
      results.push(`❌ Cannot connect to Django backend: ${error.message}`);
      results.push('💡 Make sure to run: start_dev.bat');
      results.push('💡 Check if Django server is running on http://localhost:8000');
    }

    // Test 2: API Client
    try {
      results.push('\n🔗 Testing with apiClient...');
      const { apiClient } = await import('../../services/apiClient');
      const response = await apiClient.get('/medicine/medicines/?page_size=3');
      results.push(`✅ ApiClient works! Loaded ${response.data?.results?.length || 0} medicines`);
    } catch (error) {
      results.push(`❌ ApiClient failed: ${error.message}`);
    }

    setDetails(results);
    setStatus('Test completed');
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Django Backend Connection Test</h3>
      <p className="mb-4 font-medium">{status}</p>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">
          {details.map((line, i) => (
            <div key={i} className="mb-1">{line}</div>
          ))}
        </pre>
      </div>
      <button 
        onClick={testConnection}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default BackendConnectionTest;
