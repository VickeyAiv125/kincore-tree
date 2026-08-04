import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    ShoppingBag,
    ShieldCheck,
    Megaphone,
    ShieldAlert,
    Settings2,
    Activity,
    History,
    Bell,
    User,
    Menu,
    X,
    AlertCircle,
    BarChart3,
    ScrollText,
    MessageSquare,
    CheckCircle2,
    Info,
    Clock
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import ReadOnlyBanner from '../auditor/ReadOnlyBanner';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active
            ? 'bg-[#FFE8E2] text-[#FF6D4D] dark:bg-brand-orange/10'
            : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-brand-darkBorder'
            }`}
    >
        <Icon size={20} className={active ? 'text-[#FF6D4D]' : 'text-gray-400'} />
        <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
    </div>
);

const BusinessLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const storedUser = localStorage.getItem('user');
    const userRole = storedUser ? JSON.parse(storedUser).role : 'business';

    // Notification State & Actions
    const [notifications, setNotifications] = useState([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const fetchNotifications = async () => {
        if (userRole !== 'business' && userRole !== 'devops' && userRole !== 'auditor') return;
        try {
            const token = localStorage.getItem('token');
            let url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/business/notifications`;
            if (userRole === 'devops') url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/devops/notifications`;
            if (userRole === 'auditor') url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/auditor/notifications`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (userRole === 'devops' || userRole === 'auditor') {
                    setNotifications(data.notifications || []);
                } else {
                    setNotifications(data);
                }
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userRole]);

    const handleMarkAllRead = async () => {
        if (userRole === 'devops' || userRole === 'auditor') return; // State-driven
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/business/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchNotifications();
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const handleNotificationClick = async (notif) => {
        setSelectedNotification(notif);
        setIsNotificationsOpen(false);
        if (userRole === 'devops' || userRole === 'auditor') return; // State-driven alerts do not have explicit "read" state
        
        if (!notif.read_at) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/business/notifications/${notif.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    fetchNotifications();
                }
            } catch (err) {
                console.error('Error marking notification as read:', err);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const formatTimeAgo = (dateStr) => {
        try {
            const date = new Date(dateStr);
            const seconds = Math.floor((new Date() - date) / 1000);
            if (seconds < 60) return 'Just now';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        } catch (e) {
            return '';
        }
    };

    const menuConfigs = {
        business: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/business/dashboard' },
            { label: 'Family Spaces', icon: Building2, path: '/business/family-spaces' },
            { label: 'Space Requests', icon: Clock, path: '/business/family-spaces/requests' },
            { label: 'Billing', icon: CreditCard, path: '/business/billing' },
            { label: 'Mall', icon: ShoppingBag, path: '/business/operations' },
            { label: 'Governance', icon: ShieldCheck, path: '/business/governance' },
            { label: 'Ads & Promotions', icon: Megaphone, path: '/business/ads' },
            { label: 'Trust & Safety', icon: ShieldAlert, path: '/business/safety' },
            { label: 'Support Tickets', icon: MessageSquare, path: '/business/support' },
            { label: 'System Config', icon: Settings2, path: '/business/config' },
            { label: 'Reliability', icon: Activity, path: '/business/reliability' },
            { label: 'Audit Logs', icon: History, path: '/business/audit' },
        ],
        devops: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/devops/dashboard' },
            { label: 'Incident Management', icon: AlertCircle, path: '/devops/incidents' },
            { label: 'Monitoring', icon: BarChart3, path: '/devops/monitoring' },
            { label: 'Logs Explorer', icon: ScrollText, path: '/devops/logs' },
            { label: 'Modify System Config', icon: Settings2, path: '/devops/config' },
            { label: 'Background Job Control', icon: Activity, path: '/devops/jobs' },
        ],
        auditor: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/auditor/dashboard' },
            { label: 'View Billing', icon: CreditCard, path: '/auditor/billing' },
            { label: 'Access Audit Logs', icon: History, path: '/auditor/audit' },
            { label: 'Abuse Workflow', icon: ShieldAlert, path: '/auditor/abuse' },
        ]
    };

    const menuItems = menuConfigs[userRole] || menuConfigs.business;

    const getDashboardTitle = () => {
        switch (userRole) {
            case 'devops': return 'DevOps Panel';
            case 'auditor': return 'Audit Portal';
            default: return 'Business Dashboard';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-brand-darkBg font-sans">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-brand-darkCard border-r border-gray-100 dark:border-brand-darkBorder p-6 flex flex-col transition-transform duration-300 lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="mb-10 lg:block">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">{getDashboardTitle()}</h2>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    ))}
                </nav>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-brand-darkBorder">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-red-500 hover:bg-red-50 w-full"
                    >
                        <User size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
                {userRole === 'auditor' && <ReadOnlyBanner />}
                {/* Header */}
                <header className="h-20 bg-white dark:bg-brand-darkCard border-b border-gray-100 dark:border-brand-darkBorder px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500 dark:text-gray-400">
                            <Menu size={24} />
                        </button>
                        <h2 className="ml-4 text-lg font-bold text-gray-800 dark:text-brand-darkText uppercase tracking-tight">{userRole}</h2>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex items-center space-x-4 md:space-x-6">
                        <ThemeToggle />
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-brand-darkCard"></span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    {/* Overlay helper to close dropdown on click outside */}
                                    <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
                                    
                                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-40 p-4 transition-colors">
                                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-brand-darkBorder">
                                            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                Notifications {unreadCount > 0 && `(${unreadCount})`}
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-[10px] font-black text-brand-orange hover:text-brand-orange/80 uppercase tracking-wider transition-colors"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">All caught up!</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => {
                                                    const isUnread = !notif.read_at;
                                                    const isCritical = notif.type === 'CRITICAL';
                                                    const isWarning = notif.type === 'WARNING';
                                                    
                                                    return (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                                                isUnread
                                                                    ? 'bg-gray-50 dark:bg-brand-darkBorder/40 border-l-2 border-brand-orange'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-brand-darkBorder/20 border-l-2 border-transparent'
                                                            }`}
                                                        >
                                                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                                                isCritical 
                                                                    ? 'bg-red-500/10 text-red-500' 
                                                                    : isWarning 
                                                                        ? 'bg-amber-500/10 text-amber-500' 
                                                                        : 'bg-brand-orange/10 text-[#FF6D4D]'
                                                            }`}>
                                                                {isCritical || isWarning ? <AlertCircle size={14} /> : <Info size={14} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className={`text-xs truncate ${isUnread ? 'font-black text-gray-800 dark:text-brand-darkText' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                                                                        {notif.title}
                                                                    </p>
                                                                    <span className="text-[9px] font-bold text-gray-400 shrink-0 uppercase tracking-wider">
                                                                        {formatTimeAgo(notif.created_at)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                                                    {notif.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center space-x-3 pl-4 md:pl-6 border-l border-gray-100 dark:border-brand-darkBorder">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800 dark:text-brand-darkText">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Admin</p>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{getDashboardTitle()}</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-200 dark:bg-brand-darkBorder rounded-full overflow-hidden border border-gray-100 dark:border-brand-darkBorder">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 bg-white dark:bg-brand-darkBg overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Notification Details Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="w-full max-w-lg bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl overflow-hidden shadow-2xl p-6 relative">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedNotification(null)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-brand-darkBorder transition-all"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-6">
                            {/* Header Status Badge */}
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${
                                    selectedNotification.type === 'CRITICAL'
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        : selectedNotification.type === 'WARNING'
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            : 'bg-brand-orange/10 text-[#FF6D4D] border border-brand-orange/20'
                                }`}>
                                    {selectedNotification.type}
                                </span>
                                <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                    <Clock size={12} />
                                    <span>{new Date(selectedNotification.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-gray-800 dark:text-brand-darkText uppercase tracking-wide leading-snug">
                                    {selectedNotification.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {selectedNotification.message}
                                </p>
                            </div>

                            {/* Metadata Details Section */}
                            {selectedNotification.notification_metadata && Object.keys(selectedNotification.notification_metadata).length > 0 && (
                                <div className="p-4 bg-gray-50 dark:bg-brand-darkBg/30 border border-gray-100 dark:border-brand-darkBorder rounded-2xl space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">Payload Metadata</h4>
                                    <pre className="text-[11px] font-mono text-gray-600 dark:text-gray-400 overflow-x-auto max-h-32 custom-scrollbar p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                        {JSON.stringify(selectedNotification.notification_metadata, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Actions / CTA Buttons */}
                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="px-5 py-2.5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-brand-darkBorder transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        const metadata = selectedNotification.notification_metadata || {};
                                        if (metadata.target === 'abuse_reports') {
                                            navigate(userRole === 'auditor' ? '/auditor/abuse' : '/business/safety');
                                        } else if (metadata.target === 'support_tickets') {
                                            navigate('/business/support');
                                        } else if (metadata.target === 'billing') {
                                            navigate('/business/billing');
                                        } else if (metadata.target === 'space_requests') {
                                            navigate('/business/family-spaces/requests');
                                        } else if (metadata.target === 'system_incidents') {
                                            navigate('/devops/incidents');
                                        } else if (metadata.target === 'audit_logs') {
                                            navigate(userRole === 'auditor' ? '/auditor/logs' : '/devops/logs');
                                        } else {
                                            navigate(userRole === 'devops' ? '/devops/dashboard' : userRole === 'auditor' ? '/auditor/dashboard' : '/business/dashboard');
                                        }
                                        setSelectedNotification(null);
                                    }}
                                    className="px-5 py-2.5 bg-[#FF6D4D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF6D4D]/90 shadow-md hover:shadow-lg transition-all"
                                >
                                    Investigate Alert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default BusinessLayout;
