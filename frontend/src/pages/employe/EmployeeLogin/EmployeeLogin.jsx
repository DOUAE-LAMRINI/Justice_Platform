import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaExclamationCircle, 
  FaSpinner, 
  FaLock, 
  FaUser, 
  FaChevronLeft,
} from 'react-icons/fa';
import './EmployeeLogin.css';

function EmployeeLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (attempts >= 3) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [attempts, navigate]);

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await axios.post('http://localhost:5000/api/employee/login', 
      { username: username.trim(), password: password.trim() },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.success) {
      // Store token and user data with consistent keys
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
      navigate('/employee');
    } else {
      throw new Error(response.data.message || "بيانات الدخول غير صحيحة");
    }
  } catch (error) {
    setAttempts(prev => prev + 1);
    setError(error.response?.data?.message || error.message || "حدث خطأ في الاتصال بالخادم");
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = () => {
    alert('Contactez l\'administrateur système:\nEmail: admin@juridique.ma\nTéléphone: +212 6 16 40 34 54');
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-overlay"></div>
      
      <div className="employee-login-card">
        {/* Form Side (Left) */}
        <div className="employee-form-side">          
          <div className="employee-form-header">            
            <div className="employee-form-title">
              <h2>تسجيل الدخول</h2>
              <p>الرجاء إدخال بيانات الاعتماد الخاصة بك</p>
            </div>
          </div>

          {error && (
            <div className="employee-alert">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="employee-form">
            <div className="employee-input-group">
              <label>اسم المستخدم</label>
              <div className="employee-input-wrapper">
                <FaUser className="employee-input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="employee-input"
                  disabled={attempts >= 3 || loading}
                />
              </div>
            </div>

            <div className="employee-input-group">
              <label>كلمة المرور</label>
              <div className="employee-input-wrapper">
                <FaLock className="employee-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="employee-input"
                  disabled={attempts >= 3 || loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="employee-submit-btn"
              disabled={loading || attempts >= 3}
            >
              {loading ? (
                <FaSpinner className="employee-spinner" />
              ) : (
              <span>تسجيل الدخول</span>
              )}
            </button>
          </form>

          <div className="employee-form-footer">
            <button onClick={handleForgotPassword} className="employee-footer-link">
              نسيت كلمة المرور؟
            </button>
            <button onClick={handleReturnHome} className="employee-footer-link">
              <FaChevronLeft className="back-icon" />
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>

        {/* Image Side (Right) */}
        <div className="employee-image-side">
          <div className="employee-image-overlay"></div>
          <div className="employee-welcome-content">
            <div className="employee-welcome-message">
              <h3> صفحة الموظفين</h3>
              <p> المديرية الفرعية الإقليمية لوزارة العدل وجدة</p>
            </div>
            <div className="employee-copyright">
              &copy; {new Date().getFullYear()} وزارة العدل جميع الحقوق محفوظة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLogin;