import React from 'react';
import { 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';

// Auth pages
import LoginPage from './pages/Auth/LoginPageNew';
import RegisterUserPage from './pages/Auth/RegisterUserPage';
// import RegisterPharmacyPage from './pages/Auth/RegisterPharmacyPage'; // Temporarily commented out

// Dashboard - using the fancy stable dashboard with layout
import DashboardStable from './pages/Dashboard/DashboardStable';
import Layout from './components/layout/layout';

// Main pages
import MedicinesPage from './pages/Medicines/MedicinesPage';
import SalesManagementPageStable from './pages/Sales/SalesManagementPageStable';
import CustomerManagementPage from './pages/Customers/customerManagementPage';
import PurchaseManagementPageStable from './pages/Purchases/PurchaseManagementPageStable';
import PurchaseFormPage from './pages/Purchases/PurchaseFormPage';
import PurchaseDetailPage from './pages/Purchases/purchaseDetailsPage';
import SupplierManagementPage from './pages/Suppliers/SupplierManagementPage';
import SupplierFormPage from './pages/Suppliers/SupplierFormPage';
import SupplierPaymentPage from './pages/Suppliers/SupplierPaymentPage';
import InventoryPageNew from './pages/inventory/InventoryPageNew'; // Your real inventory page

// Sales components
import WorkingSalesForm from './components/sales/WorkingSalesForm';

// Components
import PharmacyCheck from './components/PharmacyCheck';

// Temporary simple pharmacy registration component
const TempRegisterPharmacy = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Register Your Pharmacy</h1>
    <p>Pharmacy registration coming soon...</p>
    <button 
      onClick={() => window.location.href = '/login'}
      style={{
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Back to Login
    </button>
  </div>
);

// Simple auth check component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-user" element={<RegisterUserPage />} />
      <Route path="/register-pharmacy" element={<TempRegisterPharmacy />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <DashboardStable />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <DashboardStable />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Medicines Management */}
      <Route path="/medicines" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <MedicinesPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Inventory Management */}
      <Route path="/inventory" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <InventoryPageNew />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Sales Management */}
      <Route path="/sales" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <SalesManagementPageStable />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Sales Form - New Sale */}
      <Route path="/sales/new" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <WorkingSalesForm />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Sales Form - Edit Sale */}
      <Route path="/sales/:id/edit" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <WorkingSalesForm />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Customer Management */}
      <Route path="/customers" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <CustomerManagementPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Purchase Management */}
      <Route path="/purchases" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <PurchaseManagementPageStable />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Purchase Form - New Purchase */}
      <Route path="/purchases/new" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <PurchaseFormPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Purchase Form - Edit Purchase */}
      <Route path="/purchases/:id/edit" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <PurchaseFormPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Purchase Details - View Purchase */}
      <Route path="/purchases/:id" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <PurchaseDetailPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Supplier Management */}
      <Route path="/suppliers" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <SupplierManagementPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Supplier Form - New */}
      <Route path="/suppliers/new" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <SupplierFormPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Supplier Form - Edit */}
      <Route path="/suppliers/:id/edit" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <SupplierFormPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Supplier Payment Management */}
      <Route path="/suppliers/:id/payments" element={
        <ProtectedRoute>
          <PharmacyCheck>
            <Layout>
              <SupplierPaymentPage />
            </Layout>
          </PharmacyCheck>
        </ProtectedRoute>
      } />
      
      {/* Fallback redirect - changed to dashboard instead of login */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}