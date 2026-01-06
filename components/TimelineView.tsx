
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppState, Task, TaskStatus } from '../types';
import { getProgramColor } from '../constants';
import { GitGraph, Calendar, ChevronLeft, ChevronRight, Lock, AlertCircle, Pencil } from 'lucide-react';
import TaskModal from './TaskModal';

interface TimelineViewProps {
  state: AppState;
}

const TimelineView: React.FC<TimelineViewProps> = ({ state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewWindow, setViewWindow] = useState({ start: new Date(2025, 0, 1), end: new Date(2026, 0, 1) });

  const tasks = useMemo(() => {
    return [...state.tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [state.tasks]);

  const DAY_WIDTH = 40;
  const ROW_HEIGHT = 64;

  const dateToX = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = d.getTime() - viewWindow.start.getTime();
    return (diff / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
  };

  const calculateCriticalPath = (task: Task) => {
    const isBlocked = task.dependentTasks.some(id => {
      const dep = state.tasks.find(t => t.id === id);
      return dep && dep.status !== TaskStatus.COMPLETED;
    });
    const isBlocking = state.tasks.some(t => t.dependentTasks.includes(task.id) && t.status !== TaskStatus.COMPLETED);
    return { isBlocked, isBlocking };
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Generate dependency lines
  const dependencyLines = useMemo(() => {
    // Fix: Replaced JSX.Element[] with React.ReactElement[] to resolve "Cannot find namespace 'JSX'" error.
    const lines: React.ReactElement[] = [];
    tasks.forEach((task, index) => {
      task.dependentTasks.forEach(depId => {
        const prerequisite = tasks.find(t => t.id === depId);
        if (prerequisite) {
          const preIndex = tasks.indexOf(prerequisite);
          const startX = dateToX(prerequisite.plannedEndDate);
          const startY = preIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
          const endX = dateToX(task.startDate);
          const endY = index * ROW_HEIGHT + ROW_HEIGHT / 2;

          const color = prerequisite.status === TaskStatus.COMPLETED ? '#10b981' : '#cbd5e1';
          const strokeWidth = 2;

          lines.push(
            <g key={`${task.id}-${depId}`} className="dependency-line group">
              <path
                d={`M ${startX} ${startY} C ${startX + 20} ${startY}, ${endX - 20} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={prerequisite.status === TaskStatus.COMPLETED ? "0" : "4 2"}
                className="transition-all duration-300"
              />
              <circle cx={endX} cy={endY} r="3" fill={color} />
            </g>
          );
        }
      });
    });
    return lines;
  }, [tasks, viewWindow]);

  const months = useMemo(() => {
    const result = [];
    const current = new Date(viewWindow.start);
    while (current < viewWindow.end) {
      result.push({
        name: current.toLocaleString('default', { month: 'short' }).toUpperCase(),
        year: current.getFullYear(),
        x: dateToX(current.toISOString())
      });
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }, [viewWindow]);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      {isModalOpen && <TaskModal state={state} onClose={handleCloseModal} taskToEdit={editingTask} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <GitGraph className="text-indigo-600" />
            Nexus Dependency Timeline
          </h2>
          <p className="text-slate-500 text-sm">Visualizing critical path dominoes across the grant cloud.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
           <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={18} /></button>
           <span className="px-3 text-xs font-black text-slate-700 uppercase tracking-widest">CY 2025 Registry</span>
           <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronRight size={18} /></button>
        </div>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        {/* Timeline Header (Months) */}
        <div className="h-10 border-b border-slate-100 bg-slate-50/50 flex sticky top-0 z-20">
           <div className="w-64 border-r border-slate-100 flex-shrink-0 bg-slate-100/50 flex items-center px-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Task</span>
           </div>
           <div className="flex-1 overflow-hidden relative">
              {months.map(m => (
                <div 
                  key={`${m.name}-${m.year}`} 
                  className="absolute top-0 bottom-0 border-l border-slate-200 flex items-center px-2"
                  style={{ left: m.x }}
                >
                  <span className="text-[9px] font-black text-slate-400 whitespace-nowrap">{m.name} {m.year}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-auto custom-scrollbar relative" ref={containerRef}>
          <div className="flex min-w-max">
             {/* Task Labels Sidebar */}
             <div className="w-64 border-r border-slate-100 flex-shrink-0 bg-white sticky left-0 z-10">
                {tasks.map((task, i) => (
                  <div key={task.id} className="h-[64px] border-b border-slate-50 px-6 py-3 flex flex-col justify-center group bg-white">
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1" onClick={() => handleEdit(task)}>
                      {task.name}
                      <Pencil size={10} className="opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border tracking-tight ${getProgramColor(task.program)}`}>
                        {task.program}
                      </span>
                      {calculateCriticalPath(task).isBlocking && (
                         <div className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                            <Lock size={8} /> Blocking
                         </div>
                      )}
                    </div>
                  </div>
                ))}
             </div>

             {/* Gantt Grid & Bars */}
             <div className="flex-1 relative">
                {/* Visual Grid Lines */}
                {months.map(m => (
                  <div 
                    key={`grid-${m.name}`}
                    className="absolute top-0 bottom-0 border-l border-slate-100/50 pointer-events-none"
                    style={{ left: m.x }}
                  />
                ))}

                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 5 }}>
                  {dependencyLines}
                </svg>

                {/* Task Bars */}
                {tasks.map((task, i) => {
                  const x = dateToX(task.startDate);
                  const endX = dateToX(task.plannedEndDate);
                  const width = Math.max(20, endX - x);
                  const { isBlocked, isBlocking } = calculateCriticalPath(task);
                  
                  return (
                    <div key={`bar-${task.id}`} className="h-[64px] border-b border-slate-50 relative">
                       <div 
                        onClick={() => handleEdit(task)}
                        className={`absolute top-4 h-6 rounded-md shadow-sm border transition-all cursor-pointer group flex items-center px-3 gap-2 overflow-hidden ${
                          task.status === TaskStatus.COMPLETED 
                            ? 'bg-emerald-500 border-emerald-600 text-white opacity-40 hover:opacity-100' 
                            : isBlocked 
                              ? 'bg-slate-200 border-slate-300 text-slate-400' 
                              : isBlocking && task.priority === 'High'
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-indigo-200 scale-105'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                        }`}
                        style={{ left: x, width: width, zIndex: 10 }}
                       >
                         {isBlocked && <Lock size={10} className="flex-shrink-0" />}
                         {isBlocking && !isBlocked && <AlertCircle size={10} className="flex-shrink-0 animate-pulse text-indigo-200" />}
                         <span className="text-[9px] font-black truncate uppercase tracking-widest">{task.name}</span>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Legend / Status Hub */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-indigo-600 rounded-md"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical Blocking Path</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-slate-200 rounded-md"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prerequisite Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 border-2 border-slate-300 border-dashed rounded-md"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dependency Link</span>
              </div>
           </div>
           <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">
              Nexus Pulse Live Sync Active
           </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
