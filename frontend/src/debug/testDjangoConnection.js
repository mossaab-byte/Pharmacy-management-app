import { apiClient } from '../services/apiClient';

async function testDjangoConnection() {
  console.log('🧪 Testing Django Backend Connection...');
  console.log('Backend URL:', process.env.REACT_APP_API_URL || 'http://localhost:8000/api');
  
  // Test 1: Test basic connection
  try {
    console.log('\n1️⃣ Testing basic API connection...');
    const response = await fetch('http://localhost:8000/api/medicine/medicines/?page_size=5');
    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    
    const data = await response.json();
    console.log('📊 Response data:', {
      count: data.count,
      results_length: data.results?.length,
      first_medicine: data.results?.[0]?.nom
    });
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Make sure Django backend is running: python manage.py runserver');
    return false;
  }
  
  // Test 2: Test with apiClient
  try {
    console.log('\n2️⃣ Testing with apiClient...');
    const response = await apiClient.get('/medicine/medicines/?page_size=10');
    console.log('✅ ApiClient works!');
    console.log('Medicines loaded:', response.data?.results?.length);
  } catch (error) {
    console.error('❌ ApiClient failed:', error.message);
    console.error('Error details:', error.response?.data);
  }
  
  // Test 3: Test search functionality
  try {
    console.log('\n3️⃣ Testing medicine search...');
    const response = await apiClient.get('/medicine/medicines/', {
      params: { search: 'doliprane', page_size: 5 }
    });
    console.log('✅ Search works!');
    console.log('Search results:', response.data?.results?.length);
    console.log('First result:', response.data?.results?.[0]?.nom);
  } catch (error) {
    console.error('❌ Search failed:', error.message);
  }
  
  return true;
}

// Export for use in browser console
window.testDjangoConnection = testDjangoConnection;

export default testDjangoConnection;
