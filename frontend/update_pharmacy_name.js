// Quick fix to update localStorage with pharmacy name
// Run this in browser console to test the pharmacy name display

console.log('Current user data:', JSON.parse(localStorage.getItem('user') || '{}'));

// Update user data to include pharmacy name
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
currentUser.pharmacy_name = 'wings'; // Your current pharmacy name from the logs

localStorage.setItem('user', JSON.stringify(currentUser));

console.log('Updated user data:', JSON.parse(localStorage.getItem('user')));
console.log('Refresh the page to see the pharmacy name in the sidebar!');
