"use client";
import React, { useState, useRef, useEffect } from 'react';
import './CitoyenConsultation.css';
import { FaPaperPlane } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';

const speakArabic = (text) => {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ar-MA';
  utter.voice = synth.getVoices().find(voice => voice.lang.includes('ar')) || synth.getVoices()[0];
  utter.rate = 0.95;
  synth.speak(utter);
};

const CitoyenConsultation = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'مرحباً بكم في المساعد القانوني. كيف يمكنني مساعدتكم اليوم؟',
      sender: 'bot',
      timestamp: new Date()
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/legal-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      speakArabic(botMessage.content);
    } catch (error) {
      console.error('Error:', error);
      const fallbackMessage = {
        id: (Date.now() + 2).toString(),
        content: 'عذرًا، حدث خطأ أثناء معالجة طلبكم. يرجى المحاولة مرة أخرى لاحقًا.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
      speakArabic(fallbackMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="justice-app-container">
      <div className="justice-chatbot-container">
        <div className="chatbot-header">
          <h1>المساعد القانوني</h1>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-container">
          <form onSubmit={handleSendMessage} className="input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اطرح سؤالك القانوني هنا..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <ImSpinner8 className="spinner" /> : <FaPaperPlane />}
            </button>
          </form>
          <div className="legal-disclaimer">
            <p>وزارة العدل - المملكة المغربية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitoyenConsultation;