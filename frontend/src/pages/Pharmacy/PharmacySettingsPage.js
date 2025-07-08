import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, LoadingSpinner, ErrorMessage } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/authContext';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Save, 
  Eye, 
  EyeOff,
  Users,
  Settings,
  Bell,
  Shield,
  Database,
  Download,
  Upload
} from 'lucide-react';

const PharmacySettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [pharmacyInfo, setPharmacyInfo] = useState({
    name: 'Central Pharmacy',
    address: '123 Main Street, City Center',
    phone: '+212 522 123 456',
    email: 'contact@centralpharmacy.ma',
    license_number: 'PH-2024-001',
    tax_id: 'TAX123456789',
    open_hours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '21:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false }
    }
  });

  const [notifications, setNotifications] = useState({
    low_stock_alerts: true,
    expiry_alerts: true,
    daily_reports: true,
    email_notifications: true,
    sms_notifications: false,
    low_stock_threshold: 10
  });

  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    session_timeout: 30,
    password_complexity: true,
    api_access_enabled: true,
    api_key: 'pk_live_123456789abcdef...',
    last_backup: '2024-01-20T10:30:00Z'
  });

  const [system, setSystem] = useState({
    currency: 'MAD',
    language: 'fr',
    timezone: 'Africa/Casablanca',
    date_format: 'DD/MM/YYYY',
    auto_backup: true,
    backup_frequency: 'daily'
  });

  const { addNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacySettings();
  }, []);

  const fetchPharmacySettings = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch pharmacy settings');
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        message: 'Pharmacy information updated successfully'
      });
      setLoading(false);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update pharmacy information'
      });
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        message: 'Notification settings updated successfully'
      });
      setLoading(false);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update notification settings'
      });
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        message: 'Security settings updated successfully'
      });
      setLoading(false);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update security settings'
      });
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        message: 'System settings updated successfully'
      });
      setLoading(false);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update system settings'
      });
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification({
        type: 'success',
        message: 'Database backup created successfully'
      });
      setLoading(false);
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to create backup'
      });
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate data export
      const data = {
        pharmacy: pharmacyInfo,
        export_date: new Date().toISOString(),
        tables: ['sales', 'purchases', 'inventory', 'customers', 'suppliers']
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `pharmacy_data_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      addNotification({
        type: 'success',
        message: 'Data exported successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to export data'
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  if (loading && activeTab === 'general') {
    return (
      <div className="pharmacy-settings-page p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pharmacy-settings-page p-6 max-w-7xl mx-auto">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="pharmacy-settings-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Settings</h1>
        <p className="text-gray-600">Configure your pharmacy information and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="lg:w-1/4">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Tab Content */}
        <div className="lg:w-3/4">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">General Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Pharmacy Name"
                    value={pharmacyInfo.name}
                    onChange={(e) => setPharmacyInfo({...pharmacyInfo, name: e.target.value})}
                    placeholder="Enter pharmacy name"
                    icon={Building}
                  />
                  <Input
                    label="Phone Number"
                    value={pharmacyInfo.phone}
                    onChange={(e) => setPharmacyInfo({...pharmacyInfo, phone: e.target.value})}
                    placeholder="Enter phone number"
                    icon={Phone}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={pharmacyInfo.email}
                    onChange={(e) => setPharmacyInfo({...pharmacyInfo, email: e.target.value})}
                    placeholder="Enter email address"
                    icon={Mail}
                  />
                  <Input
                    label="License Number"
                    value={pharmacyInfo.license_number}
                    onChange={(e) => setPharmacyInfo({...pharmacyInfo, license_number: e.target.value})}
                    placeholder="Enter license number"
                  />
                  <Input
                    label="Tax ID"
                    value={pharmacyInfo.tax_id}
                    onChange={(e) => setPharmacyInfo({...pharmacyInfo, tax_id: e.target.value})}
                    placeholder="Enter tax ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address
                  </label>
                  <textarea
                    value={pharmacyInfo.address}
                    onChange={(e) => setPharmacyInfo({...pharmacyInfo, address: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter full address"
                  />
                </div>

                {/* Opening Hours */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Opening Hours
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(pharmacyInfo.open_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-20 capitalize font-medium">
                          {day}:
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => setPharmacyInfo({
                              ...pharmacyInfo,
                              open_hours: {
                                ...pharmacyInfo.open_hours,
                                [day]: { ...hours, closed: !e.target.checked }
                              }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 w-12">Open</span>
                          {!hours.closed && (
                            <>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => setPharmacyInfo({
                                  ...pharmacyInfo,
                                  open_hours: {
                                    ...pharmacyInfo.open_hours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => setPharmacyInfo({
                                  ...pharmacyInfo,
                                  open_hours: {
                                    ...pharmacyInfo.open_hours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Low Stock Alerts</h3>
                      <p className="text-sm text-gray-600">Get notified when medicines are running low</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.low_stock_alerts}
                      onChange={(e) => setNotifications({...notifications, low_stock_alerts: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Expiry Alerts</h3>
                      <p className="text-sm text-gray-600">Get notified about medicines nearing expiration</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.expiry_alerts}
                      onChange={(e) => setNotifications({...notifications, expiry_alerts: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Daily Reports</h3>
                      <p className="text-sm text-gray-600">Receive daily sales and inventory reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.daily_reports}
                      onChange={(e) => setNotifications({...notifications, daily_reports: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email_notifications}
                      onChange={(e) => setNotifications({...notifications, email_notifications: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">SMS Notifications</h3>
                      <p className="text-sm text-gray-600">Send notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.sms_notifications}
                      onChange={(e) => setNotifications({...notifications, sms_notifications: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={notifications.low_stock_threshold}
                    onChange={(e) => setNotifications({...notifications, low_stock_threshold: parseInt(e.target.value)})}
                    placeholder="Enter threshold quantity"
                    min="1"
                    max="100"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Alert when stock falls below this quantity
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.two_factor_enabled}
                      onChange={(e) => setSecurity({...security, two_factor_enabled: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Password Complexity</h3>
                      <p className="text-sm text-gray-600">Require strong passwords for all users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.password_complexity}
                      onChange={(e) => setSecurity({...security, password_complexity: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">API Access</h3>
                      <p className="text-sm text-gray-600">Allow external applications to access your data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.api_access_enabled}
                      onChange={(e) => setSecurity({...security, api_access_enabled: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    type="number"
                    value={security.session_timeout}
                    onChange={(e) => setSecurity({...security, session_timeout: parseInt(e.target.value)})}
                    placeholder="Enter timeout in minutes"
                    min="5"
                    max="480"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Users will be logged out after this period of inactivity
                  </p>
                </div>

                {security.api_access_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={security.api_key}
                          readOnly
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button variant="outline">
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep this key secure and don't share it publicly
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveSecurity} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">System Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={system.currency}
                      onChange={(e) => setSystem({...system, currency: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="MAD">Moroccan Dirham (MAD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={system.language}
                      onChange={(e) => setSystem({...system, language: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={system.timezone}
                      onChange={(e) => setSystem({...system, timezone: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Africa/Casablanca">Africa/Casablanca</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select
                      value={system.date_format}
                      onChange={(e) => setSystem({...system, date_format: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto Backup</h3>
                      <p className="text-sm text-gray-600">Automatically backup your data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={system.auto_backup}
                      onChange={(e) => setSystem({...system, auto_backup: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  {system.auto_backup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={system.backup_frequency}
                        onChange={(e) => setSystem({...system, backup_frequency: e.target.value})}
                        className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSystem} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Data & Backup */}
          {activeTab === 'data' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Data & Backup</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Last Backup</h3>
                  <p className="text-sm text-blue-800">
                    {new Date(security.last_backup).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Create Backup</h3>
                      <Database className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a complete backup of your pharmacy data
                    </p>
                    <Button 
                      onClick={handleBackup} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4 mr-2" />}
                      Create Backup
                    </Button>
                  </Card>

                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Export Data</h3>
                      <Upload className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Export your data in JSON format
                    </p>
                    <Button 
                      onClick={handleExportData} 
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </Card>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Backups include all your pharmacy data and settings</li>
                    <li>• Keep your backups in a secure location</li>
                    <li>• Test your backup restore process regularly</li>
                    <li>• Contact support for assistance with data recovery</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacySettingsPage;
