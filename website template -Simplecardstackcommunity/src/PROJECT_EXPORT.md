# Swipeable Card Stack Carousel - Project Export

This document contains all the information you need to set up and run this project on your personal computer.

## Project Overview

A swipeable card stack carousel component built with React, Framer Motion (Motion), and TypeScript. Features smooth animations, drag-to-swipe functionality, and a 3D perspective effect.

## Tech Stack

- **React** 18+
- **TypeScript**
- **Motion** (Framer Motion) - for animations
- **Tailwind CSS v4** - for styling
- **Vite** - build tool (recommended)
- **Lucide React** - for icons

## Project Structure

```
/
├── App.tsx                          # Main application component
├── components/
│   ├── CarouselStack.tsx           # Carousel component with swipe logic
│   ├── SettingsPanel.tsx           # Settings panel for animation controls
│   ├── items.ts                    # Card data and images
│   └── ui/                         # Shadcn UI components
│       ├── button.tsx
│       ├── slider.tsx
│       ├── label.tsx
│       └── separator.tsx
├── styles/
│   └── globals.css                 # Global styles and carousel-specific CSS
└── assets/
    └── gradients/                  # Gradient images (4 PNG files)
```

## Setup Instructions

### 1. Create a new React + TypeScript + Vite project

```bash
npm create vite@latest swipeable-carousel -- --template react-ts
cd swipeable-carousel
```

### 2. Install dependencies

```bash
npm install
npm install motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-slider @radix-ui/react-label @radix-ui/react-separator
npm install class-variance-authority clsx tailwind-merge
```

### 3. Initialize Tailwind CSS v4

Create `postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Update `package.json` to include Tailwind v4:

```bash
npm install -D @tailwindcss/postcss@next
```

### 4. Copy all files from this export

Copy the following files to your project:
- `App.tsx` → `src/App.tsx`
- `components/` → `src/components/`
- `styles/globals.css` → `src/styles/globals.css`

### 5. Update main.tsx

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

### 6. Add gradient images

You'll need to replace the gradient images in `components/items.ts`. The current implementation uses Figma assets. 

**Option A - Use your own images:**
1. Create an `assets/gradients/` folder
2. Add 4 gradient images (PNG/JPG)
3. Update `components/items.ts` to import them:

```typescript
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
  // ... etc
];
```

**Option B - Use placeholder gradients:**
Create CSS gradients as background images (see items.ts alternative below).

### 7. Run the development server

```bash
npm run dev
```

## Key Files Explained

### App.tsx
Main component that renders the carousel and settings panel. Manages animation settings state.

### components/CarouselStack.tsx
Core carousel component featuring:
- 4-card stack with 3D perspective
- Drag-to-swipe functionality
- Velocity-based swipe detection
- Spring animations with customizable settings
- Card dimensions: 323px × 484px with 24px border radius

### components/SettingsPanel.tsx
Settings panel with controls for:
- Animation Duration & Bounce
- X-axis Duration & Bounce
- Drag Elasticity
- Swipe Sensitivity
- Z-Index Delay

### styles/globals.css
Contains all custom CSS including:
- Card styling
- Container layouts
- Responsive design
- Tailwind v4 configuration
- Inter font imports

## Features

✅ Swipeable card stack (4 cards visible)
✅ 3D perspective effect with scale, rotation, and position transforms
✅ Velocity-based swipe detection
✅ Spring animations with Motion (Framer Motion)
✅ Fully customizable animation settings panel
✅ Responsive design
✅ Card information display
✅ Glassmorphic design elements

## Customization

### Changing Card Dimensions
Edit in `styles/globals.css`:
```css
.content-container {
  width: 343px;
  height: 484px;
}

.card {
  height: 484px;
  width: 323px;
  border-radius: 24px;
}
```

### Adding More Cards
Update `components/items.ts` and the initial indices in `CarouselStack.tsx`:
```typescript
const [indices, setIndices] = useState([0, 1, 2, 3, 4, 5]); // For 6 cards
```

Also update the variants array lengths in `createCardVariants()`.

### Changing Animation Defaults
Edit default values in `App.tsx`:
```typescript
const [settings, setSettings] = useState<AnimationSettings>({
  springDuration: 0.3,
  springBounce: 0.3,
  // ... etc
});
```

## Troubleshooting

**Images not loading:**
- Make sure image paths are correct in `items.ts`
- Ensure images are in the correct folder
- Check Vite's static asset handling

**Tailwind classes not working:**
- Verify `globals.css` is imported in `main.tsx`
- Check `postcss.config.js` is configured correctly
- Ensure Tailwind v4 is properly installed

**Motion animations not smooth:**
- Check that `motion` package is installed (not `framer-motion`)
- Verify imports use `import { motion } from 'motion/react'`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT - Feel free to use this in your personal or commercial projects.

## Additional Notes

- The project uses Tailwind CSS v4 (next generation)
- Motion is the new name for Framer Motion - use `motion/react` for imports
- All UI components are from Shadcn UI (Radix UI primitives)
- Inter font is loaded from Google Fonts

## Next Steps for Development

- Add more cards with different content
- Implement card click actions
- Add navigation indicators/dots
- Create card detail views
- Add autoplay functionality
- Implement keyboard navigation
- Add touch gesture improvements for mobile
