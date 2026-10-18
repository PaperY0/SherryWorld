'use client';
import { useEffect, useRef, useState } from 'react';
import './stage-facts.css';
import { prepareTextReveal } from './textReveal';

function FireEdge({ reduced, bottom = false }: { reduced: boolean; bottom?: boolean }) {
  const edge = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!edge.current || reduced) return;
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { rootMargin: '180px' });
    observer.observe(edge.current);
    return () => observer.disconnect();
  }, [reduced]);
  return <div ref={edge} className={`stage-fire-edge${bottom ? ' is-bottom' : ''}`} aria-hidden="true">
    {visible && !reduced && <img className="stage-fire-image" src="/effects/fire-source.gif" alt="" width="809" height="380" decoding="async" />}
  </div>;
}

const directions = [
  { name: 'CRAFTER', en: 'I wield AI and code to materialize every realm and concept imagined within my mind.' },
  { name: 'EXPLORER', en: 'I continuously probe the outer limits of my knowledge and technical capabilities, expanding the frontier of what I can build.' },
  { name: 'WEAVER', en: 'Travel, cuisine and curiosity for the world interlace to weave a full, textured life of my own.' },
];

export function StageFacts({ reduced, enabled, zh }: { reduced: boolean; enabled: boolean; zh: boolean }) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!section.current || !enabled) return;
    const rows = [...section.current.querySelectorAll<HTMLElement>('.stage-direction')];
    const animations = rows.map(row => {
      if (reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return [];
      const title = [...row.querySelectorAll<HTMLElement>('h2 [data-fact-piece]')];
      const words = [...row.querySelectorAll<HTMLElement>('p [data-fact-piece]')];
      return [...prepareTextReveal(title, 1200, false), ...prepareTextReveal(words)];
    });
    let alive = true;
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const index = rows.indexOf(entry.target as HTMLElement);
      const current = animations[index];
      current.forEach(animation => animation.play());
      Promise.all(current.map(animation => animation.finished)).then(() => { if (alive) rows[index].dataset.revealed = 'true'; }).catch(() => {});
      reveal.unobserve(entry.target);
    }), { threshold: .2, rootMargin: '0px 0px -10% 0px' });
    rows.forEach(row => reveal.observe(row));
    const zone = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) document.documentElement.dataset.stageSection = 'fire';
      else if (document.documentElement.dataset.stageSection === 'fire') document.documentElement.dataset.stageSection = 'about';
    }, { rootMargin: '-8% 0px -82% 0px' });
    zone.observe(section.current);
    return () => { alive = false; reveal.disconnect(); zone.disconnect(); animations.flat().forEach(animation => animation.cancel()); };
  }, [enabled, reduced]);
  return <section ref={section} className="stage-facts" aria-label={zh ? '探索的方向' : 'Directions I explore'}>
    <svg width="0" height="0" className="stage-filter-defs" aria-hidden="true"><defs><filter id="stage-pink-fire" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1.242 0 0 0 .09 .928 0 0 0 .07 1.04 0 0 0 .09 0 0 0 1 0" /></filter></defs></svg>
    <FireEdge reduced={reduced} />
    <div className="stage-direction-list">
      {directions.map(direction => <div className="stage-direction" key={direction.name}>
        <h2 aria-label={direction.name}>{[...direction.name].map((char, i) => <span data-fact-piece aria-hidden="true" key={i}>{char}</span>)}</h2><p>{direction.en.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <span data-fact-piece key={i}>{word}</span>)}</p>
      </div>)}
    </div>
    <FireEdge reduced={reduced} bottom />
  </section>;
}
