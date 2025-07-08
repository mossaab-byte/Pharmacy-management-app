import React, { useState, useRef, useEffect } from 'react';
import { Search, Scan, Plus, X } from 'lucide-react';
import MedicineService from '../../services/medicineService';

const MedicineSearchWithBarcode = ({ 
  onMedicineSelect, 
  onMedicineAdd, 
  placeholder = "Search medicines or scan barcode...",
  showAddButton = true,
  autoFocus = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          // Check if it's a barcode (numeric and 8+ digits)
          if (/^\d{8,}$/.test(searchTerm)) {
            const response = await MedicineService.searchByCode(searchTerm);
            if (response.data.found) {
              setMedicines([response.data.medicine]);
              // Auto-select for barcode
              handleMedicineSelect(response.data.medicine);
            } else {
              setMedicines([]);
            }
          } else {
            // Regular search
            const response = await MedicineService.quickSearch(searchTerm, 10);
            setMedicines(response.data);
          }
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setMedicines([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setMedicines([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Handle medicine selection
  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setSearchTerm(medicine.nom);
    setShowResults(false);
    if (onMedicineSelect) {
      onMedicineSelect(medicine);
    }
  };

  // Handle add to cart/purchase
  const handleAddMedicine = () => {
    if (selectedMedicine && onMedicineAdd) {
      onMedicineAdd(selectedMedicine);
      // Clear after adding
      setSelectedMedicine(null);
      setSearchTerm('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm('');
    setSelectedMedicine(null);
    setMedicines([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          
          {searchTerm && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setScanMode(!scanMode)}
            className={`p-1 rounded ${scanMode ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-600`}
            title="Barcode Scanner Mode"
          >
            <Scan className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scanner Mode Alert */}
      {scanMode && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Barcode Scanner Mode:</strong> Scan a barcode or type the medicine code
          </p>
        </div>
      )}

      {/* Search Results */}
      {showResults && medicines.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              onClick={() => handleMedicineSelect(medicine)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{medicine.nom}</p>
                  <p className="text-sm text-gray-600">{medicine.dci1} • {medicine.forme}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      medicine.princeps_generique === 'P' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {medicine.princeps_generique === 'P' ? 'Brand' : 'Generic'}
                    </span>
                    <span className="text-xs text-gray-500">Code: {medicine.code}</span>
                  </div>
                </div>
                {medicine.prix_br && (
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {parseFloat(medicine.prix_br).toFixed(2)} DH
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      {showAddButton && selectedMedicine && (
        <div className="mt-3 flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div>
            <p className="font-medium text-green-900">Selected: {selectedMedicine.nom}</p>
            <p className="text-sm text-green-700">Code: {selectedMedicine.code}</p>
          </div>
          <button
            onClick={handleAddMedicine}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Use barcode scanner or type medicine names/codes • Automatic detection for 8+ digit codes
      </div>
    </div>
  );
};

export default MedicineSearchWithBarcode;
