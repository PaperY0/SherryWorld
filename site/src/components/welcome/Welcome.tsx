'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../settings/PreferencesProvider';
import './welcome.css';

type Phase = 'opening' | 'idle' | 'gesture' | 'ready' | 'blocked';
const IDLE_START = 3.65;
const GESTURE_START = 4.75;

export function Welcome() {
  const { locale } = usePreferences();
  const zh = locale === 'zh';
  const stage = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const phaseRef = useRef<Phase>('opening');
  const requested = useRef(false);
  const reduced = useRef(false);
  const failed = useRef(false);
  const [phase, setPhase] = useState<Phase>('opening');
  const [mediaFailed, setMediaFailed] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);
  const [entering, setEntering] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const play = useCallback(() => {
    const el = video.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {
      if (!reduced.current && !failed.current) changePhase('blocked');
    });
  }, [changePhase]);

  const startGesture = useCallback(() => {
    requested.current = true;
    if (reduced.current || failed.current) { changePhase('ready'); return; }
    if (phaseRef.current === 'opening') return;
    if (phaseRef.current === 'gesture' || phaseRef.current === 'ready') return;
    const el = video.current;
    if (!el || el.readyState < 1) return;
    el.currentTime = GESTURE_START;
    changePhase('gesture');
    play();
  }, [changePhase, play]);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => {
      reduced.current = preference.matches;
      setMotionReduced(preference.matches);
      if (preference.matches) { el.pause(); changePhase('ready'); }
    };
    applyMotion();
    preference.addEventListener('change', applyMotion);
    let frame = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (!reduced.current && !failed.current) {
        if (phaseRef.current === 'opening' && el.currentTime >= IDLE_START) {
          changePhase('idle');
          if (requested.current) startGesture();
        }
        if (phaseRef.current === 'idle' && el.currentTime >= GESTURE_START) el.currentTime = IDLE_START;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onScroll = () => {
      const rect = stage.current?.getBoundingClientRect();
      if (rect && rect.top < -70 && rect.bottom > innerHeight) startGesture();
    };
    const onHash = () => {
      if (location.hash !== '#top') return;
      requested.current = false;
      if (reduced.current || failed.current) return;
      el.currentTime = 0;
      changePhase('opening');
      play();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onHash);
    // Media can finish loading (or fail) before React hydrates its event handlers.
    const fallback = () => {
      failed.current = true;
      el.pause();
      setMediaFailed(true);
      changePhase('ready');
    };
    el.addEventListener('error', fallback);
    if (el.error) fallback();
    else if (!reduced.current && el.readyState >= 2) play();
    const loadTimeout = setTimeout(() => {
      if (el.readyState < 2 && phaseRef.current !== 'ready') fallback();
    }, 12000);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', applyMotion);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onHash);
      el.removeEventListener('error', fallback);
      clearTimeout(loadTimeout);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      el.pause();
    };
  }, [changePhase, play, startGesture]);

  function onReady() {
    if (reduced.current || failed.current || phaseRef.current === 'ready') return;
    play();
  }

  function onError() {
    failed.current = true;
    setMediaFailed(true);
    changePhase('ready');
  }

  const ready = phase === 'ready';
  return <section ref={stage} className={`welcome-stage${entering ? ' is-entering' : ''}`} id="top" data-phase={phase}
    aria-label={zh ? '欢迎来到 PaperY 的个人世界' : 'Welcome to PaperY’s world'}>
    <div className="welcome-sticky">
      <div className="welcome-canvas">
        <video ref={video} className="welcome-film" data-clip="welcome" src="/videos/welcome/welcome-light.mp4"
          poster="/videos/welcome/poster-start.jpg" muted playsInline preload="auto" disablePictureInPicture
          aria-label={zh ? 'PaperY 睁眼、单眼 wink 与双指手势欢迎视频' : 'PaperY opening, wink and two-finger gesture'}
          onCanPlay={onReady} onEnded={() => changePhase('ready')} onError={onError}
          style={{ visibility: mediaFailed || motionReduced ? 'hidden' : 'visible' }} />
        {(mediaFailed || motionReduced) && /* eslint-disable-next-line @next/next/no-img-element */
          <img className="welcome-poster" src="/videos/welcome/poster-end.jpg" alt={zh ? 'PaperY 双指指向左上方' : 'PaperY pointing diagonally upward'} />}
        <div className="welcome-invitation" aria-hidden={!ready} inert={!ready}>
          <p className="eyebrow">PAPERY · PERSONAL SPACE</p>
          <h1 aria-label="MY WORLD">MY<br />WORLD<span aria-hidden="true">.</span></h1>
          <a className="pill" href="#about" onClick={event => {
            if (reduced.current) return;
            event.preventDefault();
            if (entering) return;
            setEntering(true);
            transitionTimer.current = setTimeout(() => {
              const about = document.getElementById('about');
              history.pushState(null, '', '#about');
              about?.scrollIntoView({ behavior: 'smooth' });
              about?.focus({ preventScroll: true });
              setEntering(false);
            }, 480);
          }}>EXPLORE <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      {!ready && <div className="welcome-cue">
        <button type="button" onClick={() => {
          if (phase === 'blocked') { changePhase(requested.current ? 'gesture' : 'opening'); play(); }
          else startGesture();
        }} aria-label={phase === 'blocked' ? (zh ? '播放欢迎视频' : 'Play welcome video') : (zh ? '开启我的世界' : 'Enter my world')}>
          <span>{phase === 'blocked' ? (zh ? '点击播放' : 'PLAY') : phase === 'gesture' ? (zh ? '我的世界，即将展开' : 'A WORLD OF MY OWN') : (zh ? '向下滚动，开启我的世界' : 'SCROLL TO DISCOVER')}</span>
          <span className="cue-line" aria-hidden="true" />
        </button>
      </div>}
      <a className="welcome-skip" href="#about">{zh ? '直接进入' : 'SKIP INTRO'} ↗</a>
      <noscript><a href="#about">EXPLORE ↗</a></noscript>
    </div>
  </section>;
}
