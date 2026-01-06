import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart2, Users, Settings, Globe, FileText, Landmark, Zap, GitGraph, Target } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Office Overview', icon: LayoutDashboard },
    { id: 'mission', label: 'Personal Mission', icon: Target }, 
    { id: 'tasks', label: 'Grant Registry', icon: CheckSquare },
    { id: 'kanban', label: 'Workflow Board', icon: BarChart2 },
    { id: 'timeline', label: 'Nexus Timeline', icon: GitGraph },
    { id: 'grants', label: 'Funding Programs', icon: Landmark },
    { id: 'team', label: 'Staff Directory', icon: Users },
    { id: 'docs', label: 'Handbooks', icon: FileText },
  ];

  return (
    <aside className="w-72 sidebar-gradient border-r border-slate-800 h-screen flex flex-col sticky top-0 z-[60]">
      <div className="p-8 flex flex-col items-start">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight leading-none uppercase">CNMI BPD</h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Cloud Registry</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
          <Zap size={10} className="text-emerald-400 fill-emerald-400" />
          <span className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">ENTERPRISE CLOUD</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white group'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
              <span className="text-[13px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800 mt-auto">
        <button 
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
            activeView === 'settings' 
              ? 'bg-indigo-600 text-white font-bold' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings size={20} />
          <span className="text-xs font-semibold tracking-wide uppercase">System Settings</span>
        </button>
        <p className="text-[9px] text-slate-600 mt-4 text-center font-bold tracking-widest uppercase">© 2025 CNMI GOVERNMENT</p>
      </div>
    </aside>
  );
};

export default Sidebar;