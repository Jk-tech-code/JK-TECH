import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  CircleCheck, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  MessageSquare, 
  Settings,
  Bell,
  Search,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Info,
  Plus,
  AlertCircle,
  Trash2,
  Upload,
  File,
  Download,
  Activity,
  Target,
  CheckCircle2,
  Camera,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Logo } from './Logo';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('jk-accent-color') || '#00e5ff');
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('jk-font-family') || 'Space Grotesk');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newProject, setNewProject] = useState({
    name: '',
    desc: '',
    status: 'In Progress',
    progress: 0,
    next_milestone: '',
    deadline: ''
  });

  const [loading, setLoading] = useState(true);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const isAdmin = user.email === 'kipkemoijared855@gmail.com';

  useEffect(() => {
    // Apply theme
    document.documentElement.style.setProperty('--accent-color', accentColor);
    // Rough approximation for dark version
    const darkColor = accentColor === '#00e5ff' ? '#00b8d4' : 
                     accentColor === '#a855f7' ? '#7e22ce' :
                     accentColor === '#22c55e' ? '#15803d' :
                     accentColor === '#ec4899' ? '#be185d' :
                     accentColor === '#f97316' ? '#c2410c' : '#00b8d4';
    document.documentElement.style.setProperty('--accent-color-dark', darkColor);
    localStorage.setItem('jk-accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-display-var', `"${fontFamily}", sans-serif`);
    localStorage.setItem('jk-font-family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Profile error:", profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch projects
        let projectsQuery = supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (!isAdmin) {
          projectsQuery = projectsQuery.eq('user_id', user.id);
        }
        const { data: projectsData, error: projectsError } = await projectsQuery;

        if (projectsError) throw projectsError;
        setDbProjects(projectsData || []);

        // Fetch documents
        let documentsQuery = supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (!isAdmin) {
          documentsQuery = documentsQuery.eq('user_id', user.id);
        }
        const { data: documentsData, error: documentsError } = await documentsQuery;

        if (documentsError) throw documentsError;
        setDbDocuments(documentsData || []);

        // Fetch all users if admin
        if (isAdmin) {
          const { data: usersData } = await supabase.from('profiles').select('*');
          setAllProfiles(usersData || []);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  useEffect(() => {
    // Clear states when switching tabs to ensure clean view
    setSelectedProject(null);
    setIsEditing(false);
    setShowCreateForm(false);
    setSearchQuery('');
  }, [activeTab]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: Record<string, string> = {};
    if (!selectedProject.name.trim()) {
      errors.name = 'Project name is required';
    }
    if (selectedProject.progress < 0 || selectedProject.progress > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: selectedProject.name,
          desc: selectedProject.desc,
          status: selectedProject.status,
          progress: selectedProject.progress,
          next_milestone: selectedProject.next_milestone,
          deadline: selectedProject.deadline,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProject.id)
        .eq('user_id', user.id) // Security enforcement
        .select();

      if (error) throw error;

      if (data) {
        setDbProjects(dbProjects.map(p => p.id === selectedProject.id ? data[0] : p));
        setSelectedProject(data[0]);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: Record<string, string> = {};
    if (!newProject.name.trim()) {
      errors.name = 'Project name is required';
    }
    if (newProject.progress < 0 || newProject.progress > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            ...newProject, 
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setDbProjects([data[0], ...dbProjects]);
        setShowCreateForm(false);
        setNewProject({
          name: '',
          desc: '',
          status: 'In Progress',
          progress: 0,
          next_milestone: '',
          deadline: ''
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id); // Security enforcement

      if (error) throw error;

      setDbProjects(dbProjects.filter(p => p.id !== projectId));
      setSelectedProject(null);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubmitting(true);
      setUploadProgress(10);

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Insert metadata into DB
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([
          {
            name: file.name,
            type: file.type,
            size: file.size,
            url: publicUrl,
            user_id: user.id,
            project_id: selectedProject?.id || null, // Associate with active project if viewing one
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (docError) throw docError;
      setUploadProgress(100);

      if (docData) {
        setDbDocuments([docData[0], ...dbDocuments]);
        setShowUploadModal(false);
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      alert(error.message || "Failed to upload document");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubmitting(true);
      
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // We use the 'documents' bucket which we already know exists from handleFileUpload
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Update profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : { avatar_url: publicUrl });
      
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      alert(error.message || "Failed to upload profile picture");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onLogout();
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900 overflow-hidden">
      {/* Sidebar - Enhanced Visuals */}
      <aside className="w-80 bg-slate-950 text-white flex flex-col hidden lg:flex relative overflow-hidden noise shadow-[30px_0_100px_rgba(0,0,0,0.1)] z-40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[140px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[120px] -z-10 rounded-full" />
        
        <div className="p-12 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/20 blur-[60px] rounded-full animate-pulse" />
          <a href="/" className="flex items-center gap-3 relative z-10 group">
            <div className="relative">
              <Logo className="text-white group-hover:rotate-[360deg] transition-transform duration-1000" size={44} />
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display font-black text-3xl tracking-tighter text-white uppercase italic leading-none drop-shadow-sm">JK TECH</span>
          </a>
        </div>
        
        <nav className="flex-1 px-8 space-y-3 mt-6">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Terminal" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Operational Assets" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <SidebarItem 
            icon={<File size={20} />} 
            label="Secure Archive" 
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')} 
          />
          
          <div className="pt-10 pb-4 flex items-center gap-4 px-4">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-slate-600">Registry</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Invoicing" 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Direct Uplink" 
            active={activeTab === 'support'} 
            onClick={() => setActiveTab('support')} 
          />

          {isAdmin && (
            <SidebarItem 
              icon={<ShieldAlert size={20} className="text-accent" />} 
              label="Admin Terminal" 
              active={activeTab === 'admin'} 
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setShowAdminGate(true);
                } else {
                  setActiveTab('admin');
                }
              }} 
              className="mt-6 border-t border-white/5 pt-6"
            />
          )}
        </nav>

        <div className="p-8 mt-auto border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold mt-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
              <LogOut size={16} />
            </div>
            <span className="text-[10px] uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Improved Visual Flow */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden mesh-bg">
        {/* Header - Glassmorphism */}
        <header className="bg-white/40 backdrop-blur-3xl border-b border-slate-100/50 px-10 py-6 flex justify-between items-center sticky top-0 z-30 shadow-[0_1px_40px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-6">
            <div className="lg:hidden p-3 rounded-2xl bg-white shadow-xl">
               <Logo size={28} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-accent rounded-full" />
                <h2 className="text-3xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none">{activeTab}</h2>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-5">Integrated Systems • Neural Sync v4.2</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-emerald-50 rounded-[20px] border border-emerald-100/50 shadow-sm animate-in fade-in zoom-in duration-1000">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">End-to-End Encrypted</span>
            </div>

            <div className="relative hidden xl:block group">
              <input 
                placeholder="Access module..."
                className="pl-14 pr-8 py-4.5 bg-white border-transparent rounded-[24px] text-[11px] font-black uppercase tracking-widest outline-none ring-accent/0 focus:ring-8 focus:ring-accent/5 focus:shadow-2xl focus:border-accent/10 transition-all w-80 border-2 shadow-sm"
              />
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-colors" />
            </div>

            <div className="flex items-center gap-3">
              <button className="relative text-slate-400 hover:text-accent hover:bg-white transition-all p-5 rounded-[22px] group border border-transparent hover:border-slate-100 shadow-sm">
                <Bell size={22} className="group-hover:rotate-[20deg] transition-transform" />
                <span className="absolute top-5 right-5 w-2.5 h-2.5 bg-accent rounded-full border-[3px] border-white ring-4 ring-accent/5" />
              </button>
            </div>
            
            <div className="flex items-center gap-6 pl-10 border-l border-slate-200/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-display font-black text-slate-950 truncate max-w-[200px] leading-tight uppercase italic tracking-tight">{profile?.full_name || user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-tight mt-1">Identity: <span className="text-accent">{profile?.role || 'Priority Client'}</span></p>
              </div>
              <div className="w-14 h-14 bg-slate-950 text-white rounded-[22px] flex items-center justify-center font-display font-black text-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] ring-4 ring-white relative overflow-hidden group cursor-pointer active:scale-95 transition-transform">
                <div className="absolute inset-0 bg-accent/20 blur-sm mix-blend-overlay group-hover:scale-150 transition-transform duration-700" />
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover relative z-10" />
                ) : (
                  <span className="relative z-10">{(profile?.full_name || user.email)?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content - High Visual Hierarchy */}
        <div className="p-10 overflow-y-auto h-full CustomScrollbar">
          <div className="max-w-[1600px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="grid lg:grid-cols-12 gap-10"
            >
              {/* Main Area */}
              <div className="lg:col-span-8 space-y-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + (selectedProject ? '-project' : '')}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Tab Navigation Content */}
                    {activeTab === 'overview' && !selectedProject && !showCreateForm && (
                      <div className="space-y-10">
                        <div className="grid sm:grid-cols-3 gap-8">
                          <StatCard icon={<Clock className="text-accent" />} label="Active Projects" value={dbProjects.length.toString()} color="bg-accent/10" />
                          <StatCard icon={<CircleCheck className="text-blue-500" />} label="Tasks in Progress" value="12" color="bg-blue-500/10" />
                          <StatCard icon={<BarChart3 className="text-slate-900" />} label="System Pulse" value="Optimal" color="bg-slate-100" />
                        </div>
                        
                        <div className="bg-white p-12 rounded-[60px] border border-slate-100/50 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[120px] rounded-full -z-10 group-hover:scale-110 transition-transform duration-1000" />
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                              <div>
                                <h3 className="text-3xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none">Welcome back, {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">All systems operational. Ready for deployment.</p>
                              </div>
                              <button 
                                onClick={() => setActiveTab('projects')}
                                className="px-10 py-5 bg-slate-950 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-slate-950 transition-all shadow-xl shadow-slate-200"
                              >
                                View Operational Assets
                              </button>
                           </div>
                           <div className="grid sm:grid-cols-2 gap-8">
                              <div className="p-10 bg-slate-50/50 rounded-[40px] border border-slate-100 flex items-center gap-8 group/item hover:bg-white hover:shadow-xl transition-all duration-500">
                                 <div className="w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-accent group-hover/item:rotate-12 transition-transform">
                                    <Clock size={24} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Next Sync</p>
                                    <p className="text-xl font-display font-black text-slate-950 uppercase italic tracking-tight">Today, 14:00</p>
                                 </div>
                              </div>
                              <div className="p-10 bg-slate-50/50 rounded-[40px] border border-slate-100 flex items-center gap-8 group/item hover:bg-white hover:shadow-xl transition-all duration-500">
                                 <div className="w-16 h-16 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-blue-500 group-hover/item:rotate-12 transition-transform">
                                    <CircleCheck size={24} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Lock</p>
                                    <p className="text-xl font-display font-black text-slate-950 uppercase italic tracking-tight">High Priority</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'projects' && !selectedProject && !showCreateForm && (
                      <div className="space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                          <div>
                            <h3 className="text-4xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none">Operational Assets</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Active data models and infrastructure modules</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-colors" size={16} />
                              <input 
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 pr-10 py-5 bg-white border border-slate-100 rounded-[24px] text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent/40 focus:shadow-xl transition-all w-80 shadow-sm"
                              />
                            </div>
                            <button 
                              onClick={() => setShowCreateForm(true)}
                              className="flex items-center gap-4 bg-slate-950 text-white p-5 rounded-[24px] hover:bg-accent hover:text-slate-950 hover:shadow-2xl hover:shadow-accent/20 transition-all active:scale-95 shadow-xl shadow-slate-200 group"
                            >
                              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          {dbProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                            <div className="col-span-full py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200 shadow-sm relative overflow-hidden">
                              <div className="absolute inset-0 bg-slate-50/50 -z-10" />
                              <FileText size={64} className="text-slate-200 mx-auto mb-8 animate-bounce" />
                              <p className="text-slate-400 font-display font-black uppercase tracking-[0.3em] text-[11px]">Zero Assets Detected</p>
                              {!searchQuery && (
                                <button 
                                  onClick={() => setShowCreateForm(true)}
                                  className="text-accent text-[11px] font-black uppercase tracking-widest mt-6 hover:underline"
                                >
                                  + Begin Initialization Flow
                                </button>
                              )}
                            </div>
                          ) : (
                            dbProjects
                              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((project, idx) => {
                                const getStatusConfig = (status: string) => {
                                  switch (status) {
                                    case 'In Progress':
                                      return {
                                        icon: <Activity size={24} />,
                                        color: 'text-blue-500',
                                        bg: 'bg-blue-50',
                                        border: 'border-blue-100',
                                        glow: 'shadow-blue-500/20',
                                        accent: 'bg-blue-600'
                                      };
                                    case 'Completed':
                                      return {
                                        icon: <CheckCircle2 size={24} />,
                                        color: 'text-emerald-500',
                                        bg: 'bg-emerald-50',
                                        border: 'border-emerald-100',
                                        glow: 'shadow-emerald-500/20',
                                        accent: 'bg-emerald-600'
                                      };
                                    case 'Planning':
                                      return {
                                        icon: <Target size={24} />,
                                        color: 'text-purple-500',
                                        bg: 'bg-purple-50',
                                        border: 'border-purple-100',
                                        glow: 'shadow-purple-500/20',
                                        accent: 'bg-purple-600'
                                      };
                                    default:
                                      return {
                                        icon: <Clock size={24} />,
                                        color: 'text-amber-500',
                                        bg: 'bg-amber-50',
                                        border: 'border-amber-100',
                                        glow: 'shadow-amber-500/20',
                                        accent: 'bg-amber-600'
                                      };
                                  }
                                };

                                const config = getStatusConfig(project.status);

                                return (
                                  <motion.div 
                                    key={project.id} 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    onClick={() => setSelectedProject(project)}
                                    className={`group p-10 rounded-[48px] border-2 ${config.bg} ${config.border} hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden h-full flex flex-col group min-h-[360px]`}
                                  >
                                    <div className={`absolute top-0 right-0 w-48 h-48 ${config.accent}/10 blur-[100px] rounded-full -z-10 group-hover:scale-125 transition-transform duration-700`} />
                                    
                                    <div className="flex justify-between items-start mb-10">
                                      <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center ${config.color} shadow-sm border ${config.border} group-hover:scale-110 transition-transform duration-500`}>
                                          {config.icon}
                                        </div>
                                        <div>
                                          <h4 className="font-display font-black text-xl text-slate-900 tracking-tighter uppercase italic leading-tight">{project.name}</h4>
                                          <div className="flex items-center gap-2 mt-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${config.accent} animate-pulse`} />
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{project.next_milestone || 'Module Analysis'}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm bg-white ${config.color} border ${config.border}`}>
                                        {project.status}
                                      </span>
                                    </div>
                                    
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-10 flex-grow">
                                      {project.desc || 'Operational objective data encrypted or undefined for this module.'}
                                    </p>

                                    <div className="space-y-4 mt-auto bg-white/50 p-6 rounded-3xl border border-white">
                                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 items-center">
                                         <span className="flex items-center gap-2">
                                           Neural Sync Flow
                                         </span>
                                         <span className="text-slate-900 font-mono">{project.progress}%</span>
                                      </div>
                                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${project.progress}%` }}
                                          transition={{ duration: 1, ease: "circOut" }}
                                          className={`h-full ${config.accent} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]`}
                                        />
                                      </div>
                                      <div className="flex justify-between items-center pt-2">
                                        <div className="flex -space-x-2">
                                          {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.id + i}`} alt="User" />
                                            </div>
                                          ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                          <ExternalLink size={12} />
                                          Access Files
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    )}

              {/* Active Projects / Creation Form */}
              {selectedProject ? (
                // Selected Project View
                <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl shadow-slate-200/40 border border-slate-50 animate-in fade-in slide-in-from-right-10 duration-500">
                  <div className="flex justify-between items-center mb-12">
                    <button 
                      onClick={() => {
                        setSelectedProject(null);
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-3 text-slate-400 hover:text-slate-950 transition-all font-black text-[10px] uppercase tracking-widest group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-accent group-hover:text-slate-950 transition-all">
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                      </div>
                      Back to Assets
                    </button>
                    
                    <div className="flex gap-4">
                       {!isEditing && (
                         <button 
                           onClick={() => setIsEditing(true)}
                           className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600"
                         >
                           <Settings size={14} /> Edit Module
                         </button>
                       )}
                       <button 
                        onClick={() => {
                          setProjectToDelete(selectedProject);
                          setShowDeleteConfirm(true);
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-red-50 hover:bg-red-100 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-600"
                      >
                        <Trash2 size={14} /> Terminate
                      </button>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={handleUpdateProject} className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Identifier</label>
                          <input 
                            type="text"
                            className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-3xl outline-none transition-all font-bold text-slate-900 ${formErrors.name ? 'border-red-500 bg-red-50/20' : 'border-transparent focus:border-accent/40 focus:bg-white'}`}
                            value={selectedProject.name}
                            onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational State</label>
                          <select 
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white font-bold text-slate-900 appearance-none cursor-pointer"
                            value={selectedProject.status}
                            onChange={(e) => setSelectedProject({...selectedProject, status: e.target.value})}
                          >
                            <option>In Progress</option>
                            <option>Pending</option>
                            <option>Planning</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Technical Summary</label>
                        <textarea 
                          rows={4}
                          className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white font-bold text-slate-900 resize-none"
                          value={selectedProject.desc}
                          onChange={(e) => setSelectedProject({...selectedProject, desc: e.target.value})}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-10">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Efficacy Rate (%)</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white font-bold text-slate-900"
                            value={selectedProject.progress}
                            onChange={(e) => setSelectedProject({...selectedProject, progress: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Next Objective</label>
                          <input 
                            type="text"
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white font-bold text-slate-900"
                            value={selectedProject.next_milestone}
                            onChange={(e) => setSelectedProject({...selectedProject, next_milestone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Deadline</label>
                          <input 
                            type="date"
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white font-bold text-slate-900"
                            value={selectedProject.deadline}
                            onChange={(e) => setSelectedProject({...selectedProject, deadline: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex gap-6 pt-6">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormErrors({});
                          }}
                          className="flex-1 px-8 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                          Abort Changes
                        </button>
                        <button 
                          disabled={submitting}
                          type="submit"
                          className="flex-1 px-8 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest text-white bg-slate-950 shadow-2xl shadow-slate-200 hover:bg-accent hover:text-slate-950 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {submitting ? 'Saving Base...' : 'Commit Updates'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-10 mb-12 pb-10 border-b border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -z-10 rounded-full" />
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-4xl font-black text-slate-950 tracking-tighter leading-none">{selectedProject.name}</h3>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              selectedProject.status === 'In Progress' ? 'bg-blue-100/50 text-blue-600' : 
                              selectedProject.status === 'Planning' ? 'bg-purple-100/50 text-purple-600' :
                              selectedProject.status === 'Pending' ? 'bg-amber-100/50 text-amber-600' :
                              'bg-green-100/50 text-green-600'
                            }`}>
                              {selectedProject.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-300" />
                              Initialized: {new Date(selectedProject.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-300" />
                              Deadline: {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'Continuous'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-3 gap-14">
                        <div className="lg:col-span-2 space-y-12">
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Project Core Strategy
                            </h4>
                            <div className="p-8 bg-slate-50 rounded-[32px] text-slate-600 leading-relaxed font-bold text-sm border border-slate-100/50">
                              {selectedProject.desc || 'No strategic overview provided for this module.'}
                            </div>
                          </div>

                          <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                              Execution Vector
                            </h4>
                            <div className="space-y-6">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-950 items-end">
                                <span className="flex flex-col gap-1">
                                  <span className="text-slate-400 low-case tracking-normal">Status Report</span>
                                  {selectedProject.progress}% Completion Rate
                                </span>
                                <span className="text-accent bg-slate-950 px-3 py-1 rounded-lg">Operational</span>
                              </div>
                              <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/50">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedProject.progress}%` }}
                                  className="h-full bg-slate-950 rounded-full shadow-lg shadow-slate-200"
                                />
                              </div>
                              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Next Objective</p>
                                  <p className="text-sm font-black text-slate-950 tracking-tight">{selectedProject.next_milestone || 'Strategic Review'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Success Metrics</p>
                                  <p className="text-sm font-black text-slate-950 tracking-tight">Verified Tier A</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="p-8 bg-slate-950 rounded-[40px] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <h4 className="font-black mb-6 text-[10px] uppercase tracking-[0.2em] text-slate-500">Asset Management</h4>
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent text-sm font-black group-hover:rotate-12 transition-transform">JK</div>
                                <div>
                                  <p className="text-sm font-black text-white">Jared Kipkemoi</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Project Director</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-10 pt-8 border-t border-white/5">
                              <button className="w-full bg-white text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-accent ring-accent/0 hover:ring-8 ring-accent/10">
                                Direct Channel
                              </button>
                            </div>
                          </div>

                          <div className="p-8 border-2 border-slate-100 rounded-[40px] bg-white">
                            <h4 className="font-black mb-6 text-[10px] uppercase tracking-[0.2em] text-slate-400">Quick Commands</h4>
                            <div className="space-y-2">
                              <button 
                                onClick={() => setShowUploadModal(true)}
                                className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 transition-all group flex items-center justify-between"
                              >
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-950 transition-colors">Upload Assets</span>
                                <Upload size={14} className="text-slate-300 group-hover:text-accent transition-colors" />
                              </button>
                              <button className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 transition-all group flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-950 transition-colors">Revision Flow</span>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-accent transition-colors" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : activeTab === 'settings' ? (
                      <div className="space-y-10 animate-in fade-in duration-500">
                        <div>
                          <h3 className="text-4xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none">System Settings</h3>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Configure your terminal interface and neural link preferences</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-xl space-y-10">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                 <Settings size={24} />
                               </div>
                               <h4 className="text-xl font-display font-black text-slate-950 uppercase italic">Theme Customization</h4>
                             </div>

                             <div className="space-y-6">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Accent Vector (Color)</label>
                               <div className="flex flex-wrap gap-4">
                                 {[
                                   { name: 'Cyan', color: '#00e5ff' },
                                   { name: 'Purple', color: '#a855f7' },
                                   { name: 'Green', color: '#22c55e' },
                                   { name: 'Pink', color: '#ec4899' },
                                   { name: 'Orange', color: '#f97316' },
                                 ].map((c) => (
                                   <button
                                     key={c.name}
                                     onClick={() => setAccentColor(c.color)}
                                     className={`w-12 h-12 rounded-2xl border-4 transition-all ${accentColor === c.color ? 'border-slate-950 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                     style={{ backgroundColor: c.color }}
                                     title={c.name}
                                   />
                                 ))}
                               </div>
                             </div>

                             <div className="space-y-6">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Typography Core (Font)</label>
                               <div className="grid grid-cols-2 gap-4">
                                 {[
                                   { name: 'Space Grotesk', value: 'Space Grotesk' },
                                   { name: 'Inter', value: 'Inter' },
                                   { name: 'Playfair Display', value: 'Playfair Display' },
                                   { name: 'JetBrains Mono', value: 'JetBrains Mono' },
                                 ].map((f) => (
                                   <button
                                     key={f.name}
                                     onClick={() => setFontFamily(f.value)}
                                     className={`px-6 py-4 rounded-2xl border-2 transition-all text-left group ${fontFamily === f.value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-100 hover:border-accent/40 bg-slate-50'}`}
                                   >
                                     <p className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">{f.name}</p>
                                     <p className="text-sm font-bold mt-1" style={{ fontFamily: f.value }}>Preview Text</p>
                                   </button>
                                 ))}
                               </div>
                             </div>
                          </div>

                          <div className="bg-slate-950 p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full -z-10 group-hover:scale-110 transition-transform duration-1000" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">User Identity</h4>
                            
                            <div className="flex items-center gap-6 mb-10">
                              <div className="relative group/avatar">
                                <div className="w-20 h-20 bg-accent rounded-[32px] flex items-center justify-center font-display font-black text-3xl text-slate-950 shadow-2xl shadow-accent/20 overflow-hidden ring-4 ring-slate-900">
                                  {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[32px] opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                                  {submitting ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Camera size={24} className="text-white transform group-hover/avatar:scale-110 transition-transform" />
                                  )}
                                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={submitting} />
                                </label>
                              </div>
                              <div>
                                <h5 className="text-2xl font-display font-black text-white italic tracking-tighter">{profile?.full_name || 'Priority User'}</h5>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{user.email}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                               <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center group/item hover:bg-white/10 transition-colors">
                                 <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subscription Status</p>
                                   <p className="text-sm font-black text-accent mt-1">Enterprise Access</p>
                                 </div>
                                 <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                    <Target size={18} />
                                 </div>
                               </div>
                               <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center group/item hover:bg-white/10 transition-colors">
                                 <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Level</p>
                                   <p className="text-sm font-black text-white mt-1">Tier 1 Authorization</p>
                                 </div>
                                 <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <CheckCircle2 size={18} />
                                 </div>
                               </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5">
                              <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Request Account Termination</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : activeTab === 'admin' && isAdmin ? (
                      isAdminAuthenticated ? (
                        <div className="space-y-10 animate-in fade-in duration-500">
                          <div className="flex justify-between items-end">
                            <div>
                              <h3 className="text-4xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none">Global Controller</h3>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Level 1 Authorized Access • All Systems Visible</p>
                            </div>
                            <div className="bg-slate-900 text-accent px-6 py-3 rounded-2xl font-mono text-[10px] border border-accent/20 animate-pulse">
                              ROOT@JK-TECH:~$ SESSION_ACTIVE
                            </div>
                          </div>
  
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Nodes</p>
                              <p className="text-3xl font-display font-black text-slate-950 italic">{allProfiles.length}</p>
                              <p className="text-[9px] text-emerald-500 font-bold mt-2 uppercase">Active Users</p>
                            </div>
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Modules</p>
                              <p className="text-3xl font-display font-black text-slate-950 italic">{dbProjects.length}</p>
                              <p className="text-[9px] text-blue-500 font-bold mt-2 uppercase">System Assets</p>
                            </div>
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Archive Flow</p>
                              <p className="text-3xl font-display font-black text-slate-950 italic">{dbDocuments.length}</p>
                              <p className="text-[9px] text-purple-500 font-bold mt-2 uppercase">Encrypted Files</p>
                            </div>
                            <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[50px] rounded-full -z-10 group-hover:scale-150 transition-transform" />
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Uptime</p>
                              <p className="text-3xl font-display font-black text-white italic">99.9%</p>
                              <p className="text-[9px] text-accent font-bold mt-2 uppercase">Peak Performance</p>
                            </div>
                          </div>
  
                          <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-2xl overflow-hidden relative">
                            <div className="flex justify-between items-center mb-10">
                              <h4 className="text-xl font-display font-black text-slate-950 uppercase italic">System-Wide Operational Manifest</h4>
                              <div className="flex gap-4">
                                <button className="px-5 py-2.5 bg-slate-50 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-slate-950 transition-colors">Export Logs</button>
                                <button className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-slate-950 transition-all">Emergency Lockout</button>
                              </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                                    <th className="pb-6 pl-2">Asset Identifier</th>
                                    <th className="pb-6">Controller</th>
                                    <th className="pb-6">Status</th>
                                    <th className="pb-6">Neural Sync</th>
                                    <th className="pb-6 text-right pr-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {dbProjects.map((proj) => (
                                    <tr key={proj.id} className="group hover:bg-slate-50/50 transition-colors">
                                      <td className="py-6 pl-2">
                                        <p className="text-sm font-black text-slate-950 uppercase italic tracking-tight">{proj.name}</p>
                                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono">{proj.id.substring(0, 8)}</p>
                                      </td>
                                      <td className="py-6">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 overflow-hidden">
                                             {allProfiles.find(p => p.id === proj.user_id)?.avatar_url ? (
                                               <img src={allProfiles.find(p => p.id === proj.user_id)?.avatar_url} className="w-full h-full object-cover" />
                                             ) : (
                                               allProfiles.find(p => p.id === proj.user_id)?.full_name?.charAt(0) || 'U'
                                             )}
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                            {allProfiles.find(p => p.id === proj.user_id)?.full_name || 'System User'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                          proj.status === 'In Progress' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                          {proj.status}
                                        </span>
                                      </td>
                                      <td className="py-6">
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[100px]">
                                            <div className="h-full bg-slate-950 rounded-full" style={{ width: `${proj.progress}%` }} />
                                          </div>
                                          <span className="text-[10px] font-black font-mono text-slate-900">{proj.progress}%</span>
                                        </div>
                                      </td>
                                      <td className="py-6 text-right pr-2">
                                        <button className="p-3 text-slate-400 hover:text-accent transition-colors"><ExternalLink size={14} /></button>
                                        <button className="p-3 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[600px] flex items-center justify-center">
                           <div className="text-center space-y-6 max-w-md mx-auto">
                              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl mx-auto flex items-center justify-center border border-red-100">
                                <Lock size={32} />
                              </div>
                              <h4 className="text-2xl font-display font-black text-slate-950 uppercase italic tracking-tighter">Terminal Locked</h4>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-10">Secondary authentication required to access the Global Controller.</p>
                              <button 
                                onClick={() => setShowAdminGate(true)}
                                className="w-full py-4 bg-slate-950 text-white rounded-2xl font-display font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                              >
                                Enter Authorization Code
                              </button>
                           </div>
                        </div>
                      )
                    ) : activeTab === 'documents' ? (
                     <div className="space-y-10 animate-in fade-in duration-500">
                          <div>
                            <h3 className="text-4xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none">Security Archive</h3>
                            <div className="flex items-center gap-4 mt-3">
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">Encrypted database of operational components and manuals</p>
                              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic">
                                <CheckCircle2 size={10} />
                                RLS Validated
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-slate-950 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group border border-white/5">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Encryption</h4>
                              <p className="text-2xl font-display font-black italic tracking-tight uppercase">At Rest</p>
                              <p className="text-[9px] text-accent font-black uppercase tracking-widest mt-2 font-mono">AES-256-GCM</p>
                            </div>
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex flex-col justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Integrity</h4>
                              <p className="text-2xl font-display font-black text-slate-950 italic tracking-tight">VERIFIED</p>
                              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2">{dbDocuments.length} Modules Online</p>
                            </div>
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex flex-col justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Protocol</h4>
                              <p className="text-2xl font-display font-black text-slate-950 italic tracking-tight">SSL/TLS</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">v1.3 Secure Link</p>
                            </div>
                            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex flex-col justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Access</h4>
                              <p className="text-2xl font-display font-black text-slate-950 italic tracking-tight">PRIVATE</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">Isolation: High</p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-10 border-b border-slate-50">
                              <div className="flex items-center gap-5">
                                 <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-400">
                                    <File size={28} />
                                 </div>
                                 <div>
                                   <h4 className="text-xl font-display font-black text-slate-950 tracking-tight uppercase italic">Secure Repository</h4>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Found {dbDocuments.length} modules in archive</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-4 bg-slate-950 text-white px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-slate-950 transition-all shadow-xl shadow-slate-200 group active:scale-95"
                              >
                                <Upload size={18} className="group-hover:-translate-y-1 transition-transform" /> 
                                Push Assets
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {dbDocuments.length === 0 ? (
                                <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                                  <FileText size={48} className="text-slate-200 mx-auto mb-6 opacity-50" />
                                  <p className="text-slate-500 font-display font-black uppercase tracking-[0.2em] text-[10px]">Registry is Empty</p>
                                  <button 
                                    onClick={() => setShowUploadModal(true)}
                                    className="text-accent text-[11px] font-black uppercase tracking-widest mt-4 hover:underline"
                                  >
                                    Initialize First Upload
                                  </button>
                                </div>
                              ) : (
                                dbDocuments.map((doc, idx) => (
                                  <motion.div 
                                    key={doc.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-8 bg-white rounded-[32px] border border-slate-100 hover:border-accent/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col gap-8 relative overflow-hidden"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-accent transition-all duration-500 shadow-sm">
                                        <File size={28} />
                                      </div>
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-4 text-slate-300 hover:text-accent transition-all bg-slate-50 hover:bg-slate-950 rounded-[18px] group-hover:shadow-lg active:scale-90"
                                      >
                                        <Download size={20} />
                                      </a>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-display font-black text-slate-950 truncate mb-2 uppercase tracking-tight italic">{doc.name}</h4>
                                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                                        Scale: {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </div>
                       </div>
                   ) : showCreateForm ? (
                // Project Creation form
                <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl shadow-slate-200/40 border border-slate-50 animate-in fade-in slide-in-from-bottom-6 duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -z-10 rounded-full" />
                  
                  <div className="flex justify-between items-center mb-12">
                    <div>
                      <h3 className="text-3xl font-black text-slate-950 tracking-tighter">Initiate Project</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fill in the technical specifications below</p>
                    </div>
                    <button 
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleCreateProject} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Identifier</label>
                        <input 
                          type="text"
                          placeholder="e.g. Corporate Rebrand 2026"
                          className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-3xl outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 ${formErrors.name ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-accent/40 focus:bg-white focus:ring-8 focus:ring-accent/5'}`}
                          value={newProject.name}
                          onChange={(e) => {
                            setNewProject({...newProject, name: e.target.value});
                            if (formErrors.name) setFormErrors({...formErrors, name: ''});
                          }}
                        />
                        {formErrors.name && (
                          <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                             <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Status</label>
                        <select 
                          className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white focus:ring-8 focus:ring-accent/5 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                          value={newProject.status}
                          onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                        >
                          <option>In Progress</option>
                          <option>Pending</option>
                          <option>Planning</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategic Description</label>
                      <textarea 
                        rows={4}
                        placeholder="Define the core objectives and scope..."
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white focus:ring-8 focus:ring-accent/5 transition-all font-bold text-slate-900 resize-none placeholder:text-slate-300"
                        value={newProject.desc}
                        onChange={(e) => setNewProject({...newProject, desc: e.target.value})}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Completion %</label>
                        <div className="relative">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            className={`w-full px-8 py-5 bg-slate-50 border-2 rounded-3xl outline-none transition-all font-bold text-slate-900 ${formErrors.progress ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-accent/40 focus:bg-white focus:ring-8 focus:ring-accent/5'}`}
                            value={newProject.progress}
                            onChange={(e) => {
                              setNewProject({...newProject, progress: parseInt(e.target.value) || 0});
                              if (formErrors.progress) setFormErrors({...formErrors, progress: ''});
                            }}
                          />
                          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold">%</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Milestone</label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="e.g. Design Freeze"
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white focus:ring-8 focus:ring-accent/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                            value={newProject.next_milestone}
                            onChange={(e) => setNewProject({...newProject, next_milestone: e.target.value})}
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                             <CircleCheck size={18} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Final Deadline</label>
                        <div className="relative">
                          <input 
                            type="date"
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none focus:border-accent/40 focus:bg-white focus:ring-8 focus:ring-accent/5 transition-all font-bold text-slate-900"
                            value={newProject.deadline}
                            onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        disabled={submitting}
                        type="submit"
                        className="w-full bg-slate-950 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-accent hover:text-slate-950 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                            <span>Synthesizing...</span>
                          </div>
                        ) : (
                          <>
                            <span>Finalize Deployment</span>
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h3 className="text-xl font-bold text-slate-800">
                      {activeTab === 'projects' ? 'All Projects' : 'Your Active Projects'}
                    </h3>
                    <div className="flex flex-1 max-w-md items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search projects by name..." 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {activeTab === 'projects' && (
                        <button 
                          onClick={() => setShowCreateForm(true)}
                          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                          <Plus size={16} /> <span className="hidden sm:inline">New Project</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {dbProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <div className="col-span-full text-center py-24 bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
                        <FileText size={48} className="text-slate-200 mx-auto mb-6" />
                        <p className="text-slate-500 font-display font-black uppercase tracking-widest text-[10px]">
                          {searchQuery ? 'Zero Assets Detected' : 'No Operational Bases Found'}
                        </p>
                        {!searchQuery && (
                          <button 
                            onClick={() => setShowCreateForm(true)}
                            className="text-accent text-[10px] font-black uppercase tracking-tighter mt-4 hover:underline"
                          >
                            + Begin Initialization
                          </button>
                        )}
                      </div>
                    ) : (
                      dbProjects
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((project) => (
                        <motion.div 
                          key={project.id} 
                          whileHover={{ y: -8 }}
                          onClick={() => setSelectedProject(project)}
                          className="group p-10 bg-white rounded-[48px] border border-slate-100 hover:border-accent/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_32px_60px_-15px_rgba(0,0,0,0.1)] transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-50 rounded-[22px] flex items-center justify-center text-slate-400 group-hover:text-accent group-hover:bg-slate-950 transition-all shadow-sm">
                                <FileText size={24} />
                              </div>
                              <div>
                                <h4 className="font-display font-black text-xl text-slate-950 group-hover:text-accent transition-colors tracking-tighter uppercase italic leading-none">{project.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">Target: {project.next_milestone || 'Deployment'}</p>
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              project.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 
                              project.status === 'Planning' ? 'bg-purple-50 text-purple-600' :
                              project.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                              'bg-green-50 text-green-600'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <span className="flex items-center gap-2">
                                 <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                                 Operational Efficiency
                               </span>
                               <span className="text-slate-950 italic">{project.progress}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                className="h-full bg-slate-950 rounded-full group-hover:bg-accent transition-colors"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

            {/* Support / Quick Actions */}
            <div className="space-y-8">
              <div className="bg-slate-950 text-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accent/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute top-0 right-0 p-6">
                   <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-accent">
                      <Clock size={20} />
                   </div>
                </div>
                
                <h3 className="text-2xl font-black mb-4 relative z-10 tracking-tighter">Mission <br /> Support</h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 relative z-10 uppercase tracking-widest">Our technical squad is on standby to assist you with any inquiries.</p>
                
                <button className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-all relative z-10 flex items-center justify-center gap-3">
                  <MessageSquare size={16} /> Raise Ticket
                </button>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Repository</h3>
                  <button onClick={() => setActiveTab('documents')} className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {dbDocuments.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                       <FileText size={24} className="text-slate-200 mx-auto mb-2" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Documents</p>
                    </div>
                  ) : (
                    dbDocuments.slice(0, 4).map((doc) => (
                      <DocumentItem 
                        key={doc.id} 
                        name={doc.name} 
                        date={new Date(doc.created_at).toLocaleDateString()} 
                        url={doc.url}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowDeleteConfirm(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Project?</h3>
            <p className="text-slate-500 font-bold mb-8">
              Are you sure you want to delete <span className="text-slate-900">"{projectToDelete?.name}"</span>? This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="flex gap-4">
              <button 
                disabled={submitting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={submitting}
                onClick={() => handleDeleteProject(projectToDelete?.id)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-600 shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowUploadModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Upload size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Files</h3>
            <p className="text-slate-500 font-bold mb-8">
              Select documents or assets to upload to your project vault. Supported items include images, PDFs, and design files.
            </p>

            <div className="space-y-6">
              {submitting ? (
                <div className="space-y-4 py-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                    <Plus size={24} className="text-slate-400 mx-auto mb-2 group-hover:text-primary" />
                    <p className="text-sm font-bold text-slate-600 group-hover:text-primary">Click to browse or drag and drop</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Maximum file size: 50MB</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowUploadModal(false)}
                disabled={submitting}
                className="w-full py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showAdminGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-[40px] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-100"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-950 text-accent rounded-3xl flex items-center justify-center shadow-xl shadow-accent/10">
                  <ShieldAlert size={32} />
                </div>
                <button onClick={() => setShowAdminGate(false)} className="p-2 text-slate-400 hover:text-slate-950 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <h2 className="text-3xl font-display font-black text-slate-950 tracking-tighter uppercase italic leading-none mb-4">Security Challenge</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Input your unique Level 1 bypass code to synchronize with the Global Controller.</p>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="SYNX-AUTH-CODE"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-accent/30 rounded-2xl outline-none text-slate-950 font-mono font-bold transition-all placeholder:text-slate-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (adminPassword === 'JK-ADMIN-2026') {
                          setIsAdminAuthenticated(true);
                          setShowAdminGate(false);
                          setActiveTab('admin');
                        } else {
                          alert('INVALID AUTHORIZATION CODE');
                        }
                      }
                    }}
                  />
                </div>

                <button 
                  onClick={() => {
                    if (adminPassword === 'JK-ADMIN-2026') {
                      setIsAdminAuthenticated(true);
                      setShowAdminGate(false);
                      setActiveTab('admin');
                    } else {
                      alert('INVALID AUTHORIZATION CODE');
                    }
                  }}
                  className="w-full py-5 bg-slate-950 text-white rounded-2xl font-display font-extrabold text-[11px] uppercase tracking-[0.4em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
                >
                  Confirm Identity
                </button>
              </div>
              
              <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol: Neural-Link-Sec v4.0</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color?: string }) => (
  <div className="bg-white p-10 rounded-[48px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100/50 hover:border-accent/40 hover:shadow-[0_40px_80px_rgba(0,0,0,0.07)] transition-all duration-500 group overflow-hidden relative">
    <div className={`absolute -top-16 -right-16 w-48 h-48 ${color || 'bg-slate-50'} blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000`} />
    <div className="flex flex-col gap-10 relative z-10">
      <div className={`w-16 h-16 ${color || 'bg-slate-50'} rounded-[24px] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-white/50`}>
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <div>
        <p className="text-[11px] font-display font-black uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1">{label}</p>
        <p className="text-5xl font-display font-black text-slate-950 tracking-tighter leading-none italic uppercase">{value}</p>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick, className }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, className?: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-8 py-5 rounded-[24px] transition-all font-display font-extrabold text-[11px] uppercase tracking-[0.2em] group relative ${
      active 
        ? 'bg-accent text-slate-950 shadow-[0_20px_40px_rgba(20,184,166,0.15)] scale-[1.03] z-10' 
        : 'text-slate-500 hover:bg-white/5 hover:text-white'
    } ${className || ''}`}
  >
    <div className={`${active ? 'text-slate-950' : 'text-slate-500 group-hover:text-accent group-hover:scale-125'} transition-all duration-500`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className="relative z-10">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-indicator"
        className="ml-auto w-1.5 h-6 bg-slate-950 rounded-full" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </button>
);

const DocumentItem: React.FC<{ name: string; date: string; url?: string }> = ({ name, date, url }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group no-underline"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all">
        <FileText size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 line-clamp-1">{name}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{date}</p>
      </div>
    </div>
    <Download size={14} className="text-slate-300 group-hover:text-primary transition-all" />
  </a>
);
