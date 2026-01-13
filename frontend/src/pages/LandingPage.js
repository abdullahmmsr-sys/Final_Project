import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import LanguageToggle from '../components/LanguageToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const t = translations[language];

  const features = [
    {
      id: 'compliance',
      title: t.complianceChecker,
      description: t.complianceCheckerDesc,
      icon: '🔍',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
      features: [
        t.complianceFeature1,
        t.complianceFeature2,
        t.complianceFeature3,
        t.complianceFeature4
      ],
      path: '/compliance'
    },
    {
      id: 'advisor',
      title: t.improvementAdvisor,
      description: t.improvementAdvisorDesc,
      icon: '🤖',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      features: [
        t.advisorFeature1,
        t.advisorFeature2,
        t.advisorFeature3,
        t.advisorFeature4
      ],
      path: '/advisor'
    },
    {
      id: 'templates',
      title: t.policyTemplates,
      description: t.policyTemplatesDesc,
      icon: '📁',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #3d2963 0%, #1f1635 100%)',
      features: [
        t.templatesFeature1,
        t.templatesFeature2,
        t.templatesFeature3,
        t.templatesFeature4
      ],
      path: '/templates'
    }
  ];

  return (
    <div className={`landing-container ${isRTL ? 'rtl' : ''}`}>
      <LanguageToggle />
      
      {/* Animated Background Elements */}
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="grid-overlay"></div>
      </div>
      
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content animate-fade-in-up">
          <div className="hero-badge animate-pulse-glow">{t.heroBadge}</div>
          <h1 className="hero-title">
            <span className="hero-icon animate-float"></span>
            <span className="animate-slide-in">{t.heroTitle}</span>
            <span className="hero-highlight animate-gradient">{t.heroHighlight}</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-delay">
            {t.heroSubtitle}
          </p>
          <div className="hero-stats animate-stagger">
            <div className="stat-item animate-count-up">
              <div className="stat-value">3+</div>
              <div className="stat-label">{t.frameworks}</div>
            </div>
            <div className="stat-item animate-count-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-value">119</div>
              <div className="stat-label">{t.templates}</div>
            </div>
            <div className="stat-item animate-count-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-value">114+</div>
              <div className="stat-label">{t.controls}</div>
            </div>
          </div>
        </div>
        <div className="hero-glow"></div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header animate-fade-in-up">
          <h2>{t.chooseYourTool}</h2>
          <p>{t.selectTool}</p>
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
                {t.getStarted} {isRTL ? '←' : '→'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="frameworks-section">
        <div className="section-header animate-fade-in-up">
          <h2>{t.supportedFrameworks}</h2>
          <p>{t.frameworksDesc}</p>
        </div>

        <div className="framework-showcase">
          <div className="framework-item animate-scale-in" style={{ animationDelay: '0s' }}>
            <div className="framework-logo">🇸🇦</div>
            <h4>{t.ncaECC}</h4>
            <p>{t.ncaECCDesc}</p>
            <span className="framework-tag">{t.englishArabic}</span>
          </div>
          <div className="framework-item animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="framework-logo">🇺🇸</div>
            <h4>{t.nistCSF}</h4>
            <p>{t.nistCSFDesc}</p>
            <span className="framework-tag">{t.english}</span>
          </div>
          <div className="framework-item coming-soon animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="framework-logo">🌐</div>
            <h4>{t.iso27001}</h4>
            <p>{t.iso27001Desc}</p>
            <span className="framework-tag">{t.comingSoon}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer animate-fade-in">
        <p>{t.footerText}</p>
        <p className="footer-sub">{t.footerSub}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
