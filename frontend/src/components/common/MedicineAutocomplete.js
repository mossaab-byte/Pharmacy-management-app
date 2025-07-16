import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Scan, X, ChevronDown, Loader2 } from 'lucide-react';

const MedicineAutocomplete = ({ 
  onSelect, 
  placeholder = "Rechercher médicaments...", 
  className = "",
  showBarcode = true,
  maxResults = 10,
  minSearchLength = 2 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);
  const resultsRef = useRef([]);

  // Cache pour éviter les requêtes répétées
  const cacheRef = useRef(new Map());

  // Fonction de recherche optimisée avec cache
  const searchMedicines = useCallback(async (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    
    // Vérifier le cache
    if (cacheRef.current.has(normalizedQuery)) {
      const cachedResults = cacheRef.current.get(normalizedQuery);
      setResults(cachedResults);
      setShowDropdown(cachedResults.length > 0);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Appel API optimisé
      const response = await fetch(`http://localhost:8000/api/medicine/medicines/search_all/?limit=6000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const allMedicines = Array.isArray(data) ? data : (data.results || []);
      
      // Filtrage côté client avec algorithme de recherche intelligent
      const filteredResults = allMedicines
        .filter(medicine => {
          const searchFields = [
            medicine.nom_commercial,
            medicine.nom,
            medicine.dci1,
            medicine.code,
            medicine.presentation,
            medicine.forme
          ].filter(Boolean).join(' ').toLowerCase();
          
          // Recherche intelligente : commence par, contient, ou mots-clés
          const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
          
          return queryWords.every(word => searchFields.includes(word)) ||
                 searchFields.includes(normalizedQuery) ||
                 queryWords.some(word => searchFields.startsWith(word));
        })
        .slice(0, maxResults)
        .map(medicine => ({
          ...medicine,
          displayName: medicine.nom_commercial || medicine.nom || 'Médicament inconnu',
          searchMatch: normalizedQuery
        }));

      // Mettre en cache les résultats
      cacheRef.current.set(normalizedQuery, filteredResults);
      
      // Limiter la taille du cache
      if (cacheRef.current.size > 100) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setResults(filteredResults);
      setShowDropdown(filteredResults.length > 0);
      resultsRef.current = filteredResults;
      
      if (filteredResults.length === 0 && normalizedQuery.length >= minSearchLength) {
        setError(`Aucun médicament trouvé pour "${query}"`);
      }
      
    } catch (err) {
      console.error('❌ Error searching medicines:', err);
      setError('Erreur lors de la recherche');
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, [maxResults, minSearchLength]);

  // Debounced search avec nettoyage automatique
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Réinitialiser les états si la recherche est vide
    if (searchTerm.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      setError(null);
      setSelectedIndex(-1);
      cacheRef.current.clear(); // Nettoyer le cache
      return;
    }

    // Effectuer la recherche après un délai
    if (searchTerm.trim().length >= minSearchLength) {
      debounceRef.current = setTimeout(() => {
        searchMedicines(searchTerm.trim());
      }, 300);
    }

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, searchMedicines, minSearchLength]);

  // Navigation au clavier
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        clearSearch();
        break;
    }
  };

  // Sélection d'un médicament
  const handleSelect = (medicine) => {
    if (onSelect) {
      onSelect(medicine);
    }
    
    // Réinitialiser complètement l'état
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    setError(null);
    setSelectedIndex(-1);
    
    if (searchRef.current) {
      searchRef.current.blur();
    }
  };

  // Recherche par code-barres
  const handleBarcodeSearch = async () => {
    const code = prompt('Entrez le code-barres du médicament:');
    if (code && code.trim()) {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/api/medicine/medicines/search_all/?limit=6000`);
        const data = await response.json();
        const allMedicines = Array.isArray(data) ? data : (data.results || []);
        
        const foundMedicine = allMedicines.find(med => 
          med.code === code.trim() || 
          med.code_barres === code.trim()
        );
        
        if (foundMedicine) {
          handleSelect(foundMedicine);
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

  // Nettoyer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    setError(null);
    setSelectedIndex(-1);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  // Fermer le dropdown quand on clique dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {loading && (
            <div className="p-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
          
          {searchTerm && !loading && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {showBarcode && (
            <button
              onClick={handleBarcodeSearch}
              className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-300 transition-colors"
              title="Scanner code-barres"
              disabled={loading}
            >
              <Scan className="h-4 w-4" />
            </button>
          )}
          
          {showDropdown && (
            <div className="p-2">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Dropdown des résultats */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Recherche en cours...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="p-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs text-gray-600 font-medium">
                  {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                </p>
              </div>
              
              {results.map((medicine, index) => (
                <div
                  key={medicine.id}
                  onClick={() => handleSelect(medicine)}
                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedIndex 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {medicine.displayName}
                      </p>
                      {medicine.dci1 && (
                        <p className="text-xs text-blue-600 mt-1">
                          DCI: {medicine.dci1}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        {medicine.forme && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {medicine.forme}
                          </span>
                        )}
                        {medicine.code && (
                          <span className="text-xs text-gray-400">
                            Code: {medicine.code}
                          </span>
                        )}
                      </div>
                      {medicine.presentation && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {medicine.presentation}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        {parseFloat(medicine.prix_public || medicine.ppv || 0).toFixed(2)} MAD
                      </p>
                      {medicine.stock !== undefined && (
                        <p className="text-xs text-gray-500">
                          Stock: {medicine.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && !error && results.length === 0 && searchTerm.length >= minSearchLength && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">
                Aucun médicament trouvé pour "{searchTerm}"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineAutocomplete;
