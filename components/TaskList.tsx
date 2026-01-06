
import React, { useState } from 'react';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { STATUS_COLORS, getProgramColor } from '../constants';
import { Search, Filter, Plus, Trash2, Calendar, User as UserIcon, Pencil } from 'lucide-react';
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

  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase()) || 
                          task.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = filterProgram === 'All' || task.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const progress = status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.OPEN ? 0 : 50;
    db.updateTask(taskId, { status, progress });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      db.deleteTask(taskToDelete);
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
        title="Delete Operation?"
        message="This will permanently remove this task from the global BPD cloud for all staff members. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Global Task Registry</h2>
          <p className="text-slate-500">Managing {filteredTasks.length} cross-departmental operations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Register New Task
        </button>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name, description, or staff..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
            >
              <option value="All">All Grants</option>
              {state.programs.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Operation Identity</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Responsibility</th>
                <th className="px-6 py-4">Live Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{task.name}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{task.description || 'System generated task identity.'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${getProgramColor(task.program)}`}>
                      {task.program}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
                        {task.assignedTo.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-full outline-none appearance-none cursor-pointer border-transparent hover:border-slate-300 transition-all ${STATUS_COLORS[task.status]}`}
                    >
                      {Object.values(TaskStatus).map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20 bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${task.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 block tracking-tighter">{task.progress}% SYNCED</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <Calendar size={12} className="text-slate-400" />
                      {new Date(task.plannedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(task)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="Edit task"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, task.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete globally"
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
              <h3 className="font-bold text-slate-800 mb-1">No matches found</h3>
              <p className="text-sm text-slate-400">Try adjusting your filters for the v2 task stream.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
