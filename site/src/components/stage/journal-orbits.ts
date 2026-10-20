import * as THREE from 'three';

// Shared world coordinates keep the journals attached to their orbits during camera dolly/pan.
export function journalAnchor(index: number, count: number) {
  const x = (index - (count - 1) / 2) * 2.1;
  return new THREE.Vector3(x, 1.19 - .005 * x * x, -Math.abs(x) * .105);
}

export function createJournalOrbits(scene: THREE.Scene, anchors: THREE.Vector3[]) {
  const extent = Math.max(8, Math.abs(anchors[0]?.x ?? 0) + 4);
  const points = Array.from({ length: 25 }, (_, i) => {
    const x = -extent + extent * 2 * i / 24;
    return new THREE.Vector3(x, 1.19 - .005 * x * x, -Math.abs(x) * .105 - .32);
  });
  const path = new THREE.CatmullRomCurve3(points);
  const line = (curve: THREE.Curve<THREE.Vector3>, opacity: number, dashed = false) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(256));
    const material = dashed
      ? new THREE.LineDashedMaterial({ color: '#e69aba', transparent: true, opacity, dashSize: .055, gapSize: .09, depthWrite: false })
      : new THREE.LineBasicMaterial({ color: '#f4a2c6', transparent: true, opacity, depthWrite: false });
    const object = new THREE.Line(geometry, material); object.computeLineDistances(); scene.add(object); return object;
  };
  line(path, .8);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(path, 200, .025, 5, false), new THREE.MeshBasicMaterial({ color: '#f3a1c6', transparent: true, opacity: .08, blending: THREE.AdditiveBlending, depthWrite: false })));
  for (const [radius, rise, tilt] of [[extent,.94,-.055],[extent*.84,.58,.045]]) {
    const ellipse = new THREE.CatmullRomCurve3(Array.from({ length: 129 }, (_, i) => {
      const angle = i / 128 * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      return new THREE.Vector3(x, 1.19 + Math.sin(angle) * rise + x * tilt, -1.05);
    }));
    line(ellipse, .22, true);
  }
  const nodes = anchors.map(anchor => {
    const group = new THREE.Group(); group.position.copy(anchor); group.position.z -= .3;
    const ellipse = new THREE.EllipseCurve(0,0,1.04,.52,0,Math.PI*2,false,0);
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ellipse.getPoints(96)), new THREE.LineDashedMaterial({ color: '#f8b9d7', transparent: true, opacity: .32, dashSize: .045, gapSize: .07, depthWrite: false }));
    ring.computeLineDistances(); group.add(ring);
    const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-1.7,0),new THREE.Vector3(0,1.7,0)]), new THREE.LineDashedMaterial({ color: '#f3a6cb', transparent: true, opacity: 0, dashSize: .025, gapSize: .075, depthWrite: false })); axis.computeLineDistances(); group.add(axis);
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(.07),new THREE.MeshBasicMaterial({ color: '#ffe6f3' })); group.add(star);
    scene.add(group); return { ring, axis };
  });
  const comet = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(48 * 3),3)),new THREE.PointsMaterial({ color:'#ffe8f5',size:.035,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending })); scene.add(comet);
  return {
    update(time: number, active: number, reduced: boolean) {
      nodes.forEach((node,index) => {
        node.axis.material.opacity = index === active ? .32 : 0;
        node.ring.material.opacity = index === active ? .55 : .25;
        node.ring.rotation.z = reduced ? 0 : time * .025;
      });
      const position = comet.geometry.getAttribute('position');
      for (let i=0;i<48;i++) { const p=path.getPointAt(((reduced ? .5 : time / 14) - i*.0015 + 1) % 1); position.setXYZ(i,p.x,p.y,p.z); }
      position.needsUpdate=true;
    },
  };
}
