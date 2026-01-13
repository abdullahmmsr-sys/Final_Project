import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserReports, deleteReport, getRelatedReports } from '../services/reportService';

// Score color utilities
const getScoreClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'critical';
};

const getScoreColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#3b82f6';
  if (score >= 50) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#ef4444';
};

// Report Card Component
const ReportCard = ({ report, onView, onCompare, onDelete, hasRelated }) => {
  const [showActions, setShowActions] = useState(false);
  const scoreClass = getScoreClass(report.overall_score);
  
  return (
    <div className="report-card animate-card-entrance">
      <div className="report-card-header">
        <div className="report-file-info">
          <span className="report-icon">📄</span>
          <div>
            <h3 className="report-filename">{report.filename}</h3>
            <p className="report-date">
              {new Date(report.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div 
          className={`report-score score-${scoreClass}`}
          style={{ background: `${getScoreColor(report.overall_score)}20` }}
        >
          {report.overall_score?.toFixed(1)}%
        </div>
      </div>
      
      <div className="report-card-body">
        <div className="report-stats">
          <div className="report-stat">
            <span className="stat-value">{report.total_controls_evaluated}</span>
            <span className="stat-label">Controls</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">{report.frameworks?.length || 0}</span>
            <span className="stat-label">Frameworks</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">{report.summary?.score_distribution?.excellent || 0}</span>
            <span className="stat-label">Excellent</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">{report.summary?.score_distribution?.critical || 0}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
        
        <div className="report-frameworks">
          {report.frameworks?.map((fw, idx) => (
            <span key={idx} className="framework-tag">{fw.toUpperCase()}</span>
          ))}
        </div>
      </div>
      
      <div className="report-card-actions">
        <button className="btn btn-sm btn-primary" onClick={() => onView(report)}>
          View Details
        </button>
        {hasRelated && (
          <button className="btn btn-sm btn-secondary" onClick={() => onCompare(report)}>
            Compare
          </button>
        )}
        <button 
          className="btn btn-sm btn-icon"
          onClick={() => setShowActions(!showActions)}
        >
          ⋮
        </button>
        
        {showActions && (
          <div className="action-dropdown">
            <button onClick={() => { onDelete(report.id); setShowActions(false); }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Overview Component
const StatsOverview = ({ reports }) => {
  const totalReports = reports.length;
  const avgScore = reports.length > 0 
    ? reports.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reports.length 
    : 0;
  const totalControls = reports.reduce((sum, r) => sum + (r.total_controls_evaluated || 0), 0);
  
  // Calculate improvement trend (compare last 2 reports)
  let improvement = 0;
  if (reports.length >= 2) {
    improvement = reports[0].overall_score - reports[1].overall_score;
  }
  
  return (
    <div className="stats-overview">
      <div className="stat-card animate-scale-in">
        <div className="stat-icon"></div>
        <div className="stat-content">
          <div className="stat-value">{totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
      </div>
      
      <div className="stat-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="stat-icon"></div>
        <div className="stat-content">
          <div className="stat-value" style={{ color: getScoreColor(avgScore) }}>
            {avgScore.toFixed(1)}%
          </div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>
      
      <div className="stat-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <div className="stat-icon"></div>
        <div className="stat-content">
          <div className="stat-value">{totalControls}</div>
          <div className="stat-label">Controls Evaluated</div>
        </div>
      </div>
      
      <div className="stat-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
        <div className="stat-content">
          <div 
            className="stat-value" 
            style={{ color: improvement >= 0 ? '#22c55e' : '#ef4444' }}
          >
            {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
          </div>
          <div className="stat-label">Latest Trend</div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { t, isRTL, language } = useLanguage();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [documentGroups, setDocumentGroups] = useState({});
  
  // Fetch reports on mount
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);
  
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserReports(user.id);
      
      if (result.success) {
        setReports(result.reports || []);
        
        // Group reports by document fingerprint
        const groups = {};
        (result.reports || []).forEach(report => {
          const fp = report.document_fingerprint;
          if (!groups[fp]) {
            groups[fp] = [];
          }
          groups[fp].push(report.id);
        });
        setDocumentGroups(groups);
      } else {
        // If table doesn't exist, show empty state instead of error
        if (result.error?.includes('does not exist') || result.error?.includes('relation')) {
          setReports([]);
          console.log('Reports table not set up yet');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewReport = (report) => {
    navigate(`/report/${report.id}`);
  };
  
  const handleCompareReport = (report) => {
    navigate(`/compare/${report.document_fingerprint}`);
  };
  
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    const result = await deleteReport(reportId);
    if (result.success) {
      setReports(prev => prev.filter(r => r.id !== reportId));
    } else {
      setError(result.error);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  // Filter and search reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'excellent') return matchesSearch && report.overall_score >= 90;
    if (filter === 'good') return matchesSearch && report.overall_score >= 75 && report.overall_score < 90;
    if (filter === 'needs-work') return matchesSearch && report.overall_score < 75;
    
    return matchesSearch;
  });

  if (authLoading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`app-container dashboard-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="grid-overlay"></div>
      </div>

      {/* Dashboard Header */}
      <header className="dashboard-header animate-fade-in-up">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            {isRTL ? '← العودة للرئيسية' : '← Back to Home'}
          </button>
          <h1>{t('dashboardTitle')}</h1>
          <p>{t('welcome')}, {profile?.full_name || 'User'}!</p>
        </div>
        <div className="header-right">
          <Link to="/compliance" className="btn btn-primary">
             {t('newCheck')}
          </Link>
          <div className="user-menu">
            <button className="user-avatar" onClick={() => navigate('/profile')}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </button>
            <div className="user-dropdown">
              <Link to="/profile"> {t('profile')}</Link>
              <button onClick={handleSignOut}> {t('logout')}</button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error animate-shake">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Stats Overview */}
      {reports.length > 0 && <StatsOverview reports={reports} />}

      {/* Reports Section */}
      <section className="reports-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>{t('recentReports')}</h2>
          
          <div className="section-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder={t('searchReports')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon"></span>
            </div>
            
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                {t('all')}
              </button>
              <button 
                className={`filter-tab ${filter === 'excellent' ? 'active' : ''}`}
                onClick={() => setFilter('excellent')}
              >
                {isRTL ? 'ممتاز' : 'Excellent'}
              </button>
              <button 
                className={`filter-tab ${filter === 'good' ? 'active' : ''}`}
                onClick={() => setFilter('good')}
              >
                {isRTL ? 'جيد' : 'Good'}
              </button>
              <button 
                className={`filter-tab ${filter === 'needs-work' ? 'active' : ''}`}
                onClick={() => setFilter('needs-work')}
              >
                {isRTL ? 'يحتاج تحسين' : 'Needs Work'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>{t('loading')}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>{t('noReports')}</h3>
            <p>
              {reports.length === 0 
                ? t('startFirst')
                : (isRTL ? "لا توجد تقارير تطابق بحثك" : "No reports match your search criteria.")}
            </p>
            {reports.length === 0 && (
              <Link to="/compliance" className="btn btn-primary">
                {isRTL ? 'ابدأ أول تحليل' : 'Run Your First Analysis'}
              </Link>
            )}
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report, idx) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={handleViewReport}
                onCompare={handleCompareReport}
                onDelete={handleDeleteReport}
                hasRelated={(documentGroups[report.document_fingerprint]?.length || 0) > 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3>{t('quickActions')}</h3>
        <div className="action-cards">
          <Link to="/compliance" className="action-card">
            <span className="action-icon"></span>
            <span className="action-label">{t('complianceCheck')}</span>
          </Link>
          <Link to="/templates" className="action-card">
            <span className="action-icon"></span>
            <span className="action-label">{t('policyTemplates')}</span>
          </Link>
          <Link to="/advisor" className="action-card">
            <span className="action-icon"></span>
            <span className="action-label">{t('aiAdvisor')}</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon"></span>
            <span className="action-label">{t('settings')}</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
