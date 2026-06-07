import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'yyyy-MM-dd HH:mm') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString('zh-CN')}`;
}

export function getDaysUntil(dateStr: string) {
  const date = parseISO(dateStr.split(' ')[0]);
  return differenceInDays(date, new Date());
}

export function getCategoryName(category: string) {
  const map: Record<string, string> = {
    concert: '演唱会',
    drama: '话剧演出',
    sports: '体育赛事'
  };
  return map[category] || category;
}

export function getCategoryColor(category: string) {
  const map: Record<string, string> = {
    concert: 'from-purple-500 to-pink-500',
    drama: 'from-amber-500 to-orange-500',
    sports: 'from-blue-500 to-cyan-500'
  };
  return map[category] || 'from-gray-500 to-gray-600';
}
