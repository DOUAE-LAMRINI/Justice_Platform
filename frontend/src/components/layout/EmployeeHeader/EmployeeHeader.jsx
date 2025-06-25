import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Mail, Phone } from "lucide-react";
import ministryLogo from "../../../assets/images/ministry-logo.png"; 
import "./EmployeeHeader.css";

const navItems = [
  {
    name: "الرئيسية",
    href: "/employee",
  },
  {
    name: "الدليل",
    href: "/employee/guide",
  },
  {
    name: "الطلبات",
    href: "/employee/order",
  },
  {
    name: "التقييم",
    href: "/employee/rate",
  },
];

export function EmployeeHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/employee/login");
  };

  return (
    <header className="employee-header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="header-container">
          <div className="contact-info">
            <div className="contact-item">
              <Mail className="icon" />
              <span>contact@justice-oujda.gov.ma</span>
            </div>
            <div className="contact-item">
              <Phone className="icon" />
              <span>0536-68-21-10</span>
            </div>
          </div>
          
          <div className="kingdom-title">
            <span className="al-mamlaka">المملكة</span>
            <span className="al-maghribia">المغربية</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="header-container">
          <Link to="/employee" className="logo-link">
            <img 
              src={ministryLogo} 
              alt="شعار وزارة العدل" 
              className="logo-image"
            />
          </Link>

          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`nav-link ${
                  location.pathname === item.href ? "active" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button 
              onClick={handleLogout} 
              className="logout-button desktop-only"
            >
              تسجيل الخروج
            </button>

            <button 
              onClick={() => setOpen(true)} 
              className="mobile-menu-button"
            >
              <Menu className="icon" />
              <span className="sr-only">فتح القائمة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <button 
              className="mobile-menu-close"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            
            <nav className="mobile-nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`mobile-nav-link ${
                    location.pathname === item.href ? "active" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <button 
                onClick={handleLogout} 
                className="mobile-logout-button"
              >
                تسجيل الخروج
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}