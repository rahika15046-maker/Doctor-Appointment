import React, { useState } from 'react';
import {
  MedoraCross,
  XIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from './Icons';
import api from '../services/api';

export default function AuthModal({ initialMode = 'login', isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  if (!isOpen) return null;

  // Password Strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', score: 0, color: '#E2E8F0' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Weak', score: 25, color: '#EF4444' };
    if (score === 2) return { label: 'Fair', score: 50, color: '#F59E0B' };
    if (score === 3) return { label: 'Good', score: 75, color: '#10B981' };
    return { label: 'Strong', score: 100, color: '#0D9488' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!form.name.trim()) throw new Error('Please enter your full name');
        if (!form.email.trim()) throw new Error('Please enter a valid email');
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters');
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match');
        if (!form.agreeTerms) throw new Error('Please agree to Terms & Conditions');

        const res = await api.register({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });
        onAuthSuccess(res.data);
        onClose();
      } else {
        if (!form.email.trim() || !form.password) {
          throw new Error('Please enter your email and password');
        }
        const res = await api.login({
          email: form.email.trim(),
          password: form.password,
        });
        onAuthSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPatientLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login({
        email: 'patient@demo.medora',
        password: 'Demo@1234',
      });
      onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.googleLogin({
        email: form.email || 'patient.google@medora.health',
        name: form.name || 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      });
      onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px 32px' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <XIcon size={18} />
        </button>

        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <MedoraCross size={32} />
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F766E' }}>
            MEDORA
          </span>
        </div>

        {/* Modal Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            {mode === 'login'
              ? 'Welcome back! Please login to continue'
              : 'Create your account to get started'}
          </p>
        </div>

        {/* Error message banner */}
        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Demo Fast Login Pills */}
        <div style={{
          backgroundColor: '#F0FDFA',
          border: '1px solid #CCFBF1',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F766E' }}>One-Click Demo</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Priya Sharma (Patient)</div>
          </div>
          <button
            type="button"
            onClick={handleDemoPatientLogin}
            className="btn btn-primary btn-sm"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Instant Login
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 12, color: '#94A3B8' }}>
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 12, color: '#94A3B8' }}>
                <MailIcon size={18} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                className="form-input"
                style={{ paddingLeft: 42 }}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 12, color: '#94A3B8' }}>
                  <PhoneIcon size={18} />
                </span>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              {mode === 'login' && (
                <a href="#forgot" style={{ fontSize: '0.8rem', color: '#0D9488', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingRight: 42 }}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 10,
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter (in register mode) */}
          {mode === 'register' && form.password && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ color: '#64748B' }}>Password Strength:</span>
                <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
              </div>
              <div style={{ width: '100%', height: 5, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${strength.score}%`, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s' }} />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-input"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
          )}

          {/* Checkboxes */}
          <div style={{ marginBottom: 20 }}>
            {mode === 'login' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#0D9488' }} />
                <span>Remember Me</span>
              </label>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                  style={{ accentColor: '#0D9488' }}
                />
                <span>I agree to the <b style={{ color: '#0D9488' }}>Terms & Conditions</b></span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.98rem', marginBottom: 18 }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
            color: '#94A3B8',
            fontSize: '0.8rem',
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <span>or continue with</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '0.9rem',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#1E293B',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemoPatientLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '9px 12px',
              backgroundColor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              borderRadius: 10,
              color: '#0F766E',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 18,
            }}
          >
            ⚡ Quick Demo Patient Login (Priya Sharma)
          </button>

          {/* Toggle Login / Register */}
          <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748B' }}>
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#0D9488', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#0D9488', fontWeight: 700, cursor: 'pointer' }}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
