import { format } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'

export function formatDate(
  date: string | number | Date,
  formatString = 'dd.MM.yyyy HH:mm',
  lang = 'en',
): string {
  const locale = lang === 'ru' ? ru : enUS
  return format(new Date(date), formatString, { locale })
}
