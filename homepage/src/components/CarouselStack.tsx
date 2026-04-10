import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { items } from "./items";
import { AnimationSettings } from "./SettingsPanel";



// Image variants aka first card
const createCardVariants = (settings: AnimationSettings) => ({
  visible: (i: number) => ({
    opacity: 1,
    zIndex: [4, 3, 2, 1][i],
    scale: [1, 0.9, 0.85, 0.8][i], // Scale depending on position
    y: [0, -12, 0, 12][i], // Vertical position depending on index (keep scale in mind)
    rotate: [0, 2, 4, 7][i],
    x: [0, 32, 48, 62][i],
    perspective: 400,
    transition: {
      // opacity: { duration: 0.3 },
      zIndex: { delay: settings.zIndexDelay }, // Delay zIndex to avoid visual stacking issues during transition
      scale: { type: "spring", duration: settings.springDuration, bounce: settings.springBounce },
      y: { type: "spring", duration: settings.springDuration, bounce: settings.springBounce },
      x: { type: "spring", duration: settings.xSpringDuration, bounce: settings.xSpringBounce },
    },
  }),
  exit: { opacity: 0, scale: 0.5, y: 50 },
});

/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface CarouselStackProps {
  settings: AnimationSettings;
}

export const CarouselStack: React.FC<CarouselStackProps> = ({ settings }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [indices, setIndices] = useState(() => items.map((_, i) => i));
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [dragElastic, setDragElastic] = useState(settings.dragElastic);
  const navigate = useNavigate();

  useEffect(() => {
    setDragElastic(settings.dragElastic);
  }, [settings.dragElastic]); // Update when settings change

  const paginate = () => {
    // Rotate the indices array to move each card to the next position
    setIndices((prevIndices) => [
      prevIndices[1],
      prevIndices[2],
      prevIndices[3],
      prevIndices[0],
    ]);
  };

  const cardVariants = createCardVariants(settings);

  return (
    <div className="content-container">
      <AnimatePresence initial={false}>
        {indices.map((index, i) => (
          <motion.div
            key={items[index].id}
            custom={i}
            variants={cardVariants}
            initial="exit"
            animate="visible"
            exit="exit"
            drag={true}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={dragElastic}
            onDrag={(e, { offset }) => {
              setDragOffsetX(Math.abs(offset.x));
            }}
            onDragEnd={(e, { offset, velocity }) => {
              setHasSwiped(true);
              const swipe = swipePower(offset.x, velocity.x);
              if (
                swipe < -settings.swipeConfidenceThreshold ||
                swipe > settings.swipeConfidenceThreshold
              ) {
                paginate();
              }
              // 拖动结束后重置偏移量
              setTimeout(() => setDragOffsetX(0), 100);
            }}
            onClick={() => {
              // 只有拖动距离小于10px时才触发点击，避免拖动误触发
              if (dragOffsetX > 10) return;
              
              const url = items[index].url;
              if (url && url !== '#') {
                if (url.startsWith('/')) {
                  navigate(url);
                } else {
                  window.open(url, '_blank');
                }
              }
            }}
            className={`card card-${i}`}
            style={{ cursor: items[index].url && items[index].url !== '#' ? 'pointer' : 'default' }}
          >
            <img src={items[index].image} alt={items[index].title} />
            <div className="card-content">
              <h5 className="card-title text-[15px]">{items[index].title}</h5>
              <p className="card-description">{items[index].description}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div 
        animate={hasSwiped ? { opacity: 0, y: 10 } : { opacity: [0.4, 0.8, 0.4], y: 0 }}
        transition={hasSwiped ? { duration: 0.4 } : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          bottom: '12vh',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#888888',
          fontSize: '13px',
          pointerEvents: 'none',
          letterSpacing: '4px',
          fontWeight: 400,
          zIndex: 9999
        }}
      >
        &gt;&gt; 滑动以切换 &gt;&gt;
      </motion.div>
    </div>
  );
};

export default CarouselStack;