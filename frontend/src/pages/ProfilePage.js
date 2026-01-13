import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserReports } from '../services/reportService';
import { supabase } from '../config/supabase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    organization: profile?.organization || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Export state
  const [exportLoading, setExportLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: isRTL ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!' });
      setEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || (isRTL ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile') });
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    // Always navigate to home regardless of signOut result
    navigate('/');
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage(null);

    const { newPassword, confirmPassword } = passwordData;

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters' });
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: isRTL ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!' });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || (isRTL ? 'فشل تغيير كلمة المرور' : 'Failed to change password') });
    }

    setPasswordLoading(false);
  };

  // Handle data export
  const handleExportData = async () => {
    setExportLoading(true);
    setMessage(null);

    try {
      // Fetch all user reports
      const result = await getUserReports(user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch reports');
      }

      // Prepare export data
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: user.email,
          fullName: profile?.full_name,
          organization: profile?.organization,
          memberSince: profile?.created_at
        },
        reports: result.reports.map(report => ({
          id: report.id,
          filename: report.filename,
          createdAt: report.created_at,
          overallScore: report.overall_score,
          totalControlsEvaluated: report.total_controls_evaluated,
          frameworks: report.frameworks,
          summary: report.summary
        })),
        totalReports: result.reports.length
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: isRTL ? 'تم تصدير البيانات بنجاح!' : 'Data exported successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || (isRTL ? 'فشل تصدير البيانات' : 'Failed to export data') });
    }

    setExportLoading(false);
  };

  if (authLoading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

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
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          {isRTL ? 'العودة للوحة التحكم ←' : '← Back to Dashboard'}
        </button>
        <h1>👤 {t('profileTitle')}</h1>
        <p>{isRTL ? 'إدارة إعدادات حسابك' : 'Manage your account settings'}</p>
      </header>

      {/* Message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} animate-fade-in`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="card animate-fade-in-up">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="profile-info">
            <h2>{profile?.full_name || (isRTL ? 'مستخدم' : 'User')}</h2>
            <p>{user?.email}</p>
            <span className="profile-badge">
              {profile?.role === 'admin' ? (isRTL ? '👑 مدير' : '👑 Admin') : (isRTL ? '👤 مستخدم' : '👤 User')}
            </span>
          </div>
        </div>

        {!editing ? (
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">{t('fullName')}</span>
              <span className="detail-value">{profile?.full_name || (isRTL ? 'غير محدد' : 'Not set')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('email')}</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{isRTL ? 'المنظمة' : 'Organization'}</span>
              <span className="detail-value">{profile?.organization || (isRTL ? 'غير محدد' : 'Not set')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('memberSince')}</span>
              <span className="detail-value">
                {new Date(profile?.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setFormData({
                    full_name: profile?.full_name || '',
                    organization: profile?.organization || ''
                  });
                  setEditing(true);
                }}
              >
                 {t('editProfile')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="full_name">{t('fullName')}</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder={t('fullNamePlaceholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">{isRTL ? 'المنظمة' : 'Organization'}</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder={isRTL ? 'أدخل اسم منظمتك' : 'Enter your organization name'}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner small"></span>
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <> {t('save')}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Actions */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-title"> {t('settings')}</div>
        
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-info">
              <h4>{t('changePassword')}</h4>
              <p>{isRTL ? 'تحديث كلمة المرور للأمان' : 'Update your password for security'}</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowPasswordModal(true)}
            >
               {isRTL ? 'تغيير' : 'Change'}
            </button>
          </div>

          <div className="settings-item">
            <div className="settings-info">
              <h4>{isRTL ? 'تصدير البيانات' : 'Export Data'}</h4>
              <p>{isRTL ? 'تحميل جميع تقاريرك وبياناتك' : 'Download all your reports and data'}</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportData}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <span className="spinner small"></span>
                  {isRTL ? 'جاري التصدير...' : 'Exporting...'}
                </>
              ) : (
                <> {isRTL ? 'تصدير' : 'Export'}</>
              )}
            </button>
          </div>

          <div className="settings-item danger">
            <div className="settings-info">
              <h4>{t('logout')}</h4>
              <p>{isRTL ? 'تسجيل الخروج من حسابك' : 'Sign out from your account'}</p>
            </div>
            <button className="btn btn-danger" onClick={handleSignOut}>
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm new password'}
                  minLength={6}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <span className="spinner small"></span>
                      {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>{isRTL ? 'حفظ' : 'Save'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
