import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/UI';
import { Button } from '../../components/UI';
import MedicineAutocomplete from '../../components/common/MedicineAutocomplete';
import { Plus, ArrowLeft, RefreshCw, Search, Filter, Eye, Package } from 'lucide-react';

// Fixed medicines reference error - 2025-07-14

const MedicinesPageFixed = () => {
  const navigate = useNavigate();
  const [allMedicines, setAllMedicines] = useState([]); // Tous les médicaments
  const [filteredMedicines, setFilteredMedicines] = useState([]); // Médicaments filtrés
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [isSearching, setIsSearching] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching medicines...');
      
      // Use the search_all endpoint to get more medicines (up to 6000)
      const response = await fetch('http://localhost:8000/api/medicine/medicines/search_all/?limit=6000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Raw API response:', data);
        
        // Handle different response formats
        let medicineData = [];
        if (Array.isArray(data)) {
          medicineData = data;
        } else if (data && Array.isArray(data.results)) {
          medicineData = data.results;
        } else if (data && Array.isArray(data.data)) {
          medicineData = data.data;
        }
        
        console.log(`✅ Processed ${medicineData.length} medicines`);
        setAllMedicines(medicineData);
        setFilteredMedicines(medicineData); // Initialement, afficher tous les médicaments
        setCurrentPage(1); // Réinitialiser à la page 1
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Error fetching medicines:', err);
      setError(`Failed to load medicines: ${err.message}`);
      setAllMedicines([]);
      setFilteredMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Fonction de recherche en temps réel
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Réinitialiser à la page 1
    
    if (!value.trim()) {
      // Si la recherche est vide, afficher tous les médicaments
      setFilteredMedicines(allMedicines);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Filtrer les médicaments côté client pour une recherche instantanée
    const searchTermLower = value.toLowerCase();
    const filtered = allMedicines.filter(medicine => 
      medicine.nom_commercial?.toLowerCase().includes(searchTermLower) ||
      medicine.nom?.toLowerCase().includes(searchTermLower) ||
      medicine.dci1?.toLowerCase().includes(searchTermLower) ||
      medicine.code?.toLowerCase().includes(searchTermLower) ||
      medicine.presentation?.toLowerCase().includes(searchTermLower) ||
      medicine.forme?.toLowerCase().includes(searchTermLower)
    );
    
    setFilteredMedicines(filtered);
    setIsSearching(false);
  };

  // Fonction pour nettoyer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredMedicines(allMedicines);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Cette fonction est maintenant gérée par handleSearchChange en temps réel
  };

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Medicines Management</h1>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                  {isSearching ? 'Recherche...' : 
                   searchTerm ? `${filteredMedicines.length} résultat${filteredMedicines.length > 1 ? 's' : ''} sur ${allMedicines.length}` :
                   `${allMedicines.length} médicaments chargés`}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={fetchMedicines}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Medicine</span>
              </Button>
            </div>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Recherche instantanée par nom, DCI, code, forme..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button 
                onClick={() => fetchMedicines()}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </Button>
            </form>
            
            {/* Quick Search Info */}
            {searchTerm && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                <div>
                  <span className="font-medium">Recherche active:</span> "{searchTerm}"
                  {filteredMedicines.length > 0 && (
                    <span className="ml-2">
                      ({filteredMedicines.length} résultat{filteredMedicines.length > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
                <Button 
                  onClick={fetchMedicines} 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 mb-2">Aucun médicament trouvé pour "{searchTerm}"</p>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Afficher tous les médicaments
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">Aucun médicament disponible</p>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DCI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentMedicines.map((medicine) => (
                      <tr key={medicine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {medicine.code || medicine.Code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medicine.nom_commercial || medicine.nom || medicine.Nom || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medicine.dci1 || medicine.DCI || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medicine.forme || medicine.Forme || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(medicine.prix_public || medicine.prix || medicine.Prix) ? 
                            `${medicine.prix_public || medicine.prix || medicine.Prix} DH` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medicine.stock || medicine.Stock || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/medicines/${medicine.id}`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredMedicines.length)} of {filteredMedicines.length} medicines
                  <span className="text-blue-600 font-medium"> (Total: {allMedicines.length} in database)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicinesPageFixed;
