let logoutCallback = null;

// Function for AuthProvider to register a callback
export const registerLogout = (callback) => {
  logoutCallback = callback;
};

// Function to logout: clear token, call React state reset, redirect
export const doLogout = () => {
  localStorage.removeItem('token');
  if (logoutCallback) {
    logoutCallback();  // clears user state in React
  }
  window.location.href = '/login';  // redirect to login page
};
