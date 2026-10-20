'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-journey.css';
import { SkillExhibition } from './SkillExhibition';
const chapters = [
  { slug: 'mind-laurels', title: 'Mind & Laurels', label: 'INTELLECTUAL RIGOR & HONORS', text: 'Driven by an insatiable thirst for knowledge, I test my mettle in rigorous academic studies and high-stakes competitions. Every complex problem solved and every honor earned is a milestone in my relentless quest for intellectual excellence.', tags: 'CONTINUOUS LEARNING / COMPETITIONS / AWARDS & HONORS' },
  { slug: 'sonic-resonance', title: 'Sonic Resonance', label: 'INSTRUMENTS, VOCALS & HARMONY', text: 'Beyond the realm of logic, music is where my soul speaks unbound. Across diverse instruments and vocal expressions, I explore the architecture of sound—translating raw emotion into melodies that linger in the air.', tags: 'INSTRUMENTS / VOCAL ART / MUSICAL EXPRESSION' },
  { slug: 'kinetic-artistry', title: 'Kinetic Artistry', label: 'CHOREOGRAPHY & DIVERSE STYLES', text: 'Dance is the poetry of the physical form. Venturing through various styles and rhythms, I train my body to command space, tension, and fluidity—turning every beat into a canvas of dynamic self-expression.', tags: 'MULTI-STYLE DANCE / CHOREOGRAPHY / BODY CONTROL' },
  { slug: 'athletic-vigor', title: 'Athletic Vigor', label: 'ENDURANCE, AGILITY & VITALITY', text: 'A sharp mind demands a formidable vessel. Whether slicing through water, pacing the track, or dueling on the court, I embrace diverse sports to push my stamina, reflexes, and willpower to their absolute peak.', tags: 'RACKET & BALL SPORTS / SWIMMING / RUNNING & CARDIO' },
];
export function StageJourney({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [exhibition, setExhibition] = useState<typeof chapters[number] | null>(null);
  useEffect(() => {
    if (!enabled || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      host.querySelectorAll<HTMLElement>('[data-journey-reveal]').forEach(block => {
        gsap.fromTo(block.querySelectorAll('[data-journey-word]'), { yPercent: 110, opacity: 0, filter: 'blur(3px)' }, {
          yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: .035, ease: 'power2.out',
          scrollTrigger: { trigger: block, start: 'top 92%', end: 'top 48%', scrub: .6 },
        });
      });
    }, host);
    return () => media.revert();
  }, [enabled]);
  const words = (text: string) => text.split(/(\s+)/).map((word, index) => /^\s+$/.test(word) ? word : <span className="journey-word-mask" key={index}><span data-journey-word>{word}</span></span>);
  return <section ref={root} className="stage-journey" aria-labelledby="journey-title" id="stage-journey">
    <header className="journey-intro">
      <p className="journey-eyebrow">EXPLORER / MULTI-DIMENSIONAL SELF</p>
      <h2 id="journey-title" data-journey-reveal>{words('Every discipline becomes')}<br /><em>{words('a realm I master.')}</em></h2>
      <p className="journey-intro-note" data-journey-reveal>{words('My pursuit of excellence refuses to be confined to a single lane. From the rigor of academic arenas and competitive honors, to the resonance of music, the kinetic art of dance, and the vitality of athletics—I explore the full spectrum of human potential.')}</p>
    </header>
    <div className="journey-chapters">{chapters.map((chapter, index) => <article className={`journey-chapter chapter-${index}`} key={chapter.title}>
      <div className="journey-chapter-copy">
        <p className="journey-eyebrow" data-journey-reveal>{words(chapter.label)}</p>
        <h3 data-journey-reveal>{words(chapter.title)}</h3>
        <p className="journey-description" data-journey-reveal>{words(chapter.text)}</p>
        <p className="journey-tags" data-journey-reveal>{words(chapter.tags)}</p>
        <button className="journey-explore" onClick={() => setExhibition(chapter)} aria-label={`Explore ${chapter.title} photos`}>EXPLORE <span aria-hidden="true">↗</span></button>
      </div>
    </article>)}</div>
    <footer className="journey-end"><p>CRAFTER / EXPLORER / WEAVER</p><h3 data-journey-reveal>{words('Always learning.')}<br /><em>{words('Always becoming.')}</em></h3></footer>
    <SkillExhibition skill={exhibition} onClose={() => setExhibition(null)} />
  </section>;
}
