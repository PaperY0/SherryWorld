'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-explorer.css';

// Connect the generated film here once supplied. No substitute character animation.
const explorerFilm: string | undefined = undefined;
export function StageExplorer({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const zone = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) document.documentElement.dataset.stageSection = 'explorer';
      else if (document.documentElement.dataset.stageSection === 'explorer') document.documentElement.dataset.stageSection = 'portfolio';
    }, { rootMargin: '-8% 0px -82% 0px' });
    zone.observe(host);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(host);
      let targetTime = 0;
      const seek = () => {
        const film = video.current;
        if (film && film.readyState >= 2 && !film.seeking && Math.abs(film.currentTime - targetTime) > .035) film.currentTime = targetTime;
      };
      gsap.ticker.add(seek);
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: host, start: 'top top', end: 'bottom bottom', scrub: .65,
        onUpdate: self => { host.dataset.explorerProgress = self.progress.toFixed(3); },
      }});
      timeline.fromTo(select('.explorer-frame'), { width: '36vw', height: '45svh', borderRadius: 3 }, { width: '100vw', height: '100svh', borderRadius: 0, duration: 2, ease: 'power2.inOut' }, 1.8)
        .to(select('.explorer-heading'), { opacity: 0, y: -65, duration: 1 }, 2)
        .to(select('.explorer-shade'), { opacity: .92, duration: 2.8 }, 4.2)
        .fromTo(select('.explorer-fall-copy'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 1 }, 4.7)
        .to(select('.explorer-fall-copy'), { opacity: 0, y: -30, duration: .8 }, 7)
        .to(select('.explorer-dawn'), { opacity: 1, scale: 1, duration: 2 }, 7.8)
        .fromTo(select('.explorer-rise-copy'), { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 1.4 }, 8.4)
        .to({}, { duration: 1 }, 9.8);
      timeline.eventCallback('onUpdate', () => {
        const film = video.current;
        if (film && Number.isFinite(film.duration)) targetTime = timeline.progress() * Math.max(0, film.duration - .05);
      });
      return () => gsap.ticker.remove(seek);
    }, host);
    return () => { zone.disconnect(); media.revert(); };
  }, [enabled]);
  return <section className="stage-explorer" id="stage-explorer" ref={root} aria-labelledby="explorer-title" data-film={explorerFilm ? 'connected' : 'awaiting-film'}>
    <div className="explorer-viewport">
      <header className="explorer-heading"><p>EXPLORER</p><h2 id="explorer-title">Beyond the <em>known.</em></h2></header>
      <div className="explorer-frame" aria-hidden="true">
        <div className="explorer-atmosphere" />
        {explorerFilm && <video ref={video} src={explorerFilm} muted playsInline preload="auto" />}
        <div className="explorer-shade" />
      </div>
      <div className="explorer-fall-copy"><h3>The fall is part<br />of the journey.</h3><p>Setbacks are part of life.<br />I carry what they teach me forward.</p></div>
      <div className="explorer-dawn" aria-hidden="true" />
      <div className="explorer-rise-copy"><p>STILL CURIOUS. STILL BECOMING.</p><h3>From the unknown,<br /><em>I build forward.</em></h3><p>Every attempt deepens what I understand.<br />Every lesson expands what I can create.</p></div>
    </div>
    <div className="explorer-capabilities"><p>WHAT I BRING TO THE JOURNEY</p><h3>Curiosity becomes <em>capability.</em></h3><div><span>AI & CREATIVE EXPLORATION</span><span>FRONTEND & MOTION</span><span>BACKEND & AI SERVICES</span><span>FULL-STACK CREATION</span></div></div>
  </section>;
}
