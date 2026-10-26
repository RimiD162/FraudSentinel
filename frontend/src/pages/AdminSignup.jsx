import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Cpu,
  User,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { useRole } from '../context/RoleContext.jsx';

/**
 * System Administrator Provisioning & Sign Up Portal
 * Dedicated Routes: `/admin/signup`, `/signup/admin`, `/admin/register`
 * Specifically enables provisioning of new Administrator accounts with root RBAC privileges.
 */
export default function AdminSignup() {
  const navigate = useNavigate();
  const { registerWithCredentials, isSupabaseConfigured, currentUser, role } = useRole();

  // If already authenticated as admin, jump straight to the admin dashboard
  React.useEffect(() => {
    if (currentUser && (role === 'admin' || currentUser.role === 'admin')) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, role, navigate]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminClearanceKey, setAdminClearanceKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleAdminSignup = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all mandatory administrator fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Master password must contain at least 6 characters for administrative clearance.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Master passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithCredentials(email.trim(), password, fullName.trim(), 'admin');
      if (res?.status === 'confirmation_required') {
        setSuccessMessage(res.message);
      } else {
        setSuccessMessage('Administrator account provisioned successfully! Initializing Root Console...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Administrator registration failed. Please verify network or database connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F2] via-[#FDFBF7] to-[#F3EBD9] text-[#1A1612] flex flex-col justify-between selection:bg-amber-400/30 selection:text-amber-950 font-sans">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#1A1612] hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight">
            Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">Sentinel</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/signup/user"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C5648] hover:text-amber-900 transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-[#E5DCBE] shadow-xs hover:border-amber-400"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            User Signup
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors px-3.5 py-1.5 rounded-lg border border-amber-300 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Admin Login
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5648] hover:text-amber-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-[#E5DCBE] shadow-xs hover:border-amber-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </header>

      {/* Main Container - High Security Admin Sign Up Card */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="max-w-[500px] w-full bg-white border-2 border-amber-300/90 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber-900/10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />

          <div className="relative z-10">
            {/* Header Title & Admin Security Badge */}
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-3">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Root Privilege Provisioning
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1612] tracking-tight">
                Provision Admin Account
              </h1>
              <p className="text-xs sm:text-sm text-[#5C5648] mt-1.5 leading-relaxed">
                Register a new System Administrator officer with elevated platform root permissions, ML governance, and security ledger oversight.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 shadow-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 shadow-xs animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            {/* Admin Signup Form */}
            <form onSubmit={handleAdminSignup} className="space-y-4">
              
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Administrator Full Name
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
                    placeholder="e.g. Marcus Vance"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* Admin Work Email Field */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Administrator Work Email
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
                    placeholder="admin.officer@fraudsentinel.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* Master Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Master Root Password
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
                    placeholder="••••••••••••"
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
                <span className="text-[11px] text-[#6B6454] mt-1 block">
                  Must be at least 6 characters with cryptographic entropy.
                </span>
              </div>

              {/* Confirm Master Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Confirm Master Password
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
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* Admin Provisioning Clearance Key (Optional/Enterprise Token) */}
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Security Clearance Token (Optional)</span>
                  <span className="text-[10px] text-amber-800 font-semibold normal-case bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Enterprise RBAC
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4 text-amber-600" />
                  </div>
                  <input
                    type="text"
                    value={adminClearanceKey}
                    onChange={(e) => setAdminClearanceKey(e.target.value)}
                    placeholder="SENTINEL-ROOT-AUTH (Optional)"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-[#1A1612] text-sm font-medium transition-all outline-none font-mono"
                  />
                </div>
              </div>

              {/* Submit Admin Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Provisioning Root Administrator...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-amber-200" />
                      <span>Provision Admin Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Lower Switch to Sign In / User Portal */}
              <div className="pt-4 border-t border-[#EAE2CE] text-center text-xs text-[#6B6454] space-y-2.5">
                <div>
                  Already provisioned as an administrator?{' '}
                  <Link
                    to="/admin/login"
                    className="font-bold text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Sign In to Admin Console
                  </Link>
                </div>

                <div className="pt-2 border-t border-[#F2ECE0] flex items-center justify-center gap-4">
                  <Link
                    to="/login/user"
                    className="font-semibold text-[#5C5648] hover:text-amber-900 transition-colors inline-flex items-center gap-1"
                  >
                    <span>User Portal Login →</span>
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    to="/signup/user"
                    className="font-semibold text-amber-800 hover:text-amber-950 transition-colors inline-flex items-center gap-1"
                  >
                    <span>User Sign Up →</span>
                  </Link>
                </div>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#8C8270] border-t border-[#EAE2CE]">
        FraudSentinel Enterprise Governance • Zero-Trust Administrative Security Protocol
      </footer>
    </div>
  );
}
