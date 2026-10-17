'use client';
import { useEffect, useRef, useState } from 'react';
import './stage-facts.css';

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
  { name: 'AI', en: 'Ideas, models, and intelligent experiences.', zh: '想法、模型，与智能体验。' },
  { name: 'BACKEND', en: 'Structure, logic, and the systems behind the screen.', zh: '结构、逻辑，与屏幕背后的系统。' },
  { name: 'AGENT', en: 'Tools, workflows, and ideas connected.', zh: '工具、工作流，让想法连接起来。' },
];

export function StageFacts({ reduced, enabled, zh }: { reduced: boolean; enabled: boolean; zh: boolean }) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!section.current || !enabled) return;
    const rows = [...section.current.querySelectorAll<HTMLElement>('.stage-direction')];
    const animations = rows.map(row => {
      if (reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
      const animation = row.animate([{ opacity: 0, transform: 'translateY(55px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: 1000, fill: 'both', easing: 'cubic-bezier(.16,1,.3,1)' });
      animation.pause(); animation.currentTime = 0;
      return animation;
    });
    let alive = true;
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const index = rows.indexOf(entry.target as HTMLElement);
      const animation = animations[index];
      if (animation) { animation.play(); animation.finished.then(() => { if (alive) rows[index].dataset.revealed = 'true'; }).catch(() => {}); }
      else rows[index].dataset.revealed = 'true';
      reveal.unobserve(entry.target);
    }), { threshold: .2, rootMargin: '0px 0px -10% 0px' });
    rows.forEach(row => reveal.observe(row));
    const zone = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) document.documentElement.dataset.stageSection = 'fire';
      else if (document.documentElement.dataset.stageSection === 'fire') document.documentElement.dataset.stageSection = 'about';
    }, { rootMargin: '-8% 0px -82% 0px' });
    zone.observe(section.current);
    return () => { alive = false; reveal.disconnect(); zone.disconnect(); animations.forEach(animation => animation?.cancel()); };
  }, [enabled, reduced]);
  return <section ref={section} className="stage-facts" aria-label={zh ? '探索的方向' : 'Directions I explore'}>
    <svg width="0" height="0" className="stage-filter-defs" aria-hidden="true"><defs><filter id="stage-pink-fire" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1.242 0 0 0 .09 .928 0 0 0 .07 1.04 0 0 0 .09 0 0 0 1 0" /></filter></defs></svg>
    <FireEdge reduced={reduced} />
    <div className="stage-direction-list">
      {directions.map(direction => <div className="stage-direction" key={direction.name}>
        <h2>{direction.name}</h2><p>{zh ? direction.zh : direction.en}</p>
      </div>)}
    </div>
    <FireEdge reduced={reduced} bottom />
  </section>;
}
