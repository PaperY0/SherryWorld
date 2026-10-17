'use client';
import { useEffect, useRef, useState } from 'react';

export function StageLoader({ onComplete, zh }: { onComplete: () => void; zh: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState('counting');
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onComplete(); return; }
    let alive = true, frame = 0, release = () => {};
    let draw: ((progress: number, elapsed: number) => void) | null = null;
    let assetsReady = false, dissolveStart = 0;
    const started = performance.now();
    document.documentElement.dataset.stageLoading = 'true';
    const images = [...document.querySelectorAll<HTMLImageElement>('.stage-portrait img')];
    Promise.allSettled([document.fonts.ready, ...images.map(image => image.decode())]).then(() => { assetsReady = true; });
    void import('three').then(THREE => {
      if (!alive || !canvas.current) return;
      try {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: false });
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const uniforms = { phase: { value: 0 }, time: { value: 0 }, aspect: { value: 1 } };
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, uniforms,
          vertexShader: 'varying vec2 p;void main(){p=uv;gl_Position=vec4(position,1.);}',
          fragmentShader: `varying vec2 p;uniform float phase,time,aspect;
            float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
            float noise(vec2 p){vec2 q=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(q),hash(q+vec2(1.,0.)),f.x),mix(hash(q+vec2(0.,1.)),hash(q+1.),f.x),f.y)*2.-1.;}
            void main(){vec2 uv=(p-.5)*vec2(aspect,1.)+.5;
              float n=noise(uv*4.+time*.15)*.35+noise(uv*12.+time*.3)*.18+noise(uv*24.+time*.5)*.08;
              float boundary=mix(-1.5,1.5,uv.y)+n-mix(-3.,2.,phase);
              float glow=pow(clamp(1.-abs(boundary),0.,1.),8.)*phase;
              vec3 color=mix(vec3(.38,.15,.27),vec3(.82,.44,.61),p.y);
              color+=vec3(1.,.5,.73)*glow*.85;
              color+=(hash(gl_FragCoord.xy)-.5)*.045;
              gl_FragColor=vec4(color,clamp(max(boundary,glow),0.,1.));}`
        });
        scene.add(new THREE.Mesh(geometry, material));
        const resize = () => { renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25)); renderer.setSize(innerWidth, innerHeight); uniforms.aspect.value = innerWidth / innerHeight; };
        resize(); window.addEventListener('resize', resize);
        draw = (progress, elapsed) => { uniforms.phase.value = progress; uniforms.time.value = elapsed; renderer.render(scene, camera); };
        release = () => { window.removeEventListener('resize', resize); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss(); };
      } catch { /* CSS fade below remains usable without WebGL. */ }
    }).catch(() => {});
    const tick = (now: number) => {
      if (!alive) return;
      const elapsed = now - started;
      const t = Math.min(elapsed / 3500, 1);
      const eased = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setCount(Math.floor(eased * 100));
      if (!dissolveStart && t === 1 && (assetsReady || elapsed > 5500)) { dissolveStart = now; setPhase('dissolving'); }
      const progress = dissolveStart ? Math.min((now - dissolveStart) / 2200, 1) : 0;
      const dissolve = progress * progress * (3 - 2 * progress);
      if (draw) { if (root.current) root.current.style.background = 'transparent'; draw(dissolve, elapsed / 1000); }
      else if (root.current) root.current.style.opacity = String(1 - dissolve);
      if (progress === 1) { onComplete(); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(frame); release(); delete document.documentElement.dataset.stageLoading; };
  }, [onComplete]);
  return <div ref={root} className="stage-loader" data-phase={phase} role="progressbar" aria-label={zh ? '首屏加载' : 'Loading your world'} aria-valuenow={count} aria-valuemin={0} aria-valuemax={100}>
    <canvas ref={canvas} aria-hidden="true" />
    <span className="stage-loader-count" aria-hidden="true">{String(count).padStart(3, '0')}</span>
    <span className="stage-loader-caption">{zh ? '正在加载你的世界' : 'LOADING YOUR WORLD'}</span>
  </div>;
}
