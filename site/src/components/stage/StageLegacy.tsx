'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StageCapabilities } from './StageCapabilities';
import { PapillonLines } from './PapillonLines';
import { prepareTextReveal } from './textReveal';
import './stage-legacy.css';

const introduction = ['AI conjures the visuals and intelligence. Code forges the backbone.', '— Digital Imprints & Creations'];

export function StageLegacy({ enabled = true }: { enabled?: boolean }) {
  const section = useRef<HTMLElement>(null);
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
      const drawing = host.querySelectorAll<SVGElement>('.stage-legacy-lines .draw');
      gsap.set(drawing, { strokeDasharray: 1000, strokeDashoffset: 1000 });
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
      // Keep the supplied pathLength normalization; scroll owns the four drawing stages.
      for (const [group, start, duration] of [['s1', .1, 1.8], ['s2', 1.2, 2], ['s3', 2.6, 2], ['s4', 4.2, 2.4]] as const) {
        timeline.to(host.querySelectorAll(`.papillon-clean-full .${group}`), { strokeDashoffset: 0, duration, ease: 'none' }, start);
      }
      timeline.to(chars, { yPercent: -160, duration: .8, stagger: .06, ease: 'power2.inOut' }, 2.8);
      const panels = [...host.querySelectorAll<HTMLElement>('.stage-capability-panel')];
      const firstChars = panels[0].querySelectorAll('[data-capability-char]');
      const firstPoints = panels[0].querySelectorAll<HTMLElement>('[data-point-char]');
      const secondChars = panels[1].querySelectorAll('[data-capability-char]');
      const secondPoints = panels[1].querySelectorAll<HTMLElement>('[data-point-char]');
      gsap.set([...firstChars, ...firstPoints, ...secondChars, ...secondPoints], { yPercent: 125 });
      // Like the reference, reveal characters in reading order across each line.
      const pointDelay = .012;
      const pointExitDelay = .006;
      timeline.to(firstChars, { yPercent: 0, duration: 1, stagger: .03, ease: 'power3.out' }, 3.6)
        .to(firstPoints, { yPercent: 0, duration: .6, stagger: pointDelay, ease: 'power3.out' }, 3.6)
        .to(firstChars, { yPercent: -125, duration: .8, stagger: .02, ease: 'power2.inOut' }, 5.6)
        .to(firstPoints, { yPercent: -125, duration: .45, stagger: pointExitDelay, ease: 'power2.inOut' }, 5.6)
        .to(secondChars, { yPercent: 0, duration: 1, stagger: .03, ease: 'power3.out' }, 6.7)
        .to(secondPoints, { yPercent: 0, duration: .6, stagger: pointDelay, ease: 'power3.out' }, 6.7)
        .to({}, { duration: 2.1 }, 7.9);
      const pictures = host.querySelector<HTMLElement>('.stage-capability-pictures')!;
      timeline.fromTo(host.querySelectorAll('.stage-capability-image'), { clipPath: 'inset(100% 0 0)' }, { clipPath: 'inset(0% 0 0)', duration: 2, stagger: .15, ease: 'power3.out' }, 2.8)
        .fromTo(host.querySelectorAll('.stage-capability-image img'), { yPercent: 15 }, { yPercent: -25, duration: 7.2, ease: 'none' }, 2.8);
      const followX = gsap.quickTo(pictures, 'x', { duration: .7, ease: 'power3.out' });
      const followY = gsap.quickTo(pictures, 'y', { duration: .7, ease: 'power3.out' });
      const turnX = gsap.quickTo(pictures, 'rotationX', { duration: .7, ease: 'power3.out' });
      const turnY = gsap.quickTo(pictures, 'rotationY', { duration: .7, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || innerWidth <= 700) return;
        const x = event.clientX / innerWidth - .5, y = event.clientY / innerHeight - .5;
        followX(x * 100); followY(y * 65); turnX(-y * 18); turnY(x * 24);
      };
      const reset = () => { followX(0); followY(0); turnX(0); turnY(0); };
      host.addEventListener('pointermove', move); host.addEventListener('pointerleave', reset);
      host.dataset.legacyRange = String(2.6 / timeline.duration());
      host.dataset.motionReady = 'true';
      const animations = prepareTextReveal([...copy.querySelectorAll<HTMLElement>('[data-legacy-word]')]);
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        animations.forEach(animation => animation.play());
        observer.disconnect();
      }, { threshold: .15, rootMargin: '0px 0px -10% 0px' });
      observer.observe(copy);
      void document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', reset); observer.disconnect(); animations.forEach(animation => animation.cancel()); delete host.dataset.motionReady; };
    }, host);
    return () => { alive = false; media.revert(); };
  }, [enabled]);
  return <section className="stage-legacy" ref={section} id="stage-legacy" aria-labelledby="stage-legacy-title">
    <div className="stage-legacy-stage">
      <p className="stage-legacy-copy">{introduction.map((line, lineIndex) => <span className="stage-legacy-copy-line" key={line}>{lineIndex > 0 ? '\n' : ''}{line.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <span data-legacy-word key={i}>{word}</span>)}</span>)}</p>
      <div className="stage-legacy-lines" aria-hidden="true">
        <PapillonLines />
      </div>
      <h2 id="stage-legacy-title" className="stage-legacy-title" aria-label="LEGACY">{[...'LEGACY'].map((char, i) => <span data-legacy-char aria-hidden="true" key={i}>{char}</span>)}</h2>
      <StageCapabilities />
    </div>
  </section>;
}
