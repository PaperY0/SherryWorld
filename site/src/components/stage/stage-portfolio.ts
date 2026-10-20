export const stageWorks = [
  {
    slug: 'lumi', title: 'LUMI', name: 'Lumi', category: 'AI & COMMUNICATION',
    summary: 'A local-first AI companion for relationship communication. A React interface and Express API bring conversations and AI assistance into one space.',
    detail: 'Lumi explores how AI can support expression and communication in relationships. The project combines a React frontend with an Express API and AI integration, with a local-first development setup.',
    tags: ['React', 'Express', 'AI Integration'], image: '/images/stage/portfolio/lumi-cover.png',
    github: 'https://github.com/PaperY0/Lumi',
  },
  {
    slug: 'zhiye', title: 'ZHIYE', name: 'Zhiye', category: 'AI & EDUCATION',
    summary: 'A classroom review prototype for rural primary-school teachers. Recordings become review cards, teacher reports and targeted follow-up lessons, reviewed by teachers before publishing.',
    detail: 'Zhiye connects classroom recordings with structured teaching material. Its prototype workflow covers transcription, review cards, teacher reports and follow-up lesson drafts, with teachers reviewing the material before release.',
    tags: ['React', 'FastAPI', 'Teaching Workflows'], image: '/images/stage/portfolio/zhiye-cover.png',
    github: 'https://github.com/PaperY0/Zhiye',
  },
  {
    slug: 'shengxingo', title: 'SHENGXINGO', name: 'ShengXinGO', category: 'AI & SHOPPING',
    summary: 'An AI-assisted shopping decision project with a full-stack codebase. Product selection, comparisons and clearer purchase choices form the product direction.',
    detail: 'ShengXinGO explores a more understandable shopping experience. Its product concept brings together product selection, comparisons and purchase guidance; the repository includes separate frontend and backend services and design documents.',
    tags: ['Full Stack', 'Shopping Decisions', 'Product Design'], image: '/images/stage/portfolio/shengxingo.png',
    github: 'https://github.com/PaperY0/ShengXinGO',
  },
  {
    slug: 'realm', title: 'REALM', name: 'Realm', category: 'INTERACTIVE STORY WORLD',
    summary: 'A storybook-inspired web demo that turns personal expression into a structured story brief. An illustrated world entrance sets the scene for a larger fairy-tale experience.',
    detail: 'Realm is a local web demo with a world-gate entrance, an expression flow and a structured story brief. The complete seven-chapter storybook remains a future goal; the repository documents the current demo and image-generation integration boundaries.',
    tags: ['Web Experience', 'Node.js', 'Interactive Story'], image: '/images/stage/portfolio/realm.png',
    github: 'https://github.com/PaperY0/Realm',
  },
] as const;
export type { StudioProject as StageWork } from '@/content/site-content';
