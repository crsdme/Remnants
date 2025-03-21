import { enUS, ru } from 'date-fns/locale';
import { format } from 'date-fns';

export default (
  date: string | number | Date,
  formatString = 'MMMM dd, yyyy HH:mm:ss',
  lang = 'en'
): string => {
  const locale = lang === 'ru' ? ru : enUS;
  return format(new Date(date), formatString, { locale });
};
