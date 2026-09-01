'use client';

import React, { useState, useEffect } from 'react';
import { OverlaySettings } from '@/types';
import Select from '@/components/ui/select';
import { useTtsQueue } from '@/features/overlay/hooks/use-tts-queue';

export default function TtsDesignerPanel({
  language = 'vi',
  settings,
  savingSettings,
  onSaveSettings,
  onSimulateEvent,
}: {
  language?: string;
  settings: OverlaySettings;
  savingSettings: boolean;
  onSaveSettings: (updates: Partial<OverlaySettings>) => void;
  onSimulateEvent?: (eventType: string, payload: any) => void;
}) {
  const { voices, isMuted, isSpeaking, queueLength, spokenLogs, speakText, toggleMute, clearQueue } = useTtsQueue(settings);

  // Local form states
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(settings.ttsEnabled !== false);
  const [ttsVoice, setTtsVoice] = useState<string>(settings.ttsVoice || 'auto');
  const [ttsRate, setTtsRate] = useState<number>(settings.ttsRate ?? 1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(settings.ttsPitch ?? 1.0);
  const [ttsVolume, setTtsVolume] = useState<number>(settings.ttsVolume ?? 1.0);
  const [ttsTemplate, setTtsTemplate] = useState<string>(settings.ttsTemplate || '{nickname} nói: {comment}');
  const [ttsMaxChars, setTtsMaxChars] = useState<number>(settings.ttsMaxChars ?? 100);
  const [ttsFilterEmoji, setTtsFilterEmoji] = useState<boolean>(settings.ttsFilterEmoji !== false);
  const [ttsFilterBadWords, setTtsFilterBadWords] = useState<boolean>(settings.ttsFilterBadWords !== false);
  const [testComment, setTestComment] = useState<string>('Chào mừng bạn đến với kênh livestream của tôi!');

  // Sync settings when props change
  useEffect(() => {
    setTtsEnabled(settings.ttsEnabled !== false);
    if (settings.ttsVoice) setTtsVoice(settings.ttsVoice);
    if (settings.ttsRate !== undefined) setTtsRate(settings.ttsRate);
    if (settings.ttsPitch !== undefined) setTtsPitch(settings.ttsPitch);
    if (settings.ttsVolume !== undefined) setTtsVolume(settings.ttsVolume);
    if (settings.ttsTemplate) setTtsTemplate(settings.ttsTemplate);
    if (settings.ttsMaxChars !== undefined) setTtsMaxChars(settings.ttsMaxChars);
    setTtsFilterEmoji(settings.ttsFilterEmoji !== false);
    setTtsFilterBadWords(settings.ttsFilterBadWords !== false);
  }, [settings]);

  const handleToggleTts = (enabled: boolean) => {
    setTtsEnabled(enabled);
    onSaveSettings({ ttsEnabled: enabled });
  };

  const handleVoiceChange = (v: string) => {
    setTtsVoice(v);
    onSaveSettings({ ttsVoice: v });
  };

  const handleRateChange = (val: number) => {
    setTtsRate(val);
    onSaveSettings({ ttsRate: val });
  };

  const handlePitchChange = (val: number) => {
    setTtsPitch(val);
    onSaveSettings({ ttsPitch: val });
  };

  const handleVolumeChange = (val: number) => {
    setTtsVolume(val);
    onSaveSettings({ ttsVolume: val });
  };

  const handleTemplateChange = (val: string) => {
    setTtsTemplate(val);
    onSaveSettings({ ttsTemplate: val });
  };

  const handleFilterEmojiChange = (checked: boolean) => {
    setTtsFilterEmoji(checked);
    onSaveSettings({ ttsFilterEmoji: checked });
  };

  const handleFilterBadWordsChange = (checked: boolean) => {
    setTtsFilterBadWords(checked);
    onSaveSettings({ ttsFilterBadWords: checked });
  };

  const handleMaxCharsChange = (val: number) => {
    setTtsMaxChars(val);
    onSaveSettings({ ttsMaxChars: val });
  };

  const handleTestSpeech = () => {
    const formatted = ttsTemplate.replace('{nickname}', 'Streamer').replace('{comment}', testComment);
    speakText(formatted);
  };

  const handleSimulateChat = () => {
    if (onSimulateEvent) {
      onSimulateEvent('chat', {
        nickname: 'Viewer Thử Nghiệm',
        uniqueId: 'test_viewer_88',
        comment: testComment || 'Bot đọc comment hoạt động tốt quá!',
        profilePictureUrl: 'https://i.pravatar.cc/100',
      });
    }
  };

  // Prepare voice dropdown options
  const voiceOptions = [
    { value: 'google_translate', label: language === 'vi' ? '🔊 Chị Google (Google Translate Chính Chủ)' : '🔊 Chị Google (Google Translate Official)' },
    { value: 'auto', label: language === 'vi' ? '🤖 Tự động chọn (Trình duyệt Tiếng Việt)' : '🤖 Auto Select (Browser Vietnamese)' },
    ...voices.map((v) => ({
      value: v.voiceURI,
      label: `${v.name} (${v.lang})`,
    })),
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.4s_ease-out]">
      {/* Top Banner & Quick Controls */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 backdrop-blur-[24px] glass-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 hover:border-border-glow">
        <div className="flex flex-col gap-1 select-none">
          <div className="flex items-center gap-3">
            <h3 className="font-header text-[1.2rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
              <i className="fa-solid fa-volume-high text-secondary animate-pulse" />
              <span>{language === 'vi' ? 'Cấu Hình Bot Đọc Comment (TTS AI)' : 'AI Text-to-Speech Comment Bot'}</span>
            </h3>
            {isSpeaking && (
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[0.7rem] font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                {language === 'vi' ? 'Đang đọc...' : 'Speaking...'}
              </span>
            )}
          </div>
          <p className="text-[0.8rem] text-text-muted">
            {language === 'vi'
              ? 'Tự động đọc comment người xem trên livestream bằng giọng AI Tiếng Việt tự nhiên, hàng chờ không đọc đè.'
              : 'Read viewer live comments automatically with natural Vietnamese AI Speech & anti-overlap queue.'}
          </p>
        </div>

        {/* Quick Streamer Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {queueLength > 0 && (
            <span className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[0.75rem] font-bold">
              {queueLength} {language === 'vi' ? 'comment chờ' : 'queued'}
            </span>
          )}

          <button
            type="button"
            onClick={toggleMute}
            className={`px-4 py-2 rounded-xl text-[0.8rem] font-bold transition-all duration-200 cursor-pointer outline-none flex items-center gap-2 active:scale-[0.97] ${
              isMuted
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-secondary/10 border border-secondary/30 text-secondary hover:bg-secondary/20'
            }`}
          >
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
            {isMuted
              ? language === 'vi'
                ? 'Đã Tắt Âm (Muted)'
                : 'Muted'
              : language === 'vi'
              ? 'Mute Nhanh'
              : 'Quick Mute'}
          </button>

          {queueLength > 0 && (
            <button
              type="button"
              onClick={clearQueue}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-[0.8rem] font-bold cursor-pointer transition-all active:scale-[0.97]"
              title={language === 'vi' ? 'Xóa hàng chờ đọc' : 'Clear speech queue'}
            >
              <i className="fa-solid fa-trash-can" />
            </button>
          )}
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Voice & Filter Controls */}
        <div className="lg:col-span-2 bg-bg-card border border-border-color rounded-2xl p-6 backdrop-blur-[24px] glass-shadow flex flex-col gap-6">
          <div className="flex justify-between items-center select-none border-b border-border-color/30 pb-4">
            <h4 className="font-header text-[1rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
              <i className="fa-solid fa-sliders text-secondary" />
              {language === 'vi' ? 'Tùy chỉnh Giọng đọc & Bộ lọc' : 'Voice & Filter Settings'}
            </h4>

            {/* Master Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => handleToggleTts(e.target.checked)}
                className="peer sr-only"
                disabled={savingSettings}
              />
              <span className="w-11 h-[22px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[16px] after:h-[16px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:shadow-[0_0_10px_var(--secondary-glow)] peer-checked:after:translate-x-[22px] peer-disabled:opacity-40" />
            </label>
          </div>

          {/* Voice Selector */}
          <div className="flex flex-col gap-2">
            <Select
              label={language === 'vi' ? 'Chọn Giọng đọc (Voice):' : 'Speech Voice Engine:'}
              value={ttsVoice}
              options={voiceOptions}
              onChange={handleVoiceChange}
              disabled={!ttsEnabled || savingSettings}
              className="mb-0"
            />
            <p className="text-[0.72rem] text-text-muted italic">
              {language === 'vi'
                ? '*Hệ thống tự động lưu cài đặt ngay lập tức khi bạn thay đổi các tùy chọn.'
                : '*Settings are saved automatically on change.'}
            </p>
          </div>

          {/* Voice Sliders (Speed, Pitch, Volume) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-b border-border-color/20 py-4">
            {/* Speed / Rate Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[0.8rem] text-text-secondary font-bold select-none">
                  {language === 'vi' ? 'Tốc độ đọc:' : 'Rate / Speed:'}
                </label>
                <span className="text-[0.78rem] font-mono font-bold text-secondary">{ttsRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={ttsRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                disabled={!ttsEnabled || savingSettings}
                className="w-full accent-secondary cursor-pointer bg-bg-input rounded-lg h-2"
              />
            </div>

            {/* Pitch Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[0.8rem] text-text-secondary font-bold select-none">
                  {language === 'vi' ? 'Tông giọng (Pitch):' : 'Pitch Tone:'}
                </label>
                <span className="text-[0.78rem] font-mono font-bold text-secondary">{ttsPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={ttsPitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                disabled={!ttsEnabled || savingSettings}
                className="w-full accent-secondary cursor-pointer bg-bg-input rounded-lg h-2"
              />
            </div>

            {/* Volume Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[0.8rem] text-text-secondary font-bold select-none">
                  {language === 'vi' ? 'Âm lượng:' : 'Volume:'}
                </label>
                <span className="text-[0.78rem] font-mono font-bold text-secondary">{Math.round(ttsVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={ttsVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                disabled={!ttsEnabled || savingSettings}
                className="w-full accent-secondary cursor-pointer bg-bg-input rounded-lg h-2"
              />
            </div>
          </div>

          {/* Template Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] text-text-secondary font-bold select-none flex items-center justify-between">
              <span>{language === 'vi' ? 'Mẫu câu phát âm (Speech Format Template):' : 'Speech Format Template:'}</span>
              <span className="text-[0.7rem] text-text-muted font-normal">
                {language === 'vi' ? 'Dùng {nickname} và {comment}' : 'Use {nickname} & {comment}'}
              </span>
            </label>
            <input
              type="text"
              value={ttsTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={!ttsEnabled || savingSettings}
              placeholder="{nickname} nói: {comment}"
              className="w-full bg-bg-input border border-border-color rounded-xl px-3.5 py-2.5 text-white font-body text-[0.85rem] outline-none transition-all duration-200 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25 disabled:opacity-50"
            />
          </div>

          {/* Filter Rules Toggles (2A) */}
          <div className="flex flex-col gap-4 border-t border-border-color/20 pt-4">
            <span className="text-[0.85rem] font-header font-bold text-white uppercase tracking-[0.5px]">
              {language === 'vi' ? 'Quy tắc lọc Comment tự động' : 'Smart Comment Filters'}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emoji filter */}
              <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.8rem] text-text-secondary font-bold">
                    {language === 'vi' ? 'Lọc bỏ Emoji / Icon:' : 'Filter Emoji / Icons:'}
                  </span>
                  <span className="text-[0.66rem] text-text-muted">
                    {language === 'vi' ? 'Tự động xóa các biểu tượng cảm xúc trước khi đọc' : 'Remove emojis before speech'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ttsFilterEmoji}
                    onChange={(e) => handleFilterEmojiChange(e.target.checked)}
                    disabled={!ttsEnabled || savingSettings}
                    className="peer sr-only"
                  />
                  <span className="w-9 h-[18px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[12px] after:h-[12px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 peer-checked:bg-secondary peer-checked:after:translate-x-[18px]" />
                </label>
              </div>

              {/* Bad words filter */}
              <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.8rem] text-text-secondary font-bold">
                    {language === 'vi' ? 'Lọc từ thô tục / cấm:' : 'Filter Profanity:'}
                  </span>
                  <span className="text-[0.66rem] text-text-muted">
                    {language === 'vi' ? 'Tự động che *** các từ nhạy cảm tiếng Việt' : 'Filter bad words with ***'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ttsFilterBadWords}
                    onChange={(e) => handleFilterBadWordsChange(e.target.checked)}
                    disabled={!ttsEnabled || savingSettings}
                    className="peer sr-only"
                  />
                  <span className="w-9 h-[18px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[12px] after:h-[12px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 peer-checked:bg-secondary peer-checked:after:translate-x-[18px]" />
                </label>
              </div>
            </div>

            {/* Max length */}
            <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.8rem] text-text-secondary font-bold">
                  {language === 'vi' ? 'Giới hạn ký tự tối đa:' : 'Max Text Length:'}
                </span>
                <span className="text-[0.66rem] text-text-muted">
                  {language === 'vi' ? 'Cắt ngắn comment dài để tránh chiếm sóng live' : 'Truncate long comments'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={ttsMaxChars}
                  onChange={(e) => handleMaxCharsChange(parseInt(e.target.value) || 100)}
                  disabled={!ttsEnabled || savingSettings}
                  className="w-20 bg-bg-input border border-border-color rounded-lg px-2.5 py-1 text-white font-mono text-[0.82rem] text-center outline-none focus:border-secondary"
                />
                <span className="text-[0.72rem] text-text-muted font-mono">{language === 'vi' ? 'ký tự' : 'chars'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Testing Box & Spoken History Log */}
        <div className="flex flex-col gap-6">
          {/* Test Box */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-5 backdrop-blur-[24px] glass-shadow flex flex-col gap-4">
            <h4 className="font-header text-[0.95rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2 select-none">
              <i className="fa-solid fa-vial text-primary" />
              {language === 'vi' ? 'Thử Giọng Đọc & Giả Lập Chat' : 'Test Speech & Sim Chat'}
            </h4>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={testComment}
                onChange={(e) => setTestComment(e.target.value)}
                placeholder={language === 'vi' ? 'Nhập nội dung comment thử...' : 'Enter test comment...'}
                className="w-full bg-bg-input border border-border-color rounded-xl px-3 py-2 text-white font-body text-[0.82rem] outline-none transition-all focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleTestSpeech}
                className="py-2 px-3 rounded-xl bg-primary text-white text-[0.78rem] font-bold hover:shadow-[0_0_12px_var(--primary-glow)] transition-all cursor-pointer outline-none active:scale-[0.97] flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-play" />
                {language === 'vi' ? 'Thử Đọc Ngay' : 'Play Sound'}
              </button>

              {onSimulateEvent && (
                <button
                  type="button"
                  onClick={handleSimulateChat}
                  className="py-2 px-3 rounded-xl bg-secondary text-black text-[0.78rem] font-bold hover:shadow-[0_0_12px_var(--secondary-glow)] transition-all cursor-pointer outline-none active:scale-[0.97] flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-paper-plane" />
                  Test OBS
                </button>
              )}
            </div>
          </div>

          {/* Spoken Log History */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-5 backdrop-blur-[24px] glass-shadow flex flex-col gap-3.5 flex-1 min-h-[300px]">
            <h4 className="font-header text-[0.95rem] font-bold text-white uppercase tracking-[0.5px] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-list-check text-secondary" />
                {language === 'vi' ? 'Lịch Sử Comment Đã Đọc' : 'Spoken History Log'}
              </span>
              <span className="text-[0.7rem] font-mono text-text-muted">{spokenLogs.length} items</span>
            </h4>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1">
              {spokenLogs.length === 0 ? (
                <div className="text-center py-12 text-[0.78rem] text-text-muted select-none">
                  {language === 'vi' ? 'Chưa có comment nào được phát âm thanh.' : 'No comment logs recorded yet.'}
                </div>
              ) : (
                spokenLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 text-[0.78rem] transition-all hover:bg-white/8"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-secondary">{log.nickname}</span>
                      <span className="text-[0.66rem] font-mono text-text-muted">{log.time}</span>
                    </div>
                    <p className="text-text-main line-clamp-2 font-body text-[0.78rem]">{log.processedText}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
