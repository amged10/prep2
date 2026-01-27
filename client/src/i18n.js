// Lightweight compatibility shim: re-export from the JSX module so imports that reference
// ./i18n (without extension) keep working. This file contains no JSX so the Vite import
// analysis won't choke on it.
export { LanguageProvider, useI18n, default as translations } from './i18n.jsx';
