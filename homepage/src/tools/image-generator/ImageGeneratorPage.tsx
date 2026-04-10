import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

// ===== Eye Component =====
interface EyeProps {
  isRightEye?: boolean;
}

function Eye({ isRightEye = false }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const defaultPosition = isRightEye
    ? { x: 119.032 - 102, y: 117.787 - 102 }
    : { x: 74.8272 - 102, y: 78.3184 - 102 };
  const [pupilPosition, setPupilPosition] = useState(defaultPosition);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const eye = eyeRef.current;
      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;
      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1) {
        setPupilPosition(defaultPosition);
        return;
      }
      const eyeRadius = eyeRect.width / 2;
      const pupilRadius = 38;
      const maxMovement = eyeRadius - pupilRadius - 5;
      const nx = dx / distance;
      const ny = dy / distance;
      let moveX = Math.min(distance, maxMovement) * nx + defaultPosition.x;
      let moveY = Math.min(distance, maxMovement) * ny + defaultPosition.y;
      const totalDistance = Math.sqrt(
        Math.pow(moveX - defaultPosition.x, 2) + Math.pow(moveY - defaultPosition.y, 2)
      );
      if (totalDistance > maxMovement) {
        const scale = maxMovement / totalDistance;
        moveX = defaultPosition.x + (moveX - defaultPosition.x) * scale;
        moveY = defaultPosition.y + (moveY - defaultPosition.y) * scale;
      }
      setPupilPosition({ x: moveX, y: moveY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!eyeRef.current || !e.touches[0]) return;
      handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } as MouseEvent);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [defaultPosition.x, defaultPosition.y]);

  return (
    <div
      ref={eyeRef}
      className="ig-eye"
      data-name="eye"
    >
      <div
        className="ig-pupil"
        style={{
          transform: `translate(-50%, -50%) translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        }}
      />
    </div>
  );
}

// ===== Generate Button =====
function GenerateButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      className="ig-generate-btn"
      onClick={onClick}
      disabled={disabled}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      生成图像
    </button>
  );
}

// ===== Main Page =====
export default function ImageGeneratorPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    // TODO: 接入 Seedream 模型
    console.log('Generate with prompt:', prompt);
  };

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
          {/* Photo frame: cream border around blue monster area */}
          <div className="ig-photo-frame">
            <div className="ig-monster">
              <div className="ig-eyes">
                <Eye isRightEye={false} />
                <Eye isRightEye={true} />
              </div>
            </div>
          </div>

          {/* Legend / Input section */}
          <div className="ig-legend">
            <h1 className="ig-title">请帮我画...</h1>
            <textarea
              className="ig-prompt-input"
              placeholder="在此输入图像描述..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
            />
            <div className="ig-footer-row">
              <span className="ig-hint">哈哈。</span>
              <GenerateButton onClick={handleGenerate} disabled={!prompt.trim()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
