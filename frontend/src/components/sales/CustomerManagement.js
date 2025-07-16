import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI';
import { Button } from '../../components/UI';
import { LoadingSpinner } from '../../components/UI';
import { Plus, Search, Edit, Trash2, CreditCard, User, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import customerService from '../../services/customerService';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getAll();
      setCustomers(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      address: ''
    });
    setEditingCustomer(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData);
      } else {
        await customerService.create(formData);
      }
      
      await loadCustomers();
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Erreur lors de la sauvegarde du client');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      username: customer.user?.username || '',
      email: customer.user?.email || '',
      first_name: customer.user?.first_name || '',
      last_name: customer.user?.last_name || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setEditingCustomer(customer);
    setShowAddForm(true);
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      await customerService.delete(customerId);
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  const adjustCredit = async (customerId, amount, type) => {
    try {
      await customerService.adjustCredit(customerId, amount, type);
      await loadCustomers();
    } catch (error) {
      console.error('Error adjusting credit:', error);
      alert('Erreur lors de l\'ajustement du crédit');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCustomer ? 'Modifier le Client' : 'Nouveau Client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={editingCustomer}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <LoadingSpinner /> : (editingCustomer ? 'Modifier' : 'Créer')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Customers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {customer.user?.first_name} {customer.user?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">@{customer.user?.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  {customer.user?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{customer.user.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>

                {/* Balance & Credit Management */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Solde:</span>
                    <span className={`font-semibold ${
                      (customer.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(customer.balance || 0).toFixed(2)} DH
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const amount = prompt('Montant du paiement:');
                        if (amount && !isNaN(amount)) {
                          adjustCredit(customer.id, parseFloat(amount), 'payment');
                        }
                      }}
                      className="flex-1 text-green-600 hover:text-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Paiement
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const amount = prompt('Montant du crédit:');
                        if (amount && !isNaN(amount)) {
                          adjustCredit(customer.id, parseFloat(amount), 'credit');
                        }
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-700"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Crédit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && filteredCustomers.length === 0 && (
        <div className="text-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client enregistré'}
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
