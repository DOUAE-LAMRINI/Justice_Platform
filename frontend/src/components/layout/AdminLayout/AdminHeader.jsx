import React, { useState } from 'react';
import './AdminHeader.css';
import { FiMenu, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import profileImg from '../../../assets/images/judge.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const AdminHeader = ({ onMenuToggle, sidebarCollapsed }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Send logout request to server
      await axios.post('http://localhost:5000/api/admin/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      // 2. Clear local data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      // 3. Show notification
      toast.success('Déconnexion réussie. À bientôt !', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // 4. Redirect to login page after delay
      setTimeout(() => {
        navigate('/admin/login');
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      
      // If unauthorized (token expired/invalid), clear storage anyway
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/admin/login');
      }
      
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors de la déconnexion', {
        position: "top-center"
      });
    }
  };

  return (
    <header className="admin-header">
      {/* Menu Toggle on the left */}
      <div className="header-left">
        <button 
          className="menu-toggle" 
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>
      </div>

      {/* Profile section on the right */}
      <div className="header-right">
        <div className="profile-dropdown-container">
          <button 
            className="profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="Profile menu"
          >
            <img
              src={profileImg}
              alt="Profile"
              className="profile-img"
            />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <button className="dropdown-item">
                <FiUser />
                <span>Profile</span>
                <span className="shortcut">⌘P</span>
              </button>
              <button className="dropdown-item">
                <FiSettings />
                <span>Settings</span>
                <span className="shortcut">⌘S</span>
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item"
                onClick={handleLogout}
              >
                <FiLogOut />
                <span>Logout</span>
                <span className="shortcut">⌘L</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;