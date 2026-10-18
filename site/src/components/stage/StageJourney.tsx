'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './stage-journey.css';
const chapters = [
  { title: 'AI Exploration', label: 'IMAGINATION INTO POSSIBILITY', text: 'I use AI to explore ideas, shape visual worlds and build intelligent interactions. Curiosity becomes a workflow: imagine, experiment, refine—and give an idea its first tangible form.', tags: 'AI WORKFLOWS / GENERATIVE VISUALS / INTELLIGENT INTERACTION' },
  { title: 'Motion & Interfaces', label: 'DETAILS THAT MAKE IT FEEL ALIVE', text: 'With Vue and motion, I turn structure into an experience. Typography, transitions and small interactions work together to make each interface feel considered, fluid and inviting to explore.', tags: 'VUE.JS / INTERACTION / MOTION ENGINEERING' },
  { title: 'Systems & Intelligence', label: 'A FOUNDATION BENEATH THE SURFACE', text: 'Behind the experience, I build with Java, Spring Boot and Python. APIs, backend services and AI integration connect what people see with the systems that make it work.', tags: 'JAVA / SPRING BOOT / PYTHON / AI SERVICES' },
  { title: 'Connected Creation', label: 'FROM THE FIRST IDEA TO THE WORKING WHOLE', text: 'I bring the pieces together—from the interface to the service behind it. Each project is a chance to test what I know, discover what I do not, and build something more complete.', tags: 'FULL-STACK ARCHITECTURE / INTEGRATION / CONTINUOUS LEARNING' },
];
export function StageJourney({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
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
      gsap.fromTo(host.querySelector('.journey-light'), { opacity: .5 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom bottom', scrub: .8 } });
    }, host);
    return () => media.revert();
  }, [enabled]);
  const words = (text: string) => text.split(/(\s+)/).map((word, index) => /^\s+$/.test(word) ? word : <span className="journey-word-mask" key={index}><span data-journey-word>{word}</span></span>);
  return <section ref={root} className="stage-journey" aria-labelledby="journey-title" id="stage-journey">
    <div className="journey-light" aria-hidden="true" />
    <header className="journey-intro">
      <p className="journey-eyebrow">EXPLORER / WHAT I BRING FORWARD</p>
      <h2 id="journey-title" data-journey-reveal>{words('Every experience becomes')}<br /><em>{words('something I can create.')}</em></h2>
      <p className="journey-intro-note" data-journey-reveal>{words('The unknown asks me to learn. The setbacks ask me to adapt. What remains is a growing ability to turn curiosity into something real.')}</p>
    </header>
    <div className="journey-chapters">{chapters.map((chapter, index) => <article className={`journey-chapter chapter-${index}`} key={chapter.title}>
      <div className="journey-chapter-copy">
        <p className="journey-eyebrow" data-journey-reveal>{words(chapter.label)}</p>
        <h3 data-journey-reveal>{words(chapter.title)}</h3>
        <p className="journey-description" data-journey-reveal>{words(chapter.text)}</p>
        <p className="journey-tags" data-journey-reveal>{words(chapter.tags)}</p>
      </div>
    </article>)}</div>
    <footer className="journey-end"><p>CRAFTER / EXPLORER / WEAVER</p><h3 data-journey-reveal>{words('Always learning.')}<br /><em>{words('Always becoming.')}</em></h3></footer>
  </section>;
}
