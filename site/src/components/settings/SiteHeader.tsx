'use client';
import { usePreferences } from './PreferencesProvider';
import { messages } from '@/content/messages';
import { usePathname } from 'next/navigation';
export function SiteHeader() {
  const { theme, locale, setTheme, setLocale } = usePreferences();
  const englishOnly = usePathname() === '/stage';
  const copy = messages[englishOnly ? 'en' : locale];
  return <>
    <a className="skip-link" href="#about">{copy.skip}</a>
    <header className="site-header">
      <a className="brand" href="#top">PERSONAL SPACE</a>
      <div className="preferences">
        {englishOnly ? <span className="language-switch" aria-label="Page language: English">EN</span> : <div className="language-switch" role="group" aria-label={copy.languageLabel}>
          <button aria-label="中文" aria-pressed={locale === 'zh'} onClick={() => setLocale('zh')}>中</button>
          <span aria-hidden="true">/</span>
          <button aria-label="English" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
        </div>}
        <div className="theme-switch" role="group" aria-label={copy.themeLabel}>
          <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>LIGHT</button>
          <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>DARK</button>
        </div>
      </div>
    </header>
  </>;
}
