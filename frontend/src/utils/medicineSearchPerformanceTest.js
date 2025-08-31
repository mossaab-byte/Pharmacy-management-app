// Performance Test for Optimized Medicine Search
// Run this in the browser console to test search performance

async function testMedicineSearchPerformance() {
  console.log('🚀 Starting Medicine Search Performance Test');
  console.log('='.repeat(50));

  const API_BASE = 'http://localhost:8001';
  const searchTerms = ['para', 'amox', 'asp', 'ibu', 'lop', 'met', 'sim'];
  const results = [];

  for (const term of searchTerms) {
    console.log(`\n⚡ Testing search for: "${term}"`);
    
    // Test 1: First search (no cache)
    const start1 = performance.now();
    try {
      const response1 = await fetch(`${API_BASE}/medicine/medicines/quick_search/?q=${term}&limit=20`);
      const data1 = await response1.json();
      const end1 = performance.now();
      const time1 = end1 - start1;
      
      console.log(`  📊 First search: ${time1.toFixed(2)}ms (${data1.length} results)`);
      
      // Test 2: Second search (should use cache)
      const start2 = performance.now();
      const response2 = await fetch(`${API_BASE}/medicine/medicines/quick_search/?q=${term}&limit=20`);
      const data2 = await response2.json();
      const end2 = performance.now();
      const time2 = end2 - start2;
      
      console.log(`  ⚡ Cached search: ${time2.toFixed(2)}ms (${data2.length} results)`);
      console.log(`  🎯 Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
      
      results.push({
        term,
        firstSearch: time1,
        cachedSearch: time2,
        improvement: ((time1 - time2) / time1 * 100),
        resultCount: data1.length
      });
      
    } catch (error) {
      console.error(`  ❌ Error testing "${term}":`, error);
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('='.repeat(50));
  
  const avgFirstSearch = results.reduce((sum, r) => sum + r.firstSearch, 0) / results.length;
  const avgCachedSearch = results.reduce((sum, r) => sum + r.cachedSearch, 0) / results.length;
  const avgImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length;
  const totalResults = results.reduce((sum, r) => sum + r.resultCount, 0);
  
  console.log(`Average first search time: ${avgFirstSearch.toFixed(2)}ms`);
  console.log(`Average cached search time: ${avgCachedSearch.toFixed(2)}ms`);
  console.log(`Average speed improvement: ${avgImprovement.toFixed(1)}%`);
  console.log(`Total medicines found: ${totalResults}`);
  console.log(`Performance rating: ${avgFirstSearch < 100 ? '🔥 EXCELLENT' : avgFirstSearch < 300 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);
  
  return results;
}

// Auto-run the test
if (typeof window !== 'undefined') {
  console.log('🧪 Medicine Search Performance Test Ready!');
  console.log('💡 Run: testMedicineSearchPerformance()');
} else {
  // If running in Node.js environment
  testMedicineSearchPerformance().then(results => {
    console.log('Test completed!', results);
  });
}
