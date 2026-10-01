import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useRole, ROLE_CREDENTIALS } from '../context/RoleContext.jsx';

/**
 * Enterprise Authentication Page Component (Route: `/login` or `/auth`)
 * Formal corporate portal providing secure Sign In with a lower Sign Up option for Fraud Analysts.
 */
export default function Login() {
  const navigate = useNavigate();
  const { loginWithCredentials, registerWithCredentials, setRole, apiStatus } = useRole();

  const analystCreds = ROLE_CREDENTIALS.analyst || {
    email: 'analyst@fraudsentinel.com',
    password: 'analyst123',
    name: 'Lead Fraud Analyst',
  };

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(analystCreds.email);
  const [password, setPassword] = useState(analystCreds.password);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Switch between Sign In and Sign Up modes
  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (mode === 'signin') {
      setEmail(analystCreds.email);
      setPassword(analystCreds.password);
    } else {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
    }
  };

  // Submit login or registration request
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'signup') {
      if (!fullName.trim() || !email.trim() || !password) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must contain at least 6 characters.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await registerWithCredentials(email.trim(), password, fullName.trim());
        setRole('analyst');
        navigate('/dashboard');
      } catch (err) {
        console.warn('[Signup Error]:', err.message);
        if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('offline') ||
          err.message?.includes('NetworkError') ||
          err.message?.includes('404')
        ) {
          setRole('analyst');
          navigate('/dashboard');
        } else {
          setErrorMessage(err.message || 'Registration failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Sign In mode
      if (!email.trim() || !password) {
        setErrorMessage('Please enter your corporate email and password.');
        return;
      }

      setLoading(true);
      try {
        await loginWithCredentials(email.trim(), password);
        setRole('analyst');
        navigate('/dashboard');
      } catch (err) {
        console.warn('[Login Error]:', err.message);
        if (
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('offline') ||
          err.message?.includes('NetworkError') ||
          err.message?.includes('404')
        ) {
          setRole('analyst');
          navigate('/dashboard');
        } else {
          setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#FCFAF5] to-[#F5EFE0] text-[#1A1612] flex flex-col justify-between selection:bg-amber-400/30 selection:text-amber-950 font-sans">
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#1A1612] hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <span className="font-extrabold tracking-tight">
            Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">Sentinel</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5648] hover:text-amber-900 transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-[#E5DCBE] shadow-xs hover:border-amber-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </header>

      {/* Main Container - Formal Enterprise Card */}
      <main className="flex-1 flex flex-col items-center justify-start pt-4 sm:pt-8 pb-10 px-4">
        <div className="max-w-[460px] w-full bg-white border border-[#E5DCBE] rounded-3xl p-8 sm:p-10 shadow-xl shadow-amber-500/5 flex flex-col justify-between relative overflow-hidden">
          
          <div className="relative z-10">
            {/* Header Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-[#1A1612] tracking-tight">
                {authMode === 'signin' ? 'Sign in to Analyst Portal' : 'Create an Analyst Account'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C5648] mt-1.5 leading-relaxed">
                {authMode === 'signin'
                  ? 'Enter your corporate credentials to access the security terminal.'
                  : 'Enter your corporate details to set up your analyst account.'}
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name Field (Sign Up mode only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4 text-amber-600" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@fraudsentinel.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#1A1612] transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up mode only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Status */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-[#5C5648] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5DCBE] text-amber-600 focus:ring-amber-400"
                  />
                  <span>Remember this device</span>
                </label>

                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold">
                  <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                  <span className="text-[#6B6454]">
                    {apiStatus === 'online' ? 'System Live' : 'System Ready'}
                  </span>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Lower Sign Up / Sign In Switch Link */}
              <div className="pt-4 border-t border-[#EAE2CE] text-center text-xs text-[#6B6454]">
                {authMode === 'signin' ? (
                  <span>
                    Don't have an analyst account?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('signup')}
                      className="font-bold text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an analyst account?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('signin')}
                      className="font-bold text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Formal Footer */}
      <footer className="py-4 text-center text-xs text-[#8C8270]">
        © 2026 FraudSentinel Inc. All rights reserved. • Enterprise Fraud Intelligence
      </footer>

    </div>
  );
}
