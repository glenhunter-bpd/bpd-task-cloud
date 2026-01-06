
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, Program, User, AppState, TaskStatus } from '../types';

/**
 * BPD CLOUD DATABASE SERVICE V3.6-ULTRA
 * 
 * Optimized for static deployments. Specifically handles the lack of 
 * process.env in browser environments by providing a manual bridge.
 */

const getEnv = (key: string): string => {
  // 1. Check localStorage first (User-provided manual override)
  const localValue = localStorage.getItem(`BPD_CLOUD_${key}`);
  if (localValue) return localValue.trim();

  // 2. Check multiple common patterns for client-side environment variables
  // Vite, Next.js, and standard process.env patterns included
  const variants = [
    key,
    `VITE_${key}`,
    `REACT_APP_${key}`,
    `NEXT_PUBLIC_${key}`,
    `PUBLIC_${key}`
  ];

  // Try to find the value in various global env objects
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

  /**
   * Attempts to establish a connection to the Supabase Cloud.
   * Can be called with explicit credentials or will search env/storage.
   */
  // Added return type Promise<boolean> to fix type mismatch in initialize()
  public async reconnect(url?: string, key?: string): Promise<boolean> {
    const finalUrl = url || getEnv('SUPABASE_URL');
    const finalKey = key || getEnv('SUPABASE_ANON_KEY');

    if (finalUrl && finalKey) {
      console.log("%c BPD Cloud: Initiating Handshake...", "color: #6366f1; font-weight: bold;");
      try {
        this.client = createClient(finalUrl, finalKey);
        
        // Immediate test fetch to verify credentials
        const { error } = await this.client.from('tasks').select('id').limit(1);
        
        if (error) {
           console.error("BPD Cloud: Credential validation failed", error);
           this.isConnected = false;
        } else {
           console.log("%c BPD Cloud: Connection Verified!", "color: #10b981; font-weight: bold;");
           this.setupRealtimeListeners();
           await this.syncWithCloud();
           this.isConnected = true;
        }
      } catch (e) {
        console.error("BPD Cloud: Connection error", e);
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
      console.warn("BPD Cloud: Credentials missing. Use Settings to link database.");
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
        dependentTasks: []
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
      console.error('Cloud Sync Failed:', err);
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
    
    // Fixed: Now reconnect() returns a Promise<boolean>, so cloudSuccess is correctly typed.
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
