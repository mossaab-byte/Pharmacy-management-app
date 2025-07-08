// Test script to verify pharmacy registration flow
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000/api';

async function testPharmacyRegistration() {
    console.log('Testing pharmacy registration flow...');
    
    // Step 1: Register a user
    console.log('1. Registering user...');
    const userResponse = await fetch(`${BASE_URL}/auth/register-user/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'testuser_' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'testpass123',
            password_confirm: 'testpass123'
        })
    });
    
    if (!userResponse.ok) {
        const error = await userResponse.text();
        console.error('User registration failed:', error);
        return;
    }
    
    const userData = await userResponse.json();
    console.log('User registered successfully:', userData.user);
    
    // Step 2: Use the token to register pharmacy
    console.log('2. Registering pharmacy...');
    const pharmacyResponse = await fetch(`${BASE_URL}/auth/pharmacies/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.access}`
        },
        body: JSON.stringify({
            name: 'Test Pharmacy',
            address: '123 Test Street',
            phone: '1234567890'
        })
    });
    
    if (!pharmacyResponse.ok) {
        const error = await pharmacyResponse.text();
        console.error('Pharmacy registration failed:', error);
        return;
    }
    
    const pharmacyData = await pharmacyResponse.json();
    console.log('Pharmacy registered successfully:', pharmacyData.pharmacy);
    
    console.log('✅ Both user and pharmacy registration working correctly!');
}

testPharmacyRegistration().catch(console.error);
