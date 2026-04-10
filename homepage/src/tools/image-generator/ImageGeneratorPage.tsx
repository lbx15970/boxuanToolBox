import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

type GenerateStatus = 'idle' | 'generating' | 'done' | 'error';
type AspectRatio = 'auto' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '21:9';
type Resolution = '2k' | '4k';

interface AdvancedParams {
  n: number;                  // 生成张数 1-9
  resolution: Resolution;     // 2k | 4k
  aspectRatio: AspectRatio;   // 比例
  webSearch: boolean;         // 联网搜索
  noWatermark: boolean;       // 不加水印
  referenceImages: string[];  // 参考图 base64
}

// ===== Eye Component =====
function Eye({ isRightEye = false, isGenerating = false }: { isRightEye?: boolean; isGenerating?: boolean }) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const defaultPos = isRightEye
    ? { x: 119.032 - 102, y: 117.787 - 102 }
    : { x: 74.8272 - 102, y: 78.3184 - 102 };
  const [pos, setPos] = useState(defaultPos);

  useEffect(() => {
    if (isGenerating) return;
    const handle = (cx: number, cy: number) => {
      if (!eyeRef.current) return;
      const r = eyeRef.current.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) { setPos(defaultPos); return; }
      const max = r.width / 2 - r.width * 0.185 - 5;
      const nx = dx / dist; const ny = dy / dist;
      let mx = Math.min(dist, max) * nx + defaultPos.x;
      let my = Math.min(dist, max) * ny + defaultPos.y;
      const td = Math.sqrt((mx - defaultPos.x) ** 2 + (my - defaultPos.y) ** 2);
      if (td > max) { const s = max / td; mx = defaultPos.x + (mx - defaultPos.x) * s; my = defaultPos.y + (my - defaultPos.y) * s; }
      setPos({ x: mx, y: my });
    };
    const onMouse = (e: MouseEvent) => handle(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) handle(e.touches[0].clientX, e.touches[0].clientY); };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => { window.removeEventListener('mousemove', onMouse); window.removeEventListener('touchmove', onTouch); };
  }, [isGenerating, defaultPos.x, defaultPos.y]);

  if (isGenerating) {
    return (
      <div ref={eyeRef} className="ig-eye ig-eye-dizzy">
        <div className="ig-dizzy-ring ig-ring-1" />
        <div className="ig-dizzy-ring ig-ring-2" />
        <div className="ig-dizzy-ring ig-ring-3" />
      </div>
    );
  }
  return (
    <div ref={eyeRef} className="ig-eye">
      <div className="ig-pupil" style={{ transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.08s ease-out' }} />
    </div>
  );
}

// ===== Advanced Panel =====
function AdvancedPanel({
  params,
  onChange,
  onClose,
}: {
  params: AdvancedParams;
  onChange: (p: Partial<AdvancedParams>) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleRefImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    Promise.all(files.map(f => new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(f);
    }))).then(results => onChange({ referenceImages: [...params.referenceImages, ...results] }));
    e.target.value = '';
  };

  const ratios: AspectRatio[] = ['auto', '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9'];

  return (
    <div className="ig-panel-backdrop" onClick={onClose}>
      <div className="ig-panel" onClick={e => e.stopPropagation()}>
        <div className="ig-panel-header">
          <span>高级参数</span>
          <button className="ig-panel-close" onClick={onClose}>✕</button>
        </div>

        {/* 生成张数 */}
        <div className="ig-param-section">
          <label className="ig-param-label">生成张数</label>
          <div className="ig-n-picker">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} className={`ig-n-btn${params.n === n ? ' active' : ''}`} onClick={() => onChange({ n })}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 分辨率 */}
        <div className="ig-param-section">
          <label className="ig-param-label">分辨率</label>
          <div className="ig-toggle-group">
            {(['2k', '4k'] as Resolution[]).map(r => (
              <button key={r} className={`ig-toggle-btn${params.resolution === r ? ' active' : ''}`} onClick={() => onChange({ resolution: r })}>
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 图片比例 */}
        <div className="ig-param-section">
          <label className="ig-param-label">图片比例</label>
          <div className="ig-ratio-grid">
            {ratios.map(r => (
              <button key={r} className={`ig-ratio-btn${params.aspectRatio === r ? ' active' : ''}`} onClick={() => onChange({ aspectRatio: r })}>
                {r === 'auto' ? '自动' : r}
              </button>
            ))}
          </div>
        </div>

        {/* 联网搜索（暂不支持） */}
        <div className="ig-param-section">
          <label className="ig-param-label">
            联网搜索
            <span className="ig-param-desc">图像生成接口暂不支持此功能</span>
          </label>
          <button
            className="ig-switch"
            disabled
            style={{ opacity: 0.35, cursor: 'not-allowed' }}
          >
            <span className="ig-switch-thumb" />
          </button>
        </div>

        {/* 参考图 */}
        <div className="ig-param-section">
          <label className="ig-param-label">
            参考图（可选）
            <span className="ig-param-desc">上传 1 张或多张参考图进行图生图</span>
          </label>
          <div className="ig-ref-images">
            {params.referenceImages.map((img, i) => (
              <div key={i} className="ig-ref-thumb-wrap">
                <img src={img} className="ig-ref-thumb" alt="" />
                <button className="ig-ref-remove" onClick={() => onChange({ referenceImages: params.referenceImages.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
            {params.referenceImages.length < 5 && (
              <button className="ig-ref-add" onClick={() => fileRef.current?.click()}>+</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleRefImages} />
        </div>
      </div>
    </div>
  );
}

// ===== Image Result Gallery (swipe + X/Y counter) =====
function ImageGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(images.length - 1, idx)));
  }, [images.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragOffset(0);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    setDragOffset(e.touches[0].clientX - touchStartX.current);
  };
  const onTouchEnd = () => {
    if (Math.abs(dragOffset) > 40) {
      goTo(current + (dragOffset < 0 ? 1 : -1));
    }
    setDragOffset(0);
    setIsDragging(false);
    touchStartX.current = null;
  };

  return (
    <div
      className="ig-gallery"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={images[current]}
        alt={`生成图 ${current + 1}`}
        className="ig-result-image"
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease',
          '-webkit-touch-callout': 'default',
        } as any}
      />
      {/* X/Y 右下角计数器 */}
      {images.length > 1 && (
        <div className="ig-gallery-counter">{current + 1}/{images.length}</div>
      )}
    </div>
  );
}

// ===== API =====
async function callGenerateAPI(prompt: string, params: AdvancedParams): Promise<string[]> {
  let res: Response;
  try {
    res = await fetch('/api/tools/image-generator/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        n: params.n,
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
        noWatermark: params.noWatermark,
        referenceImages: params.referenceImages,
      }),
    });
  } catch {
    throw new Error('网络请求失败，请检查网络连接');
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`API 未就绪（HTTP ${res.status}）— 请确认 Vercel 后端已部署`);
  }
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || '生成失败');
  return (data.images as { dataUrl: string }[]).map(i => i.dataUrl);
}

// ===== Main =====
const DEFAULT_PARAMS: AdvancedParams = {
  n: 1,
  resolution: '2k',
  aspectRatio: '1:1',
  webSearch: false,
  noWatermark: true,
  referenceImages: [],
};

export default function ImageGeneratorPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [images, setImages] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [advParams, setAdvParams] = useState<AdvancedParams>(DEFAULT_PARAMS);

  const isGenerating = status === 'generating';
  const isDone = status === 'done';

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setStatus('generating');
    setImages([]);
    setErrorMsg('');
    try {
      const result = await callGenerateAPI(prompt, advParams);
      setImages(result);
      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || '生成失败，请重试');
      setStatus('error');
    }
  }, [prompt, isGenerating, advParams]);

  const handleRegen = () => { setStatus('idle'); setImages([]); };

  const titleText = isGenerating ? '正在画...' : isDone ? '画好了！' : '请帮我画...';

  // 参数变化摘要（给按钮显示小徽章）
  const paramChanged = advParams.n !== 1 || advParams.resolution !== '2k' || advParams.aspectRatio !== '1:1' || advParams.webSearch || advParams.referenceImages.length > 0;

  return (
    <div className="ig-app">
      <button className="ig-back-btn" onClick={() => navigate('/')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        返回
      </button>

      {showPanel && (
        <AdvancedPanel
          params={advParams}
          onChange={p => setAdvParams(prev => ({ ...prev, ...p }))}
          onClose={() => setShowPanel(false)}
        />
      )}

      <div className="ig-scene">
        <div className="ig-card">
          <div className="ig-photo-frame">
            <div className="ig-monster">
              {isDone && images.length > 0 ? (
                <ImageGallery images={images} onRegen={handleRegen} />
              ) : (
                <div className="ig-eyes">
                  <Eye isRightEye={false} isGenerating={isGenerating} />
                  <Eye isRightEye={true} isGenerating={isGenerating} />
                </div>
              )}
            </div>
          </div>

          <div className="ig-legend">
            <h1 className={`ig-title${isGenerating ? ' ig-title-generating' : ''}`}>{titleText}</h1>
            <textarea
              className="ig-prompt-input"
              placeholder="在此输入图像描述..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={2}
              disabled={isGenerating}
              style={{ color: isGenerating ? 'rgba(0,0,0,0.35)' : '#000000' }}
            />
            {status === 'error' && <div className="ig-error-msg">{errorMsg}</div>}
            <div className="ig-footer-row">
              {/* 高级参数按钮（替换"哈哈"） */}
              <button className={`ig-adv-btn${paramChanged ? ' changed' : ''}`} onClick={() => setShowPanel(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                  <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
                  <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
                  <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" />
                </svg>
                参数
                {paramChanged && <span className="ig-adv-dot" />}
              </button>

              {isDone ? (
                <button className="ig-generate-btn ig-regen-btn" onClick={handleRegen}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  谢谢你！
                </button>
              ) : (
                <button className={`ig-generate-btn${isGenerating ? ' ig-btn-loading' : ''}`} onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}>
                  {isGenerating ? (
                    <><span className="ig-btn-spinner" />生成中...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>生成图像</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
