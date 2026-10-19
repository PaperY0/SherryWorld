'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LifeJournal } from './LifeJournal';
import './stage-weaver.css';
export function StageWeaver({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const doorCopy = <div className="weaver-door-copy"><p className="weaver-eyebrow">03 / THE LIFE BETWEEN CREATIONS</p><div className="weaver-door-title"><em>Weaver</em><span>LIFE IN MOMENTS</span></div><p className="weaver-door-note">Journeys, everyday rituals and small discoveries.<br />The threads that make a life my own.</p></div>;
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(host.querySelector('.weaver-window'), { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      // The reference slides two opaque half-viewports, each clipping one full-width title.
      // The scene exists behind the doors throughout; no card entrance or aperture scaling.
      const timeline = gsap.timeline({
        onUpdate: () => { host.dataset.doorProgress = String(timeline.progress()); },
        scrollTrigger: { trigger: host, start: 'top top', end: 'bottom bottom', scrub: .4, invalidateOnRefresh: true, onUpdate: trigger => { host.dataset.scrollProgress = String(trigger.progress); } },
      });
      timeline.fromTo(host.querySelector('.weaver-door-left'), { xPercent: 0 }, { xPercent: -100, duration: 1, ease: 'none' }, .15)
        .fromTo(host.querySelector('.weaver-door-right'), { xPercent: 0 }, { xPercent: 100, duration: 1, ease: 'none' }, .15)
        .to(host.querySelector('.weaver-door-left'), { xPercent: 0, duration: 1, ease: 'none' }, 3)
        .to(host.querySelector('.weaver-door-right'), { xPercent: 0, duration: 1, ease: 'none' }, 3)
        .to({}, { duration: .3 }, 4);
      host.dataset.doorProgress = '0';
      host.dataset.scrollProgress = '0';
      host.dataset.motionReady = 'true';
      return () => { delete host.dataset.motionReady; };
    }, host);
    return () => media.revert();
  }, [enabled]);
  return <section ref={root} id="stage-weaver" className="stage-weaver" aria-labelledby="weaver-title">
    <div className="weaver-viewport">
      <h2 className="weaver-accessible-title" id="weaver-title">Weaver — Life in moments</h2>
      <div className="weaver-scene">
      <div className="weaver-halo" aria-hidden="true" />
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
      <div className="weaver-doors" aria-hidden="true">
        <div className="weaver-door weaver-door-left">{doorCopy}</div>
        <div className="weaver-door weaver-door-right">{doorCopy}</div>
      </div>
    </div>
    <LifeJournal open={open} onClose={()=>setOpen(false)} />
  </section>;
}
