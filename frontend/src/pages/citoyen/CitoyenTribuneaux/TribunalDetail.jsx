import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TribunalDetail.css';

const TribunalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courthouse, setCourthouse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated data - replace with your real source
  useEffect(() => {
    const easternMoroccoCourthouses = [
      {
        id: "1",
        name: "محكمة وجدة",
        type: "محكمة ابتدائية",
        city: "وجدة",
        address: "شارع محمد السادس، وجدة",
        phone: "0536-123456",
        email: "contact@courtoujda.ma",
        workingHours: "من الإثنين إلى الجمعة، 08:00 - 16:00",
        imageUrl: "/courthouses/oujda.jpg",
        coordinates: { lat: 34.6806, lng: -1.9095 },
        description: "محكمة ابتدائية بمدينة وجدة تقدم مجموعة من الخدمات القضائية.",
        services: ["تسجيل القضايا", "الاستشارات القانونية", "الإرشاد القضائي"],
      },
        {
          id: '2',
          name: 'المحكمة التجارية وجدة',
          type: 'محكمة تجارية',
          city: 'وجدة',
          address: 'حي الأمل، وجدة',
          phone: '0536-68-45-20',
          email: 'commercial.oujda@justice.gov.ma',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 34.6812, lng: -1.9087 },
          imageUrl: '/courthouses/oujda-commercial.jpg',
          description: 'المحكمة التجارية بوجدة تختص بالنزاعات التجارية بين المتعاملين الاقتصاديين في الجهة الشرقية.',
          services: [
            'النزاعات التجارية',
            'قضايا الشركات',
            'قضايا الملكية التجارية',
            'قضايا الإفلاس'
          ]
        },
        {
          id: '3',
          name: 'محكمة الاستئناف وجدة',
          type: 'محكمة استئناف',
          city: 'وجدة',
          address: 'شارع القاضي عياض، وجدة',
          phone: '0536-68-32-15',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 34.6835, lng: -1.9132 },
          description: 'محكمة الاستئناف بوجدة تنظر في الطعون ضد الأحكام الصادرة عن المحاكم الابتدائية في دائرة نفوذها.',
          services: [
            'الطعون المدنية',
            'الطعون الجنحية',
            'الطعون الاجتماعية'
          ]
        },
        {
          id: '4',
          name: 'المحكمة الابتدائية الناظور',
          type: 'محكمة ابتدائية',
          city: 'الناظور',
          address: 'شارع الحسن الثاني، الناظور',
          phone: '0536-60-12-34',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 35.1681, lng: -2.9336 },
          imageUrl: '/courthouses/nador.jpg',
          description: 'المحكمة الابتدائية بالناظور تغطي القضايا القانونية في منطقة الناظور وضواحيها.',
          services: [
            'قضايا الأحوال الشخصية',
            'قضايا الجنحية',
            'قضايا الشغل'
          ]
        },
        {
          id: '5',
          name: 'المحكمة الابتدائية بركان',
          type: 'محكمة ابتدائية',
          city: 'بركان',
          address: 'حي الإدارة، بركان',
          phone: '0536-61-23-45',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 34.9176, lng: -2.3197 },
          description: 'المحكمة الابتدائية ببركان تخدم المواطنين في منطقة بركان وتوابعها.',
          services: [
            'قضايا الأحوال الشخصية',
            'قضايا الجنحية'
          ]
        },
        {
          id: '6',
          name: 'المحكمة الابتدائية تاوريرت',
          type: 'محكمة ابتدائية',
          city: 'تاوريرت',
          address: 'شارع محمد السادس، تاوريرت',
          phone: '0536-62-34-56',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 34.4072, lng: -2.8978 },
          description: 'المحكمة الابتدائية بتاوريرت تنظر في القضايا المحالة عليها ضمن دائرة نفوذها الإقليمي.',
          services: [
            'قضايا الأحوال الشخصية',
            'قضايا الجنحية'
          ]
        },
        {
          id: '7',
          name: 'المحكمة الابتدائية جرادة',
          type: 'محكمة ابتدائية',
          city: 'جرادة',
          address: 'شارع المقاومة، جرادة',
          phone: '0536-63-45-67',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 34.3100, lng: -2.1600 },
          description: 'المحكمة الابتدائية بجرادة تقدم الخدمات القضائية لسكان منطقة جرادة.',
          services: [
            'قضايا الأحوال الشخصية',
            'قضايا الجنحية'
          ]
        },
        {
          id: '8',
          name: 'المحكمة الابتدائية الدريوش',
          type: 'محكمة ابتدائية',
          city: 'الدريوش',
          address: 'شارع العلويين، الدريوش',
          phone: '0536-64-56-78',
          workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
          coordinates: { lat: 34.9833, lng: -3.5000 },
          description: 'المحكمة الابتدائية بالدريوش تختص بالقضايا المحالة عليها ضمن دائرة نفوذها.',
          services: [
            'قضايا الأحوال الشخصية',
            'قضايا الجنحية'
          ]
        }
    ];

    const foundCourthouse = easternMoroccoCourthouses.find(c => c.id === id);
    setCourthouse(foundCourthouse);
    setLoading(false);
  }, [id]);

 
 // Map initialization with Leaflet
  useEffect(() => {
    if (!courthouse) return;

    const map = L.map('map').setView(
      [courthouse.coordinates.lat, courthouse.coordinates.lng],
      16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker([courthouse.coordinates.lat, courthouse.coordinates.lng])
      .addTo(map)
      .bindPopup(courthouse.name)
      .openPopup();

    return () => {
      map.remove();
    };
  }, [courthouse]);

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (!courthouse) {
    return (
      <div className="not-found">
        <h2>المحكمة غير موجودة</h2>
        <button onClick={() => navigate('/citoyen/tribunaux')} className="back-btn">
          العودة إلى قائمة المحاكم
        </button>
      </div>
    );
  }

  return (
    <div className="tribunal-detail-page">
      <div className="tribunal-detail-container">
        <button onClick={() => navigate('/citoyen/tribunaux')} className="back-btn">
          العودة إلى قائمة المحاكم
        </button>

        <header className="tribunal-header">
          <h1 className="tribunal-name">{courthouse.name}</h1>
          <div className="tribunal-meta">
            <span className="tribunal-type">{courthouse.type}</span>
            <span className="tribunal-city">{courthouse.city}</span>
          </div>
        </header>

        <div className="tribunal-content">
          <div className="tribunal-info">
            {courthouse.imageUrl && (
              <div className="tribunal-image">
                <img
                  src={courthouse.imageUrl}
                  alt={courthouse.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/courthouses/default.jpg';
                  }}
                />
              </div>
            )}

            <div className="info-section">
              <h2>معلومات الاتصال</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">العنوان:</span>
                  <span className="info-value">{courthouse.address}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">الهاتف:</span>
                  <span className="info-value">{courthouse.phone}</span>
                </div>
                {courthouse.email && (
                  <div className="info-item">
                    <span className="info-label">البريد الإلكتروني:</span>
                    <span className="info-value">{courthouse.email}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">ساعات العمل:</span>
                  <span className="info-value">{courthouse.workingHours}</span>
                </div>
              </div>
            </div>

            {courthouse.description && (
              <div className="info-section">
                <h2>وصف المحكمة</h2>
                <p className="tribunal-description">{courthouse.description}</p>
              </div>
            )}

            {courthouse.services && courthouse.services.length > 0 && (
              <div className="info-section">
                <h2>الخدمات القضائية</h2>
                <ul className="services-list">
                  {courthouse.services.map((service, i) => (
                    <li key={i}>
                      <span className="service-bullet"></span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="tribunal-map-section">
            <div className="map-container" id="map"></div>
            <a
              href={`https://www.openstreetmap.org/directions?to=${courthouse.coordinates.lat},${courthouse.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              الحصول على الاتجاهات
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TribunalDetail;