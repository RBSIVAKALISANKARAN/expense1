import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

export function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
}

export function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

export function getEndOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

export function getPreviousMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
}

export function getPreviousMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    stationary: '#3B82F6',
    food: '#F59E0B',
    pg: '#10B981',
    transport: '#6366F1',
    household: '#EC4899',
    friends: '#8B5CF6',
    family: '#EF4444',
    donated: '#14B8A6',
    health: '#F97316',
  };
  return colors[category] || '#6B7280';
}
