import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

const KpiCards = () => {
  const { kpis } = useDashboard();

  const kpiItems = [
    { title: 'Total Revenue', value: `$${kpis.totalRevenue?.toLocaleString() || '0'}` },
    { title: 'Prescriptions Filled', value: kpis.prescriptionsFilled?.toLocaleString() || '0' },
    { title: 'Inventory Value', value: `$${kpis.inventoryValue?.toLocaleString() || '0'}` },
    { title: 'Top Selling Category', value: kpis.topCategory || 'N/A' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiItems.map(({ title, value }) => (
        <div
          key={title}
          className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center"
        >
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">{title}</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
