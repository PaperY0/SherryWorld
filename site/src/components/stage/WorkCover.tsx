import Image from 'next/image';
import type { StageWork } from './stage-portfolio';

export function WorkCover({ work, eager = false }: { work: StageWork; eager?: boolean }) {
  return <div className={`stage-work-cover cover-${work.slug}`}>
    {work.slug === 'lumi' ? <div className="work-lumi-art" aria-hidden="true"><div className="work-lumi-orbit" /><Image src={work.image} width={64} height={64} alt="" loading={eager ? 'eager' : 'lazy'} /><span>Lumi</span></div> : <Image className="stage-work-image" src={work.image} fill sizes="(max-width: 700px) 88vw, 45vw" alt="" loading={eager ? 'eager' : 'lazy'} />}
    <span className="stage-work-cover-label">{work.category}</span>
    <span className="stage-work-cover-title">{work.title}</span>
    <span className="stage-work-cover-signature">Sherry</span>
  </div>;
}
