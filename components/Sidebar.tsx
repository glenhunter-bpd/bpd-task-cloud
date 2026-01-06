
import React from 'react';
import { 
  LayoutDashboard, CheckSquare, BarChart2, Users, Settings, 
  Cloud, FileText, Landmark, Zap, GitGraph, Target, ChevronRight,
  ShieldCheck, Activity
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const sections = [
    {
      title: 'Strategic Hub',
      items: [
        { id: 'dashboard', label: 'Global Dashboard', icon: LayoutDashboard },
        { id: 'mission', label: 'My Mission', icon: Target }, 
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'tasks', label: 'Registry', icon: CheckSquare },
        { id: 'kanban', label: 'Workflow', icon: BarChart2 },
        { id: 'timeline', label: 'Nexus Timeline', icon: GitGraph },
      ]
    },
    {
      title: 'Infrastructure',
      items: [
        { id: 'grants', label: 'Grants', icon: Landmark },
        { id: 'team', label: 'Personnel', icon: Users },
        { id: 'docs', label: 'Intelligence Base', icon: FileText },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-[#0F172A] h-screen flex flex-col sticky top-0 border-r border-slate-800/50 z-[60]">
      {/* Branding Header */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Cloud size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-black text-white text-xl tracking-tight leading-none uppercase">BPD Cloud</h1>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-500 font-black tracking-[0.2em] uppercase">V5 Enterprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 font-bold shadow-sm' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-slate-800/50 mt-auto bg-slate-950/50">
        <button 
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeView === 'settings' 
              ? 'bg-white text-slate-950 font-bold shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings size={18} />
          <span className="text-sm">Control Panel</span>
        </button>
        
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Health</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-500 font-bold">Latency: 24ms</div>
            <div className="text-[10px] text-emerald-500 font-black">ACTIVE</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
