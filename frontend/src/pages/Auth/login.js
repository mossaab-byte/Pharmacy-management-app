import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { Card, Button, Input } from '../../components/UI';
import ApiHealthService from '../../services/apiHealthService';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [checkingHealth, setCheckingHealth] = useState(true);

  const auth = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const healthCheck = await ApiHealthService.checkHealth();
        setApiHealthy(healthCheck.isHealthy);
        if (!healthCheck.isHealthy) {
          addNotification({
            type: 'warning',
            message: 'Backend server may be offline. Please check your connection.'
          });
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setApiHealthy(false);
      } finally {
        setCheckingHealth(false);
      }
    };

    checkApiHealth();
  }, [addNotification]);

  if (!auth || auth.loading || checkingHealth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <span className="text-gray-600 text-lg">
            {checkingHealth ? 'Checking server connection...' : 'Loading authentication...'}
          </span>
        </div>
      </div>
    );
  }

  // If user is already logged in (from previous session)
  if (auth.user) {
    // Decide redirect based on pharmacy registration
    if (auth.user.pharmacy) {
      // Pharmacy registered — go to dashboard
      return <Navigate to="/" replace />;
    } else {
      // Pharmacy not registered — go to registration page
      return <Navigate to="/register-pharmacy" replace />;
    }
  }

  const handleInputChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await auth.login(credentials);

      addNotification({
        type: 'success',
        message: 'Login successful!'
      });

      // After login, check if user has pharmacy registered
      if (auth.user.pharmacy) {
        navigate('/');
      } else {
        navigate('/register-pharmacy');
      }

    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4">
      <Card
        title="Login to PharmaCare"
        className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg animate-fade-in"
      >
        {!apiHealthy && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p className="text-sm">⚠️ Backend server connection issue detected.</p>
            <p className="text-xs mt-1">Please ensure the Django server is running on port 8000.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            name="username"
            value={credentials.username}
            onChange={handleInputChange}
            required
            autoFocus
            disabled={!apiHealthy}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            required
            disabled={!apiHealthy}
          />
          <Button
            type="submit"
            disabled={loading || !apiHealthy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold transition-all duration-300 ease-in-out py-2 rounded-lg"
          >
            {loading ? 'Logging in...' : !apiHealthy ? 'Server Offline' : 'Login'}
          </Button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            New user? <a href="/register-user" className="text-emerald-600 hover:text-emerald-700 font-medium">Register here</a>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
