import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import Dropdown from '../Dropdown';
import { AuthContext } from '../../context/AuthContext.jsx';
import { googleAuthService } from '../../services/googleAuthService';
import { facebookAuthService } from '../../services/facebookAuthService';
import { motion, AnimatePresence } from 'motion/react';

// Regex constants for password checks
const RE_UPPER = /[A-Z]/;
const RE_LOWER = /[a-z]/;
const RE_DIGIT = /\d/;
const RE_SPECIAL = /[@$!%*?&]/;
const RE_ALLOWED = /^[A-Za-z\d@$!%*?&]+$/;

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  // Form states matching original exactly
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'distribution_staff'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    allowedChars: false
  });
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // Sync mode with props
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Google & Facebook callback checks
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const googleCallback = googleAuthService.checkGoogleCallback();
      if (googleCallback) {
        try {
          const result = await googleAuthService.handleGoogleCallback(googleCallback.token, googleCallback.user);
          if (result.success) {
            setAuth({
              token: result.token,
              isAuthenticated: true,
              user: result.user
            });
            googleAuthService.clearCallbackParams();
            navigate('/dashboard');
          } else {
            setError('Google authentication failed');
          }
        } catch (error) {
          console.error('Google auth callback error:', error);
          setError('Google authentication failed');
        }
      }
    };

    const handleFacebookCallback = async () => {
      const facebookCallback = facebookAuthService.checkFacebookCallback();
      if (facebookCallback) {
        try {
          const result = await facebookAuthService.handleFacebookCallback(facebookCallback.token, facebookCallback.user);
          if (result.success) {
            setAuth({
              token: result.token,
              isAuthenticated: true,
              user: result.user
            });
            facebookAuthService.clearCallbackParams();
            navigate('/dashboard');
          } else {
            setError('Facebook authentication failed');
          }
        } catch (error) {
          console.error('Facebook auth callback error:', error);
          setError('Facebook authentication failed');
        }
      }
    };

    handleGoogleCallback();
    handleFacebookCallback();
  }, [navigate, setAuth]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset states when swapping tabs
  useEffect(() => {
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoginData({ email: '', password: '' });
    setRegisterData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'distribution_staff'
    });
    setPasswordChecks({
      minLength: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
      allowedChars: false
    });
  }, [mode]);

  // Client-side password rules validation
  const validatePassword = useCallback((pwd) => {
    const checks = {
      minLength: pwd.length >= 8,
      uppercase: RE_UPPER.test(pwd),
      lowercase: RE_LOWER.test(pwd),
      number: RE_DIGIT.test(pwd),
      special: RE_SPECIAL.test(pwd),
      allowedChars: RE_ALLOWED.test(pwd)
    };

    const failed = [];
    if (!checks.minLength) failed.push('Password must be at least 8 characters long.');
    if (!checks.uppercase) failed.push('Password must contain at least one uppercase letter (A-Z).');
    if (!checks.lowercase) failed.push('Password must contain at least one lowercase letter (a-z).');
    if (!checks.number) failed.push('Password must contain at least one number (0-9).');
    if (!checks.special) failed.push('Password must contain at least one special character (@$!%*?&).');
    if (!checks.allowedChars) failed.push('Password contains invalid characters; only A-Z, a-z, 0-9 and @$!%*?& are allowed.');

    return { checks, failed };
  }, []);

  const onLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email: loginData.email,
        password: loginData.password
      });

      const token = res.data.token;
      localStorage.setItem('token', `Bearer ${token}`);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuth({
        token: `Bearer ${token}`,
        isAuthenticated: true,
        user: res.data.user,
        loading: false
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterChange = (e) => {
    const { name: fieldName, value } = e.target;

    if (fieldName === 'password') {
      const { checks } = validatePassword(value);
      setPasswordChecks(checks);
    }

    if ((fieldName === 'password' || fieldName === 'confirmPassword') && error) {
      setError('');
    }

    setRegisterData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const effectivePassword = registerData.password || passwordRef.current?.value || '';
    const effectiveConfirm = registerData.confirmPassword || confirmRef.current?.value || '';

    if (effectivePassword !== effectiveConfirm) {
      setError('Passwords do not match');
      return;
    }

    const { failed } = validatePassword(effectivePassword);
    if (failed.length > 0) {
      setError(failed[0]);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: registerData.name,
        email: registerData.email,
        password: effectivePassword,
        role: registerData.role
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/register`, payload);
      setMode('login');
    } catch (err) {
      if (!err.response) {
        setError('Network error. Please try again.');
        return;
      }

      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        const newFieldErrors = {};
        resp.errors.forEach((group) => {
          (group.details || []).forEach((detail) => {
            const f = detail.field || 'unknown';
            if (!newFieldErrors[f]) newFieldErrors[f] = [];
            const msg = (detail.message || '').replace(/"/g, '');
            newFieldErrors[f].push(msg);
          });
        });
        if (newFieldErrors.password && newFieldErrors.password.length > 0) {
          setError(newFieldErrors.password.join('; '));
        } else if (resp.message) {
          setError(resp.message);
        } else {
          setError('Registration failed');
        }
      } else {
        setError(resp?.message || resp?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
          access_token: tokenResponse.access_token
        });
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        setAuth({
          token: res.data.token,
          isAuthenticated: true,
          user: res.data.user
        });
        
        onClose();
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Google authentication failed. Is the backend configured?');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google login popup closed or failed')
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="auth-modal-close" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className="auth-modal-header">
              {/* Spinning Logo watermark in background of modal header */}
              <svg className="auth-modal-watermark animate-spin-slow" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" stroke="var(--sage)" strokeWidth="1.5" fill="none" />
                <path d="M18,9 C22.5,13.5 24,19 18,26 C12,19 13.5,13.5 18,9 Z" fill="var(--sage)" opacity="0.1" />
              </svg>
              <h2>{mode === 'login' ? 'Access Ledger' : 'Create Account'}</h2>
              <p>{mode === 'login' ? 'Sign in to access your dashboard' : 'Join AushadhSanchaya clinical ledger network'}</p>
            </div>

            {/* Tabs */}
            <div className="auth-modal-tabs">
              <button
                className={`auth-modal-tab${mode === 'login' ? ' active' : ''}`}
                onClick={() => setMode('login')}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`auth-modal-tab${mode === 'register' ? ' active' : ''}`}
                onClick={() => setMode('register')}
                type="button"
              >
                Sign Up
              </button>
              <div
                className="auth-modal-tab-indicator"
                style={{ transform: mode === 'login' ? 'translateX(0%)' : 'translateX(100%)' }}
              />
            </div>

            {/* Error alerts with layout slide transitions */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="auth-modal-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <div className="auth-modal-body">
              <form onSubmit={mode === 'login' ? onLoginSubmit : onRegisterSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    className="auth-modal-form-content"
                    initial={{ opacity: 0, x: mode === 'login' ? -15 : 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'login' ? 15 : -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    {mode === 'login' ? (
                      /* ─── Login Form Fields ─────────────────────── */
                      <>
                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Email Address</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            <input
                              className="auth-modal-input"
                              type="email"
                              name="email"
                              value={loginData.email}
                              onChange={onLoginChange}
                              required
                              placeholder="Enter your email"
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Password</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                              className="auth-modal-input"
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={loginData.password}
                              onChange={onLoginChange}
                              required
                              placeholder="Enter your password"
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              className="auth-modal-toggle-pw"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div className="auth-modal-extras">
                          <label className="auth-modal-remember">
                            <input type="checkbox" />
                            <span>Remember me</span>
                          </label>
                          <a href="/forgot-password" className="auth-modal-forgot">Forgot password?</a>
                        </div>

                        <button
                          type="submit"
                          className="auth-modal-submit"
                          disabled={loading}
                        >
                          {loading ? 'Validating…' : 'Access Ledger'}
                        </button>
                      </>
                    ) : (
                      /* ─── Register Form Fields ──────────────────── */
                      <>
                        {/* Full Name Field */}
                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Full Name</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <input
                              className="auth-modal-input"
                              type="text"
                              name="name"
                              value={registerData.name}
                              onChange={onRegisterChange}
                              required
                              placeholder="Full name"
                              autoComplete="name"
                            />
                          </div>
                        </div>

                        {/* Email Address Field */}
                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Email Address</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            <input
                              className="auth-modal-input"
                              type="email"
                              name="email"
                              value={registerData.email}
                              onChange={onRegisterChange}
                              required
                              placeholder="Email address"
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        {/* Role Field (Full Width) */}
                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Role</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 7V5a4 4 0 00-8 0v2" />
                            </svg>
                            <Dropdown
                              id="role"
                              name="role"
                              value={registerData.role}
                              onChange={onRegisterChange}
                              triggerClassName="auth-modal-input"
                              options={[
                                { value: "distribution_staff", label: "Distribution Staff" },
                                { value: "inventory_manager", label: "Inventory Manager" },
                                { value: "procurement_staff", label: "Procurement Staff" },
                                { value: "staff", label: "Staff" }
                              ]}
                              required
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Password</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                              className="auth-modal-input"
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              ref={passwordRef}
                              value={registerData.password}
                              onChange={onRegisterChange}
                              onFocus={() => setPasswordFocused(true)}
                              onBlur={() => setPasswordFocused(false)}
                              required
                              placeholder="Password"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="auth-modal-toggle-pw"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="auth-modal-field">
                          <label className="auth-modal-label">Confirm Password</label>
                          <div className="auth-modal-input-wrap">
                            <svg className="auth-modal-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <input
                              className="auth-modal-input"
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              ref={confirmRef}
                              value={registerData.confirmPassword}
                              onChange={onRegisterChange}
                              required
                              placeholder="Confirm password"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="auth-modal-toggle-pw"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        {/* Interactive conditional validation strength list */}
                        <AnimatePresence>
                          {passwordFocused && !Object.values(passwordChecks).every(Boolean) && (
                            <motion.div
                              className="auth-modal-pw-checks"
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className={`auth-modal-pw-check ${passwordChecks.minLength ? 'met' : 'unmet'}`}>
                                <span className="check-bullet">{passwordChecks.minLength ? '✔' : '•'}</span>
                                <span>8+ chars</span>
                              </div>
                              <div className={`auth-modal-pw-check ${passwordChecks.uppercase ? 'met' : 'unmet'}`}>
                                <span className="check-bullet">{passwordChecks.uppercase ? '✔' : '•'}</span>
                                <span>Uppercase (A-Z)</span>
                              </div>
                              <div className={`auth-modal-pw-check ${passwordChecks.lowercase ? 'met' : 'unmet'}`}>
                                <span className="check-bullet">{passwordChecks.lowercase ? '✔' : '•'}</span>
                                <span>Lowercase (a-z)</span>
                              </div>
                              <div className={`auth-modal-pw-check ${passwordChecks.number ? 'met' : 'unmet'}`}>
                                <span className="check-bullet">{passwordChecks.number ? '✔' : '•'}</span>
                                <span>Number (0-9)</span>
                              </div>
                              <div className={`auth-modal-pw-check ${passwordChecks.special ? 'met' : 'unmet'}`}>
                                <span className="check-bullet">{passwordChecks.special ? '✔' : '•'}</span>
                                <span>Special (@$!%*?&)</span>
                              </div>
                              <div className={`auth-modal-pw-check ${passwordChecks.allowedChars ? 'met' : 'unmet'}`}>
                                <span className="check-bullet">{passwordChecks.allowedChars ? '✔' : '•'}</span>
                                <span>Valid chars</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          type="submit"
                          className="auth-modal-submit"
                          disabled={loading}
                        >
                          {loading ? 'Creating Account…' : 'Create Account'}
                        </button>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Divider */}
                <div className="auth-modal-divider">
                  <span>Or continue with</span>
                </div>

                {/* Social logins */}
                <div className="auth-modal-oauth">
                  <button type="button" className="auth-modal-oauth-btn auth-modal-oauth-google" onClick={() => handleGoogleSignIn()}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                <p className="auth-modal-switch">
                  {mode === 'login' ? (
                    <>
                      New to ledger operations?{' '}
                      <button type="button" onClick={() => setMode('register')}>Initialize Account</button>
                    </>
                  ) : (
                    <>
                      Already have a ledger user?{' '}
                      <button type="button" onClick={() => setMode('login')}>Access Account</button>
                    </>
                  )}
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
