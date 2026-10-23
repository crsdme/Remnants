import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { apiEn, componentsEn, mainEn, pageEn, seoEn } from './en/index'
import { apiRu, componentsRu, mainRu, pageRu, seoRu } from './ru/index'
import { apiUa, componentsUa, mainUa, pageUa, seoUa } from './ua/index'

const resources = {
  en: {
    translation: Object.assign({}, mainEn, seoEn, apiEn, componentsEn, pageEn),
  },
  ru: {
    translation: Object.assign({}, mainRu, seoRu, apiRu, componentsRu, pageRu),
  },
  ua: {
    translation: Object.assign({}, mainUa, seoUa, apiUa, componentsUa, pageUa),
  },
}

void i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources,
})

export default i18n
