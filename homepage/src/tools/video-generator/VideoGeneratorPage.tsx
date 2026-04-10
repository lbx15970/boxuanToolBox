import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoGenerator } from './hooks/useVideoGenerator';
import { VideoMode, VideoTask } from './types';
import { getDownloadUrl } from './api';
import './styles.css';

// ===== Toast 管理 =====
interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  removing?: boolean;
}

let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="vg-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`vg-toast vg-${t.type}${t.removing ? ' vg-removing' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ===== 上传区域组件 =====
function UploadZone({
  label,
  sublabel,
  previewUrl,
  onFileSelect,
  onRemove,
}: {
  label: string;
  sublabel: string;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);

  return (
    <div
      className={`vg-upload-zone${previewUrl ? ' vg-has-file' : ''}${dragover ? ' vg-dragover' : ''}`}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.vg-upload-remove')) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragover(false);
        if (e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]);
      }}
    >
      {previewUrl ? (
        <>
          <img src={previewUrl} className="vg-upload-preview" alt="preview" />
          <button className="vg-upload-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ display: 'flex' }}>✕</button>
        </>
      ) : (
        <div className="vg-upload-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>{label}</span>
          <small>{sublabel}</small>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }}
      />
    </div>
  );
}

// ===== 结果卡片组件 =====
function ResultCard({
  task,
  onRefresh,
}: {
  task: VideoTask;
  onRefresh: (id: string) => void;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const statusMap: Record<string, { text: string; cls: string; dot: string }> = {
    pending: { text: '排队中', cls: 'vg-pending', dot: 'vg-pulse' },
    processing: { text: `生成中${task.progress ? ` ${task.progress}%` : ''}`, cls: 'vg-processing', dot: 'vg-pulse' },
    running: { text: `生成中${task.progress ? ` ${task.progress}%` : ''}`, cls: 'vg-processing', dot: 'vg-pulse' },
    succeeded: { text: '已完成', cls: 'vg-succeeded', dot: '' },
    failed: { text: '失败', cls: 'vg-failed', dot: '' },
  };

  const s = statusMap[task.status] || statusMap.pending;
  const isProcessing = task.status === 'processing' || task.status === 'running';
  const hasProgress = isProcessing && task.progress > 0;
  const estimatedTimeSeconds = (task.duration || 5) * 15;
  const estimatedTimeText = estimatedTimeSeconds > 60
    ? `约 ${Math.floor(estimatedTimeSeconds / 60)}分${estimatedTimeSeconds % 60}秒`
    : `约 ${estimatedTimeSeconds} 秒`;

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await onRefresh(task.id); } finally { setRefreshing(false); }
  };

  return (
    <div className="vg-result-card">
      <div className="vg-result-card-header">
        <span className="vg-result-card-title">任务 #{task.index}</span>
        <span className={`vg-result-status ${s.cls}`}>
          <span className={`vg-status-dot ${s.dot}`} />
          {s.text}
        </span>
      </div>
      <div className="vg-result-card-info">
        <div className="vg-prompt-text" title={task.prompt}>提示词: {task.prompt || '默认提示词'}</div>
        <div>参数: {task.resolution || '720p'} | {task.ratio || '16:9'} | {task.duration || 5} 秒</div>
      </div>
      <div className="vg-result-card-body">
        {(task.status === 'pending' || task.status === 'processing' || task.status === 'running') && (
          <div className="vg-result-loading">
            <div className="vg-loading-spinner" />
            <span>{isProcessing ? '视频生成中' : '排队等待中'}{hasProgress ? ` · ${task.progress}%` : '...'}</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--vg-text-secondary)', marginTop: '6px' }}>
              预计生成时间与视频时长有关：{estimatedTimeText}
            </div>
            <div className="vg-progress-container">
              <div className={`vg-progress-bar${hasProgress ? '' : ' vg-indeterminate'}`} style={hasProgress ? { width: `${task.progress}%` } : {}} />
            </div>
            <button className={`vg-refresh-btn${refreshing ? ' vg-spinning' : ''}`} onClick={handleRefresh} disabled={refreshing}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              刷新进度
            </button>
          </div>
        )}
        {task.status === 'succeeded' && task.videoUrl && (
          <video controls autoPlay muted loop>
            <source src={task.videoUrl} type="video/mp4" />
          </video>
        )}
        {task.status === 'failed' && (
          <div className="vg-result-error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p style={{ marginTop: '8px' }}>{task.error || '生成失败，请重试'}</p>
          </div>
        )}
      </div>
      {task.status === 'succeeded' && task.videoUrl && (
        <div className="vg-result-card-footer">
          <a href={getDownloadUrl(task.videoUrl, task.id)} className="vg-result-action-btn" target="_blank" rel="noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载
          </a>
          <button className="vg-result-action-btn" onClick={() => window.open(task.videoUrl!, '_blank')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            新窗口
          </button>
        </div>
      )}
    </div>
  );
}

// ===== 主页面组件 =====
export default function VideoGeneratorPage() {
  const navigate = useNavigate();
  const {
    mode, setMode, tasks, assets, isGenerating, isSearching,
    runningCount, removeAssetByRole, getAssetByRole,
    generate, refreshTaskStatus, loadHistory, handleFileUpload,
  } = useVideoGenerator();

  // 表单状态
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [duration, setDuration] = useState(5);
  const [count, setCount] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [returnLastFrame, setReturnLastFrame] = useState(false);
  const [seed, setSeed] = useState('-1');
  const [timeout, setTimeout_] = useState('172800');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [mobileTab, setMobileTab] = useState<'settings' | 'results'>('settings');

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3000);
  }, []);

  // 上传预览 URL
  const [firstFramePreview, setFirstFramePreview] = useState<string | null>(null);
  const [lastFramePreview, setLastFramePreview] = useState<string | null>(null);

  // 加载历史
  useEffect(() => { loadHistory(); }, []);

  // 费用预估
  const tokensPerSec = resolution === '720p' ? 1800 : 1200;
  const totalTokens = duration * tokensPerSec;
  const singleCost = (totalTokens / 1000) * 0.046;
  const totalCost = singleCost * count;

  // 文件上传处理
  const handleFirstFrame = async (file: File) => {
    if (!file.type.startsWith('image/')) { showToast('请上传图片文件', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setFirstFramePreview(reader.result as string);
    reader.readAsDataURL(file);
    const asset = await handleFileUpload(file, 'firstFrame');
    if (asset) showToast(`已上传为 ${asset.name}`, 'success');
  };

  const handleLastFrame = async (file: File) => {
    if (!file.type.startsWith('image/')) { showToast('请上传图片文件', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setLastFramePreview(reader.result as string);
    reader.readAsDataURL(file);
    const asset = await handleFileUpload(file, 'lastFrame');
    if (asset) showToast(`已上传为 ${asset.name}`, 'success');
  };

  // 生成
  const handleGenerate = async () => {
    if (!prompt && mode === 'text2video') { showToast('请输入视频描述', 'error'); return; }
    if (mode === 'image2video' && !getAssetByRole('firstFrame')) { showToast('请上传首帧参考图片', 'error'); return; }
    if (mode === 'firstlast' && !getAssetByRole('firstFrame')) { showToast('请上传首帧图片', 'error'); return; }

    const seedVal = seed && seed.trim() !== '' && parseInt(seed) !== -1 ? parseInt(seed) : undefined;
    const timeoutVal = timeout && timeout.trim() !== '' ? parseInt(timeout) : undefined;

    const result = await generate({
      prompt: prompt || '生成一段精彩的视频',
      ratio, resolution, duration,
      generateAudio: audioEnabled,
      count, watermark, returnLastFrame,
      seed: seedVal,
      executionExpiresAfter: timeoutVal,
      webSearchEnabled,
    });

    if (result.success) {
      showToast(`已提交 ${result.count} 个生成任务`, 'success');
      // 移动端自动切到结果
      if (window.matchMedia('(max-width: 768px)').matches) {
        window.setTimeout(() => setMobileTab('results'), 500);
      }
    } else {
      showToast('任务创建失败: ' + result.error, 'error');
    }
  };

  const handleRefresh = async (taskId: string) => {
    try {
      await refreshTaskStatus(taskId);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // 按钮文字
  let btnIcon: React.ReactNode;
  let btnText: string;
  if (isSearching) {
    btnIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    btnText = '联网搜索中...';
  } else if (isGenerating) {
    btnIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
    btnText = '生成中...';
  } else {
    btnIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
    btnText = '开始生成';
  }

  return (
    <div className="vg-app">
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* 顶部导航 */}
      <header className="vg-header">
        <div className="vg-header-left" style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={{ marginRight: '16px', background: 'none', border: 'none', color: 'var(--vg-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            返回主页
          </button>
          <a className="vg-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span>Seedance 2.0</span>
          </a>
        </div>
        <div className="vg-header-right">
          <div className="vg-task-counter">
            <span className="vg-counter-badge">{runningCount}</span>
            <span>{tasks.length} 任务</span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="vg-main">
        {/* 左侧面板 */}
        <aside className={`vg-sidebar${mobileTab !== 'settings' ? ' vg-hidden' : ''}`}>
          {/* 模式选择 */}
          <section className="vg-panel">
            <h2 className="vg-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
              生成模式
            </h2>
            <div className="vg-mode-selector">
              {([
                { mode: 'text2video' as VideoMode, icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, label: '文生视频' },
                { mode: 'image2video' as VideoMode, icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>, label: '参考生成' },
                { mode: 'firstlast' as VideoMode, icon: <><rect x="2" y="3" width="8" height="14" rx="1"/><rect x="14" y="3" width="8" height="14" rx="1"/><path d="M10 10h4"/><path d="M12 8v4"/></>, label: '首尾帧' },
              ]).map(item => (
                <button
                  key={item.mode}
                  className={`vg-mode-btn${mode === item.mode ? ' vg-active' : ''}`}
                  onClick={() => setMode(item.mode)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 提示词 */}
          <section className="vg-panel">
            <h2 className="vg-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              提示词
            </h2>
            <div className="vg-prompt-wrapper">
              <textarea
                className="vg-prompt-input"
                rows={5}
                placeholder={"描述你想要的视频内容...\n\n💡 建议格式：[画面描述] + [声音/对白描述]\n例：女孩转身微笑，温暖的阳光"}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className={`vg-web-search-toggle${webSearchEnabled ? ' vg-checked' : ''}`}>
              <label className="vg-web-search-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                联网搜索
                <span className="vg-param-hint" title="开启后，生成视频前会先联网搜索提示词相关信息，用搜索结果优化视频描述。">ⓘ</span>
              </label>
              <label className="vg-toggle">
                <input type="checkbox" checked={webSearchEnabled} onChange={(e) => setWebSearchEnabled(e.target.checked)} />
                <span className="vg-toggle-slider" />
              </label>
            </div>
            {assets.length > 0 && (
              <div className="vg-uploaded-assets">
                <div className="vg-assets-label">已上传素材：</div>
                <div className="vg-assets-tags">
                  {assets.map(a => (
                    <span key={a.id} className="vg-asset-tag">
                      <img src={a.localPreviewUrl} className="vg-asset-tag-thumb" alt={a.name} />
                      {a.name}
                      <span style={{ color: 'var(--vg-text-muted)', fontSize: '0.65rem' }}>({a.fileName})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 上传区域 */}
          {mode !== 'text2video' && (
            <section className="vg-panel">
              <h2 className="vg-panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {mode === 'firstlast' ? '首尾帧图片' : '参考图片（首帧）'}
              </h2>
              <UploadZone
                label="点击或拖拽上传首帧图片"
                sublabel="支持 JPG / PNG / WebP"
                previewUrl={firstFramePreview}
                onFileSelect={handleFirstFrame}
                onRemove={() => { removeAssetByRole('firstFrame'); setFirstFramePreview(null); }}
              />
              {mode === 'firstlast' && (
                <UploadZone
                  label="点击或拖拽上传尾帧图片"
                  sublabel="支持 JPG / PNG / WebP"
                  previewUrl={lastFramePreview}
                  onFileSelect={handleLastFrame}
                  onRemove={() => { removeAssetByRole('lastFrame'); setLastFramePreview(null); }}
                />
              )}
            </section>
          )}

          {/* 参数设置 */}
          <section className="vg-panel">
            <h2 className="vg-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              参数设置
            </h2>
            <div className="vg-param-grid">
              <div className="vg-param-item">
                <label>视频比例</label>
                <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
                  <option value="16:9">16:9（横屏）</option>
                  <option value="9:16">9:16（竖屏）</option>
                  <option value="1:1">1:1（方形）</option>
                  <option value="4:3">4:3</option>
                  <option value="3:4">3:4</option>
                  <option value="21:9">21:9（超宽）</option>
                  <option value="adaptive">自适应</option>
                </select>
              </div>
              <div className="vg-param-item">
                <label>分辨率</label>
                <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
              <div className="vg-param-item vg-full-width">
                <label>
                  视频时长
                  <span className="vg-param-value">{duration} 秒</span>
                </label>
                <input type="range" className="vg-slider" min="4" max="15" value={duration} step="1" onChange={(e) => setDuration(parseInt(e.target.value))} />
                <div className="vg-slider-labels"><span>4秒</span><span>15秒</span></div>
              </div>
              <div className="vg-param-item">
                <label>生成数量</label>
                <div className="vg-number-input">
                  <button className="vg-num-btn" onClick={() => setCount(c => Math.max(1, c - 1))}>−</button>
                  <input type="number" value={count} min={1} max={8} onChange={(e) => setCount(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))} />
                  <button className="vg-num-btn" onClick={() => setCount(c => Math.min(8, c + 1))}>+</button>
                </div>
              </div>
              <div className="vg-param-item">
                <label>音频输出</label>
                <label className="vg-toggle">
                  <input type="checkbox" checked={audioEnabled} onChange={(e) => setAudioEnabled(e.target.checked)} />
                  <span className="vg-toggle-slider" />
                </label>
              </div>
            </div>
          </section>

          {/* 高级参数 */}
          <section className="vg-panel">
            <h2 className={`vg-panel-title vg-clickable${advancedOpen ? ' vg-open' : ''}`} onClick={() => setAdvancedOpen(!advancedOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              高级参数
              <svg className="vg-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </h2>
            {advancedOpen && (
              <div className="vg-param-grid">
                <div className="vg-param-item vg-full-width">
                  <label>种子值 <span className="vg-param-hint" title="固定种子值可以复现相同的生成结果。-1 为随机。">ⓘ</span></label>
                  <input type="number" className="vg-text-input" placeholder="-1 为随机" value={seed} onChange={(e) => setSeed(e.target.value)} />
                </div>
                <div className="vg-param-item">
                  <label>生成超时 <span className="vg-param-hint" title="任务的最大等待时间（秒），默认 172800 秒（48小时）。">ⓘ</span></label>
                  <input type="number" className="vg-text-input" placeholder="172800" value={timeout} onChange={(e) => setTimeout_(e.target.value)} />
                </div>
                <div className="vg-param-item">
                  <label>水印</label>
                  <label className="vg-toggle">
                    <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
                    <span className="vg-toggle-slider" />
                  </label>
                </div>
                <div className="vg-param-item">
                  <label>返回尾帧 <span className="vg-param-hint" title="开启后将返回视频的最后一帧图片。">ⓘ</span></label>
                  <label className="vg-toggle">
                    <input type="checkbox" checked={returnLastFrame} onChange={(e) => setReturnLastFrame(e.target.checked)} />
                    <span className="vg-toggle-slider" />
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* 费用预估 */}
          <section className="vg-panel vg-cost-panel">
            <h2 className="vg-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              费用预估 <span style={{ fontSize: '0.75rem', color: 'var(--vg-text-muted)', fontWeight: 'normal' }}>（测试阶段暂时免费）</span>
            </h2>
            <div className="vg-cost-info">
              <div className="vg-cost-row">
                <span>单条预估</span>
                <span className="vg-cost-value">≈ ¥{singleCost.toFixed(3)}</span>
              </div>
              <div className="vg-cost-row vg-total">
                <span>总费用预估</span>
                <span className="vg-cost-value">≈ ¥{totalCost.toFixed(3)}</span>
              </div>
              <div className="vg-cost-formula">
                <small>
                  💡 计费规则：0.046 元/千tokens{' '}
                  <span className="vg-cost-detail-wrapper">
                    <a className="vg-cost-detail-link">详情</a>
                    <div className="vg-cost-tooltip">视频Token计算公式=（宽*高*帧率*时长）/1024*条数</div>
                  </span>
                  <br />以实际生成消耗为准，此处仅为估算
                </small>
              </div>
            </div>
          </section>

          {/* 生成按钮 */}
          <button
            className={`vg-generate-btn${isGenerating ? ' vg-loading' : ''}`}
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            {btnIcon}
            {btnText}
          </button>
        </aside>

        {/* 右侧结果区 */}
        <div className={`vg-content${mobileTab !== 'results' ? ' vg-hidden' : ''}`}>
          <div className="vg-content-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            <span>生成结果</span>
          </div>
          <div className="vg-results-area">
            {tasks.length === 0 ? (
              <div className="vg-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <h3>暂无生成结果</h3>
                <p>配置参数后点击「开始生成」</p>
              </div>
            ) : (
              <div className="vg-results-grid">
                {[...tasks].reverse().map(task => (
                  <ResultCard key={task.id} task={task} onRefresh={handleRefresh} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 移动端底部 Tab */}
      <nav className="vg-mobile-tab-bar">
        <button className={`vg-mobile-tab${mobileTab === 'settings' ? ' vg-active' : ''}`} onClick={() => setMobileTab('settings')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>生成</span>
        </button>
        <button className={`vg-mobile-tab${mobileTab === 'results' ? ' vg-active' : ''}`} onClick={() => setMobileTab('results')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          <span>结果</span>
          {runningCount > 0 && <span className="vg-mobile-tab-badge">{runningCount}</span>}
        </button>
      </nav>
    </div>
  );
}
