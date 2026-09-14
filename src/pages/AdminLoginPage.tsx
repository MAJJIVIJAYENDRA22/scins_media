import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { AdminUser } from '../types';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both administrator email and security password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login({ email, password });
      
      if (response && response.user && response.token) {
        sessionStorage.setItem('scins_admin_token', response.token);
        sessionStorage.setItem('scins_admin_user', JSON.stringify(response.user));
        localStorage.removeItem('scins_admin_token');
        localStorage.removeItem('scins_admin_user');
        onLoginSuccess(response.user);
      } else {
        throw new Error('Invalid response received from authentication service.');
      }
    } catch (err: any) {
      console.error('Admin Login error:', err);
      setErrorMessage(
        err.message || 'Invalid administrator credentials. Please check your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white text-slate-900 flex flex-col md:flex-row overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Left side: Logo & Banner showcase */}
      <div className="hidden md:flex md:w-1/2 bg-white flex-col justify-between border-none h-full overflow-hidden p-6 lg:p-8">
        {/* Top Logo Container */}
        <div className="flex items-center justify-center flex-shrink-0 pt-2 pb-2">
          <img
            src="/scins-media-logo.png"
            alt="SCINS MEDIA Logo"
            className="h-14 lg:h-16 w-auto object-contain hover:opacity-95 transition-opacity"
          />
        </div>

        {/* Banner below the logo with full fit */}
        <div className="flex-1 flex items-center justify-center my-auto min-h-0 overflow-hidden px-2">
          <img
            src="/admin%20login%20cover%20page.png"
            alt="SCINS MEDIA - Ideas into Impact"
            className="w-full h-auto max-h-[74vh] object-contain rounded-xl drop-shadow-md"
          />
        </div>

        {/* Bottom subtle brand accent */}
        <div className="flex-shrink-0 text-center pt-2">
          <div className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span>Scientific Congress & Editorial Platform</span>
          </div>
        </div>
      </div>

      {/* Right side container */}
      <div className="flex-1 md:w-1/2 flex flex-col justify-between h-full bg-white overflow-y-auto">
        {/* Top navigation / Public Portal */}
        <header className="relative z-10 w-full px-6 py-4 flex items-center justify-end flex-shrink-0">
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-teal-700 bg-white hover:bg-teal-50/60 border border-slate-200 shadow-sm transition-all hover:border-teal-200"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
            </button>
          )}
        </header>

        {/* Center: login form */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-4">
          <div className="max-w-md w-full my-auto">
            {/* Mobile-only logo */}
            <div className="md:hidden flex flex-col items-center mb-6">
              <img src="/scins-media-logo.png" alt="SCINS MEDIA Logo" className="h-16 w-auto object-contain" />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center mx-auto text-teal-600 shadow-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight font-display">
                  Admin Sign In
                </h2>
                <p className="text-xs text-slate-500">
                  Access the SCINS Media conference & platform control center
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2.5 animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter administrator email..."
                      style={{ backgroundColor: '#ffffff' }}
                      className="w-full admin-input-white bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Security Password
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">256-Bit SSL</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter security password..."
                      style={{ backgroundColor: '#ffffff' }}
                      className="w-full admin-input-white bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-mono shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkboxes & Remember Me */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
                    />
                    <span className="text-slate-600 font-medium">Keep session active</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Admin Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-3 px-6 text-center text-[11px] text-slate-400 border-none bg-white flex-shrink-0">
          <span>© {new Date().getFullYear()} SCINS Media International Secretariat. Administrative Authorization Required.</span>
        </footer>
      </div>
    </div>
  );
};