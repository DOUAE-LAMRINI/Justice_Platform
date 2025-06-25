import { useState } from "react";
import { ClipboardList, Printer, ChevronDown, BookOpen, Settings } from "lucide-react";
import "./EmployeeGuide.css";

export default function EmployeeGuidePage() {
  const [activeTab, setActiveTab] = useState("about");
  const [openQuestions, setOpenQuestions] = useState([]);

  const toggleQuestion = (index) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const features = [
    { icon: <ClipboardList size={24} />, title: "تقديم الطلبات إلكترونياً", desc: "نظام سهل وسريع لتقديم الطلبات" },
    { icon: <BookOpen size={24} />, title: "متابعة الطلبات", desc: "تتبع حالة طلباتك في الوقت الفعلي" },
    { icon: <Printer size={24} />, title: "طباعة النماذج", desc: "طباعة مباشرة لكل المستندات" },
    { icon: <Settings size={24} />, title: "إدارة الحساب", desc: "تحكم كامل في إعداداتك" }
  ];

  const faqItems = [
    { question: "كيف أقدم طلب جديد؟", answer: "اذهب لقسم الطلبات واملأ النموذج ثم اضغط تأكيد" },
    { question: "كيف أتابع طلبي؟", answer: "جميع الطلبات تظهر في لوحة التحكم مع تحديثات لحظية" },
    { question: "هل يمكن التعديل على الطلب؟", answer: "نعم، قبل الموافقة عليه من الإدارة" },
    { question: "ما هي مدة معالجة الطلب؟", answer: "تختلف حسب نوع الطلب، ولكن معظم الطلبات تتم معالجتها خلال 3 أيام عمل" },
    { question: "كيف أعرف أن طلبي تمت الموافقة عليه؟", answer: "ستتلقى إشعاراً عبر البريد الإلكتروني وتظهر حالة الطلب في لوحة التحكم" },
    { question: "ماذا أفعل إذا تم رفض طلبي؟", answer: "يمكنك الاطلاع على سبب الرفض في تفاصيل الطلب، وإذا كان لديك استفسار يمكنك التواصل مع الدعم الفني" },
    { question: "هل يمكنني إلغاء طلب بعد تقديمه؟", answer: "نعم، يمكنك إلغاء الطلب قبل الموافقة عليه من خلال قسم الطلبات" },
    { question: "كيف يمكنني تحديث بياناتي الشخصية؟", answer: "يمكنك تحديث معلوماتك من خلال صفحة إعدادات الحساب" }
  ];

  return (
    <div className="employee-guide-container">
      {/* Hero Header */}
      <div className="hero-header">
        <div className="hero-overlay">
          <h1 className="hero-title">بوابة الموظفين</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-wrapper">
        {/* New Tab Navigation */}
        <div className="modern-tabs">
          <div className="tab-buttons-container">
            <button
              className={`tab-button ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <span className="tab-label">عن البوابة</span>
            </button>
            <button
              className={`tab-button ${activeTab === "usage" ? "active" : ""}`}
              onClick={() => setActiveTab("usage")}
            >
              <span className="tab-label">دليل الاستخدام</span>
            </button>
            <button
              className={`tab-button ${activeTab === "faq" ? "active" : ""}`}
              onClick={() => setActiveTab("faq")}
            >
              <span className="tab-label">الأسئلة الشائعة</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-container">
          {activeTab === "about" && (
            <div className="content-card">
              {/* Centered Overview Section */}
              <section className="centered-section">
                <h2 className="centered-title">نظرة عامة</h2>
                <p className="centered-text">
                  تهدف بوابة الموظفين إلى تسهيل وتنظيم العمل الإداري داخل الوزارة، وتوفير منصة موحدة لإدارة الطلبات والمهام اليومية. تتيح البوابة للموظفين تقديم طلبات المستلزمات المكتبية، ومتابعة حالة الطلبات، مما يساهم في تحسين جودة العمل وزيادة الإنتاجية.
                </p>
              </section>

              {/* Centered Features Header */}
              <section className="centered-section">
                <h2 className="centered-title">المميزات الرئيسية</h2>
                <p className="centered-subtitle">أبرز ما تقدمه البوابة من خدمات</p>
              </section>

              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div className="content-card">
              {/* Centered Usage Header */}
              <section className="centered-section">
                <h2 className="centered-title">كيفية استخدام البوابة</h2>
                <p className="centered-subtitle">دليل خطوة بخطوة لاستخدام مختلف أقسام البوابة</p>
              </section>

              {/* New Request - Side by Side Steps */}
              <div className="section-with-title">
                <h3 className="section-title">تقديم طلب جديد</h3>
                <div className="side-by-side-steps">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>الانتقال إلى صفحة الطلبات</h4>
                      <p>انقر على "الطلبات" في القائمة الرئيسية</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>ملء نموذج الطلب</h4>
                      <p>أدخل تفاصيل الطلب والكمية المطلوبة</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>تأكيد الطلب</h4>
                      <p>انقر على "تأكيد الطلب" لإرسال الطلب</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Request - Side by Side Steps */}
              <div className="section-with-title">
                <h3 className="section-title">طباعة الطلب</h3>
                <div className="side-by-side-steps">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>بعد تأكيد الطلب</h4>
                      <p>انقر على زر "طباعة الطلب" الذي سيظهر بعد التأكيد</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>توقيع النموذج</h4>
                      <p>قم بتوقيع النموذج المطبوع وتسليمه للمسؤول</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="content-card">
              {/* Centered FAQ Header */}
              <section className="centered-section">
                <h2 className="centered-title">الأسئلة الشائعة</h2>
                <p className="centered-subtitle">إجابات على أكثر الاستفسارات تكرراً</p>
              </section>

              <div className="faq-list">
                {faqItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`faq-item ${openQuestions.includes(index) ? "open" : ""}`}
                  >
                    <button 
                      className="faq-question"
                      onClick={() => toggleQuestion(index)}
                    >
                      <span>{item.question}</span>
                      <ChevronDown size={18} className="chevron" />
                    </button>
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}