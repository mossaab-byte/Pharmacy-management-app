import React, { useEffect, useState } from 'react';
import medicineService from '../../services/medicineService';
import { LoadingSpinner, Button, Input } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const MedicineTable = ({ medicines = [], onView, onDelete, deletingId }) => {
  const safeMedicines = Array.isArray(medicines) ? medicines : [];

  if (safeMedicines.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No medicines found.</p>
      </div>
    );
  }

  return (
    <table className="w-full border border-gray-200 text-left border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border border-gray-200">Code</th>
          <th className="p-3 border border-gray-200">Name</th>
          <th className="p-3 border border-gray-200">Form</th>
          <th className="p-3 border border-gray-200">Price</th>
          <th className="p-3 border border-gray-200">Type</th>
          <th className="p-3 border border-gray-200">Actions</th>
        </tr>
      </thead>
      <tbody>
        {safeMedicines.map(medicine => (
          <tr key={medicine.id || `medicine-${Math.random()}`} className="hover:bg-gray-50">
            <td className="p-3 border border-gray-200">
              {medicine.code || 'N/A'}
            </td>
            <td className="p-3 border border-gray-200">
              {medicine.nom_commercial || medicine.nom || medicine.name || 'Unknown Medicine'}
            </td>
            <td className="p-3 border border-gray-200">
              {medicine.forme || medicine.form || 'N/A'}
            </td>
            <td className="p-3 border border-gray-200">
              {medicine.prix_public || medicine.price ? 
                `$${(medicine.prix_public || medicine.price).toFixed(2)}` : 
                'N/A'
              }
            </td>
            <td className="p-3 border border-gray-200 capitalize">
              <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {medicine.princeps_generique === 'P' ? 'Princeps' : medicine.princeps_generique === 'G' ? 'Generic' : 'Medicine'}
              </span>
            </td>
            <td className="p-3 border border-gray-200 space-x-2">
              {onView && (
                <Button
                  size="sm"
                  onClick={() => onView(medicine.id)}
                  aria-label={`View medicine ${medicine.id}`}
                >
                  View
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(medicine.id)}
                  disabled={deletingId === medicine.id}
                  aria-label={`Delete medicine ${medicine.id}`}
                >
                  {deletingId === medicine.id ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MedicinesPageFixed = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMedicines = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = search ? 
        await medicineService.searchMedicines(search) : 
        await medicineService.getMedicines();
      
      let medicineData = [];
      if (Array.isArray(response)) {
        medicineData = response;
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          medicineData = response.data;
        } else if (response.data.results) {
          medicineData = Array.isArray(response.data.results) ? response.data.results : [];
        }
      }
      
      setMedicines(medicineData);
    } catch (err) {
      setError('Failed to load medicines');
      console.error('Medicines fetch error:', err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(searchTerm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete medicine?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await medicineService.deleteMedicine(id);
      fetchMedicines();
    } catch (err) {
      setError('Failed to delete medicine');
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="page px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Medicines Management</h1>
          <Button 
            onClick={() => navigate('/medicines/new')}
            variant="primary"
          >
            Add New Medicine
          </Button>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                fetchMedicines();
              }}
            >
              Clear
            </Button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => fetchMedicines()}
              className="ml-4 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <MedicineTable 
            medicines={medicines} 
            onView={(id) => navigate(`/medicines/${id}`)}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MedicinesPageFixed;
