import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en/main.json';
import ru from './ru/main.json';

const resources = {
  en: {
    translation: en
  },
  ru: {
    translation: ru
  }
};

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources
});

export default i18n;
