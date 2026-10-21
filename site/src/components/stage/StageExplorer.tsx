'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-explorer.css';
import { StageJourney } from './StageJourney';
import { mountExplorerFilm } from './explorer-film-motion';

const explorerFilm = '/videos/explorer/fall-awakening-v4.mp4';
export function StageExplorer({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => mountExplorerFilm(host, video.current!));
    return () => { media.revert(); };
  }, [enabled]);
  return <section className="stage-explorer" id="stage-explorer" ref={root} aria-labelledby="explorer-title" data-film={explorerFilm ? 'connected' : 'awaiting-film'}>
    <div className="explorer-continuous-light" aria-hidden="true" />
    <div className="explorer-film-track"><div className="explorer-viewport">
      <header className="explorer-heading"><p>EXPLORER</p><h2 id="explorer-title">Beyond all <em>boundaries.</em></h2></header>
      <div className="explorer-frame">
        <div className="explorer-atmosphere" />
        {explorerFilm && <video ref={video} src={explorerFilm} poster="/videos/explorer/fall-awakening-v4-poster.jpg" muted playsInline preload="metadata" width="1280" height="720" aria-label="Explorer descent and awakening film" />}
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
