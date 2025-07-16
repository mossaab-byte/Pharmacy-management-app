import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/UI';
import { Button } from '../../components/UI';
import { Plus, ArrowLeft, RefreshCw, Search, Filter, Eye, Edit, Package } from 'lucide-react';
import medicineService from '../../services/medicineService';

const MedicinesPageStable = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicineService.getAll();
      // Ensure we always have an array
      let medicineData = [];
      if (Array.isArray(response)) {
        medicineData = response;
      } else if (response && Array.isArray(response.data)) {
        medicineData = response.data;
      } else if (response && Array.isArray(response.results)) {
        medicineData = response.results;
      }
      setMedicines(medicineData);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Please try again.');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleView = (id) => {
    if (id) {
      navigate(`/medicines/${id}`);
    }
  };

  const handleEdit = (id) => {
    if (id) {
      navigate(`/medicines/edit/${id}`);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (medicine?.nom || '').toLowerCase().includes(search) ||
      (medicine?.dci1 || '').toLowerCase().includes(search) ||
      (medicine?.code || '').toLowerCase().includes(search) ||
      (medicine?.forme || '').toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00 DH';
    return `${amount.toFixed(2)} DH`;
  };

  const getStockStatusStyle = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Medicines Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchMedicines}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/medicines/new')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search medicines by name, DCI, code, or form..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-red-600 text-sm">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          /* Medicines Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMedicines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        {medicines.length === 0 ? 'No medicines found' : 'No medicines match your search'}
                      </td>
                    </tr>
                  ) : (
                    currentMedicines.map((medicine) => (
                      <tr key={medicine?.id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {medicine?.code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            {medicine?.nom || 'Unknown Medicine'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {medicine?.dci1 || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {medicine?.forme || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(medicine?.ppv || medicine?.prix_public || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusStyle(medicine?.stock || 0)}`}>
                            {medicine?.stock || 0} units
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {getStockStatusText(medicine?.stock || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(medicine?.id)}
                              disabled={!medicine?.id}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(medicine?.id)}
                              disabled={!medicine?.id}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredMedicines.length)} of {filteredMedicines.length} medicines
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {filteredMedicines.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
            <div>
              Total medicines: {filteredMedicines.length}
            </div>
            <div>
              Low stock items: {filteredMedicines.filter(m => (m?.stock || 0) < 10).length}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MedicinesPageStable;
