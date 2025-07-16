import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const LoginPage = () => {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Logging in...');
    
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Clear any existing auth data first
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Store authentication data
        localStorage.setItem('access_token', result.access);
        localStorage.setItem('refresh_token', result.refresh);
        localStorage.setItem('token', result.access);
        
        // Make sure user data is properly structured before storing
        if (result.user && typeof result.user === 'object') {
          localStorage.setItem('user', JSON.stringify(result.user));
        } else {
          // If no user object is provided, create a minimal one
          localStorage.setItem('user', JSON.stringify({ 
            username: form.username,
            id: result.user_id || 1,
            pharmacy: null
          }));
        }
        
        setMessage('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        const errorMessage = result.detail || 
                            result.message || 
                            result.error ||
                            'Invalid credentials. Please check your username and password.';
        setMessage('Login failed: ' + errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login failed: Network error or server not responding. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Mophar
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-md ${
                message.includes('successful') 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <p className="text-sm text-center">{message}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register-user')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LoginPage;
