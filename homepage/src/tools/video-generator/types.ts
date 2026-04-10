// 视频生成工具类型定义

export interface VideoTask {
  id: string;
  index: number;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  prompt: string;
  resolution: string;
  ratio: string;
  duration: number;
  createdAt: string;
  videoUrl: string | null;
  error: string | null;
  progress: number;
}

export interface GenerateParams {
  prompt: string;
  mode: VideoMode;
  resolution: string;
  ratio: string;
  duration: number;
  generateAudio: boolean;
  count: number;
  watermark: boolean;
  returnLastFrame: boolean;
  seed?: number;
  executionExpiresAfter?: number;
  firstFrameDataUrl?: string;
  lastFrameDataUrl?: string;
  referenceVideoTaskId?: string;
}

export type VideoMode = 'text2video' | 'image2video' | 'firstlast';

export interface UploadedAsset {
  id: number;
  name: string;
  dataUrl: string;
  localPreviewUrl: string;
  fileName: string;
  role: 'firstFrame' | 'lastFrame';
}

export interface ApiResult {
  status: number;
  data: {
    id?: string;
    status?: string;
    content?: any;
    error?: any;
    progress?: number;
    usage?: {
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
}
