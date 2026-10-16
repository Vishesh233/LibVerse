import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input } from '../components/UI';
import { LogoMark } from '../components/LogoMark';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.signup(formData);
      const { token, user } = response.data;
      login(user, token);
      toast.success('Account created successfully');
      navigate('/student/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#02040f] via-[#040813] to-[#0b1534] px-4">
      <Card className="w-full max-w-md bg-[radial-gradient(circle_at_top,_rgba(125,95,255,0.16),transparent_28%),linear-gradient(180deg,#050816_0%,#09112f_100%)] text-slate-100 border border-white/10 shadow-[0_50px_120px_rgba(8,12,34,0.55)]">
        <div className="pb-6 border-b border-white/10 mb-6 text-center">
          <div className="inline-flex items-center justify-center gap-4 rounded-[30px] bg-gradient-to-r from-[#4b3cff] via-[#6d5cff] to-[#8f75ff] px-6 py-4 shadow-[0_36px_120px_rgba(110,79,255,0.18)] mb-6">
            <LogoMark size="md" />
            <div className="text-left">
              <p className="text-xl font-extrabold text-white">
                Lib<span className="brand-verse">Verse</span>
              </p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-200/80">Library Management System</p>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
          <p className="text-sm text-slate-400 mt-2">Join the library and start exploring.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 text-rose-300 rounded-xl border border-rose-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            name="name"
            placeholder="Enter your full name"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            name="email"
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            name="password"
            placeholder="••••••••"
            required
          />
          <Input
            label="Phone (Optional)"
            value={formData.phone}
            onChange={handleChange}
            name="phone"
            placeholder="+91 98765 43210"
          />
          <Input
            label="Address (Optional)"
            value={formData.address}
            onChange={handleChange}
            name="address"
            placeholder="Enter your address"
          />

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full text-sm rounded-xl py-4"
          >
            {loading ? 'Creating Account...' : (
              <span className="flex items-center justify-center gap-2">
                Sign Up <span className="text-lg">→</span>
              </span>
            )}
          </Button>

          <div className="relative mt-2">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-[#09112f] px-3 text-[10px] uppercase tracking-[0.28em] text-slate-500">
              or
            </div>
            <div className="h-px bg-white/10 mt-3"></div>
          </div>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-300 hover:text-white font-medium">
              Sign In
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};