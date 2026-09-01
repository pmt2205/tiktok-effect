'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatEvent, OverlaySettings } from '@/types';
import { DEFAULT_SETTINGS, BACKEND_URL } from '@/lib/constants';

export interface SpokenLogEntry {
  id: string;
  time: string;
  nickname: string;
  comment: string;
  processedText: string;
  status: 'spoken' | 'filtered' | 'skipped';
}

// Common Vietnamese bad words list for filtering
const VIETNAMESE_BAD_WORDS = [
  'dkm', 'dm', 'đm', 'đkm', 'vcl', 'vl', 'đéo', 'deo', 'cc', 'cl', 'clgt', 
  'lon', 'lồn', 'cac', 'cặc', 'buoi', 'bưởi', 'đĩ', 'di~', 'con cặc', 'đồ chó'
];

/**
 * Remove emojis and pictographs from text
 */
export function removeEmojis(text: string): string {
  try {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  } catch (e) {
    return text;
  }
}

/**
 * Check if text contains bad words
 */
export function containsBadWords(text: string): boolean {
  const lower = text.toLowerCase();
  return VIETNAMESE_BAD_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower) || lower.includes(` ${word} `);
  });
}

/**
 * Replace bad words with asterisks
 */
export function filterBadWords(text: string): string {
  let cleaned = text;
  VIETNAMESE_BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '***');
  });
  return cleaned;
}

export function useTtsQueue(settingsState?: OverlaySettings) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [spokenLogs, setSpokenLogs] = useState<SpokenLogEntry[]>([]);

  const queueRef = useRef<{ id: string; text: string; nickname: string; rawComment: string }[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const settingsRef = useRef<OverlaySettings>(settingsState || DEFAULT_SETTINGS);

  useEffect(() => {
    if (settingsState) {
      settingsRef.current = settingsState;
    }
  }, [settingsState]);

  // Load available Voices from Web Speech API
  const updateVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [updateVoices]);

  // Pick best matching voice
  const getSelectedVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;
    const settings = settingsRef.current;
    const voiceSetting = settings.ttsVoice || 'auto';

    if (voiceSetting !== 'auto') {
      const found = voices.find((v) => v.voiceURI === voiceSetting || v.name === voiceSetting);
      if (found) return found;
    }

    // Default: find Vietnamese voices first
    const viVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('vi') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('namminh')
    );

    if (viVoice) return viVoice;
    return voices[0] || null;
  }, [voices]);

  // Process queue item by item
  const processNextInQueue = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isMuted || queueRef.current.length === 0) {
      isProcessingRef.current = false;
      setIsSpeaking(false);
      setQueueLength(0);
      return;
    }

    isProcessingRef.current = true;
    setIsSpeaking(true);
    setQueueLength(queueRef.current.length);

    const item = queueRef.current.shift()!;
    setQueueLength(queueRef.current.length);

    const settings = settingsRef.current;

    const handleEnd = () => {
      setSpokenLogs((prev) => [
        {
          id: item.id,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          nickname: item.nickname,
          comment: item.rawComment,
          processedText: item.text,
          status: 'spoken',
        },
        ...prev.slice(0, 29),
      ]);

      setTimeout(() => {
        processNextInQueue();
      }, 350);
    };

    // Support Google Translate official voice via backend proxy
    if (settings.ttsVoice === 'google_translate') {
      const url = `${BACKEND_URL}/api/tts/google?text=${encodeURIComponent(item.text)}`;
      const audio = new Audio(url);
      audio.playbackRate = settings.ttsRate ?? 1.0;
      audio.volume = settings.ttsVolume ?? 1.0;
      audio.onended = handleEnd;
      audio.onerror = (e) => {
        console.warn('Google Translate TTS Error, falling back:', e);
        handleEnd();
      };
      audio.play().catch(handleEnd);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(item.text);

    utterance.rate = settings.ttsRate ?? 1.0;
    utterance.pitch = settings.ttsPitch ?? 1.0;
    utterance.volume = settings.ttsVolume ?? 1.0;

    const matchedVoice = getSelectedVoice();
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || 'vi-VN';
    } else {
      utterance.lang = 'vi-VN';
    }

    utterance.onend = handleEnd;

    utterance.onerror = (e) => {
      console.warn('TTS Speech error:', e);
      setTimeout(() => {
        processNextInQueue();
      }, 200);
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, getSelectedVoice]);

  // Enqueue chat comment for TTS reading
  const enqueueChat = useCallback(
    (chat: ChatEvent, settings?: OverlaySettings) => {
      const currentSettings = settings || settingsRef.current;

      if (currentSettings.ttsEnabled === false) return;
      if (!chat.comment || !chat.comment.trim()) return;

      let comment = chat.comment.trim();

      // 1. Filter Emoji if enabled
      if (currentSettings.ttsFilterEmoji !== false) {
        comment = removeEmojis(comment);
      }

      // Skip if empty after emoji removal
      if (!comment) {
        setSpokenLogs((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            nickname: chat.nickname,
            comment: chat.comment,
            processedText: '[Bỏ qua: Chỉ chứa Icon/Emoji]',
            status: 'filtered',
          },
          ...prev.slice(0, 29),
        ]);
        return;
      }

      // 2. Filter Bad Words
      if (currentSettings.ttsFilterBadWords !== false) {
        comment = filterBadWords(comment);
      }

      // 3. Max chars truncation
      const maxChars = currentSettings.ttsMaxChars || 100;
      if (comment.length > maxChars) {
        comment = comment.slice(0, maxChars) + '...';
      }

      // 4. Custom Template
      const template = currentSettings.ttsTemplate || '{nickname} nói: {comment}';
      const textToSpeak = template
        .replace('{nickname}', chat.nickname || 'Người xem')
        .replace('{comment}', comment);

      queueRef.current.push({
        id: Math.random().toString(36).substr(2, 9),
        text: textToSpeak,
        nickname: chat.nickname,
        rawComment: chat.comment,
      });

      setQueueLength(queueRef.current.length);

      if (!isProcessingRef.current) {
        processNextInQueue();
      }
    },
    [processNextInQueue]
  );

  // Manual Speak (Test button)
  const speakText = useCallback(
    (text: string, nickname: string = 'Chủ phòng') => {
      const settings = settingsRef.current;

      if (settings.ttsVoice === 'google_translate') {
        const url = `${BACKEND_URL}/api/tts/google?text=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.playbackRate = settings.ttsRate ?? 1.0;
        audio.volume = settings.ttsVolume ?? 1.0;
        audio.play().catch((err) => console.warn('Failed to play Google Translate TTS Audio:', err));
        return;
      }

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel(); // Stop current speech

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = settings.ttsRate ?? 1.0;
      utterance.pitch = settings.ttsPitch ?? 1.0;
      utterance.volume = settings.ttsVolume ?? 1.0;

      const matchedVoice = getSelectedVoice();
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || 'vi-VN';
      } else {
        utterance.lang = 'vi-VN';
      }

      window.speechSynthesis.speak(utterance);
    },
    [getSelectedVoice]
  );

  // Toggle Mute / Pause
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        queueRef.current = [];
        setQueueLength(0);
        isProcessingRef.current = false;
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isProcessingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return {
    voices,
    isMuted,
    isSpeaking,
    queueLength,
    spokenLogs,
    enqueueChat,
    speakText,
    toggleMute,
    clearQueue,
    getSelectedVoice,
  };
}
