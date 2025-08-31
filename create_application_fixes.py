#!/usr/bin/env python3
"""
Complete Fix Script for Dashboard and Supplier Issues
This script creates the fixes for both frontend issues
"""

import json

def create_dashboard_fix():
    """Creates comprehensive dashboard fixes"""
    print("=== CREATING DASHBOARD FIXES ===")
    
    # The issue might be in the dashboard component access pattern
    # Let's create a robust fix
    dashboard_fix = """
// Dashboard Fix - Ensure totalPurchases is accessed correctly
// Place this in the console to test data access
console.log('=== DEBUGGING DASHBOARD DATA ===');

// Check if data is properly loaded
const checkDashboardData = () => {
  // Get the dashboard context data
  const dashboardContext = document.querySelector('[data-dashboard-context]');
  if (dashboardContext) {
    console.log('Dashboard context found');
  }
  
  // Check localStorage for any cached data
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  console.log('Auth token exists:', !!token);
  
  // Manually test the KPI endpoint
  if (token) {
    fetch('http://localhost:8000/api/dashboard/kpis/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log('🔍 Manual KPI fetch result:', data);
      console.log('🔍 totalPurchases value:', data.totalPurchases);
      console.log('🔍 purchasesMonthly value:', data.purchasesMonthly);
    })
    .catch(error => {
      console.error('🔍 Manual KPI fetch error:', error);
    });
  }
};

checkDashboardData();

// Force refresh dashboard data
const forceRefreshDashboard = () => {
  // Trigger a page reload to clear any cached state
  window.location.reload();
};

console.log('Run forceRefreshDashboard() to force refresh');
window.forceRefreshDashboard = forceRefreshDashboard;
"""
    
    return dashboard_fix

def create_supplier_refresh_fix():
    """Creates supplier data refresh fix"""
    print("=== CREATING SUPPLIER REFRESH FIX ===")
    
    supplier_fix = """
// Supplier Balance Fix - Force refresh supplier data
// Place this in the console to refresh supplier data
console.log('=== DEBUGGING SUPPLIER DATA ===');

const refreshSupplierData = () => {
  // Get auth token
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (!token) {
    console.error('No auth token found');
    return;
  }
  
  // Test supplier endpoint
  fetch('http://localhost:8000/api/purchases/suppliers/', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('🔍 Supplier API response:', data);
    if (data.results && data.results.length > 0) {
      const supplier = data.results[0];
      console.log('🔍 First supplier data:');
      console.log('  - Name:', supplier.name);
      console.log('  - Credit Limit:', supplier.credit_limit);
      console.log('  - Current Balance:', supplier.current_balance);
      console.log('  - Payment Terms:', supplier.payment_terms);
    }
  })
  .catch(error => {
    console.error('🔍 Supplier API error:', error);
  });
};

refreshSupplierData();

// Force refresh the current page if on suppliers page
const forceSupplierPageRefresh = () => {
  if (window.location.pathname.includes('suppliers')) {
    window.location.reload();
  } else {
    console.log('Navigate to suppliers page first, then run this function');
  }
};

console.log('Run forceSupplierPageRefresh() to force refresh suppliers page');
window.refreshSupplierData = refreshSupplierData;
window.forceSupplierPageRefresh = forceSupplierPageRefresh;
"""
    
    return supplier_fix

def create_comprehensive_fix():
    """Creates a comprehensive fix for both issues"""
    print("=== CREATING COMPREHENSIVE FIX ===")
    
    comprehensive_fix = """
// COMPREHENSIVE FIX FOR DASHBOARD AND SUPPLIER ISSUES
console.log('=== COMPREHENSIVE PHARMACY APP FIX ===');

const PharmacyAppFix = {
  // Test all API endpoints
  async testAllEndpoints() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      return;
    }
    
    console.log('🔍 Testing all endpoints...');
    
    // Test Dashboard KPIs
    try {
      const kpiResponse = await fetch('http://localhost:8000/api/dashboard/kpis/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const kpiData = await kpiResponse.json();
      console.log('✅ Dashboard KPIs:', kpiData);
      console.log('📊 Purchase Total:', kpiData.totalPurchases, 'DH');
    } catch (error) {
      console.error('❌ Dashboard KPIs failed:', error);
    }
    
    // Test Supplier API
    try {
      const supplierResponse = await fetch('http://localhost:8000/api/purchases/suppliers/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const supplierData = await supplierResponse.json();
      console.log('✅ Suppliers:', supplierData);
      if (supplierData.results && supplierData.results.length > 0) {
        const supplier = supplierData.results[0];
        console.log('💰 Supplier Balance:', supplier.current_balance, 'DH');
        console.log('💳 Credit Limit:', supplier.credit_limit, 'DH');
      }
    } catch (error) {
      console.error('❌ Suppliers failed:', error);
    }
  },
  
  // Force refresh application state
  forceRefresh() {
    console.log('🔄 Forcing application refresh...');
    
    // Clear any cached data
    const cacheKeys = ['dashboard_cache', 'supplier_cache', 'user_cache'];
    cacheKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared ${key}`);
      }
    });
    
    // Force page reload
    window.location.reload();
  },
  
  // Check current user
  async checkUser() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/me/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const userData = await response.json();
      console.log('👤 Current User:', userData);
      
      if (userData.pharmacy) {
        console.log('🏥 User Pharmacy:', userData.pharmacy.name);
      } else {
        console.warn('⚠️ User has no pharmacy associated');
      }
    } catch (error) {
      console.error('❌ User check failed:', error);
    }
  }
};

// Make available globally
window.PharmacyAppFix = PharmacyAppFix;

console.log('🛠️ Fix tools available:');
console.log('  - PharmacyAppFix.testAllEndpoints() - Test all API endpoints');
console.log('  - PharmacyAppFix.forceRefresh() - Force refresh application');
console.log('  - PharmacyAppFix.checkUser() - Check current user and pharmacy');

// Auto-run endpoint test
PharmacyAppFix.testAllEndpoints();
"""
    
    return comprehensive_fix

def main():
    """Main function to create all fixes"""
    print("=== PHARMACY APPLICATION ISSUE FIXES ===\n")
    
    dashboard_fix = create_dashboard_fix()
    supplier_fix = create_supplier_refresh_fix()
    comprehensive_fix = create_comprehensive_fix()
    
    print("\n" + "="*60)
    print("DASHBOARD FIX - Paste in browser console:")
    print("="*60)
    print(dashboard_fix)
    
    print("\n" + "="*60)
    print("SUPPLIER FIX - Paste in browser console:")
    print("="*60)
    print(supplier_fix)
    
    print("\n" + "="*60)
    print("COMPREHENSIVE FIX - Paste in browser console:")
    print("="*60)
    print(comprehensive_fix)
    
    print("\n" + "="*60)
    print("INSTRUCTIONS:")
    print("="*60)
    print("1. Open your browser and navigate to the pharmacy application")
    print("2. Open browser developer tools (F12)")
    print("3. Go to the Console tab")
    print("4. Paste the COMPREHENSIVE FIX code above")
    print("5. Press Enter to run it")
    print("6. Check the console output for diagnostic information")
    print("7. If needed, run PharmacyAppFix.forceRefresh() to force refresh")
    print("\nThe diagnostic will show:")
    print("- Current authentication status")
    print("- Dashboard KPI data (including purchase totals)")
    print("- Supplier data (including balances and credit limits)")
    print("- Any API errors that need to be addressed")

if __name__ == "__main__":
    main()
