# boxuanToolBox — 前端

Vite + React + TailwindCSS 统一前端，包含主页卡片聚合和各工具页面。

## 启动

```bash
npm install
npm run dev    # http://localhost:3000
```

> 需要同时启动后端 `server/`（端口 3001），前端通过 Vite proxy 转发 API 请求。

## 路由

| 路径 | 页面 | 组件 |
|------|------|------|
| `/` | 主页（卡片聚合） | `pages/HomePage.tsx` |
| `/tools/video-generator` | 视频生成工具 | `tools/video-generator/VideoGeneratorPage.tsx` |

## 添加新工具

1. 在 `src/tools/{tool-name}/` 创建组件
2. 在 `App.tsx` 添加懒加载路由
3. 在 `src/components/items.ts` 添加卡片配置
4. 详见 [../tools/TOOLS_INTEGRATION.md](../tools/TOOLS_INTEGRATION.md)