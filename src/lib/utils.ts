import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy년 MM월 dd일', { locale: ko });
} 