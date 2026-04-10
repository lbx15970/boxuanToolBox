import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoTask, VideoMode, UploadedAsset } from '../types';
import * as api from '../api';

export function useVideoGenerator() {
  const [mode, setMode] = useState<VideoMode>('text2video');
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const assetCounter = useRef(0);
  const pollingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      Object.values(pollingTimers.current).forEach(clearTimeout);
    };
  }, []);

  // 添加素材
  const addAsset = useCallback((dataUrl: string, localPreviewUrl: string, fileName: string, role: 'firstFrame' | 'lastFrame') => {
    assetCounter.current++;
    const asset: UploadedAsset = {
      id: assetCounter.current,
      name: `素材${assetCounter.current}`,
      dataUrl,
      localPreviewUrl,
      fileName,
      role
    };
    setAssets(prev => [...prev.filter(a => a.role !== role), asset]);
    return asset;
  }, []);

  const removeAssetByRole = useCallback((role: 'firstFrame' | 'lastFrame') => {
    setAssets(prev => prev.filter(a => a.role !== role));
  }, []);

  const getAssetByRole = useCallback((role: 'firstFrame' | 'lastFrame') => {
    return assets.find(a => a.role === role);
  }, [assets]);

  // 提取视频 URL
  const extractVideoUrl = useCallback((data: any): string | null => {
    if (!data.content) return null;
    const videoContent = data.content.find ? data.content.find((c: any) => c.type === 'video_url') : null;
    if (videoContent?.video_url) {
      return videoContent.video_url.url || videoContent.video_url;
    }
    if (data.content.video_url) {
      return data.content.video_url.url || data.content.video_url;
    }
    if (typeof data.content === 'object') {
      for (const key of Object.keys(data.content)) {
        const val = data.content[key];
        if (typeof val === 'string' && (val.includes('http') || val.includes('.mp4'))) {
          return val;
        }
      }
    }
    return null;
  }, []);

  // 停止轮询
  const stopPolling = useCallback((taskId: string) => {
    if (pollingTimers.current[taskId]) {
      clearTimeout(pollingTimers.current[taskId]);
      delete pollingTimers.current[taskId];
    }
  }, []);

  // 开始轮询
  const startPolling = useCallback((taskId: string) => {
    if (pollingTimers.current[taskId]) return;

    const poll = async () => {
      try {
        const data = await api.getTaskStatus(taskId);

        setTasks(prev => {
          const idx = prev.findIndex(t => t.id === taskId);
          if (idx === -1) {
            stopPolling(taskId);
            return prev;
          }

          const task = { ...prev[idx] };
          task.status = data.status || task.status;

          if (data.progress !== undefined) {
            task.progress = Math.round(data.progress);
          } else if (data.usage?.completion_tokens && data.usage?.total_tokens) {
            task.progress = Math.round((data.usage.completion_tokens / data.usage.total_tokens) * 100);
          }

          if (data.status === 'succeeded') {
            const videoUrl = extractVideoUrl(data);
            if (videoUrl) task.videoUrl = videoUrl;
            stopPolling(taskId);
          } else if (data.status === 'failed') {
            task.error = data.error?.message || data.error || '生成失败';
            stopPolling(taskId);
          }

          const newTasks = [...prev];
          newTasks[idx] = task;
          return newTasks;
        });

        // 如果还在运行中，继续轮询
        const currentTask = tasks.find(t => t.id === taskId);
        // 注意：这里用 data.status 而不是 state 中的，因为 setState 是异步的
        if (data.status === 'pending' || data.status === 'processing') {
          pollingTimers.current[taskId] = setTimeout(poll, 5000);
        }
      } catch (err) {
        console.error(`[Polling Error] 任务 ${taskId}:`, err);
        pollingTimers.current[taskId] = setTimeout(poll, 5000);
      }
    };

    pollingTimers.current[taskId] = setTimeout(poll, 2000);
  }, [extractVideoUrl, stopPolling]);

  // 刷新单个任务状态
  const refreshTaskStatus = useCallback(async (taskId: string) => {
    try {
      const data = await api.getTaskStatus(taskId);

      setTasks(prev => {
        const idx = prev.findIndex(t => t.id === taskId);
        if (idx === -1) return prev;

        const task = { ...prev[idx] };
        task.status = data.status || task.status;

        if (data.progress !== undefined) {
          task.progress = Math.round(data.progress);
        } else if (data.usage?.completion_tokens && data.usage?.total_tokens) {
          task.progress = Math.round((data.usage.completion_tokens / data.usage.total_tokens) * 100);
        }

        if (data.status === 'succeeded') {
          const videoUrl = extractVideoUrl(data);
          if (videoUrl) task.videoUrl = videoUrl;
          stopPolling(taskId);
        } else if (data.status === 'failed') {
          task.error = data.error?.message || data.error || '未知错误';
          stopPolling(taskId);
        }

        const newTasks = [...prev];
        newTasks[idx] = task;
        return newTasks;
      });

      return data;
    } catch (err: any) {
      throw new Error('刷新失败: ' + err.message);
    }
  }, [extractVideoUrl, stopPolling]);

  // 生成视频
  const generate = useCallback(async (params: {
    prompt: string;
    ratio: string;
    resolution: string;
    duration: number;
    generateAudio: boolean;
    count: number;
    watermark: boolean;
    returnLastFrame: boolean;
    seed?: number;
    executionExpiresAfter?: number;
    webSearchEnabled: boolean;
  }) => {
    setIsGenerating(true);
    let finalPrompt = params.prompt || '生成一段精彩的视频';

    try {
      // 联网搜索增强
      if (params.webSearchEnabled && finalPrompt) {
        setIsSearching(true);
        finalPrompt = await api.webSearch(finalPrompt);
        setIsSearching(false);
      }

      const firstFrameAsset = getAssetByRole('firstFrame');
      const lastFrameAsset = getAssetByRole('lastFrame');

      const body: any = {
        prompt: finalPrompt,
        mode,
        resolution: params.resolution,
        ratio: params.ratio,
        duration: params.duration,
        generateAudio: params.generateAudio,
        count: params.count,
        watermark: params.watermark,
        returnLastFrame: params.returnLastFrame,
      };

      if (params.seed !== undefined && params.seed !== -1) body.seed = params.seed;
      if (params.executionExpiresAfter) body.executionExpiresAfter = params.executionExpiresAfter;
      if (firstFrameAsset) body.firstFrameDataUrl = firstFrameAsset.dataUrl;
      if (lastFrameAsset) body.lastFrameDataUrl = lastFrameAsset.dataUrl;

      const data = await api.generateVideo(body);

      if (data.success && data.results) {
        const newTasks: VideoTask[] = [];
        data.results.forEach((result: any) => {
          if (result.status === 200 && result.data?.id) {
            const task: VideoTask = {
              id: result.data.id,
              index: tasks.length + newTasks.length + 1,
              status: result.data.status || 'pending',
              prompt: finalPrompt,
              resolution: params.resolution,
              ratio: params.ratio,
              duration: params.duration,
              createdAt: new Date().toISOString(),
              videoUrl: null,
              error: null,
              progress: 0
            };
            newTasks.push(task);
          }
        });

        setTasks(prev => [...prev, ...newTasks]);
        newTasks.forEach(t => startPolling(t.id));

        return { success: true, count: newTasks.length, prompt: finalPrompt };
      } else {
        return { success: false, error: JSON.stringify(data) };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsGenerating(false);
      setIsSearching(false);
    }
  }, [mode, tasks.length, getAssetByRole, startPolling]);

  // 加载历史记录
  const loadHistory = useCallback(async () => {
    try {
      const response = await api.getTaskHistory();
      if (response.success && response.data?.length > 0) {
        const historyTasks: VideoTask[] = response.data.map((item: any, i: number) => ({
          id: item.id,
          index: response.data.length - i,
          status: item.status,
          prompt: item.prompt,
          resolution: item.resolution || '720p',
          ratio: item.ratio || '16:9',
          duration: item.duration || 5,
          createdAt: item.created_at,
          videoUrl: item.video_url,
          error: item.error,
          progress: 0
        }));

        setTasks(historyTasks);

        // 恢复未完成任务的轮询
        historyTasks.forEach(task => {
          if (task.status === 'pending' || task.status === 'processing') {
            startPolling(task.id);
          }
        });
      }
    } catch (err) {
      console.error('加载历史记录失败:', err);
    }
  }, [startPolling]);

  // 上传文件
  const handleFileUpload = useCallback(async (file: File, role: 'firstFrame' | 'lastFrame') => {
    const localPreviewUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const dataUrl = await api.uploadFile(file);
    if (!dataUrl) return null;

    return addAsset(dataUrl, localPreviewUrl, file.name, role);
  }, [addAsset]);

  const runningCount = tasks.filter(t => t.status === 'pending' || t.status === 'processing').length;

  return {
    mode,
    setMode,
    tasks,
    assets,
    isGenerating,
    isSearching,
    runningCount,
    addAsset,
    removeAssetByRole,
    getAssetByRole,
    generate,
    refreshTaskStatus,
    loadHistory,
    handleFileUpload,
  };
}
