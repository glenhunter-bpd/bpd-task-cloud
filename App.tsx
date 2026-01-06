
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
import { Bell, Search, AlertCircle, CheckCircle, Wifi, WifiOff, Trash2, Clock, Check, Inbox, ChevronDown, User as UserIcon, LogOut, Sparkles, Shield } from 'lucide-react';

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
    <div className="h-screen w-full flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="relative mb-8 text-indigo-500 animate-pulse">
           <Wifi size={48} />
        </div>
        <h2 className="text-white font-bold text-xl tracking-tight mb-2 uppercase tracking-widest">BPD Central Handshake</h2>
        <p className="text-slate-400 font-medium">Authenticating with global registry...</p>
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

  const handleMarkRead = () => {
    db.markNotificationsRead();
  };

  const handleClearNotifications = () => {
    db.clearNotifications();
    setShowNotifications(false);
  };

  const handleSwitchUser = (userId: string) => {
    db.setCurrentUser(userId);
    setShowUserDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'TASK_UPDATE': return <Inbox size={14} className="text-indigo-500" />;
      case 'DEPENDENCY': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'SYSTEM': return <Wifi size={14} className="text-amber-500" />;
      case 'ALERT': return <AlertCircle size={14} className="text-rose-500" />;
      case 'SENTINEL': return <Sparkles size={14} className="text-violet-500" />;
      default: return <Clock size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* V4.5 Personalization Header with Sentinel Integration */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-6 flex-1">
             <div className="hidden md:flex relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Universal registry search..."
                  className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10 font-medium"
                />
             </div>
          </div>

          <div className="flex items-center gap-5">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black transition-all ${
              isCloudConnected 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : !hasKeys 
                  ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' 
                  : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {isCloudConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {!hasKeys ? 'MISSING API KEYS' : isCloudConnected ? 'CLOUD SYNC ACTIVE' : 'LOCAL CACHE MODE'}
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) handleMarkRead();
                }}
                className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black border-2 border-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-slate-800 text-sm">Nexus Pulse Feed</h4>
                       <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Real-time</span>
                    </div>
                    <button 
                      onClick={handleClearNotifications}
                      className="text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors tracking-tighter"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {state.notifications && state.notifications.length > 0 ? (
                      state.notifications.map((n) => (
                        <div key={n.id} className={`p-4 hover:bg-slate-50/80 transition-all flex gap-3 border-b border-slate-50 last:border-0 relative ${!n.read ? 'bg-indigo-50/30' : ''} ${n.type === 'SENTINEL' ? 'bg-violet-50/20' : ''}`}>
                          {!n.read && <div className={`absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full ${n.type === 'SENTINEL' ? 'bg-violet-500' : 'bg-indigo-500'}`} />}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-100 shadow-sm`}>
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                               <p className={`text-xs font-bold truncate ${n.type === 'SENTINEL' ? 'text-violet-800' : 'text-slate-900'}`}>{n.title}</p>
                               <span className="text-[9px] text-slate-400 font-medium">
                                 {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                            {n.type === 'SENTINEL' && (
                               <div className="mt-1 flex items-center gap-1">
                                  <Shield size={10} className="text-violet-400" />
                                  <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">AI Sentinel Observation</span>
                               </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center opacity-40">
                         <Inbox size={32} className="text-slate-300 mb-2" />
                         <p className="text-xs font-bold uppercase tracking-widest">Registry feed is clear</p>
                      </div>
                    )}
                  </div>
                  
                  {state.notifications && state.notifications.length > 0 && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End of Cloud Log</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            {/* Quick User Switcher */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-3 pl-2 py-1.5 pr-3 rounded-xl transition-all border border-transparent ${showUserDropdown ? 'bg-slate-100 border-slate-200' : 'hover:bg-slate-50'}`}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-800 leading-none">{state.currentUser?.name}</div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-1">
                    {state.currentUser?.role}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200 relative group">
                  {state.currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full border border-slate-200">
                    <ChevronDown size={10} className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Directory</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Switch identity to simulate departmental context.</p>
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {state.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-slate-50 last:border-0 ${
                          state.currentUser?.id === user.id 
                            ? 'bg-indigo-50/50' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          state.currentUser?.id === user.id 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{user.role} • {user.department}</div>
                        </div>
                        {state.currentUser?.id === user.id && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => { setActiveView('settings'); setShowUserDropdown(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                      <LogOut size={12} className="rotate-180" />
                      Manage Infrastructure
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {!hasKeys && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4">
                <div className="flex items-center gap-3 text-rose-700 text-sm font-medium">
                  <AlertCircle size={18} />
                  <span>Deployment Warning: Supabase Environment Variables are not visible to the browser.</span>
                </div>
                <div className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Action Required</div>
              </div>
            )}
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
