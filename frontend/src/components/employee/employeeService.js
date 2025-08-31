// Employee API service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

class EmployeeService {
    // Helper method to get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    // Handle API responses
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'API Error');
        }
        return response.json();
    }

    // Get all employees
    async getEmployees() {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse(response);
    }

    // Get employee by ID
    async getEmployee(id) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/${id}/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse(response);
    }

    // Create new employee
    async createEmployee(employeeData) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(employeeData),
        });
        return this.handleResponse(response);
    }

    // Update employee
    async updateEmployee(id, employeeData) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/${id}/`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(employeeData),
        });
        return this.handleResponse(response);
    }

    // Update employee permissions
    async updateEmployeePermissions(id, permissionsData) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/${id}/update_permissions/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(permissionsData),
        });
        return this.handleResponse(response);
    }

    // Change employee status
    async changeEmployeeStatus(id, status) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/${id}/change_status/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ status }),
        });
        return this.handleResponse(response);
    }

    // Get employee activity logs
    async getEmployeeActivityLogs(id) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/${id}/activity_logs/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse(response);
    }

    // Get all employee roles
    async getEmployeeRoles() {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/roles/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse(response);
    }

    // Get employee statistics
    async getEmployeeStatistics() {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/statistics/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse(response);
    }

    // Delete employee
    async deleteEmployee(id) {
        const response = await fetch(`${API_BASE_URL}/api/employee/api/employees/${id}/`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'Delete failed');
        }
        
        return response.status === 204 ? {} : response.json();
    }

    // Get current user info
    async getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Validate user permissions
    async validateUserPermissions() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return { hasAccess: false, isPharmacist: false };
            }

            return {
                hasAccess: user.is_pharmacist || (user.employee_profile?.can_manage_employees),
                isPharmacist: user.is_pharmacist,
                user: user
            };
        } catch (error) {
            console.error('Error validating permissions:', error);
            return { hasAccess: false, isPharmacist: false };
        }
    }
}

export default new EmployeeService();
