import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import  saleService  from '../../services/salesServices';
import { Card, Button } from '../UI';
import { useNotification } from '../../context/NotificationContext';

const SaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    saleService.getById(id)
      .then(setSale)
      .catch(() => addNotification('Error fetching sale details', 'error'))
      .finally(() => setLoading(false));
  }, [id, addNotification]);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!sale) return <p className="text-center py-6 text-red-600">Sale not found</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Sale Detail</h2>

      <Card title="Customer Information">
        <p><strong>Name:</strong> {sale.customer_name}</p>
        <p><strong>Phone:</strong> {sale.customer_phone || '-'}</p>
      </Card>

      <Card title="Sale Info" className="mt-6">
        <p><strong>Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
        <p><strong>Total:</strong> ${sale.total.toFixed(2)}</p>
      </Card>

      <Card title="Items" className="mt-6">
        <table className="w-full text-left border border-gray-200 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-200">Medicine</th>
              <th className="p-3 border border-gray-200">Quantity</th>
              <th className="p-3 border border-gray-200">Unit Price</th>
              <th className="p-3 border border-gray-200">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-200">{item.medicine_name}</td>
                <td className="p-3 border border-gray-200">{item.quantity}</td>
                <td className="p-3 border border-gray-200">${item.unit_price.toFixed(2)}</td>
                <td className="p-3 border border-gray-200">${(item.unit_price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => navigate('/sales')}>Back to Sales</Button>
      </div>
    </div>
  );
};

export default SaleDetail;
