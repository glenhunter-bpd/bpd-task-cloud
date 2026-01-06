import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { analyzeProjectHealth } from '../services/geminiService';
import { Sparkles, Activity, Clock, AlertTriangle, ArrowRight, Flame, ShieldAlert, TrendingUp } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(!db.getStatus());

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    const unsubscribe = db.subscribe(() => {
      setIsOffline(!db.getStatus());
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const programHealth = useMemo(() => {
    const now = new Date();
    return state.programs.map(p => {
      const tasks = state.tasks.filter(t => t.program === p.name && t.status !== TaskStatus.COMPLETED);
      let heatScore = 0;
      tasks.forEach(t => {
        let weight = t.priority === 'Critical' ? 20 : t.priority === 'High' ? 10 : t.priority === 'Medium' ? 5 : 2;
        const due = new Date(t.plannedEndDate);
        const diff = due.getTime() - now.getTime();
        let multiplier = 1;
        if (diff < 0) multiplier = 3;
        else if (diff < 2 * 24 * 60 * 60 * 1000) multiplier = 2.5;
        heatScore += weight * multiplier;
      });
      return { ...p, heatScore, activeTasks: tasks.length };
    }).sort((a, b) => b.heatScore - a.heatScore);
  }, [state.tasks, state.programs]);

  const statusData = [
    { name: 'Pending', value: state.tasks.filter(t => t.status === TaskStatus.OPEN).length, color: '#94a3b8' },
    { name: 'Active', value: state.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#6366f1' },
    { name: 'Finalized', value: state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length, color: '#10b981' },
    { name: 'On Hold', value: state.tasks.filter(t => t.status === TaskStatus.ON_HOLD).length, color: '#f59e0b' },
  ];

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    const report = await analyzeProjectHealth(state.tasks);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle size={20} className="text-amber-500" />
            <p className="text-sm font-semibold">Running in restricted offline mode. Connect to BPD Nexus to sync with other nodes.</p>
          </div>
          <button onClick={() => onNavigate?.('settings')} className="text-xs font-bold uppercase text-amber-700 bg-white border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-all">Link Registry</button>
        </div>
      )}

      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h2>
        <p className="text-slate-500 font-medium">Monitoring grant progress and office capacity across the CNMI network.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {programHealth.slice(0, 4).map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{p.name} GRANT</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-extrabold text-slate-900">{p.activeTasks}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Active Records</div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.heatScore > 40 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {p.heatScore > 40 ? 'RISK: HIGH' : 'NOMINAL'}
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${p.heatScore > 40 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, (p.activeTasks / 10) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">Workload Distribution</h3>
          {mounted && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programHealth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="activeTasks" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 text-center">Global Performance</h3>
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Sparkles size={300} />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                <Activity size={24} />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">AI Operational Sentinel</h3>
            </div>
            
            {!aiReport && !loadingAi && (
              <>
                <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                  The Gemini 3 Intelligence Engine can perform a comprehensive audit of all BPD grant operations to identify bottlenecks, workload imbalances, and deadline risks.
                </p>
                <button 
                  onClick={handleGenerateAI}
                  className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  Execute Comprehensive Audit
                </button>
              </>
            )}

            {loadingAi && (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase animate-pulse">Reconciling Office Data Streams...</p>
              </div>
            )}

            {aiReport && (
              <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 text-slate-100 font-medium text-base animate-in zoom-in-95 leading-relaxed">
                <div className="whitespace-pre-wrap">{aiReport}</div>
                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                  <button onClick={() => setAiReport(null)} className="text-slate-500 hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest">Acknowledge Audit</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;