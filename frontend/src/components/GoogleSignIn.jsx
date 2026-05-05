import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!clientId || !window.google) return;

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
      document.getElementById('google-signin-btn'),
      { theme: 'filled_black', size: 'large', width: '100%', text: 'continue_with' }
    );
  }, [clientId]);

  if (!clientId) {
    return (
      <div style={{ padding: '12px 16px', background: 'rgba(255,140,69,0.1)', border: '1px solid rgba(255,140,69,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--orange)', textAlign: 'center' }}>
        Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google Sign-In
      </div>
    );
  }

  return (
    <>
      {/* Google GSI script */}
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      <div id="google-signin-btn" style={{ width: '100%' }} />
    </>
  );
}
