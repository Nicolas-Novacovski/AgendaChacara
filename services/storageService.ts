
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Task } from '../types';

const LOCAL_STORAGE_KEY = 'agenda_chacara_tasks';

const getLocalTasks = (): Task[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

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
      urgency: item.urgency || 'medium',
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
        description: task.description,
        category: task.category,
        recurrence: task.recurrence,
        urgency: task.urgency,
        specific_date: task.specificDate,
        // Correcting property access from camelCase frontend type to snake_case DB column
        month_reference: task.monthReference,
        is_completed: false
      }])
      .select().single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      isCompleted: data.is_completed,
      recurrence: data.recurrence,
      urgency: data.urgency,
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
