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
  Trash2
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newProject, setNewProject] = useState({
    name: '',
    desc: '',
    status: 'In Progress',
    progress: 0,
    next_milestone: ''
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
          .order('created_at', { ascending: false })
          .limit(5);

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
    setShowCreateForm(false);
    setSearchQuery('');
  }, [activeTab]);

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
          next_milestone: ''
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-8">
          <Logo className="text-primary" />
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Projects" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Billing" 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Support" 
            active={activeTab === 'support'} 
            onClick={() => setActiveTab('support')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold mt-2"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`relative hidden sm:block ${activeTab !== 'overview' && activeTab !== 'projects' ? 'opacity-50 pointer-events-none' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary h-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="relative text-slate-400 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{profile?.full_name || user.email}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{profile?.role || 'Premium Client'}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Area */}
            <div className="lg:col-span-2 space-y-8">
              {activeTab === 'overview' && !selectedProject && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <StatCard icon={<Clock className="text-blue-500" />} label="Active Projects" value={dbProjects.length.toString()} />
                  <StatCard icon={<CircleCheck className="text-green-500" />} label="Completed Tasks" value="0" />
                  <StatCard icon={<BarChart3 className="text-purple-500" />} label="Total Invested" value="$0" />
                </div>
              )}

              {/* Active Projects / Creation Form */}
              {selectedProject ? (
                // Selected Project View
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-6"
                  >
                   <ChevronLeft size={16} /> Back to Dashboard
                  </button>
                  
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedProject.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary" />
                          Started: {new Date(selectedProject.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Info size={14} className="text-primary" />
                          ID: #{selectedProject.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    <span className={`self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedProject.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                      selectedProject.status === 'Planning' ? 'bg-purple-100 text-purple-600' :
                      selectedProject.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {selectedProject.status}
                    </span>
                    <button 
                      onClick={() => {
                        setProjectToDelete(selectedProject);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl ml-auto"
                      title="Delete Project"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={18} className="text-slate-400" />
                          Description
                        </h4>
                        <div className="p-6 bg-slate-50 rounded-2xl text-slate-600 leading-relaxed font-medium">
                          {selectedProject.desc || 'No description provided for this project.'}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <BarChart3 size={18} className="text-slate-400" />
                          Current Progress
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm font-bold text-slate-700 items-end">
                            <span className="flex flex-col">
                              <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Development Phase</span>
                              {selectedProject.progress}% Complete
                            </span>
                            <span className="text-primary text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 bg-primary/5 rounded-md">Active Tier</span>
                          </div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedProject.progress}%` }}
                              className="h-full bg-primary rounded-full shadow-sm"
                            />
                          </div>
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Next Milestone</p>
                              <p className="text-sm font-bold text-slate-900">{selectedProject.next_milestone || 'Consultation scheduled'}</p>
                            </div>
                            <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Estimated Completion</p>
                              <p className="text-sm font-bold text-slate-900">Q3 2026</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                        <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-400">Project Team</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">JK</div>
                            <div>
                              <p className="text-sm font-bold text-white">Jared Kipkemoi</p>
                              <p className="text-[10px] text-white/50 font-medium">Lead Digital Strategist</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                          <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20">
                            Send Message
                          </button>
                        </div>
                      </div>

                      <div className="p-6 border-2 border-slate-100 rounded-2xl">
                        <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-400">Quick Actions</h4>
                        <div className="space-y-3">
                          <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all group flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 group-hover:text-primary">Download Assets</span>
                            <ExternalLink size={14} className="text-slate-300" />
                          </button>
                          <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all group flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 group-hover:text-primary">Request Revision</span>
                            <ExternalLink size={14} className="text-slate-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : showCreateForm ? (
                // Project Creation form
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Start New Project</h3>
                    <button 
                      onClick={() => setShowCreateForm(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleCreateProject} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Project Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Website Redesign"
                          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all font-bold ${formErrors.name ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/10' : 'border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10'}`}
                          value={newProject.name}
                          onChange={(e) => {
                            setNewProject({...newProject, name: e.target.value});
                            if (formErrors.name) setFormErrors({...formErrors, name: ''});
                          }}
                        />
                        {formErrors.name && (
                          <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={10} /> {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                        <select 
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                          value={newProject.status}
                          onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                        >
                          <option>In Progress</option>
                          <option>Pending</option>
                          <option>Planning</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Project Description</label>
                      <textarea 
                        rows={4}
                        placeholder="Describe the goals and scope of work..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none"
                        value={newProject.desc}
                        onChange={(e) => setNewProject({...newProject, desc: e.target.value})}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Initial Progress (%)</label>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all font-bold ${formErrors.progress ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/10' : 'border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10'}`}
                          value={newProject.progress}
                          onChange={(e) => {
                            setNewProject({...newProject, progress: parseInt(e.target.value) || 0});
                            if (formErrors.progress) setFormErrors({...formErrors, progress: ''});
                          }}
                        />
                        {formErrors.progress && (
                          <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={10} /> {formErrors.progress}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Next Milestone</label>
                        <input 
                          type="text"
                          placeholder="e.g. Design Review"
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                          value={newProject.next_milestone}
                          onChange={(e) => setNewProject({...newProject, next_milestone: e.target.value})}
                        />
                      </div>
                    </div>

                    <button 
                      disabled={submitting}
                      type="submit"
                      className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {submitting ? 'Creating Project...' : 'Create Project'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">
                      {activeTab === 'projects' ? 'All Projects' : 'Your Active Projects'}
                    </h3>
                    <div className="flex gap-2">
                      {activeTab === 'projects' && (
                        <button 
                          onClick={() => setShowCreateForm(true)}
                          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
                        >
                          <Plus size={16} /> New Project
                        </button>
                      )}
                      <button className="text-primary text-sm font-bold hover:underline">View All</button>
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
                          className="group p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{project.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 font-bold">Next: {project.next_milestone || 'N/A'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              project.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                              project.status === 'Planning' ? 'bg-purple-100 text-purple-600' :
                              project.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                className="h-full bg-primary"
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
              <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-[40px]" />
                <h3 className="text-xl font-bold mb-4 relative z-10">Need Assistance?</h3>
                <p className="text-white/80 text-sm mb-6 relative z-10">Our security team is ready to help you with any technical issues or service inquiries.</p>
                <button className="w-full bg-white text-primary py-3 rounded-xl font-bold hover:bg-slate-50 transition-all relative z-10 flex items-center justify-center gap-2">
                  <MessageSquare size={18} /> Open Ticket
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Documents</h3>
                <div className="space-y-4">
                  {dbDocuments.length === 0 ? (
                    <p className="text-slate-500 font-bold text-sm italic">No documents available yet.</p>
                  ) : (
                    dbDocuments.map((doc) => (
                      <DocumentItem 
                        key={doc.id} 
                        name={doc.name} 
                        date={new Date(doc.created_at).toLocaleDateString()} 
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
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-4 border-none">
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none mb-2">{label}</p>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const DocumentItem: React.FC<{ name: string; date: string }> = ({ name, date }) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <FileText size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{name}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{date}</p>
      </div>
    </div>
    <ExternalLink size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
  </div>
);
