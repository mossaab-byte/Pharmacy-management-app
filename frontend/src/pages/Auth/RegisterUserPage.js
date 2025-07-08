import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/authContext';
import { useNotification } from '../../context/NotificationContext';

const RegisterUserPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = useAuth();
  const { addNotification } = useNotification();

  // Clear tokens on page load - runs only once on mount
  useEffect(() => {
    localStorage.setItem('access_token', null);
    localStorage.setItem('refresh_token', null);
    // If you use auth context tokens, clear them too
    if (auth.setTokens) {
      auth.setTokens({ access: null, refresh: null });
      auth.setUser(null);
    }
  }, []); // Empty dependency array - runs only once on mount

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.registerUser(form);

      if (!response || !response.access || !response.refresh || !response.user) {
        throw new Error("Invalid response from server.");
      }

      const { access, refresh, user } = response;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      auth.setUser(user);
      auth.setTokens({ access, refresh });

      addNotification({
        type: 'success',
        message: 'Registration successful!',
      });

      navigate('/register-pharmacy');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
      addNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Your Account
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
            {error}
          </div>
        )}

        <Input
          name="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          name="password_confirm"
          type="password"
          label="Confirm Password"
          value={form.password_confirm}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg transition-all duration-300 ease-in-out"
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </div>
  );
};

export default RegisterUserPage;