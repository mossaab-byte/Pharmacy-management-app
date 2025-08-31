import React from 'react';
import { Button } from './index';
import { RefreshCw } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const EmergencyFixButton = () => {
  const { addNotification } = useNotification();

  const runEmergencyFix = async () => {
    console.log('🚨 EMERGENCY PHARMACY FIX STARTING...');
    
    try {
      // Clear all cached data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('dashboard') || key.includes('supplier') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();
      
      console.log('✅ Cache cleared');
      
      // Force API refresh
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        addNotification({
          type: 'error',
          message: 'No authentication token found. Please logout and login again.'
        });
        return;
      }
      
      console.log('🔄 Force refreshing APIs...');
      
      // Test Dashboard KPIs
      try {
        const dashboardResponse = await fetch('http://localhost:8000/api/dashboard/kpis/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('✅ Dashboard API Response:', dashboardData);
          console.log('📊 Purchase Total from API:', dashboardData.totalPurchases);
          
          addNotification({
            type: 'success',
            message: `Dashboard API working! Purchase Total: ${dashboardData.totalPurchases} DH`
          });
          
        } else {
          console.error('❌ Dashboard API failed:', dashboardResponse.status);
          addNotification({
            type: 'error',
            message: `Dashboard API failed with status: ${dashboardResponse.status}`
          });
        }
      } catch (error) {
        console.error('❌ Dashboard API error:', error);
        addNotification({
          type: 'error',
          message: `Dashboard API error: ${error.message}`
        });
      }
      
      // Test Suppliers
      try {
        const supplierResponse = await fetch('http://localhost:8000/api/purchases/suppliers/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (supplierResponse.ok) {
          const supplierData = await supplierResponse.json();
          console.log('✅ Supplier API Response:', supplierData);
          
          if (supplierData.results && supplierData.results.length > 0) {
            const supplier = supplierData.results[0];
            console.log('💳 First supplier credit_limit:', supplier.credit_limit);
            console.log('💰 First supplier current_balance:', supplier.current_balance);
            
            addNotification({
              type: 'success',
              message: `Supplier API working! ${supplier.name}: Credit ${supplier.credit_limit} DH, Balance ${supplier.current_balance} DH`
            });
          }
          
        } else {
          console.error('❌ Supplier API failed:', supplierResponse.status);
          addNotification({
            type: 'error',
            message: `Supplier API failed with status: ${supplierResponse.status}`
          });
        }
      } catch (error) {
        console.error('❌ Supplier API error:', error);
        addNotification({
          type: 'error',
          message: `Supplier API error: ${error.message}`
        });
      }
      
      // Force page refresh after showing results
      setTimeout(() => {
        console.log('🔄 Auto-refreshing page...');
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Emergency fix failed:', error);
      addNotification({
        type: 'error',
        message: `Emergency fix failed: ${error.message}`
      });
    }
  };

  return (
    <Button
      onClick={runEmergencyFix}
      variant="outline"
      size="sm"
      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      🚨 Emergency Fix
    </Button>
  );
};

export default EmergencyFixButton;
