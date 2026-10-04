'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { projects } from '@/content/projects';
import { messages } from '@/content/messages';
import { galleryMessages } from '@/content/gallery-messages';
import type { Project } from '@/types/project';
import { usePreferences } from '../settings/PreferencesProvider';
import { ProjectCard } from './ProjectCard';
import { ProjectDialog } from './ProjectDialog';
import { mountGallery, type GalleryMotion, type GalleryStatus } from './motion';
import './gallery.css';
export function ProjectGallery() {
  const { locale } = usePreferences(), copy = galleryMessages[locale];
  const [collection, setCollection] = useState<'works' | 'forks'>('works');
  const [paused, setPaused] = useState(false), [selected, setSelected] = useState<Project | null>(null), [directory, setDirectory] = useState(false);
  const [status, setStatus] = useState<GalleryStatus>({ index: 0, mode: 'auto' });
  const stage = useRef<HTMLDivElement>(null), motion = useRef<GalleryMotion | null>(null);
  const suspended = useRef(false), reduced = useRef(false);
  const works = projects.filter(p => !p.isFork).length, forks = projects.length - works;
  const items = useMemo(() => projects.filter(p => collection === 'forks' ? p.isFork : !p.isFork), [collection]);
  // Fixed repeats keep small collections' wrap boundary outside the visible strip.
  const cards = useMemo(() => items.length < 8 ? [...items, ...items, ...items] : items, [items]);
  useEffect(() => { suspended.current = paused || !!selected || directory; }, [paused, selected, directory]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduced.current = media.matches; setPaused(media.matches); };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const controller = mountGallery(stage.current!, { count: items.length, suspended: () => suspended.current, reduced: () => reduced.current, onStatus: setStatus });
    motion.current = controller;
    return () => { controller.dispose(); motion.current = null; };
  }, [items, cards]);
  const modeText = {auto:copy.auto,left:copy.pointerLeft,right:copy.pointerRight,paused:copy.paused,drag:copy.drag}[status.mode];
  return <section className="gallery-section" id="projects" aria-labelledby="gallery-title">
    <div className="gallery-heading"><div className="section-caption"><span>02 /</span><h2>{messages[locale].projectsLabel}</h2></div><p className="eyebrow">PAPERY · SELECTED WORKS</p><h3 id="gallery-title">BUILT IN MY OWN WAY.</h3></div>
    <div className="gallery-stage" ref={stage} aria-label={copy.stage}><div className="gallery-glow" aria-hidden="true" />{cards.map((project, i) => <ProjectCard key={`${project.slug}-${i}`} project={project} index={i % items.length} locale={locale} onOpen={() => { setSelected(project); setDirectory(false); }} />)}</div>
    <div className="gallery-controls"><button onClick={() => motion.current?.step(-1)} aria-label={copy.previous}>←</button><span className="gallery-count" aria-hidden="true">{String(status.index + 1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span><button onClick={() => motion.current?.step(1)} aria-label={copy.next}>→</button><button aria-pressed={paused} aria-label={paused ? copy.play : copy.pause} onClick={() => setPaused(p => !p)}>{paused ? '▶' : 'Ⅱ'}</button><span className="gallery-mode" aria-hidden="true">{modeText}</span></div>
    <p className="gallery-hint">{copy.hint}</p>
    <div className="gallery-collections" role="group" aria-label={copy.collection}><button aria-pressed={collection === 'works'} onClick={() => setCollection('works')}>{copy.works} · {works}</button><button aria-pressed={collection === 'forks'} onClick={() => setCollection('forks')}>{copy.forks} · {forks}</button><button className="directory-button" onClick={() => setDirectory(true)}>{copy.directory}</button></div>
    <p className="gallery-cover-note">{copy.concept}</p>
    <div className="gallery-footer-link"><a className="text-link" href="https://github.com/PaperY0" target="_blank" rel="noreferrer">{copy.allGithub} ↗</a></div>
    <ProjectDialog project={selected} directory={directory} projects={projects} locale={locale} onSelect={p => { setSelected(p); setDirectory(false); }} onClose={() => { setSelected(null); setDirectory(false); }} />
  </section>;
}
