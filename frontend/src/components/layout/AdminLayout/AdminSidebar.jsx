import React from 'react';
import './AdminSidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiShoppingCart, 
  FiMail, FiStar, 
  FiUser, FiSettings, FiLogOut, 
  FiMoon, FiSun, FiGrid,
  FiDatabase, FiUserCheck, FiUserPlus, FiLock
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminSidebar = ({ isCollapsed, onToggleDarkMode, darkMode }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });

      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      toast.success('Déconnexion réussie. À bientôt !', {
        position: "top-center",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate('/admin/login');
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/admin/login');
      }
      toast.error(error.response?.data?.message || 'Erreur lors de la déconnexion');
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <FiGrid className="dashboard-icon" />
        <h2 className="sidebar-title">Admin Dashboard</h2>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-section">
          <p className="section-label">Main</p>
          <NavLink to="/admin/home"><FiHome /> <span>Home</span></NavLink>
        </div>

        <div className="menu-section">
          <p className="section-label">Stock</p>
          <NavLink to="/admin/inventory"><FiDatabase /> <span>Inventory</span></NavLink>
          <NavLink to="/admin/orders"><FiShoppingCart /> <span>Orders</span></NavLink>
        </div>      

        <div className="menu-section">
          <p className="section-label">Communication</p>
          <NavLink to="/admin/messages"><FiMail /> <span>User Messages</span></NavLink>
          <NavLink to="/admin/ratings"><FiStar /> <span>Ratings</span></NavLink>
        </div>

        <div className="menu-section">
          <p className="section-label">Security</p>
          <NavLink to="/admin/security"><FiLock /> <span>Stock Security</span></NavLink>
        </div>

        <div className="menu-section">
          <p className="section-label">Administration</p>
          <NavLink to="/admin/users"><FiUserCheck /> <span>Admin-dash Users</span></NavLink>
          <NavLink to="/admin/employee-users"><FiUserPlus /> <span>Employee-dash Users</span></NavLink>
          <NavLink to="/admin/profile"><FiUser /> <span>Admin Profile</span></NavLink>
          <NavLink to="/admin/settings"><FiSettings /> <span>Settings</span></NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={onToggleDarkMode}>
          {darkMode ? <FiSun /> : <FiMoon />}
          <span>{darkMode ? 'Light' : 'Dark'}</span>
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;