'use client';
import { useEffect, useId, useRef, useState } from 'react';

// Reveal the selected bitmap, rather than replacing it with a script font.
// Paths follow the visible pen direction; the completed state is the exact original.
const strokes = [
  'M344 333 C382 295 382 267 351 240 C326 213 296 226 274 244 C253 264 226 292 222 313 C213 338 238 365 254 389 L299 448 C325 479 325 502 306 514 C267 539 188 546 169 532 C152 521 191 480 236 446',
  'M389 331 L484 267 L369 525 C402 488 451 445 504 425 C511 427 490 455 481 477 C470 501 483 515 512 503 L554 487',
  'M554 487 C565 452 573 425 594 418 C620 407 623 421 608 444 C594 465 573 479 552 490 C541 510 561 512 580 503 L644 471 L681 446',
  'M677 448 L724 412 L681 505 C714 462 752 435 784 421 L821 407 C838 412 821 428 816 437 L794 482 C779 519 801 493 827 464',
  'M827 464 C856 431 901 398 933 391 C947 388 931 411 920 427 C902 452 881 485 897 494 C924 514 971 451 1002 426',
  'M1002 426 C1001 467 982 499 973 520 C960 558 949 599 931 626 C921 653 910 682 893 701 C883 718 872 730 857 732 C842 737 842 724 850 706',
  'M850 706 C863 668 890 627 913 596 C933 567 951 543 972 522 C1016 477 1074 429 1124 398',
];
const durations = [680, 480, 480, 480, 480, 400, 340];
export function Signature({ replay, reduced, label, enabled = true, onWritten }: { replay: number; reduced: boolean; label: string; enabled?: boolean; onWritten?: () => void }) {
  const id = useId().replaceAll(':', '');
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    if (reduced || !enabled) return;
    let active = true;
    setComplete(false);
    const animations = paths.current.map((path, i) => {
      const length = path?.getTotalLength() ?? 1;
      const delay = 600 + durations.slice(0, i).reduce((a, b) => a + b, 0);
      return path?.animate([{ strokeDasharray: `${length}`, strokeDashoffset: length }, { strokeDasharray: `${length}`, strokeDashoffset: 0 }], { duration: durations[i], delay, fill: 'both', easing: 'linear' });
    });
    const last = animations.at(-1);
    last?.finished.then(() => { if (active) { setComplete(true); onWritten?.(); } }).catch(() => {});
    return () => { active = false; animations.forEach(a => a?.cancel()); };
  }, [replay, reduced, enabled, onWritten]);
  const done = reduced || complete;
  return <div className="stage-signature" data-state={done ? 'complete' : 'writing'}>
    <svg viewBox="140 190 1020 570" role="img" aria-label={label}>
      <defs>
        {/* Disjoint lower-loop regions stop the descending pen revealing the return stroke. */}
        <clipPath id={`down-${id}`}><path d="M0 0H1280V961H820V739L857 735L872 720L879 700L886 680L896 660L906 640L916 620L926 600L935 580L943 560H0Z" /></clipPath>
        <clipPath id={`return-${id}`}><path d="M0 0H1280V560H943L935 580L926 600L916 620L906 640L896 660L886 680L879 700L872 720L857 735L820 739V961H0Z" /></clipPath>
        <mask id={`pen-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="961">
        <g fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round">
          {strokes.map((d, i) => <g key={d} clipPath={i === 5 ? `url(#down-${id})` : i === 6 ? `url(#return-${id})` : undefined}><path d={d} data-pen={i} ref={el => { paths.current[i] = el; }} /></g>)}
        </g>
      </mask></defs>
      <image href="/images/sherry-signature-selected.png" width="1280" height="961" mask={done ? undefined : `url(#pen-${id})`} />
    </svg>
  </div>;
}
