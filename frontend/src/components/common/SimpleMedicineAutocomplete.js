import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const SimpleMedicineAutocomplete = ({ 
  onSelect, 
  selectedMedicine,
  placeholder = "Rechercher un médicament..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const allMedicinesRef = useRef([]); // Cache des médicaments
  const isLoadedRef = useRef(false); // Flag pour savoir si les données sont chargées

  // Charger tous les médicaments une seule fois
  useEffect(() => {
    const loadAllMedicines = async () => {
      if (!isLoadedRef.current) {
        try {
          const response = await fetch(`http://localhost:8000/api/medicine/medicines/search_all/?limit=6000`);
          
          if (response.ok) {
            const data = await response.json();
            allMedicinesRef.current = Array.isArray(data) ? data : data.results || [];
            isLoadedRef.current = true;
            console.log(`${allMedicinesRef.current.length} médicaments chargés en cache`);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des médicaments:', error);
        }
      }
    };
    
    loadAllMedicines();
  }, []);

  // Fonction de recherche optimisée avec cache
  const searchMedicines = (query) => {
    console.log('🔍 Searching for:', query); // Debug log
    
    if (!query || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    // Si les données ne sont pas encore chargées, attendre
    if (!isLoadedRef.current) {
      setLoading(true);
      return;
    }

    setLoading(true);
    
    // Recherche instantanée dans le cache
    const queryLower = query.toLowerCase().trim();
    const filtered = allMedicinesRef.current.filter(medicine => {
      const nomCommercial = (medicine.nom_commercial || '').toLowerCase();
      const nom = (medicine.nom || '').toLowerCase();
      const dci1 = (medicine.dci1 || '').toLowerCase();
      const code = (medicine.code || '').toLowerCase();
      const forme = (medicine.forme || '').toLowerCase();
      
      return nomCommercial.includes(queryLower) ||
             nom.includes(queryLower) ||
             dci1.includes(queryLower) ||
             code.includes(queryLower) ||
             forme.includes(queryLower);
    }).slice(0, 10); // Limiter à 10 résultats
    
    console.log(`Found ${filtered.length} results for "${query}"`); // Debug log
    
    setResults(filtered);
    setShowDropdown(filtered.length > 0);
    setSelectedIndex(-1);
    setLoading(false);
  };

  // Debounced search - réduit le délai pour une recherche plus rapide
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchMedicines(searchTerm);
    }, 100); // Slight delay to allow for proper typing

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Handle input change with immediate feedback
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear results immediately if input is too short
    if (value.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
    
    // If we have a selected medicine and user is typing, clear the selection
    if (selectedMedicine && value !== (selectedMedicine.nom_commercial || selectedMedicine.nom || '')) {
      onSelect(null);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (medicine) => {
    setSearchTerm(medicine.nom_commercial || medicine.nom || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
    setResults([]); // Vider les résultats pour éviter la réaffichage
    if (onSelect) {
      onSelect(medicine);
    }
  };

  const clearSelection = () => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setLoading(false);
    if (onSelect) {
      onSelect(null);
    }
  };

  // Update search term when selectedMedicine changes
  useEffect(() => {
    if (selectedMedicine) {
      const displayName = selectedMedicine.nom_commercial || selectedMedicine.nom || '';
      setSearchTerm(displayName);
      setResults([]);
      setShowDropdown(false);
    } else if (!searchTerm) {
      // Only clear if search term is empty (to avoid clearing when user is typing)
      setResults([]);
      setShowDropdown(false);
    }
  }, [selectedMedicine]);

  return (
    <div className="relative">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mb-1">
          Search: "{searchTerm}" | Results: {results.length} | Dropdown: {showDropdown ? 'Open' : 'Closed'}
        </div>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Show dropdown if there are results and search term is valid
            if (searchTerm.length >= 2 && results.length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            // Délai simple pour permettre le clic
            setTimeout(() => setShowDropdown(false), 200);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`} 
        />
        
        {/* Indicateur de chargement initial ou recherche */}
        {(loading || !isLoadedRef.current) && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Indicateur de cache chargé */}
        {isLoadedRef.current && !loading && searchTerm.length < 2 && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="h-2 w-2 bg-green-500 rounded-full" title={`${allMedicinesRef.current.length} médicaments en cache`}></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((medicine, index) => (
            <div
              key={medicine.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Empêche le onBlur de se déclencher
                handleSelect(medicine);
              }}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {medicine.nom_commercial || medicine.nom}
                  </div>
                  {medicine.dci1 && (
                    <div className="text-sm text-gray-600">{medicine.dci1}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {medicine.forme} • Code: {medicine.code}
                  </div>
                  {/* Stock Information */}
                  <div className={`text-xs font-medium mt-1 ${
                    (medicine.stock || 0) > 20 ? 'text-green-600' : 
                    (medicine.stock || 0) > 5 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    Stock: {medicine.stock || 0} unités
                    {(medicine.stock || 0) === 0 && (
                      <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                        Rupture
                      </span>
                    )}
                    {(medicine.stock || 0) > 0 && (medicine.stock || 0) <= 5 && (
                      <span className="ml-1 px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                        Stock faible
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {parseFloat(medicine.prix_public || medicine.ppv || 0).toFixed(2)} MAD
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleMedicineAutocomplete;
