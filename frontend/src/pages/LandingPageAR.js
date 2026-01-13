import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LandingPageAR = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, setLanguage } = useLanguage();

  // Set language to Arabic when this page loads
  useEffect(() => {
    setLanguage('ar');
  }, [setLanguage]);

  const features = [
    {
      id: 'compliance',
      title: t('complianceCheckerTitle'),
      description: t('complianceCheckerDesc'),
      icon: '🔍',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
      features: [
        t('complianceCheckerF1'),
        t('complianceCheckerF2'),
        t('complianceCheckerF3'),
        t('complianceCheckerF4')
      ],
      path: '/compliance'
    },
    {
      id: 'advisor',
      title: t('advisorTitle'),
      description: t('advisorDesc'),
      icon: '🤖',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      features: [
        t('advisorF1'),
        t('advisorF2'),
        t('advisorF3'),
        t('advisorF4')
      ],
      path: '/advisor'
    },
    {
      id: 'templates',
      title: t('templatesTitle'),
      description: t('templatesDesc'),
      icon: '📁',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #3d2963 0%, #1f1635 100%)',
      features: [
        t('templatesF1'),
        t('templatesF2'),
        t('templatesF3'),
        t('templatesF4')
      ],
      path: '/templates'
    }
  ];

  return (
    <div className="landing-container rtl" dir="rtl">
      {/* Top Navigation Bar */}
      <nav className="landing-navbar rtl">
        <div className="nav-brand">
          <img src="/logo.png" alt="سايبر كومبلاي" className="nav-logo-img" />
          <span className="nav-title">سايبر كومبلاي</span>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-nav">
              {t('dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-nav">
                {t('login')}
              </Link>
              <Link to="/signup" className="btn btn-primary btn-nav">
                {t('signup')}
              </Link>
            </>
          )}
          <Link to="/" className="btn btn-lang">
            English
          </Link>
        </div>
      </nav>
      
      {/* Animated Background Elements */}
      <div className="animated-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="grid-overlay"></div>
      </div>
      
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content animate-fade-in-up">
          <div className="hero-badge animate-pulse-glow">
            {t('badge')}
          </div>
          <h1 className="hero-title">
            <img src="/logo.png" alt="" className="hero-logo-img animate-float" />
            <span className="animate-slide-in">{t('heroTitle1')}</span>
            <span className="hero-highlight animate-gradient">{t('heroTitle2')}</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-delay">
            {t('heroSubtitle')}
          </p>
          <div className="hero-stats animate-stagger">
            <div className="stat-item animate-count-up">
              <div className="stat-value">+3</div>
              <div className="stat-label">{t('frameworks')}</div>
            </div>
            <div className="stat-item animate-count-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-value">119</div>
              <div className="stat-label">{t('templates')}</div>
            </div>
            <div className="stat-item animate-count-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-value">+114</div>
              <div className="stat-label">{t('controls')}</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {isAuthenticated ? (
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                {t('goToDashboard')}
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                  {t('getStarted')}
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => navigate('/compliance')}>
                  {t('tryWithoutAccount')}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="hero-glow"></div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header animate-fade-in-up">
          <h2>{t('chooseYourTool')}</h2>
          <p>{t('chooseToolSubtitle')}</p>
        </div>

        <div className="feature-cards">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className="feature-card animate-card-entrance"
              style={{ 
                '--card-gradient': feature.gradient,
                animationDelay: `${index * 0.15}s`
              }}
              onClick={() => navigate(feature.path)}
            >
              <div className="feature-card-header">
                <div className="feature-icon animate-bounce-subtle" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
              </div>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-list">
                {feature.features.map((f, idx) => (
                  <li key={idx} className="animate-slide-in-left" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <span className="check-icon">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                className="feature-btn"
                style={{ borderColor: feature.color, color: feature.color }}
              >
                {t('exploreFeature')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="frameworks-section">
        <div className="section-header animate-fade-in-up">
          <h2>الأطر المدعومة</h2>
          <p>تحليل امتثال شامل وفقاً لمعايير الأمن السيبراني الرئيسية</p>
        </div>

        <div className="framework-showcase">
          <div className="framework-item animate-scale-in" style={{ animationDelay: '0s' }}>
            <div className="framework-logo">🇸🇦</div>
            <h4>الضوابط الأساسية للأمن السيبراني</h4>
            <p>الهيئة الوطنية للأمن السيبراني</p>
            <span className="framework-tag">إنجليزي وعربي</span>
          </div>
          <div className="framework-item animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="framework-logo">🇺🇸</div>
            <h4>NIST CSF</h4>
            <p>إطار الأمن السيبراني</p>
            <span className="framework-tag">إنجليزي</span>
          </div>
          <div className="framework-item coming-soon animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="framework-logo">🌐</div>
            <h4>ISO 27001</h4>
            <p>إدارة أمن المعلومات</p>
            <span className="framework-tag coming-soon">قريباً</span>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="benefits-section">
        <div className="section-header animate-fade-in-up">
          <h2>{t('whyChoose')}</h2>
          <p>مبنية بواسطة متخصصي الأمن، لمتخصصي الأمن</p>
        </div>
        
        <div className="benefits-grid">
          <div className="benefit-card animate-fade-in-up">
            <span className="benefit-icon"></span>
            <h4>{t('benefit1Title')}</h4>
            <p>{t('benefit1Desc')}</p>
          </div>
          <div className="benefit-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="benefit-icon"></span>
            <h4>{t('benefit2Title')}</h4>
            <p>{t('benefit2Desc')}</p>
          </div>
          <div className="benefit-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="benefit-icon"></span>
            <h4>{t('benefit3Title')}</h4>
            <p>{t('benefit3Desc')}</p>
          </div>
          <div className="benefit-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <span className="benefit-icon"></span>
            <h4>{t('benefit4Title')}</h4>
            <p>{t('benefit4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer animate-fade-in">
        <p>© 2025 منصة امتثال الأمن السيبراني</p>
        <p className="footer-sub">تمكين المنظمات بحلول الامتثال المدعومة بالذكاء الاصطناعي</p>
      </footer>
    </div>
  );
};

export default LandingPageAR;
