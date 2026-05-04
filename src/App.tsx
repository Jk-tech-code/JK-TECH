/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { LoginPage } from './components/LoginPage';
import { 
  Globe, 
  Share2, 
  Megaphone, 
  Palette, 
  Monitor, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ChevronRight, 
  Check, 
  X, 
  ArrowUpRight, 
  Menu, 
  Shield, 
  Lock, 
  Clock, 
  Users, 
  Play, 
  Zap, 
  Instagram, 
  Facebook, 
  Twitter, 
  Plus,
  AlertCircle,
  User,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { ClientDashboard } from './components/ClientDashboard';

// --- Helpers ---

const getShareUrl = (platform: string, title: string, url: string = window.location.href) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  
  switch(platform) {
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'twitter': return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    case 'whatsapp': return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    default: return '#';
  }
};

const ShareButtons = ({ title, className = "" }: { title: string, className?: string }) => {
  const shareLinks = [
    { platform: 'whatsapp', icon: <MessageSquare size={16} />, color: 'hover:bg-[#25D366]', label: 'Share on WhatsApp' },
    { platform: 'facebook', icon: <Facebook size={16} />, color: 'hover:bg-[#1877F2]', label: 'Share on Facebook' },
    { platform: 'twitter', icon: <Twitter size={16} />, color: 'hover:bg-[#000000]', label: 'Share on X' }
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {shareLinks.map((link) => (
        <button
          key={link.platform}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(getShareUrl(link.platform, title), '_blank', 'width=600,height=400');
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all ${link.color} hover:scale-110 active:scale-95 border border-white/30`}
          title={link.label}
        >
          {link.icon}
        </button>
      ))}
    </div>
  );
};

// --- Components ---

const Navbar = ({ onLoginClick, user }: { onLoginClick: () => void, user: SupabaseUser | null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-6'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className={`flex justify-between items-center transition-all duration-500 rounded-2xl px-6 ${isScrolled ? 'bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-sm py-2' : 'py-0'}`}>
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <Logo className="text-slate-900 group-hover:rotate-[360deg] transition-transform duration-1000" size={32} />
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full -z-10 group-hover:bg-accent/40 transition-colors" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-slate-950">JK Digital Agency</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors rounded-full hover:bg-slate-50"
              >
                {link.name}
              </a>
            ))}
            <div className="w-px h-6 bg-slate-200 mx-4" />
            <button 
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
            >
              {user ? (
                <>
                  <LayoutDashboard size={14} /> Dashboard
                </>
              ) : (
                <>
                  <User size={14} /> Client Portal
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full px-4 pt-2 md:hidden"
          >
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg font-semibold py-3 px-4 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="my-2 border-slate-100" />
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  onLoginClick();
                }}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-center"
              >
                {user ? 'Go to Dashboard' : 'Login to Portal'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-50 noise">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-600 mb-8 tracking-widest uppercase"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
            Leading Digital Agency in Kenya
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold text-slate-950 mb-8 leading-[0.9] tracking-tighter"
          >
            We Build <span className="text-accent italic font-light drop-shadow-sm">Fast</span> & Reliable <span className="text-gradient">Digital</span> Success.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium"
          >
            Empowering Kenyan businesses with cutting-edge websites, 
            strategic marketing, and seamless IT solutions since 2018.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href="#contact" 
              className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-400/30 flex items-center justify-center gap-2"
            >
              Start Your Project <ArrowRight size={20} />
            </a>
            <a 
              href="#services" 
              className="bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Explore Services
            </a>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative max-w-6xl mx-auto"
        >
          <div className="relative rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/20">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="w-full h-auto object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Element 1 */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-6 md:right-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white flex items-center gap-4 hidden sm:flex z-20"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">99.9%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Reliability</div>
            </div>
          </motion.div>

          {/* Floating Element 2 */}
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-6 md:left-10 bg-slate-950 p-6 rounded-3xl shadow-2xl flex items-center gap-4 z-20"
          >
             <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 555}`} alt="User" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-white text-sm font-bold">Joined 50+ Clients</div>
              <div className="text-accent text-[10px] uppercase tracking-widest font-bold">In Kitengela</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-32 bg-slate-50 relative overflow-hidden noise">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-[48px] overflow-hidden shadow-2xl border-white border-[12px]">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop" 
                alt="Our Vision" 
                className="w-full h-auto object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Visual Deco */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-10 px-8 py-6 bg-white rounded-3xl shadow-xl flex items-center gap-4 z-20 border border-slate-100">
               <div className="text-4xl font-black text-slate-950">5+</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Years of <br /> Experience</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="text-accent font-black text-xs uppercase tracking-[0.3em] mb-4">About Us</h2>
              <h3 className="text-5xl font-black text-slate-950 leading-tight mb-6 tracking-tighter">
                Helping You Win <br /> in the Digital World.
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                JK Digital Agency helps entrepreneurs and small businesses in Kenya navigate the web. We build professional websites, manage online portals, and grow your presence.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Expert Web Design", text: "Professional, fast-loading websites that get results." },
                { title: "Local Market Knowledge", text: "We understand the needs of businesses in Kenya." },
                { title: "Growth Focused", text: "Marketing strategies that actually bring in customers." },
                { title: "Full IT Support", text: "We handle the tech so you can focus on your business." }
              ].map((item) => (
                <div key={item.title} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                    <CheckCircle2 size={16} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Impactful Web Design",
      desc: "High-performance websites that convert visitors into loyal customers. Optimized for speed and mobile efficiency.",
      icon: <Globe className="text-accent" size={32} />,
      tag: "Conversion Focused"
    },
    {
      title: "Digital Agency Services",
      desc: "Professional management of KRA, e-Citizen, and NTSA portals. We handle the complexity so you can focus on growth.",
      icon: <CheckCircle2 className="text-accent" size={32} />,
      tag: "Expert Handling"
    },
    {
      title: "Strategic Social Marketing",
      desc: "Data-driven social media strategies that build brand authority and community engagement across all platforms.",
      icon: <Share2 className="text-accent" size={32} />,
      tag: "Growth Oriented"
    },
    {
      title: "Targeted Advertising",
      desc: "Precision-targeted PPC and social ads designed to maximize ROAS and deliver qualified leads to your doorstep.",
      icon: <Megaphone className="text-accent" size={32} />,
      tag: "ROI Driven"
    },
    {
      title: "Brand Architecture",
      desc: "Identity design that resonates. From logos to complete visual systems that define your unique market position.",
      icon: <Palette className="text-accent" size={32} />,
      tag: "Modern Identity"
    },
    {
      title: "Managed IT Support",
      desc: "Full-spectrum technical infrastructure management, security auditing, and 24/7 business continuity support.",
      icon: <Monitor className="text-accent" size={32} />,
      tag: "Always Secure"
    }
  ];

  return (
    <section id="services" className="py-32 bg-white noise">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-accent font-black text-xs uppercase tracking-[0.3em] mb-4">What We Do</h2>
            <h3 className="text-5xl md:text-6xl font-black text-slate-950 leading-[0.85] tracking-tighter">
              Digital Solutions <br /> <span className="text-slate-400">Tailored for Your Growth.</span>
            </h3>
          </div>
          <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
            We deliver high-quality digital services that help small businesses and individuals in Kenya thrive in the online world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-[32px] bg-slate-50 hover:bg-slate-950 transition-all duration-500 cursor-default"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="p-4 bg-white rounded-2xl group-hover:bg-accent group-hover:scale-110 transition-all duration-500 shadow-sm">
                  {React.cloneElement(service.icon as React.ReactElement, {
                    className: "group-hover:text-white transition-colors"
                  })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-accent/60 transition-colors">
                  {service.tag}
                </span>
              </div>
              <h4 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-white transition-colors tracking-tight">
                {service.title}
              </h4>
              <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed mb-8">
                {service.desc}
              </p>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-accent transition-all">
                Learn more <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyChooseUs = () => {
  const reasons = [
    { title: "Affordable Pricing", desc: "Our packages are designed to fit the budgets of Kenyan small businesses." },
    { title: "All-in-One Solutions", desc: "No need to hire multiple people. We handle websites, marketing, and IT." },
    { title: "Local Support", desc: "We are based here in Kenya. You can reach us via WhatsApp anytime." },
    { title: "Real Results", desc: "We focus on metrics that matter: more customer inquiries and more sales." }
  ];

  return (
    <section className="py-24 bg-white border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="grid lg:grid-cols-2 gap-16 items-center border-none">
          <div className="border-none font-bold">
            <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Why Choose Us?</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900 border-none font-bold">A Partner Committed to Your Success</h3>
            <div className="space-y-8 border-none font-bold">
              {reasons.map((reason) => (
                <div key={reason.title} className="flex gap-4 border-none font-bold">
                  <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-primary h-auto border-none font-bold">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="border-none font-bold">
                    <h4 className="text-xl font-bold text-slate-900 mb-1 border-none">{reason.title}</h4>
                    <p className="text-slate-600 border-none font-bold">{reason.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative border-none font-bold h-auto">
            <div className="aspect-square bg-primary rounded-3xl overflow-hidden h-auto border-none font-bold">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2684&auto=format&fit=crop" 
                alt="Support" 
                className="w-full h-full object-cover opacity-80 h-auto border-none font-bold"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-slate-900 text-white p-10 rounded-3xl max-w-xs h-auto border-none font-bold">
              <p className="text-2xl font-bold leading-tight mb-2 border-none">"We don't just build websites; we build business growth."</p>
              <p className="text-primary font-semibold border-none">- JK Digital Team</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Contact Us", desc: "Reach out via WhatsApp or our contact form." },
    { title: "We Understand Your Business", desc: "We discuss your goals and target audience." },
    { title: "We Build Your Digital Solution", desc: "We design and deploy your custom strategy." },
    { title: "You Get More Customers", desc: "Watch your business grow with new leads." }
  ];

  return (
    <section className="py-24 bg-slate-50 border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="text-center max-w-3xl mx-auto mb-16 border-none">
          <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none font-bold">How It Works</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 h-auto border-none font-bold">Your Path to Digital Success</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 border-none font-bold">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative text-center border-none font-bold">
              <div className="w-20 h-20 bg-primary text-white text-3xl font-bold rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 h-auto border-none font-bold">
                0{idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-green-200 -z-0 border-none" />
              )}
              <h4 className="text-xl font-bold text-slate-900 mb-2 border-none font-bold">{step.title}</h4>
              <p className="text-slate-600 border-none font-bold">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: "Lite",
      price: "5,000",
      desc: "Ideal for individual entrepreneurs",
      features: ["3-Page Adaptive Site", "Mobile Optimization", "Core SEO Setup", "Email Support"],
      button: "Initiate Plan",
      highlight: false
    },
    {
      name: "Business",
      price: "15,000",
      desc: "Complete business infrastructure",
      features: ["Full CMS Integration", "Inventory Management", "Advanced Analytics", "Priority Support", "Social Ecosystem"],
      button: "Select Business",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "45,000",
      desc: "Custom high-scale solutions",
      features: ["Bespoke Architecture", "Scalable Infrastructure", "24/7 Security Ops", "Dedicated Manager", "Unlimited Iterations"],
      button: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-white noise">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-accent font-black text-xs uppercase tracking-[0.4em] mb-6">Pricing Plans</h2>
          <h3 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter">Affordable Packages.</h3>
          <p className="mt-4 text-slate-500 font-medium leading-relaxed">Choose a fixed-price package that fits your business needs and budget.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <motion.div 
              key={plan.name}
              whileHover={{ y: -5 }}
              className={`flex flex-col p-10 rounded-[32px] border ${plan.highlight ? 'bg-slate-950 text-white border-slate-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]' : 'bg-slate-50 text-slate-900 border-slate-100'} transition-all`}
            >
              {plan.highlight && (
                <div className="bg-accent text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-fit mb-8">
                  Recommended Configuration
                </div>
              )}
              <h4 className="text-xl font-black mb-1">{plan.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-sm font-bold ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>KES</span>
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                <span className={`text-sm font-bold ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>/ launch</span>
              </div>
              <p className={`mb-10 text-sm font-medium leading-relaxed ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
              
              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-accent/20 text-accent' : 'bg-slate-200 text-slate-500'}`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold">{f}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.highlight ? 'bg-accent text-slate-950 hover:bg-white' : 'bg-slate-900 text-white hover:bg-accent hover:text-slate-950'}`}
              >
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const items = [
    { 
      title: "FinTech Dashboard", 
      category: "Platform Design", 
      img: "https://images.unsplash.com/photo-1551288049-bbda4833effb?q=80&w=2670&auto=format&fit=crop",
      tag: "Case Study 01"
    },
    { 
      title: "AgroConnect App", 
      category: "Mobile Solutions", 
      img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2670&auto=format&fit=crop",
      tag: "Case Study 02"
    },
    { 
      title: "Elite Real Estate", 
      category: "Web Engineering", 
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2670&auto=format&fit=crop",
      tag: "Case Study 03"
    },
    { 
      title: "Safaricom Partner", 
      category: "Digital Strategy", 
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop",
      tag: "Case Study 04"
    }
  ];

  return (
    <section id="portfolio" className="py-32 bg-slate-950 noise text-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-accent font-black text-xs uppercase tracking-[0.4em] mb-6">Our Work</h2>
          <h3 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter">Featured Projects.</h3>
          <p className="text-slate-400 font-medium">Take a look at some of the recent projects we've built for our happy clients.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {items.map((item, idx) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[40px] aspect-[16/10]"
            >
              <img 
                src={item.img} 
                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" 
                alt={item.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0">
                  <span className="px-4 py-1.5 bg-accent text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {item.tag}
                  </span>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="translate-y-[20px] group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-accent font-black text-[10px] uppercase tracking-[0.3em] mb-2">{item.category}</p>
                  <h4 className="text-3xl font-black tracking-tighter">{item.title}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent transition-all ring-offset-4 ring-offset-slate-950 hover:ring-2 ring-white">
            View All Projects
          </button>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    { 
      text: "JK Digital Marketing helped us get more customers online and improved our business visibility significantly in Kitengela.",
      author: "Jane Kamau",
      role: "CEO, Kitengela Retail",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
    },
    { 
      text: "The team is very professional and affordable. They built our school portal in just two weeks and it works perfectly.",
      author: "David Mwangi",
      role: "Director, Athi Academy",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="text-center max-w-3xl mx-auto mb-16 border-none">
          <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 border-none">What Our Clients Say</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8 border-none font-bold">
          {reviews.map((rev) => (
            <div key={rev.author} className="bg-slate-50 p-10 rounded-3xl border border-slate-100 border-none font-bold">
              <div className="flex gap-1 text-primary mb-6 border-none font-bold">
                {[1, 2, 3, 4, 5].map((s) => <CheckCircle2 key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xl italic text-slate-700 mb-8 border-none font-bold">"{rev.text}"</p>
              <div className="flex items-center gap-4 border-none font-bold">
                <img src={rev.avatar} className="w-12 h-12 rounded-full h-auto border-none font-bold" alt={rev.author} />
                <div className="border-none font-bold">
                  <p className="font-bold text-slate-900 border-none">{rev.author}</p>
                  <p className="text-sm text-slate-500 border-none">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business: '',
    service: 'Website Design',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Access name required.';
    if (!formData.email.trim()) newErrors.email = 'Network address required.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-32 bg-slate-950 text-white relative overflow-hidden noise">
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-accent font-black text-xs uppercase tracking-[0.4em] mb-6">Get in Touch</h2>
            <h3 className="text-6xl font-black mb-8 tracking-tighter leading-none">Let's Talk Business.</h3>
            <p className="text-slate-400 text-lg mb-12 font-medium max-w-md leading-relaxed">
              Have a project in mind? Reach out to us for a free quote and consultation today.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               {[
                 { icon: <Mail />, label: "Email Us", value: "hello@jkdigital.ke" },
                 { icon: <Phone />, label: "Call Us", value: "+254 714 965 716" },
                 { icon: <MapPin />, label: "Location", value: "Kitengela, Kenya" },
                 { icon: <Clock />, label: "Hours", value: "24/7 Digital Desk" }
               ].map((item) => (
                 <div key={item.label} className="flex flex-col gap-3">
                   <div className="text-accent">{React.cloneElement(item.icon as React.ReactElement, { size: 18 })}</div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                     <p className="text-sm font-bold">{item.value}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[40px] shadow-2xl">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8">
                    <Check size={40} />
                  </div>
                  <h4 className="text-3xl font-black text-slate-950 mb-4 tracking-tight">Message Received!</h4>
                  <p className="text-slate-500 font-medium mb-8">Thanks for reaching out! Our team will get back to you within 2 hours.</p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-accent font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                       <input 
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                         placeholder="Full Name"
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-accent/30 text-slate-900 font-bold transition-all"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                       <input 
                         name="email"
                         value={formData.email}
                         onChange={handleChange}
                         placeholder="Your Email"
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-accent/30 text-slate-900 font-bold transition-all"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                     <textarea 
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-accent/30 text-slate-900 font-bold transition-all resize-none"
                     />
                   </div>
                   <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent hover:text-slate-950 transition-all shadow-xl shadow-slate-200"
                   >
                     {isSubmitting ? "Sending..." : "Send Message"}
                   </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
const BlogTeaser = () => {
  const posts = [
    { title: "5 Tips to Increase Your Sales via Facebook", date: "April 28, 2026", category: "Social Media" },
    { title: "Why Your Business Needs a Professional Website", date: "April 15, 2026", category: "Web Design" },
    { title: "Managing IT for Small Businesses in Kitengela", date: "April 05, 2026", category: "IT Support" }
  ];

  return (
    <section id="blog" className="py-24 bg-white border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-none">
          <div className="max-w-2xl border-none">
            <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Marketing Tips</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 border-none">Latest from Our Blog</h3>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 font-bold text-primary hover:gap-4 transition-all border-none">
            View All Posts <ArrowRight size={20} />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-8 border-none font-bold">
          {posts.map((post) => (
            <div key={post.title} className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all border-none font-bold relative flex flex-col justify-between">
              <div className="border-none font-bold">
                <div className="flex justify-between items-start mb-4 border-none">
                  <p className="text-xs font-bold text-primary uppercase border-none font-bold">{post.category}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 border-none">
                    <button 
                      onClick={() => window.open(getShareUrl('whatsapp', post.title), '_blank')}
                      className="text-slate-400 hover:text-[#25D366] transition-colors border-none"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      onClick={() => window.open(getShareUrl('facebook', post.title), '_blank')}
                      className="text-slate-400 hover:text-[#1877F2] transition-colors border-none"
                    >
                      <Facebook size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 border-none font-bold">{post.title}</h4>
                <p className="text-slate-500 mb-6 border-none font-bold">{post.date}</p>
              </div>
              <a href="#" className="flex items-center gap-2 font-bold text-slate-900 border-none font-bold group-hover:text-primary transition-colors">Read More <ChevronRight size={18} /></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const footerLinks = {
    quick: [
      { name: 'Home', href: '#' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Portfolio', href: '#portfolio' },
      { name: 'Client Portal', href: '#client-portal' },
      { name: 'Contact Us', href: '#contact' },
    ],
    services: [
      { name: 'Website Design', href: '#services' },
      { name: 'Cyber Services', href: '#cyber-services' },
      { name: 'Digital Marketing', href: '#services' },
      { name: 'Branding & Design', href: '#services' },
      { name: 'IT Support', href: '#services' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Testimonials', href: '#testimonials' },
      { name: 'Latest Blog', href: '#blog' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ]
  };

  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200 border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-none font-bold">
          <div className="border-none font-bold">
            <a href="#" className="flex items-center gap-2 mb-6 border-none">
              <Logo className="text-primary" size={40} />
              <span className="font-bold text-2xl text-slate-900 border-none font-bold">JK Tech Cyber</span>
            </a>
            <p className="text-slate-500 mb-6 border-none font-bold">Your trusted partner for professional websites, cyber services, and digital marketing in Kenya.</p>
            <div className="flex gap-4 border-none font-bold">
              {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all h-auto border-none font-bold">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="border-none font-bold">
            <h4 className="font-bold text-slate-900 mb-6 border-none font-bold">Quick Links</h4>
            <ul className="space-y-4 border-none font-bold">
              {footerLinks.quick.map((link) => (
                <li key={link.name}><a href={link.href} className="text-slate-500 hover:text-primary transition-colors border-none font-bold">{link.name}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="border-none font-bold">
            <h4 className="font-bold text-slate-900 mb-6 border-none font-bold">Our Services</h4>
            <ul className="space-y-4 border-none font-bold">
              {footerLinks.services.map((link) => (
                <li key={link.name}><a href={link.href} className="text-slate-500 hover:text-primary transition-colors border-none font-bold">{link.name}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="border-none font-bold">
            <h4 className="font-bold text-slate-900 mb-6 border-none font-bold">Company</h4>
            <ul className="space-y-4 border-none font-bold">
              {footerLinks.company.map((link) => (
                <li key={link.name}><a href={link.href} className="text-slate-500 hover:text-primary transition-colors border-none font-bold">{link.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 text-slate-500 text-sm border-none font-bold">
          <p>© 2026 JK Digital Marketing. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0 border-none font-bold">
            <a href="#" className="hover:text-primary border-none">Privacy Policy</a>
            <a href="#" className="hover:text-primary border-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const ClientPortal = ({ onLoginClick, user }: { onLoginClick: () => void, user: SupabaseUser | null }) => {
  const portalFeatures = [
    {
      title: "Real-time Updates",
      desc: "Track the progress of your active projects and milestones as we reach them.",
      icon: <LayoutDashboard className="text-primary" size={24} />
    },
    {
      title: "Secure Documents",
      desc: "Access and download your invoices, contracts, and digital certificates safely.",
      icon: <ShieldCheck className="text-primary" size={24} />
    },
    {
      title: "Priority Support",
      desc: "Existing clients get access to a dedicated support desk for instant assistance.",
      icon: <MessageSquare className="text-primary" size={24} />
    }
  ];

  return (
    <section id="client-portal" className="py-24 bg-slate-900 text-white border-none overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 border-none">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-12 rounded-[40px] border-none">
          <div className="grid lg:grid-cols-2 gap-16 items-center border-none">
            <div className="border-none font-bold">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-bold mb-6 h-auto">
                <User size={16} /> Exclusive for JK Tech Clients
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight border-none">Your Dedicated Project Portal</h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed border-none">
                We believe in total transparency. Our Client Portal allows you to manage your relationship with us in one place—from tracking design progress to managing your cyber service applications.
              </p>
              <div className="space-y-6 border-none">
                {portalFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-4 border-none">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border-none">
                      {feature.icon}
                    </div>
                    <div className="border-none">
                      <h4 className="text-lg font-bold text-white mb-1 border-none">{feature.title}</h4>
                      <p className="text-sm text-slate-500 border-none">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-col sm:flex-row gap-4 border-none font-bold">
                <button 
                  onClick={onLoginClick}
                  className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all text-center border-none shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                >
                  {user ? 'Go to Dashboard' : 'Login to Portal'}
                </button>
                <a 
                  href="#contact" 
                  className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center border-none"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative border-none h-auto lg:block hidden">
              <div className="bg-gradient-to-br from-primary/20 to-transparent absolute -inset-10 blur-3xl -z-10 rounded-full h-auto border-none" />
              <div className="bg-slate-900 p-4 rounded-3xl border border-slate-700 shadow-2xl h-auto border-none">
                <div className="bg-slate-800 rounded-2xl p-6 border-none h-auto">
                  <div className="flex justify-between items-center mb-8 border-none font-bold">
                    <div className="flex gap-2 border-none">
                      <div className="w-3 h-3 rounded-full bg-red-400 h-auto border-none" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400 h-auto border-none" />
                      <div className="w-3 h-3 rounded-full bg-green-400 h-auto border-none" />
                    </div>
                    <div className="w-32 h-2 bg-slate-700 rounded-full h-auto border-none" />
                  </div>
                  <div className="space-y-4 border-none font-bold">
                    <div className="h-8 bg-slate-700 rounded-lg w-3/4 animate-pulse border-none" />
                    <div className="grid grid-cols-2 gap-4 border-none">
                      <div className="h-24 bg-slate-700/50 rounded-xl border border-slate-700 border-none" />
                      <div className="h-24 bg-slate-700/50 rounded-xl border border-slate-700 border-none" />
                    </div>
                    <div className="h-32 bg-slate-700/50 rounded-xl border border-slate-700 border-none" />
                    <div className="flex justify-end border-none">
                      <div className="h-10 bg-primary/40 rounded-lg w-24 border-none" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 bg-primary p-6 rounded-2xl shadow-xl border-none">
                <CheckCircle2 size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhatsAppButton = () => {
  return (
    <a 
      href="https://wa.me/254714965716" 
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-none font-bold"
    >
      <MessageSquare size={32} />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce h-auto border-none">1</span>
    </a>
  );
};

const CyberPortals = () => {
  const portalServices = [
    {
      title: "KRA Tax Services",
      desc: "Protect your business from the taxman and enjoy peace of mind. We ensure your returns are filed accurately and on time so you can focus on building your empire.",
      items: [
        "Annual Income Tax Returns",
        "KRA PIN Registration",
        "Tax Compliance Certificates (TCC)",
        "VAT & Monthly Rental Income filing"
      ],
      icon: <CheckCircle2 className="text-primary" size={32} />
    },
    {
      title: "e-Citizen Services",
      desc: "Don't let bureaucracy slow you down. We handle the technical side of government portals to get your critical documents processed in record time.",
      items: [
        "Business Name Registration",
        "Certificate of Good Conduct",
        "NTSA / TIMS (Driving Licenses)",
        "Passport & Visa Applications"
      ],
      icon: <CheckCircle2 className="text-primary" size={32} />
    }
  ];

  return (
    <section id="cyber-services" className="py-24 bg-white border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="grid lg:grid-cols-2 gap-16 items-center border-none">
          <div className="border-none font-bold">
            <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Cyber & Portal Services</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900 border-none">Simplifying Government Services for You</h3>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed border-none">
              Navigating government portals can be stressful. We provide a specialized "Cyber" desk to help individuals and business owners in Kenya handle their digital applications quickly and correctly.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 border-none">
              {portalServices.map((portal) => (
                <div key={portal.title} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-none">
                  <div className="mb-4 h-auto border-none">{portal.icon}</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 border-none">{portal.title}</h4>
                  <p className="text-sm text-slate-500 mb-4 border-none">{portal.desc}</p>
                  <ul className="space-y-2 border-none">
                    {portal.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700 border-none">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full border-none" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group border-none">
            <div className="absolute inset-0 bg-primary/10 rounded-[40px] rotate-3 group-hover:rotate-0 transition-transform h-auto border-none" />
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop" 
              alt="Cyber Services" 
              className="relative rounded-[40px] shadow-xl h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session once on mount
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) setView('dashboard');
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Supabase session error:", err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setView('dashboard');
      } else {
        // Only force back to landing if they were on the dashboard
        setView(prev => prev === 'dashboard' ? 'landing' : prev);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (view === 'login' && !user) {
    return <LoginPage onBack={() => setView('landing')} />;
  }

  if (view === 'dashboard' && user) {
    return <ClientDashboard user={user} onLogout={() => setView('landing')} />;
  }

  return (
    <div className="selection:bg-primary selection:text-white bg-white min-h-screen flex flex-col">
      <Navbar onLoginClick={() => setView(user ? 'dashboard' : 'login')} user={user} />
      <main className="flex-grow">
        <Hero />
        <About />
        <Services />
        <CyberPortals />
        <WhyChooseUs />
        <HowItWorks />
        <Pricing />
        <Portfolio />
        <ClientPortal onLoginClick={() => setView(user ? 'dashboard' : 'login')} user={user} />
        <Testimonials />
        <BlogTeaser />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

