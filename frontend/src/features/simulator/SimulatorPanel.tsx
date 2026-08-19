'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { GiftMappings } from '@/types';

interface SimulatorPanelProps {
  mappings: GiftMappings;
  onSimulateGift: (giftName: string, diamondCount: number, repeatCount: number) => void;
  onSimulateRoseCombo: (totalSteps: number) => void;
  onSimulateMappedGift: (giftName: string) => void;
  onSimulateMappedGiftCombo: (giftName: string, totalSteps: number) => void;
  onSimulateChat: () => void;
  selectedMappedGift: string;
  onSelectedMappedGiftChange: (name: string) => void;
  isAdmin?: boolean;
}

export default function SimulatorPanel({
  mappings,
  onSimulateGift,
  onSimulateRoseCombo,
  onSimulateMappedGift,
  onSimulateMappedGiftCombo,
  onSimulateChat,
  selectedMappedGift,
  onSelectedMappedGiftChange,
  isAdmin = true,
}: SimulatorPanelProps) {
  const mappingKeys = Object.keys(mappings);

  return (
    <GlassCard
      className="panel-simulator"
      headerIcon={<i className="fa-solid fa-gamepad" />}
      headerTitle="Event Simulator (Test Overlay)"
    >
      <div style={{ pointerEvents: isAdmin ? 'auto' : 'none', opacity: isAdmin ? 1 : 0.75 }}>
        <div className="simulator-grid">
          {/* Rose Gift */}
          <div className="sim-card">
            <h3>
              <img
                src="https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png"
                alt="Rose"
                className="sim-gift-icon"
              />
              Rose Gift (Streak)
            </h3>
            <p className="sim-card-desc">Simulate a sequence of roses. Test combo stacking!</p>
            <div className="sim-btn-row">
              <Button variant="sim" onClick={() => onSimulateGift('Rose', 1, 1)}>
                <i className="fa-solid fa-plus" /> Send x1
              </Button>
              <Button variant="sim-accent" onClick={() => onSimulateRoseCombo(10)}>
                <i className="fa-solid fa-bolt" /> Combo x10
              </Button>
            </div>
          </div>

          {/* Galaxy Gift */}
          <div className="sim-card">
            <h3>
              <i className="fa-solid fa-user-astronaut sim-gift-icon-fa" />
              Galaxy Gift
            </h3>
            <p className="sim-card-desc">Simulate a premium 1000-diamond gift. Triggers full screen effects!</p>
            <Button variant="sim-special" fullWidth onClick={() => onSimulateGift('Galaxy', 1000, 1)}>
              <i className="fa-solid fa-star" /> Send Galaxy
            </Button>
          </div>

          {/* Mapped Gift Tester */}
          <div className="sim-card">
            <h3>
              <i className="fa-solid fa-gift sim-gift-icon-fa" />
              Mapped Gift Tester
            </h3>
            <p className="sim-card-desc">Simulate any custom gift mapping with its assigned video/effect.</p>
            <div className="sim-mapped-controls">
              <select
                value={selectedMappedGift}
                onChange={(e) => onSelectedMappedGiftChange(e.target.value)}
                className="select-control sim-mapped-select"
                id="sim-mapped-select"
              >
                {mappingKeys.map((name) => (
                  <option key={name} value={name}>{name.toUpperCase()}</option>
                ))}
              </select>
              <div className="sim-btn-row">
                <Button variant="sim" onClick={() => onSimulateMappedGift(selectedMappedGift)}>
                  Send x1
                </Button>
                <Button variant="sim-accent" onClick={() => onSimulateMappedGiftCombo(selectedMappedGift, 5)}>
                  Combo x5
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Message */}
          <div className="sim-card">
            <h3>
              <i className="fa-solid fa-comment sim-gift-icon-fa" />
              Chat Message
            </h3>
            <p className="sim-card-desc">Simulate a mock viewer chat comment in the feed.</p>
            <Button variant="sim" fullWidth onClick={onSimulateChat}>
              <i className="fa-solid fa-paper-plane" /> Send Chat Comment
            </Button>
          </div>
        </div>
      </div>
      {!isAdmin && (
        <div className="view-only-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '15px' }}>
          <i className="fa-solid fa-lock" /> Admin privileges required to run simulations.
        </div>
      )}
    </GlassCard>
  );
}
