// EMERGENCY FIX - PASTE THIS IN BROWSER CONSOLE NOW
console.log('🚨 EMERGENCY PHARMACY FIX STARTING...');

// 1. Clear all cached data
const clearAllCache = () => {
  console.log('🗑️ Clearing all cached data...');
  
  // Clear localStorage cache
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('dashboard') || key.includes('supplier') || key.includes('cache'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log('✅ Cache cleared');
};

// 2. Force API refresh with authentication
const forceAPIRefresh = async () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ NO TOKEN - Please login again!');
    alert('Please logout and login again');
    return;
  }
  
  console.log('🔄 Force refreshing APIs...');
  
  try {
    // Force refresh dashboard
    console.log('📊 Refreshing dashboard...');
    const dashboardResponse = await fetch('http://localhost:8000/api/dashboard/kpis/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API Response:', dashboardData);
      
      // Force update dashboard display
      const totalPurchasesElements = document.querySelectorAll('[class*="Total Purchases"], [class*="totalPurchases"]');
      totalPurchasesElements.forEach(el => {
        if (el.textContent.includes('0.00 DH')) {
          el.textContent = `${dashboardData.totalPurchases} DH`;
          el.style.color = 'green';
          console.log('✅ Updated dashboard element');
        }
      });
      
      // Also try to find by text content
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.textContent && el.textContent.trim() === '0.00 DH' && el.closest('[class*="purchase"], [class*="Purchase"]')) {
          el.textContent = `${dashboardData.totalPurchases}.00 DH`;
          el.style.color = 'green';
          console.log('✅ Updated purchase total element');
        }
      });
      
    } else {
      console.error('❌ Dashboard API failed:', dashboardResponse.status);
    }
    
    // Force refresh suppliers
    console.log('🏭 Refreshing suppliers...');
    const supplierResponse = await fetch('http://localhost:8000/api/purchases/suppliers/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (supplierResponse.ok) {
      const supplierData = await supplierResponse.json();
      console.log('✅ Supplier API Response:', supplierData);
      
      // Force update supplier display
      if (supplierData.results && supplierData.results.length > 0) {
        const supplier = supplierData.results[0];
        
        // Find and update credit limit and balance elements
        const creditElements = document.querySelectorAll('*');
        creditElements.forEach(el => {
          if (el.textContent && el.textContent.includes('0.00 DH')) {
            const parent = el.closest('[class*="supplier"], [class*="Supplier"]');
            if (parent) {
              // Check if this is credit limit or balance
              const parentText = parent.textContent.toLowerCase();
              if (parentText.includes('credit') || parentText.includes('limit')) {
                el.textContent = `${supplier.credit_limit} DH`;
                el.style.color = 'blue';
                console.log('✅ Updated credit limit element');
              } else if (parentText.includes('balance')) {
                el.textContent = `${supplier.current_balance} DH`;
                el.style.color = 'red';
                console.log('✅ Updated balance element');
              }
            }
          }
        });
      }
      
    } else {
      console.error('❌ Supplier API failed:', supplierResponse.status);
    }
    
  } catch (error) {
    console.error('❌ API refresh failed:', error);
  }
};

// 3. Force React component re-render
const forceReactRefresh = () => {
  console.log('⚛️ Force refreshing React components...');
  
  // Try to trigger React refresh events
  const refreshButtons = document.querySelectorAll('button');
  refreshButtons.forEach(btn => {
    if (btn.textContent && btn.textContent.toLowerCase().includes('refresh')) {
      console.log('🔄 Clicking refresh button:', btn.textContent);
      btn.click();
    }
  });
  
  // Trigger window resize to force re-render
  window.dispatchEvent(new Event('resize'));
  
  // Trigger storage event to update contexts
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'forceRefresh',
    newValue: Date.now().toString()
  }));
};

// 4. Complete emergency fix
const emergencyFix = async () => {
  console.log('🚨 RUNNING COMPLETE EMERGENCY FIX...');
  
  clearAllCache();
  await forceAPIRefresh();
  forceReactRefresh();
  
  console.log('✅ Emergency fix complete! If still not working, refresh the page.');
  
  // Auto-refresh page after 3 seconds
  setTimeout(() => {
    console.log('🔄 Auto-refreshing page...');
    window.location.reload();
  }, 3000);
};

// Make functions globally available
window.emergencyFix = emergencyFix;
window.clearAllCache = clearAllCache;
window.forceAPIRefresh = forceAPIRefresh;
window.forceReactRefresh = forceReactRefresh;

console.log('🛠️ Emergency fix tools ready!');
console.log('Run: emergencyFix() to fix everything automatically');
console.log('Or run individual functions: clearAllCache(), forceAPIRefresh(), forceReactRefresh()');

// Auto-run the emergency fix
emergencyFix();
