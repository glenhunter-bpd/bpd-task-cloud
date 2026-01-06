
import React, { useState } from 'react';
import { AppState } from '../types';
import { db } from '../services/database';
import { User, Shield, Database, Terminal, Link, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state }) => {
  const [cloudUrl, setCloudUrl] = useState(localStorage.getItem('BPD_CLOUD_SUPABASE_URL') || '');
  const [cloudKey, setCloudKey] = useState(localStorage.getItem('BPD_CLOUD_SUPABASE_ANON_KEY') || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleLinkCloud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudUrl || !cloudKey) return;
    
    db.saveCredentials(cloudUrl, cloudKey);
    setSaveStatus('SUCCESS');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDisconnect = () => {
    db.clearCredentials();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500">Global cloud environment parameters and session management.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cloud Link Management - DEBUGGER SECTION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Link size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Cloud Link Diagnostic</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manual Provisioning Fallback</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                If your deployment isn't picking up the environment variables from your hosting provider, 
                you can manually link this browser instance to your Supabase project. 
                <span className="block mt-2 font-semibold text-indigo-600">Note: These are stored securely in your local browser cache.</span>
              </p>
              
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${db.getStatus() ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                {db.getStatus() ? <CheckCircle2 size={18} className="mt-0.5" /> : <AlertTriangle size={18} className="mt-0.5" />}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">{db.getStatus() ? 'Connected' : 'Disconnected'}</div>
                  <div className="text-xs opacity-80">{db.getStatus() ? 'System is synchronized with global registry.' : 'App is running in Offline/Mock mode. Local changes will not sync.'}</div>
                </div>
              </div>

              {db.getStatus() && (
                <button 
                  onClick={handleDisconnect}
                  className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-700 transition-colors tracking-widest flex items-center gap-2"
                >
                  <Key size={12} />
                  Revoke Browser Credentials
                </button>
              )}
            </div>

            <form onSubmit={handleLinkCloud} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Supabase Project URL</label>
                <input 
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-indigo-500 shadow-sm"
                  value={cloudUrl}
                  onChange={e => setCloudUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Anon Public API Key</label>
                <input 
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-indigo-500 shadow-sm"
                  value={cloudKey}
                  onChange={e => setCloudKey(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${saveStatus === 'SUCCESS' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {saveStatus === 'SUCCESS' ? 'Database Linked!' : 'Save & Initialize Cloud'}
              </button>
            </form>
          </div>
        </div>

        {/* User Persona Switcher */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <User size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Staff Identity</h3>
          </div>
          
          <p className="text-sm text-slate-500 mb-4">
            Switch your active profile to simulate different departmental roles across the BPD network.
          </p>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {state.users.map((user) => (
              <button
                key={user.id}
                onClick={() => db.setCurrentUser(user.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  state.currentUser?.id === user.id
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/10'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800">{user.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{user.role} • {user.department}</div>
                  </div>
                </div>
                {state.currentUser?.id === user.id && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Diagnostics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Release Build</span>
                <span className="font-mono font-bold text-slate-800">v3.5.0-PRO</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Environment</span>
                <span className="font-bold text-indigo-600 uppercase text-[10px] tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Production</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sync Status</span>
                <span className={`font-bold flex items-center gap-1 ${db.getStatus() ? 'text-emerald-600' : 'text-amber-500'}`}>
                   {db.getStatus() ? 'Nominal (Live)' : 'Local Fallback'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/10 rounded-lg text-indigo-400">
                 <Shield size={20} />
               </div>
               <h3 className="font-bold">Security Compliance</h3>
             </div>
             <p className="text-sm text-slate-400 leading-relaxed mb-4">
               All BPD cloud operations are encrypted and synchronized using the V2 Protocol. Modifications are cryptographically linked to your current identity.
             </p>
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-black/20 p-2 rounded">
               <Terminal size={12} />
               <span>node-id: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
