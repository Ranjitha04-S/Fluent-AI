import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('fluentai_token', token);
      navigate('/dashboard');
    } else navigate('/login?error=oauth');
  }, []);
  return (
    <div className="page-loader">
      <div className="loader-spinner" />
    </div>
  );
}
