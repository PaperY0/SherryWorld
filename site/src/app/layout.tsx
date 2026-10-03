import type { Metadata } from 'next';
import { PreferencesProvider } from '@/components/settings/PreferencesProvider';
import { SiteHeader } from '@/components/settings/SiteHeader';
import { bootstrapPreferences } from '@/lib/preferences';
import './globals.css';
export const metadata: Metadata = {
  title: 'PaperY · 文书颖的个人世界',
  description: 'PaperY · 文书颖，智能科学与技术专业，探索 AI、后端与 Agent。作品、兴趣、生活与旅行。',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: bootstrapPreferences }} /></head>
    <body><PreferencesProvider><SiteHeader />{children}</PreferencesProvider></body>
  </html>;
}
