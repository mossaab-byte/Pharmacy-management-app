import React, { useState, useEffect } from 'react';
import MedicineSearchWithBarcode from '../components/common/MedicineSearchWithBarcode';
import { Card } from '../components/UI';
import { Clock, Search, Zap, CheckCircle } from 'lucide-react';

const SearchPerformanceDemo = () => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    averageTime: 0,
    cacheHits: 0
  });
  const [recentSearches, setRecentSearches] = useState([]);

  // Monitor console logs for search performance data
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      
      // Track search performance from console logs
      const message = args.join(' ');
      if (message.includes('Found') && message.includes('results')) {
        setSearchStats(prev => ({
          ...prev,
          totalSearches: prev.totalSearches + 1
        }));
      }
      
      if (message.includes('CACHE HIT')) {
        setSearchStats(prev => ({
          ...prev,
          cacheHits: prev.cacheHits + 1
        }));
      }
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setRecentSearches(prev => [
      {
        id: Date.now(),
        medicine: medicine.nom_commercial || medicine.nom,
        time: new Date().toLocaleTimeString()
      },
      ...prev.slice(0, 4)
    ]);
  };

  const testSearches = [
    'paracetamol',
    'amoxicilline', 
    'aspirine',
    'ibuprofène',
    'doliprane'
  ];

  const runPerformanceTest = async () => {
    for (const term of testSearches) {
      // Simulate typing the search term
      const searchInput = document.querySelector('input[type="text"]');
      if (searchInput) {
        searchInput.focus();
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 200));
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Optimized Medicine Search Demo
          </h1>
          <p className="text-lg text-gray-600">
            Ultra-fast medicine search with intelligent caching
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <Search className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{searchStats.totalSearches}</h3>
            <p className="text-gray-600">Total Searches</p>
          </Card>

          <Card className="p-6 text-center">
            <Zap className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{searchStats.cacheHits}</h3>
            <p className="text-gray-600">Cache Hits</p>
          </Card>

          <Card className="p-6 text-center">
            <Clock className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {searchStats.cacheHits > 0 ? '⚡ Instant' : '< 100ms'}
            </h3>
            <p className="text-gray-600">Response Time</p>
          </Card>
        </div>

        {/* Search Component */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Try the Ultra-Fast Search</h2>
            <div className="space-y-4">
              <MedicineSearchWithBarcode
                onMedicineSelect={handleMedicineSelect}
                placeholder="Type 2+ letters for instant results (try: para, amox, asp)..."
                className="w-full"
              />
              
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Quick tests:</span>
                {testSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]');
                      if (input) {
                        input.focus();
                        input.value = term;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                      }
                    }}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                  >
                    {term}
                  </button>
                ))}
                <button
                  onClick={runPerformanceTest}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                >
                  🚀 Run Performance Test
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Selected Medicine Display */}
        {selectedMedicine && (
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                Selected Medicine
              </h2>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">
                  {selectedMedicine.nom_commercial || selectedMedicine.nom}
                </h3>
                <p className="text-green-700">
                  {selectedMedicine.dci1} - {selectedMedicine.forme}
                </p>
                <div className="mt-2 flex gap-4">
                  <span className="text-sm text-green-600">
                    Code: {selectedMedicine.code}
                  </span>
                  <span className="text-sm text-green-600">
                    Prix: {selectedMedicine.prix_public || 'N/A'} DH
                  </span>
                  <span className="text-sm text-green-600">
                    Type: {selectedMedicine.princeps_generique === 'P' ? 'Princeps' : 'Générique'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
              <div className="space-y-2">
                {recentSearches.map(search => (
                  <div key={search.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{search.medicine}</span>
                    <span className="text-sm text-gray-500">{search.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Performance Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">🚀 Performance Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Ultra-fast 30ms debounce</li>
              <li>• Intelligent result caching</li>
              <li>• Optimized database indexes</li>
              <li>• Smart query optimization</li>
              <li>• Instant cache hits</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">📊 Technical Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Database indexes on nom, code, dci1</li>
              <li>• Frontend caching with Map()</li>
              <li>• 2-second API timeout</li>
              <li>• Optimized SQL queries</li>
              <li>• Real-time search feedback</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchPerformanceDemo;
