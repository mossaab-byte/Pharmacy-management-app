import React from 'react';
import { 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';

import Layout from './components/layout/layout';
import SimpleProtectedRoute from './components/SimpleProtectedRoute';
import { DashboardProvider } from './context/DashboardContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard/DashboardStable';
import CustomerManagementPage from './pages/Customers/customerManagementPage';
import CustomerDetailPage from './pages/Customers/customerDetailPage';
import CustomerForm from './components/customers/customerForm';
import SalesFormPage from './pages/Sales/salesForm';
import SimpleStableSalesForm from './components/sales/SimpleStableSalesForm';
import SaleDetailPage from './pages/Sales/SaleDetailPage';
import SalesManagementPage from './pages/Sales/SalesManagementPageStable';
import SupplierDetailsPage from './pages/Suppliers/SupplierDetailsPage';
import SupplierListPage from './pages/Suppliers/SuppliersListPage';
import PurchaseDetailPage from './pages/Purchases/purchaseDetailsPage';
import PurchaseManagementPage from './pages/Purchases/PurchaseManagementPageStable';
import PurchaseForm from './components/purchases/purchaseForm';
import ComprehensivePurchaseForm from './components/purchases/ComprehensivePurchaseForm';
import ComprehensiveExchangeForm from './components/exchanges/ComprehensiveExchangeForm';
import ExchangeCreate from './pages/Exchanges/ExchangeCreate';
import ExchangeDashboard from './pages/Exchanges/ExchangeDashboard';
import BalanceOverview from './pages/Exchanges/BalanceOverview';
import ExchangeHistory from './pages/Exchanges/ExchangeHistory';
import SupplierForm from './pages/Suppliers/SupplierFormPage';

// Auth pages
import Login from './pages/Auth/LoginPageNew';
import RegisterUserPage from './pages/Auth/RegisterUserPage';
import RegisterPharmacyPage from './pages/Auth/RegisterPharmacyPage';

// Test pages
import MedicineTest from './pages/Test/MedicineTest';
import ProductionReadinessTest from './components/common/ProductionReadinessTest';
import DatabaseConnectivityTest from './components/common/DatabaseConnectivityTest';
import ComprehensiveSystemTest from './components/common/ComprehensiveSystemTest';
import BackendConnectionTest from './components/debug/BackendConnectionTest';
import TroubleshootingPage from './components/debug/TroubleshootingPage';
import DiagnosticSalesForm from './components/debug/DiagnosticSalesForm';
import APITestPage from './components/debug/APITestPage';
import MedicineSearchTest from './components/debug/MedicineSearchTest';
import BackendDiagnostic from './components/debug/BackendDiagnostic';

// New module pages
import MedicinesPage from './pages/Medicines/MedicinesPageQuickFix';
import SimpleInventoryPage from './pages/inventory/SimpleInventoryPage';
import FinanceDashboard from './pages/Finance/FinanceDashboardNew';
import UsersPage from './pages/Users/UsersPageNew';
import PharmacySettingsPage from './pages/Pharmacy/PharmacySettingsPageNew';
import ReportsPage from './pages/Reports/ReportsPageNew';

// Dashboard Layout with Provider
const DashboardLayout = ({ children }) => (
  <DashboardProvider>
    <Layout>
      {children}
    </Layout>
  </DashboardProvider>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => (
  <SimpleProtectedRoute>
    <DashboardLayout>
      {children}
    </DashboardLayout>
  </SimpleProtectedRoute>
);

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-user" element={<RegisterUserPage />} />
        <Route path="/register-pharmacy" element={<RegisterPharmacyPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Customers */}
        <Route path="/customers" element={<ProtectedRoute><CustomerManagementPage /></ProtectedRoute>} />
        <Route path="/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/customers/edit/:id" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />

        {/* Sales */}
        <Route path="/sales" element={<ProtectedRoute><SalesManagementPage /></ProtectedRoute>} />
        <Route path="/sales/new" element={<ProtectedRoute><SalesFormPage /></ProtectedRoute>} />
        <Route path="/sales/edit/:id" element={<ProtectedRoute><SalesFormPage /></ProtectedRoute>} />
        <Route path="/sales/stable" element={<ProtectedRoute><div className="page p-6"><SimpleStableSalesForm /></div></ProtectedRoute>} />
        <Route path="/sales/:id" element={<ProtectedRoute><SaleDetailPage /></ProtectedRoute>} />

        {/* Suppliers */}
        <Route path="/suppliers" element={<ProtectedRoute><SupplierListPage /></ProtectedRoute>} />
        <Route path="/suppliers/new" element={<ProtectedRoute><SupplierForm /></ProtectedRoute>} />
        <Route path="/suppliers/:id" element={<ProtectedRoute><SupplierDetailsPage /></ProtectedRoute>} />

        {/* Purchases */}
        <Route path="/purchases" element={<ProtectedRoute><PurchaseManagementPage /></ProtectedRoute>} />
        <Route path="/purchases/new" element={<ProtectedRoute><ComprehensivePurchaseForm /></ProtectedRoute>} />
        <Route path="/purchases/:id" element={<ProtectedRoute><PurchaseDetailPage /></ProtectedRoute>} />

        {/* Exchanges */}
        <Route path="/exchanges/create" element={<ProtectedRoute><ComprehensiveExchangeForm /></ProtectedRoute>} />
        <Route path="/exchanges" element={<ProtectedRoute><ExchangeDashboard /></ProtectedRoute>} />
        <Route path="/exchanges/balance" element={<ProtectedRoute><BalanceOverview /></ProtectedRoute>} />
        <Route path="/exchanges/history/:pharmacy_id" element={<ProtectedRoute><ExchangeHistory /></ProtectedRoute>} />

        {/* Medicines */}
        <Route path="/medicines" element={<ProtectedRoute><MedicinesPage /></ProtectedRoute>} />

        {/* Inventory */}
        <Route path="/inventory" element={<ProtectedRoute><SimpleInventoryPage /></ProtectedRoute>} />

        {/* Finance */}
        <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

        {/* Users */}
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />

        {/* Pharmacy Settings */}
        <Route path="/pharmacy" element={<ProtectedRoute><PharmacySettingsPage /></ProtectedRoute>} />

        {/* Test pages */}
        <Route path="/test/medicine" element={<ProtectedRoute><MedicineTest /></ProtectedRoute>} />
        <Route path="/test/medicine-search" element={<ProtectedRoute><MedicineSearchTest /></ProtectedRoute>} />
        <Route path="/test/production" element={<ProtectedRoute><ProductionReadinessTest /></ProtectedRoute>} />
        <Route path="/test/database" element={<ProtectedRoute><DatabaseConnectivityTest /></ProtectedRoute>} />
        <Route path="/test/comprehensive" element={<ProtectedRoute><ComprehensiveSystemTest /></ProtectedRoute>} />
        <Route path="/test/backend" element={<ProtectedRoute><BackendConnectionTest /></ProtectedRoute>} />
        <Route path="/test/api" element={<ProtectedRoute><APITestPage /></ProtectedRoute>} />
        <Route path="/troubleshoot" element={<ProtectedRoute><TroubleshootingPage /></ProtectedRoute>} />
        <Route path="/diagnose" element={<ProtectedRoute><DiagnosticSalesForm /></ProtectedRoute>} />
        <Route path="/debug/backend" element={<ProtectedRoute><BackendDiagnostic /></ProtectedRoute>} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}