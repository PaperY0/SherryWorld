"""Procedural Blender refinement of authored v1. Run through Blender MCP execute.

No external meshes, images, textures, drivers or handlers are used.
The source GLB's +Y-up points are converted to Blender +Z-up coordinates.
"""
import bpy
import math
from mathutils import Vector

ROOT = 'C:/Users/wsy19/Desktop/Personal World'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for curve_data in list(bpy.data.curves):
    if curve_data.users == 0:
        bpy.data.curves.remove(curve_data)
for mesh_data in list(bpy.data.meshes):
    if mesh_data.users == 0:
        bpy.data.meshes.remove(mesh_data)
# Remove orphan materials so repeated imports retain stable control names.
for material in list(bpy.data.materials):
    if material.users == 0:
        bpy.data.materials.remove(material)
bpy.ops.import_scene.gltf(filepath=ROOT + '/assets/models/sherry-avatar-v1.glb')
head = bpy.data.objects['HeadPivot']
root = bpy.data.objects['AvatarRoot']
hair = bpy.data.materials['HairCharcoal']
contour = bpy.data.materials['HairContour']
skin = bpy.data.materials['SkinWarmMatte']
sweater = bpy.data.materials['Sweater']

def point(v):
    return Vector((v[0], -v[2], v[1]))

def smooth(obj, subdivision=False):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    if subdivision:
        modifier = obj.modifiers.new('SculptSurfaceSmoothing', 'SUBSURF')
        modifier.levels = 1
        modifier.render_levels = 1

def ribbon(name, anchors, width, depth, material, parent, segments=36):
    # Cubic Bezier swept flattened volume; overlapping strips form sculpted fringe.
    p = [Vector(v) for v in anchors]
    vertices, faces = [], []
    radial = 10
    for i in range(segments + 1):
        t = i / segments
        s = 1 - t
        center = s**3*p[0] + 3*s*s*t*p[1] + 3*s*t*t*p[2] + t**3*p[3]
        tangent = 3*s*s*(p[1]-p[0]) + 6*s*t*(p[2]-p[1]) + 3*t*t*(p[3]-p[2])
        lateral = Vector((tangent.y, -tangent.x, 0)).normalized()
        taper = max(.015, math.sin(math.pi*(.13 + .87*t))**.55)
        for j in range(radial):
            angle = j/radial*2*math.pi
            vertex = center + lateral*(math.cos(angle)*width*taper)
            vertex.z += math.sin(angle)*depth*taper
            vertices.append(point(vertex))
    for i in range(segments):
        for j in range(radial):
            a = i*radial+j
            b = i*radial+(j+1)%radial
            c = (i+1)*radial+j
            d = (i+1)*radial+(j+1)%radial
            faces.extend([(a,c,b),(b,c,d)])
    faces.append(tuple(reversed(range(radial))))
    faces.append(tuple(segments*radial+j for j in range(radial)))
    data = bpy.data.meshes.new(name + 'Mesh')
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(material)
    smooth(obj)
    return obj

def line(name, anchors, radius, material, parent):
    data = bpy.data.curves.new(name + 'Curve', 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 16
    data.bevel_depth = radius
    data.bevel_resolution = 2
    spline = data.splines.new('BEZIER')
    spline.bezier_points.add(len(anchors)-1)
    for v, coordinate in zip(spline.bezier_points, anchors):
        v.co = point(coordinate)
        v.handle_left_type = 'AUTO'
        v.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(material)
    return obj

# Replace open chunky rod bangs with broad shallow overlapping sculpted ribbons.
for obj in list(bpy.data.objects):
    if obj.name.startswith('AiryFringe'):
        bpy.data.objects.remove(obj, do_unlink=True)
for i in range(12):
    x = -.34 + i*.0618
    side = -1 if i < 6 else 1
    outer = abs(x)/.34
    end_x = x + side*(.055 + .095*outer)
    end_y = .13 + .13*outer + (i%3)*.015
    anchors = [(x*.65,.66,.18), (x,.56,.35), (x+side*.045,.30,.45), (end_x,end_y,.454-.025*outer)]
    ribbon('BlenderSculptedFringe%02d' % i, anchors, .066-.015*outer, .017, hair, head)
    # Narrow highlight ridges stay integrated with the main surface.
    shifted = [(a[0]+.016,a[1],a[2]+.014) for a in anchors]
    line('FringeFineContour%02d' % i, shifted, .0028, contour, head)

# Mesh-level jaw and cheek sculpting in face-local normalized coordinates.
face = bpy.data.objects['Face']
for vertex in face.data.vertices:
    z = vertex.co.z
    if z < -.20:
        vertex.co.x *= 1 + .065*(-z-.20)
    if -.35 < z < .08:
        vertex.co.x *= 1.025
    if z < -.68:
        vertex.co.z += .025*(-z-.68)
smooth(face, True)
for name in ['LeftEar','RightEar','NoseBridge','NoseTip','SweaterTorso','LeftSleeve','RightSleeve','CrownHair','BackHair']:
    if name in bpy.data.objects:
        smooth(bpy.data.objects[name], True)

# Relaxed half-lids blended into the skin, without an angry sloping brow.
for side in [-1, 1]:
    lid = bpy.data.objects['StaticUpperLid' + str(side)]
    lid.scale.z *= 1.06
    lid.location.z -= .004
    smooth(lid, True)
    brow = bpy.data.objects['Brow' + str(side)]
    brow.scale.z = .88
    brow.location.z = .026
    lash = bpy.data.objects['UpperLash' + str(side)]
    lash.location.z -= .004
    # Tiny lower lid line grounds the eye in a sculpted face.
    x = side*.205
    line('LowerLidContour'+str(side), [(x-.10,-.045,.452),(x,-.055,.466),(x+.10,-.043,.451)], .0035, skin, head)

# V6 layered silhouette: flowing chest-length locks with narrower tapered ends.
for obj in list(bpy.data.objects):
    if obj.name.startswith(('LongHair','FaceFramingHair','SilverStreak')):
        bpy.data.objects.remove(obj, do_unlink=True)
for side in [-1,1]:
    for i in range(9):
        x=side*(.38+i*.028)
        depth=-.10+i*.035
        anchors=[(side*(.27+i*.023),.51,depth),
                 (side*(.65+i*.008),.08,depth+.12),
                 (side*(.68+i*.008),-.89,depth+.15),
                 (side*(.48+i*.021),-1.63+(i%3)*.15,depth+.14)]
        ribbon('V6LayeredLock'+str(side)+'_'+str(i),anchors,.125,.052,hair if i%3 else contour,head)
        for j in [-1,0,1]:
            ridge=[(a[0]+j*.017,a[1],a[2]+.043) for a in anchors]
            line('V6LockRidge'+str(side)+'_'+str(i)+'_'+str(j),ridge,.0022,contour,head)
# Rear layers continue down the back instead of stopping at the skull shell.
for i in range(11):
    x=-.38+i*.076
    anchors=[(x*.65,.52,-.32),(x*1.4,.08,-.57),
             (x*1.25,-.94,-.55),(x*.95,-1.64+(i%3)*.08,-.38)]
    ribbon('V6BackLayer%02d'%i,anchors,.105,.055,hair if i%3 else contour,head)
# A few front locks overlap the sweater rather than ending beside the face.
for side in [-1,1]:
    for i in range(3):
        anchors=[(side*(.44+i*.02),.16,.29),(side*(.67+i*.02),-.32,.41),
                 (side*(.25+i*.045),-1.05,.44),(side*(.38+i*.04),-1.55+i*.08,.37)]
        ribbon('V6ChestLock'+str(side)+'_'+str(i),anchors,.095,.04,hair,head)
silver=bpy.data.materials['SilverInnerStreak']
for i in range(6):
    anchors=[(.46+i*.012,-.08,.19),(.62+i*.014,-.55,.39),
             (.31+i*.026,-1.04,.47),(.39+i*.024,-1.56+i*.035,.39)]
    ribbon('V6SilverInnerLock'+str(i),anchors,.030,.023,silver,head)
    line('V6SilverRidge'+str(i),[(a[0],a[1],a[2]+.023) for a in anchors],.002, silver,head)
# Slightly taper the lower face; preserve attached eye and mouth positions.
for vertex in face.data.vertices:
    if vertex.co.z < -.25:
        vertex.co.x *= 1-.12*min(1,(-vertex.co.z-.25)/.75)
# Give the upper lid a gentler aloof expression with more visible iris.
for side in [-1,1]:
    bpy.data.objects['StaticUpperLid'+str(side)].location.z += .018
    bpy.data.objects['UpperLash'+str(side)].location.z += .009
root.rotation_mode='XYZ'
head.rotation_mode='XYZ'

# Remove exposed accent curves; low-poly surfaces should read as connected locks.
for obj in list(bpy.data.objects):
    if obj.name.startswith(('V6LockRidge','V6SilverRidge','FringeFineContour')):
        bpy.data.objects.remove(obj,do_unlink=True)

# Knit collar geometry and seams, all using the existing recolorable Sweater.
for side in [-1,1]:
    line('ShoulderSeam'+str(side), [(side*.20,1.30,.285),(side*.44,1.19,.31),(side*.62,.99,.293),(side*.70,.76,.28)], .008, sweater, root)
    line('SleeveSeam'+str(side), [(side*.72,.90,.283),(side*.78,.64,.295),(side*.75,.37,.282),(side*.66,.20,.257)], .005, sweater, root)
for i in range(18):
    a = i/18*2*math.pi
    line('BlenderCollarRib%02d'%i, [(.26*math.cos(a),1.31,.025+.26*math.sin(a)),(.27*math.cos(a),1.36,.025+.27*math.sin(a))], .0045, sweater, root)

for mat in bpy.data.materials:
    if mat.use_nodes:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            bsdf.inputs['Metallic'].default_value = 0
            if mat.name.startswith(('Skin','Hair','Silver','Sweater','Lips')):
                bsdf.inputs['Roughness'].default_value = .78 if mat.name.startswith('Hair') else .85

# Convert authored contour curves to actual glTF triangle meshes before export.
bpy.ops.object.select_all(action='DESELECT')
for obj in list(bpy.data.objects):
    if obj.type == 'CURVE':
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.convert(target='MESH')
        obj.select_set(False)

scene = bpy.context.scene
scene['avatar_asset_status'] = 'blender-refined-blockout-not-likeness-approved'
scene['avatar_asset_provenance'] = 'Project-authored procedural v1 meshes refined using Blender geometry; no external assets.'
scene['avatar_reference'] = 'assets/design/current/personal-avatar-turnaround-v6.png'
scene['avatar_asset_source'] = 'assets/models/source/refine-avatar-blender.py'
root['control'] = 'Whole-body transform; breathing and turn.'
head['control'] = 'Head pivot; face, glasses and hair transform together.'
for destination in ['/assets/models/sherry-avatar-blender-v2.glb','/site/public/models/sherry-avatar-blender-v2.glb']:
    bpy.ops.export_scene.gltf(filepath=ROOT+destination, export_format='GLB', export_apply=True, export_yup=True, export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/assets/models/sherry-avatar-blender-v2.blend')
print('BLENDER_REFINEMENT_COMPLETE: source-authored meshes sculpted, GLBs exported, blend saved. Likeness remains unapproved.')
