import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, sub } from 'date-fns';

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

export function getDateRangeFromPeriod(period: PeriodType, customRange?: DateRange): DateRange {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now)
      };
    case 'week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Week starts on Monday
        endDate: endOfWeek(now, { weekStartsOn: 1 })
      };
    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
    case 'year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now)
      };
    case 'custom':
      // If custom range is provided, use it
      if (customRange) {
        return customRange;
      }
      // Default to last 30 days if no custom range specified
      return {
        startDate: sub(now, { days: 30 }),
        endDate: now
      };
    default:
      return {
        startDate: startOfMonth(now), // Default to current month
        endDate: endOfMonth(now)
      };
  }
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numAmount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
