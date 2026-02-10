export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';

export type UrgencyType = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  recurrence: RecurrenceType;
  urgency: UrgencyType;
  specificDate?: string; 
  monthReference?: number;
  category: 'planting' | 'maintenance' | 'animals' | 'general';
  createdAt: number;
}

export type ViewMode = 'dashboard' | 'calendar' | 'tasks';

export const CATEGORY_LABELS: Record<string, string> = {
  planting: 'Plantio & Colheita',
  maintenance: 'Manutenção',
  animals: 'Animais',
  general: 'Geral'
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'Não repetir',
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral (3 em 3 meses)',
  semiannual: 'Semestral (6 em 6 meses)',
  yearly: 'Anual'
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];