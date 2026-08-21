'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import { Gift } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store/hooks';

export default function GiftManagerPanel() {
  const toast = useToast();
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Open state
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [giftId, setGiftId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [coins, setCoins] = useState<number>(1);
  const [icon, setIcon] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Editing state
  const [editingGift, setEditingGift] = useState<Gift | null>(null);

  const t = {
    vi: {
      title: 'Quản lý hiệu ứng quà tặng',
      subtitle: 'Tạo, sửa đổi và đồng bộ danh sách quà tặng thủ công với cơ sở dữ liệu hệ thống.',
      formTitle: 'Tạo quà tặng mới',
      editTitle: 'Cập nhật quà tặng',
      id: 'ID quà tặng (Ví dụ: 5655)',
      name: 'Tên hiển thị (Ví dụ: Vương Miện)',
      coins: 'Số xu',
      iconUrl: 'Đường dẫn icon hình ảnh',
      videosLabel: 'Danh sách Video (MP4)',
      uploadBtn: 'Tải video lên',
      uploadingText: 'Đang tải lên...',
      noVideos: 'Chưa có video nào. Vui lòng tải lên ít nhất 1 video.',
      submit: 'Tạo mới',
      update: 'Cập nhật',
      cancel: 'Hủy bỏ',
      delete: 'Xóa',
      edit: 'Sửa',
      createBtn: 'Thêm quà tặng',
      listTitle: 'Danh sách quà tặng hiện tại',
      noGifts: 'Không tìm thấy quà tặng nào.',
      successAdd: 'Đã thêm quà tặng mới thành công!',
      successUpdate: 'Đã cập nhật cấu hình quà tặng!',
      successDelete: 'Đã xóa quà tặng khỏi danh sách!',
      confirmDelete: 'Bạn có chắc chắn muốn xóa quà tặng này?',
      permissionError: 'Không có quyền thực hiện hành động này.',
      uploadSuccess: 'Tải video lên thành công!',
      uploadError: 'Tải video lên thất bại!',
      videoRequired: 'Vui lòng tải lên ít nhất 1 video.',
      activeBadge: 'Đang dùng',
      setActive: 'Chọn dùng',
    },
    en: {
      title: 'Gift Effects Manager',
      subtitle: 'Create, update, and manage the manual gift inventory and visual effect mappings.',
      formTitle: 'Add New Custom Gift',
      editTitle: 'Edit Configured Gift',
      id: 'Gift ID Number (e.g. 5655)',
      name: 'Display Name (e.g. Crown)',
      coins: 'Coins Value',
      iconUrl: 'Icon Image URL Path',
      videosLabel: 'Videos List (MP4)',
      uploadBtn: 'Upload Video',
      uploadingText: 'Uploading...',
      noVideos: 'No videos added yet. Please upload at least 1 video.',
      submit: 'Add Gift',
      update: 'Update Gift',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      createBtn: 'Add Gift',
      listTitle: 'Configured Gifts Directory',
      noGifts: 'No gifts directory records found.',
      successAdd: 'New custom gift added successfully!',
      successUpdate: 'Gift mapping configuration updated!',
      successDelete: 'Gift removed from directory!',
      confirmDelete: 'Are you sure you want to delete this gift mapping?',
      permissionError: 'Admin authorization permissions required.',
      uploadSuccess: 'Video uploaded successfully!',
      uploadError: 'Video upload failed!',
      videoRequired: 'Please upload at least 1 video.',
      activeBadge: 'Active',
      setActive: 'Set Active',
    }
  }[language];

  // Fetch gifts from backend
  const fetchGifts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGifts(data);
      }
    } catch (err) {
      console.error('Failed to load gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGifts();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStartCreate = () => {
    setEditingGift(null);
    setGiftId('');
    setName('');
    setCoins(1);
    setIcon('');
    setVideos([]);
    setActiveVideo('');
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.mp4')) {
      toast.error(language === 'vi' ? 'Chỉ hỗ trợ file video MP4.' : 'Only MP4 video files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.filename) {
          setVideos((prev) => {
            const next = [...prev, data.filename];
            if (next.length === 1) {
              setActiveVideo(data.filename);
            }
            return next;
          });
          toast.success(t.uploadSuccess);
        } else {
          toast.error(data.message || t.uploadError);
        }
      } else {
        toast.error(t.uploadError);
      }
    } catch (err) {
      console.error('Failed to upload video:', err);
      toast.error(t.uploadError);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveVideo = (indexToRemove: number) => {
    const videoToRemove = videos[indexToRemove];
    setVideos((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeVideo === videoToRemove) {
        setActiveVideo(next[0] || '');
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error(t.permissionError);
      return;
    }
    if (videos.length === 0) {
      toast.error(t.videoRequired);
      return;
    }

    const payload = {
      giftId: Number(giftId),
      name: name.trim(),
      coins: Number(coins),
      icon: icon.trim() || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png',
      videos,
      activeVideo: activeVideo || undefined,
    };

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(t.successAdd);
        setIsFormOpen(false);
        setGiftId('');
        setName('');
        setCoins(1);
        setIcon('');
        setVideos([]);
        fetchGifts();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Error occurred');
      }
    } catch (err) {
      console.error('Failed to submit gift:', err);
      toast.error('Network communication failed.');
    }
  };

  const handleStartEdit = (gift: Gift) => {
    setEditingGift(gift);
    setGiftId(gift.giftId);
    setName(gift.name);
    setCoins(gift.coins);
    setIcon(gift.icon);
    setVideos(gift.videos || []);
    setActiveVideo(gift.activeVideo || (gift.videos && gift.videos[0]) || '');
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingGift(null);
    setGiftId('');
    setName('');
    setCoins(1);
    setIcon('');
    setVideos([]);
    setActiveVideo('');
    setIsFormOpen(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGift || !editingGift._id) return;
    if (!isAdmin) {
      toast.error(t.permissionError);
      return;
    }
    if (videos.length === 0) {
      toast.error(t.videoRequired);
      return;
    }

    const payload = {
      giftId: Number(giftId),
      name: name.trim(),
      coins: Number(coins),
      icon: icon.trim(),
      videos,
      activeVideo: activeVideo || undefined,
    };

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/${editingGift._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(t.successUpdate);
        handleCancelEdit();
        fetchGifts();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Update failed');
      }
    } catch (err) {
      console.error('Failed to update gift:', err);
      toast.error('Network communication failed.');
    }
  };

  const handleDelete = async (gift: Gift) => {
    if (!window.confirm(t.confirmDelete)) return;
    if (!isAdmin) {
      toast.error(t.permissionError);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/${gift._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.info(t.successDelete);
        fetchGifts();
      } else {
        toast.error('Deletion failed.');
      }
    } catch (err) {
      console.error('Failed to delete gift:', err);
      toast.error('Network communication failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.6s_ease-out]">
      <div className="sticky top-0 bg-[#07080d]/80 backdrop-blur-md z-30 flex flex-col gap-1.5 border-b border-border-color pb-4 pt-6 md:pt-8 -mt-6 md:-mt-8 select-none">
        <h2 className="font-header text-[1.4rem] font-bold text-white tracking-[0.5px] uppercase">{t.title}</h2>
        <p className="text-[0.88rem] text-text-muted">{t.subtitle}</p>
      </div>

      <div className="w-full">
        <GlassCard
          headerIcon={<i className="fa-solid fa-list-ul" />}
          headerTitle={t.listTitle}
          headerActions={
            isAdmin && (
              <Button
                onClick={handleStartCreate}
                variant="gradient"              >
                <i className="fa-solid fa-plus-circle" />
                {t.createBtn}
              </Button>
              
            )
          }
        >
          {loading ? (
            <div className="text-center py-12 text-[0.9rem] text-text-muted select-none">
              <i className="fa-solid fa-spinner animate-spin text-[1.5rem] text-secondary mb-3.5 block" />
              <span>Loading catalog directory...</span>
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-12 text-[0.88rem] text-text-muted select-none">
              {t.noGifts}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1.5 custom-scrollbar">
              {gifts.map((gift) => (
                <div
                  key={gift._id}
                  className="flex justify-between items-center bg-black/25 p-3.5 rounded-lg border border-border-color hover:border-white/12 transition-all duration-150 hover:bg-black/30"
                >
                  <div className="flex items-center gap-4">
                    {/* Gift Icon Thumbnail */}
                    <div className="w-14 h-14 bg-black/45 border border-white/5 rounded-md flex items-center justify-center p-2 shrink-0 select-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-header text-[0.95rem] font-bold text-white truncate">{gift.name}</span>
                        <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-secondary font-semibold font-body select-none">{gift.giftId}</span>
                      </div>
                      <span className="text-[0.78rem] text-text-muted font-body mt-0.5">
                        ⚡ {gift.coins} coins | Videos: <span className="text-white/80 font-semibold">{gift.videos && gift.videos.length > 0 ? `${gift.videos.length} video(s)` : 'None'}</span>
                        {gift.videos && gift.videos.length > 0 && (
                          <>
                            {' | '}{language === 'vi' ? 'Đang dùng: ' : 'Active: '}
                            <span className="text-secondary font-semibold">{gift.activeVideo || gift.videos[0]}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(gift)}
                        className="px-3.5 py-2 rounded-sm bg-secondary/10 border border-secondary/15 hover:bg-secondary/20 hover:border-secondary/25 text-secondary font-body text-[0.75rem] font-semibold transition-all duration-150 cursor-pointer outline-none active:scale-95 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-pen-to-square" />
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(gift)}
                        className="px-3.5 py-2 rounded-sm bg-primary/15 border border-primary/20 hover:bg-primary/25 hover:border-primary/30 text-primary font-body text-[0.75rem] font-semibold transition-all duration-150 cursor-pointer outline-none active:scale-95 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-trash" />
                        {t.delete}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Form Modal backdrop */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-[500px] bg-bg-surface border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col gap-4">
            
            <h3 className="font-header text-[1.25rem] font-bold text-white capitalize mb-1 border-b border-border-color pb-3 select-none flex items-center gap-2">
              <i className={`fa-solid ${editingGift ? 'fa-pen-to-square text-secondary' : 'fa-circle-plus text-primary'}`} />
              <span>{editingGift ? t.editTitle : t.formTitle}</span>
            </h3>

            <form onSubmit={editingGift ? handleUpdate : handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[0.8rem] text-text-secondary font-semibold block mb-1.5">{t.id}</label>
                <input
                  type="number"
                  required
                  value={giftId}
                  onChange={(e) => setGiftId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. 5655"
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-sm px-3.5 py-2 text-white font-body text-[0.88rem] outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-glow/15 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-semibold block mb-1.5">{t.name}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hoa Hồng"
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-sm px-3.5 py-2 text-white font-body text-[0.88rem] outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-glow/15 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-semibold block mb-1.5">{t.coins}</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={coins}
                  onChange={(e) => setCoins(parseInt(e.target.value, 10))}
                  placeholder="e.g. 1"
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-sm px-3.5 py-2 text-white font-body text-[0.88rem] outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-glow/15 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-semibold block mb-1.5">{t.iconUrl}</label>
                <input
                  type="text"
                  required
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. https://..."
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-sm px-3.5 py-2 text-white font-body text-[0.82rem] outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-glow/15 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-semibold block mb-1.5">{t.videosLabel}</label>
                <div className="flex flex-col gap-2.5 bg-black/20 border border-border-color rounded-md p-3.5">
                  {videos.length === 0 ? (
                    <span className="text-[0.78rem] text-text-muted italic block select-none">
                      {t.noVideos}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {videos.map((video, idx) => {
                        const isActive = video === activeVideo;
                        return (
                          <div 
                            key={idx} 
                            className={`flex justify-between items-center bg-black/40 px-3 py-2 rounded-sm border transition-all duration-150 ${
                              isActive ? 'border-secondary/30 bg-secondary/5' : 'border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate max-w-[240px]">
                              <button
                                type="button"
                                onClick={() => setActiveVideo(video)}
                                className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-150 cursor-pointer ${
                                  isActive 
                                    ? 'bg-secondary border-secondary text-black shadow-[0_0_8px_rgba(0,242,254,0.3)]' 
                                    : 'border-white/30 hover:border-secondary'
                                }`}
                                title={isActive ? t.activeBadge : t.setActive}
                              >
                                {isActive && <i className="fa-solid fa-check text-[0.68rem] font-bold" />}
                              </button>
                              <span className={`text-[0.8rem] font-body truncate ${isActive ? 'text-secondary font-semibold' : 'text-white/90'}`}>
                                {video}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="text-primary hover:text-primary-glow text-[0.85rem] cursor-pointer outline-none transition-colors duration-150 active:scale-95 ml-2"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-1">
                      <label className="relative inline-flex items-center justify-center px-4 py-2.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/20 hover:border-secondary/35 rounded-sm text-secondary font-body text-[0.8rem] font-semibold cursor-pointer outline-none transition-all duration-150 select-none w-full text-center active:scale-[0.98]">
                        <i className={`fa-solid ${uploading ? 'fa-spinner animate-spin' : 'fa-cloud-arrow-up'} mr-2`} />
                        {uploading ? t.uploadingText : t.uploadBtn}
                        <input
                          type="file"
                          accept="video/mp4"
                          disabled={uploading}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2.5 mt-3 justify-end border-t border-border-color/60 pt-3.5">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white font-body text-[0.85rem] font-semibold cursor-pointer outline-none transition-all duration-150 active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <Button type="submit" className="px-5 py-2.5 rounded-sm">
                    {editingGift ? t.update : t.submit}
                  </Button>
                </div>
              )}
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
