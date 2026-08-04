import React, { useCallback, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const formatTimeAgo = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const getFamilyId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
    };

    const load = useCallback(async () => {
        const token = localStorage.getItem('token');
        const familyId = getFamilyId();
        if (!token || !familyId) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/notifications?limit=40`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setNotifications(data.notifications || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, 45000);
        return () => clearInterval(id);
    }, [load]);

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        const familyId = getFamilyId();
        if (!token || !familyId) return;
        try {
            await fetch(`${API_BASE}/family-admin/${familyId}/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        } catch (err) {
            console.error(err);
        }
    };

    const markOneRead = async (notif) => {
        if (notif.read_at) return;
        const token = localStorage.getItem('token');
        const familyId = getFamilyId();
        if (!token || !familyId) return;
        try {
            await fetch(`${API_BASE}/family-admin/${familyId}/notifications/${notif.id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
            );
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((v) => !v);
                    if (!open) load();
                }}
                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-brand-darkBorder transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-brand-darkCard" />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-40 p-4">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-brand-darkBorder">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="text-[10px] font-black text-brand-orange uppercase tracking-wider"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-[320px] overflow-y-auto space-y-2">
                            {loading && notifications.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center">Loading…</p>
                            ) : notifications.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center font-bold uppercase tracking-wider">All caught up</p>
                            ) : (
                                notifications.map((notif) => {
                                    const unread = !notif.read_at;
                                    return (
                                        <button
                                            key={notif.id}
                                            type="button"
                                            onClick={() => markOneRead(notif)}
                                            className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors ${
                                                unread
                                                    ? 'bg-orange-50/60 dark:bg-brand-orange/10 border-l-2 border-brand-orange'
                                                    : 'hover:bg-gray-50 dark:hover:bg-brand-darkBorder/30 border-l-2 border-transparent'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-2">
                                                    <p className={`text-xs truncate ${unread ? 'font-black text-gray-800 dark:text-brand-darkText' : 'font-medium text-gray-500'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[9px] font-bold text-gray-400 shrink-0 uppercase">
                                                        {formatTimeAgo(notif.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
