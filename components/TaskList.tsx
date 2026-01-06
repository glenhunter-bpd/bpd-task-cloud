
import React, { useState } from 'react';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { STATUS_COLORS, getProgramColor } from '../constants';
import { Search, Filter, Plus, Trash2, Calendar, Pencil, Loader2, Link2, AlertCircle, ChevronRight } from 'lucide-react';
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

  const filteredTasks = state.tasks.filter(task => 
    task.name.toLowerCase().includes(search.toLowerCase()) || 
    task.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {isModalOpen && <TaskModal state={state} onClose={() => setIsModalOpen(false)} taskToEdit={editingTask} />}
      <ConfirmationModal 
        isOpen={!!taskToDelete} 
        title="Revoke Registry Entry?" 
        message="This will permanently delete this task from the global enterprise cloud. This action cannot be undone."
        onConfirm={async () => { if(taskToDelete) { await db.deleteTask(taskToDelete); setTaskToDelete(null); } }} 
        onCancel={() => setTaskToDelete(null)} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Operation Registry</h2>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
            <span className="text-emerald-500">Live Nexus Protocol</span>
            <span>•</span>
            <span>{filteredTasks.length} Entries Synchronized</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search registry..."
              className="pl-11 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all w-72 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="bg-slate-950 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/10 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Register Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nexus Link</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{task.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate max-w-[200px] mt-1">{task.description || 'System Entry'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block ${STATUS_COLORS[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${getProgramColor(task.program)}`}>
                        {task.program}
                      </span>
                      {task.dependentTasks.length > 0 && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-slate-300">
                          <Link2 size={10} />
                          {task.dependentTasks.length}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-slate-900/10">
                        {task.assignedTo.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                      <Calendar size={12} className="text-slate-200" />
                      {new Date(task.plannedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                        className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => setTaskToDelete(task.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
