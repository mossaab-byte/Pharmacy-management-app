import React, { useState, useEffect } from 'react';
import medicineService from '../../services/medicineService';

const MedicineSearchTest = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading medicines...');
      
      const result = await medicineService.getAll();
      console.log('📊 Medicines loaded:', result.length);
      console.log('📋 Sample medicine:', result[0]);
      
      setMedicines(result);
    } catch (err) {
      console.error('❌ Error loading medicines:', err);
      setError('Failed to load medicines: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(med => 
    searchTerm.length >= 2 && (
      med.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.nom_commercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dci1?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  console.log('🔍 Search term:', searchTerm);
  console.log('📊 Total medicines:', medicines.length);
  console.log('🎯 Filtered medicines:', filteredMedicines.length);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Medicine Search Test</h1>
      
      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Total Medicines:</strong> {medicines.length}</p>
        <p><strong>Search Term:</strong> "{searchTerm}"</p>
        <p><strong>Filtered Results:</strong> {searchTerm.length >= 2 ? filteredMedicines.length : 'Enter 2+ characters'}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Medicines (try: "dol", "paracetamol", "amox")
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type at least 2 characters..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search Results */}
      {searchTerm.length >= 2 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Search Results ({filteredMedicines.length})</h3>
          {filteredMedicines.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMedicines.slice(0, 20).map(medicine => (
                <div key={medicine.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.nom}</p>
                      <p className="text-sm text-gray-600">{medicine.dci1} • {medicine.forme}</p>
                      <p className="text-xs text-gray-500">Stock: {medicine.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{medicine.prix_public?.toFixed(2)} MAD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medicines found matching "{searchTerm}"</p>
          )}
        </div>
      )}

      {/* Sample Data Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Sample Medicines (first 5)</h3>
        {medicines.slice(0, 5).map(medicine => (
          <div key={medicine.id} className="p-2 border-b border-gray-200">
            <p><strong>Name:</strong> {medicine.nom || 'N/A'}</p>
            <p><strong>DCI:</strong> {medicine.dci1 || 'N/A'}</p>
            <p><strong>Price:</strong> {medicine.prix_public || 'N/A'}</p>
            <p><strong>Stock:</strong> {medicine.stock || 'N/A'}</p>
          </div>
        ))}
      </div>

      {/* Debug Button */}
      <button
        onClick={loadMedicines}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Reload Medicines'}
      </button>
    </div>
  );
};

export default MedicineSearchTest;
