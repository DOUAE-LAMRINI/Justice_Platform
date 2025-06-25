import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminUsers.css';

const API_BASE_URL = 'http://localhost:5000';
const PERMISSION_TEMPLATES = {
  super_admin: {
    dashboard: { read: true, write: true, execute: true },
    users: { read: true, write: true, execute: true },
    inventory: { read: true, write: true, execute: true },
    messages: { read: true, write: true, execute: true },
    ratings: { read: true, write: true, execute: true },
    analytics: { read: true, write: true, execute: true },
    alerts: { read: true, write: true, execute: true },
    settings: { read: true, write: true, execute: true }
  },
  messages_manager: {
    dashboard: { read: true, write: false, execute: false },
    messages: { read: true, write: true, execute: true },
    ratings: { read: true, write: true, execute: true },
    analytics: { read: true, write: false, execute: false }
  },
  inventory_manager: {
    dashboard: { read: true, write: false, execute: false },
    inventory: { read: true, write: true, execute: true },
    analytics: { read: true, write: false, execute: false }
  },
  security_manager: {
    dashboard: { read: true, write: false, execute: false },
    alerts: { read: true, write: true, execute: true },
    analytics: { read: true, write: false, execute: false }
  }
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'messages_manager',
    permissions: JSON.parse(JSON.stringify(PERMISSION_TEMPLATES.messages_manager))
  });

  // Fetch current admin
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/current`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        setCurrentAdmin(response.data.user);
      } catch (error) {
        console.error('Error fetching current admin:', error);
        if (error.response?.status === 401) {
          navigate('/admin/login');
        }
      }
    };

    fetchCurrentAdmin();
  }, [navigate]);

  // Fetch active users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch deactivated users
const fetchDeletedUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/users/deleted`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    setDeletedUsers(response.data.users);
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error
      || error.message 
      || 'Failed to load deactivated users';
    toast.error(errorMessage);
  }
};
  // Load data
  useEffect(() => {
    if (currentAdmin && currentAdmin.role === 'super_admin') {
      fetchUsers();
      if (showDeactivated) {
        fetchDeletedUsers();
      }
    } else {
      setIsLoading(false);
    }
  }, [currentAdmin, showDeactivated]);

  // Filter users
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle role change in form
  const handleRoleChange = (role, isEdit = false) => {
    const template = PERMISSION_TEMPLATES[role] || {};
    
    if (isEdit) {
      setCurrentUser(prev => ({
        ...prev,
        role,
        permissions: JSON.parse(JSON.stringify(template))
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        role,
        permissions: JSON.parse(JSON.stringify(template))
      }));
    }
  };

  // Add new user
  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!newUser.username || !newUser.full_name || !newUser.password) {
        toast.error('Username, full name, and password are required');
        return;
      }

      if (newUser.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/users`,
        {
          username: newUser.username,
          full_name: newUser.full_name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          permissions: newUser.permissions
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setUsers([...users, response.data.user]);
        setIsAddModalOpen(false);
        setNewUser({
          username: '',
          full_name: '',
          email: '',
          password: '',
          role: 'messages_manager',
          permissions: JSON.parse(JSON.stringify(PERMISSION_TEMPLATES.messages_manager))
        });
        toast.success('User added successfully');
      } else {
        toast.error(response.data.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Add user error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to add user');
      } else if (error.request) {
        toast.error('No response from server. Check your connection.');
      } else {
        toast.error('Error setting up request');
      }
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setCurrentUser({
      ...user,
      password: '' // Don't show current password
    });
    setIsEditModalOpen(true);
  };

  // Update user
  const handleUpdateUser = async () => {
    setIsUpdating(true);
    try {
      // Prepare the update data
      const updateData = {
        ...currentUser,
        // Only include password if it's not empty
        password: currentUser.password || undefined
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/users/${currentUser.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setUsers(users.map(u => u.id === currentUser.id ? response.data.user : u));
      setIsEditModalOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update user');
      } else if (error.request) {
        toast.error('No response from server. Check your connection.');
      } else {
        toast.error('Error setting up request');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Deactivate user
  const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to deactivate this user?')) return;

  setIsDeleting(true);
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.data.success) {
      // Update the main users list
      const deletedUser = users.find(u => u.id === userId);
      setUsers(users.filter(u => u.id !== userId));
      // Add to deactivated users list
      setDeletedUsers([...deletedUsers, {...deletedUser, is_deleted: true}]);
      toast.success('User deactivated successfully');
      
      // Refresh the deleted users list
      await fetchDeletedUsers();
    } else {
      toast.error(response.data.message || 'Failed to deactivate user');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error
      || error.message 
      || 'Failed to deactivate user';
    toast.error(`Error: ${errorMessage}`);
    
    if (error.response?.status === 401) {
      navigate('/admin/login');
    }
  } finally {
    setIsDeleting(false);
  }
};

  // Restore user
  const handleRestoreUser = async (userId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/users/${userId}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (response.data.success) {
        // Remove from deactivated list
        const restoredUser = deletedUsers.find(u => u.id === userId);
        setDeletedUsers(deletedUsers.filter(u => u.id !== userId));
        // Add back to active users
        setUsers([...users, {...restoredUser, is_deleted: false}]);
        toast.success('User restored successfully');
      }
    } catch (error) {
      console.error('Restore user error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore user');
    }
  };

  // Reset password
  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password to default (username + 123)?')) return;

    setIsResetting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/users/${userId}/reset-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (response.data.newPassword) {
        toast.success(`Password reset to: ${response.data.newPassword}`);
      } else {
        toast.success('Password reset successfully');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to reset password');
      } else if (error.request) {
        toast.error('No response from server. Check your connection.');
      } else {
        toast.error('Error setting up request');
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Toggle permission
  const togglePermission = (permission, level, isEdit = false) => {
    if (isEdit) {
      setCurrentUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: {
            ...prev.permissions[permission],
            [level]: !prev.permissions[permission][level]
          }
        }
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: {
            ...prev.permissions[permission],
            [level]: !prev.permissions[permission][level]
          }
        }
      }));
    }
  };

  if (!currentAdmin || currentAdmin.role !== 'super_admin') {
    return (
      <div className="unauthorized">
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <div className="header">
        <h1>User Management</h1>
        <div className="actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowDeactivated(!showDeactivated);
                if (!showDeactivated) fetchDeletedUsers();
              }}
            >
              {showDeactivated ? 'Hide Deactivated' : 'Show Deactivated'}
            </button>
            <button 
              className="btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} /> Add User
            </button>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        {isLoading ? (
          <div className="loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-results">No active users found</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.full_name}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.is_deleted && (
                      <span className="status-badge deleted">Deactivated</span>
                    )}
                  </td>
                  <td>
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleString() 
                      : 'Never'}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="icon-btn"
                        onClick={() => openEditModal(user)}
                        title="Edit"
                        disabled={isDeleting || isResetting || isUpdating}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleResetPassword(user.id)}
                        title="Reset Password"
                        disabled={isDeleting || isResetting || isUpdating}
                      >
                        {isResetting ? '...' : <Lock size={16} />}
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'super_admin' || isDeleting || isResetting || isUpdating}
                        title={user.role === 'super_admin' ? "Cannot deactivate super admin" : "Deactivate user"}
                      >
                        {isDeleting ? '...' : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDeactivated && (
        <div className="deactivated-users-section">
          <h2>Deactivated Users</h2>
          {deletedUsers.length === 0 ? (
            <div className="no-results">No deactivated users found</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Deactivated On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.full_name}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {user.deleted_at ? new Date(user.deleted_at).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="icon-btn success"
                          onClick={() => handleRestoreUser(user.id)}
                          title="Restore User"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Admin User</h3>
              <button 
                className="close-btn"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isDeleting || isResetting || isUpdating}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Password * (min 8 characters)</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    minLength="8"
                    disabled={isDeleting || isResetting || isUpdating}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isDeleting || isResetting || isUpdating}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                >
                  <option value="messages_manager">Messages Manager</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="security_manager">Security Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div className="permissions-section">
                <h4>Permissions</h4>
                <div className="permissions-grid">
                  {Object.entries(newUser.permissions).map(([permission, levels]) => (
                    <div key={permission} className="permission-item">
                      <label>{permission.replace('_', ' ')}</label>
                      <div className="permission-levels">
                        {Object.entries(levels).map(([level, value]) => (
                          <label key={level} className="permission-level">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => togglePermission(permission, level)}
                              disabled={isDeleting || isResetting || isUpdating}
                            />
                            {level}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isDeleting || isResetting || isUpdating}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddUser}
                disabled={!newUser.username || !newUser.full_name || !newUser.password || newUser.password.length < 8 || isDeleting || isResetting || isUpdating}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button 
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isDeleting || isResetting || isUpdating}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={currentUser.username}
                  onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                  disabled={currentUser.role === 'super_admin' || isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={currentUser.full_name}
                  onChange={(e) => setCurrentUser({...currentUser, full_name: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={currentUser.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentUser.password}
                    onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                    disabled={isDeleting || isResetting || isUpdating}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isDeleting || isResetting || isUpdating}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  value={currentUser.role}
                  onChange={(e) => handleRoleChange(e.target.value, true)}
                  disabled={currentUser.role === 'super_admin' || isDeleting || isResetting || isUpdating}
                >
                  <option value="messages_manager">Messages Manager</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="security_manager">Security Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div className="permissions-section">
                <h4>Permissions</h4>
                <div className="permissions-grid">
                  {Object.entries(currentUser.permissions).map(([permission, levels]) => (
                    <div key={permission} className="permission-item">
                      <label>{permission.replace('_', ' ')}</label>
                      <div className="permission-levels">
                        {Object.entries(levels).map(([level, value]) => (
                          <label key={level} className="permission-level">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => togglePermission(permission, level, true)}
                              disabled={currentUser.role === 'super_admin' || isDeleting || isResetting || isUpdating}
                            />
                            {level}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isDeleting || isResetting || isUpdating}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpdateUser}
                disabled={!currentUser.username || !currentUser.full_name || isDeleting || isResetting || isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;