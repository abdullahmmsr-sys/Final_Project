import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button 
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>EN</span>
      <span className="lang-divider">|</span>
      <span className={`lang-option ${language === 'ar' ? 'active' : ''}`}>ع</span>
    </button>
  );
};

export default LanguageToggle;
