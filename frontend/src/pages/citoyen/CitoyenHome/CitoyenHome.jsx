import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CitoyenHome.css';

import justice4 from '../../../assets/images/justice_3.jpg';
import justice5 from '../../../assets/images/justice_4.jpg';
import justice6 from '../../../assets/images/justice_5.jpg';

const CitoyenHome = () => {
  const navigate = useNavigate();
  const justiceImages = [  justice4, justice5, justice6];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigateImages = (direction) => {
    setCurrentImageIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % justiceImages.length 
        : (prev - 1 + justiceImages.length) % justiceImages.length
    );
  };

  return (
    <div className="citoyen-home-jp">
      <div className="citoyen-home-jp__hero" 
        style={{
          backgroundImage: `url(${justiceImages[currentImageIndex]})`
        }}
      >
        <div className="citoyen-home-jp__blur-overlay"></div>


        <button 
          className="citoyen-home-jp__nav-btn citoyen-home-jp__nav-btn--prev" 
          onClick={() => navigateImages('prev')}
          aria-label="Previous image"
        >
          ‹
        </button>

        <div className="citoyen-home-jp__main-content">
          <h1 className="citoyen-home-jp__heading">
            <span className="citoyen-home-jp__heading-main">المنصة العدلية الرقمية</span>
            <span className="citoyen-home-jp__heading-sub">محاكم جهة الشرق</span>
          </h1>
          <p className="citoyen-home-jp__desc">
            منصة إلكترونية متكاملة للتفاعل مع الخدمات القضائية بشكل آمن وسريع
          </p>
          <div className="citoyen-home-jp__btn-group">
            <button className="citoyen-home-jp__action-btn citoyen-home-jp__action-btn--main" onClick={() => navigate('/citoyen/contact')}>
              تواصل معنا  
            </button>
            <button className="citoyen-home-jp__action-btn citoyen-home-jp__action-btn--alt" onClick={() => navigate('/citoyen/guide')}>
              تعرف على المنصة
            </button>
          </div>
        </div>

        <button 
          className="citoyen-home-jp__nav-btn citoyen-home-jp__nav-btn--next" 
          onClick={() => navigateImages('next')}
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default CitoyenHome;