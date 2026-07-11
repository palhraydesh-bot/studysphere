export function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  const week = 1 + Math.round(diff / (7 * 86400000));
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}