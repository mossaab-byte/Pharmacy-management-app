import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner, ErrorMessage, Button } from '../../components/UI';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, CreditCard } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const FinanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState({
    summary: null,
    expenses: [],
    revenue: [],
    cashFlow: [],
    accountsReceivable: [],
    accountsPayable: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { addNotification } = useNotification();

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      // Since we don't have the finance service yet, let's simulate the data
      // In a real implementation, you would call:
      // const summary = await financeService.getSummary(selectedPeriod);
      // const expenses = await financeService.getExpenses(selectedPeriod);
      // etc.

      // Simulated data for demonstration
      setTimeout(() => {
        setFinancialData({
          summary: {
            totalRevenue: 125000,
            totalExpenses: 85000,
            netProfit: 40000,
            profitMargin: 32,
            cashBalance: 75000,
            pendingReceivables: 15000,
            pendingPayables: 8000
          },
          expenses: [
            { category: 'Medicine Purchases', amount: 45000, percentage: 53 },
            { category: 'Staff Salaries', amount: 20000, percentage: 24 },
            { category: 'Utilities', amount: 8000, percentage: 9 },
            { category: 'Rent', amount: 7000, percentage: 8 },
            { category: 'Other', amount: 5000, percentage: 6 }
          ],
          revenue: [
            { source: 'Prescription Sales', amount: 85000, percentage: 68 },
            { source: 'OTC Sales', amount: 25000, percentage: 20 },
            { source: 'Consultations', amount: 10000, percentage: 8 },
            { source: 'Other', amount: 5000, percentage: 4 }
          ],
          cashFlow: [
            { month: 'Jan', inflow: 95000, outflow: 70000, net: 25000 },
            { month: 'Feb', inflow: 105000, outflow: 80000, net: 25000 },
            { month: 'Mar', inflow: 125000, outflow: 85000, net: 40000 }
          ]
        });
        setLoading(false);
        setError(null);
      }, 1000);

    } catch (err) {
      setError('Failed to load financial data');
      console.error('Error fetching financial data:', err);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <Icon className={`h-12 w-12 text-${color}-500`} />
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="finance-dashboard p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="finance-dashboard p-6 max-w-7xl mx-auto">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const { summary, expenses, revenue } = financialData;

  return (
    <div className="finance-dashboard p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
            <p className="text-gray-600">Monitor your pharmacy's financial performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button onClick={fetchFinancialData}>
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          trend="down"
          trendValue="-3.2%"
          color="red"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(summary.netProfit)}
          icon={TrendingUp}
          trend="up"
          trendValue="+18.7%"
          color="blue"
        />
        <StatCard
          title="Profit Margin"
          value={`${summary.profitMargin}%`}
          icon={FileText}
          trend="up"
          trendValue="+2.1%"
          color="purple"
        />
      </div>

      {/* Cash Flow & Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cash Balance</h3>
            <CreditCard className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(summary.cashBalance)}</p>
          <p className="text-sm text-gray-600 mt-2">Available cash on hand</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accounts Receivable</h3>
            <TrendingUp className="h-6 w-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(summary.pendingReceivables)}</p>
          <p className="text-sm text-gray-600 mt-2">Money owed to you</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accounts Payable</h3>
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(summary.pendingPayables)}</p>
          <p className="text-sm text-gray-600 mt-2">Money you owe</p>
        </Card>
      </div>

      {/* Revenue and Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue Sources</h3>
          <div className="space-y-4">
            {revenue.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{source.source}</span>
                    <span className="text-sm font-bold">{formatCurrency(source.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Expense Categories</h3>
          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{expense.category}</span>
                    <span className="text-sm font-bold">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{expense.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <FileText className="h-6 w-6 mb-2" />
            <span className="text-sm">Generate Report</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <DollarSign className="h-6 w-6 mb-2" />
            <span className="text-sm">Record Expense</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <TrendingUp className="h-6 w-6 mb-2" />
            <span className="text-sm">View Trends</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <CreditCard className="h-6 w-6 mb-2" />
            <span className="text-sm">Manage Budget</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <Calendar className="h-6 w-6 mb-2" />
            <span className="text-sm">Tax Planning</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <FileText className="h-6 w-6 mb-2" />
            <span className="text-sm">Export Data</span>
          </Button>
        </div>
      </Card>

      {/* Financial Alerts */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Financial Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Calendar className="h-5 w-5 text-yellow-500 mr-3" />
            <span className="text-sm text-yellow-800">
              Monthly tax payment due in 5 days (March 15th)
            </span>
          </div>
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-3" />
            <span className="text-sm text-blue-800">
              Revenue is 12% higher than last month - consider inventory restocking
            </span>
          </div>
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-sm text-green-800">
              You're on track to meet this quarter's profit target
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
