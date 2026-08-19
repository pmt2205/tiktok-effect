# TikTok Live Effect Mapping — UI Styling & Customization Rules

These are the rules and guidelines that must be followed when building, editing, or maintaining the frontend user interface of this project.

## Theme & Visual Aesthetics
The application must maintain a premium **Obsidian Dark Theme** layout. The design features a translucent glassmorphic look with vibrant neon glowing highlights.

### Colors & Gradients
Use the following CSS variables defined in `globals.css` or equivalent:
- **Backgrounds**:
  - Main background: `#07080d` (`--bg-dark`)
  - Surface cards: `#0d0f18` (`--bg-surface`)
  - Glass panels: `rgba(16, 18, 32, 0.55)` (`--bg-card`)
  - Glass hover: `rgba(24, 27, 48, 0.65)` (`--bg-card-hover`)
  - Inputs: `rgba(0, 0, 0, 0.3)` (`--bg-input`)
- **Accent Colors**:
  - Primary (TikTok Pink): `#ff0050` (`--primary`)
  - Primary Glow: `rgba(255, 0, 80, 0.35)` (`--primary-glow`)
  - Secondary (Neon Blue): `#00f2fe` (`--secondary`)
  - Secondary Glow: `rgba(0, 242, 254, 0.25)` (`--secondary-glow`)
- **Borders & Shadows**:
  - Transparent border: `rgba(255, 255, 255, 0.07)` (`--border-color`)
  - Active Glow Border: `rgba(0, 242, 254, 0.15)` (`--border-glow`)
  - Dynamic Glass Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4)`

### Glassmorphic Cards (`.glass-card`)
Every content panel must use a glassmorphism style:
- Backdrop blur: `blur(24px)`
- Border: `1px solid var(--border-color)`
- Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4)`
- Background: `rgba(16, 18, 32, 0.55)`
- On hover, borders should glow subtly and cards lift slightly (`transform: translateY(-1px)`).

### Form Controls & Active States
- **Inputs**: Rounded corners (`var(--radius-md)` or `12px`), dark transparent background (`var(--bg-input)`), and subtle transparent border.
- **Focus state**: When focused, inputs must glow. Draw a border matching `var(--secondary)` and a box-shadow of `0 0 0 3px var(--secondary-glow)`.
- **Buttons**:
  - Primary: Gradient from `#ff0050` to `#d0003c` with shadow `0 4px 16px var(--primary-glow)`.
  - Hover: Glow intensifies and scale lifts slightly.

### Typography
- **Headers & Titles**: Space Grotesk (`var(--font-header)`).
- **Body & Controls**: Inter (`var(--font-body)`).

---

## Coding Guidelines for UI Components
1. **Consistency**: Always use CSS variables for colors, radius values, and transitions. Do not hardcode HEX or RGB values.
2. **Animation**: Ensure all interactive controls (buttons, links, select controls) use smooth transitions (`var(--transition-base)` or `0.25s cubic-bezier(...)`).
3. **No Placeholders**: Never use placeholder text or mock assets in final user-facing elements.
