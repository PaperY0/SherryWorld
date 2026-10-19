'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-explorer.css';
import { StageJourney } from './StageJourney';

const explorerFilm = '/videos/explorer/fall-awakening-v2.mp4';
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
      let visible = false, playingPhase = false, pendingPlay = false;
      const syncPlayback = () => {
        const film = video.current;
        if (!film) return;
        if (!visible || !playingPhase || document.hidden) { film.pause(); return; }
        if (film.paused && !film.ended && !pendingPlay) {
          pendingPlay = true;
          void film.play().then(() => { host.dataset.videoState = 'playing'; }).catch(() => { host.dataset.videoState = 'blocked'; }).finally(() => { pendingPlay = false; if (!visible || !playingPhase) film.pause(); });
        }
      };
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncPlayback(); }, { threshold: .2 });
      observer.observe(host.querySelector('.explorer-viewport')!);
      video.current?.addEventListener('loadeddata', syncPlayback);
      document.addEventListener('visibilitychange', syncPlayback);
      const squareSize = () => Math.min(innerWidth * (innerWidth <= 700 ? .76 : .38), innerHeight * .52);
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: host.querySelector('.explorer-film-track'), start: 'top top', end: 'bottom bottom', scrub: .65,
        onUpdate: self => { host.dataset.explorerProgress = self.progress.toFixed(3); },
      }});
      timeline.fromTo(select('.explorer-frame'), { y: () => innerHeight * .9, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, .1)
        .fromTo(select('.explorer-frame'), { width: squareSize, height: squareSize, borderRadius: 3 }, { width: '100vw', height: '100svh', top: '50%', borderRadius: 0, duration: 2, ease: 'power2.inOut' }, 1.8)
        .to(select('.explorer-heading'), { opacity: 0, y: -65, duration: 1 }, 2)
        .to(select('.explorer-shade'), { opacity: .92, duration: 2.8 }, 4.2)
        .fromTo(select('.explorer-fall-copy'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 1 }, 4.7)
        .to(select('.explorer-fall-copy'), { opacity: 0, y: -30, duration: .8 }, 7)
        .fromTo(select('.explorer-continuous-light'), { opacity: 0 }, { opacity: () => innerWidth <= 700 ? .55 : .62, duration: 1.6, ease: 'sine.inOut' }, 7.8)
        .to(select('.explorer-frame'), { opacity: 0, duration: 1.6, ease: 'none' }, 7.8)
        .fromTo(select('.explorer-rise-copy'), { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 9.65)
        .to({}, { duration: .75 }, 10.85);
      timeline.eventCallback('onUpdate', () => {
        // Preview plays in real time after the square has entered; scroll only controls its frame.
        playingPhase = timeline.time() >= .95 && timeline.time() < 9.4;
        syncPlayback();
      });
      return () => {
        observer.disconnect(); video.current?.removeEventListener('loadeddata', syncPlayback);
        document.removeEventListener('visibilitychange', syncPlayback); video.current?.pause();
      };
    }, host);
    return () => { zone.disconnect(); media.revert(); };
  }, [enabled]);
  return <section className="stage-explorer" id="stage-explorer" ref={root} aria-labelledby="explorer-title" data-film={explorerFilm ? 'connected' : 'awaiting-film'}>
    <div className="explorer-continuous-light" aria-hidden="true" />
    <div className="explorer-film-track"><div className="explorer-viewport">
      <header className="explorer-heading"><p>EXPLORER</p><h2 id="explorer-title">Beyond the <em>known.</em></h2></header>
      <div className="explorer-frame">
        <div className="explorer-atmosphere" />
        {explorerFilm && <video ref={video} src={explorerFilm} poster="/videos/explorer/fall-awakening-v2-poster.jpg" muted playsInline preload="metadata" width="1280" height="720" aria-label="Explorer descent and awakening film" />}
        <div className="explorer-shade" aria-hidden="true" />
        <button className="explorer-video-play" onClick={() => { void video.current?.play().then(() => { if (root.current) root.current.dataset.videoState = 'playing'; }); }}>PLAY FILM ▷</button>
      </div>
      <div className="explorer-fall-copy"><h3>The fall is part<br />of the journey.</h3><p>Setbacks are part of life.<br />I carry what they teach me forward.</p></div>
      <div className="explorer-dawn" aria-hidden="true" />
      <div className="explorer-rise-copy"><p>STILL CURIOUS. STILL BECOMING.</p><h3>From the unknown,<br /><em>I build forward.</em></h3><p>Every attempt deepens what I understand.<br />Every lesson expands what I can create.</p></div>
    </div>
    </div>
    <StageJourney enabled={enabled} />
  </section>;
}
