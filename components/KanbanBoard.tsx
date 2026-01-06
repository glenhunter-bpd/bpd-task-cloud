
import React, { useState } from 'react';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { getProgramColor } from '../constants';
import { Clock, MessageSquare, AlertCircle, Pencil } from 'lucide-react';
import TaskModal from './TaskModal';

interface KanbanBoardProps {
  state: AppState;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const columns = [
    { id: TaskStatus.OPEN, title: 'To Do', color: 'bg-slate-300' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-indigo-500' },
    { id: TaskStatus.COMPLETED, title: 'Completed', color: 'bg-emerald-500' },
    { id: TaskStatus.ON_HOLD, title: 'On Hold', color: 'bg-amber-500' },
  ];

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {isModalOpen && <TaskModal state={state} onClose={handleCloseModal} taskToEdit={editingTask} />}
      
       <header>
          <h2 className="text-2xl font-bold text-slate-800">Status Workflow</h2>
          <p className="text-slate-500">Visualizing operational movement across the task cloud.</p>
        </header>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((col) => (
          <div key={col.id} className="min-w-[320px] flex-1 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">{col.title}</h3>
                <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                  {state.tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {state.tasks
                .filter(t => t.status === col.id)
                .map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handleEdit(task)}
                  >
                    <div className="flex justify-between items-start mb-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getProgramColor(task.program)}`}>
                        {task.program}
                      </span>
                      <div className="flex items-center gap-2">
                        {task.priority === 'High' && (
                          <AlertCircle size={14} className="text-rose-500" />
                        )}
                        <Pencil size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-4 leading-snug group-hover:text-indigo-600 transition-colors">
                      {task.name}
                    </h4>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[8px] font-black border border-indigo-100">
                           {task.assignedTo.substring(0, 2).toUpperCase()}
                         </div>
                         <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span className="text-[10px] font-medium">
                            {new Date(task.plannedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {state.tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Queue Empty</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
