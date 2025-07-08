import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import  medicineService  from '../../services/medicineService';
import { usePagination } from '../../hooks/usePagination';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: medicines, loading } = useApi(medicineService.getAllMedicines);

  const filtered = medicines?.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const { currentPage, setCurrentPage, paginatedData, totalPages } = usePagination(filtered);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'generic_name', header: 'Generic Name' },
    { key: 'dosage', header: 'Dosage' },
    { key: 'form', header: 'Form' },
    { key: 'manufacturer', header: 'Manufacturer' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="products-page max-w-7xl mx-auto p-4">
      <Card title="Available Medicines">
        <div className="products-header mb-4">
          <Input
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </div>

        <Table columns={columns} data={paginatedData} />

        <div className="pagination flex justify-center items-center space-x-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Previous Page"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Next Page"
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Products;
