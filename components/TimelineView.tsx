
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppState, Task, TaskStatus } from '../types';
import { getProgramColor } from '../constants';
import { GitGraph, Calendar, ChevronLeft, ChevronRight, Lock, AlertCircle, Pencil, Target } from 'lucide-react';
import TaskModal from './TaskModal';

interface TimelineViewProps {
  state: AppState;
}

const TimelineView: React.FC<TimelineViewProps> = ({ state }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set window to current year
  const [viewWindow] = useState({ 
    start: new Date(new Date().getFullYear(), 0, 1), 
    end: new Date(new Date().getFullYear(), 11, 31) 
  });

  const tasks = useMemo(() => {
    return [...state.tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [state.tasks]);

  const DAY_WIDTH = 32; // Optimized for 1080p+ displays
  const ROW_HEIGHT = 64;
  const today = new Date();

  const dateToX = (dateStr: string) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const diff = d.getTime() - viewWindow.start.getTime();
    return Math.floor((diff / (1000 * 60 * 60 * 24)) * DAY_WIDTH);
  };

  const totalDays = Math.ceil((viewWindow.end.getTime() - viewWindow.start.getTime()) / (1000 * 60 * 60 * 24));
  const timelineTotalWidth = totalDays * DAY_WIDTH;

  const calculateCriticalPath = (task: Task) => {
    const isBlocked = (task.dependentTasks || []).some(id => {
      const dep = state.tasks.find(t => t.id === id);
      return dep && dep.status !== TaskStatus.COMPLETED;
    });
    const isBlocking = state.tasks.some(t => (t.dependentTasks || []).includes(task.id) && t.status !== TaskStatus.COMPLETED);
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

  // Center timeline on "Today" on mount
  useEffect(() => {
    if (containerRef.current) {
      const todayX = dateToX(today.toISOString().split('T')[0]);
      containerRef.current.scrollLeft = todayX - 400;
    }
  }, []);

  const dependencyLines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    tasks.forEach((task, index) => {
      (task.dependentTasks || []).forEach(depId => {
        const prerequisite = tasks.find(t => t.id === depId);
        if (prerequisite) {
          const preIndex = tasks.indexOf(prerequisite);
          
          // Coordinate calculation based on task bar positions
          const startX = dateToX(prerequisite.plannedEndDate);
          const startY = (preIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2);
          const endX = dateToX(task.startDate);
          const endY = (index * ROW_HEIGHT) + (ROW_HEIGHT / 2);

          const isPrereqMet = prerequisite.status === TaskStatus.COMPLETED;
          const color = isPrereqMet ? '#10b981' : '#94a3b8';
          const opacity = isPrereqMet ? '0.6' : '0.3';

          lines.push(
            <g key={`${task.id}-${depId}`} className="dependency-line">
              <path
                d={`M ${startX} ${startY} C ${startX + 40} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeOpacity={opacity}
                strokeDasharray={isPrereqMet ? "0" : "5 3"}
                className="transition-all duration-500"
              />
              <circle cx={startX} cy={startY} r="3" fill={color} fillOpacity={opacity} />
              <circle cx={endX} cy={endY} r="3" fill={color} fillOpacity={opacity} />
            </g>
          );
        }
      });
    });
    return lines;
  }, [tasks, timelineTotalWidth]);

  const months = useMemo(() => {
    const result = [];
    const current = new Date(viewWindow.start);
    while (current < viewWindow.end) {
      result.push({
        name: current.toLocaleString('default', { month: 'short' }).toUpperCase(),
        year: current.getFullYear(),
        x: dateToX(current.toISOString().split('T')[0])
      });
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }, [viewWindow]);

  const todayX = dateToX(today.toISOString().split('T')[0]);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
      {isModalOpen && <TaskModal state={state} onClose={handleCloseModal} taskToEdit={editingTask} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <GitGraph className="text-indigo-600" />
            Nexus Dependency Graph
          </h2>
          <p className="text-slate-500 text-sm font-medium">Visualizing critical path dominoes across the grant cloud.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => {
                  if (containerRef.current) containerRef.current.scrollLeft = todayX - 400;
                }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Target size={14} className="text-indigo-600" />
                Go to Today
              </button>
           </div>
        </div>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col relative">
        {/* Timeline Header (Months) */}
        <div className="h-10 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm flex sticky top-0 z-30">
           <div className="w-64 border-r border-slate-200 flex-shrink-0 bg-slate-100/50 flex items-center px-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Registry Task</span>
           </div>
           <div className="flex-1 overflow-hidden relative">
              <div 
                className="absolute inset-0 flex"
                style={{ width: timelineTotalWidth }}
              >
                {months.map(m => (
                  <div 
                    key={`${m.name}-${m.year}`} 
                    className="absolute top-0 bottom-0 border-l border-slate-200 flex items-center px-3"
                    style={{ left: m.x }}
                  >
                    <span className="text-[9px] font-black text-slate-400 whitespace-nowrap">{m.name} {m.year}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-auto custom-scrollbar relative bg-slate-50/20" ref={containerRef}>
          <div className="flex min-w-max min-h-full">
             {/* Labels Sidebar */}
             <div className="w-64 border-r border-slate-200 flex-shrink-0 bg-white sticky left-0 z-20 shadow-lg shadow-slate-100">
                {tasks.map((task) => (
                  <div key={task.id} className="h-[64px] border-b border-slate-50 px-6 py-3 flex flex-col justify-center group bg-white hover:bg-slate-50 transition-colors">
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-2" onClick={() => handleEdit(task)}>
                      {task.name}
                      <Pencil size={10} className="opacity-0 group-hover:opacity-100 text-slate-400" />
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
                {tasks.length === 0 && (
                   <div className="p-10 text-center text-slate-400 text-xs font-medium">No registry tasks.</div>
                )}
             </div>

             {/* Gantt Content Area */}
             <div className="relative" style={{ width: timelineTotalWidth }}>
                {/* Visual Grid Lines */}
                {months.map(m => (
                  <div 
                    key={`grid-${m.name}-${m.year}`}
                    className="absolute top-0 bottom-0 border-l border-slate-100 pointer-events-none"
                    style={{ left: m.x }}
                  />
                ))}

                {/* Today Line */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-indigo-500 z-10 pointer-events-none"
                  style={{ left: todayX }}
                >
                  <div className="bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-b-md absolute top-0 -translate-x-1/2 uppercase">Today</div>
                </div>

                {/* SVG Connections Layer */}
                <svg 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ zIndex: 5, width: timelineTotalWidth, height: tasks.length * ROW_HEIGHT }}
                >
                  {dependencyLines}
                </svg>

                {/* Task Bars */}
                {tasks.map((task, i) => {
                  const x = dateToX(task.startDate);
                  const endX = dateToX(task.plannedEndDate);
                  const width = Math.max(48, endX - x);
                  const { isBlocked, isBlocking } = calculateCriticalPath(task);
                  
                  return (
                    <div key={`bar-${task.id}`} className="h-[64px] border-b border-slate-50 relative group">
                       <div 
                        onClick={() => handleEdit(task)}
                        className={`absolute top-4 h-8 rounded-lg shadow-sm border transition-all cursor-pointer flex items-center px-3 gap-2 overflow-hidden ${
                          task.status === TaskStatus.COMPLETED 
                            ? 'bg-emerald-500 border-emerald-600 text-white opacity-40 hover:opacity-100' 
                            : isBlocked 
                              ? 'bg-slate-200 border-slate-300 text-slate-500 italic' 
                              : isBlocking && task.priority === 'High'
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-indigo-300 scale-[1.02] z-10'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-md'
                        }`}
                        style={{ left: x, width: width }}
                       >
                         {isBlocked && <Lock size={12} className="flex-shrink-0" />}
                         {isBlocking && !isBlocked && <AlertCircle size={12} className="flex-shrink-0 animate-pulse text-indigo-300" />}
                         <div className="flex flex-col min-w-0">
                           <span className="text-[10px] font-bold truncate uppercase tracking-wider">{task.name}</span>
                           <span className="text-[8px] opacity-60 font-medium truncate">{task.progress}% Complete</span>
                         </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Legend / Status Hub */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
           <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-indigo-600 rounded-md shadow-sm shadow-indigo-200"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical Path Blocker</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-slate-200 rounded-md border border-slate-300"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prerequisite Pending</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-4 h-0 border-t-2 border-slate-400 border-dashed"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dependency Link</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-emerald-500 rounded-md opacity-40"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Archived/Complete</span>
              </div>
           </div>
           <div className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] animate-pulse bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              Nexus Sync Engine v4.2.0 Active
           </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
