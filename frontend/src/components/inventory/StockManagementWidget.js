import React, { useState } from 'react';
import { Package, Plus, AlertTriangle } from 'lucide-react';

const StockManagementWidget = ({ medicine, onStockUpdate }) => {
  const [showAddStock, setShowAddStock] = useState(false);
  const [stockToAdd, setStockToAdd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStock = async () => {
    if (!stockToAdd || parseInt(stockToAdd) <= 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    setLoading(true);
    try {
      // Call your stock API here
      const response = await fetch(`http://localhost:8000/api/inventory/add-stock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          medicine_id: medicine.id,
          quantity: parseInt(stockToAdd),
          reason: 'MANUAL_ADD'
        })
      });

      if (response.ok) {
        // Update the medicine stock locally
        const updatedMedicine = { ...medicine, stock: (medicine.stock || 0) + parseInt(stockToAdd) };
        onStockUpdate && onStockUpdate(updatedMedicine);
        setStockToAdd('');
        setShowAddStock(false);
        alert('Stock ajouté avec succès!');
      } else {
        alert('Erreur lors de l\'ajout du stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Erreur lors de l\'ajout du stock');
    } finally {
      setLoading(false);
    }
  };

  const stockLevel = medicine.stock || 0;
  
  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">{medicine.nom}</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${
                stockLevel > 20 ? 'text-green-600' : 
                stockLevel > 5 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                Stock: {stockLevel} unités
              </span>
              {stockLevel === 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Rupture de stock</span>
                </div>
              )}
              {stockLevel > 0 && stockLevel <= 5 && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Stock faible</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!showAddStock ? (
            <button
              onClick={() => setShowAddStock(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter Stock</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
                placeholder="Quantité"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
              />
              <button
                onClick={handleAddStock}
                disabled={loading}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '...' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowAddStock(false);
                  setStockToAdd('');
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagementWidget;
