import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import ministryLogo from "../../../assets/images/ministry-logo-2.png"; 
import "./EmployeeFooter.css";

export function EmployeeFooter() {
  return (
    <footer className="employee-footer">
      <div className="employee-footer-container">
        <div className="employee-footer-grid">
          {/* Ministry Info Section */}
          <div className="employee-footer-section">
            <div className="logo-wrapper">
              <img
                src={ministryLogo}
                alt="شعار وزارة العدل المغربية"
                className="ministry-logo"
              />
              <div className="logo-badge">
                <span>وزارة العدل</span>
                <span>المملكة المغربية</span>
              </div>
            </div>
            <div className="ministry-description">
              <p>
                المديرية الفرعية الإقليمية لوزارة العدل بوجدة مؤسسة حكومية تابعة لوزارة العدل المغربية،
                تعمل تحت الإشراف المباشر لوزير العدل. تكرس جهودها لتقديم خدمات العدالة وفق أعلى معايير
                الجودة والشفافية، وتسهيل الوصول إليها في المنطقة الشرقية من المملكة، مع الحفاظ على مبادئ
                السيادة القانونية واستقلال القضاء.
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="employee-footer-section">
            <h3 className="section-title">
              <span className="title-underline">روابط الخدمات</span>
            </h3>
            <ul className="footer-links-arabic">
              <li>
                <Link to="/employee" className="footer-link">
                  <span className="link-content">
                    <span className="link-icon">⎋</span>
                    الصفحة الرئيسية
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/employee/guide" className="footer-link">
                  <span className="link-content">
                    <span className="link-icon">⎋</span>
                    الدليل الإجرائي
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/employee/order" className="footer-link">
                  <span className="link-content">
                    <span className="link-icon">⎋</span>
                    نظام الطلبات
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/employee/rate" className="footer-link">
                  <span className="link-content">
                    <span className="link-icon">⎋</span>
                    تقييم الخدمات
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="employee-footer-section">
            <h3 className="section-title">
              <span className="title-underline">اتصل بنا</span>
            </h3>
            <ul className="contact-info-arabic">
              <li className="contact-item">
                <MapPin className="contact-icon" />
                <address>
                  شارع محمد الخامس، رقم 12<br />
                  وجدة، المغرب
                </address>
              </li>
              <li className="contact-item">
                <Phone className="contact-icon" />
                <span>0536-68-21-10</span>
              </li>
              <li className="contact-item">
                <Mail className="contact-icon" />
                <span>contact@justice-oujda.gov.ma</span>
              </li>
              <li className="contact-item">
                <Globe className="contact-icon" />
                <span>www.justice.gov.ma</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-divider"></div>
        <div className="footer-copyright">
          <p>
            © {new Date().getFullYear()} وزارة العدل - المديرية الفرعية الإقليمية بوجدة<br />
            جميع الحقوق محفوظة لحكومة المملكة المغربية
          </p>
        </div>
      </div>
    </footer>
  );
}