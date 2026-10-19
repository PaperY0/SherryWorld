import * as THREE from 'three';
import { cityAlbums, type CityAlbumData } from './city-albums';

function bookCover(city: CityAlbumData, index: number) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  const leather = ctx.createLinearGradient(0, 0, 768, 80);
  leather.addColorStop(0, '#0e0b0f'); leather.addColorStop(.14, city.color); leather.addColorStop(.8, city.color); leather.addColorStop(1, '#100b10');
  ctx.fillStyle = leather; ctx.fillRect(0, 0, 768, 1024);
  ctx.globalAlpha = .04; ctx.strokeStyle = '#d4afa1'; ctx.lineWidth = 1;
  for (let x = 0; x < 768; x += 4) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke(); }
  for (let y = 0; y < 1024; y += 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(768, y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const foil = ctx.createLinearGradient(90, 0, 690, 1024); foil.addColorStop(0, '#805848'); foil.addColorStop(.35, city.ink); foil.addColorStop(.6, '#e0b8a5'); foil.addColorStop(1, '#8e6254');
  ctx.strokeStyle = foil; ctx.fillStyle = foil; ctx.lineWidth = 1.7;
  ctx.strokeRect(87, 48, 628, 928); ctx.lineWidth = .8; ctx.strokeRect(100, 61, 602, 902);
  // Quiet gilded binding and engraved corner flourishes, rather than a cream lace stripe.
  ctx.beginPath(); ctx.moveTo(47, 0); ctx.lineTo(47, 1024); ctx.moveTo(59, 0); ctx.lineTo(59, 1024); ctx.stroke();
  for (const [x,y,angle] of [[112,75,0],[690,75,Math.PI/2],[690,948,Math.PI],[112,948,-Math.PI/2]]) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(0,60); ctx.bezierCurveTo(0,6,8,0,60,0); ctx.moveTo(7,43); ctx.bezierCurveTo(30,16,46,37,28,40); ctx.bezierCurveTo(13,43,18,10,43,7); ctx.stroke(); ctx.restore();
  }
  ctx.textAlign = 'center'; ctx.font = '17px Georgia'; ctx.fillText('SHERRY / PRIVATE COLLECTION', 400, 151);
  let titleSize = 124;
  ctx.textAlign = 'left';
  ctx.font = `${titleSize}px StageLoadingScript, cursive`;
  while (ctx.measureText(city.title).actualBoundingBoxLeft + ctx.measureText(city.title).actualBoundingBoxRight > 565 && titleSize > 70) { titleSize--; ctx.font = `${titleSize}px StageLoadingScript, cursive`; }
  const bounds = ctx.measureText(city.title);
  ctx.fillText(city.title, 400 + (bounds.actualBoundingBoxLeft - bounds.actualBoundingBoxRight) / 2, 512 + (bounds.actualBoundingBoxAscent - bounds.actualBoundingBoxDescent) / 2);
  ctx.textAlign = 'center';
  ctx.font = '15px Georgia'; ctx.fillText('PORTRAITS · PLACES · LITTLE PLEASURES', 400, 808);
  ctx.font = '23px Georgia'; ctx.fillText(`VOL. ${String(index + 1).padStart(2, '0')}`, 400, 900);
  ctx.beginPath(); ctx.moveTo(300, 710); ctx.lineTo(385,710); ctx.moveTo(415,710); ctx.lineTo(500,710); ctx.stroke();
  ctx.beginPath(); ctx.arc(400,710,3,0,Math.PI*2); ctx.fill();
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
  const paper = new THREE.MeshStandardMaterial({ color: '#9d826c', roughness: .85 });
  cityAlbums.forEach((city, index) => {
    const group = new THREE.Group(); group.position.set((index - 2) * 2.1, 1.19, -Math.abs(index - 2) * .22); group.rotation.y = (2 - index) * .08;
    const texture = bookCover(city, index); texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const cloth = new THREE.MeshStandardMaterial({ color: city.color, roughness: .48, metalness: .14 });
    const front = new THREE.MeshStandardMaterial({ map: texture, roughness: .44, metalness: .16, emissiveMap: texture, emissive: '#ffffff', emissiveIntensity: .25 });
    const cover = new THREE.Mesh(coverGeometry, [cloth, cloth, cloth, cloth, front, cloth]); cover.position.z = .102;
    const back = new THREE.Mesh(coverGeometry, cloth); back.position.z = -.102;
    const pages = new THREE.Mesh(pageGeometry, paper);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(.09, 2.17, .22), cloth); spine.position.x = -.73;
    group.add(cover, back, pages, spine); group.traverse(object => { object.userData.city = index; });
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
      books.forEach((book, index) => { book.position.y += ((index === selected ? 1.32 : 1.19) - book.position.y) * ease; });
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
