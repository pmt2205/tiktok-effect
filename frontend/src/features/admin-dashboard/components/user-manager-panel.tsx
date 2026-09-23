'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from '@/components/ui/glass-card';
import LoadingIndicator from '@/components/ui/loading-indicator';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store/hooks';

interface UserRecord {
  _id: string;
  username: string;
  role: string;
  allowConnect: boolean;
  allowNpc?: boolean;
  allowedNpcCategories?: string[];
  subscriptionTier?: 'free' | 'pro' | 'promax';
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  createdAt?: string;
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function getDefaultSubscriptionDates() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  return { subscriptionStartedAt: start.toISOString(), subscriptionExpiresAt: end.toISOString() };
}

export default function UserManagerPanel() {
  const toast = useToast();
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string; displayName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    vi: {
      title: 'Quản lý tài khoản người dùng',
      subtitle: 'Xem danh sách tài khoản đã đăng ký và thu hồi quyền truy cập khi cần.',
      listTitle: 'Danh sách người dùng hệ thống',
      username: 'Tên người dùng',
      role: 'Vai trò',
      plan: 'Gói dịch vụ',
      allowConnect: 'Quyền Connect',
      allowNpc: 'Quyền NPC',
      allowedCats: 'Thể loại NPC được phép',
      actions: 'Thao tác',
      delete: 'Xóa tài khoản',
      noUsers: 'Không có tài khoản nào được tìm thấy.',
      confirmDelete: 'Bạn có chắc chắn muốn xóa tài khoản người dùng này?',
      successDelete: 'Đã xóa tài khoản thành công!',
      permissionError: 'Chỉ quản trị viên mới có quyền quản lý người dùng.',
      adminRole: 'Quản trị viên',
      userRole: 'Người dùng',
    },
    en: {
      title: 'User Accounts Directory',
      subtitle: 'Inspect registered accounts and revoke system access permissions.',
      listTitle: 'Registered System Users',
      username: 'Username',
      role: 'System Role',
      plan: 'Plan',
      allowConnect: 'Allow Connection',
      allowNpc: 'Allow NPC Mode',
      allowedCats: 'Allowed NPC Themes',
      actions: 'Actions',
      delete: 'Delete Account',
      noUsers: 'No accounts registered yet.',
      confirmDelete: 'Are you sure you want to revoke and delete this account?',
      successDelete: 'User account removed successfully!',
      permissionError: 'Admin authorization permissions required.',
      adminRole: 'Administrator',
      userRole: 'Viewer User',
    }
  }[language];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/settings/npc-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
    void Promise.resolve().then(fetchCategories);
  }, []);

  const handleTogglePermission = async (id: string, key: 'allowConnect' | 'allowNpc', val: boolean) => {
    if (!isAdmin) {
      toast.error(t.permissionError);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: val })
      });

      if (res.ok) {
        toast.success(language === 'vi' ? 'Đã cập nhật quyền thành công!' : 'Permissions updated successfully!');
        setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, [key]: val } : u)));
      } else {
        toast.error('Failed to update permission.');
      }
    } catch (err) {
      console.error('Failed to update permissions:', err);
      toast.error('Network communication failed.');
    }
  };

  const handleUpdateCategories = async (id: string, cats: string[]) => {
    if (!isAdmin) {
      toast.error(t.permissionError);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ allowedNpcCategories: cats })
      });

      if (res.ok) {
        toast.success(language === 'vi' ? 'Đã cập nhật danh sách thể loại thành công!' : 'NPC Categories list updated successfully!');
        setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, allowedNpcCategories: cats } : u)));
      } else {
        toast.error('Failed to update categories.');
      }
    } catch (err) {
      console.error('Failed to update categories:', err);
      toast.error('Network communication failed.');
    }
  };

  const handleUpdateSubscription = async (id: string, updates: Pick<UserRecord, 'subscriptionTier' | 'subscriptionStartedAt' | 'subscriptionExpiresAt'>) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${id}/permissions`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(updates) });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      const updatedUser = await res.json();
      setUsers((current) => current.map((user) => user._id === id ? { ...user, ...updatedUser } : user));
      toast.success(language === 'vi' ? 'Đã cập nhật gói người dùng.' : 'User plan updated.');
    } catch (error) {
      console.error('Failed to update subscription tier:', error);
      toast.error(language === 'vi' ? 'Không thể cập nhật gói.' : 'Could not update plan.');
    }
  };

  const handleUpdateTier = (user: UserRecord, subscriptionTier: 'free' | 'pro' | 'promax') => {
    const dates = subscriptionTier === 'free'
      ? { subscriptionStartedAt: null, subscriptionExpiresAt: null }
      : getDefaultSubscriptionDates();
    void handleUpdateSubscription(user._id, { subscriptionTier, ...dates });
  };

  const handleUpdateSubscriptionDate = (user: UserRecord, field: 'subscriptionStartedAt' | 'subscriptionExpiresAt', value: string) => {
    void handleUpdateSubscription(user._id, { [field]: value ? new Date(`${value}T00:00:00`).toISOString() : null });
  };

  const handleDelete = async (user: UserRecord) => {
    if (user.username === 'admin') {
      toast.error('Cannot delete the root admin account.');
      return;
    }
    if (!window.confirm(t.confirmDelete)) return;
    if (!isAdmin) {
      toast.error(t.permissionError);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.info(t.successDelete);
        fetchUsers();
      } else {
        toast.error('Revocation request failed.');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Network communication failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.6s_ease-out]">
      <div className="sticky top-0 bg-bg-dark/80 backdrop-blur-md z-30 flex flex-col gap-1.5 border-b border-border-color pb-3 pt-1 md:pb-4 md:pt-8 md:-mt-8 select-none">
        <h2 className="font-header text-[1.4rem] font-bold text-text-main tracking-[0.5px] uppercase">{t.title}</h2>
        <p className="text-[0.88rem] text-text-muted">{t.subtitle}</p>
      </div>

      <GlassCard
        headerIcon={<i className="fa-solid fa-users text-secondary" />}
        headerTitle={t.listTitle}
      >
        {loading ? (
          <div className="flex justify-center py-16"><LoadingIndicator size="lg" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-[0.88rem] text-text-muted">
            {t.noUsers}
          </div>
        ) : (
          <div className="overflow-x-auto w-full rounded-xl border border-border-color/80 bg-bg-input shadow-inner">
            <table className="w-full text-left border-collapse font-body text-[0.88rem]">
              <thead>
                <tr className="border-b border-border-color/80 bg-bg-surface/80 text-text-muted font-header font-bold text-[0.78rem] tracking-[1px] uppercase select-none">
                  <th className="py-4 px-5">{t.username}</th>
                  <th className="py-4 px-5">{t.role}</th>
                  <th className="py-4 px-5">{t.plan}</th>
                  <th className="py-4 px-5">{t.allowConnect}</th>
                  <th className="py-4 px-5">{t.allowNpc}</th>
                  <th className="py-4 px-5">{t.allowedCats}</th>
                  <th className="py-4 px-5 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-border-color/30 hover:bg-white/[0.02] transition-all duration-150 group"
                  >
                    <td className="py-4.5 px-5 font-semibold text-text-main">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 group-hover:border-secondary/40 transition-colors duration-250 flex items-center justify-center text-secondary text-[0.82rem] font-bold uppercase select-none">
                          {u.username.substring(0, 2)}
                        </div>
                        <span className="font-header tracking-[0.3px] group-hover:text-secondary transition-colors duration-150">{u.username}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-bold uppercase tracking-[0.5px] border select-none ${u.role === 'admin'
                          ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_2px_8px_rgba(255,0,80,0.1)]'
                          : 'bg-secondary/10 border-secondary/20 text-secondary shadow-[0_2px_8px_rgba(0,242,254,0.06)]'
                        }`}>
                        {u.role === 'admin' ? t.adminRole : t.userRole}
                      </span>
                    </td>
                    <td className="min-w-[260px] py-4.5 px-5">
                      {u.role === 'admin' ? <span className="text-xs font-bold text-primary">PRO MAX</span> : <div className="flex flex-col gap-2.5">
                        <select value={u.subscriptionTier || 'free'} onChange={(event) => handleUpdateTier(u, event.target.value as 'free' | 'pro' | 'promax')} className="rounded-md border border-border-color bg-bg-input px-2.5 py-2 text-xs font-bold text-text-main outline-none transition-all duration-200 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25"><option value="free">Thường · Free</option><option value="pro">Pro · 99K lần đầu · 49K gia hạn</option><option value="promax">Pro Max · 299K lần đầu · 149K gia hạn</option></select>
                        {u.subscriptionTier !== 'free' && <div className="grid grid-cols-2 gap-2">
                          <label className="flex flex-col gap-1 text-[0.65rem] font-semibold text-text-muted">
                            {language === 'vi' ? 'Bắt đầu' : 'Starts'}
                            <input type="date" value={toDateInputValue(u.subscriptionStartedAt)} onChange={(event) => handleUpdateSubscriptionDate(u, 'subscriptionStartedAt', event.target.value)} className="min-w-0 rounded-md border border-border-color bg-bg-input px-2 py-1.5 text-[0.7rem] text-text-main outline-none transition-all duration-200 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25" />
                          </label>
                          <label className="flex flex-col gap-1 text-[0.65rem] font-semibold text-text-muted">
                            {language === 'vi' ? 'Hết hạn' : 'Expires'}
                            <input type="date" min={toDateInputValue(u.subscriptionStartedAt)} value={toDateInputValue(u.subscriptionExpiresAt)} onChange={(event) => handleUpdateSubscriptionDate(u, 'subscriptionExpiresAt', event.target.value)} className="min-w-0 rounded-md border border-border-color bg-bg-input px-2 py-1.5 text-[0.7rem] text-text-main outline-none transition-all duration-200 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25" />
                          </label>
                        </div>}
                      </div>}
                    </td>
                    <td className="py-4.5 px-5">
                      {u.role !== 'admin' ? (
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={u.allowConnect || false}
                            onChange={(e) => handleTogglePermission(u._id, 'allowConnect', e.target.checked)}
                            disabled={!isAdmin}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-text-muted after:border-border-color after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-secondary/40 peer-checked:after:bg-secondary peer-checked:after:border-secondary border border-border-color/80 shadow-inner"></div>
                        </label>
                      ) : (
                        <span className="text-[0.75rem] text-text-muted italic select-none font-semibold">Always Allowed</span>
                      )}
                    </td>
                    <td className="py-4.5 px-5">
                      {u.role !== 'admin' ? (
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={u.allowNpc || false}
                            onChange={(e) => handleTogglePermission(u._id, 'allowNpc', e.target.checked)}
                            disabled={!isAdmin}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-text-muted after:border-border-color after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary/45 peer-checked:after:bg-primary peer-checked:after:border-primary border border-border-color/80 shadow-inner"></div>
                        </label>
                      ) : (
                        <span className="text-[0.75rem] text-text-muted italic select-none font-semibold">Always Allowed</span>
                      )}
                    </td>
                    <td className="py-4.5 px-5 relative">
                      {u.role !== 'admin' && (u.allowNpc || false) ? (
                        <NpcCategoriesSelector
                          key={`${u._id}:${(u.allowedNpcCategories || []).join(',')}`}
                          user={u}
                          allCategories={categories}
                          onSave={(cats) => handleUpdateCategories(u._id, cats)}
                          language={language}
                        />
                      ) : (
                        <span className="text-[0.78rem] text-text-muted italic select-none">
                          {u.role === 'admin' ? 'All (Admin)' : 'NPC Disabled'}
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 px-5 text-right">
                      {isAdmin && u.username !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/25 hover:border-primary/30 text-primary text-[0.78rem] font-semibold transition-all duration-200 cursor-pointer outline-none active:scale-[0.96] flex items-center gap-1.5 ml-auto shadow-[0_2px_8px_rgba(255,0,80,0.05)]"
                        >
                          <i className="fa-solid fa-user-minus" />
                          {t.delete}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// Multi-select dropdown selector for allowed categories
function NpcCategoriesSelector({
  user,
  allCategories,
  onSave,
  language,
}: {
  user: UserRecord;
  allCategories: { _id: string; name: string; displayName: string }[];
  onSave: (categories: string[]) => void;
  language: 'vi' | 'en';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(user.allowedNpcCategories || []);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      // Listen to scroll events on any element (useCapture = true)
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const handleToggleCategory = (catName: string) => {
    setSelected((prev) => {
      const next = prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName];
      return next;
    });
  };

  const handleSave = () => {
    onSave(selected);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 rounded-lg bg-bg-input border border-border-color hover:border-secondary/30 text-text-main font-body text-[0.8rem] font-semibold flex items-center gap-2 select-none cursor-pointer outline-none active:scale-[0.98] min-w-[140px] justify-between transition-all duration-200"
      >
        <span className="truncate max-w-[100px] text-left">
          {selected.length === 0
            ? (language === 'vi' ? 'Chọn thể loại' : 'Select themes')
            : `${selected.length} ${language === 'vi' ? 'đã chọn' : 'selected'}`}
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-[0.7rem] text-text-secondary`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Global click-outside overlay */}
          <div className="fixed inset-0 z-[1000] cursor-default" onClick={handleSave} />
          
          <div 
            style={{
              position: 'absolute',
              top: `${coords.top + 8}px`,
              left: `${coords.left}px`,
              width: '230px',
            }}
            className="z-[1001] bg-bg-surface border border-border-color rounded-xl p-3.5 flex flex-col gap-3 animate-[fade-in-up_0.18s_cubic-bezier(0.16,1,0.3,1)] backdrop-blur-[24px]"
          >
            <span className="text-[0.75rem] font-bold text-text-secondary select-none border-b border-border-color/85 pb-2">
              {language === 'vi' ? 'Chọn các thể loại NPC:' : 'Select NPC Themes:'}
            </span>
            
            <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto custom-scrollbar">
              {allCategories.map((c) => {
                const isChecked = selected.includes(c.name);
                return (
                  <label
                    key={c.name}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-[0.8rem] text-text-main transition-all select-none border border-transparent ${isChecked
                        ? 'bg-secondary/5 border-secondary/15 text-secondary font-semibold'
                        : 'hover:bg-white/[0.04] text-text-secondary'
                      }`}
                  >
                    <span>{c.displayName}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCategory(c.name)}
                      className="rounded-md border-border-color/80 text-secondary focus:ring-secondary-glow bg-bg-input w-4 h-4 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-border-color/60 pt-2.5">
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 py-2 rounded-lg bg-secondary text-black font-body text-[0.75rem] font-bold cursor-pointer outline-none hover:bg-secondary/90 transition-colors active:scale-[0.96]"
              >
                {language === 'vi' ? 'Xác nhận' : 'Confirm'}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
