'use client';
import { useLayoutEffect, useRef } from 'react';

/** Keep the last transparent frame until the native dialog has left the top layer. */
export function useFadingDialog(key: string | null, onClose: () => void, onOpened?: () => void) {
  const dialog = useRef<HTMLDialogElement>(null);
  const animations = useRef<Animation[]>([]);
  const closing = useRef(false);
  const callbacks = useRef({ onClose, onOpened });
  callbacks.current = { onClose, onOpened };
  useLayoutEffect(() => {
    const host = dialog.current;
    if (!key || !host) return;
    let alive = true;
    closing.current = false;
    delete host.dataset.closing;
    host.dataset.phase = 'opening';
    const html = document.documentElement;
    const previous = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter, x: scrollX, y: scrollY, focus: document.activeElement as HTMLElement | null };
    // Preserve the scrollbar's space while the document is locked.
    html.style.scrollbarGutter = 'stable';
    html.style.overflow = 'hidden';
    host.style.opacity = '0';
    host.showModal();
    const opened = () => { if (alive && !closing.current) { host.dataset.phase = 'open'; callbacks.current.onOpened?.(); } };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { host.style.opacity = '1'; opened(); }
    else {
      const animation = host.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: 'ease-in-out', fill: 'both' });
      animations.current = [animation];
      void animation.finished.then(opened).catch(() => {});
    }
    return () => {
      alive = false;
      // close() first: canceling a filled animation while still visible causes a flash.
      host.close();
      html.style.overflow = previous.overflow;
      html.style.scrollbarGutter = previous.gutter;
      previous.focus?.focus({ preventScroll: true });
      window.scrollTo({ left: previous.x, top: previous.y, behavior: 'instant' });
      animations.current.forEach(animation => animation.cancel());
      animations.current = [];
      host.style.opacity = '';
      delete host.dataset.phase;
    };
  }, [key]);
  const close = () => {
    const host = dialog.current;
    if (!host || closing.current) return;
    closing.current = true;
    const opacity = Number(getComputedStyle(host).opacity);
    const backdropOpacity = getComputedStyle(host, '::backdrop').opacity;
    host.style.setProperty('--backdrop-from', backdropOpacity);
    host.dataset.closing = 'true';
    host.dataset.phase = 'closing';
    host.style.opacity = String(opacity);
    animations.current.forEach(animation => animation.cancel());
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { host.style.opacity = '0'; callbacks.current.onClose(); return; }
    const animation = host.animate([{ opacity }, { opacity: 0 }], { duration: Math.max(150, 450 * opacity), easing: 'ease-in-out', fill: 'both' });
    animations.current = [animation];
    void animation.finished.then(() => callbacks.current.onClose()).catch(() => {});
  };
  return { dialog, close };
}
