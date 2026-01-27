import React, { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    title: 'Prep2',
    please_sign_in: 'Please sign in to join the chat',
    hi: 'Hi',
    logout: 'Logout',
    login_welcome: 'Welcome back 👋',
    login_placeholder_id: 'Username or Email',
    login_placeholder_pw: 'Password',
    login_button: 'Login',
    register_title: 'Register',
    register_button: 'Register',
    chat_title: 'Global Group Chat',
    chat_placeholder: 'Write a friendly message...',
    resources_title: 'Resources',
    add_resource: 'Add Resource',
    forgot_password: 'Forgot password?',
    send_reset_token: 'Send reset token',
    reset_password: 'Reset password',
    logging_in: 'Logging in...',
    back_to_login: '← Back to login',
    forgot_fallback: 'Please use the "Forgot Password" form on the other tab or register again.',
    sending: 'Sending...',
    demo_token_text: 'Demo token (use in Reset Password):',
    saving: 'Saving...',
    not_connected: 'Not connected to chat',
    send: 'Send',
    email_placeholder: 'Email',
    password_placeholder: 'Password',
    title_placeholder: 'Title',
    link_placeholder: 'Link (https://...)',
    desc_placeholder: 'Short description (optional)',
    title_link_required: 'Title and link required',
    delete_confirm: 'Delete this resource?',
    posted_by: 'posted by',
    delete: 'Delete',
    failed: 'Failed',
    login_failed: 'Login failed',
    registration_failed: 'Registration failed',
    delete_failed: 'Delete failed',
    reset_success: 'Password reset successful — please login',
    reset_token_placeholder: 'Reset token',
    deleted: 'Deleted',
    language_saved: 'Language saved',
    create_account: 'Create Account',
    join_community: 'Join the 8th-grade community and share resources and chat.',
    login_title: 'Login',
    welcome_back: 'Welcome back — please enter your credentials to continue.',
    forgot_password_link: 'Forgot password? Recover',
    close: 'Close',
    community_terms: 'By registering you agree to the community rules and conduct.',
  },
  ar: {
    title:'الصف الثاني الاعدادي',
    please_sign_in: 'الرجاء تسجيل الدخول للانضمام إلى المحادثة',
    hi: 'مرحباً',
    logout: 'تسجيل الخروج',
    login_welcome: 'مرحباً بعودتك 👋',
    login_placeholder_id: 'اسم المستخدم أو البريد الإلكتروني',
    login_placeholder_pw: 'كلمة المرور',
    login_button: 'تسجيل الدخول',
    register_title: 'إنشاء حساب',
    register_button: 'تسجيل',
    chat_title: 'المحادثة الجماعية',
    chat_placeholder: 'اكتب رسالة ودية...',
    resources_title: 'الموارد',
    add_resource: 'إضافة مورد',
    forgot_password: 'نسيت كلمة المرور؟',
    send_reset_token: 'إرسال رمز إعادة التعيين',
    reset_password: 'إعادة تعيين كلمة المرور',
    logging_in: 'جاري تسجيل الدخول...',
    back_to_login: '← العودة لتسجيل الدخول',
    forgot_fallback: 'الرجاء استخدام استمارة "نسيت كلمة المرور" في التبويب الآخر أو إعادة التسجيل.',
    sending: 'جاري الإرسال...',
    demo_token_text: 'رمز العرض (استخدمه في استعادة كلمة المرور):',
    saving: 'جاري الحفظ...',
    not_connected: 'غير متصل بالمحادثة',
    send: 'إرسال',
    email_placeholder: 'البريد الإلكتروني',
    password_placeholder: 'كلمة المرور',
    title_placeholder: 'العنوان',
    link_placeholder: 'الرابط (https://...)',
    desc_placeholder: 'وصف قصير (اختياري)',
    title_link_required: 'العنوان والرابط مطلوبان',
    delete_confirm: 'هل تريد حذف هذا المورد؟',
    posted_by: 'نشر بواسطة',
    delete: 'حذف',
    failed: 'فشل',
    login_failed: 'فشل تسجيل الدخول',
    registration_failed: 'فشل التسجيل',
    delete_failed: 'فشل الحذف',
    reset_success: 'تم إعادة تعيين كلمة المرور — الرجاء تسجيل الدخول',
    reset_token_placeholder: 'رمز إعادة التعيين',
    deleted: 'تم الحذف',
    language_saved: 'تم حفظ اللغة',
    create_account: 'إنشاء حساب جديد',
    join_community: 'انضم إلى مجتمع الصف الثامن وشارك الموارد والمحادثات.',
    login_title: 'تسجيل الدخول',
    welcome_back: 'مرحبا بعودتك — الرجاء إدخال بياناتك للمتابعة.',
    forgot_password_link: 'هل نسيت كلمة المرور؟ استعادة',
    close: 'إغلاق',
    community_terms: 'بالتسجيل أنت توافق على القواعد والسلوكيات الخاصة بالمجتمع.',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      // 1) URL param ?lang=ar|en takes precedence
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('lang');
        if (q === 'ar' || q === 'en') {
          try { localStorage.setItem('prep2_lang', q); } catch {};
          return q;
        }
      }
      // 2) saved preference
      const saved = localStorage.getItem('prep2_lang');
      if (saved) return saved;
      // 3) default to Arabic (per request)
      return 'ar';
    } catch {
      return 'ar';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('prep2_lang', lang); } catch {}
    // set document direction
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}

export default translations;
