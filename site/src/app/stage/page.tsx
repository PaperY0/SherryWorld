import { readStudio } from '@/lib/studio-store';
import { SiteContentProvider } from '@/components/stage/SiteContentProvider';
import { StageHero } from '@/components/stage/StageHero';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sherry · A world of my own', description: 'A personal world of digital craft, exploration and life, woven together by Sherry.' };

export const dynamic='force-dynamic';
export default async function StagePage() { const {content}=await readStudio();return <SiteContentProvider content={content}><StageHero /></SiteContentProvider>; }
