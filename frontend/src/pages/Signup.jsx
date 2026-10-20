import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components/UI';
import { LogoMark } from '../components/LogoMark';
import { GoogleSignInButton, useGoogleSignIn } from '../components/GoogleSignInButton';
import { VerifyEmailForm } from '../components/auth/VerifyEmailForm';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (name, value) => {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Enter your full name';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return '';
    case 'email':
      if (!value.trim()) return 'Enter your email address';
      if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
      return '';
    case 'password':
      if (!value) return 'Choose a password';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return '';
    default:
      return '';
  }
};

const REQUIRED_FIELDS = ['name', 'email', 'password'];

const Field = ({ id, label, error, hint, children }) => (
  <div>
    <label htmlFor={id} className="field-label">{label}</label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="field-error">{error}</p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
    )}
  </div>
);

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(null); // set after sign-up when the email must be confirmed
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleEnabled = useGoogleSignIn();

  // Sign in with Google: an existing account (or a connected student account) signs in; a new
  // Google user becomes a student and goes through onboarding (phone and genres)
  const [googleBusy, setGoogleBusy] = useState(false);
  const handleGoogle = async (credential) => {
    setGoogleBusy(true);
    setError('');
    try {
      const response = await authAPI.googleLogin(credential);
      const { token, user } = response.data;
      login(user, token);
      toast.success(response.data.created ? 'Welcome to LibVerse!' : 'Signed in with Google');
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'librarian') navigate('/librarian');
      else navigate(user?.isOnboardingCompleted ? '/student/dashboard' : '/student/onboarding');
    } catch (err) {
      const message = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!REQUIRED_FIELDS.includes(name)) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((name) => {
      const message = validateField(name, formData[name]);
      if (message) nextErrors[name] = message;
    });
    setErrors(nextErrors);
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.signup({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      // With email set up, the account is confirmed with an emailed code first
      if (response.data.verificationRequired) {
        setVerifyEmail(response.data.email || formData.email.trim());
        toast.success('Account created. Check your email for the code.');
        return;
      }
      const { token, user } = response.data;
      login(user, token);
      toast.success('Account created. Welcome to LibVerse!');
      navigate('/student/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (name) => ({
    id: `signup-${name}`,
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `signup-${name}-error` : undefined,
    className: `input-amo w-full ${errors[name] ? '!border-rose-500/70' : ''}`,
  });

  return (
    <div className="auth-page min-h-screen flex items-center justify-center bg-gradient-to-br from-[#02040f] via-[#040813] to-[#0b1534] px-4 py-[clamp(12px,4vh,40px)]">
      <Card variant="glass" className="auth-card signup-card text-slate-100 shadow-[0_50px_120px_rgba(8,12,34,0.55)]">
        <div className="signup-head border-b border-white/10 text-center">
          <div className="signup-logo mb-5 inline-flex items-center gap-3">
            <LogoMark size="md" />
            <div className="text-left">
              <p className="brand-wordmark text-2xl font-bold leading-none">
                Lib<span className="brand-wordmark-accent">Verse</span>
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">Library Management System</p>
            </div>
          </div>
          <h1 className="signup-title font-display text-3xl font-bold text-white">Create account</h1>
          <p className="signup-sub text-sm text-slate-400 mt-2">Join the library and start exploring.</p>
        </div>

        {verifyEmail ? (
          <VerifyEmailForm
            email={verifyEmail}
            onVerified={(user, token) => {
              login(user, token);
              toast.success('Email verified. Welcome to LibVerse!');
              navigate('/student/dashboard');
            }}
            onBack={() => navigate('/login')}
            backLabel="Back to sign in"
          />
        ) : (
        <>
        {error && (
          <div role="alert" className="mb-5 p-3 bg-rose-500/10 text-rose-200 rounded-xl border border-rose-500/30 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <Field id="signup-name" label="Full name" error={errors.name}>
            <input {...inputProps('name')} type="text" autoComplete="name" placeholder="Enter your full name" required />
          </Field>

          <Field id="signup-email" label="Email address" error={errors.email}>
            <input {...inputProps('email')} type="email" autoComplete="email" placeholder="you@example.com" required />
          </Field>

          <Field id="signup-password" label="Password" error={errors.password} hint="At least 6 characters.">
            <div className="relative">
              <input
                {...inputProps('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Choose a password"
                required
                className={`${inputProps('password').className} !pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:text-slate-100"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </Field>

          {/* Side by side on short screens (see .signup-optional) */}
          <div className="signup-optional">
            <Field id="signup-phone" label="Phone (optional)">
              <input {...inputProps('phone')} type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
            </Field>

            <Field id="signup-address" label="Address (optional)">
              <input {...inputProps('address')} type="text" autoComplete="street-address" placeholder="Enter your address" />
            </Field>
          </div>

          <Button type="submit" loading={loading} variant="primary" size="lg">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className="auth-divider" role="separator">or</div>

          {googleEnabled && <GoogleSignInButton text="signup_with" onCredential={handleGoogle} disabled={googleBusy || loading} />}

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-300 hover:text-white font-medium">
              Sign in
            </Link>
          </p>
        </form>
        </>
        )}
      </Card>
    </div>
  );
};
