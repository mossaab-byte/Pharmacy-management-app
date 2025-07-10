import React from 'react';
import { Link } from 'react-router-dom';

const TroubleshootingPage = () => {
  const checkBackend = () => {
    window.open('http://localhost:8000/api/medicine/medicines/', '_blank');
  };

  const checkFrontend = () => {
    console.log('Testing frontend service...');
    import('../../services/medicineService').then(service => {
      console.log('Service imported:', service);
      console.log('Default export:', service.default);
      console.log('Available methods:', Object.keys(service.default));
      console.log('getAllMedicines exists:', typeof service.default.getAllMedicines);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔧 Troubleshooting Guide</h1>
      
      <div className="space-y-6">
        {/* Step 1: Check Django Backend */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold mb-3 text-blue-800">Step 1: Check Django Backend</h2>
          <p className="mb-4 text-blue-700">First, verify that your Django backend is running and accessible.</p>
          <button 
            onClick={checkBackend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-3"
          >
            Test Django API
          </button>
          <p className="text-sm text-blue-600 mt-2">
            This should open a page showing JSON data with your medicines. If it fails, Django isn't running.
          </p>
        </div>

        {/* Step 2: Check Service Import */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-bold mb-3 text-green-800">Step 2: Check Frontend Service</h2>
          <p className="mb-4 text-green-700">Test if the medicineService is properly imported.</p>
          <button 
            onClick={checkFrontend}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-3"
          >
            Test Service Import
          </button>
          <p className="text-sm text-green-600 mt-2">
            Check the browser console for service import details.
          </p>
        </div>

        {/* Step 3: Manual Fixes */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-bold mb-3 text-yellow-800">Step 3: Manual Fixes</h2>
          <div className="space-y-3 text-yellow-700">
            <div>
              <h3 className="font-medium">If Django isn't running:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                <li>Close all existing server windows</li>
                <li>Run <code className="bg-yellow-100 px-1 rounded">start_dev.bat</code> again</li>
                <li>Wait for TWO windows to open (Django Server + React Server)</li>
                <li>Check Django window for any error messages</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium">If Django has database errors:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                <li>In Django window: <code className="bg-yellow-100 px-1 rounded">python manage.py migrate</code></li>
                <li>Check if database file exists: <code className="bg-yellow-100 px-1 rounded">backend/db.sqlite3</code></li>
                <li>Load sample data if needed</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium">If virtual environment issues:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                <li>Check if <code className="bg-yellow-100 px-1 rounded">venv</code> folder exists</li>
                <li>Manually activate: <code className="bg-yellow-100 px-1 rounded">venv\Scripts\activate.bat</code></li>
                <li>Install dependencies: <code className="bg-yellow-100 px-1 rounded">pip install -r requirements.txt</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Quick Test Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/test/backend" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center block">
              Backend Connection Test
            </Link>
            <Link to="/sales/stable" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-center block">
              Try Stable Sales Form
            </Link>
          </div>
        </div>

        {/* Current Error Details */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-bold mb-3 text-red-800">Current Error Analysis</h2>
          <div className="text-red-700 space-y-2">
            <p><strong>Error:</strong> "_services_medicineService__WEBPACK_IMPORTED_MODULE_1__.default(...).getAllMedicines is not a function"</p>
            <p><strong>Meaning:</strong> Either the service isn't properly exported, or Django backend isn't responding.</p>
            <p><strong>Most Likely Cause:</strong> Django backend server isn't running.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingPage;
