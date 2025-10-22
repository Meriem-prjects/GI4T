export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatReadTime(contentLength: number): string {
  const wordsPerMinute = 200;
  const words = contentLength / 5; // Average 5 characters per word
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

export interface ViewData {
  viewed_at: string;
  document_id: string;
  read_duration: number;
}

export interface GroupedView {
  date: string;
  views: number;
  reads: number;
}

export function groupViewsByDay(views: ViewData[]): GroupedView[] {
  const grouped = views.reduce((acc, view) => {
    const date = new Date(view.viewed_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, views: 0, reads: 0 };
    }
    acc[date].views++;
    if (view.read_duration > 60) {
      acc[date].reads++;
    }
    return acc;
  }, {} as Record<string, GroupedView>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const value = row[h];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function calculateTrend(current: number, previous: number): string {
  if (!previous || previous === 0) return '+0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
