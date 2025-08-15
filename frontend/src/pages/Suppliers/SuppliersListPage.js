import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupplierTable from '../../components/suppliers/SupplierTable';
import Button from '../../components/UI/Button';
import  supplierService  from '../../services/supplierService';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const fetchSuppliers = (params = {}) => {
    setLoading(true);
    const queryParams = {
      search: searchTerm,
      sort_by: sortBy,
      sort_dir: sortDir,
      page: page,
      page_size: pageSize,
      ...params
    };

    supplierService.getAll(queryParams)
      .then(data => {
        setSuppliers(Array.isArray(data.results) ? data.results : []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setPageSize(data.page_size || 25);
      })
      .catch(() => addNotification({ type: 'error', message: 'Failed to load suppliers' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, [searchTerm, sortBy, sortDir, page, pageSize]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await supplierService.remove(id);
      addNotification({ type: 'success', message: 'Supplier deleted' });
      fetchSuppliers();
    } catch {
      addNotification({ type: 'error', message: 'Failed to delete supplier' });
    }
  };

  const handleView = (id) => {
    navigate(`/suppliers/${id}`);
  };

  const handlePay = (id) => {
    // Replace with your payment route if different
    navigate(`/suppliers/${id}/payments`);
  };

  const handleAddNew = () => {
    navigate('/suppliers/new');
  };

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Button onClick={handleAddNew}>+ New Supplier</Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search suppliers by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field);
              setSortDir(direction);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="current_balance-desc">Balance (High to Low)</option>
            <option value="current_balance-asc">Balance (Low to High)</option>
          </select>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {suppliers.length} of {total} suppliers
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('current_balance')}
                    >
                      Balance {sortBy === 'current_balance' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        {total === 0 ? 'No suppliers found' : 'No suppliers match your search'}
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          {supplier.contact_email && (
                            <div className="text-sm text-gray-500">{supplier.contact_email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{supplier.contact_person || 'N/A'}</div>
                          {supplier.contact_phone && (
                            <div className="text-sm text-gray-500">{supplier.contact_phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-medium ${
                            (typeof supplier.current_balance === 'number' ? supplier.current_balance : parseFloat(supplier.current_balance || 0)) > 0 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {typeof supplier.current_balance === 'number' || !isNaN(Number(supplier.current_balance))
                              ? `DH ${(Number(supplier.current_balance) || 0).toFixed(2)}`
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" onClick={() => handleView(supplier.id)}>
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(supplier.id)}
                            >
                              Delete
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

          {/* Pagination */}
          {Math.ceil(total / pageSize) > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum > Math.ceil(total / pageSize)) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
