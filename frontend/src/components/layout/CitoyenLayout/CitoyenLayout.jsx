import React from 'react';
import { Outlet } from 'react-router-dom';
import CitoyenHeader from '../CitoyenHeader/CitoyenHeader'; 
import CitoyenFooter from '../CitoyenFooter/CitoyenFooter'; 
import './CitoyenLayout.css';

const CitoyenLayout = () => {
  return (
    <div className="citoyen-layout">
      <CitoyenHeader />
      <main className="main-content">
        <Outlet />
      </main>
      <CitoyenFooter />
    </div>
  );
};

export default CitoyenLayout;