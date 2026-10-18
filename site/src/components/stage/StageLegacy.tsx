'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prepareTextReveal } from './textReveal';
import './stage-legacy.css';

const introduction = 'Vision shapes the narrative. Engineering breathes life into the void.';

export function StageLegacy({ enabled = true }: { enabled?: boolean }) {
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
  useEffect(() => {
    const host = section.current;
    if (!host || !enabled) return;
    gsap.registerPlugin(ScrollTrigger);
    let alive = true;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const title = host.querySelector<HTMLElement>('.stage-legacy-title')!;
      const chars = [...host.querySelectorAll<HTMLElement>('[data-legacy-char]')];
      const copy = host.querySelector<HTMLElement>('.stage-legacy-copy')!;
      const line = host.querySelector<SVGPathElement>('.stage-legacy-lines path')!;
      // Initialize every staggered letter before the first scroll frame.
      gsap.set(chars, { fontSize: () => Math.max(22, Math.min(innerWidth * .055, 86)) });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: host, start: 'top top', end: 'bottom bottom', scrub: .75,
          invalidateOnRefresh: true,
        },
        onUpdate: () => { host.dataset.scrollProgress = timeline.progress().toFixed(4); },
      });
      timeline.fromTo(title, { x: () => innerWidth * .27, y: () => -innerHeight * .12 }, { x: 0, y: 0, duration: 2.6, ease: 'none' }, 0);
      timeline.fromTo(chars, { fontSize: () => Math.max(22, Math.min(innerWidth * .055, 86)) }, {
        fontSize: () => Math.min(innerWidth * (innerWidth <= 700 ? .20 : .22), 400),
        duration: 1.8, stagger: .16, ease: 'none',
      }, 0);
      timeline.fromTo(copy, { opacity: 1, y: 0 }, { opacity: 0, y: -35, duration: .9, ease: 'none' }, .45);
      timeline.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, 1);
      host.dataset.motionReady = 'true';
      const animations = prepareTextReveal([...copy.querySelectorAll<HTMLElement>('[data-legacy-word]')]);
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        animations.forEach(animation => animation.play());
        observer.disconnect();
      }, { threshold: .15, rootMargin: '0px 0px -10% 0px' });
      observer.observe(copy);
      void document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); delete host.dataset.motionReady; };
    }, host);
    return () => { alive = false; media.revert(); };
  }, [enabled]);
  return <section className="stage-legacy" ref={section} id="stage-legacy" aria-labelledby="stage-legacy-title">
    <div className="stage-legacy-stage">
      <p className="stage-legacy-copy">{introduction.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <span data-legacy-word key={i}>{word}</span>)}</p>
      <div className="stage-legacy-lines" aria-hidden="true">
        <svg viewBox="0 0 1920 1080" fill="none" preserveAspectRatio="xMidYMid slice">
          <g stroke="currentColor" strokeWidth=".7" pathLength="1">
            <path pathLength="1" d="M-57 540H1986M960-154V1207M265-154L1655 1236M1655-154L265 1236M-153-129L1280 1207M-153 1207L1280-129M827-129L2260 1207M827 1207L2260-129M565 146L1357 143V934H565Z" />
          </g>
        </svg>
      </div>
      <h2 id="stage-legacy-title" className="stage-legacy-title" aria-label="LEGACY">{[...'LEGACY'].map((char, i) => <span data-legacy-char aria-hidden="true" key={i}>{char}</span>)}</h2>
    </div>
  </section>;
}
