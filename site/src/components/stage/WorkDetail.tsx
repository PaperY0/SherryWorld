'use client';
import { useEffect, useRef } from 'react';
import type { StageWork } from './stage-portfolio';
import { WorkCover } from './WorkCover';

export function WorkDetail({ work, onClose }: { work: StageWork | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  useEffect(() => {
    const host = dialog.current;
    if (!host || !work) return;
    closing.current = false;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    host.showModal();
    const animation = !matchMedia('(prefers-reduced-motion: reduce)').matches ? host.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'cubic-bezier(.76,0,.24,1)' }) : null;
    return () => { animation?.cancel(); host.close(); document.documentElement.style.overflow = overflow; };
  }, [work]);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (!dialog.current || matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    void dialog.current.animate([{ clipPath: 'inset(0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 600, easing: 'cubic-bezier(.76,0,.24,1)' }).finished.then(onClose).catch(onClose);
  };
  return <dialog ref={dialog} className="stage-work-detail" aria-labelledby="work-detail-title" onCancel={event => { event.preventDefault(); close(); }}>
    {work && <>
      <button className="stage-work-detail-close" autoFocus onClick={close} aria-label="Close project details">CLOSE ×</button>
      <div className="stage-work-detail-cover"><WorkCover work={work} eager /></div>
      <div className="stage-work-detail-copy"><p>{work.category}</p><h2 id="work-detail-title">{work.name}</h2><p>{work.detail}</p><ul>{work.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><a href={work.github} target="_blank" rel="noopener noreferrer">EXPLORE ON GITHUB ↗</a></div>
    </>}
  </dialog>;
}
