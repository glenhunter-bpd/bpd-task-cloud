
import React, { useState, useEffect } from 'react';
import { X, Link2, AlertCircle } from 'lucide-react';
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
    dependentTasks: [] as string[]
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
        dependentTasks: taskToEdit.dependentTasks || []
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
      dependentTasks: formData.dependentTasks
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
        dependentTasks: formData.dependentTasks
      });
    }
    onClose();
  };

  const toggleDependency = (id: string) => {
    setFormData(prev => ({
      ...prev,
      dependentTasks: prev.dependentTasks.includes(id) 
        ? prev.dependentTasks.filter(tid => tid !== id) 
        : [...prev.dependentTasks, id]
    }));
  };

  // Filter tasks to prevent self-dependency and circular issues (simple)
  const availableTasks = state.tasks.filter(t => t.id !== taskToEdit?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Link2 size={20} />
             </div>
             <h2 className="text-xl font-bold text-slate-800">
               {taskToEdit ? 'Edit Operation Parameters' : 'Register New Operation'}
             </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Operation Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Redacted Subgrantee Binders"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Execution Details</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm leading-relaxed"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed project requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Grant Code</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none text-sm font-bold appearance-none cursor-pointer"
                    value={formData.program}
                    onChange={e => setFormData({...formData, program: e.target.value})}
                  >
                    {state.programs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Assigned Staff</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none text-sm font-bold appearance-none cursor-pointer"
                    value={formData.assignedToId}
                    onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                  >
                    {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Priority Class</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none text-sm font-bold appearance-none cursor-pointer"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                  >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Target Date</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none text-sm font-bold"
                    value={formData.plannedEndDate}
                    onChange={e => setFormData({...formData, plannedEndDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* V4 Dependency nexus selector */}
            <div className="flex flex-col h-full">
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center justify-between">
                 <span>Dependency Nexus</span>
                 <span className="text-indigo-600 lowercase bg-indigo-50 px-2 py-0.5 rounded-full font-bold">V4 PRO Feature</span>
               </label>
               <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[250px]">
                  <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-2">
                     <AlertCircle size={14} className="text-amber-500" />
                     <p className="text-[10px] text-slate-500 font-bold leading-tight">Link this task to existing operations that must be completed first.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {availableTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => toggleDependency(task.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          formData.dependentTasks.includes(task.id)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                          : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div>
                          <p className="text-[11px] font-black leading-none mb-1">{task.name}</p>
                          <div className={`text-[9px] font-bold uppercase tracking-widest ${formData.dependentTasks.includes(task.id) ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {task.status.replace('_', ' ')} • {task.program}
                          </div>
                        </div>
                        {formData.dependentTasks.includes(task.id) && <Link2 size={14} />}
                      </div>
                    ))}
                    {availableTasks.length === 0 && (
                      <div className="h-full flex items-center justify-center p-8 text-center">
                         <p className="text-xs text-slate-400 italic">No other operations found in the cloud.</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {taskToEdit && (
             <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-2">
                <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Operational Status</label>
                <select 
                  className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2.5 outline-none text-sm font-bold text-indigo-700 appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})}
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
             </div>
          )}

          <div className="pt-6 flex gap-4 flex-shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              {taskToEdit ? 'Commit Changes' : 'Execute Operation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
