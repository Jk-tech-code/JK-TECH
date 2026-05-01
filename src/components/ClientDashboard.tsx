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
  ExternalLink
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
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary h-auto"
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
            {/* Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard icon={<Clock className="text-blue-500" />} label="Active Projects" value={dbProjects.length.toString()} />
                <StatCard icon={<CircleCheck className="text-green-500" />} label="Completed Tasks" value="0" />
                <StatCard icon={<BarChart3 className="text-purple-500" />} label="Total Invested" value="$0" />
              </div>

              {/* Active Projects */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Your Active Projects</h3>
                  <button className="text-primary text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-6">
                  {dbProjects.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-500 font-bold">No active projects yet.</p>
                      <button className="text-primary text-sm font-bold mt-2 hover:underline">Start a Consultation</button>
                    </div>
                  ) : (
                    dbProjects.map((project) => (
                      <div key={project.id} className="group p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{project.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 font-bold">Next: {project.next_milestone || 'N/A'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
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

const DocumentItem = ({ name, date }: { name: string, date: string }) => (
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
