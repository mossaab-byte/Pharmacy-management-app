import React, { useEffect, useState } from 'react';
import  saleService  from '../../services/salesServices';
import SalesTable from '../../components/sales/salesTable';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const SalesManagementPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSales = () => {
    setLoading(true);
    saleService.getAll()
      .then(setSales)
      .finally(() => setLoading(false));
  };

  useEffect(fetchSales, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete sale?')) return;
    await saleService.remove(id);
    fetchSales();
  };

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Sales</h1>
        <Button onClick={() => navigate('/sales/new')}>+ New Sale</Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <SalesTable
          sales={sales}
          onView={id => navigate(`/sales/${id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default SalesManagementPage;
