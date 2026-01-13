import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return false;
    }

    if (fullName.length < 2) {
      setError(isRTL ? 'يجب أن يكون الاسم حرفين على الأقل' : 'Name must be at least 2 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError(isRTL ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    const { email, password, fullName } = formData;
    const result = await signUp(email, password, fullName);
    
    if (result.success) {
      setSuccess(true);
      // Check if email confirmation is required
      if (result.data?.user?.identities?.length === 0) {
        setError(isRTL ? 'هذا البريد مسجل بالفعل. يرجى تسجيل الدخول.' : 'This email is already registered. Please login instead.');
        setSuccess(false);
      }
    } else {
      setError(result.error || (isRTL ? 'فشل التسجيل. حاول مرة أخرى.' : 'Registration failed. Please try again.'));
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`auth-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animated-bg">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
          </div>
          <div className="grid-overlay"></div>
        </div>

        <div className="auth-card animate-fade-in-up">
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <h2>{t('signupSuccess')}</h2>
            <p>
              {isRTL 
                ? `لقد أرسلنا رسالة تأكيد إلى ${formData.email}. يرجى التحقق من صندوق الوارد والنقر على رابط التأكيد.`
                : `We've sent a confirmation email to ${formData.email}. Please check your inbox and click the confirmation link.`
              }
            </p>
            <div className="success-actions">
              <Link to="/login" className="btn btn-primary">
                {t('goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`auth-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="grid-overlay"></div>
      </div>

      <div className="auth-card animate-fade-in-up">
        {/* Logo/Brand */}
        <div className="auth-header">
          <div className="auth-logo"></div>
          <h1>{t('signupTitle')}</h1>
          <p>{t('signupSubtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error animate-shake">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">{t('fullName')}</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t('fullNamePlaceholder')}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('passwordPlaceholder')}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('confirmPasswordPlaceholder')}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              {isRTL ? (
                <>أوافق على <Link to="/terms" className="terms-link">شروط الخدمة</Link></>
              ) : (
                <>I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link></>
              )}
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner small"></span>
                {t('creatingAccount')}
              </>
            ) : (
              t('signupTitle')
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="auth-footer">
          <p>
            {t('haveAccount')}{' '}
            <Link to="/login" className="auth-link">
              {t('loginTitle')}
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="auth-back">
          <Link to={isRTL ? "/ar" : "/"} className="back-link">
            {isRTL ? 'العودة للرئيسية ←' : '← Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
