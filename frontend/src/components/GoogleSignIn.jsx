import React, { useEffect, useId, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';

/**
 * Renders a Google One-Tap / Sign-In button.
 * Requires VITE_GOOGLE_CLIENT_ID to be set.
 */
export default function GoogleSignIn({ onError }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const buttonId = useId().replace(/:/g, '');
  const [isReady, setIsReady] = useState(Boolean(window.google?.accounts?.id));

  useEffect(() => {
    if (!clientId) return undefined;

    if (window.google?.accounts?.id) {
      setIsReady(true);
      return undefined;
    }

    const existingScript = document.querySelector('script[data-google-gsi]');
    if (existingScript) {
      const handleLoad = () => setIsReady(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = () => setIsReady(true);
    script.onerror = () => onError?.('Failed to load Google Sign-In');
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [clientId, onError]);

  useEffect(() => {
    if (!clientId || !isReady || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const { data } = await api.post('/auth/google', { token: credential });
          login(data.token, data.user);
          navigate('/dashboard');
        } catch (err) {
          onError?.(err.response?.data?.error || 'Google sign-in failed');
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById(buttonId),
      { theme: 'filled_black', size: 'large', width: '100%', text: 'continue_with' }
    );
  }, [buttonId, clientId, isReady, login, navigate, onError]);

  if (!clientId) {
    return (
      <div style={{ padding: '12px 16px', background: 'rgba(255,140,69,0.1)', border: '1px solid rgba(255,140,69,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--orange)', textAlign: 'center' }}>
        Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google Sign-In
      </div>
    );
  }

  return (
    <div id={buttonId} style={{ width: '100%', minHeight: 44 }} />
  );
}
