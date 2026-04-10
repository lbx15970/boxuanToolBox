# 工具集成规范

> **🔴 重要：在创建新工具或修改数据库之前，必须先阅读本文档。**
> **🔴 IMPORTANT: You MUST read this document before creating a new tool or modifying the database.**

---

## 目录结构

```
boxuanToolBox/
├── homepage/                         # 统一前端（Vite + React）
│   └── src/
│       ├── pages/                    # 页面组件
│       ├── tools/                    # 工具前端组件（每个工具一个子目录）
│       │   └── video-generator/      # 示例：视频生成工具
│       │       ├── VideoGeneratorPage.tsx
│       │       ├── hooks/
│       │       ├── api.ts
│       │       ├── types.ts
│       │       └── styles.css
│       └── components/               # 通用组件
│
├── server/                           # 统一后端（Express）
│   ├── index.js                      # 入口，挂载各工具路由
│   ├── routes/
│   │   └── video-generator.js        # 示例：视频工具 API 路由
│   ├── lib/
│   │   └── supabase.js               # 共享 Supabase client
│   └── .env                          # 环境变量（不提交到 Git）
│
├── database/                         # 数据库 Schema
│   └── supabase_schema.sql           # 统一 Supabase Schema（所有工具）
│
└── tools/                            # 原始独立工具（参考/存档）
    └── TOOLS_INTEGRATION.md          # 本文件
```

---

## 🔴 数据隔离原则（最高优先级）

**每个工具的数据必须完全隔离，禁止跨工具共享表或 Bucket。**

### 命名规则

| 资源类型 | 命名格式 | 示例 |
|---------|---------|------|
| 数据库表 | `{前缀}_表名` | `vg_tasks`（video-generator） |
| Storage Bucket | `{前缀}_用途` | `vg_videos` |
| RLS Policy | `{前缀}_策略描述` | `vg_service_role_full_access` |
| 索引 | `idx_{前缀}_表名_字段` | `idx_vg_tasks_status` |

### 前缀分配

| 工具 | 前缀 | 说明 |
|------|------|------|
| video-generator | `vg_` | 视频生成工具 |
| *(新工具)* | `xx_` | *请选择 2~4 个字母的唯一前缀* |
| *(公共数据)* | `common_` | *仅在确实需要跨工具共享时使用* |

### 为什么？

- **添加工具**：只需添加新前缀的表，不影响已有数据
- **删除工具**：只需删除对应前缀的表和 Bucket，干净利落
- **避免冲突**：不同工具开发者可以并行工作，不会踩到对方的表

---

## 添加新工具步骤

### 1. 分配前缀
在上方「前缀分配」表中登记你的工具前缀（2~4 字母，全小写）。

### 2. 数据库
在 `database/supabase_schema.sql` 末尾添加你的 Section：
```sql
-- ================================================================
-- 📦 工具: your-tool-name (工具描述)
-- 前缀: yt_
-- 维护者: 你的名字
-- 创建日期: YYYY-MM-DD
-- ================================================================

CREATE TABLE IF NOT EXISTS public.yt_your_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... 你的字段 ...
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.yt_your_table ENABLE ROW LEVEL SECURITY;
```

### 3. 后端
在 `server/routes/` 下创建 `your-tool-name.js`，然后在 `server/index.js` 中挂载：
```js
const yourToolRoutes = require('./routes/your-tool-name');
app.use('/api/tools/your-tool-name', yourToolRoutes);
```

### 4. 前端
在 `homepage/src/tools/your-tool-name/` 下创建组件，然后在 `App.tsx` 中添加路由：
```tsx
const YourToolPage = lazy(() => import("./tools/your-tool-name/YourToolPage"));
// <Route path="/tools/your-tool-name" element={...} />
```

### 5. 主页卡片
在 `homepage/src/components/items.ts` 中添加卡片配置。

---

## 集成要求

1. **数据隔离**：必须使用工具前缀命名所有数据库资源（见上方规则）
2. **路由隔离**：后端 API 路径格式 `/api/tools/{tool-name}/*`
3. **样式隔离**：前端 CSS 使用工具专属前缀（如 `vg-`）避免冲突
4. **依赖隔离**：工具特有的 npm 包在 `package.json` 中清晰标注
5. **幂等 Schema**：SQL 使用 `IF NOT EXISTS` / `ON CONFLICT`，确保可重复执行

## 部署规范

1. 前端通过 Vite 统一构建部署
2. 后端 Express 统一部署，各工具路由自动挂载
3. 环境变量统一在 `server/.env` 管理
