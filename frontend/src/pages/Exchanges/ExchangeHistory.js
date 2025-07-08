import React, { useState, useEffect } from 'react';
import ExchangeService from '../../services/exchangeService';
import { useParams, useNavigate } from 'react-router-dom';

const ExchangeHistory = () => {
  const { pharmacy_id } = useParams();
  const [partner, setPartner] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [netBalance, setNetBalance] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);
  const [incomingTotal, setIncomingTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch partner pharmacy details
        const partnerRes = await ExchangeService.getPharmacyDetails(pharmacy_id);
        setPartner(partnerRes.data);
        
        // Fetch exchange history
        const historyRes = await ExchangeService.getExchangeHistory(pharmacy_id);
        setExchanges(historyRes.data);
        
        // Calculate totals
        const outgoing = historyRes.data
          .filter(e => e.direction === 'OUT')
          .reduce((sum, e) => sum + parseFloat(e.total), 0);
        setOutgoingTotal(outgoing);
        
        const incoming = historyRes.data
          .filter(e => e.direction === 'IN')
          .reduce((sum, e) => sum + parseFloat(e.total), 0);
        setIncomingTotal(incoming);
        
        setNetBalance(outgoing - incoming);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pharmacy_id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Exchange History with {partner?.name || 'Partner'}
          </h2>
          <div className="mt-2 bg-gray-50 p-4 rounded inline-block">
            <p className="mb-1">
              <span className="font-medium">Net Balance:</span>
              <span className={`ml-2 font-bold ${
                netBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(netBalance).toFixed(2)}
                {netBalance >= 0 ? ' (They owe you)' : ' (You owe them)'}
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">Total Sent:</span>
              <span className="ml-2">{outgoingTotal.toFixed(2)}</span>
            </p>
            <p>
              <span className="font-medium">Total Received:</span>
              <span className="ml-2">{incomingTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/exchanges/balance')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back to Balances
        </button>
      </div>
      
      <div className="space-y-4">
        {exchanges.length === 0 ? (
          <div className="text-center py-8">
            <p>No exchange history found with this partner</p>
          </div>
        ) : (
          exchanges.map(exchange => (
            <div key={exchange.id} className="border rounded p-4 shadow-sm">
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
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  exchange.direction === 'OUT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {exchange.direction === 'OUT' ? 'Sent' : 'Received'}
                </span>
              </div>
              
              <p className="font-medium mb-2">Total: {exchange.total.toFixed(2)}</p>
              
              <div className="mb-2">
                <p className="font-medium">Items:</p>
                <ul className="list-disc pl-5 mt-1">
                  {exchange.items.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.quantity} x {item.medicine_name} ({item.total_price.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
              
              {exchange.notes && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Notes:</span> {exchange.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExchangeHistory;