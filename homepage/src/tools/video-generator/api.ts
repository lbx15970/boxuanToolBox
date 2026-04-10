// 视频生成工具 API 封装
// 所有请求发往 /api/tools/video-generator/

const API_BASE = '/api/tools/video-generator';

export async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) return data.dataUrl;
    throw new Error(data.error);
  } catch (err: any) {
    console.error('文件上传失败:', err.message);
    return null;
  }
}

export async function webSearch(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/web-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.success && data.enhancedPrompt) return data.enhancedPrompt;
    return prompt;
  } catch {
    return prompt;
  }
}

export async function generateVideo(params: any): Promise<any> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function getTaskStatus(taskId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/status/${taskId}`);
  return res.json();
}

export async function getTaskHistory(): Promise<any> {
  const res = await fetch(`${API_BASE}/tasks`);
  return res.json();
}

export function getDownloadUrl(videoUrl: string, taskId: string): string {
  return `${API_BASE}/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent('Seedance_' + taskId + '.mp4')}`;
}
