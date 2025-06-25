import React, { useState, useEffect } from "react";
import "./EmployeeOrder.css";
import axios from "axios";
import ReactDOMServer from 'react-dom/server';
import PrintOrderTemplate from "./PrintOrderTemplate";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true
});

export default function EmployeeOrder() {
  const storedUser = JSON.parse(localStorage.getItem('user'));

  // Correct state declarations (no duplicates)
  const [currentUser, setCurrentUser] = useState(storedUser || null);
  const [loadingUser, setLoadingUser] = useState(!storedUser);

  // Form state
  const [orderForms, setOrderForms] = useState([{ 
    id: "1", 
    quantity: "", 
    orderItem: "", 
    employee: "", 
    employeeId: "", 
    unit: "piece", 
    notes: "",
    reason: "",
    isNewEmployee: false,
    isTransferred: false,
    proofFile: null,
    proofFileName: "",
    isBroken: false,
    chefName: storedUser?.fullNameAr || storedUser?.fullName || "",
    chefId: storedUser?.id || ""
  }]);

  // UI state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Data state
  const [suggestions, setSuggestions] = useState({
    employees: [],
    supplies: [],
    chefs: []
  });
  
  // Validation state
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoadingUser(false);
          return;
        }

        const response = await api.get('/api/employee/current', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.success) {
          const freshUser = {
            id: response.data.user.id,
            username: response.data.user.username,
            fullName: response.data.user.full_name,
            fullNameAr: response.data.user.full_name_ar,
            role: response.data.user.role,
            department: response.data.user.department,
            position: response.data.user.position
          };
          
          localStorage.setItem('user', JSON.stringify(freshUser));
          setCurrentUser(freshUser);
          
          setOrderForms(prevForms => 
            prevForms.map((form, index) => 
              index === 0 
                ? { 
                    ...form, 
                    chefName: freshUser.fullNameAr || freshUser.fullName,
                    chefId: freshUser.id
                  } 
                : form
            )
          );
        } else {
          console.error('Failed to load user data:', response.data);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    const fetchChefs = async () => {
      try {
        const response = await api.get('/api/chefs/search');
        setSuggestions(prev => ({...prev, chefs: response.data || []}));
      } catch (error) {
        console.error('Error fetching chefs:', error);
      }
    };

    // Only load user data if we don't have it already
    if (!storedUser) {
    loadUserData();
  }
  fetchChefs();
}, [storedUser]);

  useEffect(() => {
    if (currentDropdown) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(currentDropdown.type, searchQuery);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, currentDropdown]);

  const fetchSuggestions = async (type, query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions(prev => ({...prev, [type]: []}));
      return;
    }

    try {
      setLoading(true);
      let endpoint;
      switch(type) {
        case 'employees':
          endpoint = '/api/employees/search';
          break;
        case 'supplies':
          endpoint = '/api/supplies/search';
          break;
        case 'chefs':
          endpoint = '/api/chefs/search';
          break;
        default:
          return;
      }

      const response = await api.get(endpoint, {
        params: { query: query.trim() }
      });
      setSuggestions(prev => ({...prev, [type]: response.data || []}));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions(prev => ({...prev, [type]: []}));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    orderForms.forEach((form, index) => {
      const formErrors = {};
      
      if (!form.orderItem?.trim()) {
        formErrors.orderItem = "المستلزم مطلوب";
        isValid = false;
      }

      if (!form.quantity || isNaN(form.quantity)) {
        formErrors.quantity = "الكمية مطلوبة ويجب أن تكون رقماً";
        isValid = false;
      } else if (Number(form.quantity) <= 0) {
        formErrors.quantity = "يجب أن تكون الكمية أكبر من الصفر";
        isValid = false;
      }

      if (!form.reason) {
        formErrors.reason = "سبب الطلب مطلوب";
        isValid = false;
      }

      if (form.isNewEmployee && !form.proofFile && index === 0) {
        formErrors.proof = "يجب رفع ملف إثبات التعيين";
        isValid = false;
      }

      if (form.isTransferred && !form.proofFile && index === 0) {
        formErrors.proof = "يجب رفع ملف إثبات النقل";
        isValid = false;
      }

      if (form.isBroken && !form.proofFile) {
        formErrors.proof = "يجب رفع صورة للعنصر التالف";
        isValid = false;
      }

      if (Object.keys(formErrors).length > 0) {
        errors[form.id] = formErrors;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleFileUpload = (id, file) => {
    if (!file) return;
    
    setOrderForms(prevForms =>
      prevForms.map(form => {
        if (form.id === id) {
          return {
            ...form,
            proofFile: file,
            proofFileName: file.name
          };
        }
        return form;
      })
    );
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitError("");
  
  if (!validateForm()) {
    setSubmitError("يرجى تصحيح الأخطاء في النموذج قبل الإرسال");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('notes', orderForms[0].notes || '');

    const itemsData = orderForms.map(form => ({
      name: form.orderItem || '',
      quantity: Number(form.quantity) || 1,
      unit: form.unit || 'piece',
      employeeName: form.employee || '',
      reason: form.reason || 'other',
      isNewEmployee: !!form.isNewEmployee,
      isTransferred: !!form.isTransferred,
      isBroken: !!form.isBroken,
      notes: form.notes || ''
    }));

    formData.append('items', JSON.stringify(itemsData));

    orderForms.forEach((form, index) => {
      if (form.proofFile) {
        formData.append(`proofFile_${index}`, form.proofFile);
      }
    });

    const response = await api.post('/api/orders/new', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      setIsSubmitted(true);
    } else {
      throw new Error(response.data.message || "فشل في تقديم الطلب");
    }
  } catch (error) {
    console.error('Submission error:', error);
    setSubmitError(
      error.response?.data?.message || 
      error.message || 
      'فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.'
    );
  }
};
  const resetForm = () => {
    setOrderForms([{ 
      id: Date.now().toString(), 
      quantity: "", 
      orderItem: "", 
      employee: "", 
      employeeId: "", 
      unit: "piece", 
      notes: "",
      reason: "",
      isNewEmployee: false,
      isTransferred: false,
      proofFile: null,
      proofFileName: "",
      isBroken: false,
      chefName: currentUser?.fullNameAr || currentUser?.fullName || "",
      chefId: currentUser?.id || ""
    }]);
    setIsSubmitted(false);
    setSearchQuery("");
    setOpenDropdown(null);
    setFormErrors({});
    setSubmitError("");
  };

  const addOrderForm = () => {
    setOrderForms([
      ...orderForms,
      { 
        id: Date.now().toString(), 
        quantity: "", 
        orderItem: "", 
        employee: "", 
        employeeId: "", 
        unit: "piece", 
        notes: "",
        reason: "",
        isNewEmployee: false,
        isTransferred: false,
        proofFile: null,
        proofFileName: "",
        isBroken: false,
        chefName: currentUser?.fullNameAr || currentUser?.fullName || "",
        chefId: currentUser?.id || ""
      },
    ]);
  };

  const removeOrderForm = (id) => {
    if (orderForms.length > 1) {
      setOrderForms(orderForms.filter((form) => form.id !== id));
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const updateOrderForm = (id, field, value) => {
    setOrderForms(
      orderForms.map((form) => {
        if (form.id === id) {
          if (formErrors[id]?.[field]) {
            setFormErrors(prev => {
              const newErrors = {...prev};
              if (newErrors[id]) {
                delete newErrors[id][field];
                if (Object.keys(newErrors[id]).length === 0) {
                  delete newErrors[id];
                }
              }
              return newErrors;
            });
          }
          return { ...form, [field]: value };
        }
        return form;
      })
    );
  };

  const handleDropdownOpen = (formId, type) => {
    setOpenDropdown(
      openDropdown?.id === formId && openDropdown?.type === type 
        ? null 
        : { id: formId, type }
    );
    setCurrentDropdown({ id: formId, type });
    setSearchQuery("");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("يرجى السماح بالنوافذ المنبثقة لطباعة النموذج");
      return;
    }
    
    const currentDate = new Date().toLocaleDateString("ar-MA");
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  
    const printContent = ReactDOMServer.renderToStaticMarkup(
      <PrintOrderTemplate 
        orderForms={orderForms}
        orderNumber={orderNumber}
        currentDate={currentDate}
        chefName={orderForms[0].chefName}
      />
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طلب مستلزمات مكتبية</title>
        <style>
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .print-template {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  if (loadingUser) {
    return (
      <div className="employee-order-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  return (
    <div className="employee-order-container">
      <div className="employee-order-wrapper">
        <h1 className="employee-order-title">طلب مستلزمات </h1>
        <p className="employee-order-subtitle">
          قم بملء طلب المستلزمات التي تحتاجها
        </p>

        {isSubmitted ? (
          <div className="employee-order-card">
            <div className="employee-order-card-header">
              <h2 className="employee-order-success-title">تم تقديم الطلب بنجاح</h2>
              <p className="employee-order-success-description">
                تم تقديم طلبك بنجاح وسيتم معالجته في أقرب وقت ممكن
              </p>
            </div>
            <div className="employee-order-card-content">
              <div className="employee-order-print-preview">
                <div className="employee-order-print-header">
                  <h2>نموذج طلب مستلزمات مكتبية</h2>
                  <p>المديرية الفرعية الإقليمية لوزارة العدل بوجدة</p>
                  <p>التاريخ: {new Date().toLocaleDateString("ar-MA")}</p>
                </div>

                <div className="employee-order-print-info">
                  <p>المسؤول المباشر: {orderForms[0].chefName || 'غير محدد'}</p>
                  <p>رقم الطلب: {`ORD-${Date.now().toString().slice(-6)}`}</p>
                  <br />
                </div>

                <table className="employee-order-print-table">
                  <thead>
                    <tr>
                      <th>الرقم</th>
                      <th>المستلزم</th>
                      <th>الكمية</th>
                      <th>الموظف</th>
                      <th>السبب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderForms.map((form, index) => (
                      <tr key={form.id}>
                        <td>{index + 1}</td>
                        <td>{form.orderItem}</td>
                        <td>{form.quantity} {form.unit}</td>
                        <td>{form.employee || 'غير محدد'}</td>
                        <td>
                          {form.reason === "out_of_stock" && "نفاد الكمية"}
                          {form.reason === "broken" && "تلف المستلزم"}
                          {form.reason === "new_employee" && "موظف جديد"}
                          {form.reason === "transferred" && "نقل من قسم آخر"}
                          {form.reason === "other" && "أسباب أخرى"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </div>
            <div className="employee-order-card-footer">
              <button 
                className="employee-order-btn employee-order-btn-outline" 
                onClick={resetForm}
              >
                <span>✕</span> طلب جديد
              </button>
              <button 
                className="employee-order-btn" 
                onClick={handlePrint}
              >
                <span></span> طباعة الطلبات
              </button>
            </div>
          </div>
        ) : (
          <div className="employee-order-card">            
            {submitError && (
              <div className="employee-order-error-alert">
                {submitError}
              </div>
            )}
            <div className="employee-order-card-content">
              <form onSubmit={handleSubmit} className="employee-order-form">
                {orderForms.map((form, index) => (
                  <div key={form.id} className="employee-order-form-item">
                    <div className="employee-order-form-item-header">
                      {index > 0 ? (
                        <button
                          type="button"
                          className="employee-order-remove-btn"
                          onClick={() => removeOrderForm(form.id)}
                          aria-label="إزالة الطلب"
                        >
                          ✕
                        </button>
                      ) : (
                        <div></div>
                      )}
                      <h3>طلب : {index + 1}</h3>
                    </div>

                    <div className="employee-order-form-grid">
                      {/* Display responsible person as read-only */}
                      {index === 0 && (
  <div className="employee-order-form-group">
    <label>المسؤول</label>
    <div className="employee-order-readonly-field">
      {currentUser 
        ? (currentUser.fullNameAr || currentUser.fullName)
        : (form.chefName || "غير معروف")
      }
    </div>
  </div>
)}
                      {/* Employee Field (now optional) */}
                      <div className="employee-order-form-group">
                        <label>الموظف</label>
                        <div className="employee-order-dropdown">
                          <button
                            type="button"
                            className="employee-order-dropdown-btn"
                            onClick={() => handleDropdownOpen(form.id, "employees")}
                          >
                            {form.employee || "اختر الموظف..."}
                            <span>↡</span>
                          </button>

                          {openDropdown?.id === form.id && openDropdown?.type === "employees" && (
                            <div className="employee-order-dropdown-menu">
                              <div className="employee-order-dropdown-search">
                                <input
                                  type="text"
                                  placeholder="ابحث عن موظف..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  autoFocus
                                />
                              </div>
                              <div className="employee-order-dropdown-items">
                                {loading ? (
                                  <div>جاري التحميل...</div>
                                ) : suggestions.employees.length > 0 ? (
                                  suggestions.employees.map((employee) => (
                                    <div
                                      key={employee.id}
                                      onClick={() => {
                                        setOrderForms(prevForms => 
                                          prevForms.map(f => 
                                            f.id === form.id 
                                              ? { 
                                                  ...f, 
                                                  employee: employee.full_name_ar,
                                                  employeeId: employee.id.toString()
                                                } 
                                              : f
                                          )
                                        );
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      {employee.full_name_ar}
                                    </div>
                                  ))
                                ) : (
                                  <div>لا توجد نتائج</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Item Field (required) */}
                      <div className="employee-order-form-group">
                        <label>
                          المستلزم <span className="required-field">*</span>
                        </label>
                        <div className="employee-order-dropdown">
                          <button
                            type="button"
                            className={`employee-order-dropdown-btn ${
                              formErrors[form.id]?.orderItem ? 'error-field' : ''
                            }`}
                            onClick={() => handleDropdownOpen(form.id, "supplies")}
                          >
                            {form.orderItem || "اختر المستلزم..."}
                            <span>↡</span>
                          </button>
                          
                          {formErrors[form.id]?.orderItem && (
                            <p className="error-message">{formErrors[form.id].orderItem}</p>
                          )}

                          {openDropdown?.id === form.id && openDropdown?.type === "supplies" && (
                            <div className="employee-order-dropdown-menu">
                              <div className="employee-order-dropdown-search">
                                <input
                                  type="text"
                                  placeholder="ابحث عن مستلزم..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  autoFocus
                                />
                              </div>
                              <div className="employee-order-dropdown-items">
                                {loading ? (
                                  <div>جاري التحميل...</div>
                                ) : suggestions.supplies.length > 0 ? (
                                  suggestions.supplies.map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() => {
                                        updateOrderForm(form.id, "orderItem", item.name_ar);
                                        setOpenDropdown(null);
                                      }}
                                    >
                                      {item.name_ar}
                                    </div>
                                  ))
                                ) : (
                                  <div>لا توجد نتائج</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Field (required) */}
                      <div className="employee-order-form-group">
                        <label htmlFor={`quantity-${form.id}`}>
                          الكمية <span className="required-field">*</span>
                        </label>
                        <input
                          id={`quantity-${form.id}`}
                          type="number"
                          placeholder="أدخل الكمية"
                          value={form.quantity}
                          onChange={(e) => updateOrderForm(form.id, "quantity", e.target.value)}
                          min="1"
                          step="1"
                          required
                          className={formErrors[form.id]?.quantity ? 'error-field' : ''}
                        />
                        {formErrors[form.id]?.quantity && (
                          <p className="error-message">{formErrors[form.id].quantity}</p>
                        )}
                      </div>

                      {/* Unit Field (required) */}
                      <div className="employee-order-form-group">
                        <label htmlFor={`unit-${form.id}`}>الوحدة</label>
                        <select
                          id={`unit-${form.id}`}
                          value={form.unit}
                          onChange={(e) => updateOrderForm(form.id, "unit", e.target.value)}
                        >
                          <option value="piece">قطعة</option>
                          <option value="pack">علبة</option>
                          <option value="ream">رزمة</option>
                          <option value="box">صندوق</option>
                        </select>
                      </div>

                      {/* Reason Field (required) */}
                      <div className="employee-order-form-group">
                        <label>سبب الطلب <span className="required-field">*</span></label>
                        <select
                          value={form.reason}
                          onChange={(e) => updateOrderForm(form.id, "reason", e.target.value)}
                          className={formErrors[form.id]?.reason ? 'error-field' : ''}
                        >
                          <option value="">اختر السبب...</option>
                          <option value="out_of_stock">نفاد الكمية</option>
                          <option value="broken">تلف المستلزم</option>
                          <option value="new_employee">موظف جديد</option>
                          <option value="transferred">نقل من قسم آخر</option>
                          <option value="other">أسباب أخرى</option>
                        </select>
                        {formErrors[form.id]?.reason && (
                          <p className="error-message">{formErrors[form.id].reason}</p>
                        )}
                      </div>

                      {/* Notes Field */}
                      <div className="employee-order-form-group">
                        <label htmlFor={`notes-${form.id}`}>ملاحظات</label>
                        <input
                          id={`notes-${form.id}`}
                          type="text"
                          placeholder="ملاحظات إضافية"
                          value={form.notes}
                          onChange={(e) => updateOrderForm(form.id, "notes", e.target.value)}
                        />
                      </div>

                      {/* Conditional Fields */}
                      {form.reason === "new_employee" && (
                        <div className="employee-order-form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={form.isNewEmployee}
                              onChange={(e) => updateOrderForm(form.id, "isNewEmployee", e.target.checked)}
                            />
                            موظف جديد
                          </label>
                          {form.isNewEmployee && (
                            <>
                              <label htmlFor={`proof-${form.id}`}>رفع ملف إثبات التعيين (PDF فقط)</label>
                              <input
                                id={`proof-${form.id}`}
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileUpload(form.id, e.target.files[0])}
                              />
                              {form.proofFileName && <p>تم اختيار الملف: {form.proofFileName}</p>}
                              {formErrors[form.id]?.proof && (
                                <p className="error-message">{formErrors[form.id].proof}</p>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {form.reason === "transferred" && (
                        <div className="employee-order-form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={form.isTransferred}
                              onChange={(e) => updateOrderForm(form.id, "isTransferred", e.target.checked)}
                            />
                            نقل من قسم آخر
                          </label>
                          {form.isTransferred && (
                            <>
                              <label htmlFor={`proof-${form.id}`}>رفع ملف إثبات النقل (PDF فقط)</label>
                              <input
                                id={`proof-${form.id}`}
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileUpload(form.id, e.target.files[0])}
                              />
                              {form.proofFileName && <p>تم اختيار الملف: {form.proofFileName}</p>}
                              {formErrors[form.id]?.proof && (
                                <p className="error-message">{formErrors[form.id].proof}</p>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {form.reason === "broken" && (
                        <div className="employee-order-form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={form.isBroken}
                              onChange={(e) => updateOrderForm(form.id, "isBroken", e.target.checked)}
                            />
                            مستلزم تالف
                          </label>
                          {form.isBroken && (
                            <>
                              <label htmlFor={`proof-${form.id}`}>رفع صورة للتلف (JPG/PNG فقط)</label>
                              <input
                                id={`proof-${form.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(form.id, e.target.files[0])}
                              />
                              {form.proofFileName && <p>تم اختيار الملف: {form.proofFileName}</p>}
                              {formErrors[form.id]?.proof && (
                                <p className="error-message">{formErrors[form.id].proof}</p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="employee-order-add-btn-container">
                  <button
                    type="button"
                    className="employee-order-btn employee-order-btn-outline"
                    onClick={addOrderForm}
                    aria-label="إضافة طلب آخر"
                  >
                    <span>+</span> إضافة طلب آخر
                  </button>
                </div>

                <div className="employee-order-form-actions">
                  <button
                    type="button"
                    className="employee-order-btn employee-order-btn-outline"
                    onClick={handlePrint}
                  >
                    <span>←</span> طباعة الطلبات
                  </button>
                  <button 
                    type="submit" 
                    className="employee-order-btn"
                    disabled={Object.keys(formErrors).length > 0}
                  >
                    <span>←</span> تأكيد الطلب
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}