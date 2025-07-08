import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import ExchangeService from '../../services/exchangeService';

const ExchangeDashboard = () => {
  const [exchanges, setExchanges] = useState([]);
  const [partnerPharmacies, setPartnerPharmacies] = useState([]);
  const [currentPharmacy, setCurrentPharmacy] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user's pharmacy
        const userRes = await ExchangeService.getCurrentUser();
        setCurrentPharmacy(userRes.data.pharmacy);
        
        // Fetch exchanges
        const exchangesRes = await ExchangeService.getExchanges();
        setExchanges(exchangesRes.data);
        
        // Fetch partner pharmacies
        const partnersRes = await ExchangeService.getPartnerPharmacies();
        setPartnerPharmacies(partnersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredExchanges = exchanges.filter(ex => {
    const statusMatch = statusFilter ? ex.status === statusFilter : true;
    const partnerMatch = partnerFilter ? 
      (ex.source_pharmacy === partnerFilter || ex.dest_pharmacy === partnerFilter) : true;
    return statusMatch && partnerMatch;
  });

  const approveExchange = async (id) => {
    try {
      await axios.post(`/api/exchange/${id}/action/approve/`);
      refreshExchanges();
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve exchange');
    }
  };

  const rejectExchange = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      try {
        await axios.post(`/api/exchange/${id}/action/reject/`, { reason });
        refreshExchanges();
      } catch (error) {
        console.error('Rejection failed:', error);
        alert('Failed to reject exchange');
      }
    }
  };

  const cancelExchange = async (id) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await axios.post(`/api/exchange/${id}/action/cancel/`);
        refreshExchanges();
      } catch (error) {
        console.error('Cancellation failed:', error);
        alert('Failed to cancel exchange');
      }
    }
  };

  const processExchange = async (id) => {
    try {
      await axios.post(`/api/exchange/${id}/process/`);
      refreshExchanges();
      alert('Exchange processed successfully! Stock updated.');
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Failed to process exchange');
    }
  };

  const refreshExchanges = async () => {
    try {
      const response = await ExchangeService.getExchanges();
      setExchanges(response.data);
    } catch (error) {
      console.error('Error refreshing exchanges:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading exchanges...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Exchange Requests</h2>
        <div className="flex space-x-4">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select 
            value={partnerFilter} 
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Partners</option>
            {partnerPharmacies.map(partner => (
              <option key={partner.id} value={partner.id}>{partner.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredExchanges.length === 0 ? (
          <div className="text-center py-8">
            <p>No exchanges found with the current filters</p>
          </div>
        ) : (
          filteredExchanges.map(exchange => (
            <div key={exchange.id} className="border rounded shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    exchange.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    exchange.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    exchange.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exchange.status_display}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {new Date(exchange.date).toLocaleString()}
                  </span>
                </div>
                <span className="text-sm">
                  {exchange.direction === 'OUT' ? (
                    `To: ${exchange.dest_pharmacy_name}`
                  ) : (
                    `From: ${exchange.source_pharmacy_name}`
                  )}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm">
                  {exchange.items.length} items • Total: {exchange.total.toFixed(2)}
                </p>
                {exchange.notes && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Notes:</span> {exchange.notes}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/exchanges/${exchange.id}`)}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                >
                  View Details
                </button>
                
                {exchange.status === 'PENDING' && (
                  <>
                    {exchange.dest_pharmacy === currentPharmacy.id && (
                      <>
                        <button
                          onClick={() => approveExchange(exchange.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectExchange(exchange.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {exchange.source_pharmacy === currentPharmacy.id && (
                      <button
                        onClick={() => cancelExchange(exchange.id)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
                
                {exchange.status === 'APPROVED' && exchange.dest_pharmacy === currentPharmacy.id && (
                  <button
                    onClick={() => processExchange(exchange.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Process Transfer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExchangeDashboard;