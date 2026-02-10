export type RecurrenceType = 'none' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  recurrence: RecurrenceType;
  specificDate?: string; 
  monthReference?: number;
  category: 'planting' | 'maintenance' | 'animals' | 'general';
  createdAt: number;
}

export interface DailyLog {
  id: string;
  log_date: string;
  content: string;
  created_at: string;
}

export type ViewMode = 'dashboard' | 'calendar' | 'tasks';

export const CATEGORY_LABELS: Record<string, string> = {
  planting: 'Plantio & Colheita',
  maintenance: 'Manutenção',
  animals: 'Animais',
  general: 'Geral'
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];