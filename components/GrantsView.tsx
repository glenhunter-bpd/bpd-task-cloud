
import React, { useState, useMemo } from 'react';
import { AppState, Program, TaskStatus } from '../types';
import { db } from '../services/database';
import { Trash2, Landmark, Pencil, XCircle, Flame, Zap, AlertCircle } from 'lucide-react';
import { getProgramColor } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface GrantsViewProps {
  state: AppState;
}

const GrantsView: React.FC<GrantsViewProps> = ({ state }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: 'indigo' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  const programHeatData = useMemo(() => {
    const PROXIMITY_48H = 2 * 24 * 60 * 60 * 1000;
    const PROXIMITY_7D = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();

    return state.programs.map(p => {
      const activeTasks = state.tasks.filter(t => t.program === p.name && t.status !== TaskStatus.COMPLETED);
      let score = 0;

      activeTasks.forEach(t => {
        let weight = t.priority === 'Critical' ? 20 : t.priority === 'High' ? 10 : t.priority === 'Medium' ? 5 : 2;
        const due = new Date(t.plannedEndDate);
        const diff = due.getTime() - now.getTime();

        let multiplier = 1;
        if (diff < 0) multiplier = 3; 
        else if (diff < PROXIMITY_48H) multiplier = 2.5;
        else if (diff < PROXIMITY_7D) multiplier = 1.5;

        score += weight * multiplier;
      });

      return {
        ...p,
        heatScore: score,
        taskCount: activeTasks.length,
        criticalTasks: activeTasks.filter(t => t.priority === 'Critical').length,
        upcomingTasks: activeTasks.filter(t => {
           const diff = new Date(t.plannedEndDate).getTime() - now.getTime();
           return diff > 0 && diff < PROXIMITY_48H;
        }).length
      };
    }).sort((a, b) => b.heatScore - a.heatScore);
  }, [state.tasks, state.programs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      db.updateProgram(editingId, formData);
      setEditingId(null);
    } else {
      db.addProgram(formData);
    }
    
    setFormData({ name: '', description: '', color: 'indigo' });
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setFormData({
      name: program.name,
      description: program.description,
      color: program.color
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', color: 'indigo' });
  };

  const confirmDelete = () => {
    if (programToDelete) {
      db.deleteProgram(programToDelete);
      setProgramToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg">
                <Flame size={18} />
             </div>
             <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Operational Heat Registry v4.6</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Grants & Threshold Monitoring</h2>
          <p className="text-slate-500 font-medium">Visualizing pressure points across the federal grant portfolio.</p>
        </div>
      </header>

      <ConfirmationModal 
        isOpen={!!programToDelete}
        title="Delete Funding Program?"
        message="Deleting this program will affect all associated tasks globally. Ensure no active operations are dependent on this taxonomy before proceeding."
        onConfirm={confirmDelete}
        onCancel={() => setProgramToDelete(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                {editingId ? <Pencil size={18} className="text-amber-500" /> : <Landmark size={18} className="text-indigo-600" />}
                {editingId ? 'Update Registry' : 'Register Grant'}
              </h3>
              {editingId && (
                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={18} />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Grant Acronym</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. BEAD-V2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Official program scope..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Brand Identifier</label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {['indigo', 'emerald', 'rose', 'amber', 'sky', 'violet'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${formData.color === c ? 'border-slate-800 scale-110 shadow-lg' : 'border-white shadow-sm'}`}
                      style={{ backgroundColor: c === 'indigo' ? '#6366f1' : c === 'emerald' ? '#10b981' : c === 'rose' ? '#f43f5e' : c === 'amber' ? '#f59e0b' : c === 'sky' ? '#0ea5e9' : '#8b5cf6' }}
                    />
                  ))}
                </div>
              </div>
              <button className={`w-full py-4 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                {editingId ? 'Update Nexus' : 'Link Program'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {programHeatData.map(p => {
            const isInferno = p.heatScore >= 60;
            const isHigh = p.heatScore >= 30 && p.heatScore < 60;
            
            return (
              <div 
                key={p.id} 
                className={`bg-white p-8 rounded-[2rem] border transition-all relative flex flex-col justify-between group overflow-hidden ${
                  isInferno 
                    ? 'border-rose-400 ring-4 ring-rose-500/10 shadow-2xl shadow-rose-100' 
                    : isHigh 
                      ? 'border-amber-400 shadow-xl shadow-amber-50' 
                      : 'border-slate-200 shadow-sm'
                }`}
              >
                <div className={`absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 ${isInferno ? 'text-rose-600' : 'text-slate-400'}`}>
                  <Flame size={180} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex flex-col gap-1">
                      <div className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isInferno ? 'text-rose-600' : 'text-slate-400'}`}>
                        {isInferno && <Zap size={10} className="fill-rose-600 animate-pulse" />}
                        {p.name} Grant Node
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 leading-tight">{p.name} Operations</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => setProgramToDelete(p.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed max-w-[90%]">
                    {p.description || "Active grant program handling multiple infrastructure deployment tasks."}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className={`text-xl font-black ${isInferno ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-slate-800'}`}>
                        {Math.round(p.heatScore)}
                      </div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Heat Score</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="text-xl font-black text-slate-800">
                        {p.taskCount}
                      </div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Tasks</div>
                    </div>
                    <div className={`rounded-2xl p-4 border ${p.criticalTasks > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`text-xl font-black ${p.criticalTasks > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {p.criticalTasks}
                      </div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Criticals</div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thermal Risk Profile</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isInferno ? 'text-rose-600' : 'text-emerald-500'}`}>
                      {isInferno ? 'High Alert: Reallocate Resources' : isHigh ? 'Warning: Concentration' : 'Nominal Threshold'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isInferno ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, p.heatScore)}%` }}
                    />
                  </div>
                  {p.upcomingTasks > 0 && (
                     <div className="mt-4 flex items-center gap-2 text-rose-500">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{p.upcomingTasks} tasks due within 48h</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GrantsView;
