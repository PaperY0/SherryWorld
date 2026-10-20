'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-explorer.css';
import { StageJourney } from './StageJourney';

const explorerFilm = '/videos/explorer/fall-awakening-v3.mp4';
export function StageExplorer({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(host);
      // Keep centering relative to the live frame size as it expands.
      gsap.set(select('.explorer-frame'), { xPercent: -50, yPercent: -50, x: 0, y: 0 });
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
        trigger: host.querySelector('.explorer-film-track'), start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true,
        onUpdate: self => { host.dataset.explorerProgress = self.progress.toFixed(3); },
      }});
      timeline.fromTo(select('.explorer-frame'), { y: () => innerHeight * .9, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, .1)
        .fromTo(select('.explorer-frame'), { width: squareSize, height: squareSize, top: '55%', borderRadius: 3 }, { width: '100vw', height: '100svh', top: '50%', borderRadius: 0, duration: 2, ease: 'power2.inOut' }, 1.8)
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
    return () => { media.revert(); };
  }, [enabled]);
  return <section className="stage-explorer" id="stage-explorer" ref={root} aria-labelledby="explorer-title" data-film={explorerFilm ? 'connected' : 'awaiting-film'}>
    <div className="explorer-continuous-light" aria-hidden="true" />
    <div className="explorer-film-track"><div className="explorer-viewport">
      <header className="explorer-heading"><p>EXPLORER</p><h2 id="explorer-title">Beyond all <em>boundaries.</em></h2></header>
      <div className="explorer-frame">
        <div className="explorer-atmosphere" />
        {explorerFilm && <video ref={video} src={explorerFilm} poster="/videos/explorer/fall-awakening-v3-poster.jpg" muted playsInline preload="metadata" width="1280" height="720" aria-label="Explorer descent and awakening film" />}
        <div className="explorer-shade" aria-hidden="true" />
        <button className="explorer-video-play" onClick={() => { void video.current?.play().then(() => { if (root.current) root.current.dataset.videoState = 'playing'; }); }}>PLAY FILM ▷</button>
      </div>
      <div className="explorer-fall-copy"><h3><span>The abyss is the prelude to</span><em>ascension.</em></h3><p>Adversity never breaks the spirit; it tempers the blade.<br />From the ashes, I reforge myself with relentless intention.</p></div>
      <div className="explorer-dawn" aria-hidden="true" />
      <div className="explorer-rise-copy"><p>RELENTLESS EVOLUTION. INFINITE HORIZONS.</p><h3>Through the storm,<br /><em>I forge ahead.</em></h3><p>Every trial deepens my intellectual depth.<br />Every conquest expands the circumference of who I am.</p></div>
    </div>
    </div>
    <StageJourney enabled={enabled} />
  </section>;
}
