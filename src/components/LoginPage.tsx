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
  LogIn,
  Chrome
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const loadingMessages = [
    'Securing your account...',
    'Building your tech portal...',
    'Setting up your workspace...',
    'Finalizing details...'
  ];

  const handleResendEmail = async () => {
    if (!formData.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setSuccessMessage('New confirmation email sent! Please check your inbox.');
    } catch (error: any) {
      setErrors({ auth: error.message || 'Failed to resend email.' });
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google login error:", error);
      setErrors({ auth: error.message || 'Failed to sign in with Google.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    setLoadingStep(0);
    
    // Rotate loading messages every 2 seconds for a better psychological feel
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1200);
    
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
            },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setSuccessMessage('Almost there! We\'ve sent a confirmation link to ' + formData.email + '. Please click it to activate your account.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        setSuccessMessage('Password reset email sent! Check your inbox.');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrors({ auth: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      clearInterval(stepInterval);
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden noise animate-in fade-in duration-700">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors mb-8 font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Return to Hub
        </button>

        <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="relative mb-8">
              <Logo size={64} className="text-slate-950" />
              <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full -z-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-950 mb-3 tracking-tighter leading-none">
              {mode === 'login' ? 'System Access' : mode === 'signup' ? 'Node Creation' : 'Passkey Recovery'}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {mode === 'login' ? 'Authentication Protocol v2.4' : mode === 'signup' ? 'Initiate New Identity' : 'Secure Credential Reset'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errors.auth && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest flex items-center gap-4 leading-tight"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} />
                </div>
                {errors.auth}
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-5 bg-green-50 border border-green-100 text-green-600 rounded-3xl text-xs font-black uppercase tracking-widest flex items-center gap-4 leading-tight"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            {mode === 'signup' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                    <UserPlus size={18} />
                  </div>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Satoshi Nakamoto"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-accent/30 rounded-3xl outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Network Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                  <Mail size={18} />
                </div>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="name@domain.ke"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-accent/30 rounded-3xl outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Passkey</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-accent-dark transition-all"
                    >
                      Leak Access?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                    <Lock size={18} />
                  </div>
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-accent/30 rounded-3xl outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Integrity</label>
                <input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat Password"
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-accent/30 rounded-3xl outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSubmitting || resending}
                className="w-full bg-slate-950 text-white py-6 px-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-slate-950 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                    <span>{loadingMessages[loadingStep]}</span>
                  </div>
                ) : (
                  <>
                    {mode === 'login' ? 'Initiate Access' : mode === 'signup' ? 'Finalize Node' : 'Command Recovery'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {mode === 'signup' && successMessage && !isSubmitting && (
              <div className="text-center">
                <button 
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-accent transition-all"
                >
                  {resending ? 'Retransmitting...' : 'Retransmit Request Email'}
                </button>
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-6 bg-white font-black uppercase tracking-widest text-slate-300">Third-Party Gateway</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full bg-white border-2 border-slate-100 text-slate-950 py-5 px-8 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-4 group"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-opacity" />
                  Continue with Google Network
                </button>
              </>
            )}

            {mode !== 'login' && (
              <button 
                type="button"
                onClick={() => {
                  setMode('login');
                  setSuccessMessage(null);
                  setErrors({});
                }}
                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-accent transition-colors"
              >
                Reverse to Master Terminal
              </button>
            )}
          </form>
        </div>

        <div className="mt-12 text-center">
          {mode === 'login' && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              New entity? <button onClick={() => setMode('signup')} className="text-accent hover:underline">Request Node creation</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

