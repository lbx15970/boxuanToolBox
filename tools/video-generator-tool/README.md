# video-generator-tool（已集成 / 存档）

> ⚠️ **此目录仅保留原始前端源码作为参考，不再作为独立工具运行。**

## 集成位置

该工具已完整集成到 boxuanToolBox 项目中：

| 原始文件 | 迁移到 | 说明 |
|---------|--------|------|
| `server.js` | `server/routes/video-generator.js` | 后端 API 路由 |
| `public/index.html` | `homepage/src/tools/video-generator/VideoGeneratorPage.tsx` | React 组件 |
| `public/js/app.js` | `homepage/src/tools/video-generator/hooks/useVideoGenerator.ts` | 核心逻辑 Hook |
| `public/css/style.css` | `homepage/src/tools/video-generator/styles.css` | 隔离样式 |
| `supabase_schema.sql` | `database/supabase_schema.sql` | 统一 Schema |
| `package.json` | `server/package.json` | 依赖已合并 |

## 保留内容

`original-frontend/` — 原始 HTML/JS/CSS 前端源码，仅供参考对照。

## 相关文档

- 工具集成规范：[../TOOLS_INTEGRATION.md](../TOOLS_INTEGRATION.md)
- 项目 README：[../../README.md](../../README.md)
