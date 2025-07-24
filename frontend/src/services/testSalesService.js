// TEMPORARY TEST FILE - DELETE AFTER TESTING
import salesServiceNew from './salesServiceNew';

console.log('🧪 Testing new sales service...');
console.log('🧪 salesServiceNew:', salesServiceNew);
console.log('🧪 Methods available:', Object.keys(salesServiceNew));
console.log('🧪 getAllSales type:', typeof salesServiceNew.getAllSales);

// Export for testing
window.testSalesService = salesServiceNew;

export default salesServiceNew;
