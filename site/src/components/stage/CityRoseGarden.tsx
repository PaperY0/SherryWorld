'use client';
import { useEffect, useRef, useState } from 'react';
import { cityAlbums, type CityAlbumData } from './city-albums';
import type { RoseGardenEngine } from './rose-garden-engine';
import './city-rose-garden.css';

export function CityRoseGarden({ onOpen, suspended }: { onOpen: (city: CityAlbumData) => void; suspended: boolean }) {
  const host = useRef<HTMLDivElement>(null), engine = useRef<RoseGardenEngine | null>(null);
  const callbacks = useRef({ onOpen, suspended }); callbacks.current = { onOpen, suspended };
  const [active, setActive] = useState(0), [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  useEffect(() => {
    if (!host.current) return;
    const element = host.current; let alive = true, started = false;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || started) return; started = true;
      void Promise.all([import('./rose-garden-engine'), document.fonts.ready]).then(([module]) => {
        if (!alive) return;
        try { engine.current = module.mountRoseGarden(element, { onCity: setActive, onOpen: index => callbacks.current.onOpen(cityAlbums[index]), suspended: () => callbacks.current.suspended }); setStatus('ready'); }
        catch { element.replaceChildren(); setStatus('fallback'); }
      }).catch(() => { if (alive) setStatus('fallback'); });
    }, { rootMargin: '900px' }); observer.observe(element);
    return () => { alive = false; observer.disconnect(); engine.current?.dispose(); engine.current = null; };
  }, []);
  const select = (index: number) => { setActive(index); engine.current?.select(index); };
  return <div className="city-rose-garden" data-status={status}>
    <div className="rose-garden-canvas" ref={host} />
    <div className="city-garden-heading"><p>WEAVER / THE PLACES I KEEP</p><h3>A constellation of <em>horizons.</em></h3></div>
    <nav className="city-book-index" aria-label="Choose a city book">{cityAlbums.map((city, index) => <button key={city.slug} aria-pressed={active === index} onClick={() => select(index)} onFocus={() => select(index)}><span>{city.title}</span></button>)}</nav>
    {status === 'fallback' && <div className="city-books-fallback">{cityAlbums.map(city => <button key={city.slug} style={{ background: city.color, color: city.ink }} onClick={() => onOpen(city)}><span className="fallback-book-header"><small>CRAFTER · EXPLORER · WEAVER</small><strong>A TEXTURED LIFE</strong></span><em>{city.title}</em><span className="fallback-book-footer"><i>Sherry's Chronicles</i><small>WHERE LIVED REALITY MEETS DIGITAL CREATION</small></span></button>)}</div>}
    <div className="city-garden-footer"><p>{status === 'loading' ? 'Opening the collection…' : 'MOVE TO EXPLORE · SCROLL TO APPROACH · CLICK TO OPEN'}</p><button className="city-book-open" onClick={() => onOpen(cityAlbums[active])} aria-label={`Open ${cityAlbums[active].title} city album`}>OPEN {cityAlbums[active].title.toUpperCase()} <span>↗</span></button><div className="city-camera-controls" aria-label="Book camera controls"><button onClick={() => engine.current?.zoom(-.3)} aria-label="Move away from books">−</button><span>DISTANCE</span><button onClick={() => engine.current?.zoom(.3)} aria-label="Move closer to books">＋</button></div><small>FIVE CITIES · MANY LITTLE STORIES</small></div>
  </div>;
}
