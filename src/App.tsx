/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
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
  Menu, 
  X,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const Navbar = () => {
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
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center text-slate-900 border-none">
        <a href="#" className="flex items-center gap-2 group border-none">
          <Logo className="text-primary group-hover:rotate-12 transition-transform" size={42} />
          <span className={`font-bold text-2xl tracking-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>JK Tech Cyber</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 border-none">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="font-medium hover:text-primary transition-colors border-none"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-all hover:scale-105 active:scale-95 border-none"
          >
            Get a Quote
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-900 p-2 border-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4 border-none">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg font-medium py-2 hover:text-primary transition-colors border-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="#contact" 
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-primary-dark transition-all border-none"
                onClick={() => setIsMenuOpen(false)}
              >
                Get a Quote
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 flex items-center overflow-hidden border-none text-blue-900">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-2/3 bg-sky-50/50 -z-10 rounded-bl-full" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-sky-100/30 -z-10 blur-3xl rounded-full" />

      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center border-none">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-none"
        >
          <div className="inline-flex items-center gap-2 bg-sky-50 text-primary border border-sky-100 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 h-auto">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Top-Rated Cyber & Digital Agency in Kenya
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-slate-900">
            Tech & <span className="text-primary italic">Cyber</span> Solutions
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
            From professional websites to KRA & e-Citizen services, we help individuals and small businesses in Kenya navigate the digital world with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 border-none">
            <a 
              href="#contact" 
              className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-dark transition-all hover:-translate-y-1 shadow-lg shadow-sky-200 border-none"
            >
              Get a Quote <ArrowRight size={20} />
            </a>
            <a 
              href="https://wa.me/254714965716" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-lg shadow-slate-200 border-none"
            >
              <MessageSquare size={20} /> Chat on WhatsApp
            </a>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-slate-500 border-none">
            <div className="flex -space-x-3 overflow-hidden border-none font-bold">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white h-auto"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                  alt="Reviewer"
                />
              ))}
            </div>
            <p className="text-sm">Trusted by <span className="font-bold text-slate-900 border-none">50+ SMEs</span> in Kitengela & Athi River</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative border-none h-auto"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl h-auto border-none">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
              alt="Digital Growth" 
              className="w-full h-auto object-cover h-auto"
            />
          </div>
          {/* Floating Stats Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 z-20 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border-none"
          >
            <div className="bg-sky-100 p-3 rounded-xl text-primary h-auto">
              <Globe size={32} />
            </div>
            <div className="border-none font-bold">
              <div className="text-2xl font-bold text-slate-900 border-none">95%</div>
              <div className="text-sm text-slate-500 border-none">Client Success Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-white border-none">
      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-16 items-center border-none">
        <div className="relative border-none h-auto">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop" 
            alt="Team Working" 
            className="rounded-3xl shadow-xl h-auto"
          />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full -z-10 h-auto" />
        </div>
        <div className="border-none font-bold">
          <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">About JK Tech Cyber</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight border-none">Your Local Partner for Cyber & Tech</h3>
          <p className="text-lg text-slate-600 mb-6 leading-relaxed border-none">
            JK Tech Cyber is a specialized agency based in Kenya, providing a bridge between technology and local business needs. We understand the unique digital landscape of Kitengela, Athi River, and beyond.
          </p>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed border-none">
            Whether you need a modern business website, social media management, or assistance with government online portals (KRA, E-Citizen, NTSA), we provide fast, professional, and affordable services.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 border-none">
            {[
              "Local Market Expertise",
              "Small Business Focused",
              "Results-Driven Approach",
              "Transparent Pricing"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 border-none">
                <CheckCircle2 className="text-primary" size={20} />
                <span className="font-semibold text-slate-700 border-none">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Website Design",
      desc: "Turn your business into a 24/7 sales machine with a professional website that builds trust and makes it easy for customers to find and pay you.",
      icon: <Globe className="text-primary" size={40} />,
      link: "#"
    },
    {
      title: "Cyber & Online Services",
      desc: "Skip the queues and avoid heavy penalties. We handle your KRA, e-Citizen, and NTSA applications correctly, saving you time and stress.",
      icon: <CheckCircle2 className="text-primary" size={40} />,
      link: "#"
    },
    {
      title: "Social Media Marketing",
      desc: "Stop shouting into the void. We build a loyal community for your brand on Facebook and Instagram that actually converts followers into repeat customers.",
      icon: <Share2 className="text-primary" size={40} />,
      link: "#"
    },
    {
      title: "Online Advertising",
      desc: "Get your business in front of people who are ready to buy right now. Our targeted ads ensure every shilling you spend brings in real leads.",
      icon: <Megaphone className="text-primary" size={40} />,
      link: "#"
    },
    {
      title: "Branding & Design",
      desc: "Don't just be another shop. Get a professional identity that makes you the first choice in your neighborhood and leaves a lasting impression.",
      icon: <Palette className="text-primary" size={40} />,
      link: "#"
    },
    {
      title: "IT Support",
      desc: "Keep your business running smoothly without tech headaches. Our reliable support ensures your systems are secure, fast, and always online.",
      icon: <Monitor className="text-primary" size={40} />,
      link: "#"
    }
  ];

  return (
    <section id="services" className="py-24 bg-slate-50 border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="text-center max-w-3xl mx-auto mb-16 border-none">
          <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Our Services</h2>
          <h3 className="text-4xl md:text-5xl font-bold bg-white text-slate-900 border-none">Services We Provide to Help You Grow</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 border-none">
          {services.map((service, idx) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group border-none"
            >
              <div className="mb-6 p-4 bg-sky-50 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-colors h-auto border-none">
                {service.icon}
              </div>
              <h4 className="text-2xl font-bold mb-4 text-slate-900 border-none">{service.title}</h4>
              <p className="text-slate-600 mb-6 leading-relaxed border-none">{service.desc}</p>
              <a href={service.link} className="flex items-center gap-2 font-bold text-primary hover:gap-4 transition-all border-none">
                Learn More <ArrowRight size={18} />
              </a>
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
      name: "Starter",
      price: "5,000",
      desc: "Perfect for new startups",
      features: ["Basic Website", "Mobile Optimized", "Contact Page", "1 Week Support"],
      button: "Get Started",
      highlight: false
    },
    {
      name: "Business",
      price: "10,000",
      desc: "Most popular for SMEs",
      features: ["Multi-page Website", "Contact System", "Social Setup", "SEO Optimized", "1 Month Support"],
      button: "Choose Business",
      highlight: true
    },
    {
      name: "Premium",
      price: "20,000",
      desc: "The full digital suite",
      features: ["Full Custom Website", "SEO Strategy", "Marketing Tools", "Logo & Branding", "3 Months Support"],
      button: "Go Premium",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white border-none">
      <div className="container mx-auto px-4 md:px-6 border-none">
        <div className="text-center max-w-3xl mx-auto mb-16 border-none">
          <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none font-bold">Our Pricing</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 border-none font-bold">Affordable Digital Packages</h3>
          <p className="mt-4 text-slate-600 font-bold border-none">No hidden fees. Transparent pricing for Kenyas small businesses.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-end border-none font-bold">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`p-10 rounded-3xl border ${plan.highlight ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-2xl relative z-10' : 'bg-white text-slate-900 border-slate-100'} transition-all border-none font-bold`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full h-auto border-none">
                  Most Popular
                </div>
              )}
              <h4 className="text-xl font-bold mb-2 border-none font-bold">{plan.name}</h4>
              <div className="flex items-baseline gap-1 mb-6 border-none font-bold">
                <span className="text-sm font-semibold border-none font-bold">KES</span>
                <span className="text-5xl font-bold border-none font-bold">{plan.price}</span>
              </div>
              <p className={`mb-8 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'} border-none font-bold`}>{plan.desc}</p>
              <div className="space-y-4 mb-10 border-none font-bold">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 border-none font-bold">
                    <CheckCircle2 className="text-primary" size={18} />
                    <span className="border-none font-bold">{f}</span>
                  </div>
                ))}
              </div>
              <a 
                href="#contact" 
                className={`block w-full text-center py-4 rounded-xl font-bold transition-all ${plan.highlight ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-900 text-white hover:bg-slate-800'} border-none font-bold`}
              >
                {plan.button}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const items = [
    { title: "Kitengela Training Ctr", category: "Full Website", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop" },
    { title: "Luxe Baskets Logo", category: "Branding", img: "https://images.unsplash.com/photo-1541462608141-ad4d05ed08bc?q=80&w=2670&auto=format&fit=crop" },
    { title: "Athi River Spares", category: "E-Commerce", img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2670&auto=format&fit=crop" },
    { title: "Global Hair Salon", category: "Social Marketing", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop" }
  ];

  return (
    <section id="portfolio" className="py-24 bg-slate-50 border-none">
      <div className="container mx-auto px-4 md:px-6 border-none text-center">
        <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Our Portfolio</h2>
        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 border-none">Successful Projects</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 border-none font-bold">
          {items.map((item) => (
            <div key={item.title} className="group relative overflow-hidden rounded-3xl shadow-md border-none">
              <img 
                src={item.img} 
                className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-500 h-auto" 
                alt={item.title}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white border-none">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1 border-none">{item.category}</p>
                <p className="text-xl font-bold border-none">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 border-none">
          <a href="#" className="flex items-center justify-center gap-2 font-bold text-slate-900 hover:text-primary transition-colors border-none">
            View All Projects <ArrowRight size={20} />
          </a>
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
    <section className="py-24 bg-white border-none">
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ 
        name: '', 
        email: '', 
        business: '', 
        service: 'Website Design', 
        message: '' 
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-900 text-white border-none overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 -z-0 blur-[100px] rounded-full border-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 border-none">
        <div className="grid lg:grid-cols-2 gap-16 border-none font-bold">
          <div className="border-none font-bold">
            <h2 className="text-primary font-bold text-lg mb-4 h-auto border-none">Contact Us</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight border-none">Ready to Grow Your Business?</h3>
            <p className="text-slate-400 text-lg mb-10 border-none">Contact us today for a free consultation and quote. We are here to help you succeed.</p>
            
            <div className="space-y-6 border-none font-bold text-white">
              <div className="flex items-center gap-4 border-none">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary h-auto border-none">
                  <Phone size={24} />
                </div>
                <div className="border-none">
                  <p className="text-sm text-slate-400 border-none">Call Us</p>
                  <p className="text-xl font-bold border-none">+254 714 965 716</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-none text-white font-bold">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary h-auto border-none">
                  <MessageSquare size={24} />
                </div>
                <div className="border-none">
                  <p className="text-sm text-slate-400 border-none">WhatsApp</p>
                  <a href="https://wa.me/254714965716" target="_blank" rel="noopener noreferrer" className="text-xl font-bold hover:text-primary transition-colors border-none group flex items-center gap-2">
                    +254 714 965 716 <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Click to Chat</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 border-none font-bold">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary h-auto border-none">
                  <Mail size={24} />
                </div>
                <div className="border-none">
                  <p className="text-sm text-slate-400 border-none">Email</p>
                  <p className="text-xl font-bold border-none">jktech.com@ac.ke</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-none font-bold">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary h-auto border-none">
                  <MapPin size={24} />
                </div>
                <div className="border-none">
                  <p className="text-sm text-slate-400 border-none">Location</p>
                  <p className="text-xl font-bold border-none">Kitengela / Athi River, Kenya</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[32px] text-slate-900 shadow-2xl border-none relative overflow-hidden">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="text-center py-12 h-full flex flex-col justify-center items-center font-bold"
                >
                  <div className="w-24 h-24 bg-green-100 text-primary rounded-full flex items-center justify-center mb-8 border-none">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-3xl font-bold mb-4 border-none">Message Sent!</h4>
                  <p className="text-slate-600 text-lg mb-8 max-w-sm border-none font-bold">
                    Thank you for reaching out to JK Tech Cyber. We've received your inquiry and will get back to you within a few hours.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-primary-dark transition-all border-none"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6 border-none font-bold"
                >
                  <div className="grid md:grid-cols-2 gap-6 border-none">
                    <div className="border-none">
                      <label className="block text-sm font-bold text-slate-700 mb-2 border-none font-bold">Your Name</label>
                      <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text" 
                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl focus:ring-2 focus:ring-primary h-auto outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`} 
                        placeholder="John Doe" 
                      />
                      {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold italic tracking-wide">{errors.name}</p>}
                    </div>
                    <div className="border-none">
                      <label className="block text-sm font-bold text-slate-700 mb-2 border-none">Your Email Address</label>
                      <input 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email" 
                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl focus:ring-2 focus:ring-primary h-auto outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`} 
                        placeholder="john@example.com" 
                      />
                      {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold italic tracking-wide">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="border-none">
                    <label className="block text-sm font-bold text-slate-700 mb-2 border-none">Business Name</label>
                    <input 
                      name="business"
                      value={formData.business}
                      onChange={handleChange}
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-primary h-auto outline-none" 
                      placeholder="My Enterprise" 
                    />
                  </div>
                  <div className="border-none">
                    <label className="block text-sm font-bold text-slate-700 mb-2 border-none">Service Needed</label>
                    <select 
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-primary h-auto font-bold appearance-none outline-none"
                    >
                      <option>Website Design</option>
                      <option>Cyber & Online Services</option>
                      <option>Social Media Marketing</option>
                      <option>Branding</option>
                      <option>IT Support</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="border-none">
                    <label className="block text-sm font-bold text-slate-700 mb-2 border-none">Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4} 
                      className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl focus:ring-2 focus:ring-primary h-auto outline-none transition-all ${errors.message ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`} 
                      placeholder="Tell us more about your project..."
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-[10px] mt-1 font-bold italic tracking-wide">{errors.message}</p>}
                  </div>
                  <p className="text-xs text-slate-500 italic mb-4">⚡ We usually respond within a few hours during working time.</p>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-5 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin h-auto" />
                        Sending...
                      </>
                    ) : '👉 Send Message'}
                  </button>
                </motion.form>
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
    <section className="py-24 bg-white border-none">
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
            <div key={post.title} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all border-none font-bold">
              <p className="text-xs font-bold text-primary uppercase mb-4 border-none font-bold">{post.category}</p>
              <h4 className="text-xl font-bold text-slate-900 mb-4 border-none font-bold">{post.title}</h4>
              <p className="text-slate-500 mb-6 border-none font-bold">{post.date}</p>
              <a href="#" className="flex items-center gap-2 font-bold text-slate-900 border-none font-bold">Read More <ChevronRight size={18} /></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
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
              {['Home', 'About Us', 'Services', 'Pricing', 'Portfolio', 'Contact'].map((item) => (
                <li key={item}><a href={`#${item.toLowerCase().replace(' ', '')}`} className="text-slate-500 hover:text-primary transition-colors border-none font-bold">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="border-none font-bold">
            <h4 className="font-bold text-slate-900 mb-6 border-none font-bold">Our Services</h4>
            <ul className="space-y-4 border-none font-bold">
              {['Website Design', 'Social Media', 'Online Ads', 'Branding', 'IT Support'].map((item) => (
                <li key={item}><a href="#services" className="text-slate-500 hover:text-primary transition-colors border-none font-bold">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="border-none font-bold">
            <h4 className="font-bold text-slate-900 mb-6 border-none font-bold">Newsletter</h4>
            <p className="text-slate-500 mb-6 border-none font-bold">Get monthly marketing tips to grow your agency.</p>
            <div className="flex gap-2 border-none font-bold">
              <input type="email" placeholder="Your email" className="bg-white border border-slate-200 px-4 py-3 rounded-xl flex-grow focus:ring-2 focus:ring-primary h-auto border-none font-bold" />
              <button className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all h-auto border-none font-bold">
                <ChevronRight />
              </button>
            </div>
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
  return (
    <div className="selection:bg-primary selection:text-white border-none bg-white">
      <Navbar />
      <main className="border-none">
        <Hero />
        <About />
        <Services />
        <CyberPortals />
        <WhyChooseUs />
        <HowItWorks />
        <Pricing />
        <Portfolio />
        <Testimonials />
        <BlogTeaser />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

