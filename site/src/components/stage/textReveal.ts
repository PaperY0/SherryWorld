// Shared timing keeps paragraph reveals consistent across stage sections.
export function prepareTextReveal(pieces: HTMLElement[], duration = 3000, random = true) {
  const order = pieces.map((_, i) => i);
  if (random) for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return pieces.map((piece, index) => {
    const animation = piece.animate([
      { opacity: 0, transform: 'translateY(40px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
    ], { duration, delay: order[index] * 50, fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)' });
    animation.pause(); animation.currentTime = 0;
    return animation;
  });
}
