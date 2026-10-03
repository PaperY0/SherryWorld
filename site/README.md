# Sherry World · 正式网站

第一阶段已实现：Next.js / React / TypeScript 工程、中英切换、LIGHT / DARK、设置记忆、静态人物序幕、欢迎入口与各栏目骨架。

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
- 项目区目前链接公开 GitHub；正式曲面画廊、项目数据详情和视差镜头未接入。
- 爱好、生活、旅行照片位置是待补充素材的留白，不是虚构经历或照片。
- 浏览器页面标题、HTML lang 与正文随语言切换；语言专属分享元信息在后续阶段完善。

实际版本锁定在 `package.json` 与 `package-lock.json`。只部署本工程，避免把上级的设计备份和原始资料一起发布。

执行依据：[第一轮动手计划](../docs/plans/2026-10-03-first-build.md)。
