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
  Lock,
} from 'lucide-react';
import { useRole } from '../context/RoleContext.jsx';

/**
 * Enterprise User / Analyst Registration Page Component
 * Dedicated Routes: `/signup/user`, `/user/signup`, `/signup`, `/register`
 * Allows registration of Fraud Analyst accounts.
 */
export default function UserSignup() {
  const navigate = useNavigate();
  const { registerWithCredentials, isSupabaseConfigured, currentUser } = useRole();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard/user');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
      const res = await registerWithCredentials(email.trim(), password, fullName.trim(), 'analyst');
      if (res?.status === 'confirmation_required') {
        setSuccessMessage(res.message);
      } else {
        setSuccessMessage('Account created successfully! Redirecting to workspace...');
        setTimeout(() => {
          navigate('/dashboard/user');
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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

        <div className="flex items-center gap-3">
          <Link
            to="/admin/signup"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors px-3 py-1.5 rounded-lg border border-amber-300 shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Admin Signup
          </Link>
          <Link
            to="/login/user"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5648] hover:text-amber-900 transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-[#E5DCBE] shadow-xs hover:border-amber-400"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5648] hover:text-amber-900 transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-[#E5DCBE] shadow-xs hover:border-amber-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-[460px] w-full bg-white border border-[#E5DCBE] rounded-3xl p-8 sm:p-10 shadow-xl shadow-amber-500/5 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            {/* Header Title */}
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-2 inline-block">
                Analyst Registration
              </span>
              <h1 className="text-2xl font-extrabold text-[#1A1612] tracking-tight">
                Create User Account
              </h1>
              <p className="text-xs sm:text-sm text-[#5C5648] mt-1.5 leading-relaxed">
                Register a new fraud analyst profile to access the transaction triage console.
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@fraudsentinel.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#1A1612] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm transition-all shadow-md shadow-amber-500/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create User Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-[#EAE2CE] text-center text-xs text-[#6B6454] space-y-2">
                <div>
                  Already have a user account?{' '}
                  <Link
                    to="/login/user"
                    className="font-bold text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Sign In
                  </Link>
                </div>
                <div className="pt-1">
                  System Administrator?{' '}
                  <Link
                    to="/admin/signup"
                    className="font-bold text-amber-800 hover:text-amber-900 transition-colors"
                  >
                    Provision Admin Account →
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#8C8270]">
        FraudSentinel Security Systems &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
