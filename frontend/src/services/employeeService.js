import { apiClient } from './apiClient';

const employeeService = {
  // Get all employees for the current pharmacy
  getAllEmployees: async () => {
    try {
      const response = await apiClient.get('/users/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get manager permissions for users
  getManagerPermissions: async () => {
    try {
      const response = await apiClient.get('/pharmacy/managers/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching manager permissions:', error);
      throw error;
    }
  },

  // Create a new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await apiClient.post('/users/', employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Update employee basic info
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await apiClient.patch(`/users/${employeeId}/`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  // Update employee permissions (PharmacyUser level)
  updateEmployeePermissions: async (employeeId, permissions) => {
    try {
      const payload = {
        can_manage_inventory: permissions.can_manage_inventory || false,
        can_manage_sales: permissions.can_manage_sales || false,
        can_manage_purchases: permissions.can_manage_purchases || false,
        can_manage_users: permissions.can_manage_users || false,
        can_view_reports: permissions.can_view_reports || false,
        is_manager: permissions.is_manager || false,
      };
      
      const response = await apiClient.patch(`/users/${employeeId}/`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating employee permissions:', error);
      throw error;
    }
  },

  // Create or update manager permissions
  setManagerPermissions: async (employeeId, permissions) => {
    try {
      // First check if manager permissions already exist
      const managers = await this.getManagerPermissions();
      const existingManager = managers.find(m => m.user.id === employeeId || m.user === employeeId);
      
      const payload = {
        user: employeeId,
        can_modify_sales: permissions.can_modify_sales || false,
        can_delete_sales: permissions.can_delete_sales || false,
        can_modify_purchases: permissions.can_modify_purchases || false,
        can_delete_purchases: permissions.can_delete_purchases || false,
        can_view_reports: permissions.can_view_reports || false,
        can_manage_suppliers: permissions.can_manage_suppliers || false,
        can_manage_inventory: permissions.can_manage_inventory || false,
        can_manage_customers: permissions.can_manage_customers || false,
      };

      if (existingManager) {
        // Update existing manager permissions
        const response = await apiClient.patch(`/pharmacy/managers/${existingManager.id}/`, payload);
        return response.data;
      } else {
        // Create new manager permissions
        const response = await apiClient.post('/pharmacy/managers/', payload);
        return response.data;
      }
    } catch (error) {
      console.error('Error setting manager permissions:', error);
      throw error;
    }
  },

  // Delete manager permissions
  removeManagerPermissions: async (managerId) => {
    try {
      await apiClient.delete(`/pharmacy/managers/${managerId}/`);
      return true;
    } catch (error) {
      console.error('Error removing manager permissions:', error);
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (employeeId) => {
    try {
      await apiClient.delete(`/users/${employeeId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  // Get employee details by ID
  getEmployeeById: async (employeeId) => {
    try {
      const response = await apiClient.get(`/users/${employeeId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  // Toggle employee active status
  toggleEmployeeStatus: async (employeeId, isActive) => {
    try {
      const response = await apiClient.patch(`/users/${employeeId}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling employee status:', error);
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/current-user/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Validate permissions for current user
  validateUserPermissions: async () => {
    try {
      const user = await this.getCurrentUser();
      return {
        canManageUsers: user.is_pharmacist || user.can_manage_users,
        isPharmacist: user.is_pharmacist,
        isManager: user.is_manager
      };
    } catch (error) {
      console.error('Error validating permissions:', error);
      return {
        canManageUsers: false,
        isPharmacist: false,
        isManager: false
      };
    }
  }
};

export default employeeService;
