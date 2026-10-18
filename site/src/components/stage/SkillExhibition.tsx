'use client';
import { useEffect, useRef, useState } from 'react';
import { mountGallery, type GalleryMotion, type GalleryStatus } from '../gallery/motion';
import { PapillonLines } from './PapillonLines';
import './skill-exhibition.css';
type Skill = { slug: string; title: string; tags: string };
type Photo = { src: string; alt: string; caption?: string };
function validPhoto(value: unknown): value is Photo {
  if (!value || typeof value !== 'object') return false;
  const photo = value as Record<string, unknown>;
  return typeof photo.src === 'string' && photo.src.startsWith('/images/') && typeof photo.alt === 'string' && (photo.caption === undefined || typeof photo.caption === 'string');
}
export function SkillExhibition({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), stage = useRef<HTMLDivElement>(null);
  const motion = useRef<GalleryMotion | null>(null), pausedRef = useRef(false), reduced = useRef(false), closing = useRef(false);
  const photoTrigger = useRef<HTMLButtonElement | null>(null), photoClose = useRef<HTMLButtonElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]), [loading, setLoading] = useState(false), [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false), [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<GalleryStatus>({ index: 0, mode: 'auto' });
  useEffect(() => { pausedRef.current = paused || selected !== null; }, [paused, selected]);
  useEffect(() => {
    if (!skill || !dialog.current) return;
    const host = dialog.current, controller = new AbortController();
    closing.current = false;
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPaused(reduced.current); setPhotos([]); setSelected(null); setFailed(false); setLoading(true); setStatus({ index: 0, mode: 'auto' });
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden'; host.showModal();
    const animation = !reduced.current ? host.animate([{ clipPath: 'inset(100% 0 0)' }, { clipPath: 'inset(0)' }], { duration: 750, easing: 'cubic-bezier(.76,0,.24,1)' }) : null;
    void fetch(`/images/skills/${skill.slug}/photos.json`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Unable to load collection');
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(validPhoto)) throw new Error('Invalid collection');
      if (!controller.signal.aborted) setPhotos(data);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); animation?.cancel(); host.close(); document.documentElement.style.overflow = overflow; };
  }, [skill]);
  useEffect(() => {
    if (!skill || !stage.current || !photos.length) return;
    const controller = mountGallery(stage.current, { count: photos.length, suspended: () => pausedRef.current || reduced.current, reduced: () => reduced.current, onStatus: setStatus });
    motion.current = controller;
    return () => { controller.dispose(); motion.current = null; };
  }, [skill, photos]);
  useEffect(() => { if (selected !== null) photoClose.current?.focus(); }, [selected]);
  const closePhoto = () => { setSelected(null); requestAnimationFrame(() => photoTrigger.current?.focus()); };
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (!dialog.current || reduced.current) { onClose(); return; }
    void dialog.current.animate([{ clipPath: 'inset(0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 500, easing: 'cubic-bezier(.76,0,.24,1)' }).finished.then(onClose).catch(onClose);
  };
  const cards = photos.length < 8 ? [...photos, ...photos, ...photos] : photos;
  return <dialog ref={dialog} className="skill-exhibition" aria-labelledby="skill-exhibition-title" onCancel={event => { event.preventDefault(); if (selected !== null) closePhoto(); else close(); }} onKeyDown={event => {
    if (selected === null || !photos.length) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setSelected((selected + (event.key === 'ArrowLeft' ? -1 : 1) + photos.length) % photos.length); }
  }}>
    {skill && <>
      <div className="skill-exhibition-content" inert={selected !== null}>
        <button className="skill-exhibition-close" autoFocus onClick={close} aria-label="Close skill exhibition">CLOSE ×</button>
        <header className="skill-exhibition-heading"><p>EXPLORER / PHOTO COLLECTION</p><h2 id="skill-exhibition-title">{skill.title}</h2><p>{skill.tags}</p></header>
        {photos.length > 0 ? <>
          <div className="skill-gallery-stage" ref={stage} aria-label={`${skill.title} draggable curved photo gallery`}>
            {cards.map((photo, index) => <button className="gallery-card skill-photo-card" key={`${photo.src}-${index}`} aria-label={`Enlarge photo ${index % photos.length + 1}: ${photo.alt}`} onClick={event => { photoTrigger.current = event.currentTarget; setSelected(index % photos.length); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} draggable={false} />
              <span>{photo.caption || photo.alt}</span>
            </button>)}
          </div>
          <nav className="skill-gallery-controls" aria-label="Photo gallery controls"><button onClick={() => motion.current?.step(-1)} aria-label="Previous photo">←</button><span aria-live="polite">{String(status.index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span><button onClick={() => motion.current?.step(1)} aria-label="Next photo">→</button><button onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Play photo gallery' : 'Pause photo gallery'}>{paused ? '▶' : 'Ⅱ'}</button></nav>
          <p className="skill-gallery-hint">DRAG TO EXPLORE · OPEN A PHOTO TO LOOK CLOSER</p>
        </> : <div className="skill-exhibition-empty" role="status"><div aria-hidden="true"><PapillonLines /></div><p>{loading ? 'Opening the collection…' : failed ? 'This collection is unavailable. Please try again later.' : 'A collection in progress.'}</p></div>}
      </div>
      {selected !== null && photos[selected] && <div className="skill-photo-lightbox" role="region" aria-label="Enlarged photo"><button ref={photoClose} onClick={closePhoto} className="skill-photo-back" aria-label="Return to skill photo gallery">BACK TO GALLERY ×</button><figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[selected].src} alt={photos[selected].alt} /><figcaption>{photos[selected].caption || photos[selected].alt}</figcaption></figure><nav aria-label="Enlarged photo navigation"><button onClick={() => setSelected((selected - 1 + photos.length) % photos.length)} aria-label="Previous enlarged photo">←</button><span>{selected + 1} / {photos.length}</span><button onClick={() => setSelected((selected + 1) % photos.length)} aria-label="Next enlarged photo">→</button></nav></div>}
    </>}
  </dialog>;
}
