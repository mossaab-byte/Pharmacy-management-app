import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import medicineService from '../../services/medicineService';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table } from '../../components/UI';
import { Search, Package, BarChart3 } from 'lucide-react';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    forme: '',
    princeps_generique: '',
    type: ''
  });

  const navigate = useNavigate();
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMedicines();
    fetchStatistics();
  }, [currentPage, filters]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        ...filters
      };
      
      const response = await medicineService.getMedicines(params);
      setMedicines(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('Failed to load medicines');
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await medicineService.getStatistics();
      setStatistics(stats.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredMedicines(medicines);
      return;
    }

    try {
      // Use quick search for real-time results
      const response = await medicineService.quickSearch(searchTerm, 50);
      setFilteredMedicines(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setFilteredMedicines(medicines);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const handleBarcodeSearch = async (code) => {
    try {
      const response = await medicineService.searchByCode(code);
      if (response.data.found) {
        setFilteredMedicines([response.data.medicine]);
        setSearchTerm(code);
      }
    } catch (err) {
      console.error('Barcode search error:', err);
    }
  };

  const columns = [
    { 
      key: 'code', 
      header: 'Code/Barcode',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    { 
      key: 'name', 
      header: 'Medicine Name',
      render: (value) => (
        <span className="font-semibold text-blue-600">{value}</span>
      )
    },
    { key: 'dci1', header: 'DCI' },
    { 
      key: 'dosage1', 
      header: 'Dosage',
      render: (value, row) => `${value || ''} ${row.unite_dosage1 || ''}`
    },
    { key: 'form', header: 'Form' },
    { 
      key: 'public_price', 
      header: 'Price',
      render: (value) => value ? `${parseFloat(value).toFixed(2)} MAD` : 'N/A'
    },
    { 
      key: 'princeps_generique', 
      header: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'Princeps' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const displayData = searchTerm ? filteredMedicines : medicines;

  return (
    <div className="medicines-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Database</h1>
        <p className="text-gray-600">Browse and search through {statistics?.total || 'thousands of'} medicines</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Package className="h-12 w-12 text-blue-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total?.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-12 w-12 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Price Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.min_price?.toFixed(2)} - {statistics.max_price?.toFixed(2)} MAD
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Search className="h-12 w-12 text-purple-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Search Ready</p>
                <p className="text-2xl font-bold text-gray-900">Barcode Enabled</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, DCI, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>

          {/* Quick Barcode Test */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Quick test:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBarcodeSearch('6118010000270')}
            >
              Test Barcode: 6118010000270
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.forme}
              onChange={(e) => handleFilterChange('forme', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Forms</option>
              <option value="COMPRIME">Comprimé</option>
              <option value="GELULE">Gélule</option>
              <option value="SOLUTION">Solution</option>
              <option value="SIROP">Sirop</option>
              <option value="POUDRE">Poudre</option>
            </select>

            <select
              value={filters.princeps_generique}
              onChange={(e) => handleFilterChange('princeps_generique', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="P">Princeps</option>
              <option value="G">Générique</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({ forme: '', princeps_generique: '', type: '' });
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {error && <ErrorMessage message={error} className="m-6" />}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {searchTerm ? 'Search Results' : 'All Medicines'} 
                ({displayData.length} {searchTerm ? 'found' : 'showing'})
              </h2>
            </div>

            <Table 
              columns={columns} 
              data={displayData}
              className="w-full"
            />

            {/* Pagination - only show if not searching */}
            {!searchTerm && totalPages > 1 && (
              <div className="flex justify-between items-center p-6 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default MedicinesPage;
