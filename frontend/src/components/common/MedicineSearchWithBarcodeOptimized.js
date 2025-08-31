import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Scan, X } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

// Ultra-fast search cache for instant results
const searchCache = new Map();
const MAX_CACHE_SIZE = 100;

// Optimized API client with caching and timeouts
const optimizedMedicineAPI = {
  quickSearch: async (query, limit = 20) => {
    try {
      if (!query || query.length < 2) {
        return { data: [] };
      }
      
      // Check cache first for instant results
      const cacheKey = `${query.toLowerCase()}_${limit}`;
      if (searchCache.has(cacheKey)) {
        console.log(`⚡ INSTANT CACHE HIT for: "${query}"`);
        return { data: searchCache.get(cacheKey) };
      }
      
      console.log(`🔍 API SEARCH for: "${query}"`);
      const response = await apiClient.get('/medicine/medicines/quick_search/', { 
        params: { q: query, limit },
        timeout: 2000  // 2 second timeout for fast response
      });
      
      const results = response.data || [];
      
      // Cache results but limit cache size
      if (searchCache.size >= MAX_CACHE_SIZE) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      searchCache.set(cacheKey, results);
      
      console.log(`✅ Found ${results.length} results for "${query}"`);
      return { data: results };
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error;
    }
  },

  searchByCode: async (code) => {
    try {
      console.log(`🔍 Barcode search for: "${code}"`);
      const response = await apiClient.get('/medicine/medicines/search_by_code/', { 
        params: { code },
        timeout: 2000
      });
      console.log(`✅ Barcode result:`, response.data?.found ? 'Found' : 'Not found');
      return response;
    } catch (error) {
      console.error('❌ Barcode search error:', error);
      throw error;
    }
  }
};

const MedicineSearchWithBarcodeOptimized = ({ 
  onSelect, 
  onMedicineSelect, 
  placeholder = "Rechercher médicaments...", 
  className = "",
  maxResults = 15 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Use either prop name for backwards compatibility
  const handleMedicineSelect = onMedicineSelect || onSelect;

  // Lightning-fast search function
  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('⚡ Lightning search for:', query);
      
      const response = await optimizedMedicineAPI.quickSearch(query, maxResults);
      const medicines = response.data || [];
      
      // Transform data for consistent display
      const transformedMedicines = medicines.map(medicine => ({
        ...medicine,
        nom: medicine.nom || medicine.name || medicine.nom_commercial,
        nom_commercial: medicine.nom_commercial || medicine.nom || medicine.name,
        prix_public: medicine.prix_public || medicine.public_price || medicine.prix_br || medicine.ppv,
        prix: medicine.prix_public || medicine.public_price || medicine.prix_br || medicine.ppv,
        ppv: medicine.ppv || medicine.prix_public || medicine.public_price || medicine.prix_br
      }));
      
      console.log(`⚡ Found ${transformedMedicines.length} medicines instantly`);
      setResults(transformedMedicines);
      setShowResults(transformedMedicines.length > 0);
      
      if (transformedMedicines.length === 0) {
        setError('Aucun médicament trouvé');
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Erreur de recherche');
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }, [maxResults]);

  // Ultra-fast debounced search with minimal delay
  const debouncedSearch = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        handleSearch(query);
      }, 30); // Ultra-fast 30ms debounce for instant feel
    } else if (query.trim().length === 0) {
      setShowResults(false);
      setResults([]);
      setError(null);
    }
  }, [handleSearch]);

  // Effect for search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

  // Handle medicine selection
  const handleSelect = useCallback((medicine) => {
    if (handleMedicineSelect) {
      handleMedicineSelect(medicine);
    }
    setSearchTerm('');
    setShowResults(false);
    setError(null);
  }, [handleMedicineSelect]);

  // Optimized barcode search
  const handleBarcodeSearch = useCallback(async () => {
    const code = prompt('Entrez le code-barres du médicament:');
    if (code && code.trim()) {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Barcode search for:', code);
        const response = await optimizedMedicineAPI.searchByCode(code.trim());
        
        if (response.data?.found && response.data.medicine) {
          handleSelect(response.data.medicine);
        } else {
          setError('Médicament non trouvé avec ce code-barres');
        }
      } catch (err) {
        console.error('❌ Barcode search error:', err);
        setError('Erreur lors de la recherche par code-barres');
      } finally {
        setLoading(false);
      }
    }
  }, [handleSelect]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    setError(null);
  }, []);

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
          onFocus={() => {
            // Show results when focused if we have some
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
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

      {/* Loading indicator */}
      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Recherche...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-red-300 rounded-md shadow-lg p-3 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {showResults && results.length > 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.map((medicine) => (
            <div
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {medicine.nom_commercial || medicine.nom}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {medicine.dci1} - {medicine.forme}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">
                      Code: {medicine.code}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {medicine.prix_public ? `${medicine.prix_public} DH` : 'Prix N/A'}
                    </span>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {medicine.princeps_generique === 'P' ? 'Princeps' : 
                     medicine.princeps_generique === 'G' ? 'Générique' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
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

export default MedicineSearchWithBarcodeOptimized;
