import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRelatedReports, compareReports } from '../services/reportService';

// Score utilities
const getScoreColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#3b82f6';
  if (score >= 50) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#ef4444';
};

const getScoreClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'critical';
};

// Comparison Chart Component (Simple bar visualization)
const ImprovementChart = ({ controls }) => {
  const improved = controls.filter(c => c.score_diff > 0);
  const declined = controls.filter(c => c.score_diff < 0);
  const unchanged = controls.filter(c => c.score_diff === 0);
  
  const total = controls.length;
  
  return (
    <div className="improvement-chart">
      <div className="chart-bars">
        <div 
          className="chart-bar improved"
          style={{ width: `${(improved.length / total) * 100}%` }}
          title={`${improved.length} improved`}
        />
        <div 
          className="chart-bar unchanged"
          style={{ width: `${(unchanged.length / total) * 100}%` }}
          title={`${unchanged.length} unchanged`}
        />
        <div 
          className="chart-bar declined"
          style={{ width: `${(declined.length / total) * 100}%` }}
          title={`${declined.length} declined`}
        />
      </div>
      <div className="chart-legend">
        <span className="legend-item improved">
          <span className="legend-dot"></span>
          Improved ({improved.length})
        </span>
        <span className="legend-item unchanged">
          <span className="legend-dot"></span>
          Unchanged ({unchanged.length})
        </span>
        <span className="legend-item declined">
          <span className="legend-dot"></span>
          Declined ({declined.length})
        </span>
      </div>
    </div>
  );
};

// Control Comparison Card
const ControlComparisonCard = ({ control }) => {
  const diffClass = control.score_diff > 0 ? 'improved' : control.score_diff < 0 ? 'declined' : 'unchanged';
  
  return (
    <div className={`comparison-card ${diffClass}`}>
      <div className="comparison-header">
        <span className="control-id">{control.control_id}</span>
        <div className={`diff-badge ${diffClass}`}>
          {control.score_diff > 0 ? '+' : ''}{control.score_diff}%
          {control.score_diff > 0 ? ' ↑' : control.score_diff < 0 ? ' ↓' : ''}
        </div>
      </div>
      <div className="comparison-text">
        {control.control_text?.substring(0, 100)}
        {control.control_text?.length > 100 ? '...' : ''}
      </div>
      <div className="comparison-scores">
        <div className="score-before">
          <span className="score-label">Before</span>
          <span 
            className="score-value"
            style={{ color: getScoreColor(control.score_before) }}
          >
            {control.score_before}%
          </span>
        </div>
        <div className="score-arrow">→</div>
        <div className="score-after">
          <span className="score-label">After</span>
          <span 
            className="score-value"
            style={{ color: getScoreColor(control.score_after) }}
          >
            {control.score_after}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Compare Page
const ComparePage = () => {
  const navigate = useNavigate();
  const { fingerprint } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedReport1, setSelectedReport1] = useState(null);
  const [selectedReport2, setSelectedReport2] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user && fingerprint) {
      fetchRelatedReports();
    }
  }, [user, fingerprint]);

  const fetchRelatedReports = async () => {
    setLoading(true);
    const result = await getRelatedReports(user.id, fingerprint);
    
    if (result.success) {
      setReports(result.reports);
      
      // Auto-select first and last reports for comparison
      if (result.reports.length >= 2) {
        setSelectedReport1(result.reports[0].id);
        setSelectedReport2(result.reports[result.reports.length - 1].id);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const runComparison = async () => {
    if (!selectedReport1 || !selectedReport2) return;
    
    setComparing(true);
    const result = await compareReports(selectedReport1, selectedReport2);
    
    if (result.success) {
      setComparison(result.comparison);
    } else {
      setError(result.error);
    }
    
    setComparing(false);
  };

  // Auto-compare when both reports are selected
  useEffect(() => {
    if (selectedReport1 && selectedReport2 && selectedReport1 !== selectedReport2) {
      runComparison();
    }
  }, [selectedReport1, selectedReport2]);

  // Filter comparison controls
  const getFilteredControls = () => {
    if (!comparison) return [];
    
    return comparison.controls.filter(control => {
      if (filter === 'all') return true;
      if (filter === 'improved') return control.score_diff > 0;
      if (filter === 'declined') return control.score_diff < 0;
      if (filter === 'unchanged') return control.score_diff === 0;
      return true;
    });
  };

  if (authLoading || loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (reports.length < 2) {
    return (
      <div className="app-container">
        <header className="header animate-fade-in-up">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Compare Reports</h1>
        </header>
        
        <div className="empty-state">
          <h3>Not Enough Reports</h3>
          <p>You need at least 2 reports of the same document to compare improvements.</p>
          <button className="btn btn-primary" onClick={() => navigate('/compliance')}>
            Run Another Analysis
          </button>
        </div>
      </div>
    );
  }

  const filteredControls = getFilteredControls();

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
        <h1>Compare Reports</h1>
        <p>Track your compliance improvements over time</p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error animate-shake">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Report Selection */}
      <div className="card animate-fade-in-up">
        <div className="card-title">📁 Select Reports to Compare</div>
        
        <div className="report-selectors">
          <div className="report-selector">
            <label>Earlier Report (Before)</label>
            <select 
              value={selectedReport1 || ''} 
              onChange={(e) => setSelectedReport1(e.target.value)}
            >
              <option value="">Select a report...</option>
              {reports.map(report => (
                <option key={report.id} value={report.id} disabled={report.id === selectedReport2}>
                  {new Date(report.created_at).toLocaleDateString()} - {report.overall_score?.toFixed(1)}%
                </option>
              ))}
            </select>
          </div>
          
          <div className="compare-arrow">→</div>
          
          <div className="report-selector">
            <label>Later Report (After)</label>
            <select 
              value={selectedReport2 || ''} 
              onChange={(e) => setSelectedReport2(e.target.value)}
            >
              <option value="">Select a report...</option>
              {reports.map(report => (
                <option key={report.id} value={report.id} disabled={report.id === selectedReport1}>
                  {new Date(report.created_at).toLocaleDateString()} - {report.overall_score?.toFixed(1)}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparing ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Comparing reports...</p>
        </div>
      ) : comparison && (
        <>
          {/* Summary */}
          <div className="card animate-fade-in-up">
            <div className="card-title">Comparison Summary</div>
            
            <div className="comparison-summary">
              <div className="summary-comparison">
                <div className="comparison-item before">
                  <span className="comparison-label">Before</span>
                  <span 
                    className="comparison-score"
                    style={{ color: getScoreColor(comparison.summary.overall_score_before) }}
                  >
                    {comparison.summary.overall_score_before?.toFixed(1)}%
                  </span>
                  <span className="comparison-date">
                    {new Date(comparison.report1.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="comparison-arrow-big">
                  <div 
                    className={`improvement-indicator ${parseFloat(comparison.summary.overall_improvement) >= 0 ? 'positive' : 'negative'}`}
                  >
                    {parseFloat(comparison.summary.overall_improvement) >= 0 ? '+' : ''}
                    {comparison.summary.overall_improvement}%
                  </div>
                </div>
                
                <div className="comparison-item after">
                  <span className="comparison-label">After</span>
                  <span 
                    className="comparison-score"
                    style={{ color: getScoreColor(comparison.summary.overall_score_after) }}
                  >
                    {comparison.summary.overall_score_after?.toFixed(1)}%
                  </span>
                  <span className="comparison-date">
                    {new Date(comparison.report2.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <ImprovementChart controls={comparison.controls} />
              
              <div className="summary-stats">
                <div className="summary-stat improved">
                  <span className="stat-value">{comparison.summary.improved}</span>
                  <span className="stat-label">Improved</span>
                </div>
                <div className="summary-stat unchanged">
                  <span className="stat-value">{comparison.summary.unchanged}</span>
                  <span className="stat-label">Unchanged</span>
                </div>
                <div className="summary-stat declined">
                  <span className="stat-value">{comparison.summary.declined}</span>
                  <span className="stat-label">Declined</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-value">{comparison.summary.avg_improvement}%</span>
                  <span className="stat-label">Avg Change</span>
                </div>
              </div>
            </div>
          </div>

          {/* Control-by-Control Comparison */}
          <div className="card animate-fade-in-up">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span>Control-by-Control Comparison</span>
              
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({comparison.controls.length})
                </button>
                <button 
                  className={`filter-tab ${filter === 'improved' ? 'active' : ''}`}
                  onClick={() => setFilter('improved')}
                >
                  Improved ({comparison.summary.improved})
                </button>
                <button 
                  className={`filter-tab ${filter === 'declined' ? 'active' : ''}`}
                  onClick={() => setFilter('declined')}
                >
                  Declined ({comparison.summary.declined})
                </button>
                <button 
                  className={`filter-tab ${filter === 'unchanged' ? 'active' : ''}`}
                  onClick={() => setFilter('unchanged')}
                >
                  Unchanged ({comparison.summary.unchanged})
                </button>
              </div>
            </div>
            
            <div className="comparison-grid">
              {filteredControls.map((control, idx) => (
                <ControlComparisonCard key={idx} control={control} />
              ))}
            </div>
            
            {filteredControls.length === 0 && (
              <div className="empty-state">
                <p>No controls match this filter.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;
