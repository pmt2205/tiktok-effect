'use client';

import { useCallback, useEffect, useRef } from 'react';

interface OverlayPreviewControlsProps {
  x: number;
  y: number;
  scale: number;
  settingKeys: { x: string; y: string; scale: string };
  target: 'menu' | 'jar' | 'tree' | 'topGifter' | 'likeLeaderboard';
  label: string;
  disabled?: boolean;
  minScale?: number;
  maxScale?: number;
  onChange: (next: { x: number; y: number; scale: number }) => void;
  onCommit: (next: { x: number; y: number; scale: number }) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function OverlayPreviewControls({
  x,
  y,
  scale,
  settingKeys,
  target,
  label,
  disabled,
  minScale = 0.5,
  maxScale = 2.5,
  onChange,
  onCommit,
}: OverlayPreviewControlsProps) {
  const valueRef = useRef({ x, y, scale });
  const controlRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const { x: xSetting, y: ySetting, scale: scaleSetting } = settingKeys;

  useEffect(() => {
    valueRef.current = { x, y, scale };
  }, [x, y, scale]);

  const constrainToViewport = useCallback((
    next: { x: number; y: number; scale: number },
    layer: HTMLElement,
    control: HTMLElement,
    renderedScale: number,
    fixedBaseSize?: { width: number; height: number },
  ) => {
    const layerBounds = layer.getBoundingClientRect();
    const controlBounds = control.getBoundingClientRect();
    const safeRenderedScale = Math.max(renderedScale, 0.01);
    const baseWidth = fixedBaseSize?.width ?? controlBounds.width / safeRenderedScale;
    const baseHeight = fixedBaseSize?.height ?? controlBounds.height / safeRenderedScale;
    const fitScale = Math.min(layerBounds.width / baseWidth, layerBounds.height / baseHeight);
    const constrainedScale = clamp(next.scale, minScale, Math.min(maxScale, fitScale));
    const widthPercent = ((baseWidth * constrainedScale) / layerBounds.width) * 100;
    const heightPercent = ((baseHeight * constrainedScale) / layerBounds.height) * 100;

    return {
      x: clamp(next.x, 0, Math.max(0, 100 - widthPercent)),
      y: clamp(next.y, 0, Math.max(0, 100 - heightPercent)),
      scale: constrainedScale,
    };
  }, [maxScale, minScale]);

  const previewImmediately = useCallback((layer: HTMLElement | null, next: { x: number; y: number; scale: number }) => {
    const iframe = layer?.parentElement?.querySelector('iframe');
    const control = controlRef.current;
    if (control) {
      control.style.left = `${next.x}%`;
      control.style.top = `${next.y}%`;
    }
    try {
      const previewTarget = iframe?.contentDocument?.querySelector<HTMLElement>(`[data-overlay-preview-target="${target}"]`);
      if (previewTarget) {
        previewTarget.style.left = `${next.x}%`;
        previewTarget.style.top = `${next.y}%`;
        if (target === 'tree') previewTarget.style.setProperty('--tree-scale', String(next.scale));
        else previewTarget.style.transform = `scale(${next.scale})`;
      }
    } catch {
      // postMessage below remains the fallback when direct iframe access is unavailable.
    }
    iframe?.contentWindow?.postMessage(
      {
        type: 'overlay-preview-settings',
        settings: {
          [xSetting]: next.x,
          [ySetting]: next.y,
          [scaleSetting]: next.scale,
        },
      },
      window.location.origin,
    );
  }, [scaleSetting, target, xSetting, ySetting]);

  useEffect(() => {
    const control = controlRef.current;
    const layer = control?.parentElement;
    if (!control || !layer) return;

    const recoverIfOutside = () => {
      if (interactingRef.current || layer.dataset.previewBoundsReady !== 'true') return;
      const current = valueRef.current;
      const recovered = constrainToViewport(current, layer, control, current.scale);
      const changed = Math.abs(recovered.x - current.x) > 0.01
        || Math.abs(recovered.y - current.y) > 0.01
        || Math.abs(recovered.scale - current.scale) > 0.01;
      if (!changed) return;
      valueRef.current = recovered;
      previewImmediately(layer, recovered);
      onChange(recovered);
      onCommit(recovered);
    };

    const resizeObserver = new ResizeObserver(recoverIfOutside);
    const mutationObserver = new MutationObserver(recoverIfOutside);
    resizeObserver.observe(layer);
    resizeObserver.observe(control);
    mutationObserver.observe(layer, { attributes: true, attributeFilter: ['data-preview-bounds-ready', 'style'] });
    recoverIfOutside();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [constrainToViewport, onChange, onCommit, previewImmediately]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    interactingRef.current = true;
    valueRef.current = { x, y, scale };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const layer = event.currentTarget.parentElement;
    if (!layer) return;
    const bounds = layer.getBoundingClientRect();
    const control = event.currentTarget;
    const start = { clientX: event.clientX, clientY: event.clientY, x, y };

    const move = (moveEvent: PointerEvent) => {
      const next = constrainToViewport({
        x: start.x + ((moveEvent.clientX - start.clientX) / bounds.width) * 100,
        y: start.y + ((moveEvent.clientY - start.clientY) / bounds.height) * 100,
        scale: valueRef.current.scale,
      }, layer, control, scale);
      valueRef.current = next;
      previewImmediately(layer, next);
      onChange(next);
    };
    const end = () => {
      interactingRef.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      onCommit(valueRef.current);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    interactingRef.current = true;
    valueRef.current = { x, y, scale };
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const layer = event.currentTarget.parentElement?.parentElement;
    const control = event.currentTarget.parentElement;
    if (!layer || !control) {
      interactingRef.current = false;
      return;
    }
    const controlBounds = control.getBoundingClientRect();
    const baseSize = {
      width: controlBounds.width / Math.max(scale, 0.01),
      height: controlBounds.height / Math.max(scale, 0.01),
    };
    const start = { clientY: event.clientY, scale };
    const move = (moveEvent: PointerEvent) => {
      const next = constrainToViewport({
        ...valueRef.current,
        scale: clamp(start.scale + (moveEvent.clientY - start.clientY) / 120, minScale, maxScale),
      }, layer, control, start.scale, baseSize);
      valueRef.current = next;
      previewImmediately(layer, next);
      onChange(next);
    };
    const end = () => {
      interactingRef.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      onCommit(valueRef.current);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end, { once: true });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = event.shiftKey ? 5 : 1;
    let next = { x, y, scale };
    if (event.key === 'ArrowLeft') next = { ...next, x: clamp(x - step, 0, 100) };
    else if (event.key === 'ArrowRight') next = { ...next, x: clamp(x + step, 0, 100) };
    else if (event.key === 'ArrowUp') next = { ...next, y: clamp(y - step, 0, 100) };
    else if (event.key === 'ArrowDown') next = { ...next, y: clamp(y + step, 0, 100) };
    else if (event.key === '+' || event.key === '=') next = { ...next, scale: clamp(scale + 0.1, minScale, maxScale) };
    else if (event.key === '-') next = { ...next, scale: clamp(scale - 0.1, minScale, maxScale) };
    else return;
    event.preventDefault();
    const layer = event.currentTarget.parentElement;
    if (!layer) return;
    next = constrainToViewport(next, layer, event.currentTarget, scale);
    valueRef.current = next;
    previewImmediately(layer, next);
    onChange(next);
    onCommit(next);
  };

  return (
    <div
      ref={controlRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      onPointerDown={startDrag}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      className={`absolute min-h-16 min-w-20 rounded-lg border-2 border-primary bg-primary/10 shadow-[0_0_16px_var(--color-primary-glow)] outline-none transition-shadow focus:ring-3 focus:ring-primary-glow/40 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
      style={{ left: `${x}%`, top: `${y}%`, width: 'var(--preview-target-width)', height: 'var(--preview-target-height)' }}
    >
      <span className="keep-white absolute -top-6 left-0 whitespace-nowrap rounded bg-primary px-2 py-0.5 text-[0.55rem] font-bold text-white">
        {label} · {scale.toFixed(1)}x
      </span>
      <span className="pointer-events-none absolute inset-0 grid place-items-center text-primary">
        <i className="fa-solid fa-up-down-left-right" />
      </span>
      <button
        type="button"
        aria-label={`${label} - scale`}
        onPointerDown={startResize}
        className="absolute -bottom-2 -right-2 grid h-6 w-6 cursor-nwse-resize place-items-center rounded-md border border-white/30 bg-primary text-[0.6rem] text-white shadow-lg outline-none focus:ring-3 focus:ring-primary-glow/40"
      >
        <i className="fa-solid fa-up-right-and-down-left-from-center" />
      </button>
    </div>
  );
}
