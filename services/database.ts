
import { Task, Program, User, AppState, TaskStatus } from '../types';

/**
 * BPD CLOUD DATABASE SERVICE V3 (REALTIME PRO)
 * 
 * To connect to a real Supabase or Firebase instance:
 * 1. Replace the inner logic of these methods with supabase.from('tasks').select('*') etc.
 * 2. Use the provided environment variables for credentials.
 */

const DB_KEY = 'bpd_cloud_db_v3';
const SYNC_CHANNEL = 'bpd_v3_realtime_stream';

class DatabaseService {
  private channel: BroadcastChannel;
  private subscribers: Array<(state: AppState) => void> = [];
  private isConnected: boolean = false;

  constructor() {
    this.channel = new BroadcastChannel(SYNC_CHANNEL);
    this.channel.onmessage = (event) => {
      if (event.data.type === 'CLOUD_SYNC') {
        console.debug('V3 Realtime Update Received');
        this.notifySubscribers(this.getState());
      }
    };
  }

  // Simulated network latency
  private async networkDelay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  private getState(): AppState {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : { tasks: [], programs: [], users: [], currentUser: null };
  }

  private async saveState(state: AppState) {
    await this.networkDelay(); // Simulate Cloud write
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    this.channel.postMessage({ type: 'CLOUD_SYNC', timestamp: Date.now() });
    this.notifySubscribers(state);
  }

  public async initialize(initialData: Partial<AppState>): Promise<boolean> {
    this.isConnected = false;
    await this.networkDelay();
    
    if (!localStorage.getItem(DB_KEY)) {
      const state: AppState = {
        tasks: initialData.tasks || [],
        programs: initialData.programs || [],
        users: initialData.users || [],
        currentUser: initialData.users ? initialData.users[0] : null,
      };
      await this.saveState(state);
    }
    
    this.isConnected = true;
    return true;
  }

  public subscribe(callback: (state: AppState) => void) {
    this.subscribers.push(callback);
    callback(this.getState());
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notifySubscribers(state: AppState) {
    this.subscribers.forEach(s => s(state));
  }

  // --- Task Operations ---
  public async updateTask(taskId: string, updates: Partial<Task>) {
    const state = this.getState();
    const tasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    await this.saveState({ ...state, tasks });
  }

  public async addTask(task: Omit<Task, 'id' | 'updatedAt' | 'updatedBy'>) {
    const state = this.getState();
    const newTask: Task = {
      ...task,
      id: `t-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      updatedBy: state.currentUser?.name || 'system'
    };
    await this.saveState({ ...state, tasks: [newTask, ...state.tasks] });
  }

  public async deleteTask(taskId: string) {
    const state = this.getState();
    const tasks = state.tasks.filter(t => t.id !== taskId);
    await this.saveState({ ...state, tasks });
  }

  // --- Program/Grant Operations ---
  public async addProgram(program: Omit<Program, 'id' | 'createdAt' | 'createdBy'>) {
    const state = this.getState();
    const newProgram: Program = {
      ...program,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser?.id || 'system'
    };
    await this.saveState({ ...state, programs: [...state.programs, newProgram] });
  }

  public async updateProgram(programId: string, updates: Partial<Program>) {
    const state = this.getState();
    const programs = state.programs.map(p => 
      p.id === programId ? { ...p, ...updates } : p
    );
    await this.saveState({ ...state, programs });
  }

  public async deleteProgram(programId: string) {
    const state = this.getState();
    const programs = state.programs.filter(p => p.id !== programId);
    await this.saveState({ ...state, programs });
  }

  // --- User Operations ---
  public async addUser(user: Omit<User, 'id'>) {
    const state = this.getState();
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
    };
    await this.saveState({ ...state, users: [...state.users, newUser] });
  }

  public async updateUser(userId: string, updates: Partial<User>) {
    const state = this.getState();
    const users = state.users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    
    let currentUser = state.currentUser;
    if (currentUser && currentUser.id === userId) {
      currentUser = { ...currentUser, ...updates };
    }

    await this.saveState({ ...state, users, currentUser });
  }

  public async deleteUser(userId: string) {
    const state = this.getState();
    const users = state.users.filter(u => u.id !== userId);
    await this.saveState({ ...state, users });
  }

  public async setCurrentUser(userId: string) {
    const state = this.getState();
    const user = state.users.find(u => u.id === userId) || null;
    await this.saveState({ ...state, currentUser: user });
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const db = new DatabaseService();
