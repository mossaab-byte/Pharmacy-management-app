import React, { useState, useEffect, useRef } from 'react';
import { Search, Scan, X } from 'lucide-react';
import medicineService from '../../services/medicineService';

const MedicineSearchWithBarcode = ({ onSelect, onMedicineSelect, placeholder = "Rechercher médicaments...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Use either prop name for backwards compatibility
  const handleMedicineSelect = onMedicineSelect || onSelect;

  // Optimized debounced search for better performance with 5000+ medicines
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        handleSearch(searchTerm);
      }, 250); // Fast search for better UX
    } else if (searchTerm.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      setError(null);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Fast database search with optimized API calls
  const handleSearch = async (query) => {
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    setError(null);
    
    try {
      // Use optimized quickSearch for fast results from database
      const response = await medicineService.quickSearch(query, 20);
      const medicines = response.data?.results || response.data || [];
      
      setResults(medicines);
      setShowResults(medicines.length > 0);
      
      if (medicines.length === 0) {
        setError('Aucun médicament trouvé');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Erreur de recherche dans la base de données');
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
    setError(null);
  };

  // Barcode search with direct database lookup
  const handleBarcodeSearch = async () => {
    const code = prompt('Entrez le code-barres du médicament:');
    if (code && code.trim()) {
      try {
        setLoading(true);
        setError(null);
        const response = await medicineService.searchByCode(code.trim());
        if (response.data) {
          handleSelect(response.data);
        } else {
          setError('Médicament non trouvé avec ce code-barres');
        }
      } catch (err) {
        console.error('Barcode search error:', err);
        setError('Erreur lors de la recherche par code-barres');
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear search and close results
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleBarcodeSearch}
            className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-300"
            title="Scanner code-barres"
          >
            <Scan className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Recherche en cours...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-red-300 rounded-md shadow-lg">
          <div className="p-3 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {showResults && results.length > 0 && !loading && (
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
                    {medicine.nom || medicine.nom_commercial || 'Médicament inconnu'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {medicine.dci1 && `${medicine.dci1} • `}
                    {medicine.forme || 'Forme inconnue'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {medicine.presentation || 'Présentation non spécifiée'}
                  </p>
                  {medicine.code && (
                    <p className="text-xs text-gray-400 mt-1">
                      Code: {medicine.code}
                    </p>
                  )}
                  {medicine.stock !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Stock: {medicine.stock} unités
                    </p>
                  )}
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {(medicine.prix_public || medicine.ppv || 0).toFixed(2)} MAD
                  </p>
                  <p className="text-xs text-gray-500">
                    {medicine.princeps_generique === 'P' ? 'Princeps' : 
                     medicine.princeps_generique === 'G' ? 'Générique' : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && searchTerm && !loading && !error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 text-center">
            <p className="text-sm text-gray-600">Aucun médicament trouvé pour "{searchTerm}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSearchWithBarcode;
