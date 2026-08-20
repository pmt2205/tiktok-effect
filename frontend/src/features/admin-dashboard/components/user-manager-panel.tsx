'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store/hooks';

interface UserRecord {
  _id: string;
  username: string;
  role: string;
  allowConnect: boolean;
  createdAt?: string;
}

export default function UserManagerPanel() {
  const toast = useToast();
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    vi: {
      title: 'Quản lý tài khoản người dùng',
      subtitle: 'Xem danh sách tài khoản đã đăng ký và thu hồi quyền truy cập khi cần.',
      listTitle: 'Danh sách người dùng hệ thống',
      username: 'Tên người dùng',
      role: 'Vai trò',
      allowConnect: 'Quyền Connect',
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
      allowConnect: 'Allow Connection',
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleTogglePermission = async (id: string, allowConnect: boolean) => {
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
        body: JSON.stringify({ allowConnect })
      });

      if (res.ok) {
        toast.success(language === 'vi' ? 'Đã cập nhật quyền thành công!' : 'Permissions updated successfully!');
        setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, allowConnect } : u)));
      } else {
        toast.error('Failed to update permission.');
      }
    } catch (err) {
      console.error('Failed to update permissions:', err);
      toast.error('Network communication failed.');
    }
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
      <div className="sticky top-0 bg-[#07080d]/80 backdrop-blur-md z-30 flex flex-col gap-1.5 border-b border-border-color pb-4 pt-6 md:pt-8 -mt-6 md:-mt-8 select-none">
        <h2 className="font-header text-[1.4rem] font-bold text-white tracking-[0.5px] uppercase">{t.title}</h2>
        <p className="text-[0.88rem] text-text-muted">{t.subtitle}</p>
      </div>

      <GlassCard
        headerIcon={<i className="fa-solid fa-users" />}
        headerTitle={t.listTitle}
      >
        {loading ? (
          <div className="text-center py-10 text-[0.9rem] text-text-muted select-none">
            <i className="fa-solid fa-spinner animate-spin text-[1.4rem] text-secondary mb-3 block" />
            <span>Loading user registry...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-[0.88rem] text-text-muted">
            {t.noUsers}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse font-body text-[0.88rem]">
              <thead>
                <tr className="border-b border-border-color text-text-muted font-header font-bold text-[0.78rem] tracking-[1px] uppercase select-none">
                  <th className="pb-3 pt-1 px-4">{t.username}</th>
                  <th className="pb-3 pt-1 px-4">{t.role}</th>
                  <th className="pb-3 pt-1 px-4">{t.allowConnect}</th>
                  <th className="pb-3 pt-1 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-border-color/40 hover:bg-white/2 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary text-[0.8rem] font-bold uppercase select-none">
                          {u.username.substring(0, 2)}
                        </div>
                        <span>{u.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[0.72rem] font-semibold border ${
                        u.role === 'admin' 
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'bg-secondary/10 border-secondary/20 text-secondary'
                      } select-none`}>
                        {u.role === 'admin' ? t.adminRole : t.userRole}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {u.role !== 'admin' ? (
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={u.allowConnect || false}
                            onChange={(e) => handleTogglePermission(u._id, e.target.checked)}
                            disabled={!isAdmin}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-border-color after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary/45 peer-checked:after:bg-secondary peer-checked:after:border-secondary border border-border-color/80"></div>
                        </label>
                      ) : (
                        <span className="text-[0.78rem] text-text-muted italic select-none">Always Allowed</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isAdmin && u.username !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="px-3 py-1.5 rounded-sm bg-primary/10 border border-primary/15 hover:bg-primary/20 hover:border-primary/25 text-primary text-[0.78rem] font-semibold transition-all duration-150 cursor-pointer outline-none active:scale-95"
                        >
                          <i className="fa-solid fa-user-minus mr-1.5" />
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
