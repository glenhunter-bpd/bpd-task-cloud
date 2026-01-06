
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppState, TaskStatus, TaskPriority, Task } from '../types';
import { db } from '../services/database';

interface TaskModalProps {
  state: AppState;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ state, onClose, taskToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    program: state.programs[0]?.name || '',
    assignedToId: state.users[0]?.id || '',
    priority: TaskPriority.MEDIUM,
    plannedEndDate: new Date().toISOString().split('T')[0],
    status: TaskStatus.OPEN,
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        name: taskToEdit.name,
        description: taskToEdit.description,
        program: taskToEdit.program,
        assignedToId: taskToEdit.assignedToId,
        priority: taskToEdit.priority as TaskPriority,
        plannedEndDate: taskToEdit.plannedEndDate,
        status: taskToEdit.status,
      });
    }
  }, [taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = state.users.find(u => u.id === formData.assignedToId);
    
    const taskPayload = {
      name: formData.name,
      description: formData.description,
      program: formData.program,
      assignedTo: assignedUser?.name || 'Unassigned',
      assignedToId: formData.assignedToId,
      priority: formData.priority,
      plannedEndDate: formData.plannedEndDate,
      status: formData.status,
    };

    if (taskToEdit) {
      db.updateTask(taskToEdit.id, taskPayload);
    } else {
      db.addTask({
        ...taskPayload,
        startDate: new Date().toISOString().split('T')[0],
        actualEndDate: '',
        progress: 0,
        notes: [],
        dependentTasks: []
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {taskToEdit ? 'Edit Global Task' : 'Create Global Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Task Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Redacted Subgrantee Binders"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Grant / Program</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                value={formData.program}
                onChange={e => setFormData({...formData, program: e.target.value})}
              >
                {state.programs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assignee</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                value={formData.assignedToId}
                onChange={e => setFormData({...formData, assignedToId: e.target.value})}
              >
                {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Priority</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
              >
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Due Date</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                value={formData.plannedEndDate}
                onChange={e => setFormData({...formData, plannedEndDate: e.target.value})}
              />
            </div>
          </div>

          {taskToEdit && (
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Task Status</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})}
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
             </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
