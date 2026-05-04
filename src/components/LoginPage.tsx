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
      let message = error.message || 'An unexpected error occurred. Please try again.';
      
      // Specifically handle "Failed to fetch" which is common when Supabase is unreachable or paused
      if (message === 'Failed to fetch' || message.includes('fetch')) {
        message = 'Connection Failed: Unable to reach the authentication server.';
        
        // Try a quick ping to diagnose
        try {
          const startTime = Date.now();
          await fetch(supabase.auth.getSession ? (supabase as any).supabaseUrl : 'https://google.com', { mode: 'no-cors', cache: 'no-store' });
          const duration = Date.now() - startTime;
          message += ` (Network seems active: ${duration}ms ping to server endpoint). This often means your browser's ad-blocker is interfering or the Supabase project is paused.`;
        } catch (pingErr) {
          message += ' Your device seems unable to contact the Supabase servers. Please check your internet connection or VPN.';
        }
      }
      
      setErrors({ auth: message });
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
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-10 text-white text-center"
          >
            <div className="relative">
              <Logo className="text-accent animate-pulse" size={64} />
              <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
            </div>
            <h2 className="mt-8 text-3xl font-display font-bold tracking-tighter uppercase italic">{loadingMessages[loadingStep]}</h2>
            <div className="w-64 h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
            <p className="mt-4 text-slate-400 font-mono text-[10px] uppercase tracking-widest">System Authentication in Progress</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-[40px] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 ring-1 ring-white/50"
      >
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-100 relative overflow-hidden noise">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <button onClick={onBack} className="flex items-center gap-3 group">
              <Logo className="text-slate-900 group-hover:rotate-[360deg] transition-transform duration-1000" size={40} />
              <span className="font-display font-extrabold text-2xl tracking-tighter text-slate-950 uppercase">JK Tech Cyber</span>
            </button>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Priority Access</span>
            </div>
            <h1 className="text-6xl font-display font-extrabold text-slate-950 leading-[0.9] tracking-tighter mb-8 italic">
              Digital <br />
              <span className="text-accent not-italic font-light drop-shadow-sm">Evolution</span> Center.
            </h1>
            <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-sm">
              The next generation of Kenyan digital infrastructure, optimized for your business success.
            </p>
          </div>

          <div className="relative z-10 pt-10 border-t border-slate-200/50 flex items-center justify-between">
             <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-100 bg-slate-300 ring-2 ring-white overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Satisfaction</p>
              <p className="text-lg font-display font-bold text-slate-950 tracking-tight tracking-tighter uppercase">Rating: 4.9/5.0</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center relative bg-white overflow-y-auto">
          <div className="lg:hidden absolute top-8 left-8">
             <Logo size={28} />
          </div>

          <button 
            onClick={onBack}
            className="self-end lg:absolute lg:top-8 lg:right-8 group flex items-center gap-2 text-slate-400 hover:text-slate-950 transition-all font-black text-[10px] uppercase tracking-[0.2em] mb-8 lg:mb-0"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Home
          </button>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 lg:mb-12">
              <h2 className="text-4xl font-display font-extrabold text-slate-950 tracking-tighter mb-3 uppercase">
                {mode === 'login' ? 'Auth Required' : mode === 'signup' ? 'Create Base' : 'Secure Recovery'}
              </h2>
              <p className="text-slate-400 font-bold text-sm">
                {mode === 'login' ? 'Enter credentials to synchronize with your dashboard.' : 
                 mode === 'signup' ? 'Begin your journey with JK Tech Cyber today.' : 
                 "Authorization recovery link will be shared via email."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {errors.auth && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 leading-tight shadow-sm"
                >
                  <div className="w-8 h-8 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div className="flex-1">{errors.auth}</div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-8 p-5 bg-green-50 border border-green-100 text-green-600 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 leading-tight shadow-sm"
                >
                  <div className="w-8 h-8 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex-1">{successMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                      <LogIn size={18} />
                    </div>
                    <input 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Full Name"
                      className={`w-full pl-14 pr-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 ${errors.fullName ? 'border-red-200 bg-red-50/10' : 'border-transparent focus:border-accent/30 focus:bg-white'}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.fullName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Terminal ID (Email)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                    <Mail size={18} />
                  </div>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="name@example.com"
                    className={`w-full pl-14 pr-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 ${errors.email ? 'border-red-200 bg-red-50/10' : 'border-transparent focus:border-accent/30 focus:bg-white'}`}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.email}</p>}
              </div>

              {(mode === 'login' || mode === 'signup') && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent-dark transition-colors"
                      >
                        Lost Key?
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
                      className={`w-full pl-14 pr-14 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 ${errors.password ? 'border-red-200 bg-red-50/10' : 'border-transparent focus:border-accent/30 focus:bg-white'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.password}</p>}
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Security Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                      <ShieldCheck size={18} />
                    </div>
                    <input 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-8 py-4 bg-slate-50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none text-slate-900 font-bold transition-all placeholder:text-slate-300`}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-950 text-white py-5 rounded-2xl font-display font-extrabold text-sm uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group disabled:opacity-50"
              >
                {mode === 'login' ? (
                  <>Sync Terminal <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /></>
                ) : mode === 'signup' ? (
                  <>Initialize Base <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                ) : (
                  <>Reset Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Direct Gate</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-opacity" />
                Continue with Google
              </button>
            </form>

            <div className="mt-10 text-center">
              {mode === 'login' ? (
                <p className="text-slate-400 font-bold text-sm">
                  New operator? {" "}
                  <button 
                    onClick={() => setMode('signup')}
                    className="text-accent hover:text-accent-dark transition-colors font-black uppercase tracking-widest text-[10px]"
                  >
                    Request Base Initialization
                  </button>
                </p>
              ) : (
                <p className="text-slate-400 font-bold text-sm">
                  Already registered? {" "}
                  <button 
                    onClick={() => setMode('login')}
                    className="text-accent hover:text-accent-dark transition-colors font-black uppercase tracking-widest text-[10px]"
                  >
                    Return to Terminal
                  </button>
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-auto pt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              © 2026 JK Tech Cyber • Cyber Security Protocol v4.2
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

