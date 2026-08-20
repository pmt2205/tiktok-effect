import React, { useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { GiftMapping } from '@/types';
import { EFFECT_OPTIONS } from '@/lib/constants';
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';

interface MappingsPanelProps {
  onAddMapping: (giftName: string, mapping: GiftMapping) => void;
  onDeleteMapping: (giftName: string) => void;
}

interface AvailableGift {
  id: string | number;
  name: string;
  diamondCount: number;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function MappingsPanel({ onAddMapping, onDeleteMapping }: MappingsPanelProps) {
  const toast = useToast();
  const mappings = useAppSelector((state) => state.dashboard.mappings);
  const availableGifts = (useAppSelector((state) => state.dashboard.availableGifts) || []) as AvailableGift[];
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');

  const [giftName, setGiftName] = useState('');
  const [effect, setEffect] = useState('rose-petal');
  const [videoFile, setVideoFile] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = giftName.trim().toLowerCase();
    if (!name) return;

    const mapping: GiftMapping = {
      effect,
      videoUrl: effect === 'video' ? videoFile.trim() : undefined,
    };

    onAddMapping(name, mapping);
    toast.success(`Successfully mapped "${name}" effect!`);
    setGiftName('');
    setVideoFile('');
    setEffect('rose-petal');
  };

  const handleDelete = (name: string) => {
    onDeleteMapping(name);
    toast.info(`Deleted mapping for "${name}".`);
  };

  return (
    <GlassCard
      headerIcon={<i className="fa-solid fa-gift" />}
      headerTitle="Gift Effect Mappings"
    >
      <p className="text-[0.88rem] text-text-muted mb-4 leading-normal">Assign specific visual effects and sounds to TikTok gifts.</p>

      {isAdmin ? (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-3.5 flex-wrap items-end">
            <input
              type="text"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              placeholder="Gift Name (e.g. Rose)"
              required
              list="available-gifts-list"
              className="flex-[1.5] min-w-[140px] bg-bg-input border border-border-color rounded-sm px-3 py-2 text-white font-body text-[0.88rem] outline-none focus:border-secondary"
            />
            <datalist id="available-gifts-list">
              {availableGifts.map((gift) => (
                <option key={gift.id} value={gift.name}>
                  {gift.name} ({gift.diamondCount} coins)
                </option>
              ))}
            </datalist>
            <Select
              value={effect}
              options={EFFECT_OPTIONS}
              onChange={setEffect}
              className="flex-1 min-w-[120px] mb-0"
            />
            {effect === 'video' && (
              <input
                type="text"
                value={videoFile}
                onChange={(e) => setVideoFile(e.target.value)}
                placeholder="video_name.mp4"
                required
                className="flex-[1.2] min-w-[120px] bg-bg-input border border-border-color rounded-sm px-3 py-2 text-white font-body text-[0.88rem] outline-none focus:border-secondary h-[42px]"
              />
            )}
            <Button type="submit" className="px-3.5 py-2.5 rounded-sm shrink-0 mb-5">
              <i className="fa-solid fa-plus" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="view-only-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '15px' }}>
          <i className="fa-solid fa-lock" /> Admin privileges required to manage mappings.
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto mt-2.5 pr-1 custom-scrollbar">
        {Object.entries(mappings).map(([name, mapping]) => (
          <div key={name} className="flex justify-between items-center bg-black/20 p-2.5 px-3.5 rounded-sm border border-border-color transition-colors duration-150 hover:border-white/15">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-secondary capitalize text-[0.9rem]">{escapeHtml(name)}</span>
              <span className="text-[0.75rem] text-text-muted font-body">
                Effect: {mapping.effect === 'video' ? `Video (${mapping.videoUrl || ''})` : mapping.effect}
              </span>
            </div>
            {isAdmin && (
              <Button
                type="button"
                variant="small-danger"
                onClick={() => handleDelete(name)}
              >
                <i className="fa-solid fa-trash" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
