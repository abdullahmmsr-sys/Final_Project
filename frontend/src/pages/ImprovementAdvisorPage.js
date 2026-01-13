import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = 'http://localhost:8000/api';

// Utility function to get score color class
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

const ImprovementAdvisorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const { t, language, isRTL } = useLanguage();
  
  // Get job_id from location state or URL params
  const [jobId, setJobId] = useState(location.state?.jobId || '');
  const [reportSummary, setReportSummary] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'controls', 'plan'
  const [priorityPlan, setPriorityPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [error, setError] = useState(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load report summary when jobId changes
  useEffect(() => {
    if (jobId) {
      loadReportSummary();
    }
  }, [jobId]);

  const loadReportSummary = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE}/chatbot/report-summary/${jobId}`);
      setReportSummary(response.data);
      
      // Add welcome message based on language
      const welcomeMsg = isRTL 
        ? ` **تم تحميل تقرير الامتثال**

لقد قمت بتحليل تقرير الامتثال الخاص بك لـ **${response.data.filename}**.

**النتيجة الإجمالية: ${response.data.summary.overall_score?.toFixed(1)}%**

الملخص:
- 🔴 حرج (< 25%): ${response.data.summary.critical_count} ضوابط
- 🟠 ضعيف (25-49%): ${response.data.summary.poor_count} ضوابط  
- 🟡 متوسط (50-74%): ${response.data.summary.fair_count} ضوابط
- 🟢 جيد (≥ 75%): ${response.data.summary.good_count} ضوابط

**كيف يمكنني مساعدتك في تحسين درجة الامتثال؟**

يمكنك:
- طرح أسئلة عامة حول حالة الامتثال الخاصة بك
- النقر على ضابط محدد في علامة "الضوابط" للحصول على توصيات التحسين
- إنشاء خطة تحسين ذات أولوية في علامة "خطة التحسين"`
        : ` **Compliance Report Loaded**

I've analyzed your compliance report for **${response.data.filename}**.

**Overall Score: ${response.data.summary.overall_score?.toFixed(1)}%**

Summary:
- 🔴 Critical (< 25%): ${response.data.summary.critical_count} controls
- 🟠 Poor (25-49%): ${response.data.summary.poor_count} controls  
- 🟡 Fair (50-74%): ${response.data.summary.fair_count} controls
- 🟢 Good (≥ 75%): ${response.data.summary.good_count} controls

**How can I help you improve your compliance score?**

You can:
- Ask me general questions about your compliance status
- Click on a specific control in the "Controls" tab to get improvement recommendations
- Generate a prioritized improvement plan in the "Improvement Plan" tab`;

      setMessages([{
        type: 'assistant',
        content: welcomeMsg,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Failed to load report:', err);
      setError(err.response?.data?.detail || (isRTL ? 'فشل تحميل تقرير الامتثال' : 'Failed to load compliance report'));
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chatbot/chat`, {
        message: userMessage,
        job_id: jobId,
        session_id: sessionId,
        language: language // Pass language for Arabic responses
      });

      // Add assistant response
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        guidelines_referenced: response.data.guidelines_referenced
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        type: 'error',
        content: `${isRTL ? 'خطأ' : 'Error'}: ${err.response?.data?.detail || (isRTL ? 'فشل الحصول على الرد' : 'Failed to get response')}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetControlImprovement = async (control) => {
    setSelectedControl(control);
    setActiveTab('chat');
    setIsLoading(true);

    // Add user action message
    setMessages(prev => [...prev, {
      type: 'user',
      content: isRTL 
        ? `🔍 الحصول على توصيات التحسين للضابط **${control.control_id}** (النتيجة: ${control.final_score}%)`
        : `🔍 Get improvement recommendations for control **${control.control_id}** (Score: ${control.final_score}%)`,
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await axios.post(`${API_BASE}/chatbot/improve-control`, {
        job_id: jobId,
        control_id: control.control_id,
        framework_id: control.framework,
        session_id: sessionId,
        language: language // Pass language for Arabic responses
      });

      // Add assistant response
      const heading = isRTL 
        ? `## توصيات التحسين لـ ${control.control_id}`
        : `## Improvement Recommendations for ${control.control_id}`;
      const scoreLabel = isRTL ? 'النتيجة الحالية' : 'Current Score';
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `${heading}

**${scoreLabel}: ${response.data.current_score}%**

${response.data.recommendations}`,
        timestamp: new Date().toISOString(),
        guidelines_referenced: response.data.guidelines_used
      }]);
    } catch (err) {
      console.error('Control improvement error:', err);
      setMessages(prev => [...prev, {
        type: 'error',
        content: `${isRTL ? 'خطأ' : 'Error'}: ${err.response?.data?.detail || (isRTL ? 'فشل الحصول على التحسينات' : 'Failed to get improvements')}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePriorityPlan = async () => {
    setLoadingPlan(true);

    try {
      const response = await axios.post(`${API_BASE}/chatbot/priority-plan`, {
        job_id: jobId,
        session_id: sessionId,
        language: language // Pass language for Arabic responses
      });

      setPriorityPlan(response.data);
    } catch (err) {
      console.error('Priority plan error:', err);
      setError(err.response?.data?.detail || (isRTL ? 'فشل إنشاء خطة التحسين' : 'Failed to generate improvement plan'));
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format markdown-like content
  const formatMessage = (content) => {
    if (!content) return '';
    
    // Convert markdown headers
    let formatted = content
      .replace(/^### (.*$)/gm, '<h4 class="msg-h4">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="msg-h3">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="msg-h2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li><strong>$1.</strong> $2</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    
    return `<p>${formatted}</p>`;
  };

  // If no job ID, show input form
  if (!jobId || !reportSummary) {
    return (
      <div className={`chatbot-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="chatbot-header">
          <button className="back-btn" onClick={() => navigate(isRTL ? '/ar' : '/')}>
            {isRTL ? 'العودة للرئيسية ←' : '← Back to Home'}
          </button>
          <div className="header-content">
            <h1>🤖 {t('advisorTitle')}</h1>
            <p>{isRTL ? 'توصيات مدعومة بالذكاء الاصطناعي لتحسين درجة الامتثال' : 'AI-powered recommendations to improve your compliance score'}</p>
          </div>
        </header>

        <div className="chatbot-setup">
          <div className="setup-card">
            <h2>{isRTL ? 'تحميل تقرير الامتثال' : 'Load Compliance Report'}</h2>
            <p>{isRTL ? 'أدخل معرف الوظيفة من تحليل الامتثال المكتمل للحصول على توصيات تحسين مخصصة.' : 'Enter the Job ID from your completed compliance analysis to get personalized improvement recommendations.'}</p>
            
            {error && (
              <div className="setup-error">
                ⚠️ {error}
              </div>
            )}

            <div className="setup-form">
              <input
                type="text"
                placeholder={isRTL ? 'أدخل معرف الوظيفة (مثل: abc123-def456-...)' : 'Enter Job ID (e.g., abc123-def456-...)'}
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="setup-input"
              />
              <button 
                className="setup-btn"
                onClick={loadReportSummary}
                disabled={!jobId.trim()}
              >
                {isRTL ? 'تحميل التقرير' : 'Load Report'}
              </button>
            </div>

            <div className="setup-divider">
              <span>{isRTL ? 'أو' : 'or'}</span>
            </div>

            <button 
              className="setup-btn secondary"
              onClick={() => navigate('/compliance')}
            >
              {isRTL ? 'تشغيل تحليل امتثال جديد ←' : 'Run New Compliance Analysis →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chatbot-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="chatbot-header">
        <button className="back-btn" onClick={() => navigate(isRTL ? '/ar' : '/')}>
          {isRTL ? 'العودة للرئيسية ←' : '← Back to Home'}
        </button>
        <div className="header-content">
          <h1>🤖 {t('advisorTitle')}</h1>
          <p>{isRTL ? 'توصيات مدعومة بالذكاء الاصطناعي بناءً على إرشادات التنفيذ' : 'AI-powered recommendations based on implementation guidelines'}</p>
        </div>
        <div className="header-score">
          <div 
            className="score-badge"
            style={{ borderColor: getScoreColor(reportSummary.summary.overall_score) }}
          >
            <span 
              className="score-value"
              style={{ color: getScoreColor(reportSummary.summary.overall_score) }}
            >
              {reportSummary.summary.overall_score?.toFixed(1)}%
            </span>
            <span className="score-label">{isRTL ? 'الإجمالي' : 'Overall'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="chatbot-main">
        {/* Sidebar */}
        <aside className="chatbot-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
               {isRTL ? 'المحادثة' : 'Chat'}
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'controls' ? 'active' : ''}`}
              onClick={() => setActiveTab('controls')}
            >
               {isRTL ? 'الضوابط' : 'Controls'}
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'plan' ? 'active' : ''}`}
              onClick={() => setActiveTab('plan')}
            >
               {isRTL ? 'الخطة' : 'Plan'}
            </button>
          </div>

          {activeTab === 'controls' && (
            <div className="controls-list">
              <div className="controls-section">
                <h4>🔴 {isRTL ? 'حرج' : 'Critical'} ({reportSummary.summary.critical_count})</h4>
                {reportSummary.controls.critical.map((control, idx) => (
                  <div 
                    key={idx}
                    className="control-item critical"
                    onClick={() => handleGetControlImprovement(control)}
                  >
                    <span className="control-id">{control.control_id}</span>
                    <span className="control-score">{control.final_score}%</span>
                  </div>
                ))}
                {reportSummary.controls.critical.length === 0 && (
                  <p className="no-controls">{isRTL ? 'لا توجد ضوابط حرجة' : 'No critical controls'}</p>
                )}
              </div>

              <div className="controls-section">
                <h4>🟠 {isRTL ? 'ضعيف' : 'Poor'} ({reportSummary.summary.poor_count})</h4>
                {reportSummary.controls.poor.map((control, idx) => (
                  <div 
                    key={idx}
                    className="control-item poor"
                    onClick={() => handleGetControlImprovement(control)}
                  >
                    <span className="control-id">{control.control_id}</span>
                    <span className="control-score">{control.final_score}%</span>
                  </div>
                ))}
                {reportSummary.controls.poor.length === 0 && (
                  <p className="no-controls">{isRTL ? 'لا توجد ضوابط ضعيفة' : 'No poor controls'}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="plan-section">
              {!priorityPlan ? (
                <div className="plan-generate">
                  <p>{isRTL ? 'إنشاء خطة تحسين استراتيجية بناءً على نتائج الامتثال.' : 'Generate a strategic improvement plan based on your compliance results.'}</p>
                  <button 
                    className="generate-plan-btn"
                    onClick={handleGeneratePriorityPlan}
                    disabled={loadingPlan}
                  >
                    {loadingPlan ? (
                      <>
                        <span className="spinner small"></span>
                        {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
                      </>
                    ) : (
                      <> {isRTL ? 'إنشاء خطة التحسين' : 'Generate Improvement Plan'}</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="plan-summary">
                  <div className="plan-stats">
                    <div className="plan-stat">
                      <span className="stat-num">{priorityPlan.critical_controls_count}</span>
                      <span className="stat-label">{isRTL ? 'حرج' : 'Critical'}</span>
                    </div>
                    <div className="plan-stat">
                      <span className="stat-num">{priorityPlan.poor_controls_count}</span>
                      <span className="stat-label">{isRTL ? 'ضعيف' : 'Poor'}</span>
                    </div>
                    <div className="plan-stat">
                      <span className="stat-num">{priorityPlan.fair_controls_count}</span>
                      <span className="stat-label">{isRTL ? 'متوسط' : 'Fair'}</span>
                    </div>
                  </div>
                  <button 
                    className="view-plan-btn"
                    onClick={() => {
                      setActiveTab('chat');
                      setMessages(prev => [...prev, {
                        type: 'assistant',
                        content: `##  ${isRTL ? 'خطة التحسين الاستراتيجية' : 'Strategic Improvement Plan'}\n\n${priorityPlan.improvement_plan}`,
                        timestamp: new Date().toISOString()
                      }]);
                    }}
                  >
                    {isRTL ? 'عرض الخطة الكاملة في المحادثة' : 'View Full Plan in Chat'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="quick-actions">
              <h4>{t('quickActions')}</h4>
              <button 
                className="quick-action-btn"
                onClick={() => setInputMessage(isRTL ? 'ما هي أولوياتي الرئيسية للتحسين؟' : 'What are my top priorities for improvement?')}
              >
                 {isRTL ? 'الأولويات الرئيسية' : 'Top Priorities'}
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => setInputMessage(isRTL ? 'ما هي المكاسب السريعة التي يمكنني تحقيقها في الأسبوعين القادمين؟' : 'What quick wins can I achieve in the next 2 weeks?')}
              >
                 {isRTL ? 'مكاسب سريعة' : 'Quick Wins'}
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => setInputMessage(isRTL ? 'ما هي الضوابط الأكثر أهمية للأمن السيبراني؟' : 'Which controls are most critical for cybersecurity?')}
              >
                 {isRTL ? 'الضوابط الحرجة' : 'Critical Controls'}
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => setInputMessage(isRTL ? 'كيف يمكنني تحسين ضوابط الحوكمة؟' : 'How can I improve my governance controls?')}
              >
                 {isRTL ? 'مساعدة الحوكمة' : 'Governance Help'}
              </button>
            </div>
          )}
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.type === 'assistant' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                  {msg.guidelines_referenced > 0 && (
                    <div className="message-meta">
                      📚 {isRTL 
                        ? `تمت الإشارة إلى ${msg.guidelines_referenced} من إرشادات التنفيذ`
                        : `Referenced ${msg.guidelines_referenced} implementation guidelines`
                      }
                    </div>
                  )}
                </div>
                {msg.type === 'user' && (
                  <div className="message-avatar user">👤</div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRTL ? 'اسأل عن تحسين درجة الامتثال...' : 'Ask about improving your compliance score...'}
              disabled={isLoading}
              rows={1}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? '...' : '➤'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ImprovementAdvisorPage;
