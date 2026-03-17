import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fr from './fr.json';
import { Storage } from '../constant';


const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

const initI18n = async () => {
  const savedLang = await Storage.get(Storage.USER_LANGUAGE);

  const lang = savedLang ? JSON.parse(savedLang) : 'en';

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources,
      lng: lang,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export { initI18n };
export default i18n;