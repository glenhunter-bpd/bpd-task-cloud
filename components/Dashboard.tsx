
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Task, AppState, TaskStatus } from '../types';
import { analyzeProjectHealth } from '../services/geminiService';
import { Sparkles, Activity, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Operational Overview</h2>
          <p className="text-slate-500">Real-time data synchronization across global nodes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            CLOUD SYNC ACTIVE
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Total Tasks</span>
            <Activity className="text-indigo-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalTasks}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Completion Rate</span>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-800">{completionRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Pending Actions</span>
            <Clock className="text-amber-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {state.tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Active Programs</span>
            <div className="flex gap-1">
              {state.programs.map(p => (
                <div key={p.id} className="w-2 h-2 rounded-full bg-slate-300"></div>
              ))}
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{state.programs.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Task Distribution by Program</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Status Summary</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <Sparkles size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-indigo-200" size={24} />
              <h3 className="text-xl font-bold">Gemini Project Insights</h3>
            </div>
            
            {!aiReport && !loadingAi && (
              <div className="max-w-xl">
                <p className="text-indigo-100 mb-6 leading-relaxed text-lg">
                  Leverage Gemini 3 AI to analyze your task cloud, identify hidden blockers, and optimize team throughput based on current progress data.
                </p>
                <button 
                  onClick={handleGenerateAI}
                  className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
                >
                  Generate Intelligent Status Report
                </button>
              </div>
            )}

            {loadingAi && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-100 font-medium">Analyzing global task stream...</p>
              </div>
            )}

            {aiReport && (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 whitespace-pre-wrap leading-relaxed text-indigo-50 font-medium">
                {aiReport}
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={() => setAiReport(null)}
                    className="text-white/60 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Close Report
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
