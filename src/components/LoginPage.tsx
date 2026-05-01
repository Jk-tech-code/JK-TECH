import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'signup' && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (mode === 'login' || mode === 'signup') {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (mode === 'signup' && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        });
        if (error) throw error;
        setSuccessMessage('Registration successful! Please check your email to confirm your account.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        setSuccessMessage('Password reset email sent! Check your inbox.');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrors({ auth: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.auth) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        delete next.auth;
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-bold text-sm"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Homepage
        </button>

        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-primary/10 p-4 rounded-2xl mb-4">
              <Logo size={48} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              {mode === 'login' ? 'Client Portal' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-slate-500 font-medium">
              {mode === 'login' ? 'Access your projects and support' : mode === 'signup' ? 'Join JK Tech Cyber' : 'We\'ll send you a recovery link'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errors.auth && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3"
              >
                <AlertCircle size={20} className="flex-shrink-0" />
                {errors.auth}
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-bold flex items-center gap-3"
              >
                <ShieldCheck size={20} className="flex-shrink-0" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <UserPlus size={18} />
                  </div>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all duration-200 font-bold focus:ring-4 ${errors.fullName ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-primary/50 focus:ring-primary/10 hover:border-slate-200'}`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1 animate-in slide-in-from-top-2">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all duration-200 font-bold focus:ring-4 ${errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-primary/50 focus:ring-primary/10 hover:border-slate-200'}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1 animate-in slide-in-from-top-2">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs font-bold text-primary hover:underline transition-all"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all duration-200 font-bold focus:ring-4 ${errors.password ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-primary/50 focus:ring-primary/10 hover:border-slate-200'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1 animate-in slide-in-from-top-2">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all duration-200 font-bold focus:ring-4 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-primary/50 focus:ring-primary/10 hover:border-slate-200'}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1 animate-in slide-in-from-top-2">
                    <AlertCircle size={12} /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed h-auto"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin h-auto" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {mode !== 'login' && (
              <button 
                type="button"
                onClick={() => {
                  setMode('login');
                  setSuccessMessage(null);
                  setErrors({});
                }}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm"
              >
                <LogIn size={16} /> Back to Login
              </button>
            )}
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          {mode === 'login' && (
            <p className="text-slate-500 font-bold text-sm">
              New client? <button onClick={() => setMode('signup')} className="text-primary hover:underline">Create an account</button>
            </p>
          )}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Supabase Auth protected session</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

