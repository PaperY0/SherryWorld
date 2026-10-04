# Blender 人物小样 V2

日期：2026-10-04。当前状态：可编辑、可导出、可在网页交互的造型粗模，尚未达到 V6 三视图的相似度和视觉精度。

## 本次产物

- `assets/models/sherry-avatar-blender-v2.blend`：Blender 4.5.14 LTS 可编辑场景，包含人物、正交相机与柔光棚。
- `assets/models/sherry-avatar-blender-v2.glb`：只含人物的网页模型；发布副本在 `site/public/models/`。
- `assets/models/source/refine-avatar-blender.py`：建模源码，以项目已有 V1 为基础，调整脸型、刘海、胸前和背部发束、银白挂耳染、领口与接缝。
- `assets/models/source/render-avatar-blender.py`：Light / Dark 正面、25 度、90 度和背面渲染。
- `assets/previews/avatar-blender-v2/`：实际 Blender 渲染与网页截图。
- `assets/models/blender-v2-manifest.json`：通过真实 GLTFLoader 加载后计算的几何数量、边界、SHA-256 与限制。

上述建模及渲染脚本通过本机 MCP 客户端调用 `execute_blender_code` 执行。不是把生成的 PNG 当成三维模型。模型不包含原始个人照片或外部下载网格。

## 网页接入

访问 `/avatar-lab`。支持鼠标转头、拖动转身、方向键与 Home、暂停、Light / Dark 衣服换色、中文 / English。加载失败或无 WebGL 时显示造型参考并保留返回入口。首页仍使用已经确认的 V5 视觉图片，等待人物精修后再集成。

## 重建与检查

先运行 `site` 中的 `npm run build:avatar` 生成基础 V1。启动已安装的 Blender MCP Addon，在 MCP `execute_blender_code` 中依次执行两个源码文件的内容。源码中的 `ROOT` 必须设置为本机项目绝对路径；执行前创建 `assets/previews/avatar-blender-v2/` 和 `site/public/models/`。

先建模导出，后渲染；避免把灯光、相机、地面导入网页资产。脚本清理孤立曲线、网格和材质，以便重复执行时材质名称保持一致。导入对象原本采用四元数旋转，预览转身明确改成 XYZ 模式。

在 `site` 执行 `npm run validate:avatar` 检查 GLB 2.0、有限顶点、必需节点、服装材质、2 MB 预算、发布副本一致性，以及排除棚景。然后执行 `npm run typecheck`、`npm run build` 和浏览器测试。

本次实测：136 个网格、63,927 个顶点、120,368 个三角形，GLB 为 1,795,632 字节。类型检查与生产构建通过，19 项完整浏览器测试通过；修正重复导入材质后重新检查最终 GLB 并运行人物相关 6 项测试，全部通过。网页双主题桌面及手机共 8 张截图生成时没有页面异常。

## 下一轮视觉精修

V6 是目标参考，当前模型仍明显偏几何公仔：眼镜过于方正、脸部轮廓与眼睑不够自然、头发缺少卷曲层次、衣服缺少完整针织细节。优先重新塑造脸部和眼镜、做更自然的发束轮廓，再检查三视角一致性；之后才进入灯光定稿和首页融合。

当前仅有头部及躯干变换层级，没有骨骼、眨眼绑定、表情混合形状或头发物理。呼吸和转头由网页实时驱动，不应登记为完整人物动画绑定。
