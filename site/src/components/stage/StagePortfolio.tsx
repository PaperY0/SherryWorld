'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { StageWork } from './stage-portfolio';
import { useSiteContent } from './SiteContentProvider';
import { WorkCover } from './WorkCover';
import { WorkDetail } from './WorkDetail';
import './stage-portfolio.css';

export function StagePortfolio({ enabled }: { enabled: boolean }) {
  const { projects: stageWorks } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [motion, setMotion] = useState(false);
  const [detail, setDetail] = useState<StageWork | null>(null);
  useEffect(() => {
    const host = root.current;
    if (!host || !enabled || !stageWorks.length) return;
    gsap.registerPlugin(ScrollTrigger);
    let alive = true;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      setMotion(true);
      const cards = [...host.querySelectorAll<HTMLElement>('.stage-work-card')];
      const state = (relative: number) => {
        const mobile = innerWidth <= 700;
        if (relative === 0) return { top: mobile ? '18%' : '25%', scale: 1, opacity: 1, pointerEvents: 'auto', zIndex: 5 };
        if (relative === -1) return { top: mobile ? '-40%' : '-10%', scale: .3, opacity: .4, pointerEvents: 'none', zIndex: 3 };
        if (relative < -1) return { top: '-50%', scale: 0, opacity: 0, pointerEvents: 'none', zIndex: 1 };
        if (relative === 1) return { top: mobile ? '92%' : '60%', scale: .3, opacity: .4, pointerEvents: 'none', zIndex: 3 };
        return { top: mobile ? '120%' : '80%', scale: .1, opacity: 0, pointerEvents: 'none', zIndex: 1 };
      };
      const render = (progress: number, immediate = false) => {
        const position = Math.min(progress * stageWorks.length, stageWorks.length - Number.EPSILON);
        const index = Math.min(Math.floor(position), stageWorks.length - 1);
        const fraction = progress === 1 ? 1 : position - index;
        host.dataset.workProgress = progress.toFixed(4);
        if (ring.current) ring.current.style.strokeDashoffset = String(2 * Math.PI * 35 * (1 - .78 * fraction));
        if (index !== activeRef.current || immediate) {
          activeRef.current = index; setActive(index);
          cards.forEach((card, i) => immediate ? gsap.set(card, state(i - index)) : gsap.to(card, { ...state(i - index), duration: .6, ease: 'power3.out', overwrite: true }));
        }
      };
      render(0, true);
      ScrollTrigger.create({ trigger: host, start: 'top top', end: 'bottom bottom', onUpdate: self => render(self.progress), onRefresh: self => render(self.progress, true) });
      host.dataset.motionReady = 'true';
      void document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => { delete host.dataset.motionReady; setMotion(false); };
    }, host);
    return () => { alive = false; media.revert(); };
  }, [enabled,stageWorks]);
  useEffect(() => {
    if (!motion || !root.current || !stageWorks.length) return;
    const words = root.current.querySelectorAll<HTMLElement>(`.stage-work-item[data-work="${stageWorks[active].slug}"] [data-work-word]`);
    const animations = [...words].map((word, index) => word.animate([{ transform: 'translateY(30px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 550, delay: index * 18, fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)' }));
    return () => animations.forEach(animation => animation.cancel());
  }, [active, motion,stageWorks]);
  const words = (text: string) => text.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <span data-work-word key={i}>{word}</span>);
  if(!stageWorks.length)return <section ref={root} id="stage-work" className="stage-portfolio" style={{minHeight:'100svh',display:'grid',placeItems:'center'}}><h2>New work is taking shape.</h2></section>;
  return <section ref={root} className="stage-portfolio" id="stage-work" data-active-work={stageWorks[active].slug} data-motion={motion} style={{ '--work-height': `${(stageWorks.length + 1) * 100}svh` } as CSSProperties} aria-labelledby="stage-work-title">
    <div className="stage-portfolio-viewport">
      <div className="stage-work-backgrounds" aria-hidden="true">{stageWorks.map((work, index) => <div className={active === index ? 'is-active' : ''} key={work.slug}><Image src={work.image} fill sizes="100vw" alt="" loading={active === index ? 'eager' : 'lazy'} /></div>)}</div>
      <header className="stage-work-heading">
        <h2 id="stage-work-title" className="work-visually-hidden">MY WORK</h2>
        <div className="stage-work-name-window" aria-label={stageWorks[active].name}>
          <div className="stage-work-name-reel" style={{ transform: `translateY(-${active * 100 / stageWorks.length}%)` }} aria-hidden="true">
            {stageWorks.map(work => <span className={`stage-work-name name-${work.slug}`} key={work.slug}>{work.name}</span>)}
          </div>
        </div>
      </header>
      <div className="stage-work-progress" aria-label={`Project ${active + 1} of ${stageWorks.length}`}>
        <svg viewBox="0 0 80 80" aria-hidden="true"><circle ref={ring} cx="40" cy="40" r="35" className="work-progress-ring" strokeDasharray={2 * Math.PI * 35} /></svg>
        <span>{String(active + 1).padStart(2, '0')}</span>
      </div>
      {stageWorks.map((work, index) => <article className={`stage-work-item${active === index ? ' is-active' : ''}`} data-work={work.slug} key={work.slug}>
        <button className="stage-work-card" aria-label={`View ${work.name} project`} tabIndex={!motion || active === index ? 0 : -1} onClick={() => setDetail(work)}>
          <WorkCover work={work} eager={Math.abs(index - active) <= 1} /><span className="stage-work-view">VIEW PROJECT ↗</span>
        </button>
        <div className="stage-work-info" inert={motion && active !== index}>
          <p className="stage-work-category">{work.category}</p><h3 className="work-visually-hidden">{work.name}</h3><p className="stage-work-summary">{words(work.summary)}</p>
          <ul className="stage-work-tags">{work.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
          {work.github && <a className="stage-work-github" href={work.github} target="_blank" rel="noopener noreferrer">EXPLORE ON GITHUB <span aria-hidden="true">↗</span></a>}
        </div>
      </article>)}
    </div>
    <WorkDetail work={detail} onClose={() => setDetail(null)} />
  </section>;
}
