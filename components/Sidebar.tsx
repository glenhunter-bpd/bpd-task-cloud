
import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart2, Users, Settings, Cloud, FileText, Landmark, Zap } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'kanban', label: 'Kanban Board', icon: BarChart2 },
    { id: 'grants', label: 'Grants & Programs', icon: Landmark },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'docs', label: 'Documentation', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0 shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-indigo-700 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
          <Cloud size={24} />
        </div>
        <div>
          <h1 className="font-bold text-white leading-none">BPD Cloud</h1>
          <div className="flex items-center gap-1 mt-1">
            <Zap size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase block">v3.0.0-PRO</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
            activeView === 'settings' 
              ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Settings size={20} />
          <span className="text-sm">Cloud Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
