# 网站部署与内容存储

网站工程是 `site/`，Vercel 项目为团队 `sherry-7c67` 下的 `sherry-world`。正式域名为 `https://sherry-world.vercel.app`。部署后的根路径转到 `/stage`，后台位于 `/admin`。`site/vercel.json` 明确指定 Next.js 预设。

## 数据在哪里

- Supabase 项目：`zfkpukkxsfykqxtxmgxr`。
- `public.sherry_site_content`：项目、技能、城市、照片地址、说明和排序，一个完整内容文档。
- `public.sherry_site_backups`：每次保存前的内容版本。备份包含资料和图片地址，不复制图片原文件。
- Storage 的私有桶 `sherry-media`：通过后台上传的图片原文件。前台展示时服务器生成临时读取链接；发布在前台的照片仍然可供访客查看。
- 代码内置的默认图片仍随网站部署，后来上传的图片存 Supabase。
- 删除项目或照片只移除展示引用，保留原图和旧版本以便恢复。清理原图前应确认所有内容和备份的引用情况。

## 登录与密钥

Supabase Authentication 创建的邮箱必须与 `SHERRY_ADMIN_EMAIL` 一致。使用该用户自己的密码登录 `/admin`。登录令牌保存在 HttpOnly Cookie，后台接口逐次验证身份，修改接口校验请求来源。

服务器环境变量：`SUPABASE_URL`、`SUPABASE_SECRET_KEY`、`SUPABASE_PUBLISHABLE_KEY`、`SHERRY_ADMIN_EMAIL`。Secret key 只能放服务器配置，不能进入 Git、前端代码或聊天记录。`.env.local` 和 `.vercel/` 已忽略。

## 初始化与迁移

1. 在 Supabase SQL Editor 执行 `site/supabase/migrations/202610200001_studio.sql`。
2. 创建后台 Auth 用户，填写环境变量。
3. 首次读取网站时，只在内容表为空的情况下初始化内容；不会覆盖已存在的云端内容。
4. 已存在本地数据时，应先另行备份 `site/data/studio/`，并将本地 media 图片迁移到同名 Storage 对象后再切换。网站不会自动删除本地文件。

本次迁移前没有 `site/data/studio/content.json`，初始化的是现有网站默认资料。

## 本机开发与检查

配置 Supabase 后，本机也默认使用同一个云端内容。需要隔离调试时设置 `SHERRY_CONTENT_DIR` 指向专用目录；Vercel 环境始终使用云端，禁止退回临时文件保存。

```powershell
cd site
npm run build
npm run start -- --port 3200
```

较大图片使用签名链接直接上传 Storage，最大15MB。数据库保存通过事务完成版本校验、旧版备份和更新；另一窗口已更新时会提示重新加载。

后台导出 JSON 可作额外备份；长期保管还需要备份 Storage 原图。
