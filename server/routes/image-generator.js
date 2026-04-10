const express = require('express');
const https = require('https');
const router = express.Router();

// ===== 配置 =====
const ARK_API_KEY = process.env.ARK_API_KEY || 'b421bf5d-e706-44cd-8ff5-55d596f6d1ae';
const IG_ENDPOINT_ID = process.env.IG_ENDPOINT_ID || 'ep-20260410162310-tx8tr';
const ARK_BASE = 'ark.cn-beijing.volces.com';

// ===== 请求工具函数 =====
function arkImageGenerate(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: IG_ENDPOINT_ID,
      prompt,
      size: '1024x1024',
      response_format: 'b64_json', // 直接返回 base64，避免 URL 过期问题
    });

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

    console.log(`[IG] 开始生成图像, prompt: "${prompt.slice(0, 80)}..."`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[IG] HTTP ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            const errMsg = parsed?.error?.message || JSON.stringify(parsed);
            console.error('[IG] API Error:', errMsg);
            return reject(new Error(errMsg));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`JSON 解析失败: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[IG] 请求失败:', err);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

// ===== POST /api/tools/image-generator/generate =====
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: '提示词不能为空' });
  }

  try {
    const result = await arkImageGenerate(prompt.trim());
    // result.data[0] 包含 b64_json 或 url
    const imageData = result?.data?.[0];
    if (!imageData) {
      return res.status(500).json({ error: '未获取到图像数据' });
    }

    if (imageData.b64_json) {
      return res.json({
        success: true,
        imageDataUrl: `data:image/png;base64,${imageData.b64_json}`,
      });
    } else if (imageData.url) {
      return res.json({ success: true, imageUrl: imageData.url });
    } else {
      return res.status(500).json({ error: '返回数据格式异常', raw: imageData });
    }
  } catch (err) {
    console.error('[IG] 生成失败:', err.message);
    return res.status(500).json({ error: err.message || '图像生成失败' });
  }
});

module.exports = router;
