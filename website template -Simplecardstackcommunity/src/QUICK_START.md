# 🚀 Quick Start Guide

Get your Swipeable Card Carousel up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of React and TypeScript

## Step-by-Step Setup

### 1. Create New Vite Project

```bash
npm create vite@latest swipeable-carousel -- --template react-ts
cd swipeable-carousel
```

### 2. Install All Dependencies

```bash
# Core dependencies
npm install motion lucide-react

# Radix UI components
npm install @radix-ui/react-slider @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot

# Utility libraries
npm install class-variance-authority clsx tailwind-merge

# Tailwind CSS v4 (development dependencies)
npm install -D @tailwindcss/postcss postcss autoprefixer
```

### 3. Configure PostCSS

Create `postcss.config.js` in project root:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### 4. Create Project Structure

```bash
# Create directories
mkdir -p src/components/ui
mkdir -p src/styles
mkdir -p src/assets/gradients
```

### 5. Copy Files

Copy these files from the export:

**Main Files:**
- Copy `App.tsx` → `src/App.tsx`
- Copy `CarouselStack.tsx` → `src/components/CarouselStack.tsx`
- Copy `SettingsPanel.tsx` → `src/components/SettingsPanel.tsx`
- Copy `items.ts` → `src/components/items.ts` (remember to update image imports!)
- Copy `globals.css` → `src/styles/globals.css`

**UI Components:**
- Copy all files from `UI_COMPONENTS.md` to `src/components/ui/`

**Config Files:**
- Copy `vite.config.ts` to project root
- Copy `tsconfig.json` to project root

### 6. Update main.tsx

Replace contents of `src/main.tsx`:

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

### 7. Add Gradient Images

**Option A - Use Placeholder URLs (Quick Test):**

Update `src/components/items.ts`:

```typescript
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
```

**Option B - Use Your Own Images:**

1. Add 4 gradient images to `src/assets/gradients/`
2. Update `src/components/items.ts`:

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

### 8. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser!

## 🎉 You're Done!

You should now see:
- A stack of 4 swipeable cards
- A settings icon in the top-right corner
- Smooth animations when swiping cards
- An adjustable settings panel

## Testing the Features

1. **Swipe Cards**: Click and drag the top card left or right
2. **Settings Panel**: Click the gear icon in top-right
3. **Adjust Animations**: Use sliders to modify:
   - Animation duration and bounce
   - Drag elasticity
   - Swipe sensitivity
   - Z-index timing
4. **Reset**: Click "Reset to Defaults" to restore original settings

## Troubleshooting

### Issue: Tailwind classes not working

**Solution:**
```bash
# Make sure you installed Tailwind v4
npm install -D @tailwindcss/postcss@next

# Check postcss.config.js exists and is configured correctly
```

### Issue: Motion animations not working

**Solution:**
```bash
# Install motion package (not framer-motion)
npm install motion

# Check imports use 'motion/react'
import { motion } from 'motion/react'
```

### Issue: Images not loading

**Solution:**
- Use the placeholder URLs first to test
- Check that image paths are correct
- Ensure images are in `src/assets/gradients/`
- Verify vite config has correct alias setup

### Issue: TypeScript errors

**Solution:**
```bash
# Make sure tsconfig.json is configured correctly
# Check that all files are in the 'src' directory
```

### Issue: UI components not rendering

**Solution:**
```bash
# Make sure all Radix UI packages are installed
npm install @radix-ui/react-slider @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot

# Check that utils.ts is in components/ui/
# Verify all component imports are correct
```

## Next Steps

Now that your carousel is running, you can:

1. **Customize the Design**
   - Change card dimensions in `globals.css`
   - Modify colors and shadows
   - Update gradient images

2. **Add Features**
   - Auto-play functionality
   - Navigation dots/indicators
   - Card click handlers
   - Keyboard navigation

3. **Extend Functionality**
   - Add more cards
   - Create different animation presets
   - Implement card detail views
   - Add pagination

## File Structure Overview

```
swipeable-carousel/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   └── utils.ts
│   │   ├── CarouselStack.tsx
│   │   ├── SettingsPanel.tsx
│   │   └── items.ts
│   ├── styles/
│   │   └── globals.css
│   ├── assets/
│   │   └── gradients/
│   ├── App.tsx
│   └── main.tsx
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Resources

- [Motion Documentation](https://motion.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vite Guide](https://vitejs.dev/guide/)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Make sure you're using Node.js 18+
4. Check browser console for errors
5. Review the PROJECT_EXPORT.md for detailed information

Happy coding! 🎨
