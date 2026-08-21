'use client';

import React from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedMappedGift } from '@/features/admin-dashboard/store/dashboard-slice';

interface SimulatorPanelProps {
  onSimulateGift: (giftName: string, diamondCount: number, repeatCount: number) => void;
  onSimulateRoseCombo: (totalSteps: number) => void;
  onSimulateMappedGift: (giftName: string) => void;
  onSimulateMappedGiftCombo: (giftName: string, totalSteps: number) => void;
  onSimulateChat: () => void;
}

export default function SimulatorPanel({
  onSimulateGift,
  onSimulateRoseCombo,
  onSimulateMappedGift,
  onSimulateMappedGiftCombo,
  onSimulateChat,
}: SimulatorPanelProps) {
  const dispatch = useAppDispatch();
  const mappings = useAppSelector((state) => state.dashboard.mappings) || {};
  const selectedGift = useAppSelector((state) => state.dashboard.selectedMappedGift) || '';
  const isConnected = useAppSelector((state) => state.dashboard.status.status === 'connected');
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');

  const mappedKeys = Object.keys(mappings);

  const handleSelectGift = (val: string) => {
    dispatch(setSelectedMappedGift(val));
  };

  const giftOptions = mappedKeys.length > 0 
    ? mappedKeys.map(name => ({ value: name, label: name }))
    : [{ value: '', label: 'No mapped gifts' }];

  return (
    <GlassCard
      headerIcon={<i className="fa-solid fa-gamepad" />}
      headerTitle="Live Simulator Console"
    >
      <p className="text-[0.88rem] text-text-muted mb-4 leading-normal">Simulate live stream triggers locally to verify your layout and configurations.</p>

      {isAdmin ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Basic Interaction Simulation */}
          <div className="bg-black/18 border border-border-color rounded-md p-5 flex flex-col gap-3.5 transition-all duration-200 hover:border-white/12 hover:bg-black/25">
            <span className="font-header text-[0.92rem] font-semibold flex items-center gap-2 text-text-main">Quick Actions</span>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button onClick={() => onSimulateGift('Rose', 1, 1)} id="btn-sim-rose" className="flex-1">
                  🌹 Rose (x1)
                </Button>
                <Button onClick={() => onSimulateRoseCombo(5)} id="btn-sim-rose-combo" className="flex-1">
                  🌹 Rose Combo (x5)
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => onSimulateGift('TikTok', 1, 1)} id="btn-sim-tiktok" className="flex-1">
                  🎵 TikTok Logo (x1)
                </Button>
                <Button onClick={() => onSimulateChat()} id="btn-sim-chat" className="flex-1">
                  💬 Mock Chat Message
                </Button>
              </div>
            </div>
          </div>

          {/* Mapped Gift Simulation */}
          <div className="bg-black/18 border border-border-color rounded-md p-5 flex flex-col gap-3.5 transition-all duration-200 hover:border-white/12 hover:bg-black/25">
            <span className="font-header text-[0.92rem] font-semibold flex items-center gap-2 text-text-main">Mapped Gift Simulation</span>
            <div className="flex flex-col gap-2 w-full">
              <Select
                value={selectedGift}
                options={giftOptions}
                onChange={handleSelectGift}
                disabled={mappedKeys.length === 0}
                className="w-full mb-0"
              />
              <div className="flex gap-2 mt-1">
                <Button
                  onClick={() => onSimulateMappedGift(selectedGift)}
                  disabled={!selectedGift}
                  id="btn-sim-mapped"
                  className="flex-1"
                >
                  🎁 Trigger Single
                </Button>
                <Button
                  onClick={() => onSimulateMappedGiftCombo(selectedGift, 5)}
                  disabled={!selectedGift}
                  id="btn-sim-mapped-combo"
                  className="flex-1"
                >
                  🎁 Trigger Combo (x5)
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="view-only-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          <i className="fa-solid fa-lock" /> Admin privileges required to simulate events.
        </div>
      )}

      {!isConnected && isAdmin && (
        <div className="bg-danger/6 border border-danger/18 text-[#f87171] px-3.5 py-2.5 rounded-md text-[0.85rem] mt-4 text-center">
          <i className="fa-solid fa-triangle-exclamation mr-1.5" /> Please connect to a TikTok stream before simulating.
        </div>
      )}
    </GlassCard>
  );
}
