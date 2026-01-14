import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, loading: authLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { email, password } = formData;

    if (!email || !password) {
      setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || (isRTL ? 'فشل تسجيل الدخول. حاول مرة أخرى.' : 'Login failed. Please try again.'));
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
          <h1>{t('loginTitle')}</h1>
          <p>{t('loginSubtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error animate-shake">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                autoComplete="current-password"
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

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              {t('rememberMe')}
            </label>
            <Link to="/forgot-password" className="forgot-link">
              {t('forgotPassword')}
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner small"></span>
                {t('signingIn')}
              </>
            ) : (
              t('loginBtn')
            )}
          </button>
        </form>


        {/* Sign Up Link */}
        <div className="auth-footer">
          <p>
            {t('noAccount')}{' '}
            <Link to="/signup" className="auth-link">
              {t('signup')}
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="auth-back">
          <Link to={isRTL ? '/ar' : '/'} className="back-link">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
