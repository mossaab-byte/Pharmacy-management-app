// Add this debugging function to the browser console to check what data is being returned

async function debugPurchaseData() {
    try {
        const response = await fetch('/api/purchases/purchases/');
        const data = await response.json();
        
        console.log('🔍 API Response Status:', response.status);
        console.log('🔍 API Response Data:', data);
        
        if (data.results) {
            console.log('🔍 Number of purchases:', data.results.length);
            data.results.forEach((purchase, index) => {
                console.log(`🔍 Purchase ${index + 1}:`, {
                    id: purchase.id,
                    total: purchase.total,
                    total_amount: purchase.total_amount,
                    supplier_name: purchase.supplier_name,
                    items_count: purchase.items_count,
                    status: purchase.status,
                    date: purchase.date
                });
            });
        }
    } catch (error) {
        console.error('❌ Error fetching purchases:', error);
    }
}

// Run the debug function
debugPurchaseData();
