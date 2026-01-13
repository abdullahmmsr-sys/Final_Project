import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyTemplates, categories, sources } from '../data/policyTemplates';
import { useLanguage } from '../context/LanguageContext';

const PolicyTemplatesPage = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Filter templates based on category, source, and search
  const filteredTemplates = useMemo(() => {
    return policyTemplates.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSource = selectedSource === 'all' || template.source === selectedSource;
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSource && matchesSearch;
    });
  }, [selectedCategory, selectedSource, searchQuery]);

  // Group templates by category for stats
  const categoryStats = useMemo(() => {
    const stats = {};
    policyTemplates.forEach(template => {
      stats[template.category] = (stats[template.category] || 0) + 1;
    });
    return stats;
  }, []);

  // Group templates by source for stats
  const sourceStats = useMemo(() => {
    const stats = {};
    policyTemplates.forEach(template => {
      stats[template.source] = (stats[template.source] || 0) + 1;
    });
    return stats;
  }, []);

  const handleDownload = (template) => {
    // Determine the folder based on source
    let filePath;
    if (template.source === 'NCA Toolkit') {
      filePath = `/templates/nca-toolkit/${template.filename}`;
    } else {
      filePath = `/templates/${template.filename}`;
    }
    window.open(filePath, '_blank');
  };

  return (
    <div className={`templates-container ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="templates-header">
        <button className="back-btn" onClick={() => navigate(isRTL ? '/ar' : '/')}>
          {isRTL ? 'العودة للرئيسية ←' : '← Back to Home'}
        </button>
        <div className="header-content">
          <h1>📋 {t('templatesPageTitle')}</h1>
          <p>{t('templatesPageSubtitle')}</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{policyTemplates.length}</span>
            <span className="stat-text">{isRTL ? 'قالب' : 'Templates'}</span>
          </div>
          <div className="stat">
            <span className="stat-number">{categories.length - 1}</span>
            <span className="stat-text">{isRTL ? 'فئة' : 'Categories'}</span>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={t('searchTemplates')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
            <span className="tab-count">
              {category.id === 'all' ? policyTemplates.length : categoryStats[category.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Source Tabs */}
      <div className="source-tabs">
        <span className="source-label">{isRTL ? 'المصدر:' : 'Source:'}</span>
        {sources.map(source => (
          <button
            key={source.id}
            className={`source-tab ${selectedSource === source.id ? 'active' : ''}`}
            onClick={() => setSelectedSource(source.id)}
          >
            <span className="tab-name">{source.name}</span>
            <span className="tab-count">
              {source.id === 'all' ? policyTemplates.length : sourceStats[source.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>{t('noTemplatesMatch')}</h3>
            <p>{isRTL ? 'حاول تعديل البحث أو معايير التصفية' : 'Try adjusting your search or filter criteria'}</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedSource('all'); }}>
              {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
            </button>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="template-icon">{template.icon}</div>
              <div className="template-content">
                <h3>{template.name}</h3>
                <p className="template-description">{template.description}</p>
                <div className="template-tags">
                  {template.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="template-footer">
                <span className="template-category">{template.category}</span>
                <span className={`template-source ${template.source === 'NCA Toolkit' ? 'nca' : 'sans'}`}>
                  {template.source}
                </span>
                <button 
                  className="view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                  }}
                >
                  {isRTL ? 'عرض التفاصيل' : 'View Details'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="template-modal-overlay" onClick={() => setSelectedTemplate(null)}>
          <div className="template-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">{selectedTemplate.icon}</div>
              <div className="modal-title">
                <h2>{selectedTemplate.name}</h2>
                <span className="modal-category">{selectedTemplate.category}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedTemplate(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h4>{isRTL ? 'الوصف' : 'Description'}</h4>
                <p>{selectedTemplate.description}</p>
              </div>

              <div className="modal-section">
                <h4>{isRTL ? 'المجالات الرئيسية المغطاة' : 'Key Areas Covered'}</h4>
                <div className="modal-tags">
                  {selectedTemplate.tags.map((tag, idx) => (
                    <span key={idx} className="modal-tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h4>{isRTL ? 'معلومات الملف' : 'File Information'}</h4>
                <div className="file-info">
                  <span className="file-name">{selectedTemplate.filename}</span>
                </div>
              </div>

              <div className="modal-section usage-tips">
                <h4>💡 {isRTL ? 'نصائح الاستخدام' : 'Usage Tips'}</h4>
                <ul>
                  {isRTL ? (
                    <>
                      <li>راجع وخصص القالب ليتناسب مع احتياجات منظمتك</li>
                      <li>تأكد من التوافق مع السياسات والإجراءات الحالية</li>
                      <li>حدث العناصر النائبة بمعلومات منظمتك</li>
                      <li>اطلب مراجعة الوثيقة من الفرق القانونية وفرق الامتثال</li>
                    </>
                  ) : (
                    <>
                      <li>Review and customize the template to fit your organization's needs</li>
                      <li>Ensure alignment with your existing policies and procedures</li>
                      <li>Update placeholders with your organization-specific information</li>
                      <li>Have the document reviewed by legal and compliance teams</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedTemplate(null)}>
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleDownload(selectedTemplate)}
              >
                📥 {t('download')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyTemplatesPage;
