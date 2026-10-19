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
    <div className="city-garden-heading"><p>WEAVER / THE PLACES I KEEP</p><h3>A garden of <em>memories.</em></h3></div>
    <nav className="city-book-index" aria-label="Choose a city book">{cityAlbums.map((city, index) => <button key={city.slug} aria-pressed={active === index} onClick={() => select(index)} onFocus={() => select(index)}><span>{city.name}</span><small>{city.title}</small></button>)}</nav>
    {status === 'fallback' && <div className="city-books-fallback">{cityAlbums.map(city => <button key={city.slug} style={{ background: city.color, color: city.ink }} onClick={() => onOpen(city)}><span>୨୧</span><strong>{city.name}</strong><em>{city.title}</em></button>)}</div>}
    <div className="city-garden-footer"><p>{status === 'loading' ? '正在打开玫瑰书房…' : '移动鼠标浏览 · 滚轮靠近 · 点击书本打开'}</p><button className="city-book-open" onClick={() => onOpen(cityAlbums[active])} aria-label={`Open ${cityAlbums[active].title} city album`}>翻开{cityAlbums[active].name}手帐 <span>↗</span></button><div className="city-camera-controls" aria-label="Book camera controls"><button onClick={() => engine.current?.zoom(-.3)} aria-label="Move away from books">−</button><span>靠近 / 远望</span><button onClick={() => engine.current?.zoom(.3)} aria-label="Move closer to books">＋</button></div><small>FIVE CITIES · MANY LITTLE STORIES</small></div>
  </div>;
}
