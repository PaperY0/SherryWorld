'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CityRoseGarden } from './CityRoseGarden';
import { CityAlbum } from './CityAlbum';
import type { CityAlbumData } from './city-albums';
import './stage-weaver.css';
export function StageWeaver({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [city, setCity] = useState<CityAlbumData | null>(null);
  const doorCopy = <div className="weaver-door-copy"><p className="weaver-eyebrow">03 / THE LIFE BETWEEN CREATIONS</p><div className="weaver-door-title"><em>Weaver</em><span>LIFE IN TAPESTRY</span></div><p className="weaver-door-note">Footsteps across cities, flavors on the palate, and an endless curiosity for the world.<br />Interlacing together to weave a full, textured life of my own.</p></div>;
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
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
      <h2 className="weaver-accessible-title" id="weaver-title">Weaver — Life in tapestry</h2>
      <div className="weaver-scene">
        <CityRoseGarden onOpen={setCity} suspended={city !== null} />
      </div>
      <div className="weaver-doors" aria-hidden="true">
        <div className="weaver-door weaver-door-left">{doorCopy}</div>
        <div className="weaver-door weaver-door-right">{doorCopy}</div>
      </div>
    </div>
    <CityAlbum city={city} onClose={()=>setCity(null)} />
  </section>;
}
