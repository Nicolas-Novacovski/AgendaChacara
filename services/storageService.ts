import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Task, DailyLog } from '../types';

const LOCAL_STORAGE_KEY = 'agenda_chacara_tasks';
const LOCAL_LOGS_KEY = 'agenda_chacara_logs';

// --- Auxiliares LocalStorage ---
const getLocalTasks = (): Task[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

const getLocalLogs = (): DailyLog[] => {
  const data = localStorage.getItem(LOCAL_LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalLogs = (logs: DailyLog[]) => {
  localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs));
};

// --- Funções de Tarefas ---
export const loadTasks = async (): Promise<Task[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalTasks();
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      isCompleted: item.is_completed,
      recurrence: item.recurrence,
      specificDate: item.specific_date,
      monthReference: item.month_reference,
      category: item.category,
      createdAt: new Date(item.created_at).getTime()
    }));
  } catch (err) {
    console.error('Erro ao carregar do Supabase, usando local:', err);
    return getLocalTasks();
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>): Promise<Task | null> => {
  const newTaskBase = { ...task, isCompleted: false, createdAt: Date.now() };

  if (!isSupabaseConfigured || !supabase) {
    const localTasks = getLocalTasks();
    const newTask: Task = { ...newTaskBase, id: crypto.randomUUID() };
    saveLocalTasks([newTask, ...localTasks]);
    return newTask;
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: task.title,
        category: task.category,
        recurrence: task.recurrence,
        specific_date: task.specificDate,
        month_reference: task.monthReference,
        is_completed: false
      }])
      .select().single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      isCompleted: data.is_completed,
      recurrence: data.recurrence,
      specificDate: data.specific_date,
      monthReference: data.month_reference,
      category: data.category,
      createdAt: new Date(data.created_at).getTime()
    };
  } catch (err) {
    console.error('Erro ao criar no Supabase:', err);
    return null;
  }
};

export const updateTaskStatus = async (id: string, isCompleted: boolean): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    const localTasks = getLocalTasks();
    saveLocalTasks(localTasks.map(t => t.id === id ? { ...t, isCompleted } : t));
    return;
  }
  await supabase.from('tasks').update({ is_completed: isCompleted }).eq('id', id);
};

export const deleteTaskFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    const localTasks = getLocalTasks();
    saveLocalTasks(localTasks.filter(t => t.id !== id));
    return;
  }
  await supabase.from('tasks').delete().eq('id', id);
};

// --- Funções de Diário (Logs) ---
export const saveDailyLog = async (content: string): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  if (!isSupabaseConfigured || !supabase) {
    const logs = getLocalLogs();
    const newLog: DailyLog = { 
      id: crypto.randomUUID(), 
      log_date: today, 
      content, 
      created_at: new Date().toISOString() 
    };
    saveLocalLogs([newLog, ...logs]);
    return;
  }

  try {
    await supabase.from('daily_logs').insert([{ content, log_date: today }]);
  } catch (err) {
    console.error('Erro ao salvar log:', err);
  }
};

export const getLatestLogs = async (limit = 5): Promise<DailyLog[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalLogs().slice(0, limit);
  }

  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
};