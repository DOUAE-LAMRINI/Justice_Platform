import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EmployeeUsers.css';

const API_BASE_URL = 'http://localhost:5000';

const EmployeeUsers = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    username: '',
    full_name: '',
    full_name_ar: '',
    department: '',
    position: '',
    password: '',
    role: 'employee'
  });

  // Fetch active employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching employees from:', `${API_BASE_URL}/api/admin/employee-users`);
      
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/employee-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      console.log('Response:', data);
      
      if (data.success) {
        setEmployees(data.users);
      } else {
        throw new Error(data.message || 'Failed to load employees');
      }
    } catch (error) {
      console.error('Detailed fetch error:', {
        message: error.message,
        config: error.config,
        response: error.response?.data
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        toast.error('Session expired. Please login again.');
        return;
      }
      
      toast.error(error.response?.data?.message || error.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Fetch deactivated employees
  const fetchDeletedEmployees = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/employee-users/deleted`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setDeletedEmployees(data.users || data.employees || []);
    } catch (error) {
      console.error('Error fetching deleted employees:', error);
      toast.error(error.response?.data?.message || 'Failed to load deactivated employees');
      setDeletedEmployees([]); 
    }
  }, []);

  // Load data
  useEffect(() => {
    fetchEmployees();
    if (showDeactivated) {
      fetchDeletedEmployees();
    }
  }, [showDeactivated, fetchEmployees, fetchDeletedEmployees]);

  // Filter employees
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.full_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  // Add new employee
  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.username || !newEmployee.full_name || !newEmployee.password) {
        toast.error('Username, full name, and password are required');
        return;
      }

      if (newEmployee.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/api/admin/employee-users`,
        newEmployee,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setEmployees([...employees, data.employee]);
      setIsAddModalOpen(false);
      setNewEmployee({
        username: '',
        full_name: '',
        full_name_ar: '',
        department: '',
        position: '',
        password: '',
        role: 'employee'
      });
      toast.success('Employee added successfully');
    } catch (error) {
      console.error('Add employee error:', error);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    }
  };

  // Open edit modal
  const openEditModal = (employee) => {
    setCurrentEmployee({
      ...employee,
      password: '' // Don't show current password
    });
    setIsEditModalOpen(true);
  };

  // Update employee
  const handleUpdateEmployee = async () => {
    setIsUpdating(true);
    try {
      const updateData = {
        ...currentEmployee,
        password: currentEmployee.password || undefined
      };

      const { data } = await axios.put(
        `${API_BASE_URL}/api/admin/employee-users/${currentEmployee.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setEmployees(employees.map(e => e.id === currentEmployee.id ? data.employee : e));
      setIsEditModalOpen(false);
      toast.success('Employee updated successfully');
    } catch (error) {
      console.error('Update employee error:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsUpdating(false);
    }
  };

  // Deactivate employee
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/employee-users/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      const deletedEmployee = employees.find(e => e.id === employeeId);
      setEmployees(employees.filter(e => e.id !== employeeId));
      setDeletedEmployees([...deletedEmployees, {...deletedEmployee, is_deleted: true}]);
      toast.success('Employee deactivated successfully');
      
      await fetchDeletedEmployees();
    } catch (error) {
      console.error('Delete employee error:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate employee');
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore employee
  const handleRestoreEmployee = async (employeeId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/employee-users/${employeeId}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      const restoredEmployee = deletedEmployees.find(e => e.id === employeeId);
      setDeletedEmployees(deletedEmployees.filter(e => e.id !== employeeId));
      setEmployees([...employees, {...restoredEmployee, is_deleted: false}]);
      toast.success('Employee restored successfully');
    } catch (error) {
      console.error('Restore employee error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore employee');
    }
  };

  // Reset password
  const handleResetPassword = async (employeeId) => {
    if (!window.confirm('Reset password to default (username + 123)?')) return;

    setIsResetting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/admin/employee-users/${employeeId}/reset-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (data.newPassword) {
        toast.success(`Password reset to: ${data.newPassword}`);
      } else {
        toast.success('Password reset successfully');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="employee-management-container">
      <div className="header">
        <h1>Employee Management</h1>
        <div className="actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowDeactivated(!showDeactivated);
                if (!showDeactivated) fetchDeletedEmployees();
              }}
            >
              {showDeactivated ? 'Hide Deactivated' : 'Show Deactivated'}
            </button>
            <button 
              className="btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="employees-table-container">
        {isLoading ? (
          <div className="loading">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="no-results">No active employees found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name (FR)</th>
                <th>Full Name (AR)</th>
                <th>Department</th>
                <th>Position</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.username}</td>
                  <td>{employee.full_name}</td>
                  <td>{employee.full_name_ar}</td>
                  <td>{employee.department}</td>
                  <td>{employee.position}</td>
                  <td>
                    <span className={`role-badge ${employee.role}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td>
                    {employee.last_login 
                      ? new Date(employee.last_login).toLocaleString() 
                      : 'Never'}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="icon-btn"
                        onClick={() => openEditModal(employee)}
                        title="Edit"
                        disabled={isDeleting || isResetting || isUpdating}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleResetPassword(employee.id)}
                        title="Reset Password"
                        disabled={isDeleting || isResetting || isUpdating}
                      >
                        {isResetting ? '...' : <Lock size={16} />}
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        disabled={isDeleting || isResetting || isUpdating}
                        title="Deactivate employee"
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
        <div className="deactivated-employees-section">
          <h2>Deactivated Employees</h2>
          {deletedEmployees.length === 0 ? (
            <div className="no-results">No deactivated employees found</div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name (FR)</th>
                  <th>Full Name (AR)</th>
                  <th>Department</th>
                  <th>Deactivated On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.username}</td>
                    <td>{employee.full_name}</td>
                    <td>{employee.full_name_ar}</td>
                    <td>{employee.department}</td>
                    <td>
                      {employee.deleted_at 
                        ? new Date(employee.deleted_at).toLocaleString() 
                        : 'Unknown'}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="icon-btn success"
                          onClick={() => handleRestoreEmployee(employee.id)}
                          title="Restore Employee"
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

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Employee</h3>
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
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name (French) *</label>
                <input
                  type="text"
                  value={newEmployee.full_name}
                  onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name (Arabic) *</label>
                <input
                  type="text"
                  value={newEmployee.full_name_ar}
                  onChange={(e) => setNewEmployee({...newEmployee, full_name_ar: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Department *</label>
                <input
                  type="text"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Password * (min 8 characters)</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
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
                onClick={handleAddEmployee}
                disabled={
                  !newEmployee.username || 
                  !newEmployee.full_name || 
                  !newEmployee.full_name_ar || 
                  !newEmployee.department || 
                  !newEmployee.password || 
                  newEmployee.password.length < 8 || 
                  isDeleting || 
                  isResetting || 
                  isUpdating
                }
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && currentEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Employee</h3>
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
                  value={currentEmployee.username}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, username: e.target.value})}
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name (French) *</label>
                <input
                  type="text"
                  value={currentEmployee.full_name}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, full_name: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name (Arabic) *</label>
                <input
                  type="text"
                  value={currentEmployee.full_name_ar}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, full_name_ar: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Department *</label>
                <input
                  type="text"
                  value={currentEmployee.department}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, department: e.target.value})}
                  required
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={currentEmployee.position}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, position: e.target.value})}
                  disabled={isDeleting || isResetting || isUpdating}
                />
              </div>
              
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentEmployee.password}
                    onChange={(e) => setCurrentEmployee({...currentEmployee, password: e.target.value})}
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
                onClick={handleUpdateEmployee}
                disabled={
                  !currentEmployee.username || 
                  !currentEmployee.full_name || 
                  !currentEmployee.full_name_ar || 
                  !currentEmployee.department || 
                  isDeleting || 
                  isResetting || 
                  isUpdating
                }
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

export default EmployeeUsers;