import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReportDetails } from '../services/reportService';

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

const getScoreBackground = (score) => {
  return `${getScoreColor(score)}20`;
};

// Control Card Component
const ControlCard = ({ control, onClick }) => {
  const scoreClass = getScoreClass(control.final_score);
  
  return (
    <div className="control-card" onClick={() => onClick(control)}>
      <div className="control-header">
        <span className="control-id">{control.control_id}</span>
        <div className="control-text">
          {control.control_text?.substring(0, 150)}
          {control.control_text?.length > 150 ? '...' : ''}
        </div>
        <div 
          className="control-score"
          style={{ background: getScoreBackground(control.final_score) }}
        >
          <span className={`score-${scoreClass}`}>{control.final_score}%</span>
        </div>
      </div>
    </div>
  );
};

// Control Modal
const ControlModal = ({ control, onClose }) => {
  if (!control) return null;
  
  const scoreClass = getScoreClass(control.final_score);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ color: '#60a5fa', marginBottom: '0.25rem' }}>
              {control.control_id}
            </h3>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {control.domain_name} • {control.subdomain_name}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Score Circle */}
          <div 
            className="score-circle animate-scale-in"
            style={{ background: getScoreBackground(control.final_score) }}
          >
            <div className={`score-circle-value score-${scoreClass}`}>
              {control.final_score}%
            </div>
            <div className="score-circle-label">
              {control.compliance_status?.replace('_', ' ')}
            </div>
          </div>
          
          {/* Control Text */}
          <div className="detail-section">
            <h4>Control Requirement</h4>
            <div className="detail-content">
              {control.control_text}
            </div>
          </div>
          
          {/* Justification */}
          <div className="detail-section">
            <h4>Score Justification</h4>
            <div className="detail-content">
              {control.score_justification || 'No justification provided'}
            </div>
          </div>
          
          {/* Layer Scores */}
          {control.layer_scores && (
            <div className="detail-section">
              <h4>Multi-Layer Analysis</h4>
              <div className="layer-analysis">
                {Object.entries(control.layer_scores).map(([layer, score], idx) => (
                  <div key={layer} className="layer-card animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="layer-name">{layer}</div>
                    <div className={`layer-score score-${getScoreClass(score || 0)}`}>
                      {score || 'N/A'}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {control.recommendations?.length > 0 && (
            <div className="detail-section">
              <h4>Recommendations</h4>
              <ul className="recommendation-list">
                {control.recommendations.map((rec, idx) => (
                  <li key={idx} className="recommendation-item">
                    <span className={`recommendation-priority priority-${rec.priority}`}>
                      {rec.priority?.toUpperCase()}
                    </span>
                    <div>
                      <div>{rec.recommendation}</div>
                      {rec.expected_impact && (
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Expected Impact: +{rec.expected_impact}%
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Risk Level */}
          {control.risk_level && (
            <div className="detail-section">
              <h4>Risk Assessment</h4>
              <div className="detail-content">
                <strong>Risk Level:</strong> {control.risk_level?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Report Detail Page
const ReportDetailPage = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [report, setReport] = useState(null);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [activeFramework, setActiveFramework] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');

  useEffect(() => {
    if (user && reportId) {
      fetchReport();
    }
  }, [user, reportId]);

  const fetchReport = async () => {
    setLoading(true);
    const result = await getReportDetails(reportId);
    
    if (result.success) {
      setReport(result.report);
      setControls(result.controls);
      
      // Set first framework as active
      if (result.report.frameworks?.length > 0) {
        setActiveFramework(result.report.frameworks[0]);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Group controls by framework and domain
  const groupedControls = controls.reduce((acc, control) => {
    const fw = control.framework_id;
    if (!acc[fw]) {
      acc[fw] = {};
    }
    
    const domain = control.domain_name || 'Other';
    if (!acc[fw][domain]) {
      acc[fw][domain] = {
        name: domain,
        controls: [],
        avgScore: 0
      };
    }
    
    acc[fw][domain].controls.push(control);
    return acc;
  }, {});

  // Calculate domain averages
  Object.keys(groupedControls).forEach(fw => {
    Object.keys(groupedControls[fw]).forEach(domain => {
      const domainControls = groupedControls[fw][domain].controls;
      const avgScore = domainControls.reduce((sum, c) => sum + (c.final_score || 0), 0) / domainControls.length;
      groupedControls[fw][domain].avgScore = avgScore;
    });
  });

  // Filter controls
  const getFilteredControls = () => {
    if (!activeFramework || !groupedControls[activeFramework]) return {};
    
    const filtered = {};
    Object.entries(groupedControls[activeFramework]).forEach(([domain, data]) => {
      const filteredDomainControls = data.controls.filter(control => {
        const matchesSearch = 
          control.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          control.control_text?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterScore === 'all') return matchesSearch;
        if (filterScore === 'excellent') return matchesSearch && control.final_score >= 90;
        if (filterScore === 'good') return matchesSearch && control.final_score >= 75 && control.final_score < 90;
        if (filterScore === 'critical') return matchesSearch && control.final_score < 50;
        
        return matchesSearch;
      });
      
      if (filteredDomainControls.length > 0) {
        filtered[domain] = { ...data, controls: filteredDomainControls };
      }
    });
    
    return filtered;
  };

  if (authLoading || loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h2>📄 Report Not Found</h2>
          <p>The requested report could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredGroups = getFilteredControls();

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className="header animate-fade-in-up">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>📄 Report Details</h1>
        <p>{report.filename}</p>
      </header>

      {/* Report Summary */}
      <div className="card animate-fade-in-up">
        <div className="card-title">Report Summary</div>
        
        <div className="summary-grid">
          <div className={`summary-card ${getScoreClass(report.overall_score)}`}>
            <div className={`summary-value score-${getScoreClass(report.overall_score)}`}>
              {report.overall_score?.toFixed(1)}%
            </div>
            <div className="summary-label">Overall Score</div>
          </div>
          
          <div className="summary-card good">
            <div className="summary-value" style={{ color: '#60a5fa' }}>
              {report.total_controls_evaluated}
            </div>
            <div className="summary-label">Controls Evaluated</div>
          </div>
          
          <div className="summary-card excellent">
            <div className="summary-value" style={{ color: '#22c55e' }}>
              {report.summary?.score_distribution?.excellent || 0}
            </div>
            <div className="summary-label">Excellent</div>
          </div>
          
          <div className="summary-card critical">
            <div className="summary-value" style={{ color: '#ef4444' }}>
              {report.summary?.score_distribution?.critical || 0}
            </div>
            <div className="summary-label">Critical</div>
          </div>
        </div>
        
        <div className="report-meta">
          <span>{new Date(report.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</span>
          <span>Job ID: {report.job_id}</span>
        </div>
      </div>

      {/* Framework Tabs */}
      {report.frameworks?.length > 1 && (
        <div className="framework-tabs animate-fade-in-up">
          {report.frameworks.map(fw => (
            <button
              key={fw}
              className={`framework-tab ${activeFramework === fw ? 'active' : ''}`}
              onClick={() => setActiveFramework(fw)}
            >
              {fw.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Controls Section */}
      <div className="card animate-fade-in-up">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span>Control Results</span>
          
          <div className="controls-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={filterScore} 
              onChange={(e) => setFilterScore(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Scores</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (75%+)</option>
              <option value="critical">Critical (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Domain Accordions */}
        {Object.entries(filteredGroups).length === 0 ? (
          <div className="empty-state">
            <p>No controls match your filters.</p>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([domainName, domain]) => (
            <DomainAccordion
              key={domainName}
              domain={domain}
              onControlClick={setSelectedControl}
            />
          ))
        )}
      </div>

      {/* Control Modal */}
      {selectedControl && (
        <ControlModal
          control={selectedControl}
          onClose={() => setSelectedControl(null)}
        />
      )}
    </div>
  );
};

// Domain Accordion Component
const DomainAccordion = ({ domain, onControlClick }) => {
  const [expanded, setExpanded] = useState(false);
  const scoreClass = getScoreClass(domain.avgScore);
  
  return (
    <div className="domain-accordion">
      <div 
        className={`domain-header ${expanded ? 'expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="domain-info">
          <span className={`chevron ${expanded ? 'expanded' : ''}`}>▼</span>
          <span className="domain-name">{domain.name}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            ({domain.controls.length} controls)
          </span>
        </div>
        <div 
          className="domain-score"
          style={{ background: getScoreBackground(domain.avgScore) }}
        >
          <span className={`score-${scoreClass}`}>{domain.avgScore.toFixed(1)}%</span>
        </div>
      </div>
      
      {expanded && (
        <div className="domain-content animate-fade-in">
          <div className="control-list">
            {domain.controls.map((control, idx) => (
              <ControlCard 
                key={idx} 
                control={control} 
                onClick={onControlClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;
