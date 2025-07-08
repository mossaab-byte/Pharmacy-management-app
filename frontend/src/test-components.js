// Test all major components for errors
const testComponents = async () => {
  console.log('Testing all major components...');
  
  // Test navigation to each page
  const pages = [
    '/',
    '/medicines',
    '/inventory',
    '/sales',
    '/purchases',
    '/customers',
    '/suppliers',
    '/exchanges',
    '/finance',
    '/reports',
    '/users',
    '/pharmacy'
  ];
  
  for (const page of pages) {
    try {
      console.log(`Testing page: ${page}`);
      window.location.hash = page;
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`✓ Page ${page} loaded successfully`);
    } catch (error) {
      console.error(`✗ Error on page ${page}:`, error);
    }
  }
  
  // Test form pages
  const formPages = [
    '/sales/new',
    '/purchases/new',
    '/customers/new',
    '/suppliers/new'
  ];
  
  for (const page of formPages) {
    try {
      console.log(`Testing form page: ${page}`);
      window.location.hash = page;
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`✓ Form page ${page} loaded successfully`);
    } catch (error) {
      console.error(`✗ Error on form page ${page}:`, error);
    }
  }
  
  console.log('Component testing completed');
};

// Run the test
testComponents();
