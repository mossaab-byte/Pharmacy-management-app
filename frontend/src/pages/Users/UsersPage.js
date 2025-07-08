import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/authContext';
import { Users, UserPlus, Edit, Trash2, Shield, Settings } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'manager'
  });
  const [permissions, setPermissions] = useState({
    can_modify_sales: false,
    can_delete_sales: false,
    can_modify_purchases: false,
    can_delete_purchases: false,
    can_view_reports: true,
    can_manage_suppliers: true,
    can_manage_inventory: false,
    can_manage_customers: false
  });

  const { addNotification } = useNotification();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const mockUsers = [
    {
      id: 1,
      username: 'manager1',
      email: 'manager1@pharmacy.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'manager',
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
      last_login: '2024-01-20T14:22:00Z'
    },
    {
      id: 2,
      username: 'cashier1',
      email: 'cashier1@pharmacy.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'cashier',
      is_active: true,
      created_at: '2024-01-10T09:15:00Z',
      last_login: '2024-01-20T08:45:00Z'
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // Replace with actual API call
      const newUserData = {
        ...newUser,
        id: Date.now(),
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
      };
      
      setUsers([...users, newUserData]);
      setNewUser({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'manager'
      });
      setShowAddModal(false);
      addNotification({
        type: 'success',
        message: 'User added successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to add user'
      });
    }
  };

  const handleEditUser = async () => {
    try {
      // Replace with actual API call
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, ...selectedUser } : user
      );
      
      setUsers(updatedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
      addNotification({
        type: 'success',
        message: 'User updated successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update user'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // Replace with actual API call
      setUsers(users.filter(user => user.id !== userId));
      addNotification({
        type: 'success',
        message: 'User deleted successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to delete user'
      });
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      // Replace with actual API call
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, is_active: !user.is_active } : user
      );
      
      setUsers(updatedUsers);
      addNotification({
        type: 'success',
        message: 'User status updated successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update user status'
      });
    }
  };

  const handlePermissionsUpdate = async () => {
    try {
      // Replace with actual API call
      setShowPermissionsModal(false);
      setSelectedUser(null);
      addNotification({
        type: 'success',
        message: 'Permissions updated successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to update permissions'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'username',
      header: 'Username',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-600">{row.email}</div>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Full Name',
      render: (value, row) => `${row.first_name} ${row.last_name}`
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'pharmacist' ? 'bg-purple-100 text-purple-800' :
          value === 'manager' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value, row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`px-2 py-1 rounded text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setShowEditModal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setShowPermissionsModal(true);
            }}
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteUser(row.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="users-page p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page p-6 max-w-7xl mx-auto">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="users-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage pharmacy staff and their permissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <Users className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Shield className="h-12 w-12 text-green-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Settings className="h-12 w-12 text-orange-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'manager').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <Table 
          columns={columns} 
          data={filteredUsers}
          className="w-full"
        />
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              placeholder="Enter username"
              required
            />
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="Enter email"
              required
            />
            <Input
              label="First Name"
              value={newUser.first_name}
              onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
              placeholder="Enter first name"
              required
            />
            <Input
              label="Last Name"
              value={newUser.last_name}
              onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
              placeholder="Enter last name"
              required
            />
            <Input
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              placeholder="Enter password"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <div className="p-6 space-y-4">
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                value={selectedUser.username}
                onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                placeholder="Enter username"
                required
              />
              <Input
                label="Email"
                type="email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                placeholder="Enter email"
                required
              />
              <Input
                label="First Name"
                value={selectedUser.first_name}
                onChange={(e) => setSelectedUser({...selectedUser, first_name: e.target.value})}
                placeholder="Enter first name"
                required
              />
              <Input
                label="Last Name"
                value={selectedUser.last_name}
                onChange={(e) => setSelectedUser({...selectedUser, last_name: e.target.value})}
                placeholder="Enter last name"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Manage Permissions - ${selectedUser?.username}`}
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can modify sales</label>
              <input
                type="checkbox"
                checked={permissions.can_modify_sales}
                onChange={(e) => setPermissions({...permissions, can_modify_sales: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can delete sales</label>
              <input
                type="checkbox"
                checked={permissions.can_delete_sales}
                onChange={(e) => setPermissions({...permissions, can_delete_sales: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can modify purchases</label>
              <input
                type="checkbox"
                checked={permissions.can_modify_purchases}
                onChange={(e) => setPermissions({...permissions, can_modify_purchases: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can delete purchases</label>
              <input
                type="checkbox"
                checked={permissions.can_delete_purchases}
                onChange={(e) => setPermissions({...permissions, can_delete_purchases: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can view reports</label>
              <input
                type="checkbox"
                checked={permissions.can_view_reports}
                onChange={(e) => setPermissions({...permissions, can_view_reports: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can manage suppliers</label>
              <input
                type="checkbox"
                checked={permissions.can_manage_suppliers}
                onChange={(e) => setPermissions({...permissions, can_manage_suppliers: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can manage inventory</label>
              <input
                type="checkbox"
                checked={permissions.can_manage_inventory}
                onChange={(e) => setPermissions({...permissions, can_manage_inventory: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Can manage customers</label>
              <input
                type="checkbox"
                checked={permissions.can_manage_customers}
                onChange={(e) => setPermissions({...permissions, can_manage_customers: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePermissionsUpdate}>
              Update Permissions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
