import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

type GenerateStatus = 'idle' | 'generating' | 'done' | 'error';

// ===== Eye Component =====
interface EyeProps {
  isRightEye?: boolean;
  isGenerating?: boolean;
}

function Eye({ isRightEye = false, isGenerating = false }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const defaultPosition = isRightEye
    ? { x: 119.032 - 102, y: 117.787 - 102 }
    : { x: 74.8272 - 102, y: 78.3184 - 102 };
  const [pupilPosition, setPupilPosition] = useState(defaultPosition);

  useEffect(() => {
    if (isGenerating) return; // 生成中由 CSS 动画接管

    const handlePointer = (clientX: number, clientY: number) => {
      if (!eyeRef.current) return;
      const eye = eyeRef.current;
      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;
      const dx = clientX - eyeCenterX;
      const dy = clientY - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1) { setPupilPosition(defaultPosition); return; }
      const eyeRadius = eyeRect.width / 2;
      const pupilRadius = eyeRect.width * 0.185; // 比例适配不同尺寸
      const maxMovement = eyeRadius - pupilRadius - 5;
      const nx = dx / distance;
      const ny = dy / distance;
      let moveX = Math.min(distance, maxMovement) * nx + defaultPosition.x;
      let moveY = Math.min(distance, maxMovement) * ny + defaultPosition.y;
      const totalDist = Math.sqrt(
        Math.pow(moveX - defaultPosition.x, 2) + Math.pow(moveY - defaultPosition.y, 2)
      );
      if (totalDist > maxMovement) {
        const scale = maxMovement / totalDist;
        moveX = defaultPosition.x + (moveX - defaultPosition.x) * scale;
        moveY = defaultPosition.y + (moveY - defaultPosition.y) * scale;
      }
      setPupilPosition({ x: moveX, y: moveY });
    };

    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [isGenerating, defaultPosition.x, defaultPosition.y]);

  if (isGenerating) {
    // 眩晕圆圈动画
    return (
      <div ref={eyeRef} className="ig-eye ig-eye-dizzy" data-name="eye">
        <div className="ig-dizzy-ring ig-ring-1" />
        <div className="ig-dizzy-ring ig-ring-2" />
        <div className="ig-dizzy-ring ig-ring-3" />
      </div>
    );
  }

  return (
    <div ref={eyeRef} className="ig-eye" data-name="eye">
      <div
        className="ig-pupil"
        style={{
          transform: `translate(-50%, -50%) translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          transition: 'transform 0.08s ease-out',
        }}
      />
    </div>
  );
}

// ===== API 调用 =====
async function callGenerateAPI(prompt: string): Promise<{ imageDataUrl?: string; imageUrl?: string }> {
  const res = await fetch('/api/tools/image-generator/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || '生成失败');
  return data;
}

// ===== Main Page =====
export default function ImageGeneratorPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isGenerating = status === 'generating';
  const isDone = status === 'done';

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setStatus('generating');
    setGeneratedImage(null);
    setErrorMsg('');

    try {
      const result = await callGenerateAPI(prompt);
      const imgSrc = result.imageDataUrl || result.imageUrl || '';
      setGeneratedImage(imgSrc);
      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || '生成失败，请重试');
      setStatus('error');
    }
  }, [prompt, isGenerating]);

  // 生成完成后恢复 idle，但保留图像（再次点击会重新生成）
  const handleRegenerate = useCallback(() => {
    setStatus('idle');
    setGeneratedImage(null);
  }, []);

  // 标题文字
  const titleText = isGenerating ? '正在画...' : isDone ? '画好了！' : '请帮我画...';

  return (
    <div className="ig-app">
      {/* Back button */}
      <button className="ig-back-btn" onClick={() => navigate('/')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        返回
      </button>

      {/* Main card */}
      <div className="ig-scene">
        <div className="ig-card">
          {/* Photo frame */}
          <div className="ig-photo-frame">
            <div className="ig-monster">
              {isDone && generatedImage ? (
                /* 生成完成：显示图像，长按可保存 */
                <img
                  src={generatedImage}
                  alt="生成的图像"
                  className="ig-result-image"
                  onContextMenu={(e) => e.preventDefault()}
                  onTouchStart={(e) => {
                    // 长按触发下载（iOS 需要用户交互）
                    const timer = setTimeout(() => {
                      const a = document.createElement('a');
                      a.href = generatedImage;
                      a.download = `seedream-${Date.now()}.png`;
                      a.click();
                    }, 600);
                    e.currentTarget.addEventListener('touchend', () => clearTimeout(timer), { once: true });
                  }}
                />
              ) : (
                <div className="ig-eyes">
                  <Eye isRightEye={false} isGenerating={isGenerating} />
                  <Eye isRightEye={true} isGenerating={isGenerating} />
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="ig-legend">
            <h1 className={`ig-title${isGenerating ? ' ig-title-generating' : ''}`}>
              {titleText}
            </h1>

            <textarea
              className="ig-prompt-input"
              placeholder="在此输入图像描述..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              disabled={isGenerating}
              style={{ color: isGenerating ? 'rgba(0,0,0,0.35)' : '#000000' }}
            />

            {status === 'error' && (
              <div className="ig-error-msg">{errorMsg}</div>
            )}

            <div className="ig-footer-row">
              <span className="ig-hint">哈哈。</span>
              {isDone ? (
                <button className="ig-generate-btn ig-regen-btn" onClick={handleRegenerate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  再画一张
                </button>
              ) : (
                <button
                  className={`ig-generate-btn${isGenerating ? ' ig-btn-loading' : ''}`}
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="ig-btn-spinner" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                      </svg>
                      生成图像
                    </>
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
