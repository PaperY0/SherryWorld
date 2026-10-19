'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-ending.css';

const email = '19511635329@163.com';
export function StageEnding({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [copyState, setCopyState] = useState('');
  const clearMessage = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (clearMessage.current) clearTimeout(clearMessage.current); }, []);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current, media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true } });
      timeline.fromTo(host.querySelectorAll('[data-ending-reveal]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1, stagger: .12, ease: 'power2.out' }, .1)
        .fromTo(host.querySelector('.ending-thread'), { strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 2.3, ease: 'none' }, 0)
        .fromTo(host.querySelector('.ending-wordmark'), { xPercent: 3 }, { xPercent: -4, duration: 3, ease: 'none' }, 0)
        .to({}, { duration: .8 }, 3);
      host.dataset.motionReady = 'true';
      return () => { delete host.dataset.motionReady; };
    }, host);
    return () => media.revert();
  }, [enabled]);
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id); if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    const heading = target.querySelector<HTMLElement>('h1,h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(email); setCopyState('EMAIL COPIED'); }
    catch { setCopyState(`Copy this email: ${email}`); }
    if (clearMessage.current) clearTimeout(clearMessage.current);
    clearMessage.current = setTimeout(() => setCopyState(''), 4000);
  };
  return <section ref={root} className="stage-ending" id="stage-ending" aria-labelledby="ending-title">
    <div className="ending-viewport">
      <svg className="ending-thread-art" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" aria-hidden="true"><path className="ending-thread" pathLength="1000" d="M-80 710C170 840 275 130 650 215S1270 790 1510 335" /></svg>
      <div className="ending-topline"><span>PERSONAL SPACE / SHERRY</span><span>THE NEXT CHAPTER IS UNWRITTEN.</span></div>
      <header className="ending-heading"><p data-ending-reveal>CRAFTER. EXPLORER. WEAVER.</p><h2 id="ending-title" aria-label="EVERY TEXTURED LIFE IS AN UNFINISHED MASTERPIECE."><span data-ending-reveal>EVERY TEXTURED LIFE</span>{' '}<span data-ending-reveal>IS AN UNFINISHED</span>{' '}<em data-ending-reveal>MASTERPIECE.</em></h2><a className="ending-weave" data-ending-reveal href={`mailto:${email}`}>WEAVE WITH ME <span aria-hidden="true">↗</span></a></header>
      <div className="ending-connect" data-ending-reveal>
        <a className="ending-email" href={`mailto:${email}`}><span>{email}</span><span aria-hidden="true">↗</span></a>
        <div className="ending-contact-actions"><button onClick={copyEmail}>COPY EMAIL</button><a href="https://github.com/PaperY0" target="_blank" rel="noreferrer">GITHUB <span aria-hidden="true">↗</span></a></div>
        <p className="ending-copy-status" role="status" aria-live="polite">{copyState}</p>
      </div>
      <footer className="ending-footer" data-ending-reveal><p>© 2026 SHERRY</p><nav aria-label="Final page navigation"><a href="#stage-legacy" onClick={event => navigate(event, 'stage-legacy')}>CRAFTER</a><a href="#stage-explorer" onClick={event => navigate(event, 'stage-explorer')}>EXPLORER</a><a href="#stage-weaver" onClick={event => navigate(event, 'stage-weaver')}>WEAVER</a></nav><a className="ending-back-top" href="#top" onClick={event => navigate(event, 'top')}>BACK TO TOP <span aria-hidden="true">↑</span></a></footer>
      <div className="ending-wordmark" aria-hidden="true">Sherry</div>
    </div>
  </section>;
}
