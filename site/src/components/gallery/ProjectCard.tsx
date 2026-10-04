import type { Project } from '@/types/project';
import { galleryMessages } from '@/content/gallery-messages';
import type { Locale } from '@/lib/preferences';
const palettes = [['#e7ede3','#263b30'],['#f0d6df','#482b39'],['#e9e5e1','#282128'],['#e5dfeb','#493952'],['#e5e8ee','#2f3c51'],['#f0e5d8','#59412d']];
export function ProjectCard({ project, index, locale, onOpen }: { project: Project; index: number; locale: Locale; onOpen: () => void }) {
  const copy = galleryMessages[locale], palette = palettes[project.cover.palette];
  return <button className={`gallery-card kind-${project.cover.category}`} data-project={project.name} aria-label={`${copy.view} ${project.name}`} onClick={onOpen}>
    <span className="project-poster" style={{ background: palette[0], color: palette[1] }}>
      <span className="poster-label">PAPERY / {String(index + 1).padStart(2,'0')}</span>
      <span className="poster-shape shape-a" aria-hidden="true" /><span className="poster-shape shape-b" aria-hidden="true" />
      <span className="poster-title">{project.displayName}</span>
      <span className="poster-caption">{project.isFork ? 'OPEN SOURCE / FORK' : 'CONCEPT COVER / PROJECT'}</span>
    </span>
    <span className="project-placard"><span>{project.name}</span><span>{project.isFork ? 'FORK' : '↗'}</span></span>
  </button>;
}
