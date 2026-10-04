'use client';
import { useEffect, useRef } from 'react';
import type { Project } from '@/types/project';
import { galleryMessages } from '@/content/gallery-messages';
import { projectSnapshotDate } from '@/content/projects';
import type { Locale } from '@/lib/preferences';
export function ProjectDialog({ project, directory, projects, locale, onSelect, onClose }: {
  project: Project | null; directory: boolean; projects: Project[]; locale: Locale;
  onSelect: (project: Project) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null), copy = galleryMessages[locale], open = !!project || directory;
  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [open]);
  return <dialog className="project-dialog" ref={ref} aria-labelledby="project-dialog-title" onClose={onClose} onClick={e => {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
  }}>
    <div className="project-dialog-head"><h2 id="project-dialog-title">{project?.displayName ?? copy.all}</h2><button className="dialog-close" onClick={onClose} aria-label={copy.close}>×</button></div>
    {project ? <>
      <p className="project-meta">{project.name} · {project.isFork ? 'FORK' : project.language ?? 'PROJECT'} · {copy.snapshot} {projectSnapshotDate}</p>
      <p className="project-summary">{project.summary[locale]}</p>
      <dl className="project-facts"><div><dt>{copy.role}</dt><dd>{project.role[locale]}</dd></div><div><dt>{copy.status}</dt><dd>{project.status[locale]}</dd></div><div><dt>{copy.source}</dt><dd>{project.evidenceStatus === 'metadata-and-readme' ? copy.readme : copy.metadata}</dd></div></dl>
      <div className="project-links"><a className="pill" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">{copy.github} ↗</a>{project.upstreamUrl && <a className="text-link" href={project.upstreamUrl} target="_blank" rel="noopener noreferrer">{copy.upstream}</a>}</div>
    </> : <div className="project-directory">{projects.map(p => <button className="directory-item" key={p.slug} onClick={() => onSelect(p)} aria-label={`${p.name} · ${p.isFork ? 'Fork' : p.language ?? 'Project'}`}><span>{p.name}</span><small>{p.isFork ? 'FORK' : p.language ?? 'PROJECT'}</small></button>)}</div>}
  </dialog>;
}
