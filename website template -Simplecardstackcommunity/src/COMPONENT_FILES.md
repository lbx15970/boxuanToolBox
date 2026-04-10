# Complete Component Files

This file contains all the component code you need to copy to your project.

## File: src/App.tsx

```tsx
import { useState } from "react";
import CarouselStack from "./components/CarouselStack";
import { SettingsPanel, AnimationSettings } from "./components/SettingsPanel";

export default function App() {
  const [settings, setSettings] = useState<AnimationSettings>({
    springDuration: 0.3,
    springBounce: 0.3,
    xSpringDuration: 0.5,
    xSpringBounce: 0.1,
    dragElastic: 0.7,
    swipeConfidenceThreshold: 10000,
    zIndexDelay: 0.05,
  });

  return (
    <div className="App">
      <div className="hero-container">
        <div className="container">
          <CarouselStack settings={settings} />
        </div>
      </div>
      <SettingsPanel 
        settings={settings} 
        onSettingsChange={setSettings} 
      />
    </div>
  );
}
```

## File: src/components/CarouselStack.tsx

```tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const [indices, setIndices] = useState([0, 1, 2, 3]);
  const [dragElastic, setDragElastic] = useState(0.7); // Default to desktop

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
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (
                swipe < -settings.swipeConfidenceThreshold ||
                swipe > settings.swipeConfidenceThreshold
              ) {
                paginate();
              }
            }}
            className={`card card-${i}`}
          >
            <img src={items[index].image} alt={items[index].title} />
            <div className="card-content">
              <h5 className="card-title text-[15px]">{items[index].title}</h5>
              <p className="card-description">{items[index].description}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CarouselStack;
```

## File: src/components/items.ts

**NOTE:** You need to replace the image imports with your own images!

```typescript
// OPTION 1: Use actual image files
import gradient1 from '../assets/gradients/gradient1.png';
import gradient2 from '../assets/gradients/gradient2.png';
import gradient3 from '../assets/gradients/gradient3.png';
import gradient4 from '../assets/gradients/gradient4.png';

export const items = [
  {
    id: 1,
    title: "State 1",
    description: "Purple to pink gradient blend",
    image: gradient1,
  },
  {
    id: 2,
    title: "State 2",
    description: "Smooth gradient transition",
    image: gradient2,
  },
  {
    id: 3,
    title: "State 3",
    description: "Organic flowing color blend",
    image: gradient3,
  },
  {
    id: 4,
    title: "State 4",
    description: "Blue and coral gradient blend",
    image: gradient4,
  },
];

// OPTION 2: Use placeholder URLs (for quick testing)
/*
export const items = [
  {
    id: 1,
    title: "State 1",
    description: "Purple to pink gradient blend",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=600&fit=crop",
  },
  {
    id: 2,
    title: "State 2",
    description: "Smooth gradient transition",
    image: "https://images.unsplash.com/photo-1557672199-6f6f7eba31c6?w=400&h=600&fit=crop",
  },
  {
    id: 3,
    title: "State 3",
    description: "Organic flowing color blend",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
  },
  {
    id: 4,
    title: "State 4",
    description: "Blue and coral gradient blend",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=600&fit=crop",
  },
];
*/
```

## File: src/components/SettingsPanel.tsx

```tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Settings, X } from "lucide-react";

export interface AnimationSettings {
  springDuration: number;
  springBounce: number;
  xSpringDuration: number;
  xSpringBounce: number;
  dragElastic: number;
  swipeConfidenceThreshold: number;
  zIndexDelay: number;
}

interface SettingsPanelProps {
  settings: AnimationSettings;
  onSettingsChange: (settings: AnimationSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (
    key: keyof AnimationSettings,
    value: number,
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onSettingsChange({
      springDuration: 0.3,
      springBounce: 0.3,
      xSpringDuration: 0.5,
      xSpringBounce: 0.1,
      dragElastic: 0.7,
      swipeConfidenceThreshold: 10000,
      zIndexDelay: 0.05,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border-border hover:bg-white shadow-sm h-8 w-8"
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>

      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-[320px] bg-white border-l border-border shadow-lg z-[60] overflow-y-auto">
          <div className="flex items-start justify-end px-4 py-3 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div style={{ padding: "16px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Animation Duration
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.springDuration.toFixed(2)}s
                </span>
              </div>
              <Slider
                value={[settings.springDuration]}
                onValueChange={([value]) =>
                  updateSetting("springDuration", value)
                }
                min={0.1}
                max={1.0}
                step={0.05}
                className="w-full"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Animation Bounce
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.springBounce.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[settings.springBounce]}
                onValueChange={([value]) =>
                  updateSetting("springBounce", value)
                }
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Duration
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.xSpringDuration.toFixed(2)}s
                </span>
              </div>
              <Slider
                value={[settings.xSpringDuration]}
                onValueChange={([value]) =>
                  updateSetting("xSpringDuration", value)
                }
                min={0.1}
                max={1.5}
                step={0.05}
                className="w-full"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Bounce
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.xSpringBounce.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[settings.xSpringBounce]}
                onValueChange={([value]) =>
                  updateSetting("xSpringBounce", value)
                }
                min={0}
                max={0.5}
                step={0.01}
                className="w-full"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Drag Elasticity
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.dragElastic.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[settings.dragElastic]}
                onValueChange={([value]) =>
                  updateSetting("dragElastic", value)
                }
                min={0.1}
                max={1.5}
                step={0.05}
                className="w-full"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Swipe Sensitivity
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.swipeConfidenceThreshold.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[settings.swipeConfidenceThreshold]}
                onValueChange={([value]) =>
                  updateSetting(
                    "swipeConfidenceThreshold",
                    value,
                  )
                }
                min={1000}
                max={20000}
                step={500}
                className="w-full"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: "8px" }}
              >
                <Label className="text-[13px] font-normal" style={{ fontFamily: 'Inter', color: 'rgba(0,0,0,0.6)' }}>
                  Z-Index Delay
                </Label>
                <span className="text-xs font-mono px-1.5 py-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {settings.zIndexDelay.toFixed(3)}s
                </span>
              </div>
              <Slider
                value={[settings.zIndexDelay]}
                onValueChange={([value]) =>
                  updateSetting("zIndexDelay", value)
                }
                min={0}
                max={0.2}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-border">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                size="sm"
                className="w-full text-xs h-7"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
```

## File: src/main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## File: postcss.config.js

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

## File: vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## File: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## UI Components Needed

You'll need to install shadcn/ui components. Follow the guide at https://ui.shadcn.com/docs/installation/vite

Or manually copy these components from the existing `/components/ui/` folder:
- button.tsx
- slider.tsx
- label.tsx
- separator.tsx
- utils.ts (contains cn helper function)
