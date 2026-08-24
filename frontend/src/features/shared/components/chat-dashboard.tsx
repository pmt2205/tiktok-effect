'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveChatUser, setMessages, ChatMessage } from '../store/chat-slice';
import { BACKEND_URL } from '@/lib/constants';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';

interface ChatDashboardProps {
  onSendMessage: (receiver: string, message: string) => void;
}

export default function ChatDashboard({ onSendMessage }: ChatDashboardProps) {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const messages = useAppSelector((state) => state.chat.messages);
  const activeChatUser = useAppSelector((state) => state.chat.activeChatUser);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const [inputVal, setInputVal] = useState('');
  const threadEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onSendMessage(activeChatUser || 'admin', data.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Scroll to bottom of message thread on update
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatUser]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !activeChatUser) return;
    onSendMessage(activeChatUser, inputVal.trim());
    setInputVal('');
  };

  const t = {
    vi: {
      title: 'Hộp thoại Streamer',
      placeholder: 'Nhập tin nhắn để gửi cho streamer...',
      send: 'Gửi',
      selectUser: 'Vui lòng chọn streamer từ danh sách để bắt đầu trò chuyện.',
      noConversations: 'Chưa có cuộc trò chuyện nào.',
      activeConversations: 'Hộp thư hoạt động',
      support: 'Hỗ trợ Admin',
    },
    en: {
      title: 'Streamer Dialogue',
      placeholder: 'Type a message to send to streamer...',
      send: 'Send',
      selectUser: 'Please select a streamer from the list to start chatting.',
      noConversations: 'No active conversations.',
      activeConversations: 'Active Inbox',
      support: 'Admin Support',
    }
  }[language];

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[500px] flex gap-6 animate-[fade-in-up_0.5s_ease-out]">
      {/* Left Sidebar: Conversations list */}
      <div className="w-80 flex flex-col gap-4 shrink-0">
        <GlassCard
          headerIcon={<i className="fa-solid fa-inbox text-secondary" />}
          headerTitle={t.activeConversations}
          className="flex-1 flex flex-col h-full overflow-hidden"
          contentClassName="flex-1 flex flex-col overflow-hidden h-full min-h-0"
        >
          <div className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-2 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-[0.85rem] text-text-muted select-none">
                {t.noConversations}
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeChatUser === conv.username;
                return (
                  <div
                    key={conv.username}
                    onClick={() => dispatch(setActiveChatUser(conv.username))}
                    className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary/10 border-secondary shadow-[0_0_12px_var(--color-secondary-glow)] text-white'
                        : 'bg-black/20 border-border-color hover:bg-black/35 hover:border-white/12 text-text-secondary hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-bg-surface border border-border-color flex items-center justify-center font-header text-[0.9rem] font-bold text-secondary uppercase shrink-0">
                        {conv.username.slice(0, 2)}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="font-header text-[0.88rem] font-bold truncate">{conv.username}</span>
                        <span className="font-body text-[0.75rem] text-text-muted truncate">
                          {conv.lastMessage}
                        </span>
                      </div>
                    </div>
                    
                    {/* Unread count or time status */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                      <span className="text-[0.68rem] text-text-muted select-none">
                        {formatTime(conv.lastTimestamp)}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-[0.62rem] font-bold text-white flex items-center justify-center shadow-[0_0_8px_var(--color-primary-glow)] animate-pulse select-none">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Chat thread message board */}
      <div className="flex-1 flex flex-col h-full">
        {activeChatUser ? (
          <GlassCard
            headerIcon={<i className="fa-regular fa-comment-dots text-primary" />}
            headerTitle={`${t.title} - @${activeChatUser}`}
            className="flex-1 flex flex-col h-full overflow-hidden"
            contentClassName="flex-1 flex flex-col overflow-hidden h-full min-h-0 justify-between"
          >
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 mb-4 custom-scrollbar p-1">
              {messages.map((msg) => {
                const isMe = msg.sender === 'admin';
                return <MessageBubble key={msg._id} message={msg} isMe={isMe} />;
              })}
              <div ref={threadEndRef} />
            </div>

            {/* Message input controls */}
            <form onSubmit={handleSend} className="flex gap-3 pt-3 border-t border-border-color/60 shrink-0 items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/mp4"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer outline-none active:scale-95 disabled:opacity-40"
              >
                {isUploading ? (
                  <i className="fa-solid fa-spinner animate-spin text-[0.85rem]" />
                ) : (
                  <i className="fa-solid fa-paperclip text-[0.95rem]" />
                )}
              </button>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={t.placeholder}
                disabled={isUploading}
                className="flex-1 bg-bg-input border border-border-color rounded-lg px-4 py-3 text-white font-body text-[0.88rem] outline-none transition-all duration-200 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/20 disabled:opacity-50"
              />
              <Button type="submit" variant="gradient" className="px-5 shrink-0" disabled={isUploading}>
                <i className="fa-solid fa-paper-plane mr-1.5" />
                {t.send}
              </Button>
            </form>
          </GlassCard>
        ) : (
          <div className="flex-1 bg-bg-card/50 border border-border-color rounded-2xl flex flex-col items-center justify-center p-8 text-center select-none backdrop-blur-[24px]">
            <i className="fa-solid fa-comments text-[3.5rem] text-text-muted mb-4 opacity-50" />
            <h3 className="font-header text-[1.1rem] font-bold text-white mb-1.5 uppercase tracking-[0.5px]">Dialog Window</h3>
            <p className="font-body text-[0.85rem] text-text-muted max-w-[320px] leading-relaxed">
              {t.selectUser}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatWidgetProps {
  onSendMessage: (receiver: string, message: string) => void;
}

export function ChatWidget({ onSendMessage }: ChatWidgetProps) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const threadEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onSendMessage('admin', data.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Sync messages and auto-scroll when dialog is opened
  useEffect(() => {
    if (isOpen) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      fetch(`${BACKEND_URL}/api/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          dispatch(setMessages(data));
        })
        .catch(err => console.error('Failed to load chat history with admin:', err));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendMessage('admin', inputVal.trim());
    setInputVal('');
  };

  const unreadCount = messages.filter(m => m.sender === 'admin' && !m.read).length;

  const t = {
    vi: {
      title: 'Hỗ trợ Admin (Trực tuyến)',
      placeholder: 'Gửi tin nhắn phản hồi cho Admin...',
      noMessages: 'Chưa có cuộc trò chuyện nào.',
    },
    en: {
      title: 'Admin Support (Online)',
      placeholder: 'Send feedback message to Admin...',
      noMessages: 'No message history yet.',
    }
  }[language];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Dialog Box */}
      {isOpen && (
        <div className="w-[365px] h-[520px] rounded-2xl border border-border-color bg-bg-surface/95 backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden mb-4 animate-[fade-in-up_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-color bg-white/3 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-header text-[0.88rem] font-bold text-white tracking-[0.5px]">{t.title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/4 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all duration-200 outline-none cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-[0.85rem]" />
            </button>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 px-6 select-none">
                <i className="fa-solid fa-comments text-[2.5rem] mb-3 text-secondary" />
                <span className="text-[0.78rem] font-body">{t.noMessages}</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender !== 'admin';
                return <MessageBubble key={msg._id} message={msg} isMe={isMe} />;
              })
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Fixed Input Form at the bottom */}
          <form onSubmit={handleSend} className="p-3 border-t border-border-color bg-[#07080d]/60 backdrop-blur-md flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/mp4"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer outline-none active:scale-95 disabled:opacity-40"
            >
              {isUploading ? (
                <i className="fa-solid fa-spinner animate-spin text-[0.8rem]" />
              ) : (
                <i className="fa-solid fa-paperclip text-[0.85rem]" />
              )}
            </button>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={t.placeholder}
              disabled={isUploading}
              className="flex-1 bg-bg-input border border-border-color rounded-xl px-3.5 py-2 text-white font-body text-[0.8rem] outline-none transition-all duration-200 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/15 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isUploading}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary to-[#d0003c] shadow-[0_4px_12px_var(--color-primary-glow)] hover:shadow-[0_4px_16px_var(--color-primary-glow)] flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer outline-none border-none"
            >
              <i className="fa-solid fa-paper-plane text-[0.8rem]" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Messenger Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-[#ff0050] border border-white/10 hover:border-white/20 shadow-[0_8px_32px_rgba(255,0,80,0.35)] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_32px_rgba(255,0,80,0.5)] active:scale-95 cursor-pointer outline-none relative"
      >
        {isOpen ? (
          <i className="fa-solid fa-chevron-down text-[1.1rem] animate-[spin_0.3s_ease-out]" />
        ) : (
          <i className="fa-solid fa-comments text-[1.25rem] animate-[bounce_2s_infinite]" />
        )}
        
        {/* Unread badge on the bubble */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-secondary text-[0.62rem] font-bold text-black flex items-center justify-center shadow-[0_0_10px_var(--color-secondary-glow)] border border-bg-dark animate-pulse select-none">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

function MessageBubble({ message, isMe }: { message: ChatMessage; isMe: boolean }) {
  const isBase64 = message.message.startsWith('data:');
  const isImage = message.message.startsWith('data:image/') || /\.(jpg|jpeg|png|gif|webp)/i.test(message.message);
  const isVideo = message.message.startsWith('data:video/') || /\.(mp4)/i.test(message.message);

  const mediaUrl = isBase64
    ? message.message
    : (message.message.startsWith('http://') || message.message.startsWith('https://') || message.message.startsWith('/')
      ? (message.message.startsWith('/') ? `${BACKEND_URL}${message.message}` : message.message)
      : `${BACKEND_URL}/${message.message}`);

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'} gap-1`}>
      <div className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Profile Avatar icon */}
        <div className={`w-7 h-7 rounded-full border border-border-color flex items-center justify-center font-header text-[0.68rem] font-bold select-none uppercase shrink-0 ${
          isMe ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary'
        }`}>
          {message.sender.slice(0, 2)}
        </div>
        
        {/* Message box bubble */}
        <div className={`px-3.5 py-2 rounded-xl text-[0.82rem] font-body leading-relaxed shadow-md border ${
          isMe
            ? 'bg-gradient-to-br from-[#ff0050]/20 to-[#ff0050]/5 border-primary/20 text-white rounded-tr-none'
            : 'bg-[#101220]/60 backdrop-blur-md border-border-color text-text-main rounded-tl-none'
        }`}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={mediaUrl} 
              alt="Uploaded content" 
              className="max-w-[220px] max-h-[220px] rounded-lg object-contain cursor-zoom-in border border-white/5 bg-black/40 hover:scale-[1.02] transition-all duration-200"
              onClick={() => typeof window !== 'undefined' && window.open(mediaUrl, '_blank')}
            />
          ) : isVideo ? (
            <video 
              src={mediaUrl} 
              controls 
              className="max-w-[220px] max-h-[220px] rounded-lg object-contain border border-white/5 bg-black/40"
            />
          ) : (
            message.message
          )}
        </div>
      </div>
      <span className="text-[0.62rem] text-text-muted select-none mx-9">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
}

function formatTime(isoString: string): string {
  if (!isoString) return '00:00';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '00:00';
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
