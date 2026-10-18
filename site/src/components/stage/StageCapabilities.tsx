import './stage-capabilities.css';

export const capabilityPanels = [
  { title: 'UI - UX', key: 'uiux', points: ['UIUX', '3D Web development', 'Problem Solver', 'User Research'] },
  { title: '3D WEB', key: 'web3d', points: ['Frontend Engineering', 'Three.js / WebGL', 'GSAP Animation', 'Performance Optimization'] },
];
const images = ['SERVICES-1-DNEv9Ogg.avif', 'SERVICES-2-B2qkzeiI.avif', 'SERVICES-3-D3H0TtUe.avif', 'SERVICES-5-B-pgnAEq.avif'];

export function StageCapabilities() {
  return <div className="stage-capabilities">
    <div className="stage-capability-pictures" aria-hidden="true">
      {images.map((image, i) => <div className={`stage-capability-image image-${i}`} key={image}>
        {/* Reference images retained for this layout study; replace with Sherry assets later. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/stage/reference-services/${image}`} alt="" width="600" height="800" loading="lazy" decoding="async" />
      </div>)}
    </div>
    {capabilityPanels.map(panel => <section className="stage-capability-panel" data-panel={panel.key} key={panel.key} aria-label={panel.title}>
      <h3 className="stage-capability-title" aria-label={panel.title}>
        {[...panel.title].map((char, i) => <span data-capability-char aria-hidden="true" key={i}>{char === ' ' ? '\u00a0' : char}</span>)}
      </h3>
      <ul className="stage-capability-points">{panel.points.map(point => <li key={point}><span data-capability-point>{point}</span></li>)}</ul>
    </section>)}
  </div>;
}
