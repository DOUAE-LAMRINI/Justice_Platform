import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CitoyenContact.css';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const CitoyenContact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    inquiryType: 'general',
    message: ''
  });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize map when info tab is active
  useEffect(() => {
    if (activeTab === 'info' && !mapInstanceRef.current) {
      const initMap = () => {
        // Coordinates for Oujda, Morocco (example coordinates)
        const oujdaCoords = [34.681962, -1.908583];
        
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false
        }).setView(oujdaCoords, 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
        
        // Custom icon
        const customIcon = L.icon({
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
          shadowSize: [41, 41]
        });

        // Add marker for the justice department location
        L.marker(oujdaCoords, {icon: customIcon})
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="text-align: right; direction: rtl;">
              <strong>المديرية الفرعية الإقليمية لوزارة العدل</strong><br>
              شارع محمد الخامس، وجدة
            </div>
          `)
          .openPopup();
      };

      // Small delay to ensure the map container is rendered
      const timer = setTimeout(initMap, 100);
      
      return () => clearTimeout(timer);
    }

    // Cleanup function to remove map when component unmounts or tab changes
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  const resetServerError = useCallback(() => {
    if (serverError) {
      setServerError(null);
    }
  }, [serverError]);

  useEffect(() => {
    resetServerError();
  }, [formData, resetServerError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'يجب إدخال الاسم الكامل';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'يجب أن يحتوي الاسم على الأقل حرفين';
    }
    
    if (!formData.email) {
      newErrors.email = 'يجب إدخال البريد الإلكتروني';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'يجب إدخال رقم الهاتف';
    } else if (!/^[0-9]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'يجب أن يحتوي على الأقل 10 أرقام';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'يجب إدخال الموضوع';
    } else if (formData.subject.trim().length < 2) {
      newErrors.subject = 'يجب أن يحتوي على الأقل حرفين';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'يجب إدخال الرسالة';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'يجب أن تحتوي على الأقل 10 أحرف';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitToBackend = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/contact/submit', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'ar'
        },
        timeout: 10000
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Server error');
      }
      
      return response.data;
    } catch (error) {
      let errorMessage = 'فشل الإتصال بالخادم. يرجى المحاولة لاحقاً';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'لا يوجد اتصال بالخادم. يرجى التحقق من اتصال الشبكة';
      }
      
      throw new Error(errorMessage);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      const response = await submitToBackend({
        ...formData,
        ipAddress: window.clientIP || '', 
        userAgent: navigator.userAgent
      });
      
      if (response.success) {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          inquiryType: 'general',
          message: ''
        });
        setIsSubmitted(true);
      }
    } catch (error) {
      setServerError(error.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setServerError(null);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: 'العنوان',
      content: [
        'المديرية الفرعية الإقليمية لوزارة العدل',
        'شارع محمد الخامس',
        'وجدة، المملكة المغربية'
      ]
    },
    {
      icon: <FaPhone />,
      title: 'الهاتف',
      content: [
        'الهاتف: 0536-68-21-10',
        'الفاكس: 0536-68-21-11',
        'ساعات العمل: 8:30 - 16:30 (الإثنين - الجمعة)'
      ]
    },
    {
      icon: <FaEnvelope />,
      title: 'البريد الإلكتروني',
      content: [
        'البريد العام: contact@justice-oujda.gov.ma',
        'الدعم الفني: support@justice-oujda.gov.ma',
        'الاستفسارات القانونية: legal@justice-oujda.gov.ma'
      ]
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'استفسار عام' },
    { value: 'complaint', label: 'شكوى' },
    { value: 'suggestion', label: 'اقتراح' },
    { value: 'technical', label: 'مشكلة تقنية' },
    { value: 'other', label: 'أخرى' }
  ];

  return (
    <div className="citoyen-contact-container">
      <h1 className="citoyen-contact-title">اتصل بنا</h1>
      <p className="citoyen-contact-subtitle">
        نحن هنا للإجابة على استفساراتك ومساعدتك في الوصول إلى خدمات العدالة
      </p>

      <div className="citoyen-contact-tabs">
        <div className="citoyen-tab-buttons">
          <button 
            className={`citoyen-tab-button ${activeTab === 'form' ? 'citoyen-tab-active' : ''}`}
            onClick={() => setActiveTab('form')}
            aria-pressed={activeTab === 'form'}
            id="form-tab"
          >
            نموذج الاتصال
          </button>
          <button 
            className={`citoyen-tab-button ${activeTab === 'info' ? 'citoyen-tab-active' : ''}`}
            onClick={() => setActiveTab('info')}
            aria-pressed={activeTab === 'info'}
            id="info-tab"
          >
            معلومات الاتصال
          </button>
        </div>

        <div 
          id="citoyen-contact-form-tab"
          className={`citoyen-tab-content ${activeTab === 'form' ? 'citoyen-tab-show' : ''}`}
          role="tabpanel"
        >
          {isSubmitted ? (
            <div className="citoyen-success-message">
              <FaCheckCircle className="citoyen-success-icon" />
              <h3>تم إرسال رسالتك بنجاح</h3>
              <p>شكرًا لتواصلك معنا. سنقوم بالرد على استفسارك في أقرب وقت ممكن.</p>
              <button 
                onClick={resetForm} 
                className="citoyen-reset-button"
                aria-label="إرسال رسالة أخرى"
              >
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit} 
              className="citoyen-contact-form" 
              noValidate
              aria-label="نموذج الاتصال"
            >
              {serverError && (
                <div className="citoyen-server-error">
                  <FaExclamationCircle />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="citoyen-form-grid">
                <div className="citoyen-form-group">
                  <label htmlFor="fullName">الاسم الكامل</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <span id="fullName-error" className="citoyen-error-message">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="citoyen-form-group">
                  <label htmlFor="email">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="أدخل بريدك الإلكتروني"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <span id="email-error" className="citoyen-error-message">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="citoyen-form-group">
                  <label htmlFor="phone">رقم الهاتف</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="أدخل رقم هاتفك"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <span id="phone-error" className="citoyen-error-message">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="citoyen-form-group">
                  <label htmlFor="subject">الموضوع</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="أدخل موضوع الرسالة"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    autoComplete="off"
                  />
                  {errors.subject && (
                    <span id="subject-error" className="citoyen-error-message">
                      {errors.subject}
                    </span>
                  )}
                </div>
              </div>

              <div className="citoyen-form-group">
                <fieldset className="citoyen-fieldset">
                  <legend>نوع الاستفسار</legend>
                  <div className="citoyen-radio-group">
                    {inquiryTypes.map((type) => (
                      <label key={type.value} className="citoyen-radio-label">
                        <input
                          type="radio"
                          name="inquiryType"
                          value={type.value}
                          checked={formData.inquiryType === type.value}
                          onChange={handleChange}
                          className="citoyen-radio-input"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="citoyen-form-group">
                <label htmlFor="message">الرسالة</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="اكتب رسالتك هنا..."
                  rows="5"
                  className="citoyen-form-textarea"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  autoComplete="off"
                ></textarea>
                <p className="citoyen-form-description">
                  يرجى تقديم جميع التفاصيل المتعلقة باستفسارك لمساعدتنا في الرد بشكل أفضل.
                </p>
                {errors.message && (
                  <span id="message-error" className="citoyen-error-message">
                    {errors.message}
                  </span>
                )}
              </div>

              <div className="citoyen-form-notice">
                <FaExclamationCircle className="citoyen-notice-icon" />
                <h4>ملاحظة هامة</h4>
                <p>
                  جميع المعلومات المقدمة في هذا النموذج سيتم التعامل معها بسرية تامة وفقًا لسياسة الخصوصية الخاصة بنا.
                </p>
              </div>

              <div className="citoyen-form-submit">
                <button 
                  type="submit" 
                  className="citoyen-submit-button"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="citoyen-spinner" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال الرسالة'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div 
          id="citoyen-contact-info-tab"
          className={`citoyen-tab-content ${activeTab === 'info' ? 'citoyen-tab-show' : ''}`}
          role="tabpanel"
        >
          <div className="citoyen-contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="citoyen-info-card">
                <div className="citoyen-info-icon">{info.icon}</div>
                <h3 className="citoyen-info-title">{info.title}</h3>
                <div className="citoyen-info-content">
                  {info.content.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="citoyen-map-container">
            <h3 className="citoyen-map-title">موقعنا</h3>
            <div 
              className="citoyen-map-placeholder"
              ref={mapRef}
            ></div>
          </div>
          <div className="citoyen-additional-info">
            <h3 className="citoyen-additional-title">معلومات إضافية</h3>
            <p className="citoyen-additional-text">
              يمكنك أيضًا زيارتنا شخصيًا في مقر المديرية الفرعية الإقليمية لوزارة العدل بوجدة خلال ساعات العمل الرسمية.
              يرجى إحضار بطاقة الهوية الوطنية أو جواز السفر للدخول إلى المبنى.
            </p>
            <p className="citoyen-additional-text">
              نسعى دائمًا لتقديم أفضل خدمة ممكنة للمواطنين، ونرحب بجميع الاستفسارات والاقتراحات التي من شأنها تحسين
              خدماتنا.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitoyenContact;