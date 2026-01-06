
import React, { useMemo, useState } from 'react';
import { AppState, Task, TaskStatus } from '../types';
import { db } from '../services/database';
import { getProgramColor } from '../constants';
import { Target, ShieldCheck, Rocket, Lock, AlertCircle, ChevronRight, CheckCircle2, Zap, Clock } from 'lucide-react';
import TaskModal from './TaskModal';

interface MyMissionProps {
  state: AppState;
}

const MyMission: React.FC<MyMissionProps> = ({ state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const currentUser = state.currentUser;
  
  const myTasks = useMemo(() => {
    return state.tasks.filter(t => t.assignedToId === currentUser?.id);
  }, [state.tasks, currentUser]);

  const stats = useMemo(() => {
    const total = myTasks.length;
    const completed = myTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const inProgress = myTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    return { total, completed, inProgress, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [myTasks]);

  const directBlockers = useMemo(() => {
    // Tasks I own that are blocking others
    return myTasks.filter(myTask => {
      if (myTask.status === TaskStatus.COMPLETED) return false;
      return state.tasks.some(otherTask => 
        otherTask.dependentTasks.includes(myTask.id) && otherTask.status !== TaskStatus.COMPLETED
      );
    });
  }, [myTasks, state.tasks]);

  const newlyUnblocked = useMemo(() => {
    // Tasks I own where all dependencies are completed, but I haven't finished yet
    return myTasks.filter(myTask => {
      if (myTask.status === TaskStatus.COMPLETED) return false;
      if (!myTask.dependentTasks || myTask.dependentTasks.length === 0) return false;
      return myTask.dependentTasks.every(depId => {
        const dep = state.tasks.find(t => t.id === depId);
        return dep && dep.status === TaskStatus.COMPLETED;
      });
    });
  }, [myTasks, state.tasks]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {isModalOpen && <TaskModal state={state} onClose={handleCloseModal} taskToEdit={editingTask} />}
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Zap size={16} className="fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Handshake Active</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome, Agent {currentUser.name}</h2>
          <p className="text-slate-500 font-medium">Your personal high-leverage mission summary for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Priority</div>
                <div className="text-sm font-bold text-slate-800">Critical Path focus</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Target size={20} />
              </div>
           </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <Rocket size={140} />
           </div>
           <div className="relative z-10">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Completion Velocity</span>
             <div className="text-5xl font-black my-2 tabular-nums">{stats.rate}%</div>
             <p className="text-indigo-100 text-sm font-medium">Efficiency across your active task registry.</p>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
           <div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Load</span>
             <div className="text-4xl font-black text-slate-800 mt-2 mb-4 tabular-nums">{stats.inProgress + (stats.total - stats.completed - stats.inProgress)}</div>
           </div>
           <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.rate}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{stats.completed}/{stats.total} DONE</span>
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 p-4 opacity-5">
             <ShieldCheck size={120} />
           </div>
           <div className="relative z-10">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Security Clearance</span>
             <div className="text-xl font-bold mt-2">{currentUser.role}</div>
             <div className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">{currentUser.department} Division</div>
             <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Synchronized</span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BLOCKER FOCUS */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-500" />
                Critical Blockers (You Own)
              </h3>
              <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">{directBlockers.length} ITEMS</span>
           </div>
           
           <div className="space-y-3">
              {directBlockers.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => handleEdit(task)}
                  className="bg-white border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${getProgramColor(task.program)}`}>
                        {task.program}
                     </span>
                     <div className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                        Open Parameters <ChevronRight size={12} />
                     </div>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{task.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-rose-600">
                        <Lock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Blocking 
                          {' '}{state.tasks.filter(t => t.dependentTasks.includes(task.id)).length} downstream task(s)
                        </span>
                     </div>
                     <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <Clock size={12} />
                        Due {new Date(task.plannedEndDate).toLocaleDateString()}
                     </div>
                  </div>
                </div>
              ))}
              {directBlockers.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-12 text-center">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
                      <CheckCircle2 size={24} />
                   </div>
                   <h4 className="font-bold text-emerald-800 mb-1">Clear Runway</h4>
                   <p className="text-xs text-emerald-600/70 font-medium">You aren't currently blocking any peer operations.</p>
                </div>
              )}
           </div>
        </div>

        {/* UNBLOCKED FOCUS */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Rocket size={16} className="text-indigo-500" />
                Newly Actionable Items
              </h3>
              <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full">{newlyUnblocked.length} READY</span>
           </div>

           <div className="space-y-3">
              {newlyUnblocked.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => handleEdit(task)}
                  className="bg-white border-l-4 border-indigo-500 p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${getProgramColor(task.program)}`}>
                        {task.program}
                     </span>
                     <div className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full tracking-tighter animate-pulse">
                        PREREQUISITES CLEAR
                     </div>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{task.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-indigo-600">
                        <Zap size={12} className="fill-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ready for execution</span>
                     </div>
                     <div className="text-[10px] font-bold text-slate-400">
                        Goal: {task.progress}% → 100%
                     </div>
                  </div>
                </div>
              ))}
              {newlyUnblocked.length === 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-12 text-center">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm border border-slate-100">
                      <Clock size={24} />
                   </div>
                   <h4 className="font-bold text-slate-800 mb-1">Queue Optimized</h4>
                   <p className="text-xs text-slate-500 font-medium">No tasks are currently waiting on unblocking.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MyMission;
