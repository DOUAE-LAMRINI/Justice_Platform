import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

import logo from '../assets/images/ministry-logo-1.png';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="justice-homepage" dir="rtl" lang="ar">
      <div className="justice-homepage__overlay" />
      
      <header className="justice-homepage__header">
        <img 
          src={logo} 
          alt="شعار الوزارة" 
          className="justice-homepage__logo" 
          draggable="false"
        />
        <h2 className="justice-homepage__sub-title">
          المديرية الفرعية الإقليمية لوزارة العدل وجدة
        </h2>
      </header>

      <main className="justice-homepage__content">
        <h1 className="justice-homepage__main-title">
          <span className="white-text"> وزارة العدل في خدمة المواطن    </span> 
        </h1>

        <div className="justice-homepage__buttons">
          <button
            className="justice-homepage__button"
            onClick={() => window.open('/citoyen', '_blank')}
            aria-label="الانتقال إلى صفحة المواطن"
          >
            مواطن
          </button>

          <button
            className="justice-homepage__button"
            onClick={() => navigate('/employee/login')}
            aria-label="الانتقال إلى صفحة الموظف"
          >
            موظف
          </button>
        </div>
      </main>

      <footer className="justice-homepage__footer">
        <div className="footer-text">
          <p>&copy; {new Date().getFullYear()}  وزارة العدل جميع الحقوق محفوظة   </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;