# Sherry World · 正式网站

## 当前线上版本与自动部署

- GitHub：<https://github.com/PaperY0/SherryWorld>，正式分支 `main`。
- 网站：<https://sherry-world.vercel.app>；后台：<https://sherry-world.vercel.app/admin>。
- Vercel：团队 `sherry-7c67` → 项目 `sherry-world`，GitHub 仓库已连接；构建根目录为 `site`，使用 Next.js、Node.js 24。
- 推送 `main` 后由 Vercel 自动构建并更新正式网站。部署状态可在 GitHub 提交检查或 Vercel Deployments 查看。
- 后台资料保存在 Supabase；后台保存内容后刷新前台即可查看，无需推送代码。图片上传到 Storage 的 `sherry-media` 桶。
- 本地 `.env.local` 与 Vercel 服务端环境变量保管密钥，不提交到 GitHub。

下文保留早期工程说明；当前正式入口为 `/stage`，线上根路径会自动跳转。

已实现：Next.js / React / TypeScript 工程、中英切换、LIGHT / DARK、设置记忆、静态人物序幕、欢迎入口、各栏目骨架与正式曲面项目画廊。

在本目录执行：

```powershell
npm ci
npm run dev
```

默认预览：`http://127.0.0.1:3000`。生产构建与运行：

```powershell
npm run typecheck
npm run build
npm start
```

修改代码使用开发服务器；重新构建后须重启生产服务器以读取新构建。

```powershell
npm test
```

测试默认自动启动 3100 端口开发服务器，使用本机 Microsoft Edge。其他系统可先运行 `npx playwright install chromium`，再通过 `PLAYWRIGHT_EXECUTABLE_PATH` 指定浏览器可执行文件。也可设置 `PLAYWRIGHT_BASE_URL` 对已运行的预览测试。

## 内容与设置

- 中英文案：`src/content/messages.ts`，键名由 TypeScript 校验。
- 全站设置：`src/lib/preferences.ts`、`src/components/settings/`。
- 页面骨架：`src/components/Home.tsx`；样式：`src/app/globals.css`。
- 中文为初始语言；首次主题跟随系统，主动选择后记忆。存储不可用仍可切换。
- 人物 `public/images/intro-*.png` 是已确认视觉稿的静态预览，并非真实 3D 模型；正式模型将替换独立的序幕内容。
- 正式画廊：`src/components/gallery/`；双语项目内容：`src/content/projects.ts`；类型：`src/types/project.ts`。
- 画廊支持自动左流、鼠标换向、拖动、暂停、键盘参观、双语详情和全部项目目录；作品与学习 Fork 分开，Fork 保留上游链接。
- 项目封面是概念海报，尚未替换为真实截图；首页人物模型与视差镜头未接入。
- `/avatar-lab` 是独立真实几何试验页：GLB、轻微转头/呼吸、双主题服装、有限转动、暂停与失败替代。相似度未认可，首页仍使用 V5 图片。程序 V1 可用 `npm run build:avatar` 重新生成；该命令须在完整工作目录使用，会写入上级模型目录。
- 爱好、生活、旅行照片位置是待补充素材的留白，不是虚构经历或照片。
- 浏览器页面标题、HTML lang 与正文随语言切换；语言专属分享元信息在后续阶段完善。

实际版本锁定在 `package.json` 与 `package-lock.json`。只部署本工程，避免把上级的设计备份和原始资料一起发布。

项目公开数据以 `../data/GitHub项目公开快照-2026-10-04.json` 为维护源，保留原有快照。修改数据后，从本目录运行 `npm run sync:projects`，同步到工程内的 `src/content/project-snapshot.json`。构建只读取工程内副本，因此 `site/` 可独立部署；不会在访客浏览时请求 GitHub API。

当前收录 17 个公开仓库：13 个非 Fork、4 个 Fork。README 证据来自此前的 9 个项目记录；本轮刷新仓库元数据与 Fork 上游来源，不代表重新运行这些项目或验证性能。详情文案和封面可在类型化内容中进一步补齐。

执行依据：[第一轮动手计划](../docs/plans/2026-10-03-first-build.md)。
