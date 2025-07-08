import React, { useState } from 'react';
import MedicineSearchWithBarcode from '../../components/common/MedicineSearchWithBarcode';
import { Button } from '../../components/UI';

const MedicineTest = () => {
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const handleMedicineSelect = (medicine) => {
    console.log('Medicine selected:', medicine);
    setSelectedMedicines(prev => [...prev, medicine]);
  };

  const clearSelection = () => {
    setSelectedMedicines([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Medicine Search Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Medicine (with Barcode Support)</h2>
        <MedicineSearchWithBarcode 
          onMedicineSelect={handleMedicineSelect}
          placeholder="Search by name or scan barcode (e.g., 6118010000270)..."
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Selected Medicines</h2>
          <Button onClick={clearSelection} variant="outline" size="sm">
            Clear All
          </Button>
        </div>
        
        {selectedMedicines.length === 0 ? (
          <p className="text-gray-500 italic">No medicines selected yet. Try searching above!</p>
        ) : (
          <div className="space-y-3">
            {selectedMedicines.map((medicine, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{medicine.name}</h3>
                    <p className="text-sm text-gray-600">Code: {medicine.code}</p>
                    <p className="text-sm text-gray-600">DCI: {medicine.dci1}</p>
                    <p className="text-sm text-gray-600">Form: {medicine.form}</p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Presentation:</span> {medicine.presentation}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Public Price:</span> ${medicine.public_price || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Dosage:</span> {medicine.dosage1} {medicine.unite_dosage1}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Type medicine names like "AMOXICILLINE" or "A-GRAM" to test search</li>
          <li>• Try barcode "6118010000270" to test barcode functionality</li>
          <li>• Selected medicines will appear in the list below</li>
          <li>• This simulates adding medicines to sales/purchases/exchanges</li>
        </ul>
      </div>
    </div>
  );
};

export default MedicineTest;
