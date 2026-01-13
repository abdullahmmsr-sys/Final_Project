import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading: authLoading } = useAuth();
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

        {/* Divider */}
        <div className="auth-divider">
          <span>{t('or')}</span>
        </div>

        {/* Social Login Options (can be enabled later) */}
        <div className="social-login">
          <button 
            className="btn btn-social google" 
            onClick={signInWithGoogle}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {isRTL ? 'المتابعة مع Google' : 'Continue with Google'}
          </button>
        </div>

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
