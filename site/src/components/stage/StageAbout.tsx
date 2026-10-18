'use client';
import { useEffect, useRef } from 'react';
import './stage-about.css';

export const aboutCopy = 'Guided by an innate curiosity, I distill inspiration from the journeys and culinary textures of the physical world. This appetite for the unknown compels me to continually challenge the frontiers of my intellect and technical mastery. Wielding AI and code, I transmute abstract visions into tangible reality—and from this confluence of lived experience and digital creation, a multidimensional self emerges.';

export function StageAbout({ reduced, enabled }: { reduced: boolean; enabled: boolean }) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = section.current;
    if (!host || !enabled) return;
    let alive = true;
    const animations: Animation[] = [];
    const groups = [host.querySelector<HTMLElement>('.stage-about-heading')!, host.querySelector<HTMLElement>('.stage-about-copy')!];
    const motion = !reduced && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prepared = new Map<Element, Animation[]>();
    if (motion) groups.forEach((group, groupIndex) => {
      const pieces = [...group.querySelectorAll<HTMLElement>('[data-reveal-piece]')];
      const order = pieces.map((_, index) => index);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const current = pieces.map((piece, index) => {
        const animation = piece.animate([
          { opacity: 0, transform: 'translateY(40px)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
        ], { duration: groupIndex ? 3000 : 1200, delay: order[index] * 50, fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)' });
        animation.pause(); animation.currentTime = 0;
        animations.push(animation);
        return animation;
      });
      prepared.set(group, current);
    });
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const group = entry.target as HTMLElement;
      const current = prepared.get(group) ?? [];
      current.forEach(animation => animation.play());
      Promise.all(current.map(animation => animation.finished)).then(() => {
        if (alive) group.dataset.revealed = 'true';
      }).catch(() => {});
      reveal.unobserve(group);
    }), { threshold: .15, rootMargin: '0px 0px -10% 0px' });
    groups.forEach(group => reveal.observe(group));
    const headerZone = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) document.documentElement.dataset.stageSection = 'about';
      else if (document.documentElement.dataset.stageSection === 'about') document.documentElement.dataset.stageSection = 'hero';
    }, { rootMargin: '-8% 0px -82% 0px' });
    headerZone.observe(host);
    return () => {
      alive = false; reveal.disconnect(); headerZone.disconnect();
      animations.forEach(animation => animation.cancel());
      delete document.documentElement.dataset.stageSection;
    };
  }, [enabled, reduced]);
  return <section className="stage-about" id="stage-about" ref={section} aria-labelledby="stage-about-title">
    <div className="stage-about-title-zone">
      <h2 className="stage-about-heading" id="stage-about-title" aria-label="THIS WILL FEEL DIFFERENT">
        <span className="stage-about-line" aria-hidden="true">{[...'THIS WILL'].map((char, i) => <span data-reveal-piece key={i}>{char === ' ' ? '\u00a0' : char}</span>)}</span>
        <span className="stage-about-feel" data-reveal-piece aria-hidden="true">FEEL</span>
        <span className="stage-about-line" aria-hidden="true">{[...'DIFFERENT'].map((char, i) => <span data-reveal-piece key={i}>{char}</span>)}</span>
      </h2>
    </div>
    <p className="stage-about-copy">{aboutCopy.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <span data-reveal-piece key={i}>{word}</span>)}</p>
  </section>;
}
