import React from "react";
import ministryLogo from "../../../assets/images/ministry-logo-1.png";

const PrintOrderTemplate = ({ orderForms, orderNumber, currentDate, chefName }) => {
  return (
    <div dir="rtl" style={{
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '15mm',
      fontFamily: "'Arial', sans-serif",
      fontSize: '12pt',
      lineHeight: 1.5,
      position: 'relative', // For footer positioning safety
      boxSizing: 'border-box'
    }}>

      {/* Print Styles */}
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
            }
            * {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* Header with Logo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10mm',
        borderBottom: '1px solid #000',
        paddingBottom: '5mm'
      }}>
        <div style={{ width: '30mm' }}>
          <img 
            src={ministryLogo} 
            alt="شعار وزارة العدل"
            style={{ 
              width: '25mm',
              height: '25mm',
              objectFit: 'contain'
            }}
          />
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>المملكة المغربية</div>
          <div style={{ fontSize: '16pt', fontWeight: 'bold', margin: '2mm 0' }}>وزارة العدل</div>
          <div style={{ fontSize: '14pt' }}>المديرية الفرعية الإقليمية بوجدة</div>
        </div>
        <div style={{ width: '30mm', textAlign: 'left' }}>
          <div style={{ fontSize: '10pt' }}>الوثيقة رقم:</div>
          <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>{orderNumber}</div>
        </div>
      </div>

      {/* Document Title */}
      <div style={{
        textAlign: 'center',
        margin: '8mm 0',
        fontSize: '16pt',
        fontWeight: 'bold',
        textDecoration: 'underline'
      }}>
        طلب مستلزمات
      </div>

      {/* Document Metadata */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8mm',
        fontSize: '12pt'
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>تاريخ الطلب: </span>
          {currentDate}
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>اسم المسؤول: </span>
          {chefName}
        </div>
      </div>

      {/* Order Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '15mm',
        border: '1px solid #000'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '3mm', border: '1px solid #000', width: '10mm' }}>م</th>
            <th style={{ padding: '3mm', border: '1px solid #000' }}>المستلزمات المطلوبة</th>
            <th style={{ padding: '3mm', border: '1px solid #000', width: '15mm' }}>الكمية</th>
            <th style={{ padding: '3mm', border: '1px solid #000', width: '15mm' }}>الوحدة</th>
            <th style={{ padding: '3mm', border: '1px solid #000', width: '20mm' }}>طالب المستلزم</th>
            <th style={{ padding: '3mm', border: '1px solid #000', width: '25mm' }}>السبب</th>
          </tr>
        </thead>
        <tbody>
          {orderForms.map((form, index) => (
            <tr key={index}>
              <td style={{ padding: '3mm', border: '1px solid #000', textAlign: 'center' }}>{index + 1}</td>
              <td style={{ padding: '3mm', border: '1px solid #000' }}>{form.orderItem || "---"}</td>
              <td style={{ padding: '3mm', border: '1px solid #000', textAlign: 'center' }}>{form.quantity || "0"}</td>
              <td style={{ padding: '3mm', border: '1px solid #000', textAlign: 'center' }}>
                {{
                  "piece": "قطعة",
                  "pack": "علبة",
                  "ream": "رزمة",
                  "box": "صندوق"
                }[form.unit] || "---"}
              </td>
              <td style={{ padding: '3mm', border: '1px solid #000', textAlign: 'center' }}>{form.employee || "---"}</td>
              <td style={{ padding: '3mm', border: '1px solid #000', textAlign: 'center' }}>
                {{
                  "out_of_stock": "نفاد الكمية",
                  "broken": "تلف المستلزم",
                  "new_employee": "موظف جديد",
                  "transferred": "نقل من قسم آخر",
                  "other": "أسباب أخرى"
                }[form.reason] || "---"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approval Section */}
      <div style={{
        marginTop: '15mm',
        textAlign: 'center',
        fontSize: '12pt'
      }}>
        <div style={{ marginBottom: '10mm' }}>
          بناءً على الطلب أعلاه، تم الموافقة على تسليم جميع المستلزمات المذكورة
        </div>
        <div style={{ display: 'inline-block', marginBottom: '5mm' }}>
          <div style={{ borderBottom: '1px solid #000', width: '60mm', height: '1mm', margin: '0 auto' }}></div>
          <div style={{ marginTop: '2mm' }}>التوقيع: {chefName}</div>
        </div>
      </div>

      {/* Spacer to avoid footer overlap */}
      <div style={{ height: '25mm' }}></div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '10mm',
        left: '15mm',
        right: '15mm',
        textAlign: 'center',
        fontSize: '10pt',
        borderTop: '1px solid #000',
        paddingTop: '2mm'
      }}>
        وزارة العدل - المديرية الفرعية الإقليمية بوجدة - {currentDate}
      </div>
    </div>
  );
};

export default PrintOrderTemplate;
