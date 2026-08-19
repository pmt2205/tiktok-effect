'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Slider from '@/components/ui/Slider';
import Select from '@/components/ui/Select';
import { OverlaySettings } from '@/types';
import { DENSITY_LEVELS, THEME_OPTIONS } from '@/lib/constants';

interface SettingsPanelProps {
  settings: OverlaySettings;
  onSettingsChange: (settings: OverlaySettings) => void;
  onSave: () => void;
  isAdmin?: boolean;
}

export default function SettingsPanel({ settings, onSettingsChange, onSave, isAdmin = true }: SettingsPanelProps) {
  const updateField = <K extends keyof OverlaySettings>(field: K, value: OverlaySettings[K]) => {
    if (!isAdmin) return;
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <GlassCard
      className="panel-settings"
      headerIcon={<i className="fa-solid fa-sliders" />}
      headerTitle="Overlay Settings"
    >
      <div style={{ pointerEvents: isAdmin ? 'auto' : 'none', opacity: isAdmin ? 1 : 0.75 }}>
        <div className="settings-group">
          <Toggle
            label="Play Sound Notifications"
            checked={settings.soundEnabled}
            onChange={(checked) => updateField('soundEnabled', checked)}
            id="setting-sound"
          />
        </div>

        <Slider
          label="Display Duration (seconds)"
          value={settings.duration}
          min={2}
          max={15}
          displayValue={settings.duration.toString()}
          onChange={(val) => updateField('duration', val)}
          id="setting-duration"
        />

        <Slider
          label="Rose Particle Density"
          value={settings.density}
          min={1}
          max={3}
          displayValue={DENSITY_LEVELS[settings.density - 1]}
          onChange={(val) => updateField('density', val)}
          id="setting-density"
        />

        <Select
          label="Gift Card Animation Theme"
          value={settings.theme}
          options={THEME_OPTIONS}
          onChange={(val) => updateField('theme', val)}
          id="setting-theme"
        />
      </div>

      {isAdmin ? (
        <Button variant="secondary" fullWidth onClick={onSave} id="btn-save-settings">
          <i className="fa-solid fa-save" /> Apply Settings
        </Button>
      ) : (
        <div className="view-only-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
          <i className="fa-solid fa-lock" /> Admin privileges required to edit settings.
        </div>
      )}
    </GlassCard>
  );
}
