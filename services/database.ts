
import { Task, Program, User, AppState, TaskStatus } from '../types';

const DB_KEY = 'bpd_cloud_db';
const SYNC_CHANNEL = 'bpd_sync_stream';

class DatabaseService {
  private channel: BroadcastChannel;
  private subscribers: Array<(state: AppState) => void> = [];

  constructor() {
    this.channel = new BroadcastChannel(SYNC_CHANNEL);
    this.channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE') {
        this.notifySubscribers(this.getState());
      }
    };
  }

  private getState(): AppState {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : { tasks: [], programs: [], users: [], currentUser: null };
  }

  private saveState(state: AppState) {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    this.channel.postMessage({ type: 'UPDATE' });
    this.notifySubscribers(state);
  }

  public initialize(initialData: Partial<AppState>) {
    if (!localStorage.getItem(DB_KEY)) {
      const state: AppState = {
        tasks: initialData.tasks || [],
        programs: initialData.programs || [],
        users: initialData.users || [],
        currentUser: initialData.users ? initialData.users[0] : null,
      };
      this.saveState(state);
    }
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
  public updateTask(taskId: string, updates: Partial<Task>) {
    const state = this.getState();
    const tasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    this.saveState({ ...state, tasks });
  }

  public addTask(task: Omit<Task, 'id' | 'updatedAt' | 'updatedBy'>) {
    const state = this.getState();
    const newTask: Task = {
      ...task,
      id: `t-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      updatedBy: state.currentUser?.name || 'system'
    };
    this.saveState({ ...state, tasks: [newTask, ...state.tasks] });
  }

  public deleteTask(taskId: string) {
    const state = this.getState();
    const tasks = state.tasks.filter(t => t.id !== taskId);
    this.saveState({ ...state, tasks });
  }

  // --- Program/Grant Operations ---
  public addProgram(program: Omit<Program, 'id' | 'createdAt' | 'createdBy'>) {
    const state = this.getState();
    const newProgram: Program = {
      ...program,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser?.id || 'system'
    };
    this.saveState({ ...state, programs: [...state.programs, newProgram] });
  }

  public updateProgram(programId: string, updates: Partial<Program>) {
    const state = this.getState();
    const programs = state.programs.map(p => 
      p.id === programId ? { ...p, ...updates } : p
    );
    this.saveState({ ...state, programs });
  }

  public deleteProgram(programId: string) {
    const state = this.getState();
    const programs = state.programs.filter(p => p.id !== programId);
    this.saveState({ ...state, programs });
  }

  // --- User Operations ---
  public addUser(user: Omit<User, 'id'>) {
    const state = this.getState();
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
    };
    this.saveState({ ...state, users: [...state.users, newUser] });
  }

  public updateUser(userId: string, updates: Partial<User>) {
    const state = this.getState();
    const users = state.users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    
    // If we updated the current user, refresh the currentUser object too
    let currentUser = state.currentUser;
    if (currentUser && currentUser.id === userId) {
      currentUser = { ...currentUser, ...updates };
    }

    this.saveState({ ...state, users, currentUser });
  }

  public deleteUser(userId: string) {
    const state = this.getState();
    const users = state.users.filter(u => u.id !== userId);
    this.saveState({ ...state, users });
  }

  public setCurrentUser(userId: string) {
    const state = this.getState();
    const user = state.users.find(u => u.id === userId) || null;
    this.saveState({ ...state, currentUser: user });
  }
}

export const db = new DatabaseService();
