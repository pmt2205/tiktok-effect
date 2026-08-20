'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import Slider from '@/components/ui/slider';
import Select from '@/components/ui/select';
import { OverlaySettings } from '@/types';
import { THEME_OPTIONS } from '@/lib/constants';
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';

const DENSITY_OPTIONS = [
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
];

interface SettingsPanelProps {
  onSave: (settings: OverlaySettings) => void;
}

export default function SettingsPanel({ onSave }: SettingsPanelProps) {
  const toast = useToast();
  const currentSettings = useAppSelector((state) => state.dashboard.settings);
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');

  const [duration, setDuration] = useState(4);
  const [density, setDensity] = useState<number>(2);
  const [theme, setTheme] = useState('obsidian-dark');

  useEffect(() => {
    if (currentSettings) {
      const { duration: dur, density: dens, theme: th } = currentSettings;
      const timer = setTimeout(() => {
        setDuration(dur);
        setDensity(dens);
        setTheme(th);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Permission denied: Admin role required to save configurations.');
      return;
    }
    const settings: OverlaySettings = {
      duration,
      density,
      theme,
    };
    onSave(settings);
    toast.success('Overlay configurations saved successfully!');
  };

  return (
    <GlassCard
      headerIcon={<i className="fa-solid fa-sliders" />}
      headerTitle="Overlay Configurations"
    >
      <form onSubmit={handleSubmit}>

        <Slider
          label="Banner Duration"
          value={duration}
          min={1}
          max={15}
          step={1}
          displayValue={`${duration}s`}
          onChange={setDuration}
          disabled={!isAdmin}
          id="duration-slider"
        />

        <Select
          label="Particle Density"
          value={density.toString()}
          options={DENSITY_OPTIONS}
          onChange={(val) => setDensity(parseInt(val, 10))}
          disabled={!isAdmin}
          id="density-select"
        />

        <Select
          label="Banner Theme Layout"
          value={theme}
          options={THEME_OPTIONS}
          onChange={setTheme}
          disabled={!isAdmin}
          id="theme-select"
        />

        {isAdmin ? (
          <Button type="submit" variant="gradient" fullWidth id="btn-save-settings">
            <i className="fa-solid fa-floppy-disk" /> Apply Configurations
          </Button>
        ) : (
          <div className="view-only-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            <i className="fa-solid fa-lock" /> Admin privileges required to edit settings.
          </div>
        )}
      </form>
    </GlassCard>
  );
}
