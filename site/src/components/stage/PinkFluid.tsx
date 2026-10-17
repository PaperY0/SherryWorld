'use client';
import { useEffect, useRef, useState } from 'react';

export function PinkFluid({ reduced }: { reduced: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = matchMedia('(pointer: fine)');
    const sync = () => setFine(query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!fine || reduced) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      frame.current?.contentWindow?.postMessage({ type: 'sherry-pointer', x: event.clientX, y: event.clientY }, location.origin);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine, reduced]);
  // Separate browsing context owns the upstream library's RAF/listeners/GL.
  // Removing it disposes that runtime without leaking global event handlers.
  return fine && !reduced ? <iframe ref={frame} className="stage-fluid" src="/effects/pink-fluid.html" title="Pink mouse trail" tabIndex={-1} aria-hidden="true" /> : null;
}
