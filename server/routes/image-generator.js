const express = require('express');
const https = require('https');
const router = express.Router();

// ===== 配置 =====
const ARK_API_KEY = process.env.ARK_API_KEY || 'b421bf5d-e706-44cd-8ff5-55d596f6d1ae';
const IG_ENDPOINT_ID = process.env.IG_ENDPOINT_ID || 'ep-20260410162310-tx8tr';
const ARK_BASE = 'ark.cn-beijing.volces.com';

// ===== API 请求 =====
function arkImageGenerate(params) {
  return new Promise((resolve, reject) => {
    const payload = {
      model: IG_ENDPOINT_ID,
      prompt: params.prompt,
      n: params.n || 1,                          // 生成张数 1-9
      size: params.size || '2048x2048',           // 分辨率
      response_format: 'b64_json',               // 直接返回 base64 避免 URL 过期
    };

    // 联网搜索（与图片生成配合，增强 prompt 理解）
    if (params.webSearch) {
      payload.extra_body = {
        web_search: { enable: true }
      };
    }

    // 不添加水印
    if (params.noWatermark) {
      payload.watermark = false;
    }

    // 图片比例（通过调整 size 实现）
    // size 统一在前端根据分辨率 + 比例计算好后传入

    const body = JSON.stringify(payload);
    const options = {
      hostname: ARK_BASE,
      port: 443,
      path: '/api/v3/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ARK_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    console.log(`[IG] 生成图像 n=${payload.n} size=${payload.size} webSearch=${!!params.webSearch}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[IG] HTTP ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            const errMsg = parsed?.error?.message || JSON.stringify(parsed);
            return reject(new Error(errMsg));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`JSON 解析失败: ${data.slice(0, 300)}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

// ===== POST /api/tools/image-generator/generate =====
router.post('/generate', async (req, res) => {
  const {
    prompt,
    referenceImages = [],   // 参考图（单图/多图生图）
    n = 1,                  // 生成张数
    resolution = '2k',      // '2k' | '4k'
    aspectRatio = '1:1',    // 比例
    webSearch = false,      // 联网搜索
    noWatermark = true,     // 不加水印
  } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: '提示词不能为空' });
  }

  const count = Math.min(Math.max(parseInt(n) || 1, 1), 9);

  // 根据分辨率和比例计算 size
  const baseRes = resolution === '4k' ? 4096 : 2048;
  const ratioMap = {
    'auto': null,         // 不指定，由模型自动选择
    '1:1':  [1, 1],
    '16:9': [16, 9],
    '9:16': [9, 16],
    '4:3':  [4, 3],
    '3:4':  [3, 4],
    '3:2':  [3, 2],
    '2:3':  [2, 3],
    '21:9': [21, 9],
  };

  let size = `${baseRes}x${baseRes}`;
  const ratio = ratioMap[aspectRatio];
  if (ratio) {
    const [rw, rh] = ratio;
    // 保持总像素约等于 baseRes^2，调整宽高比
    const totalPx = baseRes * baseRes;
    const h = Math.round(Math.sqrt(totalPx * rh / rw));
    const w = Math.round(h * rw / rh);
    // 确保最小 512
    size = `${Math.max(w, 512)}x${Math.max(h, 512)}`;
  }

  try {
    const result = await arkImageGenerate({
      prompt: prompt.trim(),
      n: count,
      size,
      webSearch,
      noWatermark,
    });

    const images = (result?.data || []).map((item, idx) => ({
      index: idx,
      dataUrl: item.b64_json
        ? `data:image/png;base64,${item.b64_json}`
        : item.url || null,
    })).filter(i => i.dataUrl);

    if (images.length === 0) {
      return res.status(500).json({ error: '未返回有效图像数据', raw: result });
    }

    return res.json({ success: true, images });
  } catch (err) {
    console.error('[IG] 生成失败:', err.message);
    return res.status(500).json({ error: err.message || '图像生成失败' });
  }
});

module.exports = router;
