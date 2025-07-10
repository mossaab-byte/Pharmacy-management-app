import medicineService from '../services/medicineService';

async function testMedicineService() {
  console.log('🧪 Testing Medicine Service...');
  
  // Test 1: Check if service is properly exported
  console.log('Service object:', medicineService);
  console.log('Available methods:', Object.keys(medicineService));
  
  // Test 2: Test getAllMedicines method
  try {
    console.log('Testing getAllMedicines...');
    const result = await medicineService.getAllMedicines();
    console.log('✅ getAllMedicines works:', result?.data?.results?.length || 'No results');
  } catch (error) {
    console.error('❌ getAllMedicines failed:', error.message);
  }
  
  // Test 3: Test getAll method  
  try {
    console.log('Testing getAll...');
    const result = await medicineService.getAll();
    console.log('✅ getAll works:', result?.length || 'No results');
  } catch (error) {
    console.error('❌ getAll failed:', error.message);
  }
  
  // Test 4: Test quickSearch method
  try {
    console.log('Testing quickSearch...');
    const result = await medicineService.quickSearch('doli', 5);
    console.log('✅ quickSearch works:', result?.data?.results?.length || 'No results');
  } catch (error) {
    console.error('❌ quickSearch failed:', error.message);
  }
}

// Export for use in browser console
window.testMedicineService = testMedicineService;

export default testMedicineService;
