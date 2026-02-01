import React, { useEffect, useState } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const STORAGE_KEY = 'prep2_auth';

export default function HealthCheck({ user, token }) {
  const [status, setStatus] = useState({ healthy: true, issues: [] });

  useEffect(() => {
    let mounted = true;
    const issues = [];

    // quick checks
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && user == null) {
        issues.push('Malformed stored user (could not parse)');
      }
    } catch (err) {
      issues.push('Cannot read stored user');
    }

    if (user && !token) {
      issues.push('Logged-in user present but missing auth token');
    }

    if (token) {
      // very light JWT structure check (3 base64 parts)
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        issues.push('Auth token appears invalid (bad format)');
      }
    }

    // backend reachability check (fetch recent messages)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch(`${BACKEND}/api/messages/recent`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        if (mounted) {
          setStatus((s) => ({ healthy: issues.length === 0, issues }));
        }
      })
      .catch((err) => {
        if (mounted) {
          issues.push(`Backend unreachable: ${err.message}`);
          console.error('HealthCheck:', issues);
          setStatus({ healthy: false, issues });
        }
      });

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [user, token]);

  if (status.healthy) return null;

  return (
    <div className="max-w-4xl mx-auto p-2">
      <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded">
        <strong className="block">App health issues detected:</strong>
        <ul className="mt-1 list-disc list-inside text-sm">
          {status.issues.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
        <div className="mt-2 text-xs">Check browser console for detail.</div>
      </div>
    </div>
  );
}
