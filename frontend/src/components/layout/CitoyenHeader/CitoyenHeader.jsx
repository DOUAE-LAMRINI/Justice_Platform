import React from 'react';
import { Link, useLocation } from 'react-router-dom';
//import { FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import './CitoyenHeader.css';
import logo from '../../../assets/images/ministry-logo.png';

const CitoyenHeader = () => {
  const location = useLocation();

  return (
    <>
      {/* Barre supérieure - Contact et réseaux sociaux */}
      <div className="top-info-bar">
        <div className="container">
          <div className="contact-phone">
            <span>0536 538 116</span>
            <span>justice.oujda@gmail.com</span>
          </div>{/*
          <div className="social-icons">
            <a href="https://x.com" aria-label="Twitter"><FaTwitter className="social-icon" /></a>
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebookF className="social-icon" /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedinIn className="social-icon" /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram className="social-icon" /></a>
          </div> */}
        </div>
      </div>

      <div className="main-header-bar">
        <div className="container">
          <div className="header-button">
            <Link to="/" className="choice-btn">صفحة الاختيارات</Link>
          </div>

          {/* Menu*/}
          <nav className="main-nav">
            <ul className="nav-menu">
              <li className={location.pathname === '/citoyen' ? 'active' : ''}>
                <Link to="/citoyen">الرئيسية</Link>
              </li>
              <li className={location.pathname.includes('/tribunaux') ? 'active' : ''}>
                <Link to="/citoyen/tribunaux">محاكم جهةالشرق</Link>
              </li>
              <li className={location.pathname === '/citoyen/procedures' ? 'active' : ''}>
                <Link to="/citoyen/guide">الدليل </Link>
              </li>
              <li className={location.pathname === '/citoyen/consultation' ? 'active' : ''}>
                <Link to="/citoyen/consultation">استشارة قانونية</Link>
              </li>
              <li className={location.pathname === '/citoyen/contact' ? 'active' : ''}>
                <Link to="/citoyen/contact">الاتصال  </Link>
              </li>
            </ul>
          </nav>

          {/* Logo  */}
          <div className="logo-container">
            <img src={logo} alt="وزارة العدل - وجدة" className="logo" />
          </div>
        </div>
      </div>
    </>
  );
};

export default CitoyenHeader;