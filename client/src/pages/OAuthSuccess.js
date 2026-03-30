import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState('Signing you in with Google...');

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      setMsg('Login failed. Redirecting...');
      setTimeout(() => { window.location.href = '/login?error=oauth'; }, 2000);
      return;
    }

    localStorage.setItem('fluentai_token', token);
    setMsg('✅ Success! Loading your dashboard...');

    // window.location.href forces full reload
    // so AuthContext re-reads token from localStorage
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
  }, []);

  return (
    <div className="page-loader">
      <div style={{ textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 20px' }} />
        <div style={{ color: 'var(--text2)', fontSize: 15, fontWeight: 500 }}>
          {msg}
        </div>
      </div>
    </div>
  );
}