import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { saveReport } from '../services/reportService';

const API_BASE = 'http://localhost:8000/api';

// Utility functions
const getScoreClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'critical';
};

const getScoreBackground = (score) => {
  if (score >= 90) return 'rgba(34, 197, 94, 0.2)';
  if (score >= 75) return 'rgba(59, 130, 246, 0.2)';
  if (score >= 50) return 'rgba(234, 179, 8, 0.2)';
  if (score >= 25) return 'rgba(249, 115, 22, 0.2)';
  return 'rgba(239, 68, 68, 0.2)';
};

// Upload Component
const UploadSection = ({ onUploadSuccess, uploadedFile }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    
    const validTypes = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(ext)) {
      setError(`Invalid file type. Allowed: ${validTypes.join(', ')}`);
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div className="card animate-fade-in-up">
      <div className="card-title">Upload Document</div>
      
      {uploadedFile ? (
        <div className="file-info animate-scale-in">
          <div className="file-details">
            <h4>{uploadedFile.filename}</h4>
            <p>{uploadedFile.document_info?.word_count?.toLocaleString()} words • {uploadedFile.document_info?.char_count?.toLocaleString()} characters</p>
          </div>
        </div>
      ) : (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''} animate-pulse-border`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            type="file"
            id="fileInput"
            hidden
            accept=".pdf,.docx,.txt"
            onChange={handleChange}
          />
          
          {uploading ? (
            <>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <div className="upload-text">Uploading...</div>
            </>
          ) : (
            <>
              <div className="upload-icon animate-bounce-subtle">📁</div>
              <div className="upload-text">
                Drag & drop your document here or click to browse
              </div>
              <div className="upload-hint">
                Supported formats: PDF, DOCX, TXT
              </div>
            </>
          )}
        </div>
      )}
      
      {error && (
        <div style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
};

// Framework Selection Component
const FrameworkSelection = ({ frameworks, selectedFrameworks, onToggle }) => {
  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="card-title">Select Frameworks</div>
      
      <div className="framework-grid">
        {frameworks.map((fw, index) => (
          <div
            key={fw.id}
            className={`framework-card animate-scale-in ${selectedFrameworks.includes(fw.id) ? 'selected' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onToggle(fw.id)}
          >
            <h3>{fw.name}</h3>
            <p>{fw.country}</p>
            <span className={`framework-badge badge-${fw.language === 'Arabic' ? 'ar' : 'en'}`}>
              {fw.language} • {fw.control_count} controls
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Component
const ProgressSection = ({ progress, status }) => {
  if (status !== 'processing') return null;
  
  const percentage = progress?.percentage || 0;
  
  return (
    <div className="card animate-fade-in">
      <div className="card-title">Analyzing Compliance</div>
      
      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="progress-text">
          <span>Framework: {progress?.framework || '...'}</span>
          <span>{progress?.current_control || 0} / {progress?.total_controls || 0} controls</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        {progress?.control_id && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#94a3b8' }}>
            Evaluating: {progress.control_id}
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Section
const SummarySection = ({ summary, jobId, onSaveReport, saving, saved }) => {
  const [copied, setCopied] = React.useState(false);
  
  if (!summary) return null;
  
  const scoreClass = getScoreClass(summary.overall_score);
  
  const copyJobId = () => {
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="card animate-fade-in">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span>Overall Summary</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onSaveReport && (
            <button 
              className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
              onClick={onSaveReport}
              disabled={saving || saved}
              style={{ fontSize: '0.875rem' }}
            >
              {saving ? ' Saving...' : saved ? ' Saved' : ' Save Report'}
            </button>
          )}
          {jobId && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#94a3b8' }}>Job ID:</span>
              <code style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                color: '#10b981',
                fontFamily: 'monospace'
              }}>{jobId}</code>
              <button 
                onClick={copyJobId}
                style={{
                  background: copied ? '#10b981' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: copied ? 'white' : '#94a3b8',
                  fontSize: '0.8rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="summary-grid">
        <div className={`summary-card ${scoreClass} animate-scale-in`}>
          <div className={`summary-value score-${scoreClass}`}>
            {summary.overall_score?.toFixed(1)}%
          </div>
          <div className="summary-label">Overall Score</div>
        </div>
        
        <div className="summary-card good animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="summary-value" style={{ color: '#60a5fa' }}>
            {summary.total_controls_evaluated}
          </div>
          <div className="summary-label">Controls Evaluated</div>
        </div>
        
        <div className="summary-card excellent animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="summary-value" style={{ color: '#22c55e' }}>
            {summary.score_distribution?.excellent || 0}
          </div>
          <div className="summary-label">Excellent</div>
        </div>
        
        <div className="summary-card critical animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="summary-value" style={{ color: '#ef4444' }}>
            {summary.score_distribution?.critical || 0}
          </div>
          <div className="summary-label">Critical</div>
        </div>
      </div>
      
      {summary.top_recommendations?.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', color: '#f1f5f9' }}>
            Top Recommendations
          </h4>
          <ul className="recommendation-list">
            {summary.top_recommendations.slice(0, 5).map((rec, idx) => (
              <li key={idx} className="recommendation-item animate-slide-in-left" style={{ animationDelay: `${idx * 0.1}s` }}>
                <span className={`recommendation-priority priority-${rec.priority}`}>
                  {rec.priority?.toUpperCase()}
                </span>
                <span>{rec.recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Control Detail Modal
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
              {control.control_meta?.domain_name || control.control_meta?.function_name}
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
          
          {/* Layer Analysis */}
          {control.layer_scores && (
            <div className="detail-section">
              <h4>Multi-Layer Analysis</h4>
              <div className="layer-analysis">
                <div className="layer-card animate-scale-in">
                  <div className="layer-name">Layer 1</div>
                  <div className={`layer-score score-${getScoreClass(control.layer_scores.layer1 || 0)}`}>
                    {control.layer_scores.layer1 || 'N/A'}%
                  </div>
                </div>
                <div className="layer-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <div className="layer-name">Layer 2</div>
                  <div className={`layer-score score-${getScoreClass(control.layer_scores.layer2 || 0)}`}>
                    {control.layer_scores.layer2 || 'N/A'}%
                  </div>
                </div>
                <div className="layer-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <div className="layer-name">Layer 3</div>
                  <div className={`layer-score score-${getScoreClass(control.layer_scores.layer3 || 0)}`}>
                    {control.layer_scores.layer3 || 'N/A'}%
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {control.recommendations?.length > 0 && (
            <div className="detail-section">
              <h4>Recommendations</h4>
              <ul className="recommendation-list">
                {control.recommendations.map((rec, idx) => (
                  <li key={idx} className="recommendation-item animate-slide-in-left" style={{ animationDelay: `${idx * 0.1}s` }}>
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

// Domain Accordion Component
const DomainAccordion = ({ domainId, domain, onControlClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedSubs, setExpandedSubs] = useState({});
  
  const scoreClass = getScoreClass(domain.avg_score);
  const subKey = domain.subdomains ? 'subdomains' : 'categories';
  
  const toggleSub = (subId) => {
    setExpandedSubs(prev => ({ ...prev, [subId]: !prev[subId] }));
  };
  
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
            ({domain.control_count} controls)
          </span>
        </div>
        <div 
          className="domain-score"
          style={{ background: getScoreBackground(domain.avg_score) }}
        >
          <span className={`score-${scoreClass}`}>{domain.avg_score}%</span>
        </div>
      </div>
      
      {expanded && (
        <div className="domain-content animate-fade-in">
          {Object.entries(domain[subKey] || {}).map(([subId, sub]) => (
            <div key={subId} className="subdomain">
              <div 
                className="subdomain-header"
                onClick={() => toggleSub(subId)}
              >
                <div className="subdomain-name">
                  <span className={`chevron ${expandedSubs[subId] ? 'expanded' : ''}`}>▼</span>
                  {' '}{sub.name}
                </div>
                <div 
                  className="domain-score"
                  style={{ background: getScoreBackground(sub.avg_score), fontSize: '0.8rem' }}
                >
                  <span className={`score-${getScoreClass(sub.avg_score)}`}>
                    {sub.avg_score}%
                  </span>
                </div>
              </div>
              
              {expandedSubs[subId] && (
                <div className="control-list animate-fade-in">
                  {sub.controls?.map((control, idx) => (
                    <ControlCard 
                      key={idx} 
                      control={control} 
                      onClick={onControlClick}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Framework Results Component
const FrameworkResults = ({ results, onControlClick }) => {
  const [activeFramework, setActiveFramework] = useState(null);
  
  useEffect(() => {
    if (results && Object.keys(results).length > 0) {
      setActiveFramework(Object.keys(results)[0]);
    }
  }, [results]);
  
  if (!results || Object.keys(results).length === 0) return null;
  
  const currentResults = results[activeFramework];
  
  return (
    <div className="card animate-fade-in">
      <div className="card-title"> Detailed Results by Framework</div>
      
      {/* Framework Tabs */}
      <div className="framework-tabs">
        {Object.keys(results).map((fw) => (
          <div
            key={fw}
            className={`framework-tab ${activeFramework === fw ? 'active' : ''}`}
            onClick={() => setActiveFramework(fw)}
          >
            {fw.toUpperCase()} 
            <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
              ({results[fw].statistics?.average_score?.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
      
      {/* Statistics */}
      {currentResults?.statistics && (
        <div className="summary-grid" style={{ marginBottom: '1.5rem' }}>
          <div className={`summary-card ${getScoreClass(currentResults.statistics.average_score)}`}>
            <div className={`summary-value score-${getScoreClass(currentResults.statistics.average_score)}`}>
              {currentResults.statistics.average_score}%
            </div>
            <div className="summary-label">Average Score</div>
          </div>
          <div className="summary-card good">
            <div className="summary-value" style={{ color: '#22c55e' }}>
              {currentResults.statistics.fully_compliant_count}
            </div>
            <div className="summary-label">Fully Compliant</div>
          </div>
          <div className="summary-card critical">
            <div className="summary-value" style={{ color: '#ef4444' }}>
              {currentResults.statistics.needs_attention}
            </div>
            <div className="summary-label">Needs Attention</div>
          </div>
        </div>
      )}
      
      {/* Domain Accordions */}
      {currentResults?.structure && Object.entries(currentResults.structure).map(([domainId, domain]) => (
        <DomainAccordion 
          key={domainId}
          domainId={domainId}
          domain={domain}
          onControlClick={onControlClick}
        />
      ))}
    </div>
  );
};

// Main Compliance Checker Component
const ComplianceCheckerPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language, isRTL } = useLanguage();
  
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Fetch frameworks on mount
  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const response = await axios.get(`${API_BASE}/frameworks`);
        setFrameworks(response.data.frameworks);
        if (response.data.frameworks.length > 0) {
          setSelectedFrameworks([response.data.frameworks[0].id]);
        }
      } catch (err) {
        console.error('Failed to fetch frameworks:', err);
        // Use mock data if API not available
        setFrameworks([
          { id: 'nca_en', name: 'NCA ECC', language: 'English', country: 'Saudi Arabia', control_count: 114 },
          { id: 'nca_ar', name: 'الضوابط الأساسية', language: 'Arabic', country: 'Saudi Arabia', control_count: 114 },
          { id: 'nist_en', name: 'NIST CSF', language: 'English', country: 'USA', control_count: 108 }
        ]);
        setSelectedFrameworks(['nca_en']);
      }
    };
    fetchFrameworks();
  }, []);
  
  // Toggle framework selection
  const toggleFramework = (id) => {
    setSelectedFrameworks(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };
  
  // Handle upload success
  const handleUploadSuccess = (data) => {
    setUploadedFile(data);
    setJobStatus('uploaded');
    setResults(null);
    setSaved(false);
  };
  
  // Poll for job status
  const pollStatus = useCallback(async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE}/jobs/${jobId}`);
      setJobStatus(response.data.status);
      setProgress(response.data.progress);
      
      if (response.data.status === 'processing') {
        setTimeout(() => pollStatus(jobId), 2000);
      } else if (response.data.status === 'completed') {
        // Fetch results
        const resultsResponse = await axios.get(`${API_BASE}/results/${jobId}`);
        setResults(resultsResponse.data);
        setLoading(false);
      } else if (response.data.status === 'failed') {
        setError(response.data.error || 'Evaluation failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Poll error:', err);
      setError('Failed to get job status');
      setLoading(false);
    }
  }, []);
  
  // Start evaluation
  const startEvaluation = async () => {
    if (!uploadedFile || selectedFrameworks.length === 0) return;
    
    setLoading(true);
    setError(null);
    setJobStatus('processing');
    
    try {
      await axios.post(`${API_BASE}/evaluate`, {
        job_id: uploadedFile.job_id,
        frameworks: selectedFrameworks
      });
      
      pollStatus(uploadedFile.job_id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start evaluation');
      setLoading(false);
      setJobStatus('uploaded');
    }
  };
  
  // Save report to database
  const handleSaveReport = async () => {
    if (!isAuthenticated || !user || !uploadedFile || !results) return;
    
    setSaving(true);
    const result = await saveReport(user.id, uploadedFile, results);
    
    if (result.success) {
      setSaved(true);
    } else {
      setError(result.error || 'Failed to save report');
    }
    
    setSaving(false);
  };
  
  // Reset
  const reset = () => {
    setUploadedFile(null);
    setJobStatus(null);
    setProgress(null);
    setResults(null);
    setError(null);
    setSaved(false);
  };
  
  return (
    <div className={`app-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
        <div className="header-nav">
          <button className="back-btn" onClick={() => navigate(isRTL ? '/ar' : '/')}>
            {isRTL ? 'العودة للرئيسية →' : '← Back to Home'}
          </button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-secondary">
              {t('dashboard')}
            </Link>
          ) : (
            <div className="auth-prompt">
              <span>{t('loginToSave')}:</span>
              <Link to="/login" className="btn btn-secondary">{t('login')}</Link>
              <Link to="/signup" className="btn btn-primary">{t('signup')}</Link>
            </div>
          )}
        </div>
        <h1 className="animate-slide-in">🛡️ {t('complianceCheckerTitle')}</h1>
        <p className="animate-fade-in-delay">{isRTL ? 'ارفع سياسة الأمان واحصل على درجات امتثال فورية' : 'Upload your security policy and get instant compliance scores'}</p>
      </header>
      
      {/* Error Display */}
      {error && (
        <div className="card animate-shake" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
          <div style={{ color: '#ef4444' }}>⚠️ {error}</div>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}
      
      {/* Upload Section */}
      <UploadSection 
        onUploadSuccess={handleUploadSuccess}
        uploadedFile={uploadedFile}
      />
      
      {/* Framework Selection */}
      {frameworks.length > 0 && (
        <FrameworkSelection 
          frameworks={frameworks}
          selectedFrameworks={selectedFrameworks}
          onToggle={toggleFramework}
        />
      )}
      
      {/* Action Buttons */}
      {uploadedFile && jobStatus !== 'completed' && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} className="animate-fade-in-up">
          <button 
            className="btn btn-primary animate-pulse-glow"
            onClick={startEvaluation}
            disabled={loading || selectedFrameworks.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 20, height: 20 }}></span>
                {t('analyzing')}
              </>
            ) : (
              <> {t('analyzeBtn')}</>
            )}
          </button>
        </div>
      )}
      
      {/* Progress Section */}
      <ProgressSection progress={progress} status={jobStatus} />
      
      {/* Results */}
      {results && (
        <>
          <SummarySection 
            summary={results.summary} 
            jobId={uploadedFile?.job_id}
            onSaveReport={isAuthenticated ? handleSaveReport : null}
            saving={saving}
            saved={saved}
          />
          <FrameworkResults 
            results={results.frameworks}
            onControlClick={setSelectedControl}
          />
          
          {/* Action Buttons */}
          <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }} className="animate-fade-in">
            <button className="btn btn-secondary" onClick={reset}>
              {isRTL ? 'تحليل مستند آخر' : 'Analyze Another Document'}
            </button>
            {isAuthenticated && saved && (
              <Link to="/dashboard" className="btn btn-primary">
                {isRTL ? 'عرض في لوحة التحكم' : 'View in Dashboard'}
              </Link>
            )}
            <Link to="/advisor" className="btn btn-primary">
              {isRTL ? 'احصل على نصائح للتحسين' : 'Get Improvement Advice'}
            </Link>
          </div>
        </>
      )}
      
      {/* Control Detail Modal */}
      {selectedControl && (
        <ControlModal 
          control={selectedControl}
          onClose={() => setSelectedControl(null)}
        />
      )}
    </div>
  );
};

export default ComplianceCheckerPage;
