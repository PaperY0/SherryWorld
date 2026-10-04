"""Four orthographic Eevee studio previews of the Blender-refined blockout.
Run after refine-avatar-blender.py; preview directory must already exist.
"""
import bpy
import math
from mathutils import Vector

ROOT = 'C:/Users/wsy19/Desktop/Personal World'
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1000
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
if hasattr(scene, 'eevee') and hasattr(scene.eevee, 'taa_render_samples'):
    scene.eevee.taa_render_samples = 32
scene.view_settings.view_transform = 'AgX'
scene.view_settings.exposure = 0
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get('Background')
background.inputs['Strength'].default_value = .28

def aim(obj, target):
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

for obj in list(bpy.data.objects):
    if obj.type in {'CAMERA','LIGHT'} or obj.name == 'StudioGround':
        bpy.data.objects.remove(obj, do_unlink=True)
camera_data = bpy.data.cameras.new('AvatarStudioCamera')
camera = bpy.data.objects.new('AvatarStudioCamera', camera_data)
bpy.context.collection.objects.link(camera)
camera.location = (0,-7,1.6)
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 3.6
aim(camera,(0,0,1.44))
scene.camera = camera
for name, position, power, size, color in [
    ('KeySoftbox',(-3,-4,5),480,4,(1,.87,.79)),
    ('FillSoftbox',(3,-3,3),260,3,(.83,.9,1)),
    ('HairRim',(1.5,2,4),550,3,(1,.88,.91)),
]:
    data = bpy.data.lights.new(name,'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    data.color = color
    light = bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(light)
    light.location = position
    aim(light,(0,0,1.7))
bpy.ops.mesh.primitive_plane_add(size=200, location=(0,0,-.045))
ground = bpy.context.object
ground.name = 'StudioGround'
ground_material = bpy.data.materials.new('StudioGroundMatte')
ground_material.use_nodes = True
ground_bsdf = ground_material.node_tree.nodes.get('Principled BSDF')
ground_bsdf.inputs['Roughness'].default_value = 1
ground.data.materials.append(ground_material)
sweater_bsdf = bpy.data.materials['Sweater'].node_tree.nodes.get('Principled BSDF')
root = bpy.data.objects['AvatarRoot']
root.rotation_mode = 'XYZ'
for theme in ['light','dark']:
    if theme == 'light':
        background.inputs['Color'].default_value = (.82,.78,.75,1)
        ground_bsdf.inputs['Base Color'].default_value = (.82,.78,.75,1)
        sweater_bsdf.inputs['Base Color'].default_value = (.018,.017,.022,1)
    else:
        background.inputs['Color'].default_value = (.023,.021,.028,1)
        ground_bsdf.inputs['Base Color'].default_value = (.023,.021,.028,1)
        sweater_bsdf.inputs['Base Color'].default_value = (.53,.51,.54,1)
    for view in ['front','right','side','back']:
        root.rotation_euler.z = math.radians({'front':0,'right':25,'side':90,'back':180}[view])
        bpy.context.view_layer.update()
        scene.render.filepath = ROOT+'/assets/previews/avatar-blender-v2/blender-'+theme+'-'+view+'.png'
        bpy.ops.render.render(write_still=True)
root.rotation_euler.z = 0
sweater_bsdf.inputs['Base Color'].default_value = (.018,.017,.022,1)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/assets/models/sherry-avatar-blender-v2.blend')
print('BLENDER_PREVIEWS_COMPLETE: eight studio PNGs; likeness remains unapproved.')
