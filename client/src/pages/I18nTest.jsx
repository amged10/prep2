import React from 'react';
import translations, { useI18n } from '../i18n.jsx';

export default function I18nTest() {
  const { t, lang } = useI18n();
  const keys = Object.keys(translations.en).sort();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">i18n QA — translations</h2>
      <div className="overflow-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2 border">Key</th>
              <th className="p-2 border">EN</th>
              <th className="p-2 border">AR</th>
              <th className="p-2 border">Current ({lang})</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k} className="align-top">
                <td className="p-2 border align-top font-mono text-xs">{k}</td>
                <td className="p-2 border align-top">{translations.en[k] ?? ''}</td>
                <td className="p-2 border align-top">{translations.ar[k] ?? ''}</td>
                <td className="p-2 border align-top">{t(k)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
