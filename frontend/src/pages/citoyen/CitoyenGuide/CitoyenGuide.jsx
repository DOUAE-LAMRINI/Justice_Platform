import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CitoyenGuide.css';

const CitoyenGuide = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [activeFaq, setActiveFaq] = useState(null);

  const tabs = [
    { id: 'about', label: 'حول البوابة' },
    { id: 'usage', label: 'كيفية الاستخدام' },
    { id: 'features', label: 'الميزات' },
    { id: 'faq', label: 'الأسئلة الشائعة' }
  ];

  const faqItems = [
    {
      id: 'item-1',
      question: 'كيف يمكنني الوصول إلى معلومات محكمة معينة؟',
      answer: 'يمكنك الوصول إلى معلومات محكمة معينة من خلال الانتقال إلى صفحة "محاكم الشرق" في القائمة الرئيسية، ثم استخدام خيارات التصفية أو البحث للعثور على المحكمة المطلوبة. بعد ذلك، انقر على "عرض التفاصيل" لمشاهدة جميع المعلومات المتعلقة بالمحكمة.'
    },
    {
      id: 'item-2',
      question: 'هل يمكنني طلب استشارة قانونية عبر البوابة؟',
      answer: 'نعم، يمكنك طلب استشارة قانونية أولية من خلال الانتقال إلى صفحة "الاستشارة القانونية" في القائمة الرئيسية، وملء النموذج المخصص لذلك. سيتم الرد على طلبك خلال 48 ساعة عمل من قبل مختصين قانونيين.'
    },
    {
      id: 'item-3',
      question: 'هل المعلومات المتوفرة في البوابة محدثة؟',
      answer: 'نعم، نحرص على تحديث جميع المعلومات المتوفرة في البوابة بشكل دوري، بما في ذلك معلومات المحاكم، وساعات العمل، والإجراءات القانونية. في حال وجود أي تغييرات أو تحديثات، يتم نشرها على البوابة فورًا.'
    },
    {
      id: 'item-4',
      question: 'هل يمكنني تحميل نماذج الوثائق القانونية من البوابة؟',
      answer: 'نعم، توفر البوابة مجموعة من نماذج الوثائق القانونية التي يمكن تحميلها واستخدامها. يمكنك الوصول إلى هذه النماذج من خلال صفحة "الدليل" في القائمة الرئيسية، ثم اختيار نوع الإجراء أو الوثيقة المطلوبة.'
    },
    {
      id: 'item-5',
      question: 'كيف يمكنني التواصل مع إدارة البوابة في حال وجود مشكلة؟',
      answer: 'يمكنك التواصل مع إدارة البوابة من خلال صفحة "الاتصال" في القائمة الرئيسية، أو من خلال إرسال بريد إلكتروني إلى العنوان المخصص للدعم الفني. سيتم الرد على استفسارك في أقرب وقت ممكن.'
    },
    {
      id: 'item-6',
      question: 'هل البوابة متاحة باللغة الفرنسية أيضًا؟',
      answer: 'حاليًا، البوابة متاحة باللغة العربية فقط. نعمل على توفير نسخة باللغة الفرنسية في المستقبل القريب لتلبية احتياجات جميع المستخدمين.'
    }
  ];

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <div className="justice-guide-container">
      {/* Hero Section */}
      <div className="justice-guide-hero">
        <div className="justice-guide-hero-content">
          <h1 className="justice-guide-title">دليل استخدام البوابة العدلية</h1>
          <p className="justice-guide-subtitle">
            كل ما تحتاج معرفته للوصول إلى خدمات المديرية الفرعية الإقليمية لوزارة العدل بوجدة
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="justice-guide-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`justice-guide-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="justice-guide-content">
        {/* About Tab */}
        <div className={`justice-tab-content ${activeTab === 'about' ? 'active' : ''}`}>
          <div className="justice-section-header">
            <h2 className="justice-section-title">حول البوابة</h2>
            <p className="justice-section-description">
              تعرف على أهداف وغايات بوابة المديرية الفرعية الإقليمية لوزارة العدل بوجدة
            </p>
          </div>

          <div className="justice-about-section">
            <div className="justice-mission">
              <h3 className="justice-section-subtitle">رؤيتنا ورسالتنا</h3>
              <div className="justice-mission-content">
                <p>
                  تلتزم بوابتنا بتقريب خدمات العدالة من المواطنين في جهة الشرق، وتوفير وصول سهل ومنظم للمعلومات القانونية والقضائية.
                </p>
                <p>
                  نعمل من خلال هذه المنصة الرقمية على تحقيق العدالة الإلكترونية وتبسيط الإجراءات القضائية، مع ضمان دقة وحداثة المعلومات المقدمة عن المحاكم والخدمات القضائية في المنطقة الشرقية.
                </p>
              </div>
            </div>

            <div className="justice-objectives">
              <h3 className="justice-section-subtitle">أهداف البوابة</h3>
              <div className="justice-objectives-grid">
                <div className="justice-objective-card">
                  <h4>تسهيل الوصول للمعلومات</h4>
                  <p>إتاحة معلومات المحاكم في جهة الشرق بشكل واضح وسهل</p>
                </div>
                <div className="justice-objective-card">
                  <h4>الدليل الشامل</h4>
                  <p>توفير مرجع كامل للإجراءات القانونية والقضائية</p>
                </div>
                <div className="justice-objective-card">
                  <h4>الدعم القانوني</h4>
                  <p>تقديم استشارات قانونية أولية للمواطنين</p>
                </div>
                <div className="justice-objective-card">
                  <h4>توفير الوقت والجهد</h4>
                  <p>تقليص المسافات وتسهيل الإجراءات على المتقاضين</p>
                </div>
                <div className="justice-objective-card">
                  <h4>تعزيز الشفافية</h4>
                  <p>ضمان الوصول العادل إلى العدالة</p>
                </div>
                <div className="justice-objective-card">
                  <h4>تحسين الخدمات</h4>
                  <p>رفع جودة الخدمات المقدمة للمواطنين</p>
                </div>
              </div>
            </div>

            <div className="justice-audience">
              <h3 className="justice-section-subtitle">الفئات المستهدفة</h3>
              <div className="justice-audience-cards">
                <div className="justice-audience-card">
                  <h4>المواطنون</h4>
                  <p>
                    نوفر للمواطنين مصادر متكاملة عن المحاكم، الإجراءات القانونية، النماذج الرسمية، والاستشارات القانونية الأولية بطريقة واضحة وسهلة.
                  </p>
                </div>
                <div className="justice-audience-card">
                  <h4>الموظفون</h4>
                  <p>
                    نقدم للموظفين أدوات متطورة لإدارة الملفات، متابعة القضايا، التواصل الفعال مع المواطنين، وضمان جودة الخدمات المقدمة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tab */}
        <div className={`justice-tab-content ${activeTab === 'usage' ? 'active' : ''}`}>
          <div className="justice-section-header">
            <h2 className="justice-section-title">كيفية الاستخدام</h2>
            <p className="justice-section-description">دليل خطوة بخطوة لاستخدام مختلف أقسام البوابة</p>
          </div>

          <div className="justice-usage-section">
            <div className="justice-usage-process">
              <h3 className="justice-usage-title">استخدام دليل محاكم الشرق</h3>
              
              <div className="justice-usage-steps">
                <div className="justice-usage-step">
                  <h4 className="justice-step-title">الخطوة الأولى: الوصول إلى الصفحة</h4>
                  <p className="justice-step-description">اختر "محاكم الشرق" من القائمة الرئيسية للبوابة</p>
                </div>
                
                <div className="justice-usage-step">
                  <h4 className="justice-step-title">الخطوة الثانية: تصفية النتائج</h4>
                  <p className="justice-step-description">استخدم أدوات التصفية المتاحة حسب:</p>
                  <ul className="justice-step-options">
                    <li>نوع المحكمة (ابتدائية، استئناف، إدارية، تجارية)</li>
                    <li>المدينة (وجدة، الناظور، بركان، وغيرها)</li>
                  </ul>
                </div>
                
                <div className="justice-usage-step">
                  <h4 className="justice-step-title">الخطوة الثالثة: عرض التفاصيل</h4>
                  <p className="justice-step-description">اضغط على "عرض التفاصيل" للاطلاع على كافة المعلومات المتعلقة بالمحكمة المطلوبة</p>
                </div>
              </div>
              
              <div className="justice-usage-note">
                <p>ملاحظة: يمكنك استخدام خاصية البحث المباشر عن طريق اسم المحكمة أو رقمها المرجعي للحصول على نتائج أسرع.</p>
              </div>
            </div>

            <div className="justice-usage-process">
              <h3 className="justice-usage-title">طلب استشارة قانونية</h3>
              
              <div className="justice-usage-steps">
                <div className="justice-usage-step">
                  <h4 className="justice-step-title">الخطوة الأولى: الدخول إلى الخدمة</h4>
                  <p className="justice-step-description">اختر "الاستشارة القانونية" من القائمة الرئيسية</p>
                </div>
                
                <div className="justice-usage-step">
                  <h4 className="justice-step-title">الخطوة الثانية: إكمال النموذج</h4>
                  <p className="justice-step-description">املأ الحقول المطلوبة في النموذج الإلكتروني:</p>
                  <ul className="justice-step-options">
                    <li>البيانات الشخصية الأساسية</li>
                    <li>تفاصيل الاستشارة المطلوبة</li>
                    <li>المستندات الداعمة (إن وجدت)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Tab */}
        <div className={`justice-tab-content ${activeTab === 'features' ? 'active' : ''}`}>
          <div className="justice-section-header">
            <h2 className="justice-section-title">ميزات البوابة</h2>
            <p className="justice-section-description">تعرف على الميزات والخدمات المتاحة في البوابة</p>
          </div>

          <div className="justice-features-section">
            <div className="justice-feature">
              <h3 className="justice-feature-title">دليل محاكم الشرق</h3>
              <p className="justice-feature-description">
                قاعدة بيانات شاملة لجميع المحاكم في جهة الشرق، مع معلومات مفصلة عن كل محكمة تشمل:
              </p>
              <ul className="justice-feature-list">
                <li>معلومات الاتصال والعنوان الدقيق</li>
                <li>ساعات العمل الرسمية والخدمات المتوفرة</li>
                <li>إمكانية التصفية حسب نوع المحكمة والموقع الجغرافي</li>
              </ul>
            </div>

            <div className="justice-feature">
              <h3 className="justice-feature-title">الاستشارة القانونية</h3>
              <p className="justice-feature-description">
                خدمة الاستشارات القانونية الأولية للمواطنين:
              </p>
              <ul className="justice-feature-list">
                <li>إجابات فورية على الاستفسارات القانونية العامة</li>
                <li>نظام متكامل لطلب استشارات متخصصة</li>
                <li>ضمان الرد المعياري خلال 48 ساعة عمل</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Tab */}
        <div className={`justice-tab-content ${activeTab === 'faq' ? 'active' : ''}`}>
          <div className="justice-section-header">
            <h2 className="justice-section-title">الأسئلة الشائعة</h2>
            <p className="justice-section-description">
              إجابات على الأسئلة المتكررة حول استخدام البوابة
            </p>
          </div>

          <div className="justice-faq-section">
            {faqItems.map((item) => (
              <div 
                key={item.id} 
                className={`justice-faq-item ${activeFaq === item.id ? 'active' : ''}`}
                onClick={() => toggleFaq(item.id)}
              >
                <div className="justice-faq-question">
                  <h3>{item.question}</h3>
                  <span className="justice-faq-toggle">
                    {activeFaq === item.id ? '-' : '+'}
                  </span>
                </div>
                {activeFaq === item.id && (
                  <div className="justice-faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="justice-contact-promo">
            <h3>لم تجد إجابة لسؤالك؟</h3>
            <p>
              إذا لم تجد إجابة لسؤالك في قائمة الأسئلة الشائعة، يمكنك التواصل معنا مباشرة للحصول على المساعدة.
            </p>
            <button className="justice-contact-button" onClick={() => navigate('/citoyen/contact')}>اتصل بنا</button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="justice-help-section">
        <h2>هل تحتاج إلى مساعدة إضافية؟</h2>
        <p>
          فريق الدعم الفني جاهز للإجابة على جميع استفساراتك ومساعدتك في استخدام البوابة
        </p>
        <div className="justice-help-buttons">
          <button className="justice-primary-button" onClick={() => navigate('/citoyen/contact')}>اتصل بنا</button>
        </div>
      </div>
    </div>
  );
};

export default CitoyenGuide;