import { StageHero } from '@/components/stage/StageHero';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sherry · A world of my own', description: 'A personal world of digital craft, exploration and life, woven together by Sherry.' };

export default function StagePage() { return <StageHero />; }
