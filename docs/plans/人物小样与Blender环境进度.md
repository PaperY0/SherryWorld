# 人物小样与 Blender 环境进度

日期：2026-10-04。最新用户顺序：先生成 3D 风格的正面、侧面、背面三视图，再依据三视图在 Blender 中建模。

## 已执行

程序几何小样 V1 保存为 `assets/models/sherry-avatar-v1.glb`，源码为 `site/scripts/build-avatar.mjs`，资产清单记录实际几何与限制。独立 `/avatar-lab` 页面可加载、有限转头、转身、呼吸、暂停、切换双主题与语言。主页仍保留 V5 图片。小样不是用户确认的最终脸型或高级人物资产，不能将它代替三视图。

实际验证：GLB 2.0，82 个网格，671,300 字节，源码与发布副本字节一致；模型加载、指针转头、服装切换、暂停、减少动态、无 WebGL、加载失败、上下文丢失及加载竞态测试已接入。构建通过，19 项完整浏览器测试通过。双主题正面、左右约 35 度与手机预览保存在 `assets/previews/avatar-v1/`；这些只证明粗模空间和交互能力，不证明相似度。

已从 Blender 官方下载站下载 Blender 4.5.14 LTS Windows 便携版，并核对官方 SHA-256：`b9533d2397ac1984db4466fb23a7a4649391cca93f6e84209f9bcc60d071c8b9`。安装位置 `work/tools/blender/blender-4.5.14-windows-x64/`，不提交软件二进制到网站仓库。

已安装社区集成 **mcp-for-blender 2.1.3**（原名 Blender MCP），并启用 Blender Addon 协议 13。Codex 注册 `blender` STDIO 配置，使用本地 uvx、Python 3.11、127.0.0.1:9876。保留原 Codex 设置的本地备份，关闭遥测并启用该 MCP 的脚本检查模式。社区集成不是 Blender 官方出品。

通过真实 MCP 会话完成握手、场景读取和导入 V1 结构参考，确认 Blender 4.5.14 LTS 与节点。原生 Codex MCP 工具将在客户端重新加载后可见；本轮已用本地 MCP 客户端实际验证连接，不依赖用户立即重启。

## 三视图与当前状态

内置 imagegen 前两次连接失败。用户明确选择继续重试后，本次成功生成 V6 三视图，保存为 `assets/design/current/personal-avatar-turnaround-v6.png`。提示词、检查记录与图片入口见 [人物三视图 V6](../design/人物三视图V6.md)。该生成阻塞已经解除。

三视图要求：完整头顶、对齐比例的上半身正/侧/背视角；一致黑针织、黑框眼镜、略拽闭口表情、黑色层次长发与人物左侧银白挂耳染。后脑与侧面设计是生成参考，需要检查一致性，不能视为照片直接证据。

已按 V6 方向修改并通过 Blender MCP 实际执行建模脚本，导出可编辑 `assets/models/sherry-avatar-blender-v2.blend` 与同名 GLB。独立 `/avatar-lab` 已切换到 V2，支持原有双主题、中英文与鼠标交互。实际双主题四视角渲染保存在 `assets/previews/avatar-blender-v2/`。完整说明见 [Blender 人物小样 V2](../design/Blender人物小样V2.md)。这仍是粗模，脸、发型和针织细节与 V6 存在明显差距，未认定为最终人物，也未替换首页。

内置生成失败时可改用 API/CLI 路径，但 imagegen 技能要求用户明确选择该替代路径且配置本机 `OPENAI_API_KEY`。不在聊天或公开仓库保存 API Key。

参考：[官方 Blender 发布目录](https://download.blender.org/release/Blender4.5/)、[MCP for Blender 维护仓库](https://github.com/ahujasid/mcp-for-blender)。
