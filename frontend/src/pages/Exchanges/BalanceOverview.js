import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExchangeService from '../../services/exchangeService';

const BalanceOverview = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await ExchangeService.getExchangeBalances();
        setBalances(response.data);
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  const totalReceivable = balances.reduce((sum, b) => sum + (b.net_balance > 0 ? b.net_balance : 0), 0);
  const totalPayable = balances.reduce((sum, b) => sum + (b.net_balance < 0 ? Math.abs(b.net_balance) : 0), 0);
  const netPosition = balances.reduce((sum, b) => sum + b.net_balance, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Loading balances...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Exchange Balances</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-base font-medium text-gray-600 mb-1">Total Owed to You</h3>
          <p className="text-2xl font-bold text-green-600">{totalReceivable.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-base font-medium text-gray-600 mb-1">Total You Owe</h3>
          <p className="text-2xl font-bold text-red-600">{totalPayable.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-base font-medium text-gray-600 mb-1">Net Position</h3>
          <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(netPosition).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {netPosition >= 0 ? 'You are owed' : 'You owe'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pharmacy</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Sent to Them</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Received from Them</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Net Balance</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {balances.map(balance => (
              <tr key={balance.pharmacy_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{balance.pharmacy_name}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{balance.outgoing_total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{balance.incoming_total.toFixed(2)}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${
                  balance.net_balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(balance.net_balance).toFixed(2)}
                  <span className="block text-xs text-gray-500">
                    {balance.net_balance >= 0 ? '(They owe)' : '(You owe)'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <button
                    onClick={() => navigate(`/exchanges/history/${balance.pharmacy_id}`)}
                    className="inline-block px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
            {balances.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6">
                  No exchange balances found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalanceOverview;
