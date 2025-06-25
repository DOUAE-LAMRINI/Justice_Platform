import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'; // Added AlertCircle import
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Simple translation system
  const translations = {
    en: {
      title: "Admin Dashboard",
      subtitle: "Enter your credentials to access the dashboard",
      username: "Username",
      password: "Password",
      language: "Language",
      english: "English",
      french: "French",
      arabic: "Arabic",
      loginButton: "Login",
      poweredBy: "Powered by Morocco Ministry Of Justice",
      loginError: "Invalid username or password",
      accountBlocked: "Account temporarily blocked. Please try again in {seconds} seconds.",
      tooManyAttempts: "Too many failed attempts. Please wait {seconds} seconds before trying again."
    },
    fr: {
      title: "Tableau de Bord Admin",
      subtitle: "Entrez vos identifiants pour accéder au tableau de bord",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      language: "Langue",
      english: "Anglais",
      french: "Français",
      arabic: "Arabe",
      loginButton: "Connexion",
      poweredBy: "Propulsé par l'Application du Ministère du Maroc",
      loginError: "Nom d'utilisateur ou mot de passe incorrect",
      accountBlocked: "Compte temporairement bloqué. Veuillez réessayer dans {seconds} secondes.",
      tooManyAttempts: "Trop de tentatives échouées. Veuillez patienter {seconds} secondes avant de réessayer."
    },
    ar: {
      title: "لوحة تحكم المسؤول",
      subtitle: "أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      language: "اللغة",
      english: "الإنجليزية",
      french: "الفرنسية",
      arabic: "العربية",
      loginButton: "تسجيل الدخول",
      poweredBy: "مدعوم من تطبيق وزارة المغرب",
      loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
      accountBlocked: "الحساب مؤقتًا محظور. يرجى المحاولة مرة أخرى بعد {seconds} ثانية.",
      tooManyAttempts: "عدد كبير جدًا من المحاولات الفاشلة. يرجى الانتظار {seconds} ثانية قبل المحاولة مرة أخرى."
    }
  };

  const t = translations[language];
  const isRtl = language === 'ar';

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/home');
    }
  }, [navigate]);

  // Handle countdown when blocked
  useEffect(() => {
    let timer;
    if (isBlocked && blockTimeLeft > 0) {
      timer = setInterval(() => {
        setBlockTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (blockTimeLeft === 0 && isBlocked) {
      setIsBlocked(false);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimeLeft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const response = await axios.post('http://localhost:5000/api/admin/login', { // Add full URL
      username: formData.username,
      password: formData.password,
      language
    });

    if (response.data.success) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      navigate('/admin/home');
    } else {
      setError(response.data.message || t.loginError);
      
      if (response.data.blocked) {
        setIsBlocked(true);
        setBlockTimeLeft(response.data.blockTimeLeft || 20);
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    setError(err.response?.data?.message || t.loginError);
    
    if (err.response?.data?.blocked) {
      setIsBlocked(true);
      setBlockTimeLeft(err.response.data.blockTimeLeft || 20);
    }
  } finally {
    setIsLoading(false);
  }
};

  const changeLanguage = (lng) => {
    setLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  // Character rain animation
  useEffect(() => {
    const container = document.querySelector('.raining-characters');
    if (!container) return; // Safety check
    
    const chars = "01";

    const createRain = () => {
      const element = document.createElement('span');
      element.textContent = chars[Math.floor(Math.random() * chars.length)];
      element.style.left = Math.random() * 100 + 'vw';
      element.style.animationDuration = (Math.random() * 3 + 2) + 's';
      element.style.opacity = Math.random() * 0.3 + 0.1;
      container.appendChild(element);
      
      setTimeout(() => {
        element.remove();
      }, 5000);
    };

    const interval = setInterval(createRain, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-container">
      <div className="raining-characters"></div>
      
      <div className={`login-card ${isRtl ? 'rtl' : ''}`}>
        <div className="login-header">
          <Lock className="lock-icon" />
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>
              {error.includes('{seconds}') 
                ? error.replace('{seconds}', blockTimeLeft)
                : error}
            </span>
          </div>
        )}

        {isBlocked && (
          <div className="blocked-message">
            <AlertCircle size={18} />
            <span>
              {t.tooManyAttempts.replace('{seconds}', blockTimeLeft)}
            </span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t.username}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isBlocked || isLoading}
            />
          </div>

          <div className="form-group">
            <label>{t.password}</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isBlocked || isLoading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={isBlocked || isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t.language}</label>
            <div className="language-tabs">
              <button 
                type="button"
                className={language === 'en' ? 'active' : ''}
                onClick={() => changeLanguage('en')}
                disabled={isLoading}
              >
                {t.english}
              </button>
              <button 
                type="button"
                className={language === 'fr' ? 'active' : ''}
                onClick={() => changeLanguage('fr')}
                disabled={isLoading}
              >
                {t.french}
              </button>
              <button 
                type="button"
                className={language === 'ar' ? 'active' : ''}
                onClick={() => changeLanguage('ar')}
                disabled={isLoading}
              >
                {t.arabic}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isBlocked || isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              t.loginButton
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>{t.poweredBy}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;