export type Theme = 'light' | 'dark';
export type Locale = 'zh' | 'en';
const eventName = 'sherry-preferences';
export const serverSnapshot = () => 'light|zh';
export function getSnapshot() {
  const root = document.documentElement;
  return `${root.dataset.theme === 'dark' ? 'dark' : 'light'}|${root.lang === 'en' ? 'en' : 'zh'}`;
}
function notify() { window.dispatchEvent(new Event(eventName)); }
function save(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Current-session settings still work. */ }
}
export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeSource = 'manual';
  save('sherry-theme', theme); notify();
}
export function setLocale(locale: Locale) {
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  save('sherry-locale', locale); notify();
}
export function subscribe(listener: () => void) {
  const media = matchMedia('(prefers-color-scheme: dark)');
  const systemChanged = () => {
    if (document.documentElement.dataset.themeSource === 'system') {
      document.documentElement.dataset.theme = media.matches ? 'dark' : 'light'; notify();
    }
  };
  const storageChanged = (event: StorageEvent) => {
    if (event.storageArea !== localStorage || (event.key !== null && !['sherry-theme', 'sherry-locale'].includes(event.key))) return;
    try {
      const theme = localStorage.getItem('sherry-theme');
      const locale = localStorage.getItem('sherry-locale');
      document.documentElement.dataset.theme = theme === 'dark' || theme === 'light' ? theme : media.matches ? 'dark' : 'light';
      document.documentElement.dataset.themeSource = theme === 'dark' || theme === 'light' ? 'manual' : 'system';
      document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
      notify();
    } catch { /* Keep active in-memory preferences when storage is denied. */ }
  };
  window.addEventListener(eventName, listener);
  window.addEventListener('storage', storageChanged);
  media.addEventListener('change', systemChanged);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener('storage', storageChanged);
    media.removeEventListener('change', systemChanged);
  };
}
// Runs before hydration so the first painted theme matches saved/system settings.
export const bootstrapPreferences = `(()=>{const r=document.documentElement;let t,l;try{t=localStorage.getItem('sherry-theme');l=localStorage.getItem('sherry-locale')}catch{}const valid=t==='dark'||t==='light';r.dataset.theme=valid?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';r.dataset.themeSource=valid?'manual':'system';r.lang=l==='en'?'en':'zh-CN'})()`;
