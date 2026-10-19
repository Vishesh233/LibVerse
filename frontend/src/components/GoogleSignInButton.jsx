import React, { useEffect, useRef, useState } from 'react';
import { authAPI } from '../services/api';
import { useDemoMode } from '../hooks/useDemoMode';

// Public OAuth client id (Google Cloud Console). Unset = no Google button anywhere.
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptPromise = null;
let serverStatus = null;

/** Load Google Identity Services once per page */
const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => { scriptPromise = null; reject(new Error('Google sign-in could not load')); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

const loadServerStatus = () => {
  if (!serverStatus) {
    serverStatus = authAPI.getGoogleStatus()
      .then((r) => Boolean(r.data?.enabled))
      .catch(() => { serverStatus = null; return false; });
  }
  return serverStatus;
};

/**
 * Whether Google sign-in can be offered: a client id in this build, the server has it on, and
 * this is not the live demo. null until known.
 */
export const useGoogleSignIn = () => {
  const demoMode = useDemoMode();
  const [server, setServer] = useState(CLIENT_ID ? null : false);
  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let active = true;
    loadServerStatus().then((value) => { if (active) setServer(value); });
    return () => { active = false; };
  }, []);
  if (!CLIENT_ID || server === false || demoMode === true) return false;
  if (server === null || demoMode === null) return null;
  return true;
};

/**
 * Google's own "Sign in with Google" button. Calls onCredential(idToken) after the user picks an
 * account; the server verifies the token.
 * @param {{ onCredential: (credential: string) => void, text?: 'signin_with' | 'signup_with' | 'continue_with', disabled?: boolean }} props
 */
export const GoogleSignInButton = ({ onCredential, text = 'continue_with', disabled = false }) => {
  const holder = useRef(null);
  const callback = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  callback.current = onCredential;

  useEffect(() => {
    let active = true;
    loadGoogleScript()
      .then((google) => {
        if (!active || !holder.current) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => { if (response?.credential) callback.current(response.credential); },
          ux_mode: 'popup',
          context: text === 'signup_with' ? 'signup' : 'signin',
        });
        holder.current.innerHTML = '';
        google.accounts.id.renderButton(holder.current, {
          type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill', text,
          logo_alignment: 'center', width: Math.min(400, holder.current.offsetWidth || 320),
        });
      })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [text]);

  if (failed) {
    return <p className="text-center text-xs text-slate-400">Google sign-in is unavailable right now. Use your email and password.</p>;
  }
  return (
    <div
      ref={holder}
      className={`flex min-h-[44px] w-full justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-busy={disabled || undefined}
    />
  );
};

export default GoogleSignInButton;
