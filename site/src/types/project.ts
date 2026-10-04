export type LocalizedText = { zh: string; en: string };
export type Project = {
  slug: string; name: string; displayName: string; repositoryUrl: string;
  isFork: boolean; upstreamUrl: string | null; language: string | null;
  summary: LocalizedText; status: LocalizedText; role: LocalizedText;
  evidenceStatus: 'metadata-only' | 'metadata-and-readme';
  cover: { kind: 'concept'; palette: number; category: 'product' | 'engineering' | 'skill' | 'fork' };
};
