'use client';
import { messages } from '@/content/messages';
import { usePreferences } from './settings/PreferencesProvider';

export function Home() {
  const { locale, theme } = usePreferences();
  const copy = messages[locale];
  return <main>
    <section className="hero" id="top" aria-label={copy.portraitAlt}>
      <div className="soft-glow" aria-hidden="true" />
      <div className="portrait-frame">
        {/* Static concept reference; replace this isolated leaf with a real model scene. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="portrait-image" src={`/images/intro-${theme}-silver-v5.png`} width="1672" height="941" alt={copy.portraitAlt} fetchPriority="high" />
      </div>
    </section>
    <section className="welcome" aria-labelledby="world-title">
      <p className="eyebrow">PAPERY · SHERRY WORLD</p>
      <h1 id="world-title">A WORLD<br /><span>OF</span><br />MY OWN</h1>
      <a className="pill" href="#about">EXPLORE <span aria-hidden="true">↗</span></a>
    </section>
    <section className="about section" id="about">
      <div className="section-caption"><span>01 /</span><h2>{copy.about}</h2></div>
      <div className="about-grid">
        <div><p className="display-name">PaperY<span>{copy.name}</span></p><p className="identity">{copy.identity}</p></div>
        <div className="about-description"><p className="lead">{copy.intro}</p><p className="muted">{copy.aboutText}</p><div className="tags"><span>{copy.role}</span><span>{copy.personality}</span></div></div>
      </div>
    </section>
    <section className="projects section" id="projects">
      <div className="section-caption"><span>02 /</span><h2>{copy.projectsLabel}</h2></div>
      <p className="eyebrow">PAPERY · SELECTED WORKS</p>
      <h3 className="projects-title">BUILT IN MY OWN WAY.</h3>
      <p className="project-intro">{copy.projectsText}</p>
      <a className="text-link" href="https://github.com/PaperY0" target="_blank" rel="noreferrer">{copy.projectsAction}<span aria-hidden="true"> ↗</span></a>
    </section>
    <section className="section" id="interests">
      <div className="section-caption"><span>03 /</span><h2>{copy.interests}</h2></div>
      <p className="section-lead">{copy.interestLead}</p>
      <div className="photo-row">{copy.hobbies.map((hobby, i) => <figure key={i}>
        <div className={`photo-space tone-${i}`}><span className="photo-number">0{i + 1}</span><span>{copy.photo}</span></div>
        <figcaption>{hobby}</figcaption>
      </figure>)}</div>
    </section>
    <section className="section life" id="life">
      <div className="section-caption"><span>04 /</span><h2>{copy.life}</h2></div>
      <div className="life-layout"><p className="section-lead">{copy.lifeLead}</p><div className="life-space"><span>{copy.lifeText}</span></div></div>
    </section>
    <section className="section" id="travel">
      <div className="section-caption"><span>05 /</span><h2>{copy.travel}</h2></div>
      <p className="section-lead">{copy.travelLead}</p>
      <div className="places">{copy.places.map((place, i) => <div className="place" key={i}><span className="muted">0{i + 1}</span><h3>{place}</h3><span className="muted">{copy.photo}</span></div>)}</div>
    </section>
    <section className="section contact" id="contact">
      <div className="section-caption"><span>06 /</span><h2>{copy.contact}</h2></div>
      <p className="section-lead">{copy.contactLead}</p>
      <a className="contact-email" href="mailto:19511635329@163.com">19511635329@163.com <span aria-hidden="true">↗</span></a>
      <a className="text-link" href="https://github.com/PaperY0" target="_blank" rel="noreferrer">GITHUB · PAPERY0 ↗</a>
    </section>
    <footer className="footer"><div><strong>PaperY</strong><span>{copy.footer}</span></div><a href="#top">{copy.back} ↑</a></footer>
  </main>;
}
