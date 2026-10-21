'use client';
import { isStudioAsset } from '@/content/site-content';
import { useEffect, useRef, useState } from 'react';
import { mountGallery, type GalleryMotion, type GalleryStatus } from '../gallery/motion';
import { useFadingDialog } from './useFadingDialog';
import { albumCategories, placeholderCityPhotos, type CityAlbumData, type CityPhoto } from './city-albums';
import './skill-exhibition.css';
import './city-rose-garden.css';

function validPhoto(value: unknown): value is CityPhoto {
  if (!value || typeof value !== 'object') return false;
  const photo = value as Record<string, unknown>;
  return isStudioAsset(photo.src) && typeof photo.alt === 'string' && typeof photo.caption === 'string' && ['portrait', 'scenery', 'food'].includes(String(photo.category));
}
export function CityAlbum({ city, onClose }: { city: CityAlbumData | null; onClose: () => void }) {
  const [photos, setPhotos] = useState<CityPhoto[]>([]), [preview, setPreview] = useState(true);
  const [category, setCategory] = useState<'all' | CityPhoto['category']>('all');
  const [selected, setSelected] = useState<CityPhoto | null>(null), [ready, setReady] = useState(false), [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<GalleryStatus>({ index: 0, mode: 'paused' });
  const stage = useRef<HTMLDivElement>(null), motion = useRef<GalleryMotion | null>(null), suspend = useRef(false);
  const photoSource = useRef<HTMLButtonElement | null>(null), back = useRef<HTMLButtonElement>(null);
  suspend.current = paused || selected !== null;
  const { dialog, close } = useFadingDialog(city?.slug ?? null, () => { setReady(false); onClose(); }, () => setReady(true));
  useEffect(() => {
    if (!city) return;
    const controller = new AbortController();
    setCategory('all'); setSelected(null); setPaused(matchMedia('(prefers-reduced-motion: reduce)').matches); setPreview(true); setPhotos(placeholderCityPhotos(city));
    void fetch(`/api/collections/cities/${city.slug}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const items: unknown = await response.json();
      if (Array.isArray(items) && items.length && items.every(validPhoto)) {
        await Promise.all(items.slice(0, 6).map(photo => { const image = new Image(); image.src = photo.src; return image.decode().catch(() => {}); }));
        if (!controller.signal.aborted) { setPhotos(items); setPreview(false); }
      }
    }).catch(() => {});
    return () => controller.abort();
  }, [city]);
  const visible = category === 'all' ? photos : photos.filter(photo => photo.category === category);
  useEffect(() => {
    if (!city || !ready || !stage.current || !visible.length) return;
    const controller = mountGallery(stage.current, { count: visible.length, loop: false, suspended: () => suspend.current, reduced: () => matchMedia('(prefers-reduced-motion: reduce)').matches, onStatus: setStatus });
    motion.current = controller;
    return () => { controller.dispose(); motion.current = null; };
  }, [city, ready, photos, category]);
  useEffect(() => { if (selected) back.current?.focus(); }, [selected]);
  const closePhoto = () => { setSelected(null); requestAnimationFrame(() => photoSource.current?.focus({ preventScroll: true })); };
  const cards = visible;
  return <dialog ref={dialog} className="city-album skill-exhibition" aria-labelledby="city-album-title" onCancel={event => { event.preventDefault(); if (selected) closePhoto(); else close(); }}>
    {city && <>
      <div className="city-album-content" inert={!!selected}>
        <button autoFocus className="skill-exhibition-close" onClick={close} aria-label="Close city album">CLOSE ×</button>
        <header className="city-album-heading"><p>WEAVER / A CITY IN MY HANDS</p><h2 id="city-album-title">{city.title}<span>CITY JOURNAL</span></h2><p>{city.motif}</p></header>
        <nav className="city-album-categories" aria-label="City photo categories">{albumCategories.map(item => <button key={item.key} aria-pressed={category === item.key} onClick={() => setCategory(item.key)}>{item.label}</button>)}</nav>
        <div className="city-album-wall skill-gallery-stage" ref={stage} aria-label={`${city.name} draggable photo gallery`}>
          {cards.map((photo, index) => <button className={`gallery-card city-polaroid decoration-${index % 3}`} key={`${category}-${photo.src}-${index}`} aria-label={`Enlarge city photo ${index % visible.length + 1}: ${photo.alt}`} onClick={event => { photoSource.current = event.currentTarget; setSelected(photo); }}>
            <span className="polaroid-paper prism-photo-frame">
              <svg className="prism-photo-border" viewBox="0 0 346 358" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <polygon points="14,1 332,1 345,14 345,344 332,357 14,357 1,344 1,14" stroke="#E295B0" strokeWidth="1.5" opacity=".65" />
                <polygon points="18,6 328,6 340,18 340,340 328,352 18,352 6,340 6,18" stroke="#F2EDF0" strokeWidth=".5" opacity=".25" />
                <path d="M28 351H318" stroke="#E295B0" strokeWidth="1.5" strokeDasharray="1 6" opacity=".6" />
              </svg>
              <span className="prism-photo-viewport">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} draggable={false} className={preview ? 'prism-placeholder-image' : undefined} />
                {preview && <span className="prism-placeholder-type" aria-hidden="true"><span>PHOTO {photo.src.match(/photo-(\d+)/)?.[1]?.padStart(2, '0')}</span><small>{photo.category === 'portrait' ? 'PORTRAIT SERIES' : photo.category === 'scenery' ? 'SCENERY ARCHIVE' : 'AT THE TABLE'}</small></span>}
              </span>
              <span className="polaroid-caption"><span>{photo.caption}</span><small>NO. {String(index % visible.length + 1).padStart(2, '0')}</small></span>
            </span>
          </button>)}
        </div>
        {visible.length === 0 && <p className="city-album-note" role="status">No photographs in this chapter yet. Explore another category.</p>}
        <nav className="skill-gallery-controls" aria-label="City gallery controls"><button aria-label="Previous city photo" onClick={() => motion.current?.step(-1)}>←</button><span>{String(status.index + 1).padStart(2, '0')} / {String(visible.length).padStart(2, '0')}</span><button aria-label="Next city photo" onClick={() => motion.current?.step(1)}>→</button><button aria-label={paused ? 'Play city gallery' : 'Pause city gallery'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? '▶' : 'Ⅱ'}</button></nav>
        <p className="city-album-note">{preview ? 'PREVIEW PLACEHOLDERS · ' : ''}DRAG TO EXPLORE · CLICK TO ENLARGE</p>
      </div>
      {selected && <div className="skill-photo-lightbox city-album-lightbox" role="region" aria-label="Enlarged city photo"><button ref={back} className="skill-photo-back" onClick={closePhoto}>BACK TO ALBUM ×</button><figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selected.src} alt={selected.alt} /><figcaption>{selected.caption}</figcaption></figure></div>}
    </>}
  </dialog>;
}
