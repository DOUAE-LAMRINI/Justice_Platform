import React, { useState } from "react";
import "./EmployeeRating.css";

const EmployeeRating = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch('http://localhost:5000/api/employee/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        rating: Number(rating),  // Ensure rating is a number
        comment: comment || null // Send null if empty
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit rating');
    }

    setIsSubmitted(true);
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || "Failed to submit rating. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const resetForm = () => {
    setRating(0);
    setComment("");
    setIsSubmitted(false);
  };

  return (
    <div className="luxury-rating-container">
      <div className="luxury-card">
        {isSubmitted ? (
          <div className="luxury-success">
            <div className="luxury-checkmark">✓</div>
            <h2>شكراً لتقييمكم</h2>
            <p>تم استلام تقييمكم بنجاح وسيتم الأخذ به في تحسين خدماتنا</p>
            <button onClick={resetForm} className="luxury-reset-btn">
              إغلاق
            </button>
          </div>
        ) : (
          <>
            <div className="luxury-header">
              <h1>تقييم الخدمة</h1>
              <p>نقدر ملاحظاتكم لمساعدتنا في التحسين المستمر</p>
            </div>
            
            <form onSubmit={handleSubmit} className="luxury-form">
              <div className="luxury-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`luxury-star ${rating >= star ? "active" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <div className="luxury-textarea-container">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="ملاحظاتكم تسرنا ..."
                  className="luxury-textarea"
                />
              </div>
              
              <button 
                type="submit" 
                className="luxury-submit-btn"
                disabled={rating === 0 || isLoading}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeRating;