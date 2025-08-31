import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Button } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import { Building, Settings, MapPin, ArrowLeft } from 'lucide-react';

const PharmacySettingsPage = () => {
  const navigate = useNavigate();
  const [pharmacyName, setPharmacyName] = useState('Mophar'); // Default fallback

  useEffect(() => {
    // Get pharmacy name from localStorage if available
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.pharmacy_name) {
          setPharmacyName(user.pharmacy_name);
        }
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Settings</h1>
              <p className="text-gray-600">Configure your pharmacy information</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pharmacy Name</p>
                <p className="text-lg font-bold text-gray-900">{pharmacyName}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-bold text-gray-900">Not Set</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-bold text-gray-900">Active</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pharmacy Settings</h3>
            <p className="text-gray-600 mb-4">
              This feature is under development. Pharmacy configuration will be available soon.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default PharmacySettingsPage;
