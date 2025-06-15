import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { apiEn, componentsEn, mainEn, pageEn, seoEn } from './en/index'
import { apiRu, componentsRu, mainRu, pageRu, seoRu } from './ru/index'

const resources = {
  en: {
    translation: Object.assign({}, mainEn, seoEn, apiEn, componentsEn, pageEn),
  },
  ru: {
    translation: Object.assign({}, mainRu, seoRu, apiRu, componentsRu, pageRu),
  },
}

i18n.use(initReactI18next).init({
  fallbackLng: 'ru',
  lng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  resources,
})

export default i18n
