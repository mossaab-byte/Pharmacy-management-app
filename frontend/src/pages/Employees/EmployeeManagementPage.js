import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  UserCheck, 
  UserX,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import employeeService from '../../services/employeeService';
import ErrorBoundary from '../../components/ErrorBoundary';

const EmployeeManagementPage = () => {
  const { addNotification } = useNotification();
  
  // State
  const [employees, setEmployees] = useState([]);
  const [managerPermissions, setManagerPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    is_manager: false,
    can_manage_inventory: false,
    can_manage_sales: true,
    can_manage_purchases: false,
    can_manage_users: false,
    can_view_reports: false
  });
  
  const [permissionsForm, setPermissionsForm] = useState({
    // Basic permissions (PharmacyUser level)
    can_manage_inventory: false,
    can_manage_sales: false,
    can_manage_purchases: false,
    can_manage_users: false,
    can_view_reports: false,
    is_manager: false,
    
    // Advanced permissions (Manager level)
    can_modify_sales: false,
    can_delete_sales: false,
    can_modify_purchases: false,
    can_delete_purchases: false,
    can_manage_suppliers: false,
    can_manage_customers: false
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate user permissions first
      const permissions = await employeeService.validateUserPermissions();
      setUserPermissions(permissions);
      
      if (!permissions.canManageUsers) {
        setError('You do not have permission to manage employees');
        return;
      }
      
      // Load employees and manager permissions
      const [employeesData, managersData, currentUserData] = await Promise.all([
        employeeService.getAllEmployees(),
        employeeService.getManagerPermissions(),
        employeeService.getCurrentUser()
      ]);
      
      setEmployees(employeesData);
      setManagerPermissions(managersData);
      setCurrentUser(currentUserData);
      
    } catch (err) {
      console.error('Error loading employee data:', err);
      setError('Failed to load employee data');
      addNotification({
        type: 'error',
        message: 'Failed to load employee data'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get manager permissions for a specific employee
  const getEmployeeManagerPermissions = (employeeId) => {
    return managerPermissions.find(mp => 
      (mp.user?.id === employeeId) || (mp.user === employeeId)
    );
  };

  // Handle create employee
  const handleCreateEmployee = async () => {
    try {
      const createdEmployee = await employeeService.createEmployee(newEmployee);
      
      // If employee is set as manager, create manager permissions
      if (newEmployee.is_manager) {
        await employeeService.setManagerPermissions(createdEmployee.id, {
          can_modify_sales: newEmployee.can_manage_sales,
          can_delete_sales: false,
          can_modify_purchases: newEmployee.can_manage_purchases,
          can_delete_purchases: false,
          can_view_reports: newEmployee.can_view_reports,
          can_manage_suppliers: true,
          can_manage_inventory: newEmployee.can_manage_inventory,
          can_manage_customers: true
        });
      }
      
      addNotification({
        type: 'success',
        message: `Employee ${createdEmployee.username} created successfully`
      });
      
      setShowCreateModal(false);
      resetNewEmployeeForm();
      loadData();
      
    } catch (error) {
      console.error('Error creating employee:', error);
      addNotification({
        type: 'error',
        message: 'Failed to create employee'
      });
    }
  };

  // Handle update employee permissions
  const handleUpdatePermissions = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Update basic user permissions
      await employeeService.updateEmployeePermissions(selectedEmployee.id, {
        can_manage_inventory: permissionsForm.can_manage_inventory,
        can_manage_sales: permissionsForm.can_manage_sales,
        can_manage_purchases: permissionsForm.can_manage_purchases,
        can_manage_users: permissionsForm.can_manage_users,
        can_view_reports: permissionsForm.can_view_reports,
        is_manager: permissionsForm.is_manager
      });
      
      // If employee is manager, set/update manager permissions
      if (permissionsForm.is_manager) {
        await employeeService.setManagerPermissions(selectedEmployee.id, {
          can_modify_sales: permissionsForm.can_modify_sales,
          can_delete_sales: permissionsForm.can_delete_sales,
          can_modify_purchases: permissionsForm.can_modify_purchases,
          can_delete_purchases: permissionsForm.can_delete_purchases,
          can_view_reports: permissionsForm.can_view_reports,
          can_manage_suppliers: permissionsForm.can_manage_suppliers,
          can_manage_inventory: permissionsForm.can_manage_inventory,
          can_manage_customers: permissionsForm.can_manage_customers
        });
      } else {
        // Remove manager permissions if no longer manager
        const managerPerm = getEmployeeManagerPermissions(selectedEmployee.id);
        if (managerPerm) {
          await employeeService.removeManagerPermissions(managerPerm.id);
        }
      }
      
      addNotification({
        type: 'success',
        message: `Permissions updated for ${selectedEmployee.username}`
      });
      
      setShowPermissionsModal(false);
      setSelectedEmployee(null);
      loadData();
      
    } catch (error) {
      console.error('Error updating permissions:', error);
      addNotification({
        type: 'error',
        message: 'Failed to update permissions'
      });
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async (employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.username}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove manager permissions first if they exist
      const managerPerm = getEmployeeManagerPermissions(employee.id);
      if (managerPerm) {
        await employeeService.removeManagerPermissions(managerPerm.id);
      }
      
      await employeeService.deleteEmployee(employee.id);
      
      addNotification({
        type: 'success',
        message: `Employee ${employee.username} deleted successfully`
      });
      
      loadData();
      
    } catch (error) {
      console.error('Error deleting employee:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete employee'
      });
    }
  };

  // Handle toggle employee status
  const handleToggleStatus = async (employee) => {
    try {
      await employeeService.toggleEmployeeStatus(employee.id, !employee.is_active);
      
      addNotification({
        type: 'success',
        message: `Employee ${employee.username} ${employee.is_active ? 'deactivated' : 'activated'}`
      });
      
      loadData();
      
    } catch (error) {
      console.error('Error toggling employee status:', error);
      addNotification({
        type: 'error',
        message: 'Failed to update employee status'
      });
    }
  };

  // Open permissions modal
  const openPermissionsModal = (employee) => {
    setSelectedEmployee(employee);
    
    const managerPerm = getEmployeeManagerPermissions(employee.id);
    
    setPermissionsForm({
      // Basic permissions
      can_manage_inventory: employee.can_manage_inventory || false,
      can_manage_sales: employee.can_manage_sales || false,
      can_manage_purchases: employee.can_manage_purchases || false,
      can_manage_users: employee.can_manage_users || false,
      can_view_reports: employee.can_view_reports || false,
      is_manager: employee.is_manager || false,
      
      // Manager permissions
      can_modify_sales: managerPerm?.can_modify_sales || false,
      can_delete_sales: managerPerm?.can_delete_sales || false,
      can_modify_purchases: managerPerm?.can_modify_purchases || false,
      can_delete_purchases: managerPerm?.can_delete_purchases || false,
      can_manage_suppliers: managerPerm?.can_manage_suppliers || false,
      can_manage_customers: managerPerm?.can_manage_customers || false
    });
    
    setShowPermissionsModal(true);
  };

  // Reset forms
  const resetNewEmployeeForm = () => {
    setNewEmployee({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      is_manager: false,
      can_manage_inventory: false,
      can_manage_sales: true,
      can_manage_purchases: false,
      can_manage_users: false,
      can_view_reports: false
    });
  };

  // Render permission toggle
  const PermissionToggle = ({ label, value, onChange, description }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{label}</span>
          {value ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
              <p className="text-gray-600">Gérez votre personnel de pharmacie et leurs autorisations</p>
            </div>
          </div>
          
          {userPermissions.isPharmacist && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter Employé
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Employés</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-bold">
                  {employees.filter(emp => emp.is_manager).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold">
                  {employees.filter(emp => emp.is_active).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">
                  {employees.filter(emp => !emp.is_active).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Employees Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Staff Members</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const managerPerm = getEmployeeManagerPermissions(employee.id);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {employee.first_name?.[0]}{employee.last_name?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              @{employee.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {employee.is_pharmacist && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Pharmacist
                            </span>
                          )}
                          {employee.is_manager && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Manager
                            </span>
                          )}
                          {!employee.is_pharmacist && !employee.is_manager && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Employee
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {employee.can_manage_sales && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                              Sales
                            </span>
                          )}
                          {employee.can_manage_purchases && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                              Purchases
                            </span>
                          )}
                          {employee.can_manage_inventory && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                              Inventory
                            </span>
                          )}
                          {employee.can_view_reports && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                              Reports
                            </span>
                          )}
                          {employee.can_manage_users && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                              Users
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPermissionsModal(employee)}
                            className="flex items-center gap-1"
                          >
                            <Settings className="w-3 h-3" />
                            Permissions
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(employee)}
                            className={`flex items-center gap-1 ${
                              employee.is_active ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {employee.is_active ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Activate
                              </>
                            )}
                          </Button>
                          
                          {userPermissions.isPharmacist && employee.id !== currentUser?.id && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Employee Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Add New Employee</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={newEmployee.first_name}
                      onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={newEmployee.last_name}
                      onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Basic Permissions */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Basic Permissions</h3>
                  
                  <PermissionToggle
                    label="Manager Role"
                    value={newEmployee.is_manager}
                    onChange={(value) => setNewEmployee({...newEmployee, is_manager: value})}
                    description="Grant manager-level access and responsibilities"
                  />
                  
                  <PermissionToggle
                    label="Manage Sales"
                    value={newEmployee.can_manage_sales}
                    onChange={(value) => setNewEmployee({...newEmployee, can_manage_sales: value})}
                    description="Create, view, and process sales transactions"
                  />
                  
                  <PermissionToggle
                    label="Manage Purchases"
                    value={newEmployee.can_manage_purchases}
                    onChange={(value) => setNewEmployee({...newEmployee, can_manage_purchases: value})}
                    description="Handle purchase orders and supplier transactions"
                  />
                  
                  <PermissionToggle
                    label="Manage Inventory"
                    value={newEmployee.can_manage_inventory}
                    onChange={(value) => setNewEmployee({...newEmployee, can_manage_inventory: value})}
                    description="Update stock levels and manage inventory"
                  />
                  
                  <PermissionToggle
                    label="View Reports"
                    value={newEmployee.can_view_reports}
                    onChange={(value) => setNewEmployee({...newEmployee, can_view_reports: value})}
                    description="Access analytics and financial reports"
                  />
                  
                  <PermissionToggle
                    label="Manage Users"
                    value={newEmployee.can_manage_users}
                    onChange={(value) => setNewEmployee({...newEmployee, can_manage_users: value})}
                    description="Add, edit, and manage other employees"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEmployee}
                  disabled={!newEmployee.username || !newEmployee.email || !newEmployee.password}
                >
                  Create Employee
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermissionsModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Manage Permissions - {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h2>
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Permissions */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Basic Permissions
                  </h3>
                  
                  <PermissionToggle
                    label="Manager Role"
                    value={permissionsForm.is_manager}
                    onChange={(value) => setPermissionsForm({...permissionsForm, is_manager: value})}
                    description="Grant manager-level access and responsibilities"
                  />
                  
                  <PermissionToggle
                    label="Manage Sales"
                    value={permissionsForm.can_manage_sales}
                    onChange={(value) => setPermissionsForm({...permissionsForm, can_manage_sales: value})}
                    description="Create, view, and process sales transactions"
                  />
                  
                  <PermissionToggle
                    label="Manage Purchases"
                    value={permissionsForm.can_manage_purchases}
                    onChange={(value) => setPermissionsForm({...permissionsForm, can_manage_purchases: value})}
                    description="Handle purchase orders and supplier transactions"
                  />
                  
                  <PermissionToggle
                    label="Manage Inventory"
                    value={permissionsForm.can_manage_inventory}
                    onChange={(value) => setPermissionsForm({...permissionsForm, can_manage_inventory: value})}
                    description="Update stock levels and manage inventory"
                  />
                  
                  <PermissionToggle
                    label="View Reports"
                    value={permissionsForm.can_view_reports}
                    onChange={(value) => setPermissionsForm({...permissionsForm, can_view_reports: value})}
                    description="Access analytics and financial reports"
                  />
                  
                  <PermissionToggle
                    label="Manage Users"
                    value={permissionsForm.can_manage_users}
                    onChange={(value) => setPermissionsForm({...permissionsForm, can_manage_users: value})}
                    description="Add, edit, and manage other employees"
                  />
                </div>

                {/* Advanced Manager Permissions */}
                {permissionsForm.is_manager && (
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Advanced Manager Permissions
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <PermissionToggle
                        label="Modify Sales"
                        value={permissionsForm.can_modify_sales}
                        onChange={(value) => setPermissionsForm({...permissionsForm, can_modify_sales: value})}
                        description="Edit existing sales transactions"
                      />
                      
                      <PermissionToggle
                        label="Delete Sales"
                        value={permissionsForm.can_delete_sales}
                        onChange={(value) => setPermissionsForm({...permissionsForm, can_delete_sales: value})}
                        description="Remove sales records"
                      />
                      
                      <PermissionToggle
                        label="Modify Purchases"
                        value={permissionsForm.can_modify_purchases}
                        onChange={(value) => setPermissionsForm({...permissionsForm, can_modify_purchases: value})}
                        description="Edit purchase orders"
                      />
                      
                      <PermissionToggle
                        label="Delete Purchases"
                        value={permissionsForm.can_delete_purchases}
                        onChange={(value) => setPermissionsForm({...permissionsForm, can_delete_purchases: value})}
                        description="Remove purchase records"
                      />
                      
                      <PermissionToggle
                        label="Manage Suppliers"
                        value={permissionsForm.can_manage_suppliers}
                        onChange={(value) => setPermissionsForm({...permissionsForm, can_manage_suppliers: value})}
                        description="Add and manage supplier information"
                      />
                      
                      <PermissionToggle
                        label="Manage Customers"
                        value={permissionsForm.can_manage_customers}
                        onChange={(value) => setPermissionsForm({...permissionsForm, can_manage_customers: value})}
                        description="Add and manage customer data"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPermissionsModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePermissions}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Permissions
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EmployeeManagementPage;
