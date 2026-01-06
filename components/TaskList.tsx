
import React, { useState } from 'react';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { STATUS_COLORS, getProgramColor } from '../constants';
import { Search, Filter, Plus, Trash2, Calendar, User as UserIcon, Pencil, Loader2 } from 'lucide-react';
import TaskModal from './TaskModal';
import ConfirmationModal from './ConfirmationModal';

interface TaskListProps {
  state: AppState;
}

const TaskList: React.FC<TaskListProps> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase()) || 
                          task.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = filterProgram === 'All' || task.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setIsProcessing(taskId);
    const progress = status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.OPEN ? 0 : 50;
    await db.updateTask(taskId, { status, progress });
    setIsProcessing(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await db.deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {isModalOpen && <TaskModal state={state} onClose={handleCloseModal} taskToEdit={editingTask} />}
      
      <ConfirmationModal 
        isOpen={!!taskToDelete}
        title="Revoke Global Operation?"
        message="This will permanently delete the task from the BPD Cloud Database for all users. This action is tracked in the system logs."
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cloud Task Registry</h2>
          <p className="text-slate-500 text-sm">Synchronized with {state.users.length} active staff nodes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={20} />
          Create Task
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter BPD cloud records..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer text-slate-600"
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
            >
              <option value="All">All Active Grants</option>
              {state.programs.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Operation Identity</th>
                <th className="px-6 py-5">Source</th>
                <th className="px-6 py-5">Owner</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Sync Progress</th>
                <th className="px-6 py-5">Timeline</th>
                <th className="px-6 py-5 text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{task.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 font-medium">{task.description || 'Global Cloud Task.'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-tight ${getProgramColor(task.program)}`}>
                      {task.program}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[9px] font-black shadow-sm">
                        {task.assignedTo.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-600 font-bold tracking-tight">{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isProcessing === task.id ? (
                      <div className="flex items-center gap-2 text-indigo-600 text-[9px] font-black">
                        <Loader2 size={12} className="animate-spin" />
                        SYNCING...
                      </div>
                    ) : (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`text-[9px] font-black uppercase px-2 py-1.5 rounded-lg outline-none appearance-none cursor-pointer border-transparent hover:border-slate-300 transition-all ${STATUS_COLORS[task.status]}`}
                      >
                        {Object.values(TaskStatus).map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[60px] bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 tabular-nums">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                      <Calendar size={12} className="text-slate-300" />
                      {new Date(task.plannedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(task)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, task.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">No matches found in Cloud</h3>
              <p className="text-sm text-slate-400">Try adjusting your filters for the v3 registry stream.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
