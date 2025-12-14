# Design System - Andreas Labs / Milpunk Inspired

## Overview

A "military tech" / "cyber ops" / "milpunk" aesthetic inspired by Andreas Labs landing page. Pure black backgrounds with white wireframes, minimal border radius, monospace technical typography.

## Color Palette

### Core Colors (CSS Variables)
```css
:root {
  --radius: 0.125rem;  /* Very small - blocky aesthetic */
  --background: #000000;
  --foreground: #ffffff;
  --card: #0a0a0a;
  --card-foreground: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #000000;
  --secondary: #111111;
  --secondary-foreground: #ffffff;
  --muted: #141414;
  --muted-foreground: #666666;
  --accent: #1a1a1a;
  --accent-foreground: #ffffff;
  --destructive: #ff3333;
  --border: #222222;
  --input: #141414;
  --ring: #333333;
}
```

### Accent Colors for HUD Elements
| Name | Hex | Usage |
|------|-----|-------|
| Cyber Green | `#00ffaa` | HUD markers, success states |
| Cyber Orange | `#ff6600` | Highlights, warnings |
| Cyber Blue | `#00a8ff` | Links, info |

### Opacity Levels
```css
white/40  /* Secondary text, subtle elements */
white/70  /* Body text */
white/80  /* Primary data */
white/10  /* Borders, dividers */
white/05  /* Background tints */
```

## Typography

### Font Stack
```css
--font-sans: "DM Sans", "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### OpenType Features
```css
body {
  font-feature-settings: "ss01", "ss02", "cv01";
}
```

### Typography Scale
| Usage | Classes |
|-------|---------|
| Labels | `text-[9px] or text-[10px] uppercase tracking-widest font-mono text-white/30` |
| Body | `text-sm text-muted-foreground leading-relaxed` |
| Headings | `text-5xl md:text-7xl font-bold uppercase tracking-tight` |
| Stats | `text-2xl or text-3xl font-bold font-mono uppercase` |
| Data | `text-[11px] font-mono text-white/80` |

### Terminal Text Effect
```css
.terminal-text {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
```

## Animations

### Keyframes
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
```

### Animation Classes
```css
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
.animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
.animate-slide-in-left { animation: slide-in-left 0.6s ease-out forwards; }
.animate-slide-in-right { animation: slide-in-right 0.6s ease-out forwards; }
.animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
```

### Stagger Delays
```css
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
/* ... up to delay-800 */
```

## Background Patterns

### Dot Grid
```css
.dot-grid {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Line Grid
```css
.grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

### Glassmorphism
```css
.glass {
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.glass-subtle {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.04);
}
```

### Fade Edges
```css
.fade-edges {
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
}
```

## Component Patterns

### Milpunk Data Panel
```tsx
<div className="backdrop-blur-md bg-black/80 text-white/90 border border-white/10 font-mono text-[11px]">
  {/* Header */}
  <div className="border-b border-white/10 px-4 py-2 flex items-center justify-between bg-white/5">
    <span className="uppercase tracking-wider font-medium text-white/70">SYS_INFO</span>
    <span className="text-white/30">TWEET_SWIPER // OPS</span>
  </div>
  
  {/* Data Row */}
  <div className="p-4">
    <div className="text-[9px] text-white/30 uppercase tracking-widest mb-3">STATUS</div>
    <div className="text-white/80">ACTIVE</div>
  </div>
</div>
```

### Button Variants
```tsx
// Primary - white bg, black text
<button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 uppercase tracking-wider text-xs font-medium">
  ACTION
</button>

// Ghost - transparent with border
<button className="border border-border bg-transparent hover:bg-accent hover:text-accent-foreground h-9 px-4 uppercase tracking-wider text-xs">
  CANCEL
</button>

// Destructive - red
<button className="bg-destructive text-white hover:bg-destructive/90 h-9 px-4 uppercase tracking-wider text-xs">
  DELETE
</button>
```

### Card
```tsx
<div className="bg-card text-card-foreground border border-border">
  {/* Content */}
</div>
```

## 3D Effects (React Three Fiber)

### Wireframe Aesthetic
All 3D elements use wireframe materials:
```tsx
<meshBasicMaterial color="#ffffff" wireframe />
```

### Flat Card with Tilt
```tsx
// Mouse-responsive tilt (max 15 degrees)
mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, mouse.y * 0.15, 0.1)
mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, mouse.x * 0.15, 0.1)
```

### Iridescent Shader Colors
```javascript
const shaderColors = {
  primary: new THREE.Color('#00ffaa'),
  secondary: new THREE.Color('#00a8ff'),
  accent: new THREE.Color('#ff6600'),
  base: new THREE.Color('#1a1a1a'),
};
```

### Scene Setup
```tsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 40 }}
  gl={{ antialias: true, alpha: true }}
>
  <ambientLight intensity={0.4} />
  <fog attach="fog" args={['#000000', 30, 80]} />
  {/* Components */}
</Canvas>
```

## Scrollbar Styling
```css
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: #444; }
```

## Design Principles

1. **Pure black background** (`#000000`)
2. **Minimal border-radius** (`0.125rem` / 2px)
3. **Wireframe 3D** - no solid fills
4. **Monospace for technical text**
5. **UPPERCASE with wide letter-spacing** for labels
6. **Subtle transparency** - white/40, white/70, white/80
7. **Grid patterns** as backgrounds
8. **SNAKE_CASE** for technical/military naming
