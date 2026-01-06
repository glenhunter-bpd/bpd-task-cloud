
import React, { useState } from 'react';
import { AppState, Program } from '../types';
import { db } from '../services/database';
import { Plus, Trash2, Landmark, Tag, Pencil, XCircle } from 'lucide-react';
import { PROGRAM_COLORS } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface GrantsViewProps {
  state: AppState;
}

const GrantsView: React.FC<GrantsViewProps> = ({ state }) => {
  const [formData, setFormData] = useState({ name: '', description: '', color: 'indigo' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Grants & Programs</h2>
        <p className="text-slate-500">Categorize tasks by funding source or policy program.</p>
      </header>

      <ConfirmationModal 
        isOpen={!!programToDelete}
        title="Delete Funding Program?"
        message="Deleting this program will affect all associated tasks globally. Ensure no active operations are dependent on this taxonomy before proceeding."
        onConfirm={confirmDelete}
        onCancel={() => setProgramToDelete(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {editingId ? <Pencil size={18} className="text-amber-500" /> : <Plus size={18} className="text-indigo-600" />}
              {editingId ? 'Update Program' : 'Register Grant'}
            </h3>
            {editingId && (
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Grant Acronym</label>
              <input 
                required
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. BEAD-V2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Description</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none resize-none"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Program details..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Brand Color</label>
              <div className="flex gap-2">
                {['indigo', 'emerald', 'rose', 'amber', 'sky', 'violet'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({...formData, color: c})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c === 'indigo' ? '#6366f1' : c === 'emerald' ? '#10b981' : c === 'rose' ? '#f43f5e' : c === 'amber' ? '#f59e0b' : c === 'sky' ? '#0ea5e9' : '#8b5cf6' }}
                  />
                ))}
              </div>
            </div>
            <button className={`w-full py-2.5 text-white font-bold rounded-xl transition-all ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {editingId ? 'Save Changes' : 'Save Program'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.programs.map(p => (
            <div key={p.id} className={`bg-white p-5 rounded-2xl border transition-all shadow-sm flex flex-col justify-between group ${editingId === p.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${PROGRAM_COLORS[p.name] || 'bg-slate-100 text-slate-600'}`}>
                    {p.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="text-slate-200 hover:text-indigo-600 transition-colors"
                      title="Edit program"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => setProgramToDelete(p.id)}
                      className="text-slate-200 hover:text-rose-500 transition-colors"
                      title="Delete program"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{p.name} Program</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Landmark size={12} /> {state.tasks.filter(t => t.program === p.name).length} Tasks</span>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrantsView;
