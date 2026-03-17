import React, { createContext, JSX, useEffect, useState } from 'react';

//CONSTANT
import { Storage } from '../constant';

//PACKAGES
import i18n from 'i18next';

type LanguageContextType = {
  children: JSX.Element;
};

export const LaungageContext = createContext<any>(null);

export function LanguageProvider(props: LanguageContextType) {
  const [language, setLang] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await Storage.get(Storage.USER_LANGUAGE);

      const initialLang = storedLang || 'en';
      i18n.changeLanguage(initialLang);
      console.log('initialLang==>', initialLang);
      setLang(initialLang);
    };

    loadLanguage();
  }, []);

  const setLanguage = async (lang: string) => {
    try {
      let data = await Storage.save(Storage.USER_LANGUAGE, JSON.stringify(lang));
      await i18n.changeLanguage(lang);
      setLang(lang);
    } catch (e) {
    }
  };

  return (
    <LaungageContext.Provider
      value={{
        language,
        setLanguage,
      }}>
      {props.children}
    </LaungageContext.Provider>
  );
}
