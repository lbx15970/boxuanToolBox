# boxuanToolBox

个人工具箱项目 — 集合多个独立工具的统一平台。

> **🔴 开发前必读：[tools/TOOLS_INTEGRATION.md](tools/TOOLS_INTEGRATION.md)**
> 
> 特别注意「数据隔离原则」：每个工具的数据库表和 Storage Bucket 必须使用工具专属前缀命名，禁止跨工具共享表。

---

## 快速启动

```bash
# 1. 安装后端依赖
cd server && npm install

# 2. 配置环境变量
cp server/.env.example server/.env  # 编辑 .env 填入你的 Supabase 凭据

# 3. 初始化数据库
# 复制 database/supabase_schema.sql 到 Supabase Dashboard → SQL Editor 执行

# 4. 启动后端（终端 1）
cd server && node index.js

# 5. 启动前端（终端 2）
cd homepage && npm run dev
```

访问 http://localhost:3000

---

## 项目架构

```
boxuanToolBox/
├── homepage/          # Vite + React 前端（端口 3000）
├── server/            # Express 后端（端口 3001）
├── database/          # Supabase 数据库 Schema
└── tools/             # 工具集成规范 & 原始工具存档
```

## 已集成工具

| 工具 | 路由 | DB 前缀 | 说明 |
|------|------|---------|------|
| 视频生成工具 | `/tools/video-generator` | `vg_` | Seedance 2.0 AI 视频生成 |

## Supabase 对接

### 首次配置

1. 在 [Supabase](https://supabase.com) 创建项目
2. 获取 Project URL 和 Service Role Key（Dashboard → Settings → API）
3. 填入 `server/.env`
4. 在 SQL Editor 中执行 `database/supabase_schema.sql`

### 数据库设计原则

⚠️ **按工具隔离数据** — 这是本项目的核心架构原则：

- 每个工具使用独立的表前缀（如 `vg_`）
- 每个工具使用独立的 Storage Bucket（如 `vg_videos`）
- 添加新工具时在 `supabase_schema.sql` 末尾追加 Section
- 删除工具时只需删除对应前缀的所有资源
- 详见 [TOOLS_INTEGRATION.md](tools/TOOLS_INTEGRATION.md)

---

## 环境变量

| 变量 | 说明 | 位置 |
|------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | `server/.env` |
| `SUPABASE_KEY` | Service Role Key | `server/.env` |
| `PORT` | 后端端口（默认 3001） | `server/.env` |

火山引擎 API 凭据硬编码在 `server/routes/video-generator.js` 第 13-14 行（便于查找和替换）。
