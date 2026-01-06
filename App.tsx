
import React, { useState, useEffect, useRef } from 'react';
import { db } from './services/database';
import { INITIAL_DATA } from './constants';
import { AppState, AppNotification } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import DocsViewer from './components/DocsViewer';
import TeamView from './components/TeamView';
import GrantsView from './components/GrantsView';
import SettingsView from './components/SettingsView';
import TimelineView from './components/TimelineView';
import MyMission from './components/MyMission'; 
import { Bell, Search, AlertCircle, CheckCircle, Wifi, WifiOff, Trash2, Clock, Check, Inbox, ChevronDown, User as UserIcon, LogOut, Sparkles, Shield, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [state, setState] = useState<AppState | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initApp = async () => {
      const success = await db.initialize(INITIAL_DATA);
      setIsCloudConnected(success);
      db.subscribe((newState) => {
        setState(newState);
        setIsCloudConnected(db.getStatus());
      });
    };
    initApp();

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!state) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-white font-black text-sm tracking-[0.3em] uppercase animate-pulse">Syncing Nexus Registry...</h2>
      </div>
    </div>
  );

  const unreadCount = state.notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden font-['Inter'] selection:bg-emerald-500/20 selection:text-emerald-700">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Enhanced Glass Header */}
        <header className="glass-header h-20 border-b border-slate-200/50 px-10 flex items-center justify-between sticky top-0 z-[50]">
          <div className="flex items-center gap-8 flex-1">
             <div className="hidden md:flex relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Global Command Search..."
                  className="w-full bg-slate-100/50 border-none rounded-2xl pl-12 pr-6 py-2.5 text-xs focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold placeholder-slate-400"
                />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black transition-all ${
              isCloudConnected 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isCloudConnected ? 'NODE SYNCHRONIZED' : 'LOCAL CACHE MODE'}
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); db.markNotificationsRead(); }}
                className={`relative p-3 rounded-2xl transition-all ${showNotifications ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-emerald-500 text-slate-950 text-[9px] font-black border-2 border-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Neural Feed</h4>
                    <button onClick={() => db.clearNotifications()} className="text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">Clear Protocol</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {state.notifications?.length ? state.notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-all flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {n.type === 'SENTINEL' ? <Sparkles size={16} /> : <Inbox size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-900 mb-1">{n.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">Feed Empty</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-10 w-[1px] bg-slate-200/50 mx-2"></div>

            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-4 pl-3 py-2 pr-4 rounded-2xl border transition-all ${showUserDropdown ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-lg shadow-emerald-200">
                  {state.currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className={`text-xs font-black leading-none ${showUserDropdown ? 'text-white' : 'text-slate-900'}`}>{state.currentUser?.name}</div>
                  <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Lvl 5 Personnel</div>
                </div>
                <ChevronDown size={14} className={showUserDropdown ? 'text-white rotate-180 transition-transform' : 'text-slate-400 transition-transform'} />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Context</h4>
                    <p className="text-[11px] text-slate-500 font-medium italic">Simulate different departmental identities.</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {state.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => { db.setCurrentUser(user.id); setShowUserDropdown(false); }}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all ${state.currentUser?.id === user.id ? 'bg-emerald-500/5 border border-emerald-500/10' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${state.currentUser?.id === user.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-400'}`}>
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-900">{user.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{user.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {activeView === 'dashboard' && <Dashboard state={state} onNavigate={setActiveView} />}
            {activeView === 'mission' && <MyMission state={state} />}
            {activeView === 'tasks' && <TaskList state={state} />}
            {activeView === 'kanban' && <KanbanBoard state={state} />}
            {activeView === 'timeline' && <TimelineView state={state} />}
            {activeView === 'grants' && <GrantsView state={state} />}
            {activeView === 'team' && <TeamView state={state} />}
            {activeView === 'docs' && <DocsViewer />}
            {activeView === 'settings' && <SettingsView state={state} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
