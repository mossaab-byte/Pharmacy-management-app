import React, { useState, useEffect } from 'react';
import { Search, Scan, X } from 'lucide-react';
import medicineService from '../../services/medicineService';

const MedicineSearchWithBarcode = ({ onSelect, onMedicineSelect, placeholder = "Search medicines..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  // Use either prop name for backwards compatibility
  const handleMedicineSelect = onMedicineSelect || onSelect;

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await medicineService.quickSearch(query);
      setResults(response.data || []);
      setShowResults(true);
    } catch (err) {
      setError('Failed to search medicines');
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (medicine) => {
    if (handleMedicineSelect) {
      handleMedicineSelect(medicine);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  const handleBarcodeSearch = async () => {
    // In a real application, this would integrate with a barcode scanner
    // For now, we'll just focus on the search input
    const code = prompt('Enter barcode:');
    if (code) {
      try {
        setLoading(true);
        const response = await medicineService.searchByCode(code);
        if (response.data) {
          handleSelect(response.data);
        } else {
          setError('Medicine not found');
        }
      } catch (err) {
        setError('Failed to find medicine by barcode');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowResults(false);
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleBarcodeSearch}
            className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-300"
            title="Scan barcode"
          >
            <Scan className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Searching...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-red-300 rounded-md shadow-lg">
          <div className="p-3 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((medicine) => (
            <div
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-base">
                    {medicine.nom || medicine.nom_commercial || 'Unknown Medicine'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {medicine.dci1 && `${medicine.dci1} • `}
                    {medicine.forme || 'Unknown form'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {medicine.presentation || 'No presentation info'}
                  </p>
                  {medicine.code && (
                    <p className="text-xs text-gray-400 mt-1">
                      Code: {medicine.code}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(medicine.ppv || medicine.prix_public || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {medicine.princeps_generique === 'P' ? 'Princeps' : medicine.princeps_generique === 'G' ? 'Generic' : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && searchTerm && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 text-center">
            <p className="text-sm text-gray-600">No medicines found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSearchWithBarcode;
