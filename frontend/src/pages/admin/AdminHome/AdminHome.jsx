import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';

export default function AdminWelcome() {
  const navigate = useNavigate();

  return (
    <div className="admin-welcome-container">
      <div className="admin-welcome-content">
        <h1 className="admin-welcome-title">Welcome to the Admin Dashboard</h1>
        <p className="admin-welcome-subtitle">Manage your justice platform efficiently</p>
        
        <div className="admin-welcome-buttons">
          <button 
            className="welcome-button employee-button"
            onClick={() => navigate('/employee')}
          >
            Return to Employee Interface
          </button>
          <button 
            className="welcome-button citizen-button"
            onClick={() => navigate('/citoyen')}
          >
            Return to Citizen Interface
          </button>
        </div>
      </div>
    </div>
  );
}