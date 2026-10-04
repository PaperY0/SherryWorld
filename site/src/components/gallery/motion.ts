export type GalleryMode = 'auto' | 'left' | 'right' | 'paused' | 'drag';
export type GalleryStatus = { index: number; mode: GalleryMode };
export type GalleryMotion = { step: (amount: number) => void; dispose: () => void };
const wrap = (n: number, total: number) => ((n + total / 2) % total + total) % total - total / 2;

export function mountGallery(stage: HTMLElement, options: {
  count: number; suspended: () => boolean; reduced: () => boolean; onStatus: (status: GalleryStatus) => void;
}): GalleryMotion {
  const cards = Array.from(stage.querySelectorAll<HTMLButtonElement>('.gallery-card'));
  let offset = 0, velocity = .12, target = .12, lastTime = performance.now(), enteredAt = 0;
  let visible = false, dragging = false, pointerX: number | null = null, dragStart = 0, dragDistance = 0;
  let lastMove = 0, keyboardFocus = false, lastInput = 'pointer', raf = 0, disposed = false, statusKey = '';
  const spacing = () => stage.clientWidth < 700 ? 228 : Math.max(300, stage.clientWidth / 4.15);
  function render(now: number) {
    const mobile = stage.clientWidth < 700, space = spacing();
    const width = mobile ? 204 : space - 20, height = mobile ? 300 : Math.min(420, Math.max(350, width * 1.2));
    cards.forEach((card, i) => {
      const delta = wrap(i - offset, cards.length), angle = delta * .13;
      const shown = Math.abs(delta) < (mobile ? 1.6 : 3.1);
      const progress = options.reduced() ? 1 : enteredAt ? Math.max(0, Math.min(1, (now - enteredAt - Math.min(Math.abs(wrap(i, cards.length)), 4) * 85) / 700)) : 0;
      const eased = 1 - (1 - progress) ** 3, edge = Math.min(delta * delta, 9);
      const x = space * (delta + .018 * delta ** 3), y = -(1 - eased) * 280;
      card.style.width = `${width}px`; card.style.height = `${height}px`;
      card.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotateY(${angle * 180 / Math.PI}deg) scale(${(1 + .085 * edge) / Math.cos(angle)},${1 + .045 * edge})`;
      card.style.opacity = shown ? String(eased) : '0';
      card.style.zIndex = String(100 - Math.round(Math.abs(delta) * 10));
      card.style.pointerEvents = shown ? '' : 'none'; card.tabIndex = shown ? 0 : -1;
      card.setAttribute('aria-hidden', String(!shown));
    });
    const paused = options.suspended() || keyboardFocus || !visible || document.hidden;
    const mode: GalleryMode = paused ? 'paused' : dragging ? 'drag' : now - lastMove > 1100 ? 'auto' : target >= 0 ? 'left' : 'right';
    const index = ((Math.round(offset) % options.count) + options.count) % options.count;
    const nextKey = `${index}:${mode}`;
    if (nextKey !== statusKey) { statusKey = nextKey; options.onStatus({ index, mode }); }
    stage.dataset.offset = offset.toFixed(4); stage.dataset.target = String(target);
    stage.dataset.mode = mode; stage.dataset.ready = 'true';
  }
  function frame(now: number) {
    raf = 0; if (disposed) return;
    const dt = Math.min((now - lastTime) / 1000, .05); lastTime = now;
    if (!dragging && !options.suspended() && !keyboardFocus && visible && !document.hidden) {
      if (now - lastMove > 1100) target = .12;
      velocity += (target - velocity) * (1 - Math.exp(-dt * 4));
      offset = (offset + velocity * dt + cards.length) % cards.length;
    }
    render(now);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function schedule() { if (!raf && !disposed) { lastTime = performance.now(); raf = requestAnimationFrame(frame); } }
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true; keyboardFocus = false; pointerX = e.clientX; dragStart = e.clientX; dragDistance = 0;
    stage.classList.add('is-dragging'); lastInput = 'pointer';
  };
  const move = (e: PointerEvent) => {
    const dx = pointerX === null ? 0 : e.clientX - pointerX; pointerX = e.clientX;
    if (dragging) {
      dragDistance = Math.max(dragDistance, Math.abs(e.clientX - dragStart));
      if (dragDistance > 6 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      offset = (offset - dx / spacing() + cards.length) % cards.length; velocity = 0; lastMove = 0;
      render(performance.now());
    } else if (e.pointerType !== 'touch' && Math.abs(dx) >= 2) {
      target = (dx > 0 ? -1 : 1) * Math.min(.8, .24 + Math.abs(dx) * .018); lastMove = performance.now();
    }
  };
  const end = () => { dragging = false; pointerX = null; lastMove = 0; stage.classList.remove('is-dragging'); };
  const leave = () => { if (!dragging) { pointerX = null; lastMove = 0; } };
  const click = (e: MouseEvent) => { if (dragDistance > 6 && e.detail > 0) { e.preventDefault(); e.stopPropagation(); dragDistance = 0; } };
  const input = () => { lastInput = 'pointer'; keyboardFocus = false; };
  const key = (e: KeyboardEvent) => {
    lastInput = 'keyboard';
    if (stage.contains(document.activeElement) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault(); keyboardFocus = true; step(e.key === 'ArrowLeft' ? -1 : 1);
      cards[Math.round(offset) % cards.length]?.focus({ preventScroll: true });
    }
  };
  const focus = () => { if (lastInput === 'keyboard') keyboardFocus = true; };
  const blur = () => { keyboardFocus = false; };
  const visibility = () => { if (!document.hidden) schedule(); };
  const resize = () => render(performance.now());
  function step(amount: number) { offset = (offset + amount + cards.length) % cards.length; lastMove = 0; render(performance.now()); }
  stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', leave); stage.addEventListener('click', click, true);
  stage.addEventListener('focusin', focus); stage.addEventListener('focusout', blur);
  window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
  document.addEventListener('pointerdown', input, true); document.addEventListener('keydown', key);
  document.addEventListener('visibilitychange', visibility); window.addEventListener('resize', resize);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { if (!enteredAt) enteredAt = performance.now(); schedule(); }
  }, { threshold: .1 });
  observer.observe(stage); render(performance.now());
  return { step, dispose() {
    disposed = true; cancelAnimationFrame(raf); observer.disconnect();
    stage.removeEventListener('pointerdown', down); stage.removeEventListener('pointermove', move);
    stage.removeEventListener('pointerleave', leave); stage.removeEventListener('click', click, true);
    stage.removeEventListener('focusin', focus); stage.removeEventListener('focusout', blur);
    window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
    document.removeEventListener('pointerdown', input, true); document.removeEventListener('keydown', key);
    document.removeEventListener('visibilitychange', visibility); window.removeEventListener('resize', resize);
  } };
}
