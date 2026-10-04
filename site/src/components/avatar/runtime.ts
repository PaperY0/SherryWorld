import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { Theme } from '@/lib/preferences';

export type AvatarController = {
  setTheme: (theme: Theme) => void;
  setPaused: (paused: boolean) => void;
  setView: (yaw: number) => void;
  dispose: () => void;
};

function release(model: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  model.traverse(object => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
    }
  });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
}

export function createAvatar(host: HTMLElement, initialTheme: Theme, initialPaused: boolean,
  onState: (state: 'ready' | 'error') => void): AvatarController {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, .1, 50);
  camera.position.set(0, 0, 8); camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight('#fff5ed', '#79717f', 2.2));
  const key = new THREE.DirectionalLight('#fff4e9', 3.5); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#f9d9e3', 2); rim.position.set(3, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight('#eef1ff', .9); fill.position.set(2, 0, 4); scene.add(fill);
  let theme = initialTheme, paused = initialPaused, disposed = false, failed = false, visible = true;
  let model: THREE.Group | null = null, avatar: THREE.Object3D | null = null, head: THREE.Object3D | null = null;
  let headBase: THREE.Euler | null = null, size = new THREE.Vector3(2, 3, 1), rootY = 0;
  let raf = 0, last = 0, elapsed = 0, yaw = 0, targetYaw = 0, pointerYaw = 0, targetPointer = 0;
  let dragging = false, startX = 0, startYaw = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function wardrobe() {
    model?.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => {
        if (material instanceof THREE.MeshStandardMaterial && material.name.startsWith('Sweater')) {
          material.color.set(theme === 'dark' ? '#cec9cd' : '#24212a');
          material.metalness = 0; material.roughness = .9;
        }
      });
    });
    key.intensity = theme === 'dark' ? 3.1 : 3.5;
    host.dataset.wardrobe = theme === 'dark' ? 'pearl' : 'black';
  }
  function resize() {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight), aspect = width / height;
    // Fit the complete silhouette rather than cropping the crown on narrow screens.
    const span = Math.max(size.y * 1.16, Math.max(size.x, size.z) / aspect * 1.36);
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2;
    camera.top = span / 2; camera.bottom = -span / 2; camera.updateProjectionMatrix();
    renderer.setSize(width, height); schedule();
  }
  function frame(now: number) {
    raf = 0; if (disposed || failed || !visible || document.hidden) return;
    const dt = last ? Math.min((now-last)/1000, .05) : 0; last = now;
    const k = reduced.matches ? 1 : 1-Math.exp(-dt*8);
    yaw += (targetYaw-yaw)*k; pointerYaw += (targetPointer-pointerYaw)*k;
    if (avatar) {
      avatar.rotation.y = yaw;
      if (!paused) { elapsed += dt; avatar.position.y = rootY + Math.sin(elapsed*1.5)*.012; }
      host.dataset.breath = avatar.position.y.toFixed(5);
    }
    if (head && headBase) {
      head.rotation.y = headBase.y + pointerYaw + Math.sin(elapsed*.6)*.025;
      head.rotation.z = headBase.z + Math.sin(elapsed*.8)*.008;
    }
    host.dataset.yaw = yaw.toFixed(4); host.dataset.headYaw = pointerYaw.toFixed(4);
    renderer.render(scene, camera);
    if (!paused || Math.abs(targetYaw-yaw)>.0001 || Math.abs(targetPointer-pointerYaw)>.0001) schedule();
  }
  function schedule() { if (!raf && !disposed && !failed && visible && !document.hidden) raf=requestAnimationFrame(frame); }
  const move = (event: PointerEvent) => {
    if (dragging) targetYaw = THREE.MathUtils.clamp(startYaw + (event.clientX-startX)*.005, -.75, .75);
    else if (event.pointerType !== 'touch') {
      const box = host.getBoundingClientRect(); targetPointer = THREE.MathUtils.clamp((event.clientX-box.left)/box.width-.5, -.5, .5)*.4;
    }
    schedule();
  };
  const down = (event: PointerEvent) => {
    if (event.button!==0) return;
    dragging=true; startX=event.clientX; startYaw=targetYaw; host.setPointerCapture(event.pointerId);
  };
  const up = () => { dragging=false; };
  const leave = () => { targetPointer=0; schedule(); };
  const keyboard = (event: KeyboardEvent) => {
    if (!['ArrowLeft','ArrowRight','Home'].includes(event.key)) return;
    event.preventDefault(); targetYaw=event.key==='Home'?0:THREE.MathUtils.clamp(targetYaw+(event.key==='ArrowRight'?.1:-.1),-.75,.75);
    schedule();
  };
  const lost = (event: Event) => { event.preventDefault(); failed=true; cancelAnimationFrame(raf); raf=0; onState('error'); };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf=0; } else { last=0; schedule(); } };
  host.addEventListener('pointermove',move); host.addEventListener('pointerdown',down);
  host.addEventListener('pointerup',up); host.addEventListener('pointercancel',up); host.addEventListener('pointerleave',leave);
  host.addEventListener('keydown',keyboard); renderer.domElement.addEventListener('webglcontextlost',lost);
  document.addEventListener('visibilitychange',visibility);
  const observer=new ResizeObserver(resize); observer.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting; if(visible){last=0;schedule();}else{cancelAnimationFrame(raf);raf=0;} }); intersection.observe(host);
  wardrobe(); resize();
  new GLTFLoader().load('/models/sherry-avatar-blender-v2.glb', gltf=>{
    if(disposed || failed){release(gltf.scene);return;}
    model=gltf.scene; model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model); bounds.getSize(size);
    model.position.sub(bounds.getCenter(new THREE.Vector3())); scene.add(model);
    avatar=model.getObjectByName('AvatarRoot')??model; rootY=avatar.position.y;
    head=model.getObjectByName('HeadPivot')??null; headBase=head?.rotation.clone()??null;
    let meshes=0; model.traverse(o=>{if(o instanceof THREE.Mesh)meshes++;}); host.dataset.meshes=String(meshes);
    wardrobe(); resize(); onState('ready'); schedule();
  },undefined,()=>{if(!disposed){failed=true;onState('error');cancelAnimationFrame(raf);raf=0;}});
  return {
    setTheme(next){theme=next;wardrobe();schedule();},
    setPaused(next){paused=next;last=0;schedule();},
    setView(next){targetYaw=THREE.MathUtils.clamp(next,-.75,.75);targetPointer=0;schedule();},
    dispose(){
      disposed=true;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();
      host.removeEventListener('pointermove',move);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);
      host.removeEventListener('pointercancel',up);host.removeEventListener('pointerleave',leave);host.removeEventListener('keydown',keyboard);
      document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);
      if(model)release(model); renderer.dispose(); renderer.domElement.remove();
    }
  };
}
