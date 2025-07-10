// Frontend Status Check - Run this in browser console to verify all systems
const statusCheck = {
  // Test all main navigation routes
  testRoutes: [
    '/',           // Dashboard
    '/sales',      // Sales Management
    '/purchases',  // Purchase Management  
    '/medicines',  // Medicines
    '/customers',  // Customers
    '/suppliers',  // Suppliers
    '/inventory',  // Inventory
    '/sales/new',  // New Sale Form
    '/purchases/new' // New Purchase Form
  ],

  // Test all services
  testServices: async () => {
    console.log('🔍 Testing Frontend Services...');
    const results = {};
    
    try {
      // Test Sales Service
      const salesService = (await import('./src/services/salesServices.js')).default;
      const sales = await salesService.getAll();
      results.sales = Array.isArray(sales) ? `✅ ${sales.length} items` : '❌ Not an array';
      
      // Test Purchase Service
      const purchaseService = (await import('./src/services/purchaseService.js')).default;
      const purchases = await purchaseService.getAll();
      results.purchases = Array.isArray(purchases) ? `✅ ${purchases.length} items` : '❌ Not an array';
      
      // Test Medicine Service
      const medicineService = (await import('./src/services/medicineService.js')).default;
      const result = await medicineService.getAll();
      const medicines = result.data?.results || result || [];
      results.medicines = Array.isArray(medicines) ? `✅ ${medicines.length} items` : '❌ Not an array';
      
      // Test Customer Service
      const customerService = (await import('./src/services/customerService.js')).default;
      const customers = await customerService.getAll();
      results.customers = Array.isArray(customers) ? `✅ ${customers.length} items` : '❌ Not an array';
      
      // Test Dashboard Service
      const dashboardService = (await import('./src/services/dashboardService.js')).default;
      const stats = await dashboardService.getStats();
      results.dashboard = typeof stats === 'object' ? '✅ Stats loaded' : '❌ Invalid stats';
      
      console.table(results);
      
      // Test search functionality
      console.log('\n🔍 Testing Search Functionality...');
      const searchResults = await medicineService.quickSearch('Doliprane');
      console.log('Search test:', searchResults?.data?.length > 0 ? '✅ Search working' : '❌ Search failed');
      
      return results;
    } catch (error) {
      console.error('❌ Service test failed:', error);
      return { error: error.message };
    }
  },

  // Check for runtime errors
  monitorErrors: () => {
    console.log('🛡️ Starting error monitoring...');
    const originalError = console.error;
    const errors = [];
    
    console.error = (...args) => {
      const message = args.join(' ');
      const criticalErrors = [
        'Cannot read properties of undefined',
        'map is not a function',
        'toFixed is not a function',
        'Cannot read property',
        'undefined is not a function',
        'is not a constructor'
      ];
      
      if (criticalErrors.some(err => message.includes(err))) {
        errors.push({ time: new Date().toLocaleTimeString(), message });
      }
      originalError.apply(console, args);
    };
    
    // Report after 30 seconds
    setTimeout(() => {
      console.error = originalError;
      if (errors.length === 0) {
        console.log('✅ No critical runtime errors detected!');
      } else {
        console.log('❌ Critical errors found:');
        console.table(errors);
      }
    }, 30000);
    
    return 'Error monitoring started for 30 seconds...';
  },

  // Test form submissions
  testForms: () => {
    console.log('📝 Form validation tests...');
    
    // Test medicine search
    if (document.querySelector('input[placeholder*="Search medicines"]')) {
      console.log('✅ Medicine search input found');
    } else {
      console.log('❌ Medicine search input not found');
    }
    
    // Test customer dropdown
    if (document.querySelector('select') || document.querySelector('[role="combobox"]')) {
      console.log('✅ Dropdown components found');
    } else {
      console.log('❌ Dropdown components not found');
    }
    
    // Test buttons
    const buttons = document.querySelectorAll('button');
    console.log(`✅ Found ${buttons.length} interactive buttons`);
    
    return 'Form validation complete';
  },

  // Run all tests
  runAll: async () => {
    console.log('🏥 PHARMACY FRONTEND STATUS CHECK');
    console.log('=================================');
    
    console.log('\n📍 Current Page:', window.location.pathname);
    console.log('📍 Available Routes:', statusCheck.testRoutes.join(', '));
    
    await statusCheck.testServices();
    statusCheck.testForms();
    statusCheck.monitorErrors();
    
    console.log('\n✅ STATUS CHECK COMPLETE!');
    console.log('Navigate to different pages and watch for any errors.');
    console.log('Run statusCheck.testServices() to test services anytime.');
  }
};

// Make available globally
window.statusCheck = statusCheck;

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  console.log('🏥 Pharmacy Frontend Status Checker Loaded!');
  console.log('Run: statusCheck.runAll() to test everything');
  console.log('Run: statusCheck.testServices() to test just services');
  console.log('Run: statusCheck.monitorErrors() to monitor for errors');
}
