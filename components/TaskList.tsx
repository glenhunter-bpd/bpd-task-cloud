import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { Search, Plus, Trash2, Calendar, Pencil, ChevronDown, ChevronRight, MoreHorizontal, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import TaskModal from './TaskModal';
import ConfirmationModal from './ConfirmationModal';

interface TaskListProps {
  state: AppState;
}

const TaskList: React.FC<TaskListProps> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [activeStatusMenu, setActiveStatusMenu] = useState<string | null>(null);

  const toggleGroup = (program: string) => {
    setCollapsedGroups(prev => ({ ...prev, [program]: !prev[program] }));
  };

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => 
      task.name.toLowerCase().includes(search.toLowerCase()) || 
      task.assignedTo.toLowerCase().includes(search.toLowerCase())
    );
  }, [state.tasks, search]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    state.programs.forEach(p => groups[p.name] = []);
    filteredTasks.forEach(task => {
      if (!groups[task.program]) groups[task.program] = [];
      groups[task.program].push(task);
    });
    return groups;
  }, [filteredTasks, state.programs]);

  const getTimelinePosition = (start: string, end: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const totalDays = monthEnd.getDate();

    const s = new Date(start);
    const e = new Date(end);

    const startOffset = Math.max(0, Math.min(100, ((s.getDate() - 1) / totalDays) * 100));
    const duration = Math.max(5, ((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * totalDays)) * 100);

    return { left: `${startOffset}%`, width: `${Math.min(100 - startOffset, duration)}%` };
  };

  const handleQuickStatus = async (taskId: string, status: TaskStatus) => {
    const progress = status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.OPEN ? 0 : 50;
    await db.updateTask(taskId, { status, progress });
    setActiveStatusMenu(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">
      {isModalOpen && <TaskModal state={state} onClose={() => setIsModalOpen(false)} taskToEdit={editingTask} />}
      <ConfirmationModal 
        isOpen={!!taskToDelete}
        title="Remove Record"
        message="This will permanently delete this operational record from the cloud."
        onConfirm={async () => { if (taskToDelete) { await db.deleteTask(taskToDelete); setTaskToDelete(null); } }}
        onCancel={() => setTaskToDelete(null)}
      />

      <header className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Registry Master View
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Enterprise</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter tasks..."
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </header>

      <div className="bg-[#1e1e2d] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50">
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 sticky left-0 z-20 bg-[#1e1e2d]">Operation Name</th>
                <th className="px-4 py-3 w-40">Timeline (Current Month)</th>
                <th className="px-4 py-3 w-32">Assignee</th>
                <th className="px-4 py-3 w-32">Status</th>
                <th className="px-4 py-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {state.programs.map(program => (
                <React.Fragment key={program.id}>
                  <tr className="bg-slate-800/30 border-b border-slate-800/50 group cursor-pointer" onClick={() => toggleGroup(program.name)}>
                    <td className="px-4 py-2 text-center">
                      {collapsedGroups[program.name] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </td>
                    <td colSpan={5} className="px-2 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: program.color === 'sky' ? '#7dd3fc' : program.color === 'cyan' ? '#67e8f9' : '#818cf8' }}>
                          {program.name}
                        </span>
                        <span className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded-md font-bold text-slate-400">
                          {groupedTasks[program.name].length} Tasks
                        </span>
                      </div>
                    </td>
                  </tr>

                  {!collapsedGroups[program.name] && groupedTasks[program.name].map(task => (
                    <tr key={task.id} className="group border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors relative">
                      <td className="px-4 py-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'Critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-slate-600'}`}></div>
                      </td>
                      <td className="px-4 py-2 sticky left-0 z-10 bg-[#1e1e2d] group-hover:bg-[#252538] transition-colors border-r border-slate-800/50">
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-xs font-bold text-slate-100 truncate">{task.name}</span>
                          <span className="text-[9px] text-slate-500 font-medium truncate">{task.description || 'No context provided.'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-full h-4 bg-slate-800/50 rounded-full relative overflow-hidden">
                          <div 
                            className="absolute h-full bg-indigo-500/80 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-700"
                            style={getTimelinePosition(task.startDate, task.plannedEndDate)}
                          ></div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-slate-700 text-[9px] font-black text-slate-300 rounded-md flex items-center justify-center">
                            {task.assignedTo.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{task.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveStatusMenu(activeStatusMenu === task.id ? null : task.id); }}
                          className={`w-full text-[9px] font-black uppercase py-1 px-2 rounded flex items-center justify-between group/btn transition-all ${
                            task.status === TaskStatus.COMPLETED ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                            task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                            'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                          <ChevronDown size={10} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        
                        {activeStatusMenu === task.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-[100] animate-in slide-in-from-bottom-2 p-1">
                            {Object.values(TaskStatus).map(s => (
                              <button
                                key={s}
                                onClick={() => handleQuickStatus(task.id, s)}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-slate-700 rounded-md transition-colors"
                              >
                                {s.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-white transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => setTaskToDelete(task.id)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {!collapsedGroups[program.name] && (
                    <tr className="bg-slate-900/20">
                      <td className="px-4 py-2"></td>
                      <td colSpan={5} className="px-2 py-2">
                        <button 
                          onClick={() => { setEditingTask({ program: program.name } as any); setIsModalOpen(true); }}
                          className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 transition-colors px-2 py-1 rounded hover:bg-slate-800"
                        >
                          <Plus size={12} /> Add Task to {program.name}
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskList;