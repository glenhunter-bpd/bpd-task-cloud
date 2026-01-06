
import React, { useMemo, useState } from 'react';
import { AppState, Task, TaskStatus } from '../types';
import { db } from '../services/database';
import { getProgramColor, STATUS_COLORS } from '../constants';
// Added Rocket and Sparkles/Shield to the lucide-react imports
import { Target, Lock, AlertCircle, ChevronRight, CheckCircle2, Zap, Clock, ListTodo, Rocket, Sparkles, Shield } from 'lucide-react';
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

  const allPending = useMemo(() => {
    return myTasks.filter(t => t.status !== TaskStatus.COMPLETED)
      .sort((a, b) => new Date(a.plannedEndDate).getTime() - new Date(b.plannedEndDate).getTime());
  }, [myTasks]);

  const sentinelAlerts = useMemo(() => {
    return state.notifications?.filter(n => n.type === 'SENTINEL' && !n.read).slice(0, 2) || [];
  }, [state.notifications]);

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

      {/* AI Sentinel Advisory Section */}
      {sentinelAlerts.length > 0 && (
        <div className="bg-violet-900 text-white rounded-[2rem] p-8 shadow-xl shadow-violet-200 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <Sparkles size={160} />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-violet-500/30 flex items-center justify-center">
                    <Shield size={18} className="text-violet-300" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Sentinel Risk Advisory</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {sentinelAlerts.map(alert => (
                    <div key={alert.id} className="border-l border-violet-500/50 pl-6 py-1">
                       <h4 className="font-bold text-lg mb-2 text-violet-50">{alert.title.replace('Sentinel: ', '')}</h4>
                       <p className="text-sm text-violet-200/80 leading-relaxed">{alert.message}</p>
                    </div>
                 ))}
              </div>
              
              <div className="mt-8 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">Proactive Analysis Continuous</span>
              </div>
           </div>
        </div>
      )}

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

      {/* MASTER PENDING QUEUE - Full Registry View for Current User */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
             <ListTodo size={16} className="text-slate-600" />
             Master Mission Queue
           </h3>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{allPending.length} PENDING TOTAL</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">Operation</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Grant</th>
                    <th className="px-8 py-5">Target Date</th>
                    <th className="px-8 py-5 text-right">Registry</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {allPending.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleEdit(task)}>
                       <td className="px-8 py-4">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{task.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{task.priority} Priority</div>
                       </td>
                       <td className="px-8 py-4">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>
                             {task.status.replace('_', ' ')}
                          </span>
                       </td>
                       <td className="px-8 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tight ${getProgramColor(task.program)}`}>
                             {task.program}
                          </span>
                       </td>
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                             <Clock size={12} className="text-slate-300" />
                             {new Date(task.plannedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </div>
                       </td>
                       <td className="px-8 py-4 text-right">
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                             Details <ChevronRight size={10} className="inline ml-1" />
                          </div>
                       </td>
                    </tr>
                 ))}
                 {allPending.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-12 text-center">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Personal Mission Registry is Empty</p>
                          <p className="text-xs text-slate-400 mt-1">All assigned operations have been finalized.</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default MyMission;
