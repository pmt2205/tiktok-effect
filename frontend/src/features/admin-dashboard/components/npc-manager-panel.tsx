'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { Gift, NpcCategory } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  addNpcCategory,
  deleteNpcCategory,
} from '@/features/admin-dashboard/store/dashboard-slice';

export default function NpcManagerPanel() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');

  const npcCategories = useAppSelector((state) => state.dashboard.npcCategories) || [];
  const users = useAppSelector((state) => state.dashboard.usersList) || [];

  // Current selections
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [npcGifts, setNpcGifts] = useState<Gift[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(false);

  // New category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDisplay, setNewCatDisplay] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Gift Form Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [giftId, setGiftId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [coins, setCoins] = useState<number>(1);
  const [icon, setIcon] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<string>('');
  const [sounds, setSounds] = useState<string[]>([]);
  const [activeSound, setActiveSound] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadingSound, setUploadingSound] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);

  const t = {
    vi: {
      title: 'Quản lý Live NPC',
      catTitle: 'Thể loại NPC',
      addCat: 'Thêm thể loại mới',
      catName: 'Mã thể loại (ví dụ: horror)',
      catDisplay: 'Tên hiển thị (ví dụ: 💀 Kinh dị)',
      btnCreate: 'Tạo',
      btnDelete: 'Xóa',
      giftsTitle: 'Danh sách Quà tặng NPC',
      selectStreamer: 'Chọn Streamer',
      selectCategory: 'Chọn thể loại NPC',
      createBtn: 'Thêm quà tặng NPC',
      noGifts: 'Chưa có quà tặng nào trong thể loại này.',
      successAdd: 'Đã thêm quà tặng NPC mới!',
      successUpdate: 'Đã cập nhật cấu hình quà tặng NPC!',
      successDelete: 'Đã xóa quà tặng NPC!',
      confirmDelete: 'Bạn có chắc chắn muốn xóa quà tặng này?',
      successAddCat: 'Đã thêm thể loại thành công!',
      successDelCat: 'Đã xóa thể loại thành công!',
      confirmDelCat: 'Bạn có chắc chắn muốn xóa thể loại này? Tất cả quà tặng trong thể loại này cũng sẽ bị xóa.',
      formTitle: 'Tạo quà tặng NPC mới',
      editTitle: 'Cập nhật quà tặng NPC',
      id: 'ID quà tặng (Ví dụ: 5655)',
      giftName: 'Tên hiển thị (Ví dụ: Vương Miện)',
      coins: 'Số xu',
      iconUrl: 'Đường dẫn icon hình ảnh',
      videosLabel: 'Danh sách Video (MP4)',
      uploadBtn: 'Tải video lên',
      uploadingText: 'Đang tải lên...',
      noVideos: 'Chưa có video nào. Vui lòng tải lên ít nhất 1 video.',
      submit: 'Tạo mới',
      update: 'Cập nhật',
      cancel: 'Hủy bỏ',
      edit: 'Sửa',
      videoRequired: 'Vui lòng tải lên ít nhất 1 video.',
      uploadSuccess: 'Tải video lên thành công!',
      uploadError: 'Tải video lên thất bại!',
      activeBadge: 'Đang dùng',
      setActive: 'Chọn dùng',
      soundsLabel: 'Danh sách Âm thanh (MP3, WAV...)',
      uploadSoundBtn: 'Tải âm thanh lên',
      uploadingSoundText: 'Đang tải âm thanh...',
      noSounds: 'Chưa có âm thanh nào. Quà tặng sẽ phát mặc định hoặc không âm thanh.',
      uploadSoundSuccess: 'Tải âm thanh lên thành công!',
      uploadSoundError: 'Tải âm thanh lên thất bại!',
    },
    en: {
      title: 'Live NPC Management',
      catTitle: 'NPC Categories',
      addCat: 'Add New Category',
      catName: 'Category Identifier (e.g. horror)',
      catDisplay: 'Display Label (e.g. 💀 Horror)',
      btnCreate: 'Create',
      btnDelete: 'Delete',
      giftsTitle: 'NPC Gifts Inventory',
      selectStreamer: 'Select Streamer Account',
      selectCategory: 'Select NPC Category',
      createBtn: 'Add NPC Gift',
      noGifts: 'No custom gifts mapped under this category.',
      successAdd: 'NPC custom gift added successfully!',
      successUpdate: 'NPC gift configuration updated!',
      successDelete: 'NPC gift removed from inventory!',
      confirmDelete: 'Are you sure you want to delete this NPC gift?',
      successAddCat: 'Created NPC category successfully!',
      successDelCat: 'Deleted NPC category successfully!',
      confirmDelCat: 'Are you sure you want to delete this NPC category? All custom gifts under this category will be removed.',
      formTitle: 'Add New NPC Gift',
      editTitle: 'Edit Configured NPC Gift',
      id: 'Gift ID Number (e.g. 5655)',
      giftName: 'Display Name (e.g. Crown)',
      coins: 'Coins Value',
      iconUrl: 'Icon Image URL Path',
      videosLabel: 'Videos List (MP4)',
      uploadBtn: 'Upload Video',
      uploadingText: 'Uploading...',
      noVideos: 'No videos added yet. Please upload at least 1 video.',
      submit: 'Add Gift',
      update: 'Update Gift',
      cancel: 'Cancel',
      edit: 'Edit',
      videoRequired: 'Please upload at least 1 video.',
      uploadSuccess: 'Video uploaded successfully!',
      uploadError: 'Video upload failed!',
      activeBadge: 'Active',
      setActive: 'Set Active',
      soundsLabel: 'Sounds List (MP3, WAV...)',
      uploadSoundBtn: 'Upload Sound',
      uploadingSoundText: 'Uploading Sound...',
      noSounds: 'No sounds added yet. Gift will play without custom sound.',
      uploadSoundSuccess: 'Sound uploaded successfully!',
      uploadSoundError: 'Sound upload failed!',
    }
  }[language];

  // Set default selected streamer and category
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      const firstStreamer = users.find((u) => u.role !== 'admin');
      if (firstStreamer) {
        setSelectedUser(firstStreamer.username);
      }
    }
    if (npcCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(npcCategories[0].name);
    }
  }, [users, npcCategories, selectedUser, selectedCategory]);

  // Load NPC custom gifts
  const fetchNpcGifts = async () => {
    if (!selectedUser || !selectedCategory) return;
    setGiftsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/npc?username=${selectedUser}&category=${selectedCategory}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNpcGifts(data);
      }
    } catch (err) {
      console.error('Failed to load NPC gifts:', err);
      toast.error('Failed to load custom gifts.');
    } finally {
      setGiftsLoading(false);
    }
  };

  useEffect(() => {
    fetchNpcGifts();
  }, [selectedUser, selectedCategory]);

  // Category CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatDisplay.trim() || submittingCat) return;
    setSubmittingCat(true);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/settings/npc-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCatName.trim().toLowerCase(),
          displayName: newCatDisplay.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(addNpcCategory(data));
        toast.success(t.successAddCat);
        setNewCatName('');
        setNewCatDisplay('');
      } else {
        toast.error('Category identifier already exists.');
      }
    } catch (err) {
      console.error('Failed to create category:', err);
      toast.error('Network error.');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: NpcCategory) => {
    if (!window.confirm(t.confirmDelCat)) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/settings/npc-categories/${cat._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        dispatch(deleteNpcCategory(cat._id));
        toast.info(t.successDelCat);
        if (selectedCategory === cat.name) {
          setSelectedCategory('');
        }
      } else {
        toast.error('Failed to delete category.');
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      toast.error('Network error.');
    }
  };

  // Gift Modal Open routines
  const handleStartCreate = () => {
    setEditingGift(null);
    setGiftId('');
    setName('');
    setCoins(1);
    setIcon('');
    setVideos([]);
    setActiveVideo('');
    setSounds([]);
    setActiveSound('');
    setIsFormOpen(true);
  };

  const handleStartEdit = (gift: Gift) => {
    setEditingGift(gift);
    setGiftId(gift.giftId);
    setName(gift.name);
    setCoins(gift.coins);
    setIcon(gift.icon);
    setVideos(gift.videos || []);
    setActiveVideo(gift.activeVideo || (gift.videos && gift.videos[0]) || '');
    setSounds(gift.sounds || []);
    setActiveSound(gift.activeSound || (gift.sounds && gift.sounds[0]) || '');
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setEditingGift(null);
    setGiftId('');
    setName('');
    setCoins(1);
    setIcon('');
    setVideos([]);
    setActiveVideo('');
    setSounds([]);
    setActiveSound('');
    setIsFormOpen(false);
  };

  // MP4 video upload handler
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
        headers: { 'Authorization': `Bearer ${token}` },
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
      e.target.value = '';
    }
  };

  const handleSoundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const hasAllowedExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasAllowedExtension) {
      toast.error(language === 'vi' ? 'Chỉ hỗ trợ file âm thanh MP3, WAV, OGG, M4A, AAC.' : 'Only audio files (MP3, WAV, OGG, M4A, AAC) are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('sound', file);

    setUploadingSound(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/upload-sound`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.filename) {
          setSounds((prev) => {
            const next = [...prev, data.filename];
            if (next.length === 1) {
              setActiveSound(data.filename);
            }
            return next;
          });
          toast.success(t.uploadSoundSuccess);
        } else {
          toast.error(data.message || t.uploadSoundError);
        }
      } else {
        toast.error(t.uploadSoundError);
      }
    } catch (err) {
      console.error('Failed to upload sound:', err);
      toast.error(t.uploadSoundError);
    } finally {
      setUploadingSound(false);
      e.target.value = '';
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

  // Submit / Update
  const handleSubmitGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      giftId: Number(giftId),
      name: name.trim(),
      coins: Number(coins),
      icon: icon.trim() || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png',
      videos,
      activeVideo: activeVideo || undefined,
      sounds,
      activeSound: activeSound || undefined,
      username: selectedUser,
      category: selectedCategory,
    };

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/npc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(t.successAdd);
        handleCancelForm();
        fetchNpcGifts();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Error occurred');
      }
    } catch (err) {
      console.error('Failed to submit NPC gift:', err);
      toast.error('Network error.');
    }
  };

  const handleUpdateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGift || !editingGift._id || !isAdmin) return;

    const payload = {
      giftId: Number(giftId),
      name: name.trim(),
      coins: Number(coins),
      icon: icon.trim(),
      videos,
      activeVideo: activeVideo || undefined,
      sounds,
      activeSound: activeSound || undefined,
      username: selectedUser,
      category: selectedCategory,
    };

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/npc/${editingGift._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(t.successUpdate);
        handleCancelForm();
        fetchNpcGifts();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Update failed');
      }
    } catch (err) {
      console.error('Failed to update NPC gift:', err);
      toast.error('Network error.');
    }
  };

  const handleDeleteGift = async (gift: Gift) => {
    if (!window.confirm(t.confirmDelete)) return;
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/npc/${gift._id}?username=${selectedUser}&category=${selectedCategory}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.info(t.successDelete);
        fetchNpcGifts();
      } else {
        toast.error('Deletion failed.');
      }
    } catch (err) {
      console.error('Failed to delete NPC gift:', err);
      toast.error('Network error.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-[fade-in-up_0.6s_ease-out]">
      <div className="sticky top-0 bg-[#07080d]/80 backdrop-blur-md z-30 flex flex-col gap-1.5 border-b border-border-color pb-4 pt-6 md:pt-8 -mt-6 md:-mt-8 select-none">
        <h2 className="font-header text-[1.4rem] font-bold text-white tracking-[0.5px] uppercase">{t.title}</h2>
        <p className="text-[0.88rem] text-text-muted">{language === 'vi' ? 'Quản lý toàn bộ thể loại và thiết lập quà tặng NPC động.' : 'Manage all categories and configurations of dynamic NPC gifts.'}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6 items-start">

        {/* Left Side: Category CRUD */}
        <div className="flex flex-col gap-6">
          <GlassCard
            headerIcon={<i className="fa-solid fa-shapes text-primary animate-pulse" />}
            headerTitle={t.catTitle}
          >
            {isAdmin && (
              <form onSubmit={handleAddCategory} className="mb-5 border-b border-border-color/60 pb-5">
                <h4 className="font-header text-[0.82rem] font-bold text-text-muted uppercase tracking-[1px] mb-3.5 select-none">
                  {t.addCat}
                </h4>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder={t.catName}
                    required
                    className="w-full bg-bg-input border border-border-color rounded-xl px-4 py-2.5 text-white font-body text-[0.88rem] outline-none focus:border-primary focus:ring-3 focus:ring-primary-glow/10 transition-all duration-200"
                  />
                  <input
                    type="text"
                    value={newCatDisplay}
                    onChange={(e) => setNewCatDisplay(e.target.value)}
                    placeholder={t.catDisplay}
                    required
                    className="w-full bg-bg-input border border-border-color rounded-xl px-4 py-2.5 text-white font-body text-[0.88rem] outline-none focus:border-primary focus:ring-3 focus:ring-primary-glow/10 transition-all duration-200"
                  />
                  <Button type="submit" variant="gradient" disabled={submittingCat} className="rounded-xl w-full">
                    <i className="fa-solid fa-plus mr-1.5" />
                    {t.btnCreate}
                  </Button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
              {npcCategories.length === 0 ? (
                <div className="text-center py-6 text-text-muted text-[0.82rem] italic select-none">
                  No NPC categories loaded.
                </div>
              ) : (
                npcCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex justify-between items-center bg-black/25 p-3 px-4 rounded-xl border border-border-color/80 transition-all duration-200 hover:border-white/12 hover:bg-black/35 hover:-translate-y-[1px] shadow-sm group"
                  >
                    <div className="flex flex-col gap-0.5 select-none">
                      <span className="font-header font-bold text-white text-[0.88rem] group-hover:text-primary transition-colors duration-150">{cat.displayName}</span>
                      <span className="text-[0.68rem] text-text-muted font-mono tracking-[0.5px]">id: {cat.name}</span>
                    </div>
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="small-danger"
                        onClick={() => handleDeleteCategory(cat)}
                        className="rounded-lg shadow-[0_2px_8px_rgba(255,0,80,0.05)] active:scale-[0.95]"
                      >
                        <i className="fa-solid fa-trash" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: NPC Category Gifts Catalog */}
        <div className="flex flex-col gap-6">
          <GlassCard
            headerIcon={<i className="fa-solid fa-gift text-secondary" />}
            headerTitle={t.giftsTitle}
            headerActions={
              isAdmin && selectedUser && selectedCategory && (
                <Button onClick={handleStartCreate} variant="gradient" className="rounded-xl">
                  <i className="fa-solid fa-plus-circle" /> {t.createBtn}
                </Button>
              )
            }
          >
            {/* Selection filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-5 border-b border-border-color/60 pb-5">
              <Select
                label={t.selectStreamer}
                value={selectedUser}
                options={users.filter(u => u.role !== 'admin').map((u) => ({
                  value: u.username,
                  label: u.username,
                }))}
                onChange={setSelectedUser}
                className="mb-0"
              />

              <Select
                label={t.selectCategory}
                value={selectedCategory}
                options={npcCategories.map((c) => ({
                  value: c.name,
                  label: c.displayName,
                }))}
                onChange={setSelectedCategory}
                className="mb-0"
              />
            </div>

            {/* NPC Custom Gifts Directory */}
            {giftsLoading ? (
              <div className="text-center py-20 text-[0.88rem] text-text-muted select-none">
                <i className="fa-solid fa-spinner animate-spin text-[1.8rem] text-secondary mb-3 block" />
                <span>Loading NPC custom gifts catalog...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                {npcGifts.length === 0 ? (
                  <div className="text-center py-12 text-[0.88rem] text-text-muted select-none">
                    {t.noGifts}
                  </div>
                ) : (
                  npcGifts.map((gift) => (
                    <div
                      key={gift._id}
                      className="flex justify-between items-center bg-black/25 p-3.5 rounded-xl border border-border-color/80 hover:border-white/12 transition-all duration-200 hover:bg-black/35 hover:-translate-y-[1.5px] group shadow-inner"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-black/45 border border-white/5 rounded-xl flex items-center justify-center p-2.5 shrink-0 select-none group-hover:scale-105 transition-transform duration-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="font-header text-[0.95rem] font-bold text-white group-hover:text-secondary transition-colors duration-150 truncate">{gift.name}</span>
                            <span className="text-[0.7rem] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-secondary font-semibold font-body select-none">{gift.giftId}</span>
                          </div>
                          <span className="text-[0.78rem] text-text-muted font-body mt-0.5">
                            ⚡ {gift.coins} coins | Videos: <span className="text-white/80 font-semibold">{gift.videos && gift.videos.length > 0 ? `${gift.videos.length} video(s)` : 'None'}</span>
                            {gift.videos && gift.videos.length > 0 && (
                              <>
                                {' | '}{language === 'vi' ? 'Đang dùng: ' : 'Active: '}
                                <span className="text-secondary font-semibold">{gift.activeVideo || gift.videos[0]}</span>
                              </>
                            )}
                            {' | '}Sounds: <span className="text-white/80 font-semibold">{gift.sounds && gift.sounds.length > 0 ? `${gift.sounds.length} sound(s)` : 'None'}</span>
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(gift)}
                            className="px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/15 hover:bg-secondary/20 hover:border-secondary/25 text-secondary font-body text-[0.78rem] font-semibold transition-all duration-200 cursor-pointer outline-none active:scale-[0.96] flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-pen-to-square text-[0.85rem]" />
                            {t.edit}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGift(gift)}
                            className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/20 hover:bg-primary/25 hover:border-primary/30 text-primary font-body text-[0.78rem] font-semibold transition-all duration-200 cursor-pointer outline-none active:scale-[0.96] flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-trash text-[0.85rem]" />
                            {t.btnDelete}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </GlassCard>
        </div>

      </div>

      {/* Gift Creation / Editing Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-[500px] bg-bg-surface border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-7 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col gap-4.5">

            <h3 className="font-header text-[1.25rem] font-bold text-white capitalize mb-1 border-b border-border-color pb-3 select-none flex items-center gap-2.5">
              <i className={`fa-solid ${editingGift ? 'fa-pen-to-square text-secondary' : 'fa-circle-plus text-primary animate-pulse'}`} />
              <span>{editingGift ? t.editTitle : t.formTitle}</span>
            </h3>

            <form onSubmit={editingGift ? handleUpdateGift : handleSubmitGift} className="flex flex-col gap-4">
              <div>
                <label className="text-[0.8rem] text-text-secondary font-bold block mb-1.5">{t.id}</label>
                <input
                  type="number"
                  required
                  value={giftId}
                  onChange={(e) => setGiftId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. 5655"
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-xl px-4 py-2.5 text-white font-body text-[0.88rem] outline-none focus:border-secondary focus:ring-3 focus:ring-secondary-glow/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-bold block mb-1.5">{t.giftName}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hoa Hồng"
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-xl px-4 py-2.5 text-white font-body text-[0.88rem] outline-none focus:border-secondary focus:ring-3 focus:ring-secondary-glow/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-bold block mb-1.5">{t.coins}</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={coins}
                  onChange={(e) => setCoins(parseInt(e.target.value, 10))}
                  placeholder="e.g. 1"
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-xl px-4 py-2.5 text-white font-body text-[0.88rem] outline-none focus:border-secondary focus:ring-3 focus:ring-secondary-glow/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-bold block mb-1.5">{t.iconUrl}</label>
                <input
                  type="text"
                  required
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. https://..."
                  disabled={!isAdmin}
                  className="w-full bg-bg-input border border-border-color rounded-xl px-4 py-2.5 text-white font-body text-[0.82rem] outline-none focus:border-secondary focus:ring-3 focus:ring-secondary-glow/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[0.8rem] text-text-secondary font-bold block mb-1.5">{t.videosLabel}</label>
                <div className="flex flex-col gap-2.5 bg-black/25 border border-border-color rounded-xl p-4">
                  {videos.length === 0 ? (
                    <span className="text-[0.78rem] text-text-muted italic block select-none">
                      {t.noVideos}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {videos.map((video, idx) => {
                        const isActive = video === activeVideo;
                        return (
                          <div
                            key={idx}
                            className={`flex justify-between items-center bg-black/40 px-3.5 py-2.5 rounded-lg border transition-all duration-150 ${isActive ? 'border-secondary/35 bg-secondary/5' : 'border-white/5'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 truncate max-w-[240px]">
                              <button
                                type="button"
                                onClick={() => setActiveVideo(video)}
                                className={`flex items-center justify-center w-5.5 h-5.5 rounded-full border transition-all duration-200 cursor-pointer outline-none ${isActive
                                    ? 'bg-secondary border-secondary text-black shadow-[0_0_8px_rgba(0,242,254,0.35)]'
                                    : 'border-white/30 hover:border-secondary'
                                  }`}
                                title={isActive ? t.activeBadge : t.setActive}
                              >
                                {isActive && <i className="fa-solid fa-check text-[0.7rem] font-extrabold" />}
                              </button>
                              <span className={`text-[0.8rem] font-body truncate ${isActive ? 'text-secondary font-bold' : 'text-white/90'}`}>
                                {video}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="text-primary hover:text-primary-glow text-[0.88rem] cursor-pointer outline-none transition-colors duration-150 active:scale-[0.9] ml-2"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-1 select-none">
                      <label className="relative inline-flex items-center justify-center px-4 py-2.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/20 hover:border-secondary/35 rounded-xl text-secondary font-body text-[0.82rem] font-bold cursor-pointer outline-none transition-all duration-200 w-full text-center active:scale-[0.98] shadow-sm">
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

              <div>
                <label className="text-[0.8rem] text-text-secondary font-bold block mb-1.5">{t.soundsLabel}</label>
                <div className="flex flex-col gap-2.5 bg-black/25 border border-border-color rounded-xl p-4">
                  {sounds.length === 0 ? (
                    <span className="text-[0.78rem] text-text-muted italic block select-none">
                      {t.noSounds}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {sounds.map((sound, idx) => {
                        const isActive = sound === activeSound;
                        return (
                          <div
                            key={idx}
                            className={`flex justify-between items-center bg-black/40 px-3.5 py-2.5 rounded-lg border transition-all duration-150 ${isActive ? 'border-secondary/35 bg-secondary/5' : 'border-white/5'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 truncate max-w-[240px]">
                              <button
                                type="button"
                                onClick={() => setActiveSound(sound)}
                                className={`flex items-center justify-center w-5.5 h-5.5 rounded-full border transition-all duration-200 cursor-pointer outline-none ${isActive
                                    ? 'bg-secondary border-secondary text-black shadow-[0_0_8px_rgba(0,242,254,0.35)]'
                                    : 'border-white/30 hover:border-secondary'
                                  }`}
                                title={isActive ? t.activeBadge : t.setActive}
                              >
                                {isActive && <i className="fa-solid fa-check text-[0.7rem] font-extrabold" />}
                              </button>
                              <span className={`text-[0.8rem] font-body truncate ${isActive ? 'text-secondary font-bold' : 'text-white/90'}`}>
                                {sound}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSounds((prev) => {
                                  const next = prev.filter((_, idx2) => idx2 !== idx);
                                  if (activeSound === sound) {
                                    setActiveSound(next[0] || '');
                                  }
                                  return next;
                                });
                              }}
                              className="text-primary hover:text-primary-glow text-[0.88rem] cursor-pointer outline-none transition-colors duration-150 active:scale-[0.9] ml-2"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-1 select-none">
                      <label className="relative inline-flex items-center justify-center px-4 py-2.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/20 hover:border-secondary/35 rounded-xl text-secondary font-body text-[0.82rem] font-bold cursor-pointer outline-none transition-all duration-200 w-full text-center active:scale-[0.98] shadow-sm">
                        <i className={`fa-solid ${uploadingSound ? 'fa-spinner animate-spin' : 'fa-cloud-arrow-up'} mr-2`} />
                        {uploadingSound ? t.uploadingSoundText : t.uploadSoundBtn}
                        <input
                          type="file"
                          accept="audio/*"
                          disabled={uploadingSound}
                          onChange={handleSoundUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2.5 mt-3 justify-end border-t border-border-color/60 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-body text-[0.85rem] font-semibold cursor-pointer outline-none transition-all duration-150 active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <Button type="submit" className="px-5 py-2.5 rounded-xl">
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
