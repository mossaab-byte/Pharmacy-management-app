import React, { useEffect, useState } from 'react';
import { exchangeService } from '../../services/exchangeService';
import Card from '../UI/Card';
import Table from '../UI/Table';

const ExchangeHistory = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exchangeService.getAll().then(data => {
      setExchanges(data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { key: 'date', header: 'Date', render: ex => new Date(ex.date).toLocaleDateString() },
    { key: 'direction', header: 'Direction' },
    { key: 'source_pharmacy', header: 'From', render: ex => ex.source_pharmacy_name },
    { key: 'dest_pharmacy', header: 'To', render: ex => ex.dest_pharmacy_name },
    { key: 'total', header: 'Total', render: ex => `$${ex.total.toFixed(2)}` },
    { key: 'completed', header: 'Status', render: ex => ex.completed ? 'Completed' : 'Pending' }
  ];

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading exchange history...
      </div>
    );
  }

  return (
    <Card title="Exchange History" className="max-w-5xl mx-auto">
      <Table columns={columns} data={exchanges} />
    </Card>
  );
};

export default ExchangeHistory;
