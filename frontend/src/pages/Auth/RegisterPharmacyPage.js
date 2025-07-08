import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import pharmacyService from '../../services/pharmacyService';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { AuthContext } from '../../context/authContext';

const RegisterPharmacyPage = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await pharmacyService.registerPharmacy(form);
      
      // Update user context with the new pharmacy data
      const updatedUser = {
        ...user,
        pharmacy: response.pharmacy, // Use response.pharmacy
        hasPharmacy: true
      };
      
      setUser(updatedUser);
      
      // Force a redirect with replace to prevent going back
      navigate('/', { replace: true });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pharmacy');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Register Your Pharmacy
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
            {error}
          </div>
        )}

        <Input
          name="name"
          label="Pharmacy Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          name="address"
          label="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <Input
          name="phone"
          label="Phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+212 6 1234 5678"
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg transition-all duration-300 ease-in-out"
        >
          {loading ? 'Creating...' : 'Create Pharmacy'}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPharmacyPage;