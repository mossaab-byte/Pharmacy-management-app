import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/UI';
import supplierService from '../../services/supplierService';

const SupplierTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult('🔍 Testing supplier workflow...\n');
    
    try {
      // Test 1: Get all suppliers
      const suppliers = await supplierService.getAll();
      setTestResult(prev => prev + `✅ Fetched ${suppliers.results?.length || 0} suppliers\n`);
      
      // Test 2: Create a test supplier
      const testSupplier = {
        name: 'Test Supplier Ltd',
        contact_person: 'John Doe',
        contact_email: 'john@testsupplier.com',
        contact_phone: '+212 522 123456',
        address: '123 Test Street',
        city: 'Casablanca',
        state: 'Grand Casablanca',
        postal_code: '20000',
        country: 'Morocco',
        tax_id: 'TEST123',
        license_number: 'LIC456',
        drug_license: 'DL789',
        certification: 'ISO 9001',
        credit_limit: 25000,
        payment_terms: 'Net 30',
        delivery_schedule: 'Weekly',
        minimum_order: 500,
        discount_rate: 3,
        notes: 'Test supplier for validation'
      };
      
      const createdSupplier = await supplierService.create(testSupplier);
      setTestResult(prev => prev + `✅ Created supplier: ${createdSupplier.name}\n`);
      
      // Test 3: Update the supplier
      const updatedData = {
        ...testSupplier,
        credit_limit: 30000,
        notes: 'Updated test supplier'
      };
      
      const updatedSupplier = await supplierService.update(createdSupplier.id, updatedData);
      setTestResult(prev => prev + `✅ Updated supplier credit limit to ${updatedSupplier.credit_limit}\n`);
      
      // Test 4: Retrieve the supplier
      const retrievedSupplier = await supplierService.getById(createdSupplier.id);
      setTestResult(prev => prev + `✅ Retrieved supplier: ${retrievedSupplier.name}\n`);
      
      // Test 5: Clean up - delete the test supplier
      await supplierService.remove(createdSupplier.id);
      setTestResult(prev => prev + `✅ Deleted test supplier\n\n🎉 All tests passed! No mock data used.`);
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Supplier Workflow Test</h2>
      <Button 
        onClick={runTest} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Running Tests...' : 'Run Supplier Tests'}
      </Button>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>
      )}
    </Card>
  );
};

export default SupplierTest;
