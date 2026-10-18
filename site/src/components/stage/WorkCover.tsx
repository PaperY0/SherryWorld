import Image from 'next/image';
import type { StageWork } from './stage-portfolio';

export function WorkCover({ work, eager = false }: { work: StageWork; eager?: boolean }) {
  return <div className={`stage-work-cover cover-${work.slug}`}>
    <Image className="stage-work-image" src={work.image} fill sizes="(max-width: 700px) 88vw, 45vw" alt="" loading={eager ? 'eager' : 'lazy'} />
    {work.slug !== 'lumi' && work.slug !== 'zhiye' && <>
      <span className="stage-work-cover-label">{work.category}</span>
      <span className="stage-work-cover-title">{work.title}</span>
      <span className="stage-work-cover-signature">Sherry</span>
    </>}
  </div>;
}
