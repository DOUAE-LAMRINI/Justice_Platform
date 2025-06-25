import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CitoyenTribuneaux.css';

const CitoyenTribuneaux = () => {
  const [courthouses, setCourthouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const navigate = useNavigate();

  // Comprehensive data for Eastern Morocco courthouses
  useEffect(() => {
    const easternMoroccoCourthouses = [
      {
        id: '1',
        name: 'المحكمة الابتدائية وجدة',
        type: 'محكمة ابتدائية',
        city: 'وجدة',
        address: 'شارع محمد الخامس، وجدة',
        phone: '0536-68-21-10',
        email: 'tribunal.oujda@justice.gov.ma',
        workingHours: '8:30 - 16:30 (من الإثنين إلى الجمعة)',
        coordinates: { lat: 34.6867, lng: -1.9114 },
        imageUrl: '/courthouses/oujda.jpg',
        description: 'المحكمة الابتدائية بوجدة تختص بالنظر في القضايا المدنية والتجارية والاجتماعية والزجرية ضمن دائرة نفوذها.',
        services: [
          'قضايا الأحوال الشخصية',
          'قضايا الجنحية',
          'قضايا الشغل',
          'قضايا التجارية البسيطة',
          'قضايا الأحوال المدنية'
        ]
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

    setCourthouses(easternMoroccoCourthouses);
    setLoading(false);
  }, []);

  const filteredCourthouses = courthouses.filter(courthouse => {
    const matchesSearch = courthouse.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || courthouse.type === selectedType;
    const matchesCity = selectedCity === 'all' || courthouse.city === selectedCity;
    return matchesSearch && matchesType && matchesCity;
  });

  const uniqueTypes = [...new Set(courthouses.map(c => c.type))];
  const uniqueCities = [...new Set(courthouses.map(c => c.city))];

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="tribunaux-page">
      <div className="tribunaux-container">
        <header className="page-header">
          <h1 className="page-title">محاكم جهة الشرق</h1>
          <p className="page-subtitle">قائمة بالمحاكم الموجودة في جهة الشرق ومعلومات الاتصال بها</p>
        </header>
        
        <div className="filters-section">
          <div className="filters-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="ابحث عن محكمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <label>نوع المحكمة:</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="all">الكل</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>المدينة:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="all">الكل</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        </div>
        
        <div className="content-section">
          {filteredCourthouses.length > 0 ? (
            <div className="courthouses-grid">
              {filteredCourthouses.map(courthouse => (
                <div key={courthouse.id} className="courthouse-card">
                  <div className="card-header">
                    <h2>{courthouse.name}</h2>
                    <span className="court-type">{courthouse.type}</span>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">المدينة:</span>
                      <span className="info-value">{courthouse.city}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">العنوان:</span>
                      <span className="info-value">{courthouse.address}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">الهاتف:</span>
                      <span className="info-value">{courthouse.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">ساعات العمل:</span>
                      <span className="info-value">{courthouse.workingHours}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button 
                      onClick={() => navigate(`/citoyen/tribunaux/${courthouse.id}`)}
                      className="details-btn"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <i className="no-results-icon">⚠️</i>
              <p>لا توجد نتائج مطابقة لبحثك</p>
              <button 
                className="reset-filters"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedCity('all');
                }}
              >
                إعادة تعيين الفلتر
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

export default CitoyenTribuneaux;