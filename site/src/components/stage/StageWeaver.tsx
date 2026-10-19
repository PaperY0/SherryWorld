'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LifeJournal } from './LifeJournal';
import './stage-weaver.css';
export function StageWeaver({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(host.querySelector('.weaver-window'), { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      const timeline = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true } });
      timeline.fromTo(host.querySelector('.weaver-title'), { scale: 1, opacity: 1 }, { scale: 1.15, opacity: .38, duration: 2, ease: 'none' }, .2)
        .fromTo(host.querySelector('.weaver-window'), { opacity: 0, scale: .78, y: 45 }, { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'power2.out' }, .7)
        .fromTo(host.querySelectorAll('.weaver-scattered-frame'), { opacity: 0, y: 65 }, { opacity: .5, y: 0, stagger: .08, duration: 1.6 }, .6)
        .to({}, { duration: 1.3 }, 2.5);
      host.dataset.motionReady = 'true';
      return () => { delete host.dataset.motionReady; };
    }, host);
    return () => media.revert();
  }, [enabled]);
  return <section ref={root} id="stage-weaver" className="stage-weaver" aria-labelledby="weaver-title">
    <div className="weaver-viewport">
      <div className="weaver-halo" aria-hidden="true" />
      <header className="weaver-title"><p>03 / THE LIFE BETWEEN CREATIONS</p><h2 id="weaver-title"><em>Weaver</em><span>LIFE IN MOMENTS</span></h2></header>
      <div className="weaver-scattered" aria-hidden="true">{Array.from({length:7},(_,i)=><span className={`weaver-scattered-frame scattered-${i}`} key={i}/>)}</div>
      <button className="weaver-window" onClick={()=>setOpen(true)} aria-label="Open Weaver life journal">
        <span className="weaver-window-top">SHERRY / A PERSONAL JOURNAL</span>
        <span className="weaver-window-art" aria-hidden="true"><i/><i/><i/></span>
        <span className="weaver-window-script">Little things,<br />a full life.</span>
        <span className="weaver-window-link">OPEN MY JOURNAL <span aria-hidden="true">↗</span></span>
      </button>
      <p className="weaver-intro">Journeys, everyday rituals and small discoveries.<br />The threads that make a life my own.</p>
      <button className="weaver-open" onClick={()=>setOpen(true)}>EXPLORE MY LIFE <span aria-hidden="true">↗</span></button>
    </div>
    <LifeJournal open={open} onClose={()=>setOpen(false)} />
  </section>;
}
