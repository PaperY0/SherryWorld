'use client';
import { useEffect, useRef } from 'react';
import './stage-legacy.css';

export function StageLegacy() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = section.current;
    if (!host) return;
    const zone = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) document.documentElement.dataset.stageSection = 'legacy';
      else if (document.documentElement.dataset.stageSection === 'legacy') document.documentElement.dataset.stageSection = 'fire';
    }, { rootMargin: '-8% 0px -82% 0px' });
    zone.observe(host);
    return () => zone.disconnect();
  }, []);
  return <section className="stage-legacy" ref={section} id="stage-legacy" aria-labelledby="stage-legacy-title">
    <div className="stage-legacy-stage">
      <p className="stage-legacy-copy">Design attracts attention. Development brings it to life. I combine both to create websites that not only look exceptional but also feel fast, intuitive, and memorable.</p>
      <div className="stage-legacy-lines" aria-hidden="true">
        <svg viewBox="0 0 1920 1080" fill="none" preserveAspectRatio="xMidYMid slice">
          <g stroke="currentColor" strokeWidth=".7" pathLength="1">
            <path pathLength="1" d="M-57 540H1986M960-154V1207M265-154L1655 1236M1655-154L265 1236M-153-129L1280 1207M-153 1207L1280-129M827-129L2260 1207M827 1207L2260-129M565 146L1357 143V934H565Z" />
          </g>
        </svg>
      </div>
      <h2 id="stage-legacy-title" className="stage-legacy-title">LEGACY</h2>
    </div>
  </section>;
}
