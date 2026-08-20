# Frontend Architecture Rules — Feature-Based & Redux Setup

This document defines the strict directory structure, file naming conventions, and state management patterns for the frontend of the TikTok Live Event & Effect Mapping system.

---

## 1. Directory Structure (Feature-Based Layers)

The codebase is organized by **Features** inside the `src/features/` folder to promote encapsulation, modularity, and scalability.

```
src/
├── app/                  # Next.js App Router (Routing pages only)
├── components/           # Generic shared UI/Layout elements
│   ├── layout/           # Shared layout components (e.g., header, background-glows)
│   └── ui/               # Atomic custom UI controls (e.g., button, glass-card, toggle)
├── features/             # Feature domains (encapsulating components, stores, engines, etc.)
│   ├── admin-dashboard/  # Admin-only dashboard feature
│   │   ├── components/   # Panel components (connection, logs, settings, mappings, etc.)
│   │   └── store/        # Dashboard slice and actions (dashboard-slice.ts)
│   ├── auth/             # Authentication feature domain
│   │   ├── components/   # Auth forms (login-form, register-form, shooting-stars)
│   │   └── store/        # Auth slice and actions (auth-slice.ts)
│   └── overlay/          # Stream overlay visual canvas and engines
│       ├── components/   # Canvas component (overlay-canvas.tsx)
│       ├── audio/        # Audio engine and chime synthesizer
│       └── particles/    # Particle animation physics
├── hooks/                # Shared global custom hooks (e.g., use-websocket)
├── lib/                  # Shared global helper constants and functions
├── store/                # Central Redux Store configurations and typed hooks (no slices)
└── types/                # Shared TypeScript models and interfaces
```

### Architectural Constraints
- **Self-Containment**: A feature folder under `src/features/` must encapsulate all components, local store slices, types, and logic specific to that feature domain.
- **Component Localization**: Feature-specific UI files must reside within the `components/` subdirectory inside that feature (e.g., `src/features/admin-dashboard/components/connection-panel.tsx`).
- **Generic vs Feature UI**: Only completely generic elements (e.g., a simple custom select dropdown, a checkbox toggle) should reside in `src/components/ui/`. If a component contains feature-specific logic or Redux hooks, it must live in the corresponding `src/features/[feature-name]/components/` directory.
- **Cross-Feature Imports**: Features should ideally avoid deep imports from other features. Use shared services (like Redux actions or hooks) for cross-feature communication.

---

## 2. File Naming Convention (kebab-case)

To ensure consistency across Windows, Mac, and Linux environments, the project strictly uses **kebab-case** for file naming.

### Rules
- All file names (TypeScript files, components, styles, helpers, hooks) must be written in lowercase with dashes separating words.
  - *Correct*: `connection-panel.tsx`, `sound-engine.ts`, `use-websocket.ts`, `glass-card.tsx`.
  - *Incorrect*: `ConnectionPanel.tsx`, `SoundEngine.ts`, `useWebSocket.ts`, `GlassCard.tsx`.
- **Exceptions**: Next.js special files (`page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico`) must follow Next.js official naming standards.

---

## 3. State Management Patterns (Redux + Custom Hooks)

The project leverages Redux Toolkit (`@reduxjs/toolkit`) for centralized, predictable state management.

### Store Architecture
- **Feature-Local Slices**: Slices must be defined locally inside their respective feature folder under `store/` (e.g., `src/features/auth/store/auth-slice.ts`, `src/features/admin-dashboard/store/dashboard-slice.ts`). Creating global slices under `src/store/slices/` is prohibited.
- The global store combines these local slices in `src/store/store.ts`.
- Global typed hooks (`useAppDispatch`, `useAppSelector`) reside in `src/store/hooks.ts` and are provided globally in `src/app/providers.tsx`.
- **Use Redux For**: Shared stream status, central configurations, current user profile, logs, and WS connection metadata.
- **Use Local State (`useState`) For**: Non-shared UI states, such as input values during drafting, open/closed modal states, password visibility toggles, and animation triggers.

### Custom React-Redux Hooks
Always use the typed custom hooks defined in `src/store/hooks.ts` to access store dispatchers and selectors:
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// To dispatch an action
const dispatch = useAppDispatch();
dispatch(clearLogs());

// To select state
const logs = useAppSelector((state) => state.dashboard.logs);
```

---

## 4. UI Design System Guidelines (TailwindCSS v4.0)

All frontend styles must adhere to the Obsidian Dark Theme styling defined in `AGENTS.md` and `globals.css`.
- The application uses **TailwindCSS v4.0** for utility-first styling.
- Custom colors, typography, border-radius values, and keyframe animations are defined in the `@theme` block in [globals.css](file:///f:/github/tiktok-effect/frontend/src/app/globals.css).
- Standard Tailwind class names (e.g. `bg-bg-dark`, `bg-bg-surface`, `bg-bg-card`, `text-primary`, `border-border-color`) must be used for consistency instead of custom raw CSS classes.
- Compound or dynamic classes used by inline overlays are defined under standard CSS selectors in `globals.css` using `@apply`.
