/** Validate the authored Blender export before publishing it to the avatar lab. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const asset = 'sherry-avatar-blender-v2.glb';
const source = await readFile(path.join(root, 'assets/models', asset));
const served = await readFile(path.join(root, 'site/public/models', asset));
if (!source.equals(served)) throw Error('Published model differs from source');
if (source.readUInt32LE(0) !== 0x46546c67 || source.readUInt32LE(4) !== 2 || source.readUInt32LE(8) !== source.length) throw Error('Invalid GLB header');
if (source.length > 2_000_000) throw Error('Model exceeds the 2MB lab budget');
const buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
const { scene } = await new GLTFLoader().parseAsync(buffer, '');
for (const name of ['AvatarRoot', 'HeadPivot']) if (!scene.getObjectByName(name)) throw Error(`Missing ${name}`);
let meshes = 0, vertices = 0, triangles = 0;
const materials = new Set();
scene.traverse(object => {
  if (object.name.startsWith('Studio') || object.isLight || object.isCamera) throw Error('Studio content leaked into GLB');
  if (!object.isMesh) return;
  meshes++;
  const positions = object.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) for (const value of [positions.getX(i), positions.getY(i), positions.getZ(i)]) if (!Number.isFinite(value)) throw Error('Nonfinite geometry');
  vertices += positions.count;
  triangles += (object.geometry.index?.count ?? positions.count) / 3;
  for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material.name);
});
if (!materials.has('Sweater')) throw Error('Missing recolorable wardrobe material');
const bounds = new THREE.Box3().setFromObject(scene);
const manifest = {
  schemaVersion: 1, asset, source: 'assets/models/source/refine-avatar-blender.py',
  blend: 'assets/models/sherry-avatar-blender-v2.blend',
  reference: 'assets/design/current/personal-avatar-turnaround-v6.png',
  status: 'blender-refined-blockout-not-likeness-approved',
  provenance: 'Project-authored v1 geometry refined in Blender 4.5.14 through MCP; no external meshes or photo textures.',
  sha256: createHash('sha256').update(source).digest('hex'),
  stats: { meshes, vertices, triangles, bytes: source.length, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() } },
  materials: [...materials],
  validation: { glbVersion: 2, finitePositions: true, copyBytesIdentical: true, requiredNodes: ['AvatarRoot', 'HeadPivot'], studioExcluded: true },
  limitations: ['Early blockout: face, hair and clothing still differ substantially from V6.', 'Transform hierarchy only; no skeleton, facial blendshapes, blink rig or simulated hair.']
};
await writeFile(path.join(root, 'assets/models/blender-v2-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
