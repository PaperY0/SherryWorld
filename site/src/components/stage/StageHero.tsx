'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../settings/PreferencesProvider';
import { Signature } from './Signature';
import { PinkFluid } from './PinkFluid';
import { StageLoader } from './StageLoader';
import './stage.css';

export function StageHero() {
  const { locale } = usePreferences();
  const zh = locale === 'zh';
  const [reduced, setReduced] = useState(false);
  const [loading, setLoading] = useState(true);
  const finishLoading = useCallback(() => setLoading(false), []);
  const rail = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (reduced || loading) return;
    let frame = 0, offset = 0, previous = 0, speed = 1, targetSpeed = 1;
    let pointerX = 0, pointerY = 0, x = 0, y = 0;
    const tick = (time: number) => {
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 0;
      previous = time;
      if (!document.hidden) {
        speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 4));
        targetSpeed += (Math.sign(targetSpeed) - targetSpeed) * (1 - Math.exp(-dt * 2));
        const width = rail.current?.firstElementChild?.getBoundingClientRect().width ?? 1;
        offset = ((offset + 90 * speed * dt) % width + width) % width;
        if (rail.current) rail.current.style.transform = `translate3d(${-offset}px,0,0)`;
        x += (pointerX - x) * (1 - Math.exp(-dt * 5)); y += (pointerY - y) * (1 - Math.exp(-dt * 5));
        if (portrait.current) portrait.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => { if (Math.abs(event.deltaY) > 1) targetSpeed = Math.sign(event.deltaY) * 4; };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = (event.clientX / innerWidth - .5) * 12;
      pointerY = (event.clientY / innerHeight - .5) * 6;
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('pointermove', move);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('wheel', wheel); window.removeEventListener('pointermove', move); };
  }, [reduced, loading]);
  return <main className="stage-page" id="top" data-loading={loading}>
    <section className="stage-hero" aria-labelledby="stage-heading">
      <svg className="stage-filter-defs" aria-hidden="true" width="0" height="0"><defs><filter id="stage-solid-alpha" colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="1.04" intercept="0" /></feComponentTransfer></filter></defs></svg>
      <div className="stage-grain" aria-hidden="true" />
      <h1 id="stage-heading" className="stage-sr">A WORLD OF MY OWN.</h1>
      <div className="stage-marquee" aria-hidden="true"><div ref={rail} className="stage-rail">
        <span>A WORLD OF MY OWN.&nbsp;</span><span>A WORLD OF MY OWN.&nbsp;</span>
      </div></div>
      <div className="stage-portrait" ref={portrait}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/stage/sherry-cutout-v1.png" width="1671" height="941" alt="Sherry" fetchPriority="high" />
      </div>
      <div className="stage-floor" aria-hidden="true" />
      <Signature replay={0} reduced={reduced} enabled={!loading} label={zh ? 'Sherry 手写签名' : 'Sherry handwritten signature'} />
      <div className="stage-ledger" aria-hidden="true"><span>＋</span><span>CRAFTER</span><span>＋</span><span>DESIGNER</span><span>＋</span><span>WEAVER</span><span>＋</span></div>
      {!loading && <PinkFluid reduced={reduced} />}
      {loading && <StageLoader onComplete={finishLoading} zh={zh} />}
    </section>
  </main>;
}
