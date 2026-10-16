import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, useInView } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Generate particles for background
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 10}s`,
  animationDuration: `${10 + Math.random() * 10}s`,
  opacity: 0.2 + Math.random() * 0.3
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Signed in successfully');

      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'librarian') {
        navigate('/librarian');
      } else if (user?.role === 'student' && !user?.isOnboardingCompleted) {
        navigate('/student/onboarding');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      {/* Animated Background Elements */}
      <div className="login-bg-gradient login-bg-gradient-1" />
      <div className="login-bg-gradient login-bg-gradient-2" />
      <div className="login-bg-gradient login-bg-gradient-3" />
      
      {/* Floating Blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />
      
      {/* Light Beams */}
      <div className="login-light-beam login-light-beam-1" />
      <div className="login-light-beam login-light-beam-2" />
      <div className="login-light-beam login-light-beam-3" />
      
      {/* Floating Particles */}
      {PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="login-particle"
          style={{
            left: particle.left,
            opacity: particle.opacity,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        />
      ))}

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          ref={cardRef}
          className="login-card w-full max-w-md px-8 pt-8 pb-5"
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 2}deg) rotateX(${-mousePosition.y * 2}deg)`
          }}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Branding Section */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <div className="login-logo-container inline-block mb-4">
              <div className="login-logo-icon w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                  <path d="M6 18.5V6.75A2.75 2.75 0 0 1 8.75 4H14a2.75 2.75 0 0 1 2.75 2.75V18.5" />
                  <path d="M6 18.5C6 19.328 6.672 20 7.5 20H14a2 2 0 0 0 2-2V6.75" />
                  <path d="M6 6.75C6 5.922 6.672 5.25 7.5 5.25H14" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              <span className="brand-verse">LibVerse</span>
            </h1>
            <p className="text-sm text-slate-400 tracking-wide">Smart Library Management System</p>
            <p className="text-xs text-slate-500 mt-1 tracking-wider">Read • Borrow • Discover</p>
          </motion.div>

          {/* Welcome Section */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-400">Sign in to continue to your portal</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-4 p-3 bg-rose-500/10 text-rose-200 rounded-xl border border-rose-500/20 text-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form onSubmit={handleSubmit} className="space-y-5" variants={itemVariants}>
            {/* Email Input */}
            <motion.div className="login-input-group" variants={itemVariants}>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  className="login-input"
                />
                <label htmlFor="email" className="login-floating-label">
                  Email Address
                </label>
                <div className="login-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div className="login-input-group" variants={itemVariants}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  className="login-input"
                />
                <label htmlFor="password" className="login-floating-label">
                  Password
                </label>
                <div className="login-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" variants={itemVariants}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                  className="login-checkbox"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-indigo-300 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Login Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="login-spinner" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Access Dashboard
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
              </button>
            </motion.div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-[#0B1120] px-3 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                or
              </div>
              <div className="h-px bg-white/10"></div>
            </div>

            {/* Sign Up Link */}
            <motion.p className="text-center text-sm text-slate-400" variants={itemVariants}>
              New here?{' '}
              <Link to="/signup" className="text-indigo-300 hover:text-white font-medium transition-colors">
                Create an account
              </Link>
            </motion.p>
          </motion.form>

          {/* Footer */}
          <motion.div 
            className="mt-6"
            variants={itemVariants}
          >
            <p className="text-xs text-slate-500 text-center">
              Version 1.0 • © 2026 LibVerse
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};