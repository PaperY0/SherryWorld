import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Measured against fall-awakening-v4: the turn ends before the ledge gives way;
// the cut from the dark valley back to light is at approximately 12.25 seconds.
const cues = { fall: 5.05, full: 5.55, dark: 8, abyss: 9.15, black: 10.9, light: 12.3 };
const anchorProgress = .13;
const smooth = (from: number, to: number, value: number) => {
  const p = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return p * p * (3 - 2 * p);
};
type Mode = 'idle' | 'playing' | 'revealing' | 'complete' | 'cancelled';

export function mountExplorerFilm(host: HTMLElement, film: HTMLVideoElement) {
  const find = (selector: string) => host.querySelector<HTMLElement>(selector)!;
  const frame = find('.explorer-frame'), heading = find('.explorer-heading');
  const shade = find('.explorer-shade'), abyss = find('.explorer-fall-copy');
  const dawn = find('.explorer-continuous-light'), rise = find('.explorer-rise-copy');
  const elements = [frame, heading, shade, abyss, dawn, rise];
  const originalStyles = elements.map(el => el.getAttribute('style'));
  const originalPreload = film.preload;
  let mode: Mode = 'idle', visible = false, pendingPlay = false, disposed = false;
  let trigger: ScrollTrigger | undefined, camera: gsap.core.Tween | undefined;
  let touchY = 0, lastSignature = '';
  host.dataset.filmSync = 'media';

  const style = (el: HTMLElement, property: string, value: string) => {
    if (el.style.getPropertyValue(property) !== value) el.style.setProperty(property, value);
  };
  const opacity = (el: HTMLElement, value: number) => style(el, 'opacity', value.toFixed(4));
  const locked = () => mode === 'playing' || mode === 'revealing';
  const anchorY = () => trigger!.start + (trigger!.end - trigger!.start) * anchorProgress;
  const cancel = () => {
    camera?.kill(); camera = undefined; mode = 'cancelled'; film.pause();
  };
  const reset = () => {
    camera?.kill(); camera = undefined; mode = 'idle'; film.pause();
    if (film.readyState > 0) film.currentTime = 0;
  };
  const syncPlayback = () => {
    if (!visible || !locked() || document.hidden) { film.pause(); return; }
    if (!film.paused || film.ended || pendingPlay) return;
    pendingPlay = true;
    void film.play().then(() => {
      if (!disposed) host.dataset.videoState = 'playing';
    }).catch(() => {
      if (!disposed) host.dataset.videoState = 'blocked';
    }).finally(() => {
      pendingPlay = false;
      if (disposed || !visible || !locked() || document.hidden) film.pause();
    });
  };
  const advanceToDawn = (duration = 2.6) => {
    if (!trigger) return;
    camera?.kill();
    mode = 'revealing';
    const position = { y: window.scrollY };
    camera = gsap.to(position, {
      y: trigger.start + (trigger.end - trigger.start) * .97,
      duration, ease: 'power2.inOut',
      onUpdate: () => window.scrollTo({ top: position.y, behavior: 'instant' }),
      onComplete: () => { camera = undefined; mode = 'complete'; film.pause(); render(); },
    });
  };
  const render = () => {
    if (!trigger || disposed) return;
    const p = trigger.progress, time = film.currentTime;
    if (mode === 'playing' && time >= cues.light) advanceToDawn();
    const signature = `${p}:${time}:${innerWidth}:${innerHeight}:${mode}`;
    if (signature === lastSignature) return;
    lastSignature = signature;

    const entrance = smooth(.01, .11, p);
    const expansion = smooth(cues.fall, cues.full, time) * smooth(.03, .11, p);
    // Wait until the existing continuous background has entered the viewport.
    const light = smooth(.76, .90, p), nextCopy = smooth(.90, .965, p);
    const square = Math.min(innerWidth * (innerWidth <= 700 ? .76 : .38), innerHeight * .52);
    style(frame, 'width', `${square + (innerWidth - square) * expansion}px`);
    style(frame, 'height', `${square + (innerHeight - square) * expansion}px`);
    style(frame, 'top', `${innerHeight * (.55 - .05 * expansion)}px`);
    style(frame, 'border-radius', `${3 * (1 - expansion)}px`);
    style(frame, 'transform', `translate(-50%,-50%) translateY(${innerHeight * .9 * (1 - entrance)}px)`);
    opacity(frame, entrance * (1 - light));
    opacity(heading, (1 - expansion) * (1 - light));
    style(heading, 'transform', `translateY(${-65 * expansion}px)`);
    opacity(shade, .58 * smooth(cues.dark, cues.black, time) * (1 - smooth(cues.light, 12.9, time)));
    const firstCopy = smooth(cues.abyss, 10.5, time) * (1 - smooth(cues.light, 12.95, time)) * (1 - light);
    opacity(abyss, entrance * firstCopy);
    style(abyss, 'transform', `translateY(${24 * (1 - firstCopy)}px)`);
    opacity(dawn, light * (innerWidth <= 700 ? .55 : .62));
    opacity(rise, nextCopy);
    style(rise, 'transform', `translateY(${45 * (1 - nextCopy)}px)`);
    host.dataset.filmPhase = mode === 'complete' ? 'complete' : mode === 'revealing' ? 'revealing'
      : mode === 'playing' ? time < cues.fall ? 'turn' : time < cues.abyss ? 'fall' : 'abyss' : 'preview';
  };
  const updateScroll = (self: ScrollTrigger) => {
    host.dataset.explorerProgress = self.progress.toFixed(3);
    if (!trigger) return;
    if (locked() && (self.progress < .075 || self.progress >= .995)) cancel();
    if ((mode === 'cancelled' || mode === 'complete') && self.progress < .075) reset();
    if (mode === 'complete' && self.progress < .30 && self.direction < 0) reset();
    if (mode === 'idle' && self.direction > 0 && self.progress >= .115 && self.progress < .30) {
      mode = 'playing'; film.preload = 'auto';
      window.scrollTo({ top: anchorY(), behavior: 'instant' });
      syncPlayback();
    } else if (mode === 'playing' && self.progress > anchorProgress + .002) {
      // Contain remaining wheel/touch inertia without changing body geometry.
      window.scrollTo({ top: anchorY(), behavior: 'instant' });
    }
    render();
  };
  trigger = ScrollTrigger.create({
    trigger: find('.explorer-film-track'), start: 'top top', end: 'bottom bottom',
    onUpdate: updateScroll,
    onRefresh: () => {
      if (!trigger) return;
      if (mode === 'playing') window.scrollTo({ top: anchorY(), behavior: 'instant' });
      if (mode === 'revealing') advanceToDawn(1.4);
      lastSignature = ''; render();
    },
  });
  updateScroll(trigger);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncPlayback();
  }, { threshold: .2 });
  observer.observe(find('.explorer-viewport'));
  const wheel = (event: WheelEvent) => {
    if (!locked() || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    if (event.deltaY < 0) cancel();
    else if (event.deltaY > 0) event.preventDefault();
  };
  const key = (event: KeyboardEvent) => {
    if (!locked()) return;
    if (event.key === 'Escape' || event.key === 'Tab') { cancel(); return; }
    if (event.target instanceof Element && event.target.closest('input,textarea,select,button,a')) return;
    if (['ArrowUp', 'PageUp', 'Home', 'End'].includes(event.key) || (event.key === ' ' && event.shiftKey)) cancel();
    else if (['ArrowDown', 'PageDown', ' '].includes(event.key)) event.preventDefault();
  };
  const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
  const touchMove = (event: TouchEvent) => {
    if (!locked() || event.touches.length !== 1) return;
    const delta = touchY - event.touches[0].clientY;
    if (delta < -5) cancel(); else if (delta > 0) event.preventDefault();
  };
  const visibility = () => {
    if (document.hidden) camera?.pause(); else camera?.resume();
    syncPlayback();
  };
  window.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('keydown', key);
  window.addEventListener('touchstart', touchStart, { passive: true });
  window.addEventListener('touchmove', touchMove, { passive: false });
  document.addEventListener('visibilitychange', visibility);
  film.addEventListener('loadeddata', syncPlayback);
  gsap.ticker.add(render);
  render();
  return () => {
    disposed = true; camera?.kill(); trigger?.kill(); observer.disconnect();
    gsap.ticker.remove(render); film.pause(); film.preload = originalPreload;
    film.removeEventListener('loadeddata', syncPlayback);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key);
    window.removeEventListener('touchstart', touchStart); window.removeEventListener('touchmove', touchMove);
    elements.forEach((el, i) => originalStyles[i] === null ? el.removeAttribute('style') : el.setAttribute('style', originalStyles[i]!));
    delete host.dataset.filmSync; delete host.dataset.filmPhase; delete host.dataset.videoState;
  };
}
