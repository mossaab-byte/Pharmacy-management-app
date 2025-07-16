import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI';
import { Button } from '../../components/UI';
import { ShoppingCart, Users, List, Plus, TrendingUp, CreditCard } from 'lucide-react';
import CompleteSalesForm from '../../components/sales/CompleteSalesForm';
import CustomerManagement from '../../components/customers/CustomerManagement';

const SalesManagementPageComplete = () => {
  const [activeTab, setActiveTab] = useState('new-sale');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'new-sale':
        return <CompleteSalesForm />;
      case 'customers':
        return <CustomerManagement />;
      case 'history':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Historique des Ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        );
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Analyses et Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Ventes
          </h1>
          <p className="text-gray-600">
            Gérez vos ventes, clients et suivez les performances
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('new-sale')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'new-sale'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                Nouvelle Vente
              </button>
              
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Clients
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                Historique
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Analyses
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-200">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SalesManagementPageComplete;
