import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './CitoyenFooter.css';
//import logo from '../../../assets/images/ministry-logo-1.png';

const CitoyenFooter = () => {
  return (
    <footer className="citoyen-footer">
      <div className="footer-container">
        {/* Logo Section 
        <div className="logo-section">
          <img src={logo} alt="وزارة العدل" className="ministry-logo" />
        </div>*/}

        {/* Social Media */}
        <div className="social-section">
          <div className="divider-line"></div>
          <div className="social-icons">
            <a href="https://x.com" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
          </div>
          <div className="divider-line"></div>
        </div>

        {/* Copyright */}
        <div className="copyright-section">
          <p>© {new Date().getFullYear()} وزارة العدل - وجدة. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default CitoyenFooter;