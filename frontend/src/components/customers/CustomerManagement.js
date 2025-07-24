import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, CreditCard, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '../UI';
import CustomerCreateModal from './CustomerCreateModal';
import customerService from '../../services/customerService';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setMessage('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerCreated = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    setMessage(`✅ Client créé: ${newCustomer.full_name}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await customerService.delete(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
        setMessage('✅ Client supprimé');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting customer:', error);
        setMessage('❌ Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Chargement des clients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
            <p className="text-gray-600">Gérez vos clients et leurs informations</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Avec Crédit</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => (c.credit_limit || 0) > 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Mail className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avec Email</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.user?.email && !c.user.email.includes('@pharmacy.local')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Phone className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avec Téléphone</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.phone && c.phone !== 'N/A').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier client pour gérer les ventes nominatives.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer le premier client
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crédit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.full_name || 'Nom non défini'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Créé le {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.phone || 'Pas de téléphone'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.user?.email && !customer.user.email.includes('@pharmacy.local') 
                          ? customer.user.email 
                          : 'Pas d\'email'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Number(customer.credit_limit) ? `${Number(customer.credit_limit).toFixed(2)} MAD` : 'Aucun'}
                      </div>
                      {customer.available_credit !== undefined && (
                        <div className="text-sm text-gray-500">
                          Disponible: {customer.available_credit.toFixed(2)} MAD
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        (customer.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {customer.balance ? `${customer.balance.toFixed(2)} MAD` : '0.00 MAD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.sales_count || 0} vente(s)
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.total_purchases ? `${customer.total_purchases.toFixed(2)} MAD` : '0.00 MAD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2 justify-end">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Creation Modal */}
      <CustomerCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
};

export default CustomerManagement;
