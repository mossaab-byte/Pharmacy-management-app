import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Package,
  Users,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw
} from 'lucide-react';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [availableReports] = useState([
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Detailed sales analysis and trends',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels and inventory movement',
      icon: Package,
      color: 'blue'
    },
    {
      id: 'purchases',
      name: 'Purchase Report',
      description: 'Purchase history and supplier analysis',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 'customers',
      name: 'Customer Report',
      description: 'Customer behavior and analytics',
      icon: Users,
      color: 'orange'
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Comprehensive financial analysis',
      icon: BarChart3,
      color: 'red'
    },
    {
      id: 'medicine',
      name: 'Medicine Report',
      description: 'Medicine usage and popularity analysis',
      icon: PieChart,
      color: 'indigo'
    }
  ]);

  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Mock report data
  const mockReportData = {
    sales: {
      summary: {
        totalSales: 125000,
        totalTransactions: 450,
        averageOrderValue: 277.78,
        topSellingPeriod: 'Afternoon',
        growth: 12.5
      },
      chartData: [
        { date: '2024-01-15', sales: 4500, transactions: 18 },
        { date: '2024-01-16', sales: 5200, transactions: 22 },
        { date: '2024-01-17', sales: 3800, transactions: 15 },
        { date: '2024-01-18', sales: 6100, transactions: 25 },
        { date: '2024-01-19', sales: 4900, transactions: 20 }
      ],
      topProducts: [
        { name: 'Paracetamol 500mg', quantity: 120, revenue: 3600 },
        { name: 'Amoxicillin 250mg', quantity: 85, revenue: 4250 },
        { name: 'Ibuprofen 400mg', quantity: 95, revenue: 2850 },
        { name: 'Aspirin 100mg', quantity: 78, revenue: 1560 },
        { name: 'Omeprazole 20mg', quantity: 65, revenue: 3250 }
      ]
    },
    inventory: {
      summary: {
        totalItems: 1250,
        lowStockItems: 35,
        outOfStockItems: 8,
        totalValue: 850000,
        turnoverRate: 2.4
      },
      lowStockItems: [
        { name: 'Paracetamol 500mg', current: 8, minimum: 20, status: 'critical' },
        { name: 'Vitamin D3', current: 12, minimum: 25, status: 'low' },
        { name: 'Calcium Tablets', current: 15, minimum: 30, status: 'low' },
        { name: 'Iron Supplements', current: 5, minimum: 15, status: 'critical' },
        { name: 'Bandages', current: 18, minimum: 40, status: 'low' }
      ],
      movements: [
        { date: '2024-01-20', type: 'Sale', medicine: 'Paracetamol 500mg', quantity: -15 },
        { date: '2024-01-20', type: 'Purchase', medicine: 'Amoxicillin 250mg', quantity: 50 },
        { date: '2024-01-19', type: 'Sale', medicine: 'Ibuprofen 400mg', quantity: -8 },
        { date: '2024-01-19', type: 'Adjustment', medicine: 'Aspirin 100mg', quantity: -2 },
        { date: '2024-01-18', type: 'Sale', medicine: 'Omeprazole 20mg', quantity: -12 }
      ]
    },
    financial: {
      summary: {
        revenue: 125000,
        expenses: 78000,
        netProfit: 47000,
        profitMargin: 37.6,
        cashFlow: 23000
      },
      monthlyData: [
        { month: 'Jan', revenue: 125000, expenses: 78000, profit: 47000 },
        { month: 'Dec', revenue: 118000, expenses: 75000, profit: 43000 },
        { month: 'Nov', revenue: 132000, expenses: 82000, profit: 50000 },
        { month: 'Oct', revenue: 128000, expenses: 79000, profit: 49000 },
        { month: 'Sep', revenue: 121000, expenses: 76000, profit: 45000 }
      ]
    }
  };

  useEffect(() => {
    generateReport();
  }, [selectedReport, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setReportData(mockReportData[selectedReport] || mockReportData.sales);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate report');
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const reportInfo = availableReports.find(r => r.id === selectedReport);
      
      if (format === 'pdf') {
        addNotification({
          type: 'info',
          message: 'PDF export feature coming soon'
        });
        return;
      }
      
      // Export as JSON for now
      const exportData = {
        reportType: selectedReport,
        reportName: reportInfo.name,
        dateRange,
        generatedAt: new Date().toISOString(),
        data: reportData
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${selectedReport}_report_${dateRange.startDate}_to_${dateRange.endDate}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      addNotification({
        type: 'success',
        message: 'Report exported successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to export report'
      });
    }
  };

  const currentReport = availableReports.find(r => r.id === selectedReport);

  return (
    <div className="reports-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate comprehensive reports for your pharmacy operations</p>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {availableReports.map(report => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedReport === report.id
                  ? `border-${report.color}-500 bg-${report.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-center">
                <Icon className={`h-8 w-8 text-${report.color}-500 mr-3`} />
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <span className="text-gray-500 py-2">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateReport} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => exportReport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={() => exportReport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Generating {currentReport?.name}...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <ErrorMessage message={error} />
        </Card>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Sales Report */}
          {selectedReport === 'sales' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.totalSales.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.totalTransactions}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.averageOrderValue.toFixed(2)} MAD
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Growth</p>
                      <p className="text-2xl font-bold text-green-600">
                        +{reportData.summary.growth}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top Products */}
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Top Selling Products</h3>
                </div>
                <Table
                  columns={[
                    { key: 'name', header: 'Product Name' },
                    { key: 'quantity', header: 'Quantity Sold' },
                    { 
                      key: 'revenue', 
                      header: 'Revenue',
                      render: (value) => `${value.toLocaleString()} MAD`
                    }
                  ]}
                  data={reportData.topProducts}
                />
              </Card>
            </>
          )}

          {/* Inventory Report */}
          {selectedReport === 'inventory' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.totalItems.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reportData.summary.lowStockItems}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-600">
                        {reportData.summary.outOfStockItems}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.totalValue.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Low Stock Items */}
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Low Stock Alert</h3>
                </div>
                <Table
                  columns={[
                    { key: 'name', header: 'Medicine Name' },
                    { key: 'current', header: 'Current Stock' },
                    { key: 'minimum', header: 'Minimum Required' },
                    { 
                      key: 'status', 
                      header: 'Status',
                      render: (value) => (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          value === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </span>
                      )
                    }
                  ]}
                  data={reportData.lowStockItems}
                />
              </Card>
            </>
          )}

          {/* Financial Report */}
          {selectedReport === 'financial' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.revenue.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expenses</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.expenses.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Profit</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.summary.netProfit.toLocaleString()} MAD
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center">
                    <PieChart className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.profitMargin}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Monthly Financial Data */}
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Monthly Financial Performance</h3>
                </div>
                <Table
                  columns={[
                    { key: 'month', header: 'Month' },
                    { 
                      key: 'revenue', 
                      header: 'Revenue',
                      render: (value) => `${value.toLocaleString()} MAD`
                    },
                    { 
                      key: 'expenses', 
                      header: 'Expenses',
                      render: (value) => `${value.toLocaleString()} MAD`
                    },
                    { 
                      key: 'profit', 
                      header: 'Net Profit',
                      render: (value) => (
                        <span className="text-green-600 font-medium">
                          {value.toLocaleString()} MAD
                        </span>
                      )
                    }
                  ]}
                  data={reportData.monthlyData}
                />
              </Card>
            </>
          )}

          {/* Placeholder for other reports */}
          {!['sales', 'inventory', 'financial'].includes(selectedReport) && (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentReport?.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  This report is coming soon. We're working on providing detailed analytics for this module.
                </p>
                <Button variant="outline" onClick={() => setSelectedReport('sales')}>
                  View Sales Report Instead
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
