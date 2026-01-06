
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { analyzeProjectHealth } from '../services/geminiService';
import { 
  Sparkles, Activity, Clock, CheckCircle2, AlertTriangle, 
  ArrowRight, Flame, ShieldAlert, TrendingUp, Zap, Cpu, ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const programHealth = useMemo(() => {
    return state.programs.map(p => {
      const tasks = state.tasks.filter(t => t.program === p.name && t.status !== TaskStatus.COMPLETED);
      let heatScore = 0;
      tasks.forEach(t => {
        let weight = t.priority === 'Critical' ? 20 : t.priority === 'High' ? 10 : t.priority === 'Medium' ? 5 : 2;
        heatScore += weight;
      });
      return { ...p, heatScore, activeTasks: tasks.length };
    }).sort((a, b) => b.heatScore - a.heatScore);
  }, [state.tasks, state.programs]);

  const stats = [
    { label: 'Active Ops', value: state.tasks.filter(t => t.status !== TaskStatus.COMPLETED).length, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completion', value: `${Math.round((state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length / state.tasks.length) * 100)}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'High Priority', value: state.tasks.filter(t => t.priority === 'Critical' || t.priority === 'High').length, icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Cloud Nodes', value: state.users.length, icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    const report = await analyzeProjectHealth(state.tasks);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Matrix */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Strategic Workload Distribution</h3>
              <p className="text-sm text-slate-400 font-medium">Cross-departmental capacity tracking</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">Live Nexus Data</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={programHealth}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="activeTasks" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Sentinel Hub */}
        <div className="lg:col-span-1 bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-700"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/20">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">AI Sentinel Hub</h3>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Enterprise Reasoning V5</p>
              </div>
            </div>

            {!aiReport && !loadingAi && (
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                  Trigger an autonomous neural audit. The Sentinel will scan for dependency deadlocks and predictive resource gaps.
                </p>
                <button 
                  onClick={handleGenerateAI}
                  className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 text-xs uppercase tracking-widest"
                >
                  Launch Neural Scan
                </button>
              </div>
            )}

            {loadingAi && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={20} className="text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Analyzing Registry Topology</p>
              </div>
            )}

            {aiReport && (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-slate-300 text-xs leading-relaxed font-medium animate-in zoom-in-95 duration-500">
                  {aiReport}
                </div>
                <button 
                  onClick={() => setAiReport(null)}
                  className="mt-6 w-full py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Reset Sentinel View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
