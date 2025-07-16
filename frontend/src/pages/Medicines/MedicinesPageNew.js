import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import { Search, Package, BarChart3, Plus, Filter } from 'lucide-react';

// Mock service if the real one fails
const mockMedicineService = {
  getMedicines: async () => ({
    data: {
      results: [
        {
          id: 1,
          nom_commercial: 'Paracetamol 500mg',
          forme: 'Tablet',
          code: 'PAR500',
          prix_public: 5.99,
          princeps_generique: 'Generic'
        },
        {
          id: 2,
          nom_commercial: 'Aspirin 325mg',
          forme: 'Tablet',
          code: 'ASP325',
          prix_public: 7.50,
          princeps_generique: 'Princeps'
        }
      ],
      count: 2
    }
  }),
  getStatistics: async () => ({
    data: {
      total_medicines: 2,
      total_value: 13.49,
      categories: ['Analgesics', 'Pain Relief']
    }
  }),
  quickSearch: async (query) => ({
    data: [
      {
        id: 1,
        nom_commercial: 'Paracetamol 500mg',
        forme: 'Tablet',
        code: 'PAR500',
        prix_public: 5.99,
        princeps_generique: 'Generic'
      }
    ]
  })
};

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    total_medicines: 0,
    total_value: 0,
    categories: []
  });
  const [filters, setFilters] = useState({
    forme: '',
    princeps_generique: '',
    type: ''
  });

  const { addNotification } = useNotification();
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
      setError(null);
      
      // Try to load the real service
      let medicineService;
      try {
        medicineService = (await import('../../services/medicineService')).default;
      } catch (importError) {
        console.warn('Failed to load medicine service, using mock:', importError);
        medicineService = mockMedicineService;
      }

      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        ...filters
      };
      
      const response = await medicineService.getMedicines(params);
      const data = response.data || response;
      
      setMedicines(Array.isArray(data.results) ? data.results : []);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
      
      if (addNotification) {
        addNotification({
          type: 'success',
          message: `Loaded ${data.results?.length || 0} medicines`
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to load medicines. Please try again.';
      setError(errorMessage);
      setMedicines([]);
      console.error('Error fetching medicines:', err);
      
      if (addNotification) {
        addNotification({
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      let medicineService;
      try {
        medicineService = (await import('../../services/medicineService')).default;
      } catch (importError) {
        medicineService = mockMedicineService;
      }

      const response = await medicineService.getStatistics();
      setStatistics(response.data || {
        total_medicines: 0,
        total_value: 0,
        categories: []
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStatistics({
        total_medicines: 0,
        total_value: 0,
        categories: []
      });
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredMedicines(medicines);
      return;
    }

    const filtered = medicines.filter(medicine => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (medicine.nom_commercial && medicine.nom_commercial.toLowerCase().includes(searchLower)) ||
        (medicine.forme && medicine.forme.toLowerCase().includes(searchLower)) ||
        (medicine.code && medicine.code.toLowerCase().includes(searchLower)) ||
        (medicine.princeps_generique && medicine.princeps_generique.toLowerCase().includes(searchLower))
      );
    });

    setFilteredMedicines(filtered);
  };

  const handleRetry = () => {
    fetchMedicines();
    fetchStatistics();
  };

  const displayMedicines = searchTerm ? filteredMedicines : medicines;

  const columns = [
    { key: 'nom_commercial', label: 'Name' },
    { key: 'forme', label: 'Form' },
    { key: 'code', label: 'Code' },
    { key: 'prix_public', label: 'Price', render: (value) => `$${Number(value || 0).toFixed(2)}` },
    { key: 'princeps_generique', label: 'Type' }
  ];

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
            <p className="text-gray-600">Manage your medicine catalog</p>
          </div>
          <LoadingSpinner />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
            <p className="text-gray-600">Manage your medicine catalog</p>
          </div>
          <Button
            onClick={() => navigate('/medicines/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_medicines}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{Number(statistics.total_value || 0).toFixed(2)} DH</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.categories?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.forme}
                onChange={(e) => setFilters(prev => ({ ...prev, forme: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Forms</option>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="injection">Injection</option>
              </select>
              <select
                value={filters.princeps_generique}
                onChange={(e) => setFilters(prev => ({ ...prev, princeps_generique: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="princeps">Princeps</option>
                <option value="generique">Generic</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Medicines Table */}
        <Card>
          <Table
            columns={columns}
            data={displayMedicines}
            loading={loading}
            emptyMessage="No medicines found"
            onRowClick={(medicine) => navigate(`/medicines/${medicine.id}`)}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default MedicinesPage;
