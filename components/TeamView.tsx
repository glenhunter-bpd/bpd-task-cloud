
import React, { useState } from 'react';
import { AppState, User } from '../types';
import { db } from '../services/database';
import { UserPlus, Trash2, Mail, Briefcase, Pencil, XCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface TeamViewProps {
  state: AppState;
}

const TeamView: React.FC<TeamViewProps> = ({ state }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Staff', department: 'BEAD' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingId) {
      db.updateUser(editingId, formData);
      setEditingId(null);
    } else {
      db.addUser(formData);
    }
    
    setFormData({ name: '', email: '', role: 'Staff', department: 'BEAD' });
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'Staff', department: 'BEAD' });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      db.deleteUser(userToDelete);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Team Management</h2>
        <p className="text-slate-500">Manage global staff access and departmental roles.</p>
      </header>

      <ConfirmationModal 
        isOpen={!!userToDelete}
        title="Revoke Staff Access?"
        message="This will remove the user from the BPD Global Cloud. They will lose all access to tasks and departmental data immediately."
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {editingId ? <Pencil size={18} className="text-amber-500" /> : <UserPlus size={18} className="text-indigo-600" />}
              {editingId ? 'Edit Member' : 'Add New Member'}
            </h3>
            {editingId && (
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
              <input 
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="j.doe@bpd.gov"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Role</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option>Staff</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dept</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 outline-none"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option>BEAD</option>
                  <option>CPF</option>
                  <option>USDA</option>
                  <option>Operations</option>
                </select>
              </div>
            </div>
            <button className={`w-full py-2.5 text-white font-bold rounded-xl transition-all shadow-lg ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
              {editingId ? 'Update Member' : 'Invite to Cloud'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role / Dept</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors group ${editingId === user.id ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-700">{user.role}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                        <Briefcase size={10} /> {user.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors p-2"
                        title="Edit member"
                      >
                        <Pencil size={18} />
                      </button>
                      {user.id !== state.currentUser?.id && (
                        <button 
                          onClick={() => setUserToDelete(user.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                          title="Delete member"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
