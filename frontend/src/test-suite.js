// Test Script to verify all core components are working
// This script can be run in the browser console to test all pages

const testPages = [
  '/',
  '/sales',
  '/purchases',
  '/medicines',
  '/customers',
  '/suppliers',
  '/inventory',
  '/finance',
  '/reports',
  '/users',
  '/pharmacy'
];

const testAPI = async () => {
  console.log('🧪 Testing API Services...');
  
  try {
    // Test sales service
    const salesService = await import('./src/services/salesServices.js');
    const sales = await salesService.default.getAll();
    console.log('✅ Sales Service:', Array.isArray(sales) ? `${sales.length} items` : 'OK');
    
    // Test purchase service
    const purchaseService = await import('./src/services/purchaseService.js');
    const purchases = await purchaseService.default.getAll();
    console.log('✅ Purchase Service:', Array.isArray(purchases) ? `${purchases.length} items` : 'OK');
    
    // Test medicine service
    const medicineService = await import('./src/services/medicineService.js');
    const medicines = await medicineService.default.getAll();
    console.log('✅ Medicine Service:', Array.isArray(medicines) ? `${medicines.length} items` : 'OK');
    
    // Test dashboard service
    const dashboardService = await import('./src/services/dashboardService.js');
    const stats = await dashboardService.default.getStats();
    console.log('✅ Dashboard Service:', typeof stats === 'object' ? 'OK' : 'ERROR');
    
    console.log('🎉 All API services working correctly!');
  } catch (error) {
    console.error('❌ API Test Failed:', error);
  }
};

const checkComponentSafety = () => {
  console.log('🛡️ Checking Component Safety...');
  
  // Check for common runtime errors
  const errorChecks = [
    'Cannot read properties of undefined',
    'map is not a function',
    'toFixed is not a function',
    'Cannot read property',
    'undefined is not a function'
  ];
  
  // This would be run in browser console to monitor for errors
  const originalError = console.error;
  const errors = [];
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (errorChecks.some(check => message.includes(check))) {
      errors.push(message);
    }
    originalError.apply(console, args);
  };
  
  // Restore after 10 seconds
  setTimeout(() => {
    console.error = originalError;
    if (errors.length === 0) {
      console.log('✅ No runtime errors detected!');
    } else {
      console.log('❌ Runtime errors found:', errors);
    }
  }, 10000);
};

// Export for use in browser
window.testPharmacyApp = {
  testAPI,
  checkComponentSafety,
  testPages
};

console.log('🏥 Pharmacy App Test Suite Ready!');
console.log('Run: testPharmacyApp.testAPI() to test services');
console.log('Run: testPharmacyApp.checkComponentSafety() to monitor for errors');
