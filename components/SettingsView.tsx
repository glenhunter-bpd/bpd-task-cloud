
import React from 'react';
import { AppState } from '../types';
import { db } from '../services/database';
import { User, Shield, Monitor, Database, Terminal } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500">Global cloud environment parameters and session management.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className="font-mono font-bold text-slate-800">v2.2.0-STABLE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Environment</span>
                <span className="font-bold text-indigo-600 uppercase text-[10px] tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Production</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sync Status</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                   Nominal (Live)
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
