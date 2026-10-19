import * as THREE from 'three';
import { cityAlbums, type CityAlbumData } from './city-albums';

function bookCover(city: CityAlbumData, index: number) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = city.color; ctx.fillRect(0, 0, 768, 1024);
  // Woven cloth grain and hand-cut scalloped lace are painted into each real book cover.
  ctx.globalAlpha = .08; ctx.strokeStyle = city.ink;
  for (let x = 0; x < 768; x += 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke(); }
  for (let y = 0; y < 1024; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(768, y); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#f2dfd2'; ctx.fillRect(26, 0, 34, 1024);
  for (let y = 0; y < 1040; y += 22) { ctx.beginPath(); ctx.arc(62, y, 13, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
  ctx.strokeStyle = '#f8e6d1'; ctx.lineWidth = 2; ctx.strokeRect(90, 45, 630, 930); ctx.strokeRect(101, 56, 608, 908);
  ctx.fillStyle = city.ink; ctx.textAlign = 'center'; ctx.font = '18px Georgia'; ctx.fillText('SHERRY’S CITY JOURNALS', 400, 145);
  ctx.font = '76px Georgia, "Songti SC", SimSun, serif'; ctx.fillText(city.name, 400, 470);
  ctx.font = '100px StageLoadingScript, cursive'; ctx.fillText(city.title, 400, 595);
  ctx.font = '17px Georgia'; ctx.fillText('PORTRAITS · PLACES · LITTLE PLEASURES', 400, 800);
  ctx.font = '26px Georgia'; ctx.fillText(`VOL. ${String(index + 1).padStart(2, '0')}`, 400, 890);
  // Satin bow, with two loops and hanging tails.
  ctx.strokeStyle = '#f9e7dc'; ctx.lineWidth = 13; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(398, 265); ctx.bezierCurveTo(245, 135, 255, 325, 398, 265); ctx.bezierCurveTo(535, 135, 550, 325, 398, 265); ctx.stroke();
  ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(396, 268); ctx.bezierCurveTo(372, 300, 378, 338, 330, 360); ctx.moveTo(404, 268); ctx.bezierCurveTo(440, 306, 420, 340, 465, 350); ctx.stroke();
  ctx.fillStyle = '#ebd4c9'; ctx.beginPath(); ctx.ellipse(400, 266, 17, 12, -.2, 0, Math.PI * 2); ctx.fill();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function petalGeometry() {
  const positions: number[] = [], indices: number[] = [], uSteps = 7, vSteps = 5;
  for (let v = 0; v <= vSteps; v++) for (let u = 0; u <= uSteps; u++) {
    const t = v / vSteps, angle = (u / uSteps - .5) * 1.7;
    const radius = .025 + t * .24;
    const lip = Math.cos(angle * 1.6) * Math.pow(t, 3) * .065;
    positions.push(Math.sin(angle) * radius, t * .14 + Math.sin(t * Math.PI) * .07 - Math.pow(t, 5) * .06 + lip, Math.cos(angle) * radius);
  }
  for (let v = 0; v < vSteps; v++) for (let u = 0; u < uSteps; u++) {
    const a = v * (uSteps + 1) + u, b = a + uSteps + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export type RoseGardenEngine = { select: (index: number) => void; zoom: (amount: number) => void; dispose: () => void };
export function mountRoseGarden(host: HTMLElement, options: { onCity: (index: number) => void; onOpen: (index: number) => void; suspended: () => boolean }): RoseGardenEngine {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute('aria-label', '玫瑰花园里的五本城市手帐'); host.append(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#190f18'); scene.fog = new THREE.FogExp2('#190f18', .047);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 70);
  scene.add(new THREE.HemisphereLight('#ffe9df', '#57394a', 2.1));
  const key = new THREE.DirectionalLight('#ffe1c9', 3.0); key.position.set(-5, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight('#e7a5c6', 2); rim.position.set(6, 5, -5); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#38212c', roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.06; scene.add(floor);

  const roseCount = 425, petalsPerRose = 18;
  const petals = new THREE.InstancedMesh(petalGeometry(), new THREE.MeshStandardMaterial({ color: '#eea6b9', side: THREE.DoubleSide, roughness: .7, metalness: .02 }), roseCount * petalsPerRose);
  const leafGeometry = new THREE.SphereGeometry(1, 7, 4);
  const leaves = new THREE.InstancedMesh(leafGeometry, new THREE.MeshStandardMaterial({ color: '#536449', roughness: .9 }), roseCount * 2);
  const dummy = new THREE.Object3D(), rose = new THREE.Object3D(), matrix = new THREE.Matrix4();
  const random = (n: number) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
  const colors = ['#cb6e8e', '#e5a4ba', '#f3c0c6', '#bc738e', '#e9bab3'];
  let instance = 0;
  for (let i = 0; i < roseCount; i++) {
    const x = (i % 25 - 12) * .76 + (random(i) - .5) * .4, z = (Math.floor(i / 25) - 8) * .9 + (random(i + 900) - .5) * .35;
    rose.position.set(x, .01, z); rose.rotation.set((random(i + 3) - .5) * .4, random(i + 10) * 6.28, (random(i + 8) - .5) * .35); rose.scale.setScalar(.85 + random(i + 4) * .55); rose.updateMatrix();
    for (let ring = 0; ring < 3; ring++) {
      const count = [4, 6, 8][ring], scale = [.44, .74, 1.1][ring];
      for (let petal = 0; petal < count; petal++) {
        dummy.position.set(0, (2 - ring) * .022, 0); dummy.rotation.set((random(instance + 22) - .5) * .15, petal / count * Math.PI * 2 + ring * .6, (random(instance + 6) - .5) * .12); dummy.scale.set(scale, 1 - ring * .08, scale); dummy.updateMatrix();
        matrix.multiplyMatrices(rose.matrix, dummy.matrix); petals.setMatrixAt(instance, matrix); petals.setColorAt(instance++, new THREE.Color(colors[i % colors.length]).multiplyScalar(.8 + ring * .1));
      }
    }
    for (let leaf = 0; leaf < 2; leaf++) {
      dummy.position.set(x + (leaf ? .22 : -.23), .005, z + .1); dummy.rotation.set(0, random(i + leaf + 60) * 6.28, -.1); dummy.scale.set(.23, .015, .085); dummy.updateMatrix(); leaves.setMatrixAt(i * 2 + leaf, dummy.matrix);
    }
  }
  petals.instanceMatrix.needsUpdate = true; leaves.instanceMatrix.needsUpdate = true; scene.add(petals, leaves);
  host.dataset.roses = String(roseCount);

  const books: THREE.Group[] = [], hitMeshes: THREE.Object3D[] = [];
  const coverGeometry = new THREE.BoxGeometry(1.54, 2.18, .055), pageGeometry = new THREE.BoxGeometry(1.45, 2.08, .15);
  const paper = new THREE.MeshStandardMaterial({ color: '#eee0ca', roughness: .9 });
  cityAlbums.forEach((city, index) => {
    const group = new THREE.Group(); group.position.set((index - 2) * 2.1, 1.19, -Math.abs(index - 2) * .22); group.rotation.y = (2 - index) * .08;
    const texture = bookCover(city, index); texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const cloth = new THREE.MeshStandardMaterial({ color: city.color, roughness: .82 });
    const front = new THREE.MeshStandardMaterial({ map: texture, roughness: .8 });
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
      renderer.dispose(); renderer.domElement.remove(); delete host.dataset.engine;
    },
  };
}
