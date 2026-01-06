
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, Program, User, AppState, TaskStatus } from '../types';

/**
 * BPD CLOUD DATABASE SERVICE V4.0-NEXUS
 * 
 * Optimized for Task Dependency Graph management and static deployments.
 */

const getEnv = (key: string): string => {
  const localValue = localStorage.getItem(`BPD_CLOUD_${key}`);
  if (localValue) return localValue.trim();

  const variants = [key, `VITE_${key}`, `REACT_APP_${key}`, `NEXT_PUBLIC_${key}`, `PUBLIC_${key}`];

  for (const variant of variants) {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process?.env?.[variant]) {
       // @ts-ignore
      return window.process.env[variant].trim();
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.[variant]) {
      // @ts-ignore
      return import.meta.env[variant].trim();
    }
  }
  return '';
};

class DatabaseService {
  private client: SupabaseClient | null = null;
  private subscribers: Array<(state: AppState) => void> = [];
  private isConnected: boolean = false;
  private localState: AppState = { tasks: [], programs: [], users: [], currentUser: null };

  constructor() {
    this.reconnect();
  }

  public async reconnect(url?: string, key?: string): Promise<boolean> {
    const finalUrl = url || getEnv('SUPABASE_URL');
    const finalKey = key || getEnv('SUPABASE_ANON_KEY');

    if (finalUrl && finalKey) {
      try {
        this.client = createClient(finalUrl, finalKey);
        const { error } = await this.client.from('tasks').select('id').limit(1);
        
        if (!error) {
           this.setupRealtimeListeners();
           await this.syncWithCloud();
           this.isConnected = true;
        } else {
           this.isConnected = false;
        }
      } catch (e) {
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
    }
    this.notifySubscribers(this.localState);
    return this.isConnected;
  }

  public saveCredentials(url: string, key: string) {
    localStorage.setItem('BPD_CLOUD_SUPABASE_URL', url);
    localStorage.setItem('BPD_CLOUD_SUPABASE_ANON_KEY', key);
    this.reconnect(url, key);
  }

  public clearCredentials() {
    localStorage.removeItem('BPD_CLOUD_SUPABASE_URL');
    localStorage.removeItem('BPD_CLOUD_SUPABASE_ANON_KEY');
    this.isConnected = false;
    this.client = null;
    this.notifySubscribers(this.localState);
    window.location.reload();
  }

  private setupRealtimeListeners() {
    if (!this.client) return;
    this.client
      .channel('bpd-realtime-global')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        this.syncWithCloud();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          this.notifySubscribers({ ...this.localState });
        }
      });
  }

  public async syncWithCloud() {
    if (!this.client) return false;
    
    try {
      const [tasksRes, programsRes, usersRes] = await Promise.all([
        this.client.from('tasks').select('*').order('updated_at', { ascending: false }),
        this.client.from('programs').select('*'),
        this.client.from('users').select('*')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      
      const mappedTasks: Task[] = (tasksRes.data || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        program: t.program,
        assignedTo: t.assigned_to,
        assignedToId: t.assigned_to_id,
        priority: t.priority,
        status: t.status as TaskStatus,
        progress: t.progress,
        plannedEndDate: t.planned_end_date,
        updatedAt: t.updated_at,
        updatedBy: t.updated_by,
        startDate: t.start_date || new Date().toISOString().split('T')[0],
        actualEndDate: t.actual_end_date || '',
        notes: [],
        dependentTasks: t.dependent_tasks || [] // Support for V4 dependency nexus
      }));

      this.localState = {
        ...this.localState,
        tasks: mappedTasks,
        programs: (programsRes.data || []) as Program[],
        users: (usersRes.data || []) as User[],
      };

      this.isConnected = true;
      this.notifySubscribers(this.localState);
      return true;
    } catch (err) {
      this.isConnected = false;
      this.notifySubscribers({ ...this.localState });
      return false;
    }
  }

  public async initialize(initialData: Partial<AppState>): Promise<boolean> {
    this.localState = {
      tasks: initialData.tasks || [],
      programs: initialData.programs || [],
      users: initialData.users || [],
      currentUser: initialData.users ? initialData.users[0] : null
    };
    const cloudSuccess = await this.reconnect();
    this.notifySubscribers(this.localState);
    return cloudSuccess;
  }

  public subscribe(callback: (state: AppState) => void) {
    this.subscribers.push(callback);
    callback(this.localState);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notifySubscribers(state: AppState) {
    this.subscribers.forEach(s => s({ ...state }));
  }

  public async addTask(task: Omit<Task, 'id' | 'updatedAt' | 'updatedBy'>) {
    if (!this.client) return;
    const payload = {
      id: `t-${Date.now()}`,
      name: task.name,
      description: task.description,
      program: task.program,
      assigned_to: task.assignedTo,
      assigned_to_id: task.assignedToId,
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      planned_end_date: task.plannedEndDate,
      dependent_tasks: task.dependentTasks, // Support for V4
      updated_at: new Date().toISOString(),
      updated_by: this.localState.currentUser?.name || 'System'
    };
    await this.client.from('tasks').insert([payload]);
    this.syncWithCloud();
  }

  public async updateTask(taskId: string, updates: Partial<Task>) {
    if (!this.client) return;
    const dbUpdates: any = { ...updates };
    if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.assignedToId) dbUpdates.assigned_to_id = updates.assignedToId;
    if (updates.plannedEndDate) dbUpdates.planned_end_date = updates.plannedEndDate;
    if (updates.dependentTasks) dbUpdates.dependent_tasks = updates.dependentTasks;
    dbUpdates.updated_at = new Date().toISOString();
    dbUpdates.updated_by = this.localState.currentUser?.name || 'System';
    await this.client.from('tasks').update(dbUpdates).eq('id', taskId);
    this.syncWithCloud();
  }

  public async deleteTask(taskId: string) {
    if (!this.client) return;
    await this.client.from('tasks').delete().eq('id', taskId);
    this.syncWithCloud();
  }

  public async addProgram(p: any) { 
    if(this.client) {
      await this.client.from('programs').insert([{...p, id: `p-${Date.now()}`}]); 
      this.syncWithCloud();
    }
  }

  public async updateProgram(programId: string, updates: Partial<Program>) {
    if (this.client) {
      await this.client.from('programs').update(updates).eq('id', programId);
      this.syncWithCloud();
    }
  }

  public async deleteProgram(programId: string) {
    if (this.client) {
      await this.client.from('programs').delete().eq('id', programId);
      this.syncWithCloud();
    }
  }

  public async addUser(u: any) { 
    if(this.client) {
      await this.client.from('users').insert([{...u, id: `u-${Date.now()}`}]); 
      this.syncWithCloud();
    }
  }

  public async updateUser(userId: string, updates: Partial<User>) {
    if (this.client) {
      await this.client.from('users').update(updates).eq('id', userId);
      this.syncWithCloud();
    }
  }

  public async deleteUser(userId: string) {
    if (this.client) {
      await this.client.from('users').delete().eq('id', userId);
      this.syncWithCloud();
    }
  }

  public async setCurrentUser(userId: string) {
    const user = this.localState.users.find(u => u.id === userId) || null;
    this.localState.currentUser = user;
    this.notifySubscribers(this.localState);
  }

  public getStatus(): boolean {
    return this.isConnected;
  }

  public hasCredentials(): boolean {
    return !!(getEnv('SUPABASE_URL') && getEnv('SUPABASE_ANON_KEY'));
  }
}

export const db = new DatabaseService();
