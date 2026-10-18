import './stage-capabilities.css';

export const capabilityPanels = [
  { title: 'AI MASTER', key: 'ai-master', points: ['Hyper-Efficiency Workflow', 'Mind-to-Reality AI Coding', 'Interactive AI Integration', 'Generative Visual Spectacle'] },
  { title: 'CODE CRAFT', key: 'code-craft', points: ['Vue.js & Motion Engineering', 'Java & Spring Boot Backend', 'Python & AI Service Engineering', 'End-to-End Full-Stack Architecture'] },
];
const images = ['ribbon.png', 'butterflies.png', 'heart-nebula.png', 'roses.png'];

export function StageCapabilities() {
  return <div className="stage-capabilities">
    <div className="stage-capability-pictures" aria-hidden="true">
      {images.map((image, i) => <div className={`stage-capability-image image-${i}`} key={image}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/stage/capability-mood/${image}`} alt="" width="600" height="800" loading="lazy" decoding="async" />
      </div>)}
    </div>
    {capabilityPanels.map(panel => <section className="stage-capability-panel" data-panel={panel.key} key={panel.key} aria-label={panel.title}>
      <h3 className="stage-capability-title" aria-label={panel.title}>
        {[...panel.title].map((char, i) => <span data-capability-char data-word-gap={char === ' ' ? true : undefined} aria-hidden="true" key={i}>{char === ' ' ? '\u00a0' : char}</span>)}
      </h3>
      <ul className="stage-capability-points">{panel.points.map(point => <li key={point} aria-label={point}><span data-capability-point aria-hidden="true">{[...point].map((char, index) => <span data-point-char data-letter={index} key={index}>{char === ' ' ? '\u00a0' : char}</span>)}</span></li>)}</ul>
    </section>)}
  </div>;
}
