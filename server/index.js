require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== 中间件 =====
app.use(cors());
app.use(express.json({ limit: '100mb' }));

// ===== 挂载工具路由 =====
// 每个工具的 API 路由挂载到 /api/tools/{tool-name}/ 下
// 便于后续增删工具
const videoGeneratorRoutes = require('./routes/video-generator');
app.use('/api/tools/video-generator', videoGeneratorRoutes);

// ===== 健康检查 =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== 启动服务 =====
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 boxuanToolBox 后端服务已启动`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📺 视频生成工具 API: http://localhost:${PORT}/api/tools/video-generator/\n`);
  });
}

module.exports = app;
