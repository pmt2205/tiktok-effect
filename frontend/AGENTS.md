<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TikTok Live Effect Mapping — UI Styling & Customization Rules

These are the rules and guidelines that must be followed when building, editing, or maintaining the frontend user interface of this project.

## Theme & Visual Aesthetics
The application must maintain a premium **Obsidian Dark Theme** layout. The design features a translucent glassmorphic look with vibrant neon glowing highlights and dynamic meteor/shooting star backgrounds, implemented using **TailwindCSS v4.0**.

### Colors & Gradients
Use the Tailwind CSS utility classes mapped to our design tokens defined in `globals.css`:
- **Backgrounds**:
  - Main background: `bg-bg-dark` (`#07080d`)
  - Surface cards: `bg-bg-surface` (`#0d0f18`)
  - Glass panels: `bg-bg-card` (`rgba(16, 18, 32, 0.55)`)
  - Glass hover: `bg-bg-card-hover` (`rgba(24, 27, 48, 0.65)`)
  - Inputs: `bg-bg-input` (`rgba(0, 0, 0, 0.3)`)
- **Accent Colors**:
  - Primary (TikTok Pink): `text-primary` / `bg-primary` (`#ff0050`)
  - Primary Glow: `rgba(255, 0, 80, 0.35)` (`var(--color-primary-glow)`)
  - Secondary (Neon Blue): `text-secondary` / `bg-secondary` (`#00f2fe`)
  - Secondary Glow: `rgba(0, 242, 254, 0.25)` (`var(--color-secondary-glow)`)
  - Accent (Neon Purple): `text-accent` / `bg-accent` (`#9d4edd`)
- **Borders & Shadows**:
  - Transparent border: `border-border-color` (`rgba(255, 255, 255, 0.07)`)
  - Active Glow Border: `border-border-glow` (`rgba(0, 242, 254, 0.15)`)
  - Dynamic Glass Shadow: `shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]`

### Glassmorphic Cards (Tailwind classes)
Every content panel must use a glassmorphism style:
- Backdrop blur: `backdrop-blur-3xl`
- Border: `border border-border-color`
- Shadow: `shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]`
- Background: `bg-bg-card`
- On hover, borders should glow subtly and cards lift slightly (`hover:border-white/12 hover:shadow-[0_8px_40px_0_rgba(0,242,254,0.04)] hover:bg-bg-card-hover hover:-translate-y-0.5 transition-all duration-300`).

### Form Controls & Active States (Tailwind classes)
- **Inputs**: Rounded corners (`rounded-md` or `rounded-sm`), dark transparent background (`bg-bg-input`), and subtle transparent borders.
- **Focus state**: When focused, inputs must glow. Use `focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25` (cyan) or `focus:border-primary focus:ring-3 focus:ring-primary-glow/25` (pink).
- **Buttons**:
  - Gradient button: `bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_15px_rgba(255,0,80,0.3),0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(255,0,80,0.5),0_0_25px_rgba(0,242,254,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300`
  - Primary button: `bg-gradient-to-br from-primary to-[#d0003c] text-white shadow-[0_4px_16px_var(--color-primary-glow)] hover:shadow-[0_6px_24px_rgba(255,0,80,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200`
  - Hover: Glow intensifies, scale shifts slightly, and transitions are always smooth.

### Dynamic Backgrounds (Shooting Stars)
The login screen features an active background with shooting stars sliding diagonally down:
- **Star element**: A diagonal line with a linear gradient from its solid color (pink, cyan, white, purple) to fully transparent, suggesting a tail.
- **Animation**: The star rotates by `-45deg` and translates along its local X-axis, creating a head-first slide down and left across the screen using Tailwind's `animate-shoot-diagonal`.
- **Variation**: Stars are generated dynamically with random top/right coordinates, widths, animation delays, durations, and neon colors.

### Typography
- **Headers & Titles**: Space Grotesk (`font-header`).
- **Body & Controls**: Inter (`font-body`).
- **Combo badging**: Rubik Mono One (`font-combo`).

---

## Coding Guidelines for UI Components
1. **Consistency**: Always use Tailwind design tokens or custom utility classes for colors, radius values, and transitions. Do not hardcode raw HEX or RGB values in components.
2. **Animation**: Ensure all interactive controls (buttons, links, select controls) use smooth transitions (`transition-all duration-200` or equivalent).
3. **No Placeholders**: Never use placeholder text or mock assets in final user-facing elements.
