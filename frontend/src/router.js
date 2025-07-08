import React from 'react';
import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route,  
  RouterProvider,
  Navigate,
  Outlet
} from 'react-router-dom';

import Layout from './components/layout/layout';
import ProtectedRoute from './components/protectedRoute'; // Use your custom ProtectedRoute
import { DashboardProvider } from './context/DashboardContext';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerManagementPage from './pages/Customers/customerManagementPage';
import CustomerDetailPage from './pages/Customers/customerDetailPage';
import CustomerForm from './components/customers/customerForm';
import SalesFormPage from './pages/Sales/salesForm';
import SaleDetailPage from './pages/Sales/salesDetailPage';
import SalesManagementPage from './pages/Sales/salesManagementPage';
import SupplierDetailsPage from './pages/Suppliers/SupplierDetailsPage';
import SupplierListPage from './pages/Suppliers/SuppliersListPage';
import PurchaseDetailPage from './pages/Purchases/purchaseDetailsPage';
import PurchaseManagementPage from './pages/Purchases/purchaseManagementPage';
import PurchaseForm from './components/purchases/purchaseForm';
import ExchangeCreate from './pages/Exchanges/ExchangeCreate';
import ExchangeDashboard from './pages/Exchanges/ExchangeDashboard';
import BalanceOverview from './pages/Exchanges/BalanceOverview';
import ExchangeHistory from './pages/Exchanges/ExchangeHistory';
import SupplierForm from './pages/Suppliers/SupplierFormPage';

// Auth pages
import Login from './pages/Auth/login';
import RegisterUserPage from './pages/Auth/RegisterUserPage';
import RegisterPharmacyPage from './pages/Auth/RegisterPharmacyPage';

// Test pages
import MedicineTest from './pages/Test/MedicineTest';

// New module pages
import MedicinesPage from './pages/Medicines/MedicinesPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import UsersPage from './pages/Users/UsersPage';
import PharmacySettingsPage from './pages/Pharmacy/PharmacySettingsPage';
import ReportsPage from './pages/Reports/ReportsPage';

// Dashboard Layout with Provider
const DashboardLayout = () => (
  <DashboardProvider>
    <Layout>
      <Outlet />
    </Layout>
  </DashboardProvider>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register-user" element={<RegisterUserPage />} />
      <Route path="/register-pharmacy" element={<RegisterPharmacyPage />} />

      {/* Protected routes with dashboard provider */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Customers */}
          <Route path="customers" element={<CustomerManagementPage />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />

          {/* Sales */}
          <Route path="sales" element={<SalesManagementPage />} />
          <Route path="sales/new" element={<SalesFormPage />} />
          <Route path="sales/:id" element={<SaleDetailPage />} />

          {/* Suppliers */}
          <Route path="suppliers" element={<SupplierListPage />} />
          <Route path="suppliers/new" element={<SupplierForm />} />
          <Route path="suppliers/:id" element={<SupplierDetailsPage />} />

          {/* Purchases */}
          <Route path="purchases" element={<PurchaseManagementPage />} />
          <Route path="purchases/new" element={<PurchaseForm />} />
          <Route path="purchases/:id" element={<PurchaseDetailPage />} />

          {/* Exchanges */}
          <Route path="exchanges/create" element={<ExchangeCreate />} />
          <Route path="exchanges" element={<ExchangeDashboard />} />
          <Route path="exchanges/balance" element={<BalanceOverview />} />
          <Route path="exchanges/history/:pharmacy_id" element={<ExchangeHistory />} />

          {/* Medicines */}
          <Route path="medicines" element={<MedicinesPage />} />

          {/* Inventory */}
          <Route path="inventory" element={<InventoryPage />} />

          {/* Finance */}
          <Route path="finance" element={<FinanceDashboard />} />

          {/* Reports */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Users */}
          <Route path="users" element={<UsersPage />} />

          {/* Pharmacy Settings */}
          <Route path="pharmacy" element={<PharmacySettingsPage />} />

          {/* Test pages */}
          <Route path="test/medicine" element={<MedicineTest />} />
        </Route>
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}