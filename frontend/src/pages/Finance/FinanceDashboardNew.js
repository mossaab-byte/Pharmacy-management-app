import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Button } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, DollarSign, ArrowLeft } from 'lucide-react';

const FinanceDashboard = () => {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
              <p className="text-gray-600">Monitor your financial metrics</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">0.00 DH</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">0%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-gray-900">0.00 DH</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Finance Dashboard</h3>
            <p className="text-gray-600 mb-4">
              This feature is under development. Financial data will be available soon.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default FinanceDashboard;
