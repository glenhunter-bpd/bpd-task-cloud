
import React, { useMemo, useState } from 'react';
import { AppState, Task, TaskStatus } from '../types';
import { db } from '../services/database';
import { getProgramColor, STATUS_COLORS } from '../constants';
import { Target, Lock, AlertCircle, ChevronRight, CheckCircle2, Zap, Clock, ListTodo, Rocket, Sparkles, Shield, ArrowUpRight } from 'lucide-react';
import TaskModal from './TaskModal';

interface MyMissionProps {
  state: AppState;
}

const MyMission: React.FC<MyMissionProps> = ({ state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const currentUser = state.currentUser;
  const myTasks = useMemo(() => state.tasks.filter(t => t.assignedToId === currentUser?.id), [state.tasks, currentUser]);
  const unblocked = useMemo(() => myTasks.filter(t => t.status !== TaskStatus.COMPLETED && (!t.dependentTasks || t.dependentTasks.every(d => state.tasks.find(x => x.id === d)?.status === TaskStatus.COMPLETED))), [myTasks, state.tasks]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {isModalOpen && <TaskModal state={state} onClose={() => setIsModalOpen(false)} taskToEdit={editingTask} />}
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Mission Briefing</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Active Personnel: {currentUser?.name} • Security Level 5</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="text-right">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Focus</div>
              <div className="text-sm font-black text-slate-900">{unblocked.length} High-Leverage Tasks</div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <Rocket size={18} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Unblocked Tasks */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            Clear for Execution
          </h3>
          <div className="grid gap-4">
            {unblocked.map(task => (
              <div 
                key={task.id} 
                onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${getProgramColor(task.program)}`}>
                      {task.program}
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Unblocked</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">{task.name}</h4>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                      <Clock size={12} />
                      Due {new Date(task.plannedEndDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Shield size={14} className="text-rose-500" />
            Registry Intelligence
          </h3>
          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white h-full relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={160} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-sm leading-relaxed font-medium mb-6">
                Sentinel V5 scanning active. No critical dependency failures detected in your immediate workspace.
              </p>
              <div className="flex flex-col gap-3">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-200 italic">"Global sync node is nominal."</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMission;
