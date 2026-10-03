'use client';
import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { getSnapshot, serverSnapshot, subscribe, setTheme, setLocale, type Theme, type Locale } from '@/lib/preferences';
import { messages } from '@/content/messages';
type Preferences = { theme: Theme; locale: Locale; setTheme: typeof setTheme; setLocale: typeof setLocale };
const Context = createContext<Preferences | null>(null);
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const [theme, locale] = snapshot.split('|') as [Theme, Locale];
  useEffect(() => { document.title = messages[locale].title; }, [locale]);
  return <Context.Provider value={{ theme, locale, setTheme, setLocale }}>{children}</Context.Provider>;
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error('PreferencesProvider is required');
  return value;
}
