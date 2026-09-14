---
name: feature-first-ui-builder
description: Build or refactor a frontend feature in this repository while preserving its feature-first architecture and premium Obsidian Dark UI. Use when adding a dashboard panel, OBS overlay designer, modal, catalog workflow, settings UI, or other user-facing React/Next.js functionality.
---

# Feature-First UI Builder

## Workflow

1. Read `AGENTS.md` and inspect the nearest feature before editing.
2. Place new code in one feature: `features/<feature>/components`, `hooks`, and optional `lib`.
3. Export cross-feature imports only from `features/<feature>/index.ts`; do not import another feature's internal files.
4. Keep page/dashboard components as orchestrators. Move API/state work to hooks and reusable visual blocks to components.
5. Use dynamic imports for modal, designer, canvas, or preview code not needed on first render.
6. Preserve the Obsidian Dark design system: CSS variables, glass cards, Space Grotesk headings, Inter body text, transitions, focus states, and no mock user-facing content.
7. For realtime/canvas work, keep per-frame data in refs and `requestAnimationFrame`; do not update React state for each event or frame.
8. Validate with `npm run lint`; run the production build when network-dependent fonts are available.

## Placement rules

- Put OBS render engines, canvases, sockets and media queues in `features/overlay`.
- Put configuration panels in `features/overlay-designers/<name>`.
- Put dashboard overview components in `features/dashboard`.
- Put domain UI such as gifts in its own feature, for example `features/gift-catalog`.
- Use `components/` for rendering, `hooks/` for lifecycle/API state, and `lib/` for pure helpers, geometry, caches, or transforms.

## Definition of done

- Feature has a clear public API when used by another feature.
- Loading, empty, error, and permission states are explicit where data is remote.
- Interactive controls are keyboard-safe and retain theme focus styles.
- No new lint warnings or direct imports from old/deprecated feature paths.
