import dayjs from 'dayjs';

export default (date: string | number | Date, format = 'DD.MM.YYYY HH:mm:ss'): string => {
  return dayjs(date).format(format);
};
