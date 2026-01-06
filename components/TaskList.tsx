import React, { useState, useMemo } from 'react';
import { Task, AppState, TaskStatus } from '../types';
import { db } from '../services/database';
import { STATUS_COLORS, getProgramColor } from '../constants';
import { Search, Plus, Trash2, Calendar, Pencil, Loader2, AlertCircle, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import TaskModal from './TaskModal';
import ConfirmationModal from './ConfirmationModal';

interface TaskListProps {
  state: AppState;
}

type SortField = 'name' | 'status' | 'program' | 'assignedTo' | 'plannedEndDate';
type SortDirection = 'asc' | 'desc';

const TaskList: React.FC<TaskListProps> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('plannedEndDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let result = state.tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase()) || 
                            task.assignedTo.toLowerCase().includes(search.toLowerCase());
      const matchesProgram = filterProgram === 'All' || task.program === filterProgram;
      return matchesSearch && matchesProgram;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      
      if (sortField === 'plannedEndDate') {
        valA = new Date(a.plannedEndDate).getTime();
        valB = new Date(b.plannedEndDate).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [state.tasks, search, filterProgram, sortField, sortDirection]);

  const getBlockers = (task: Task) => {
    if (!task.dependentTasks || task.dependentTasks.length === 0) return [];
    return task.dependentTasks.map(id => state.tasks.find(t => t.id === id)).filter(t => t && t.status !== TaskStatus.COMPLETED);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (status === TaskStatus.COMPLETED && task) {
       const blockers = getBlockers(task);
       if (blockers.length > 0) {
          alert(`CRITICAL BLOCKER: Cannot complete task until dependencies are closed: ${blockers.map(b => b?.name).join(', ')}`);
          return;
       }
    }
    
    setIsProcessing(taskId);
    const progress = status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.OPEN ? 0 : 50;
    await db.updateTask(taskId, { status, progress });
    setIsProcessing(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-20 group-hover:opacity-50" />;
    return sortDirection === 'asc' ? <ChevronUp size={12} className="text-indigo-600" /> : <ChevronDown size={12} className="text-indigo-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {isModalOpen && <TaskModal state={state} onClose={() => setIsModalOpen(false)} taskToEdit={editingTask} />}
      
      <ConfirmationModal 
        isOpen={!!taskToDelete}
        title="Delete Registry Record?"
        message="This will permanently remove the record from the CNMI BPD Cloud. This action is final."
        onConfirm={async () => {
          if (taskToDelete) {
            await db.deleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Registry Stream</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time task synchronization for CNMI grant programs.</p>
        </div>
        <button 
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Create Task
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search registry entries..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none cursor-pointer text-slate-600 outline-none"
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
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Operation <SortIcon field="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <SortIcon field="status" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('program')}>
                  <div className="flex items-center gap-2">Program <SortIcon field="program" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('assignedTo')}>
                  <div className="flex items-center gap-2">Owner <SortIcon field="assignedTo" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('plannedEndDate')}>
                  <div className="flex items-center gap-2">Target Date <SortIcon field="plannedEndDate" /></div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredTasks.map((task) => {
                const blockers = getBlockers(task);
                const isBlocked = blockers.length > 0;

                return (
                  <tr key={task.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        {isBlocked && <AlertCircle size={14} className="text-amber-500 mt-1 flex-shrink-0" />}
                        <div>
                          <div className="font-semibold text-slate-800 text-sm leading-tight">{task.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-1 font-medium italic">{task.description || 'No additional details provided.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {isProcessing === task.id ? (
                        <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold">
                          <Loader2 size={12} className="animate-spin" />
                          SYNCING
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className={`text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg outline-none appearance-none cursor-pointer border border-transparent hover:border-slate-200 transition-all ${STATUS_COLORS[task.status]}`}
                          >
                            {Object.values(TaskStatus).map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                          {isBlocked && (
                            <span className="text-[9px] font-semibold text-amber-600 tracking-tight">Blocked by peer tasks</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-tight ${getProgramColor(task.program)}`}>
                        {task.program}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-[10px] font-bold">
                          {task.assignedTo.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-600 font-semibold">{task.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(task.plannedEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => setTaskToDelete(task.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAndFilteredTasks.length === 0 && (
            <div className="py-24 text-center">
              <Search size={32} className="text-slate-200 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 mb-1">No matches found</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Try adjusting your filters or checking the spelling of the task or staff member.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;