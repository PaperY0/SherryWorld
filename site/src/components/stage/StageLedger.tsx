'use client';
import { useEffect, useRef } from 'react';

export function StageLedger({ reduced, enabled }: { reduced: boolean; enabled: boolean }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => { frame = 0; bar.current?.style.setProperty('--ledger-turn', `${scrollY * .3}deg`); };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', scroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll); };
  }, [enabled, reduced]);
  return <div ref={bar} className="stage-ledger" aria-hidden="true"><span>＋</span><span>CRAFTER</span><span>＋</span><span>EXPLORER</span><span>＋</span><span>WEAVER</span><span>＋</span></div>;
}
