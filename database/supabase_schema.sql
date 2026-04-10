-- ================================================================
-- ⚠️  boxuanToolBox 统一 Supabase 数据库 Schema
-- ================================================================
--
--  🔴 核心原则：按工具隔离数据
--  ────────────────────────────────────────────
--  1. 每个工具的表名必须以工具名为前缀，如 vg_tasks（video-generator）
--  2. 每个工具的 Storage Bucket 必须以工具名为前缀，如 vg_videos
--  3. 禁止跨工具共享表；如需公共数据，请单独建 common_ 前缀的表
--  4. 新增工具时，在本文件末尾添加该工具的 Section
--  5. 删除工具时，删除对应 Section 的所有表和 Bucket
--
--  📌 执行方式：复制本文件全部内容 → Supabase Dashboard → SQL Editor → 粘贴执行
--  📌 首次执行：直接执行即可
--  📌 后续执行：幂等设计，重复执行不会报错（使用 IF NOT EXISTS / ON CONFLICT）
--
-- ================================================================


-- ================================================================
-- 📦 工具: video-generator (视频生成工具)
-- 前缀: vg_
-- 维护者: boxuan
-- 创建日期: 2026-04-10
-- ================================================================

-- ----- 表: vg_tasks (视频生成任务) -----
-- 注意：ark-api 返回的 task id 不是标准 uuid，使用 varchar
CREATE TABLE IF NOT EXISTS public.vg_tasks (
  id varchar PRIMARY KEY,                                    -- 火山引擎返回的任务 ID
  prompt text,                                               -- 用户输入的提示词
  mode varchar DEFAULT 'text2video',                         -- 生成模式: text2video / image2video / firstlast
  ratio varchar DEFAULT '16:9',                              -- 视频比例
  resolution varchar DEFAULT '720p',                         -- 分辨率
  duration integer DEFAULT 5,                                -- 视频时长(秒)
  seed integer,                                              -- 随机种子
  status varchar NOT NULL DEFAULT 'pending',                 -- 任务状态: pending / processing / succeeded / failed
  video_url text,                                            -- 原始视频链接（第三方 CDN，有过期时间）
  video_storage_path text,                                   -- Supabase Storage 中的持久化路径
  video_storage_url text,                                    -- Supabase Storage 公开访问 URL
  thumbnail_url text,                                        -- 视频缩略图（尾帧）
  progress integer DEFAULT 0,                                -- 生成进度 0-100
  error text,                                                -- 错误信息
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  completed_at timestamptz
);

-- 索引: 按状态和创建时间查询
CREATE INDEX IF NOT EXISTS idx_vg_tasks_status ON public.vg_tasks (status);
CREATE INDEX IF NOT EXISTS idx_vg_tasks_created_at ON public.vg_tasks (created_at DESC);

-- RLS
ALTER TABLE public.vg_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: 后端使用 service_role key，拥有全部权限
-- 使用 DO block 实现幂等创建
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'vg_tasks' AND policyname = 'vg_service_role_full_access'
  ) THEN
    CREATE POLICY "vg_service_role_full_access" ON public.vg_tasks
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ----- Storage Bucket: vg_videos (视频文件存储) -----
-- Public Bucket，允许公开读取视频文件
INSERT INTO storage.buckets (id, name, public)
VALUES ('vg_videos', 'vg_videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: 允许 service_role 上传
-- 注意: Supabase 的 service_role key 默认有 storage 全权限，这里是额外的显式策略
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'vg_videos_public_read'
  ) THEN
    CREATE POLICY "vg_videos_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'vg_videos');
  END IF;
END $$;


-- ================================================================
-- 📦 工具: [新工具模板]
-- 前缀: xx_
-- 维护者: [你的名字]
-- 创建日期: YYYY-MM-DD
-- ================================================================
--
-- 添加新工具时，复制以下模板并修改：
--
-- CREATE TABLE IF NOT EXISTS public.xx_表名 (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   -- ... 你的字段 ...
--   created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_xx_表名_字段 ON public.xx_表名 (字段);
--
-- ALTER TABLE public.xx_表名 ENABLE ROW LEVEL SECURITY;
--
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies WHERE tablename = 'xx_表名' AND policyname = 'xx_service_role_full_access'
--   ) THEN
--     CREATE POLICY "xx_service_role_full_access" ON public.xx_表名
--       FOR ALL USING (true) WITH CHECK (true);
--   END IF;
-- END $$;
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('xx_bucket_name', 'xx_bucket_name', true)
-- ON CONFLICT (id) DO NOTHING;
