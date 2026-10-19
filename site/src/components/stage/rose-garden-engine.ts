import * as THREE from 'three';
import { cityAlbums, type CityAlbumData } from './city-albums';

function bookCover(city: CityAlbumData) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1092;
  const ctx = canvas.getContext('2d')!;
  // Work in the supplied 380 × 540 cover coordinates, at a crisp texture resolution.
  ctx.scale(768 / 380, 1092 / 540);
  const leather = ctx.createLinearGradient(0, 0, 380, 540);
  leather.addColorStop(0, '#22181D'); leather.addColorStop(.55, '#140E11'); leather.addColorStop(1, '#0C080A');
  ctx.fillStyle = leather; ctx.fillRect(0, 0, 380, 540);
  const light = ctx.createRadialGradient(190, 248, 0, 190, 248, 235);
  light.addColorStop(0, '#e295b029'); light.addColorStop(.6, '#5e2b4014'); light.addColorStop(1, '#5e2b4000');
  ctx.fillStyle = light; ctx.fillRect(0, 0, 380, 540);
  ctx.strokeStyle = '#e295b0'; ctx.globalAlpha = .018; ctx.lineWidth = .4;
  for (let y = 0; y < 540; y += 3) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(380,y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const spine = ctx.createLinearGradient(0, 0, 26, 0);
  spine.addColorStop(0, '#ffdceb1f'); spine.addColorStop(.38, '#000000a6'); spine.addColorStop(.52, '#e295b02e'); spine.addColorStop(.75, '#00000073'); spine.addColorStop(1, '#00000000');
  ctx.fillStyle = spine; ctx.fillRect(0, 0, 26, 540);
  ctx.fillStyle = '#e295b026'; ctx.fillRect(26, 0, .6, 540);
  ctx.strokeStyle = '#e295b061'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(34,18,328,504,[2,8,8,2]); ctx.stroke();
  ctx.strokeStyle = '#ffd7e62e'; ctx.lineWidth = .5; ctx.strokeRect(38,22,320,496);
  const center = 196;
  ctx.textAlign = 'center'; ctx.fillStyle = '#e295b0d9'; ctx.font = '8.5px Inter, Arial, sans-serif'; ctx.letterSpacing = '2.2px';
  ctx.fillText('CRAFTER · EXPLORER · WEAVER', center, 47);
  ctx.fillStyle = '#f7edf1'; ctx.font = '300 20px Inter, Arial, sans-serif'; ctx.letterSpacing = '4px';
  ctx.fillText('A TEXTURED LIFE', center, 76);
  ctx.letterSpacing = '0px';
  let titleSize = 72;
  ctx.textAlign = 'left'; ctx.font = `${titleSize}px StageLoadingScript, cursive`;
  while (ctx.measureText(city.title).actualBoundingBoxLeft + ctx.measureText(city.title).actualBoundingBoxRight > 270 && titleSize > 40) { titleSize--; ctx.font = `${titleSize}px StageLoadingScript, cursive`; }
  const bounds = ctx.measureText(city.title);
  ctx.fillStyle = '#f4b8ce'; ctx.shadowColor = '#e295b04d'; ctx.shadowBlur = 8;
  ctx.fillText(city.title, center + (bounds.actualBoundingBoxLeft - bounds.actualBoundingBoxRight) / 2, 270 + (bounds.actualBoundingBoxAscent - bounds.actualBoundingBoxDescent) / 2);
  ctx.shadowBlur = 0; ctx.textAlign = 'center';
  ctx.font = '29px StageLoadingScript, cursive'; ctx.fillText("Sherry's Chronicles", center, 472);
  ctx.fillStyle = '#f2edf099'; ctx.font = '6.3px Inter, Arial, sans-serif'; ctx.letterSpacing = '.85px';
  ctx.fillText('WHERE LIVED REALITY MEETS DIGITAL CREATION', center, 493);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export type RoseGardenEngine = { select: (index: number) => void; zoom: (amount: number) => void; dispose: () => void };
export function mountRoseGarden(host: HTMLElement, options: { onCity: (index: number) => void; onOpen: (index: number) => void; suspended: () => boolean }): RoseGardenEngine {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-label', 'Five city journals in a dark rose-gold atelier'); host.append(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = null; scene.fog = new THREE.FogExp2('#190f18', .03);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 70);
  scene.add(new THREE.HemisphereLight('#ffe9df', '#24131f', 1.3));
  const key = new THREE.DirectionalLight('#e7b9a2', 2.1); key.position.set(-5, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight('#bd8d9f', 1.4); rim.position.set(6, 5, -5); scene.add(rim);
  // A quiet, code-native nocturne backdrop stays visible through the alpha canvas.
  // A sparse field of warm glints gives the books a little spatial depth without a flower floor.
  const positions: number[] = [];
  const random = (n: number) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
  for (let i = 0; i < 150; i++) positions.push((random(i) - .5) * 22, random(i + 300) * 5, (random(i + 600) - .5) * 14 - 2);
  const glintGeometry = new THREE.BufferGeometry(); glintGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 32;
  const context = glowCanvas.getContext('2d')!;
  const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16); glow.addColorStop(0, '#fff7dc'); glow.addColorStop(.15, '#ffe4ae'); glow.addColorStop(.45, '#e7bc6930'); glow.addColorStop(1, '#e7bc6900'); context.fillStyle = glow; context.fillRect(0, 0, 32, 32);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glintMaterial = new THREE.PointsMaterial({ map: glowTexture, color: '#ffe5bc', size: .065, transparent: true, opacity: .3, depthWrite: false });
  scene.add(new THREE.Points(glintGeometry, glintMaterial));
  host.dataset.background = 'nocturne';

  const books: THREE.Group[] = [], hitMeshes: THREE.Object3D[] = [];
  const coverGeometry = new THREE.BoxGeometry(1.54, 2.18, .055), pageGeometry = new THREE.BoxGeometry(1.45, 2.08, .15);
  const edgeCanvas = document.createElement('canvas'); edgeCanvas.width = 64; edgeCanvas.height = 256;
  const edgeContext = edgeCanvas.getContext('2d')!;
  for (let y = 0; y < 256; y++) { edgeContext.fillStyle = ['#b98897', '#3a252e', '#dcc2c9', '#6d4a56'][y % 4]; edgeContext.fillRect(0,y,64,1); }
  const edgeTexture = new THREE.CanvasTexture(edgeCanvas); edgeTexture.colorSpace = THREE.SRGBColorSpace;
  const paper = new THREE.MeshStandardMaterial({ map: edgeTexture, color: '#c6a3af', roughness: .65, metalness: .22 });
  const auraCanvas = document.createElement('canvas'); auraCanvas.width = auraCanvas.height = 128;
  const auraContext = auraCanvas.getContext('2d')!;
  const aura = auraContext.createRadialGradient(64,64,0,64,64,64); aura.addColorStop(0,'#e295b040'); aura.addColorStop(.45,'#9e526c18'); aura.addColorStop(1,'#9e526c00');
  auraContext.fillStyle = aura; auraContext.fillRect(0,0,128,128);
  const auraTexture = new THREE.CanvasTexture(auraCanvas);
  cityAlbums.forEach((city, index) => {
    const group = new THREE.Group(); group.position.set((index - 2) * 2.1, 1.19, -Math.abs(index - 2) * .22); group.rotation.y = (2 - index) * .08;
    const texture = bookCover(city); texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const cloth = new THREE.MeshStandardMaterial({ color: city.color, roughness: .48, metalness: .14 });
    const front = new THREE.MeshStandardMaterial({ map: texture, roughness: .44, metalness: .16, emissiveMap: texture, emissive: '#ffffff', emissiveIntensity: .25 });
    const cover = new THREE.Mesh(coverGeometry, [cloth, cloth, cloth, cloth, front, cloth]); cover.position.z = .102;
    const back = new THREE.Mesh(coverGeometry, cloth); back.position.z = -.102;
    const pages = new THREE.Mesh(pageGeometry, paper);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(.09, 2.17, .22), cloth); spine.position.x = -.73;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.65,3.15), new THREE.MeshBasicMaterial({ map: auraTexture, transparent: true, opacity: .5, depthWrite: false })); halo.position.z = -.18;
    group.userData.halo = halo;
    group.add(halo, cover, back, pages, spine); group.traverse(object => { object.userData.city = index; });
    hitMeshes.push(cover, back, pages, spine); scene.add(group); books.push(group);
  });

  let selected = 0, targetX = 0, zoom = 0, targetZoom = 0, visible = false, raf = 0, disposed = false, last = performance.now(), dragging = false, downX = 0, downY = 0;
  const pointer = new THREE.Vector2(0, 0), raycaster = new THREE.Raycaster(), look = new THREE.Vector3(0, 1.5, -.3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fullyOpen = () => { const p = Number(host.closest('.stage-weaver')?.getAttribute('data-door-progress')); return reduced || (p > .27 && p < .69); };
  const select = (index: number) => { selected = THREE.MathUtils.clamp(index, 0, 4); targetX = books[selected].position.x; options.onCity(selected); };
  const fit = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / Math.max(h, 1); if (camera.aspect < 1) targetX = books[selected].position.x; camera.updateProjectionMatrix(); };
  const resize = new ResizeObserver(fit); resize.observe(host); fit();
  const hit = () => { raycaster.setFromCamera(pointer, camera); const object = raycaster.intersectObjects(hitMeshes, false)[0]?.object; return typeof object?.userData.city === 'number' ? object.userData.city as number : null; };
  const move = (event: PointerEvent) => {
    if (!fullyOpen() || options.suspended()) return;
    const rect = host.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    if (event.pointerType !== 'touch') {
      targetX = pointer.x * (camera.aspect < 1 ? 5 : 3.6);
      const found = hit(); renderer.domElement.style.cursor = found === null ? 'grab' : 'pointer';
      if (found !== null && found !== selected) { selected = found; options.onCity(selected); }
    }
  };
  const down = (event: PointerEvent) => { dragging = true; downX = event.clientX; downY = event.clientY; };
  const cancel = () => { dragging = false; };
  const up = (event: PointerEvent) => {
    if (!dragging || !fullyOpen() || options.suspended()) return;
    dragging = false;
    if (Math.abs(event.clientY - downY) > 25) return;
    if (Math.abs(event.clientX - downX) > 35) { select((selected + (event.clientX < downX ? 1 : 4)) % 5); return; }
    move(event); const found = hit(); if (found !== null) options.onOpen(found);
  };
  const wheel = (event: WheelEvent) => {
    if (!fullyOpen() || options.suspended() || event.ctrlKey) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? host.clientHeight : 1);
    if (!delta) return;
    // Consume only the usable dolly range. At either limit scrolling continues the page.
    if ((delta > 0 && targetZoom >= 1) || (delta < 0 && targetZoom <= 0)) return;
    event.preventDefault(); targetZoom = THREE.MathUtils.clamp(targetZoom + delta * .0015, 0, 1);
  };
  host.addEventListener('pointermove', move); host.addEventListener('pointerdown', down); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', cancel); host.addEventListener('wheel', wheel, { passive: false });
  function frame(now: number) {
    raf = 0; if (disposed) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (visible && !document.hidden && !options.suspended()) {
      const ease = reduced ? 1 : 1 - Math.exp(-dt * 5);
      zoom += (targetZoom - zoom) * ease;
      const mobile = camera.aspect < 1;
      camera.position.x += (targetX - camera.position.x) * ease;
      camera.position.y += (2.45 - zoom * .65 - camera.position.y) * ease;
      camera.position.z += ((mobile ? 7.8 : 10.5) - zoom * (mobile ? 3.1 : 5.2) - camera.position.z) * ease;
      look.x = camera.position.x * .92; camera.lookAt(look);
      books.forEach((book, index) => {
        const active = index === selected;
        book.position.y += ((active ? 1.32 : 1.19) - book.position.y) * ease;
        book.rotation.y += ((2 - index) * .08 + (active ? -.18 : 0) - book.rotation.y) * ease;
        book.rotation.x += ((active ? .065 : 0) - book.rotation.x) * ease;
        const halo = book.userData.halo as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
        halo.material.opacity += ((active ? .85 : .4) - halo.material.opacity) * ease;
      });
      host.dataset.zoom = zoom.toFixed(3); host.dataset.cameraX = camera.position.x.toFixed(3); host.dataset.activeCity = cityAlbums[selected].slug;
      renderer.render(scene, camera);
    }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  camera.position.set(camera.aspect < 1 ? targetX : 0, 2.45, 10.5); look.x = camera.position.x * .92; camera.lookAt(look);
  const schedule = () => { if (!raf && !disposed && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .01 }); observer.observe(host);
  document.addEventListener('visibilitychange', schedule);
  host.dataset.engine = 'three';
  return {
    select,
    zoom(amount: number) { targetZoom = THREE.MathUtils.clamp(targetZoom + amount, 0, 1); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', schedule);
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerdown', down); host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', cancel); host.removeEventListener('wheel', wheel);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
      scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); for (const material of Array.isArray(object.material) ? object.material : [object.material]) { materials.add(material); if ('map' in material && material.map instanceof THREE.Texture) textures.add(material.map); } } });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
      glintGeometry.dispose(); glintMaterial.dispose(); glowTexture.dispose();
      renderer.dispose(); renderer.domElement.remove(); delete host.dataset.engine;
    },
  };
}
