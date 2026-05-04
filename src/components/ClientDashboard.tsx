import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Download
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
  const [profile, setProfile] = useState<any>(null);

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
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;
        setDbProjects(projectsData || []);

        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;
        setDbDocuments(documentsData || []);

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
        .eq('id', projectId);

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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-950 text-white flex flex-col hidden lg:flex relative overflow-hidden noise">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -z-10 rounded-full" />
        
        <div className="p-10">
          <a href="/" className="flex items-center gap-3">
            <Logo className="text-white" size={32} />
            <span className="font-black text-xl tracking-tighter text-white">JK Digital</span>
          </a>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarItem 
            icon={<FileText size={18} />} 
            label="My Projects" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <SidebarItem 
            icon={<File size={18} />} 
            label="Documents" 
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')} 
          />
          <div className="pt-6 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Account</span>
          </div>
          <SidebarItem 
            icon={<BarChart3 size={18} />} 
            label="Billing" 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="Support" 
            active={activeTab === 'support'} 
            onClick={() => setActiveTab('support')} 
          />
        </nav>

        <div className="p-8 mt-auto border-t border-white/5">
          <SidebarItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold mt-2 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="lg:hidden p-2 rounded-xl bg-slate-100">
               <Logo size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase tracking-[0.1em]">{activeTab}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:block">JK Digital Agency • System Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden xl:block">
              <input 
                placeholder="Search resources..."
                className="pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-xs font-bold outline-none ring-accent/0 focus:ring-2 focus:ring-accent/10 focus:bg-white focus:border-accent/20 transition-all w-64 border-2"
              />
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            <div className="flex items-center gap-2">
              <button className="relative text-slate-400 hover:text-accent hover:bg-slate-50 transition-all p-3 rounded-xl group">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white ring-2 ring-accent/20" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-950 truncate max-w-[150px] leading-tight">{profile?.full_name || user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">{profile?.role || 'Priority Client'}</p>
              </div>
              <div className="w-11 h-11 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-xl shadow-slate-200 ring-4 ring-white">
                {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* Main Area */}
            <div className="lg:col-span-8 space-y-8">
              {activeTab === 'overview' && !selectedProject && (
                <div className="grid sm:grid-cols-3 gap-6">
                  <StatCard icon={<Clock className="text-accent" />} label="Active Projects" value={dbProjects.length.toString()} color="bg-accent/10" />
                  <StatCard icon={<CircleCheck className="text-blue-500" />} label="Completed Tasks" value="0" color="bg-blue-500/10" />
                  <StatCard icon={<BarChart3 className="text-slate-900" />} label="Project Status" value="On Track" color="bg-slate-100" />
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
              ) : activeTab === 'documents' ? (
                // Documents Tab Content
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Knowledge Base</h3>
                      <p className="text-sm text-slate-500 font-bold mt-1">Access all your project files and documentation.</p>
                    </div>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Upload size={16} /> Upload New
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dbDocuments.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <FileText size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No documents uploaded yet.</p>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="text-primary text-sm font-bold mt-2 hover:underline"
                        >
                          Upload your first file
                        </button>
                      </div>
                    ) : (
                      dbDocuments.map((doc) => (
                        <div key={doc.id} className="group p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all flex items-start gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                            <File size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{doc.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-lg"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ))
                    )}
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
                    <div className="space-y-6">
                    {dbProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-bold">
                          {searchQuery ? 'No projects match your search.' : 'No projects found.'}
                        </p>
                        {!searchQuery && (
                          <button 
                            onClick={() => setShowCreateForm(true)}
                            className="text-primary text-sm font-bold mt-2 hover:underline"
                          >
                            Start a Project
                          </button>
                        )}
                      </div>
                    ) : (
                      dbProjects
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((project) => (
                        <div 
                          key={project.id} 
                          onClick={() => setSelectedProject(project)}
                          className="group p-8 bg-slate-50 rounded-[32px] border border-transparent hover:border-accent/30 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors shadow-sm">
                                <FileText size={20} />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-950 group-hover:text-accent transition-colors tracking-tighter uppercase tracking-[0.05em]">{project.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Next Target: {project.next_milestone || 'Deployment'}</p>
                              </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              project.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                              project.status === 'Planning' ? 'bg-purple-100 text-purple-600' :
                              project.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <span>Completion Efficiency</span>
                               <span className="text-slate-950">{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                className="h-full bg-slate-950 rounded-full group-hover:bg-accent transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color?: string }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color || 'bg-slate-50'} blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`} />
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-12 h-12 ${color || 'bg-slate-50'} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-950 tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group relative ${
      active 
        ? 'bg-accent text-slate-950 shadow-xl shadow-accent/20 scale-[1.02]' 
        : 'text-slate-500 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className={`${active ? 'text-slate-950' : 'text-slate-500 group-hover:text-accent group-hover:rotate-12'} transition-all duration-300`}>
      {React.cloneElement(icon as React.ReactElement, { size: 18 })}
    </div>
    {label}
    {active && (
      <motion.div 
        layoutId="active-indicator"
        className="ml-auto w-1.5 h-1.5 bg-slate-950 rounded-full" 
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
