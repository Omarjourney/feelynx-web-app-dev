import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt from '../../locales/pt.json';

type Locale = 'en' | 'es' | 'pt';

type Messages = Record<string, string>;

const TRANSLATIONS: Record<Locale, Messages> = {
  en,
  es,
  pt,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLocales: Locale[];
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'feelynx:locale';

const detectBrowserLocale = (): Locale => {
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  const languages = navigator.languages ?? [navigator.language];
  const match = languages
    .map((lang) => lang.split('-')[0] as Locale)
    .find((lang): lang is Locale => ['en', 'es', 'pt'].includes(lang));
  return match ?? 'en';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored && ['en', 'es', 'pt'].includes(stored)) {
        return stored;
      }
    } catch {
      // ignore storage errors
    }
    return detectBrowserLocale();
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore storage failures
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
      const fallback = TRANSLATIONS.en[key];
      const value = dictionary[key] ?? fallback ?? key;
      if (!params) return value;
      return Object.entries(params).reduce(
        (acc, [token, replacement]) => acc.replace(new RegExp(`\\{${token}\\}`, 'g'), String(replacement)),
        value,
      );
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: translate,
      availableLocales: ['en', 'es', 'pt'],
    }),
    [locale, setLocale, translate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

