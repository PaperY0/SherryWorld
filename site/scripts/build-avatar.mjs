/** Authored procedural collectible bust. No image textures or downloaded meshes. */
import * as THREE from 'three';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const root = new THREE.Group(); root.name = 'AvatarRoot';
const head = new THREE.Group(); head.name = 'HeadPivot'; head.position.y = 2.12; root.add(head);
const material = (name, color, roughness = .82) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }); m.name = name; return m; };
const skin = material('SkinWarmMatte', '#e8bda6');
const hair = material('HairCharcoal', '#242124', .72);
const hairAccent = material('HairContour', '#302b2e', .75);
const silver = material('SilverInnerStreak', '#dedde5', .68);
const sweater = material('Sweater', '#242329');
const black = material('GlassesBlack', '#141318', .4);
const eyeWhite = material('EyeIvory', '#f3e7df');
const iris = material('IrisEspresso', '#342824', .45);
const pupil = material('Pupil', '#100d12', .35);
const lip = material('LipsMutedRose', '#ad716b');
const mouth = material('MouthLine', '#744a4c');
function mesh(name, geometry, mat, parent, position=[0,0,0], scale=[1,1,1]) { const m = new THREE.Mesh(geometry, mat); m.name=name; m.position.fromArray(position); m.scale.fromArray(scale); parent.add(m); return m; }
const sphere = (name, mat, parent, pos, scale, segments=24) => mesh(name,new THREE.SphereGeometry(1,segments,16),mat,parent,pos,scale);
function tube(name, points, radius, mat, parent, segments=28) { const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))); return mesh(name,new THREE.TubeGeometry(curve,segments,radius,8,false),mat,parent); }
// Smooth swept locks: wide across the silhouette, shallow in depth, tapered ends.
function lock(name, points, width, depth, mat, parent, segments=24) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const pos=[],indices=[],radial=8;
  for(let i=0;i<=segments;i++) { const t=i/segments,p=curve.getPoint(t), tangent=curve.getTangent(t); const lateral=new THREE.Vector3(tangent.y,-tangent.x,0).normalize(); const taper=Math.max(.05,Math.sin(Math.PI*(.13+.87*t))**.55);
    for(let j=0;j<radial;j++){ const a=j/radial*Math.PI*2; const v=p.clone().addScaledVector(lateral,Math.cos(a)*width*taper); v.z+=Math.sin(a)*depth*taper; pos.push(v.x,v.y,v.z); }
  }
  for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){ const a=i*radial+j,b=i*radial+(j+1)%radial,c=(i+1)*radial+j,d=(i+1)*radial+(j+1)%radial; indices.push(a,c,b,b,c,d); }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();return mesh(name,g,mat,parent);
}
// Torso and bent sleeves are complete volumes, cropped deliberately as a bust.
sphere('SweaterTorso',sweater,root,[0,.695,-.025],[.74,.695,.37]);
for(const side of [-1,1]) {
 const arm=sphere(side<0?'LeftSleeve':'RightSleeve',sweater,root,[side*.62,.71,-.025],[.265,.62,.32]);arm.rotation.z=side*.22;

}
sphere('Neck',skin,root,[0,1.47,-.015],[.22,.4,.2]);
const collar=mesh('RibbedCollar',new THREE.TorusGeometry(.235,.075,8,32),sweater,root,[0,1.33,.025]);collar.rotation.x=Math.PI/2;
for(let i=0;i<24;i++){let a=i/24*Math.PI*2;tube('CollarRib'+i,[[.238*Math.cos(a),1.32,.025+.238*Math.sin(a)],[.244*Math.cos(a),1.37,.025+.244*Math.sin(a)]],.009,sweater,root,2);}
// Sculpt the face into a softer jaw and narrower chin instead of a perfect ball.
const faceGeometry=new THREE.SphereGeometry(1,40,28), facePositions=faceGeometry.attributes.position;
for(let i=0;i<facePositions.count;i++){const y=facePositions.getY(i);facePositions.setX(i,facePositions.getX(i)*(y<-.18?1+.21*(y+.18):1));}
faceGeometry.computeVertexNormals();
mesh('Face',faceGeometry,skin,head,[0,0,.03],[.51,.67,.43]);
for(const side of [-1,1]) {sphere(side<0?'LeftEar':'RightEar',skin,head,[side*.493,-.03,.02],[.085,.14,.085]);sphere('EarInner'+side,lip,head,[side*.512,-.035,.079],[.032,.075,.019]);}
sphere('NoseBridge',skin,head,[0,-.055,.421],[.05,.13,.055]);
sphere('NoseTip',skin,head,[.005,-.137,.467],[.061,.047,.065]);
// Eyes stay behind solid black rounded square spectacle frames.
for(const side of [-1,1]) {
 const x=side*.205;
 sphere('Eye'+side,eyeWhite,head,[x,.015,.421],[.142,.079,.039]);
 sphere('Iris'+side,iris,head,[x+.012,.014,.456],[.064,.066,.016]);
 sphere('Pupil'+side,pupil,head,[x+.013,.018,.471],[.032,.043,.009]);
 sphere('EyeCatchlight'+side,eyeWhite,head,[x-.005,.025,.479],[.012,.015,.004],12);
 sphere('StaticUpperLid'+side,skin,head,[x,.074,.475],[.144,.042,.017]);
 tube('UpperLash'+side,[[x-.13,.025,.45],[x-.065,.041,.491],[x+.055,.041,.491],[x+.135,.032,.447]],.011,hair,head,16);
 tube('Brow'+side,[[x-.12,.174,.424],[x-.015,.184,.443],[x+.1,.174,.428]],.016,hair,head,12);
 const frame=[]; const w=.176,h=.135,r=.045;
 for(let corner=0;corner<4;corner++){const cx=[w-r,-w+r,-w+r,w-r][corner],cy=[h-r,h-r,-h+r,-h+r][corner];for(let j=0;j<=6;j++){const a=(corner*90+j*15)*Math.PI/180;frame.push([x+cx+r*Math.cos(a),.018+cy+r*Math.sin(a),.491]);}}
 frame.push(frame[0]);tube('GlassesFrame'+side,frame,.019,black,head,40);
 tube('GlassesTemple'+side,[[side*.385,.09,.493],[side*.505,.08,.21],[side*.52,.03,.0]],.017,black,head,12);
}
tube('GlassesBridge',[[-.041,.068,.493],[0,.087,.504],[.041,.068,.493]],.018,black,head,10);
sphere('LowerLip',lip,head,[.013,-.305,.414],[.096,.024,.016]);
tube('ClosedSmirk',[[-.104,-.294,.412],[-.027,-.302,.431],[.045,-.294,.43],[.108,-.273,.411]],.008,mouth,head,16);
// Rear hair shell and flowing locks give depth and a clean collectible silhouette.
sphere('BackHair',hair,head,[0,.025,-.205],[.565,.73,.39]);
sphere('CrownHair',hair,head,[0,.46,-.065],[.5,.27,.34]);
for(const side of [-1,1])for(let i=0;i<5;i++){
 const x=side*(.38+i*.045),z=-.19+i*.065;
 lock('LongHair'+side+'_'+i,[[side*.22,.61,z],[x,.29,z+.05],[side*(.53+i*.027),-.26,z+.055],[side*(.48+i*.042),-.77,z+.06],[side*(.55+i*.016),-1.12,z+.09],[side*(.39+i*.03),-1.48,z+.06]],.11,.085,i%2?hairAccent:hair,head);
}
// Thin overlapping swept fringe leaves airy gaps and visible brows.
for(let i=0;i<7;i++){
 const x=-.24+i*.075,side=i<3?-1:1;
 lock('AiryFringe'+i,[[x,.65,.13],[x+side*.035,.47,.34],[x+side*.1,.28,.438],[x+side*.16,.11+(i%3)*.035,.458]],.024+(i%2)*.01,.016,i%2?hairAccent:hair,head,20);
}
for(const side of [-1,1])lock('FaceFramingHair'+side,[[side*.12,.64,.2],[side*.41,.37,.39],[side*.5,-.08,.36],[side*.56,-.47,.26],[side*.43,-.93,.25]],.1,.066,hair,head);
// Image-right inner ear-side silver section continues to the chest, not outer fringe.
for(let i=0;i<4;i++)lock('SilverStreak'+i,[[.455+i*.018,-.05,.145],[.46+i*.022,-.41,.23],[.405+i*.028,-.77,.31],[.44+i*.032,-1.08,.34],[.35+i*.023,-1.42,.31]],.046,.023,silver,head,30);
root.updateMatrixWorld(true);

// Minimal standard GLB 2.0 writer: local TRS hierarchy, normals, indexed triangles, PBR.
const doc={asset:{version:'2.0',generator:'Personal World authored procedural avatar'},scene:0,scenes:[{nodes:[0]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[]};
const chunks=[];let bytes=0;const materialIds=new Map();
function accessor(array,type,componentType,includeBounds=false){const aligned=(bytes+3)&~3;if(aligned>bytes)chunks.push(Buffer.alloc(aligned-bytes));bytes=aligned;const data=Buffer.from(array.buffer,array.byteOffset,array.byteLength);const bv=doc.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:data.length})-1;chunks.push(data);bytes+=data.length;const item={bufferView:bv,componentType,count:array.length/(type==='VEC3'?3:1),type};if(includeBounds){item.min=[Infinity,Infinity,Infinity];item.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){if(!Number.isFinite(array[i]))throw Error('Nonfinite geometry');const j=i%3;item.min[j]=Math.min(item.min[j],array[i]);item.max[j]=Math.max(item.max[j],array[i]);}}return doc.accessors.push(item)-1;}
function visit(obj){const id=doc.nodes.length,node={name:obj.name,translation:obj.position.toArray(),rotation:obj.quaternion.toArray(),scale:obj.scale.toArray()};doc.nodes.push(node);if(obj.isMesh){let mi=materialIds.get(obj.material);if(mi===undefined){const m=obj.material;mi=doc.materials.length;materialIds.set(m,mi);doc.materials.push({name:m.name,pbrMetallicRoughness:{baseColorFactor:[m.color.r,m.color.g,m.color.b,1],metallicFactor:0,roughnessFactor:m.roughness},doubleSided:false});}const g=obj.geometry;node.mesh=doc.meshes.length;doc.meshes.push({name:obj.name,primitives:[{attributes:{POSITION:accessor(g.attributes.position.array,'VEC3',5126,true),NORMAL:accessor(g.attributes.normal.array,'VEC3',5126)},indices:accessor(g.index.array,'SCALAR',g.index.array instanceof Uint32Array?5125:5123),material:mi}]});}if(obj.children.length)node.children=obj.children.map(visit);return id;}
visit(root);const binary=Buffer.concat(chunks);doc.buffers=[{byteLength:binary.length}];let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);const bin=Buffer.concat([binary,Buffer.alloc((4-binary.length%4)%4)]);const total=12+8+json.length+8+bin.length,glb=Buffer.alloc(total);glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(total,8);glb.writeUInt32LE(json.length,12);glb.writeUInt32LE(0x4e4f534a,16);json.copy(glb,20);let offset=20+json.length;glb.writeUInt32LE(bin.length,offset);glb.writeUInt32LE(0x004e4942,offset+4);bin.copy(glb,offset+8);
const bounds=new THREE.Box3().setFromObject(root),stats={meshes:doc.meshes.length,vertices:doc.meshes.reduce((n,m)=>n+doc.accessors[m.primitives[0].attributes.POSITION].count,0),triangles:doc.meshes.reduce((n,m)=>n+doc.accessors[m.primitives[0].indices].count/3,0),bytes:glb.length,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
if(glb.length>2_000_000)throw Error('Avatar exceeds 2MB budget');
for(const relative of ['assets/models/sherry-avatar-v1.glb','site/public/models/sherry-avatar-v1.glb']){const target=path.join(workspace,relative);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,glb);}
const manifest={schemaVersion:1,asset:'sherry-avatar-v1.glb',source:'site/scripts/build-avatar.mjs',license:'Project-authored procedural geometry; no external assets, photos, textures or downloaded meshes.',status:'blockout-not-likeness-approved',description:'Dimensional stylized collectible woman bust with swept long charcoal hair, image-right inner silver streak, black rounded square glasses and closed subtle smirk.',sha256:createHash('sha256').update(glb).digest('hex'),stats,materials:doc.materials.map(m=>m.name),controls:{AvatarRoot:'Whole bust transform; breathe or rotate.',HeadPivot:'Head-local transform, origin at world [0, 2.12, 0]; hair, face and spectacles rotate together.',Sweater:'PBR material shared by torso, sleeves and collar; recolorable black or pearl grey.'},rigType:'Transform hierarchy; no skeleton, skinning or eyelid blink rig.',limitations:['Procedural first blockout; likeness and premium visual quality require rendered review and user approval.','Hair is swept volumetric geometry with tapered tips, not simulated strands.','No hand meshes, full body, facial blendshapes, textures or pre-baked animations.'],validation:{glbVersion:2,finitePositions:true,requiredNodes:['AvatarRoot','HeadPivot'],copyBytesIdentical:true}};
await writeFile(path.join(workspace,'assets/models/asset-manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({outputs:['assets/models/sherry-avatar-v1.glb','site/public/models/sherry-avatar-v1.glb'],...stats,sha256:manifest.sha256},null,2));
