
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, Program, User, AppState, TaskStatus } from '../types';

/**
 * BPD CLOUD DATABASE SERVICE V3.2-DIAGNOSTIC
 * 
 * Provides robust connection handling and detailed logging for deployment debugging.
 */

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();

class DatabaseService {
  private client: SupabaseClient | null = null;
  private subscribers: Array<(state: AppState) => void> = [];
  private isConnected: boolean = false;
  private localState: AppState = { tasks: [], programs: [], users: [], currentUser: null };

  constructor() {
    if (SUPABASE_URL && SUPABASE_KEY) {
      console.log("Initializing Supabase Client...");
      this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
      this.setupRealtimeListeners();
    } else {
      console.warn("SUPABASE_URL or KEY missing from Environment Variables. Running in Local Mock Mode.");
    }
  }

  private setupRealtimeListeners() {
    if (!this.client) return;

    this.client
      .channel('bpd-realtime-global')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Real-time sync triggered by cloud change in:', payload.table);
        this.syncWithCloud();
      })
      .subscribe((status) => {
        console.log('Supabase Realtime Status:', status);
      });
  }

  private async syncWithCloud() {
    if (!this.client) return;
    
    try {
      const [tasksRes, programsRes, usersRes] = await Promise.all([
        this.client.from('tasks').select('*').order('updated_at', { ascending: false }),
        this.client.from('programs').select('*'),
        this.client.from('users').select('*')
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (programsRes.error) throw programsRes.error;
      if (usersRes.error) throw usersRes.error;

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
        dependentTasks: []
      }));

      this.localState = {
        ...this.localState,
        tasks: mappedTasks,
        programs: programsRes.data as Program[],
        users: usersRes.data as User[],
      };

      this.notifySubscribers(this.localState);
      this.isConnected = true;
    } catch (err) {
      console.error('Cloud Sync Error (Check if tables exist in Supabase!):', err);
      this.isConnected = false;
    }
  }

  public async initialize(initialData: Partial<AppState>): Promise<boolean> {
    if (!this.client) {
      this.localState = {
        tasks: initialData.tasks || [],
        programs: initialData.programs || [],
        users: initialData.users || [],
        currentUser: initialData.users ? initialData.users[0] : null
      };
      this.notifySubscribers(this.localState);
      return false;
    }

    await this.syncWithCloud();
    
    if (this.localState.users.length > 0 && !this.localState.currentUser) {
      this.localState.currentUser = this.localState.users[0];
      this.notifySubscribers(this.localState);
    }

    return this.isConnected;
  }

  public subscribe(callback: (state: AppState) => void) {
    this.subscribers.push(callback);
    callback(this.localState);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notifySubscribers(state: AppState) {
    this.subscribers.forEach(s => s(state));
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
      updated_at: new Date().toISOString(),
      updated_by: this.localState.currentUser?.name || 'System'
    };
    await this.client.from('tasks').insert([payload]);
    // Note: We don't need to manually sync, the Realtime listener handles it!
  }

  public async updateTask(taskId: string, updates: Partial<Task>) {
    if (!this.client) return;
    const dbUpdates: any = { ...updates };
    if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.assignedToId) dbUpdates.assigned_to_id = updates.assignedToId;
    if (updates.plannedEndDate) dbUpdates.planned_end_date = updates.plannedEndDate;
    dbUpdates.updated_at = new Date().toISOString();
    dbUpdates.updated_by = this.localState.currentUser?.name || 'System';
    await this.client.from('tasks').update(dbUpdates).eq('id', taskId);
  }

  public async deleteTask(taskId: string) {
    if (!this.client) return;
    await this.client.from('tasks').delete().eq('id', taskId);
  }

  public async addProgram(program: Omit<Program, 'id' | 'createdAt' | 'createdBy'>) {
    if (!this.client) return;
    const payload = { ...program, id: `p-${Date.now()}` };
    await this.client.from('programs').insert([payload]);
  }

  public async updateProgram(programId: string, updates: Partial<Program>) {
    if (!this.client) return;
    await this.client.from('programs').update(updates).eq('id', programId);
  }

  public async deleteProgram(programId: string) {
    if (!this.client) return;
    await this.client.from('programs').delete().eq('id', programId);
  }

  public async addUser(user: Omit<User, 'id'>) {
    if (!this.client) return;
    const payload = { ...user, id: `u-${Date.now()}` };
    await this.client.from('users').insert([payload]);
  }

  public async updateUser(userId: string, updates: Partial<User>) {
    if (!this.client) return;
    await this.client.from('users').update(updates).eq('id', userId);
  }

  public async deleteUser(userId: string) {
    if (!this.client) return;
    await this.client.from('users').delete().eq('id', userId);
  }

  public async setCurrentUser(userId: string) {
    const user = this.localState.users.find(u => u.id === userId) || null;
    this.localState.currentUser = user;
    this.notifySubscribers(this.localState);
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const db = new DatabaseService();
