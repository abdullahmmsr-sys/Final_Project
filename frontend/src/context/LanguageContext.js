import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

// Comprehensive translations
export const translations = {
  en: {
    // Navigation
    login: 'Login',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    profile: 'Profile',
    logout: 'Logout',
    home: 'Home',
    
    // Landing page
    badge: 'AI-Powered Compliance',
    heroTitle1: 'Cybersecurity',
    heroTitle2: 'Compliance Platform',
    heroSubtitle: 'Automate your compliance checks with AI-powered analysis. Get detailed scores, recommendations, and improvement plans for NCA, NIST, and more.',
    frameworks: 'Frameworks',
    templates: 'Templates',
    controls: 'Controls',
    getStarted: 'Get Started Free →',
    tryWithoutAccount: 'Try Without Account',
    goToDashboard: 'Go to Dashboard →',
    chooseYourTool: 'Choose Your Tool',
    chooseToolSubtitle: 'Select the feature that best fits your compliance needs',
    exploreFeature: 'Explore Feature →',
    whyChoose: 'Why Choose Our Platform?',
    benefit1Title: 'AI-Powered Analysis',
    benefit1Desc: 'Advanced LLM technology for accurate compliance assessment',
    benefit2Title: 'Multiple Frameworks',
    benefit2Desc: 'Support for NCA, NIST, and other major standards',
    benefit3Title: 'Actionable Insights',
    benefit3Desc: 'Clear recommendations to improve your security posture',
    benefit4Title: 'Time Saving',
    benefit4Desc: 'Reduce manual compliance checking from days to minutes',
    
    // Features
    complianceCheckerTitle: 'Compliance Checker',
    complianceCheckerDesc: 'Upload your security policies and get instant compliance scores against multiple frameworks.',
    complianceCheckerF1: 'Multi-layer LLM analysis',
    complianceCheckerF2: 'Detailed control-by-control scoring',
    complianceCheckerF3: 'Gap identification & recommendations',
    complianceCheckerF4: 'Support for NCA, NIST, and more',
    
    advisorTitle: 'Improvement Advisor',
    advisorDesc: 'Get AI-powered recommendations to improve your compliance posture and close gaps.',
    advisorF1: 'Interactive AI chatbot',
    advisorF2: 'Priority-based action plans',
    advisorF3: 'Control-specific guidance',
    advisorF4: 'Implementation roadmaps',
    
    templatesTitle: 'Policy Templates',
    templatesDesc: 'Access 119+ ready-to-use security policy templates from SANS and NCA Toolkit.',
    templatesF1: '36 SANS policy templates',
    templatesF2: '83 NCA Cybersecurity Toolkit templates',
    templatesF3: 'Customizable documents',
    templatesF4: 'Industry best practices',
    
    // Compliance Checker page
    uploadTitle: 'Upload Your Policy Document',
    uploadDrag: 'Drag & drop your file here, or',
    uploadBrowse: 'browse files',
    uploadSupported: 'Supported: PDF, DOCX, TXT (Max 10MB)',
    selectFrameworks: 'Select Compliance Frameworks',
    analyzeBtn: 'Analyze Compliance',
    analyzing: 'Analyzing...',
    results: 'Compliance Results',
    overallScore: 'Overall Score',
    controlsAnalyzed: 'Controls Analyzed',
    gapsFound: 'Gaps Found',
    recommendations: 'Recommendations',
    saveReport: 'Save Report',
    saving: 'Saving...',
    reportSaved: 'Report saved! View in',
    loginToSave: 'Login to save reports',
    controlDetails: 'Control Details',
    filterAll: 'All',
    filterCompliant: 'Compliant',
    filterPartial: 'Partial',
    filterNonCompliant: 'Non-Compliant',
    status: 'Status',
    score: 'Score',
    evidence: 'Evidence',
    noEvidence: 'No evidence found',
    noResults: 'No controls match your filter',
    removeFile: 'Remove',
    uploadNew: 'Upload New Document',
    analysisComplete: 'Analysis Complete',
    
    // Dashboard
    dashboardTitle: 'Dashboard',
    welcome: 'Welcome back',
    totalReports: 'Total Reports',
    avgScore: 'Average Score',
    improvementsLabel: 'Improvements',
    recentReports: 'Recent Reports',
    viewAll: 'View All',
    noReports: 'No reports yet',
    startFirst: 'Start your first compliance check',
    newCheck: 'New Compliance Check',
    viewReport: 'View Report',
    compare: 'Compare',
    delete: 'Delete',
    searchReports: 'Search reports...',
    filter: 'Filter',
    all: 'All',
    quickActions: 'Quick Actions',
    complianceCheck: 'Compliance Check',
    policyTemplates: 'Policy Templates',
    aiAdvisor: 'AI Advisor',
    
    // Auth pages
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to your account',
    signupTitle: 'Create Account',
    signupSubtitle: 'Start your compliance journey',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Create a password (min. 6 characters)',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginBtn: 'Sign In',
    signupBtn: 'Create Account',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    orContinue: 'Or continue with',
    backToHome: '← Back to home',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    signupSuccess: 'Account Created!',
    checkEmail: 'Please check your email to verify your account before logging in.',
    goToLogin: 'Go to Login',
    
    // Profile
    profileTitle: 'Profile',
    accountInfo: 'Account Information',
    settings: 'Settings',
    editProfile: 'Edit Profile',
    save: 'Save Changes',
    cancel: 'Cancel',
    memberSince: 'Member since',
    reportsCreated: 'Reports Created',
    changePassword: 'Change Password',
    deleteAccount: 'Delete Account',
    deleteWarning: 'This action cannot be undone',
    
    // Templates page
    templatesPageTitle: 'Policy Templates',
    templatesPageSubtitle: 'Access ready-to-use security policy templates from SANS and NCA Cybersecurity Toolkit',
    searchTemplates: 'Search templates...',
    allTemplates: 'All Templates',
    sansTemplates: 'SANS Templates',
    ncaToolkit: 'NCA Toolkit',
    download: 'Download',
    preview: 'Preview',
    noTemplatesMatch: 'No templates match your search',
    
    // Advisor page
    advisorPageTitle: 'Improvement Advisor',
    advisorPageSubtitle: 'Get AI-powered recommendations for improving your compliance posture',
    askPlaceholder: 'Ask about compliance improvements...',
    send: 'Send',
    thinking: 'Thinking...',
    suggestedQuestions: 'Suggested Questions',
    
    // Compare page
    compareTitle: 'Compare Reports',
    selectReports: 'Select reports to compare',
    before: 'Before',
    after: 'After',
    improvement: 'Improvement',
    improved: 'Improved',
    unchanged: 'Unchanged',
    declined: 'Declined',
    controlsImproved: 'Controls Improved',
    noChange: 'No Change',
    needsAttention: 'Needs Attention',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    close: 'Close',
    confirm: 'Confirm',
    or: 'or'
  },
  
  ar: {
    // Navigation
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    home: 'الرئيسية',
    
    // Landing page
    badge: 'امتثال مدعوم بالذكاء الاصطناعي',
    heroTitle1: 'منصة امتثال',
    heroTitle2: 'الأمن السيبراني',
    heroSubtitle: 'قم بأتمتة فحوصات الامتثال الخاصة بك باستخدام التحليل المدعوم بالذكاء الاصطناعي. احصل على درجات مفصلة وتوصيات وخطط تحسين للهيئة الوطنية للأمن السيبراني و NIST والمزيد.',
    frameworks: 'أطر عمل',
    templates: 'قالب',
    controls: 'ضابط',
    getStarted: 'ابدأ مجاناً ←',
    tryWithoutAccount: 'جرب بدون حساب',
    goToDashboard: 'الذهاب للوحة التحكم ←',
    chooseYourTool: 'اختر أداتك',
    chooseToolSubtitle: 'اختر الميزة التي تناسب احتياجات الامتثال الخاصة بك',
    exploreFeature: '← استكشف الميزة',
    whyChoose: 'لماذا تختار منصتنا؟',
    benefit1Title: 'تحليل بالذكاء الاصطناعي',
    benefit1Desc: 'تقنية LLM متقدمة لتقييم امتثال دقيق',
    benefit2Title: 'أطر متعددة',
    benefit2Desc: 'دعم NCA و NIST والمعايير الرئيسية الأخرى',
    benefit3Title: 'رؤى قابلة للتنفيذ',
    benefit3Desc: 'توصيات واضحة لتحسين وضعك الأمني',
    benefit4Title: 'توفير الوقت',
    benefit4Desc: 'تقليل فحص الامتثال اليدوي من أيام إلى دقائق',
    
    // Features
    complianceCheckerTitle: 'مدقق الامتثال',
    complianceCheckerDesc: 'قم برفع سياسات الأمان الخاصة بك واحصل على درجات امتثال فورية مقابل أطر عمل متعددة.',
    complianceCheckerF1: 'تحليل متعدد الطبقات بالذكاء الاصطناعي',
    complianceCheckerF2: 'تقييم تفصيلي لكل ضابط',
    complianceCheckerF3: 'تحديد الثغرات والتوصيات',
    complianceCheckerF4: 'دعم NCA و NIST والمزيد',
    
    advisorTitle: 'مستشار التحسين',
    advisorDesc: 'احصل على توصيات مدعومة بالذكاء الاصطناعي لتحسين وضع الامتثال الخاص بك وسد الثغرات.',
    advisorF1: 'روبوت محادثة ذكي تفاعلي',
    advisorF2: 'خطط عمل حسب الأولوية',
    advisorF3: 'إرشادات خاصة بكل ضابط',
    advisorF4: 'خرائط طريق للتنفيذ',
    
    templatesTitle: 'قوالب السياسات',
    templatesDesc: 'الوصول إلى أكثر من 119 قالب سياسة أمان جاهز للاستخدام من SANS وأدوات الهيئة.',
    templatesF1: '36 قالب سياسة من SANS',
    templatesF2: '83 قالب من أدوات الأمن السيبراني',
    templatesF3: 'مستندات قابلة للتخصيص',
    templatesF4: 'أفضل الممارسات في الصناعة',
    
    // Compliance Checker page
    uploadTitle: 'ارفع مستند السياسة',
    uploadDrag: 'اسحب وأفلت ملفك هنا، أو',
    uploadBrowse: 'تصفح الملفات',
    uploadSupported: 'المدعوم: PDF, DOCX, TXT (حد أقصى 10 ميجابايت)',
    selectFrameworks: 'اختر أطر الامتثال',
    analyzeBtn: 'تحليل الامتثال',
    analyzing: 'جاري التحليل...',
    results: 'نتائج الامتثال',
    overallScore: 'الدرجة الإجمالية',
    controlsAnalyzed: 'الضوابط المحللة',
    gapsFound: 'الثغرات المكتشفة',
    recommendations: 'التوصيات',
    saveReport: 'حفظ التقرير',
    saving: 'جاري الحفظ...',
    reportSaved: 'تم حفظ التقرير! عرض في',
    loginToSave: 'سجل الدخول لحفظ التقارير',
    controlDetails: 'تفاصيل الضوابط',
    filterAll: 'الكل',
    filterCompliant: 'متوافق',
    filterPartial: 'جزئي',
    filterNonCompliant: 'غير متوافق',
    status: 'الحالة',
    score: 'الدرجة',
    evidence: 'الدليل',
    noEvidence: 'لم يتم العثور على دليل',
    noResults: 'لا توجد ضوابط تطابق الفلتر',
    removeFile: 'إزالة',
    uploadNew: 'رفع مستند جديد',
    analysisComplete: 'اكتمل التحليل',
    
    // Dashboard
    dashboardTitle: 'لوحة التحكم',
    welcome: 'مرحباً بعودتك',
    totalReports: 'إجمالي التقارير',
    avgScore: 'متوسط الدرجة',
    improvementsLabel: 'التحسينات',
    recentReports: 'التقارير الأخيرة',
    viewAll: 'عرض الكل',
    noReports: 'لا توجد تقارير بعد',
    startFirst: 'ابدأ أول فحص امتثال',
    newCheck: 'فحص امتثال جديد',
    viewReport: 'عرض التقرير',
    compare: 'مقارنة',
    delete: 'حذف',
    searchReports: 'البحث في التقارير...',
    filter: 'فلتر',
    all: 'الكل',
    quickActions: 'إجراءات سريعة',
    complianceCheck: 'فحص الامتثال',
    policyTemplates: 'قوالب السياسات',
    aiAdvisor: 'المستشار الذكي',
    
    // Auth pages
    loginTitle: 'مرحباً بعودتك',
    loginSubtitle: 'سجل الدخول إلى حسابك',
    signupTitle: 'إنشاء حساب',
    signupSubtitle: 'ابدأ رحلة الامتثال الخاصة بك',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أنشئ كلمة مرور (6 أحرف على الأقل)',
    confirmPassword: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'أكد كلمة المرور',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أدخل اسمك الكامل',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    loginBtn: 'تسجيل الدخول',
    signupBtn: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    orContinue: 'أو تابع باستخدام',
    backToHome: 'العودة للرئيسية →',
    signingIn: 'جاري تسجيل الدخول...',
    creatingAccount: 'جاري إنشاء الحساب...',
    signupSuccess: 'تم إنشاء الحساب!',
    checkEmail: 'يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك قبل تسجيل الدخول.',
    goToLogin: 'الذهاب لتسجيل الدخول',
    
    // Profile
    profileTitle: 'الملف الشخصي',
    accountInfo: 'معلومات الحساب',
    settings: 'الإعدادات',
    editProfile: 'تعديل الملف',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    memberSince: 'عضو منذ',
    reportsCreated: 'التقارير المنشأة',
    changePassword: 'تغيير كلمة المرور',
    deleteAccount: 'حذف الحساب',
    deleteWarning: 'لا يمكن التراجع عن هذا الإجراء',
    
    // Templates page
    templatesPageTitle: 'قوالب السياسات',
    templatesPageSubtitle: 'الوصول إلى قوالب سياسات الأمان الجاهزة من SANS وأدوات الهيئة للأمن السيبراني',
    searchTemplates: 'البحث في القوالب...',
    allTemplates: 'كل القوالب',
    sansTemplates: 'قوالب SANS',
    ncaToolkit: 'أدوات الهيئة',
    download: 'تحميل',
    preview: 'معاينة',
    noTemplatesMatch: 'لا توجد قوالب تطابق بحثك',
    
    // Advisor page
    advisorPageTitle: 'مستشار التحسين',
    advisorPageSubtitle: 'احصل على توصيات مدعومة بالذكاء الاصطناعي لتحسين وضع الامتثال',
    askPlaceholder: 'اسأل عن تحسينات الامتثال...',
    send: 'إرسال',
    thinking: 'جاري التفكير...',
    suggestedQuestions: 'أسئلة مقترحة',
    
    // Compare page
    compareTitle: 'مقارنة التقارير',
    selectReports: 'اختر التقارير للمقارنة',
    before: 'قبل',
    after: 'بعد',
    improvement: 'التحسين',
    improved: 'تحسن',
    unchanged: 'بدون تغيير',
    declined: 'انخفض',
    controlsImproved: 'الضوابط المحسنة',
    noChange: 'بدون تغيير',
    needsAttention: 'يحتاج اهتمام',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    back: 'رجوع',
    next: 'التالي',
    submit: 'إرسال',
    close: 'إغلاق',
    confirm: 'تأكيد',
    or: 'أو'
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    if (window.location.pathname.startsWith('/ar')) return 'ar';
    return 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  // Translation helper - get translation by key
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      toggleLanguage, 
      isRTL,
      t,
      translations 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
