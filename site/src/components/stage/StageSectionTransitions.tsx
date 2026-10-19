'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-section-transitions.css';
export function StageSectionTransitions({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const sections = [...root.current.children] as HTMLElement[];
    let frame = 0;
    const updateSection = () => {
      frame = 0;
      sections.forEach(section => { section.dataset.stageInteractive = String(section.getBoundingClientRect().top <= 0); });
      const active = [...sections].reverse().find(section => { const rect = section.getBoundingClientRect(); return rect.top <= innerHeight * .15 && rect.bottom > innerHeight * .15; });
      if (active) document.documentElement.dataset.stageSection = active.classList.contains('stage-ending') ? 'ending' : active.classList.contains('stage-weaver') ? 'weaver' : active.classList.contains('stage-explorer') ? 'explorer' : active.classList.contains('stage-portfolio') ? 'portfolio' : 'legacy';
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateSection); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    updateSection();
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      sections.forEach((section, index) => {
        section.classList.add('stage-fade-section');
        if (index > 0) gsap.fromTo(section, { '--stage-enter': 0 }, { '--stage-enter': 1, ease: 'sine.inOut', scrollTrigger: { trigger: section, start: 'top top', end: 'top -15%', scrub: .45 } });
        if (index < sections.length - 1) gsap.fromTo(section, { '--stage-leave': 1 }, { '--stage-leave': 0, ease: 'sine.inOut', scrollTrigger: { trigger: section, start: 'bottom 115%', end: 'bottom bottom', scrub: .45 } });
      });
      return () => sections.forEach(section => section.classList.remove('stage-fade-section'));
    }, root.current);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); media.revert(); };
  }, [enabled]);
  return <div className="stage-lower-flow" ref={root}>{children}</div>;
}
