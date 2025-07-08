import { apiClient } from './apiClient';

const handleResponse = (response) => {
  // Validate response and return data or a safe fallback
  if (!response || !response.data) {
    return {};
  }
  return response.data;
};

const handleError = (error, fallbackValue = {}) => {
  console.error('API error:', error);
  return fallbackValue;
};

// Mock data for development and API failures
const mockKpis = {
  totalRevenue: 125000,
  prescriptionsFilled: 450,
  inventoryValue: 75000,
  totalSales: 28
};

const mockTopProducts = [
  { id: 1, name: 'Doliprane 500mg', sales: 120, revenue: 2400 },
  { id: 2, name: 'Advil 200mg', sales: 85, revenue: 1700 },
  { id: 3, name: 'Paracetamol 1000mg', sales: 75, revenue: 1125 },
  { id: 4, name: 'Aspirin 100mg', sales: 65, revenue: 975 },
  { id: 5, name: 'Vitamin D3', sales: 55, revenue: 1100 }
];

const mockRevenueTrend = [
  { date: '2024-01-01', revenue: 8500 },
  { date: '2024-01-02', revenue: 9200 },
  { date: '2024-01-03', revenue: 7800 },
  { date: '2024-01-04', revenue: 10500 },
  { date: '2024-01-05', revenue: 12000 },
  { date: '2024-01-06', revenue: 8900 },
  { date: '2024-01-07', revenue: 11200 }
];

const mockSales = [
  { 
    id: 1, 
    date: '2024-01-07', 
    total_amount: 45.50, 
    customer_name: 'John Doe',
    items: [
      { medicine_name: 'Doliprane 500mg', quantity: 2, price: 12.50 },
      { medicine_name: 'Vitamin C', quantity: 1, price: 20.50 }
    ]
  },
  { 
    id: 2, 
    date: '2024-01-07', 
    total_amount: 28.75, 
    customer_name: 'Jane Smith',
    items: [
      { medicine_name: 'Aspirin 100mg', quantity: 1, price: 15.25 },
      { medicine_name: 'Paracetamol 1000mg', quantity: 1, price: 13.50 }
    ]
  },
  { 
    id: 3, 
    date: '2024-01-06', 
    total_amount: 67.25, 
    customer_name: 'Bob Johnson',
    items: [
      { medicine_name: 'Advil 200mg', quantity: 3, price: 20.00 },
      { medicine_name: 'Cough Syrup', quantity: 1, price: 7.25 }
    ]
  }
];

const mockInventory = [
  { 
    id: 1, 
    name: 'Doliprane 500mg', 
    stock: 150, 
    minimum_stock_level: 50, 
    prix_public: 12.50, 
    expiry_date: '2025-12-31',
    category: 'Pain Relief'
  },
  { 
    id: 2, 
    name: 'Advil 200mg', 
    stock: 25, 
    minimum_stock_level: 30, 
    prix_public: 20.00, 
    expiry_date: '2025-06-30',
    category: 'Pain Relief'
  },
  { 
    id: 3, 
    name: 'Paracetamol 1000mg', 
    stock: 80, 
    minimum_stock_level: 40, 
    prix_public: 13.50, 
    expiry_date: '2025-09-15',
    category: 'Pain Relief'
  },
  { 
    id: 4, 
    name: 'Aspirin 100mg', 
    stock: 120, 
    minimum_stock_level: 60, 
    prix_public: 15.25, 
    expiry_date: '2025-11-20',
    category: 'Cardiovascular'
  },
  { 
    id: 5, 
    name: 'Vitamin D3', 
    stock: 15, 
    minimum_stock_level: 20, 
    prix_public: 22.00, 
    expiry_date: '2025-03-10',
    category: 'Vitamins'
  }
];

const dashboardService = {
  getKpis: async () => {
    try {
      const response = await apiClient.get('/dashboard/kpis/');
      return handleResponse(response);
    } catch (error) {
      return handleError(error, mockKpis);
    }
  },
  
  getTopProducts: async () => {
    try {
      const response = await apiClient.get('/dashboard/top-products/');
      return handleResponse(response);
    } catch (error) {
      return handleError(error, mockTopProducts);
    }
  },
  
  getRevenueTrend: async () => {
    try {
      const response = await apiClient.get('/dashboard/revenue-trend/');
      return handleResponse(response);
    } catch (error) {
      return handleError(error, mockRevenueTrend);
    }
  },
  
  getSales: async () => {
    try {
      const response = await apiClient.get('/dashboard/sales/');
      return handleResponse(response);
    } catch (error) {
      return handleError(error, mockSales);
    }
  },
  
  getInventory: async () => {
    try {
      const response = await apiClient.get('/dashboard/inventory/');
      return handleResponse(response);
    } catch (error) {
      return handleError(error, mockInventory);
    }
  },
};

export default dashboardService;