# PaperY · Personal World

个人网页工作目录。所有设计与工程均在本目录维护。

GitHub 仓库：[PaperY0/SherryWorld](https://github.com/PaperY0/SherryWorld)。每完成一个可验收步骤，验证后提交并推送；具体规则见 [同步与交付约定](docs/plans/GitHub同步与交付约定.md)。

## 从这里开始

- [第一轮动手计划](docs/plans/2026-10-03-first-build.md)
- [完整落地计划](docs/design/个人网页落地与完善计划.html)
- [完整实现报告](docs/design/个人网页完整实现报告.html)
- [已确认的项目画廊](prototypes/项目画廊交互原型.html)
- [当前 Light 视觉稿](assets/design/current/personal-intro-light-v4.png)
- [当前 Dark 视觉稿](assets/design/current/personal-intro-dark-v4.png)

## 目录用途

| 目录 | 内容与维护方式 |
| --- | --- |
| `site/` | 正式网站工程；已完成第一阶段双主题、中英切换与栏目骨架 |
| `docs/design/` | 设计说明、完整报告、完整路线图、GitHub 核对清单 |
| `docs/plans/` | 每轮动手计划与验收记录 |
| `prototypes/` | 已认可的交互原型，作为正式开发的外观与行为基准 |
| `assets/design/current/` | 当前确认的双主题人物视觉稿 |
| `assets/design/archive/` | 早期人物、首页探索图；仅作历史参考 |
| `assets/previews/` | 画廊效果截图 |
| `assets/models/` | 后续真实模型源文件、GLB 与资产说明；当前没有模型 |
| `data/` | GitHub 公开项目快照；当前为 2026-10-03 的资料记录 |
| `work/` | 生成脚本、验证脚本、公开资料读取记录及临时截图 |
| `work/archive-pre-organization/` | 整理前文件备份，不作为当前设计来源 |

根目录的三个中文 HTML 文件是兼容跳转入口，旧预览链接仍可使用。正式内容以对应子目录里的文件为准，避免出现多个编辑版本。

## 当前状态

已完成：设计资料归档、画廊原型、项目资料快照、路线图；正式网站第一阶段骨架、中英切换与双主题。

未完成：正式曲面画廊接入、真实项目截图、实际 3D 人物模型、视差镜头与整站发布。原型封面是概念海报，人物 PNG 是静态视觉参考。启动和验证方式见 [网站工程说明](site/README.md)。

整理记录在 [文件整理清单](docs/文件整理清单.json)。原图和项目 JSON 移动时保留原字节；文档、HTML 与脚本只修复归档后的引用路径。没有删除文件，也没有把个人照片从外部聊天目录自动复制进来。

`work/` 为本地工作记录，不提交到公开仓库。正式工程中的构建脚本、测试与依赖锁文件会随工程一同提交；本地临时生成脚本不属于正式工程。
