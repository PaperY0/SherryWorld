'use client';
import { useFadingDialog } from './useFadingDialog';
import type { StageWork } from './stage-portfolio';
import { WorkCover } from './WorkCover';

export function WorkDetail({ work, onClose }: { work: StageWork | null; onClose: () => void }) {
  const { dialog, close } = useFadingDialog(work?.slug ?? null, onClose);
  return <dialog ref={dialog} className="stage-work-detail" aria-labelledby="work-detail-title" onCancel={event => { event.preventDefault(); close(); }}>
    {work && <>
      <button className="stage-work-detail-close" autoFocus onClick={close} aria-label="Close project details">CLOSE ×</button>
      <div className="stage-work-detail-cover"><WorkCover work={work} eager /></div>
      <div className="stage-work-detail-copy"><p>{work.category}</p><h2 id="work-detail-title">{work.name}</h2><p>{work.detail}</p><ul>{work.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><a href={work.github} target="_blank" rel="noopener noreferrer">EXPLORE ON GITHUB ↗</a></div>
    </>}
  </dialog>;
}
