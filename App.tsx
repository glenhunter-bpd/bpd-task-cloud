
import React, { useState, useEffect, useRef } from 'react';
import { db } from './services/database';
import { INITIAL_DATA } from './constants';
import { AppState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import DocsViewer from './components/DocsViewer';
import TeamView from './components/TeamView';
import GrantsView from './components/GrantsView';
import SettingsView from './components/SettingsView';
import { Bell, Search, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [state, setState] = useState<AppState | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [hasKeys, setHasKeys] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initApp = async () => {
      setHasKeys(db.hasCredentials());
      
      // Initialize with mock data first, then attempt cloud sync
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
      case 'tasks': return <TaskList state={state} />;
      case 'kanban': return <KanbanBoard state={state} />;
      case 'grants': return <GrantsView state={state} />;
      case 'team': return <TeamView state={state} />;
      case 'docs': return <DocsViewer />;
      case 'settings': return <SettingsView state={state} />;
      default: return <Dashboard state={state} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* V3 PRO Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-6 flex-1">
             <div className="hidden md:flex relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Universal registry search..."
                  className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10"
                />
             </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Improved Cloud Status Indicator */}
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
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">System Logs</h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">Realtime</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="p-4 hover:bg-slate-50 transition-colors flex gap-3 border-b border-slate-50 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCloudConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isCloudConnected ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      </div>
                      <div>
                        <p className="text-xs text-slate-700 font-medium">
                          {isCloudConnected 
                            ? "Successfully established secure cloud socket." 
                            : !hasKeys 
                              ? "API keys missing. Database operations restricted." 
                              : "Connecting to Supabase... Using local fallback."}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">System Event</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 leading-none">{state.currentUser?.name}</div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-1">
                  {state.currentUser?.role}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200">
                {state.currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {!hasKeys && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
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
