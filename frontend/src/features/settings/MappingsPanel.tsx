'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { GiftMappings, GiftMapping } from '@/types';
import { EFFECT_OPTIONS, SOUND_OPTIONS } from '@/lib/constants';

interface MappingsPanelProps {
  mappings: GiftMappings;
  onAddMapping: (giftName: string, mapping: GiftMapping) => void;
  onDeleteMapping: (giftName: string) => void;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function MappingsPanel({ mappings, onAddMapping, onDeleteMapping }: MappingsPanelProps) {
  const [giftName, setGiftName] = useState('');
  const [effect, setEffect] = useState('rose-petal');
  const [sound, setSound] = useState('rose');
  const [videoFile, setVideoFile] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = giftName.trim().toLowerCase();
    if (!name) return;

    const mapping: GiftMapping = {
      effect,
      sound,
      videoUrl: effect === 'video' ? videoFile.trim() : undefined,
    };

    onAddMapping(name, mapping);
    setGiftName('');
    setVideoFile('');
    setEffect('rose-petal');
  };

  return (
    <GlassCard
      className="panel-mappings"
      headerIcon={<i className="fa-solid fa-gift" />}
      headerTitle="Gift Effect Mappings"
    >
      <p className="card-desc">Assign specific visual effects and sounds to TikTok gifts.</p>

      <form onSubmit={handleSubmit} className="mapping-form">
        <div className="mapping-row-form">
          <input
            type="text"
            value={giftName}
            onChange={(e) => setGiftName(e.target.value)}
            placeholder="Gift Name (e.g. Rose, Hoa hồng)"
            required
            className="select-control mapping-input-name"
          />
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
            className="select-control"
          >
            {EFFECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {effect === 'video' && (
            <input
              type="text"
              value={videoFile}
              onChange={(e) => setVideoFile(e.target.value)}
              placeholder="video_name.mp4"
              required
              className="select-control mapping-input-video"
            />
          )}
          <select
            value={sound}
            onChange={(e) => setSound(e.target.value)}
            className="select-control"
          >
            {SOUND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary mapping-add-btn">
            <i className="fa-solid fa-plus" />
          </button>
        </div>
      </form>

      <div className="mapping-list">
        {Object.entries(mappings).map(([name, mapping]) => (
          <div key={name} className="mapping-item">
            <div className="mapping-item-details">
              <span className="mapping-item-name">{escapeHtml(name)}</span>
              <span className="mapping-item-effects">
                Effect: {mapping.effect === 'video' ? `Video (${mapping.videoUrl || ''})` : mapping.effect} | Sound: {mapping.sound}
              </span>
            </div>
            <button
              type="button"
              className="btn-small-danger"
              onClick={() => onDeleteMapping(name)}
            >
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
