import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import ErrorMessage from '../../components/UI/ErrorMessage';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/authService';

const RegisterUserPage = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!form.password) {
      setError('Password is required');
      return false;
    }
    if (!form.password_confirm) {
      setError('Password confirmation is required');
      return false;
    }
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Envoyer le payload complet avec password_confirm
      const response = await authService.registerUser(form);
      
      // Store tokens if provided (auto-login)
      if (response.access) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      }
      
      showNotification('User registered successfully! Please set up your pharmacy.', 'success');
      navigate('/register-pharmacy');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Gérer les erreurs spécifiques du backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Si c'est une erreur de validation du serializer
        if (errorData.password_confirm) {
          setError(errorData.password_confirm[0] || 'Password confirmation error');
        } else if (errorData.password) {
          setError(errorData.password[0] || 'Password error');
        } else if (errorData.username) {
          setError(errorData.username[0] || 'Username error');
        } else if (errorData.email) {
          setError(errorData.email[0] || 'Email error');
        } else {
          const errorMessage = errorData.detail || 
                            errorData.error ||
                            errorData.message ||
                            'Registration failed. Please try again.';
          setError(errorMessage);
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Register New User
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Create a new account to access the pharmacy system
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <ErrorMessage message={error} />}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username *
                </label>
                <div className="mt-1">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password (min 8 characters)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1">
                  <Input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    required
                    value={form.password_confirm}
                    onChange={handleChange}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="full"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register User'}
                </Button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RegisterUserPage;