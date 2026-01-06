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
import { Bell, Search, AlertCircle, CheckCircle, Wifi, WifiOff, Clock, Inbox, ChevronDown, User as UserIcon, LogOut, Sparkles, Shield, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [state, setState] = useState<AppState | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [hasKeys, setHasKeys] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initApp = async () => {
      setHasKeys(db.hasCredentials());
      const success = await db.initialize(INITIAL_DATA);
      setIsCloudConnected(success);
      
      const unsubscribe = db.subscribe((newState) => {
        setState(newState);
        setIsCloudConnected(db.getStatus());
        setHasKeys(db.hasCredentials());
      });

      return unsubscribe;
    };

    const unsubscribePromise = initApp();

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribePromise.then(unsub => unsub && unsub());
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!state) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center">
        <Globe size={48} className="text-indigo-500 animate-pulse mb-6" />
        <h2 className="text-white font-black text-xl tracking-widest uppercase">CNMI BPD Handshake</h2>
        <p className="text-slate-400 font-medium mt-2">Connecting to the Broadband Registry...</p>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard state={state} onNavigate={setActiveView} />;
      case 'mission': return <MyMission state={state} />;
      case 'tasks': return <TaskList state={state} />;
      case 'kanban': return <KanbanBoard state={state} />;
      case 'timeline': return <TimelineView state={state} />;
      case 'grants': return <GrantsView state={state} />;
      case 'team': return <TeamView state={state} />;
      case 'docs': return <DocsViewer />;
      case 'settings': return <SettingsView state={state} />;
      default: return <Dashboard state={state} onNavigate={setActiveView} />;
    }
  };

  const unreadCount = state.notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Executive Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex-1">
             <div className="hidden md:flex relative max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Universal record search..."
                  className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-500/5 font-medium transition-all"
                />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black transition-all ${
              isCloudConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
              {isCloudConnected ? 'NEXUS LIVE' : 'OFFLINE MODE'}
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) db.markNotificationsRead(); }}
                className={`relative p-2.5 rounded-2xl transition-all ${showNotifications ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black border-2 border-white rounded-full">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 origin-top-right">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">Activity Feed</h4>
                    <button onClick={() => { db.clearNotifications(); setShowNotifications(false); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-600">Clear</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {state.notifications && state.notifications.length > 0 ? (
                      state.notifications.map((n) => (
                        <div key={n.id} className={`p-4 hover:bg-slate-50 border-b border-slate-50 flex gap-3 ${!n.read ? 'bg-indigo-50/20' : ''}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-100`}>
                            {n.type === 'SENTINEL' ? <Sparkles size={14} className="text-indigo-600" /> : <Inbox size={14} className="text-slate-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center opacity-30 flex flex-col items-center">
                         <Inbox size={32} className="mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Feed is quiet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>

            <div className="relative" ref={userDropdownRef}>
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 leading-none">{state.currentUser?.name}</div>
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">{state.currentUser?.role}</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm relative">
                  {state.currentUser?.name?.substring(0, 2).toUpperCase()}
                  <ChevronDown size={12} className={`absolute -bottom-1 -right-1 bg-white text-slate-400 rounded-full border border-slate-200 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 origin-top-right">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Registry</h4>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {state.users.map((user) => (
                      <button key={user.id} onClick={() => { db.setCurrentUser(user.id); setShowUserDropdown(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 ${state.currentUser?.id === user.id ? 'bg-indigo-50/50' : ''}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold ${state.currentUser?.id === user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{user.name.substring(0, 2).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900">{user.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{user.department}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50">
                    <button onClick={() => { setActiveView('settings'); setShowUserDropdown(false); }} className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors">Infrastructure</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;