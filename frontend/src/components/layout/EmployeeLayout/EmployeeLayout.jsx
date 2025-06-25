import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeHeader } from '../EmployeeHeader/EmployeeHeader'; 
import { EmployeeFooter } from '../EmployeeFooter/EmployeeFooter'; 
import './EmployeeLayout.css';

const EmployeeLayout = () => {
  return (
    <div className="employee-layout-container">
      <EmployeeHeader />
      <div className="employee-content-wrapper">
        <main className="employee-main-content">
          <Outlet />
        </main>
      </div>
      <EmployeeFooter />
    </div>
  );
};

export default EmployeeLayout;