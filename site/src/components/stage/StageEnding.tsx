'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-ending.css';

const email = '19511635329@163.com';
export function StageEnding({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
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
  return <section ref={root} className="stage-ending" id="stage-ending" aria-labelledby="ending-title">
    <div className="ending-viewport">
      <svg className="ending-thread-art" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" aria-hidden="true"><path className="ending-thread" pathLength="1000" d="M-80 710C170 840 275 130 650 215S1270 790 1510 335" /></svg>
      <div className="ending-topline"><span>PERSONAL SPACE / SHERRY</span><span>THE NEXT CHAPTER IS UNWRITTEN.</span></div>
      <header className="ending-heading"><p data-ending-reveal>CRAFTER. EXPLORER. WEAVER.</p><h2 id="ending-title" aria-label="EVERY TEXTURED LIFE IS AN UNFINISHED MASTERPIECE."><span data-ending-reveal>EVERY TEXTURED LIFE</span>{' '}<span data-ending-reveal>IS AN UNFINISHED</span>{' '}<em data-ending-reveal>MASTERPIECE.</em></h2></header>
      <div className="ending-callout" data-ending-reveal>
        <div className="ending-contact-row">
          <a className="ending-weave" href={`mailto:${email}`}>WEAVE WITH ME <span aria-hidden="true">↗</span></a>
          <div className="ending-connect"><a className="ending-email" href={`mailto:${email}`}>{email} <span aria-hidden="true">↗</span></a><a className="ending-github" href="https://github.com/PaperY0" target="_blank" rel="noreferrer">GITHUB <span aria-hidden="true">↗</span></a></div>
        </div>
        <p className="ending-invitation">Let’s craft the unseen, explore the unknown, and weave new stories together.</p>
      </div>
      <div className="ending-wordmark" aria-hidden="true">Sherry</div>
    </div>
  </section>;
}
