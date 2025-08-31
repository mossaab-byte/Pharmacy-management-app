import React, { useState, useEffect } from 'react';
import employeeService from './employeeService';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // New employee form data
    const [newEmployee, setNewEmployee] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        role: '',
        hire_date: new Date().toISOString().split('T')[0],
        salary: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        custom_permissions_enabled: false,
    });

    // Permission options
    const permissionOptions = [
        { key: 'can_view_sales', label: 'View Sales' },
        { key: 'can_create_sales', label: 'Create Sales' },
        { key: 'can_edit_sales', label: 'Edit Sales' },
        { key: 'can_delete_sales', label: 'Delete Sales' },
        { key: 'can_view_purchases', label: 'View Purchases' },
        { key: 'can_create_purchases', label: 'Create Purchases' },
        { key: 'can_edit_purchases', label: 'Edit Purchases' },
        { key: 'can_delete_purchases', label: 'Delete Purchases' },
        { key: 'can_view_inventory', label: 'View Inventory' },
        { key: 'can_manage_inventory', label: 'Manage Inventory' },
        { key: 'can_view_customers', label: 'View Customers' },
        { key: 'can_manage_customers', label: 'Manage Customers' },
        { key: 'can_view_suppliers', label: 'View Suppliers' },
        { key: 'can_manage_suppliers', label: 'Manage Suppliers' },
        { key: 'can_view_reports', label: 'View Reports' },
        { key: 'can_generate_reports', label: 'Generate Reports' },
        { key: 'can_view_finances', label: 'View Finances' },
        { key: 'can_manage_finances', label: 'Manage Finances' },
        { key: 'can_manage_employees', label: 'Manage Employees' },
        { key: 'can_view_dashboard', label: 'View Dashboard' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [employeesData, rolesData, statsData] = await Promise.all([
                employeeService.getEmployees(),
                employeeService.getEmployeeRoles(),
                employeeService.getEmployeeStatistics(),
            ]);
            
            setEmployees(employeesData);
            setRoles(rolesData);
            setStatistics(statsData);
        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await employeeService.createEmployee(newEmployee);
            setSuccess('Employee created successfully!');
            setShowAddForm(false);
            setNewEmployee({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                position: '',
                role: '',
                hire_date: new Date().toISOString().split('T')[0],
                salary: '',
                address: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
                custom_permissions_enabled: false,
            });
            await loadData();
        } catch (err) {
            setError(`Failed to create employee: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (employeeId, newStatus) => {
        try {
            await employeeService.changeEmployeeStatus(employeeId, newStatus);
            setSuccess(`Employee status changed to ${newStatus}`);
            await loadData();
        } catch (err) {
            setError(`Failed to change status: ${err.message}`);
        }
    };

    const handlePermissionsUpdate = async (permissions) => {
        try {
            await employeeService.updateEmployeePermissions(selectedEmployee.id, permissions);
            setSuccess('Permissions updated successfully!');
            setShowPermissionsModal(false);
            await loadData();
        } catch (err) {
            setError(`Failed to update permissions: ${err.message}`);
        }
    };

    const PermissionsModal = () => {
        const [permissions, setPermissions] = useState({});
        const [customEnabled, setCustomEnabled] = useState(false);

        useEffect(() => {
            if (selectedEmployee) {
                setCustomEnabled(selectedEmployee.custom_permissions_enabled);
                // Initialize permissions from employee data
                const currentPermissions = {};
                permissionOptions.forEach(option => {
                    currentPermissions[option.key] = selectedEmployee[option.key] || false;
                });
                setPermissions(currentPermissions);
            }
        }, [selectedEmployee]);

        const handleSubmit = () => {
            handlePermissionsUpdate({
                custom_permissions_enabled: customEnabled,
                permissions: permissions
            });
        };

        if (!selectedEmployee) return null;

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Manage Permissions - {selectedEmployee.user.first_name} {selectedEmployee.user.last_name}</h3>
                        <button onClick={() => setShowPermissionsModal(false)} className="close-btn">&times;</button>
                    </div>
                    <div className="modal-body">
                        <div className="permission-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={customEnabled}
                                    onChange={(e) => setCustomEnabled(e.target.checked)}
                                />
                                Enable Custom Permissions (Override role defaults)
                            </label>
                        </div>
                        
                        {customEnabled && (
                            <div className="permissions-grid">
                                {permissionOptions.map(option => (
                                    <label key={option.key} className="permission-item">
                                        <input
                                            type="checkbox"
                                            checked={permissions[option.key] || false}
                                            onChange={(e) => setPermissions({
                                                ...permissions,
                                                [option.key]: e.target.checked
                                            })}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button onClick={handleSubmit} className="btn btn-primary">Update Permissions</button>
                        <button onClick={() => setShowPermissionsModal(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading">Loading employee data...</div>;

    return (
        <div className="employee-management">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="header">
                <h1>Employee Management</h1>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)} 
                    className="btn btn-primary"
                >
                    {showAddForm ? 'Cancel' : 'Add Employee'}
                </button>
            </div>

            {/* Statistics */}
            <div className="statistics">
                <div className="stat-card">
                    <h3>Total Employees</h3>
                    <p>{statistics.total_employees || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Active</h3>
                    <p>{statistics.active_employees || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Inactive</h3>
                    <p>{statistics.inactive_employees || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Suspended</h3>
                    <p>{statistics.suspended_employees || 0}</p>
                </div>
            </div>

            {/* Add Employee Form */}
            {showAddForm && (
                <div className="add-employee-form">
                    <h2>Add New Employee</h2>
                    <form onSubmit={handleAddEmployee}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={newEmployee.first_name}
                                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={newEmployee.last_name}
                                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={newEmployee.phone}
                                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Position</label>
                                <input
                                    type="text"
                                    value={newEmployee.position}
                                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={newEmployee.role}
                                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hire Date</label>
                                <input
                                    type="date"
                                    value={newEmployee.hire_date}
                                    onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Salary</label>
                                <input
                                    type="number"
                                    value={newEmployee.salary}
                                    onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                value={newEmployee.address}
                                onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                                rows="3"
                            />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Emergency Contact Name</label>
                                <input
                                    type="text"
                                    value={newEmployee.emergency_contact_name}
                                    onChange={(e) => setNewEmployee({...newEmployee, emergency_contact_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Emergency Contact Phone</label>
                                <input
                                    type="tel"
                                    value={newEmployee.emergency_contact_phone}
                                    onChange={(e) => setNewEmployee({...newEmployee, emergency_contact_phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Create Employee</button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employees List */}
            <div className="employees-list">
                <h2>Employees ({employees.length})</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Position</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Hire Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee.id}>
                                    <td>{employee.employee_id}</td>
                                    <td>{employee.user.first_name} {employee.user.last_name}</td>
                                    <td>{employee.user.email}</td>
                                    <td>{employee.position}</td>
                                    <td>{employee.role?.name || 'No Role'}</td>
                                    <td>
                                        <span className={`status status-${employee.employment_status}`}>
                                            {employee.employment_status}
                                        </span>
                                    </td>
                                    <td>{new Date(employee.hire_date).toLocaleDateString()}</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                onClick={() => {
                                                    setSelectedEmployee(employee);
                                                    setShowPermissionsModal(true);
                                                }}
                                                className="btn btn-small btn-secondary"
                                            >
                                                Permissions
                                            </button>
                                            <select
                                                value={employee.employment_status}
                                                onChange={(e) => handleStatusChange(employee.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                                <option value="terminated">Terminated</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPermissionsModal && <PermissionsModal />}
        </div>
    );
};

export default EmployeeManagement;
