import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/fr';

import en from './en.json';
import fr from './fr.json';
import { Storage } from '../constant';


const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

const capitalizeFirst = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const configureMomentFrenchAbbreviations = () => {
  const frenchLocale = moment.localeData('fr');
  const capitalizedMonthsShort = frenchLocale.monthsShort().map(capitalizeFirst);

  moment.updateLocale('fr', {
    monthsShort: capitalizedMonthsShort,
  });
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

  configureMomentFrenchAbbreviations();
  moment.locale(lang === 'fr' ? 'fr' : 'en');
};

export { initI18n };
export default i18n;