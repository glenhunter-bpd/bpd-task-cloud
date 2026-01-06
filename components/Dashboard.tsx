
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { analyzeProjectHealth } from '../services/geminiService';
import { Sparkles, Activity, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

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

  const statusData = [
    { name: 'Open', value: state.tasks.filter(t => t.status === TaskStatus.OPEN).length, color: '#94a3b8' },
    { name: 'In Progress', value: state.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Completed', value: state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length, color: '#22c55e' },
    { name: 'On Hold', value: state.tasks.filter(t => t.status === TaskStatus.ON_HOLD).length, color: '#f97316' },
  ];

  const programData = state.programs.map(p => ({
    name: p.name,
    tasks: state.tasks.filter(t => t.program === p.name).length
  }));

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    const report = await analyzeProjectHealth(state.tasks);
    setAiReport(report);
    setLoadingAi(false);
  };

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cloud Connectivity Alert */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <Activity className="text-indigo-500" size={18} />
          </div>
          <div className="text-2xl font-bold text-slate-800 tabular-nums">{totalTasks}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efficiency</span>
            <CheckCircle2 className="text-emerald-500" size={18} />
          </div>
          <div className="text-2xl font-bold text-slate-800 tabular-nums">{completionRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Backlog</span>
            <Clock className="text-amber-500" size={18} />
          </div>
          <div className="text-2xl font-bold text-slate-800 tabular-nums">
            {state.tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Programs</span>
            <div className="flex gap-1">
              {state.programs.map(p => (
                <div key={p.id} className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              ))}
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tabular-nums">{state.programs.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 text-xs uppercase tracking-widest text-center md:text-left">Program Workload</h3>
          <div className="flex-1 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={programData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6 text-xs uppercase tracking-widest text-center">Task Status</h3>
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

        {/* AI Insight Section */}
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
