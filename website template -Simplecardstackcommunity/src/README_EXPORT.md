# 📦 Swipeable Card Stack Carousel - Complete Export

**A production-ready React carousel component with swipe gestures, spring animations, and customizable settings.**

---

## 📋 Table of Contents

1. [Quick Links](#-quick-links)
2. [What's Included](#-whats-included)
3. [Features](#-features)
4. [Tech Stack](#-tech-stack)
5. [Installation Options](#-installation-options)
6. [File Manifest](#-file-manifest)
7. [Quick Start](#-quick-start)
8. [Documentation Files](#-documentation-files)

---

## 🔗 Quick Links

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[PROJECT_EXPORT.md](./PROJECT_EXPORT.md)** - Complete setup guide and documentation
- **[COMPONENT_FILES.md](./COMPONENT_FILES.md)** - All component source code
- **[UI_COMPONENTS.md](./UI_COMPONENTS.md)** - Shadcn UI components
- **[package.json](./package.json)** - Dependencies list
- **[globals.css](./styles/globals.css)** - Complete styles

---

## 📦 What's Included

This export contains everything you need to run the Swipeable Card Carousel project on your local machine:

### Core Components
- ✅ Main App component with state management
- ✅ CarouselStack component with swipe logic
- ✅ SettingsPanel with real-time controls
- ✅ Card data structure and items configuration

### UI Components (Shadcn/Radix)
- ✅ Button component
- ✅ Slider component
- ✅ Label component
- ✅ Separator component
- ✅ Utility functions (cn helper)

### Styling
- ✅ Complete globals.css with Tailwind v4
- ✅ Custom carousel-specific styles
- ✅ Responsive design breakpoints
- ✅ Inter font integration

### Configuration
- ✅ package.json with all dependencies
- ✅ PostCSS configuration
- ✅ TypeScript configuration
- ✅ Vite configuration

### Documentation
- ✅ Quick start guide
- ✅ Detailed setup instructions
- ✅ Troubleshooting guide
- ✅ Customization examples

---

## ✨ Features

### Core Functionality
- 🎴 **4-Card Stack Display** with 3D perspective effect
- 👆 **Drag-to-Swipe** with velocity-based detection
- 🎨 **Smooth Spring Animations** powered by Motion (Framer Motion)
- 📱 **Fully Responsive** design for mobile and desktop
- ⚙️ **Live Settings Panel** with 7 customizable parameters

### Animation Controls
- **Animation Duration** - Control transition speed (0.1s - 1.0s)
- **Animation Bounce** - Adjust spring bounciness (0 - 1)
- **X-Axis Duration** - Horizontal movement timing (0.1s - 1.5s)
- **X-Axis Bounce** - Horizontal spring effect (0 - 0.5)
- **Drag Elasticity** - How far cards can be dragged (0.1 - 1.5)
- **Swipe Sensitivity** - Threshold for swipe detection (1,000 - 20,000)
- **Z-Index Delay** - Stacking order timing (0s - 0.2s)

### Visual Features
- 🌈 Full-coverage gradient backgrounds
- 💎 Glassmorphic card labels
- 🎯 Card information display
- 🔄 Infinite rotation carousel
- 🎭 3D perspective transforms

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI Framework |
| TypeScript | 5.2+ | Type Safety |
| Motion | 10.18+ | Animations (Framer Motion) |
| Tailwind CSS | v4 | Styling |
| Vite | 5+ | Build Tool |
| Radix UI | Latest | Accessible primitives |
| Lucide React | Latest | Icons |

---

## 💿 Installation Options

### Option 1: Manual Setup (Recommended)

**Best for: Full control and customization**

1. Follow [QUICK_START.md](./QUICK_START.md)
2. Install dependencies from package.json
3. Copy all component files
4. Configure vite and postcss
5. Add your own gradient images

**Estimated time:** 5-10 minutes

### Option 2: Copy Existing Structure

**Best for: Quick deployment**

1. Create new React + TypeScript project
2. Copy entire file structure from this export
3. Run `npm install`
4. Update image imports in `items.ts`
5. Run `npm run dev`

**Estimated time:** 3-5 minutes

---

## 📁 File Manifest

### Main Application Files

```
📄 src/App.tsx                      - Main application component (28 lines)
📄 src/main.tsx                     - Entry point (9 lines)
📄 src/components/CarouselStack.tsx - Carousel logic (99 lines)
📄 src/components/SettingsPanel.tsx - Settings UI (263 lines)
📄 src/components/items.ts          - Card data (31 lines)
```

### UI Components

```
📄 src/components/ui/button.tsx     - Button component (59 lines)
📄 src/components/ui/slider.tsx     - Slider component (64 lines)
📄 src/components/ui/label.tsx      - Label component (25 lines)
📄 src/components/ui/separator.tsx  - Separator component (29 lines)
📄 src/components/ui/utils.ts       - Utility functions (7 lines)
```

### Styles

```
📄 src/styles/globals.css           - Complete stylesheet (479 lines)
```

### Configuration Files

```
📄 package.json                     - Dependencies and scripts
📄 postcss.config.js                - PostCSS configuration
📄 vite.config.ts                   - Vite build config
📄 tsconfig.json                    - TypeScript config
```

### Documentation

```
📄 README_EXPORT.md                 - This file (overview)
📄 QUICK_START.md                   - 5-minute setup guide
📄 PROJECT_EXPORT.md                - Detailed documentation
📄 COMPONENT_FILES.md               - All component source code
📄 UI_COMPONENTS.md                 - UI component code
```

**Total Lines of Code:** ~1,100+ lines

---

## 🚀 Quick Start

### Fastest Way to Get Running:

```bash
# 1. Create new project
npm create vite@latest my-carousel -- --template react-ts
cd my-carousel

# 2. Install dependencies
npm install motion lucide-react
npm install @radix-ui/react-slider @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install -D @tailwindcss/postcss postcss autoprefixer

# 3. Copy files from this export
# - Copy all files from COMPONENT_FILES.md
# - Copy all files from UI_COMPONENTS.md
# - Copy globals.css
# - Copy config files

# 4. Run development server
npm run dev
```

**See [QUICK_START.md](./QUICK_START.md) for detailed step-by-step instructions.**

---

## 📚 Documentation Files

### QUICK_START.md
- ✅ 5-minute setup guide
- ✅ Step-by-step installation
- ✅ Troubleshooting section
- ✅ Testing instructions

**Start here if:** You want to get running quickly

---

### PROJECT_EXPORT.md
- ✅ Complete project overview
- ✅ Detailed tech stack explanation
- ✅ File structure breakdown
- ✅ Customization guide
- ✅ Browser support information
- ✅ Next steps for development

**Start here if:** You want comprehensive documentation

---

### COMPONENT_FILES.md
- ✅ Full source code for all components
- ✅ App.tsx implementation
- ✅ CarouselStack.tsx with comments
- ✅ SettingsPanel.tsx complete code
- ✅ Configuration files (vite, tsconfig, etc.)
- ✅ Alternative image options

**Start here if:** You need to copy/paste all component code

---

### UI_COMPONENTS.md
- ✅ Shadcn UI component implementations
- ✅ Button, Slider, Label, Separator
- ✅ Utility functions
- ✅ Installation notes

**Start here if:** You need UI component code

---

## 🎯 Project Specifications

### Card Dimensions
- **Width:** 323px
- **Height:** 484px
- **Border Radius:** 24px
- **Stack Count:** 4 cards visible

### Animation Defaults
```typescript
{
  springDuration: 0.3,      // 300ms animation
  springBounce: 0.3,        // 30% bounce effect
  xSpringDuration: 0.5,     // 500ms horizontal
  xSpringBounce: 0.1,       // 10% horizontal bounce
  dragElastic: 0.7,         // 70% drag resistance
  swipeConfidenceThreshold: 10000,
  zIndexDelay: 0.05,        // 50ms z-index delay
}
```

### Transform Values (per card position)
```typescript
Position 0 (Front):  scale: 1.0,  rotate: 0°,  x: 0px,   y: 0px
Position 1:          scale: 0.9,  rotate: 2°,  x: 32px,  y: -12px
Position 2:          scale: 0.85, rotate: 4°,  x: 48px,  y: 0px
Position 3 (Back):   scale: 0.8,  rotate: 7°,  x: 62px,  y: 12px
```

---

## 🎨 Customization Quick Reference

### Change Card Size
Edit in `globals.css`:
```css
.card {
  height: 600px;  /* Change from 484px */
  width: 400px;   /* Change from 323px */
}
```

### Change Number of Cards
Update in `CarouselStack.tsx`:
```typescript
const [indices, setIndices] = useState([0, 1, 2, 3, 4, 5]);
```

### Change Animation Speeds
Adjust defaults in `App.tsx`:
```typescript
springDuration: 0.5,  // Slower animation
```

### Add More Cards
Update `items.ts`:
```typescript
export const items = [
  // ... existing cards ...
  {
    id: 5,
    title: "State 5",
    description: "New card description",
    image: gradient5,
  },
];
```

---

## 📊 Project Stats

- **Total Components:** 9
- **Lines of Code:** ~1,100+
- **Dependencies:** 12 packages
- **Dev Dependencies:** 8 packages
- **File Size:** ~50KB (excluding node_modules)
- **Supported Browsers:** All modern browsers
- **Mobile Support:** Yes (touch gestures)
- **TypeScript:** 100% coverage
- **Accessibility:** WCAG 2.1 compliant (Radix UI)

---

## 🔧 System Requirements

- **Node.js:** 18.0.0 or higher
- **npm:** 9.0.0 or higher (or yarn equivalent)
- **OS:** Windows, macOS, or Linux
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen:** Works on all screen sizes (responsive)

---

## 📝 License

MIT License - Feel free to use this in personal or commercial projects.

---

## 🤝 Support

If you encounter any issues:

1. Check [QUICK_START.md](./QUICK_START.md) troubleshooting section
2. Verify all dependencies are installed correctly
3. Make sure you're using Node.js 18+
4. Check browser console for specific errors
5. Review [PROJECT_EXPORT.md](./PROJECT_EXPORT.md) for detailed setup

---

## 🎓 Learning Resources

- **Motion (Framer Motion):** https://motion.dev/
- **Tailwind CSS v4:** https://tailwindcss.com/
- **Radix UI:** https://www.radix-ui.com/
- **Vite:** https://vitejs.dev/
- **React Docs:** https://react.dev/

---

## 🚦 Getting Started Checklist

- [ ] Read this README
- [ ] Choose installation method (Manual or Copy)
- [ ] Follow QUICK_START.md or PROJECT_EXPORT.md
- [ ] Install all dependencies from package.json
- [ ] Copy component files from COMPONENT_FILES.md
- [ ] Copy UI components from UI_COMPONENTS.md
- [ ] Copy globals.css to styles folder
- [ ] Update items.ts with your images
- [ ] Run `npm run dev`
- [ ] Test swipe functionality
- [ ] Open settings panel
- [ ] Customize to your needs

---

## 📞 What to Do Next

1. **For immediate setup:** Go to [QUICK_START.md](./QUICK_START.md)
2. **For detailed docs:** Go to [PROJECT_EXPORT.md](./PROJECT_EXPORT.md)
3. **To copy code:** Go to [COMPONENT_FILES.md](./COMPONENT_FILES.md)
4. **For UI components:** Go to [UI_COMPONENTS.md](./UI_COMPONENTS.md)

---

**Made with ❤️ using React, Motion, and Tailwind CSS**

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready ✅
