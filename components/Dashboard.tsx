
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { analyzeProjectHealth } from '../services/geminiService';
import { Sparkles, Activity, Clock, CheckCircle2, AlertTriangle, ArrowRight, Flame, ShieldAlert, TrendingUp } from 'lucide-react';

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
    const PROXIMITY_48H = 2 * 24 * 60 * 60 * 1000;
    const PROXIMITY_7D = 7 * 24 * 60 * 60 * 1000;
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
        else if (diff < PROXIMITY_48H) multiplier = 2.5;
        else if (diff < PROXIMITY_7D) multiplier = 1.5;

        heatScore += weight * multiplier;
      });

      return {
        ...p,
        heatScore,
        activeTasks: tasks.length,
        criticalCount: tasks.filter(t => t.priority === 'Critical').length
      };
    }).sort((a, b) => b.heatScore - a.heatScore);
  }, [state.tasks, state.programs]);

  const statusData = [
    { name: 'Open', value: state.tasks.filter(t => t.status === TaskStatus.OPEN).length, color: '#94a3b8' },
    { name: 'In Progress', value: state.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Completed', value: state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length, color: '#22c55e' },
    { name: 'On Hold', value: state.tasks.filter(t => t.status === TaskStatus.ON_HOLD).length, color: '#f97316' },
  ];

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    const report = await analyzeProjectHealth(state.tasks);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 text-amber-800">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold">App is running in Offline/Mock mode</h4>
              <p className="text-sm opacity-80">Syncing with the BPD Remote Registry requires valid API credentials.</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate?.('settings')}
            className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-700 transition-all text-sm whitespace-nowrap"
          >
            Connect Cloud Database
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Operational Overview</h2>
          <p className="text-slate-500">Real-time data synchronization across BPD nodes.</p>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm overflow-hidden relative group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Flame size={20} className={programHealth.length > 0 && programHealth[0].heatScore > 50 ? 'animate-bounce' : ''} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Grant Health Heatmap</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Risk-Weighted Threshold Monitoring</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('grants')}
              className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:translate-x-1 transition-transform"
            >
              Analyze Programs <ArrowRight size={10} className="inline ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {programHealth.slice(0, 4).map(p => {
              const isHot = p.heatScore > 50;
              const isWarm = p.heatScore > 20;
              
              return (
                <div 
                  key={p.id}
                  className={`p-5 rounded-2xl border transition-all relative overflow-hidden group/card ${
                    isHot 
                      ? 'bg-rose-50 border-rose-100 shadow-lg shadow-rose-100/50' 
                      : isWarm 
                        ? 'bg-amber-50 border-amber-100' 
                        : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  {isHot && (
                    <div className="absolute top-0 right-0 p-2 text-rose-500 animate-pulse">
                      <ShieldAlert size={14} />
                    </div>
                  )}
                  <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isHot ? 'text-rose-600' : 'text-slate-400'}`}>
                    {p.name} Grant
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-black text-slate-800">{Math.round(p.heatScore)}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Heat Score</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${isHot ? 'text-rose-600' : 'text-slate-700'}`}>{p.activeTasks}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Active Items</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isHot ? 'bg-rose-500' : isWarm ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, p.heatScore)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 text-xs uppercase tracking-widest text-center md:text-left">Program Workload (Count)</h3>
          <div className="flex-1 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={programHealth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="activeTasks" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 text-xs uppercase tracking-widest text-center">Global Status</h3>
          <div className="flex-1 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{paddingTop: '10px', fontSize: '10px', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900 p-8 rounded-2xl text-white shadow-xl overflow-hidden relative border border-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Sparkles size={240} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Gemini AI Audit</h3>
            </div>
            
            {!aiReport && !loadingAi && (
              <div className="max-w-2xl">
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Leverage the Gemini intelligence stream to scan your global task registry. Identify operational hazards and obtain automated performance optimization plans.
                </p>
                <button 
                  onClick={handleGenerateAI}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
                >
                  Initiate AI Project Audit
                </button>
              </div>
            )}

            {loadingAi && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Syncing with Intelligence Cloud...</p>
              </div>
            )}

            {aiReport && (
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 whitespace-pre-wrap leading-relaxed text-slate-200 font-medium text-sm animate-in zoom-in-95">
                {aiReport}
                <div className="mt-6 pt-6 border-t border-slate-700 flex justify-end">
                  <button 
                    onClick={() => setAiReport(null)}
                    className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                    Dismiss Audit
                  </button>
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
