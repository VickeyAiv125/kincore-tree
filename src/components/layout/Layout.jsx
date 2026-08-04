import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from '../common/NotificationBell';
import { useCouncil } from '../../context/CouncilContext';

const SidebarItem = ({ icon, label, path, active = false, onClick }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => {
                navigate(path);
                if (onClick) onClick();
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-brand-active text-brand-orange dark:bg-brand-orange/10' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-brand-darkBorder'}`}
        >
            <div className="w-5 h-5">{icon}</div>
            <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
        </div>
    );
};

const Layout = ({ children }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [customLabels, setCustomLabels] = useState({});
    const { assignedFamilies, selectedFamilyId, setSelectedFamilyId, reloadFamilies } = useCouncil();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const isAppView = new URLSearchParams(location.search).get('view') === 'app';

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            if (parsedUser.role === 'council') {
                reloadFamilies();
            }

            // Skip role-based redirects if we are in App WebView mode
            if (isAppView) return;

            // Basic role-based access control
            const isSharedPath =
                currentPath === '/audit-logs' ||
                currentPath === '/unauthorized' ||
                currentPath.startsWith('/governance') ||
                currentPath.startsWith('/migration') ||
                currentPath.startsWith('/events') ||
                currentPath.startsWith('/media') ||
                currentPath.startsWith('/subscription') ||
                currentPath.startsWith('/reports') ||
                currentPath.startsWith('/support') ||
                currentPath.startsWith('/settings');

            if (parsedUser.role === 'family' && !isSharedPath && (currentPath.startsWith('/owner') || currentPath.startsWith('/council') || currentPath.startsWith('/branch'))) {
                navigate('/dashboard');
            } else if (parsedUser.role === 'owner' && !isSharedPath && (!currentPath.startsWith('/owner') && !currentPath.startsWith('/member-registry'))) {
                navigate('/owner/dashboard');
            } else if (parsedUser.role === 'council' && !isSharedPath && !currentPath.startsWith('/council')) {
                navigate('/council/dashboard');
            } else if (parsedUser.role === 'branch-admin' && !isSharedPath && !currentPath.startsWith('/branch')) {
                navigate('/branch/dashboard');
            } else if (!isSharedPath && ((currentPath.startsWith('/council') && parsedUser.role !== 'council') || (currentPath.startsWith('/branch') && parsedUser.role !== 'branch-admin'))) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate, currentPath, reloadFamilies]);

    useEffect(() => {
        const fetchCustomLabels = async () => {
            if (!user) return;
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const famId = user.role === 'council' ? selectedFamilyId : user.family_id;
            
            if (!famId) return;

            try {
                const response = await fetch(`${baseUrl}/families/${famId}/custom-labels`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const labelsMap = {};
                    data.forEach(item => {
                        labelsMap[item.role_key] = item.custom_label;
                    });
                    setCustomLabels(labelsMap);
                }
            } catch (err) {
                console.error('Failed to fetch custom labels', err);
            }
        };

        fetchCustomLabels();
    }, [user, selectedFamilyId]);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const familyNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { path: '/governance', label: 'Governance & Role', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { path: '/lineage-registry', label: 'Lineage Registry', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { path: '/content-moderation', label: 'Content Moderation', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { path: '/events', label: 'Events & Engagement', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { path: '/mall', label: 'Mall', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
        { path: '/media', label: 'Media Repository', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { path: '/subscription', label: 'Subscription', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { path: '/migration', label: 'Migration Map', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
        { path: '/kcc', label: 'KCC Coin', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 8V7m0 1v1m-3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg> },
        { path: '/policies', label: 'Policies', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { path: '/reports', label: 'Reports', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { path: '/support', label: 'Help & Support', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { path: '/settings', label: 'Settings', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    const ownerNavItems = [
        { path: '/owner/dashboard', label: 'Dashboard', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { path: '/owner/members', label: 'Members', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { path: '/owner/branches', label: 'Branches', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
        { path: '/owner/branch-approvals', label: 'Branch Approvals', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { path: '/owner/family-tree', label: 'Family Tree', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { path: '/owner/events', label: 'Events', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { path: '/owner/privacy', label: 'Privacy', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { path: '/owner/governance', label: 'Governance', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
        { path: '/owner/custom-labels', label: 'Custom Labels', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
        { path: '/owner/system', label: 'System', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    const councilNavItems = [
        { path: '/council/dashboard', label: 'Dashboard', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { path: '/council/members', label: 'Members', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { path: '/council/branches', label: 'Branches', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
        { path: '/council/family-tree', label: 'Family Tree', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { path: '/council/events', label: 'Events & Content', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { path: '/council/privacy', label: 'Privacy', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { path: '/council/governance', label: 'Governance', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    ];

    const branchNavItems = [
        { path: '/branch/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { path: '/branch/members', label: 'Branch Members', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { path: '/branch/events', label: 'Branch Events', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { path: '/branch/approvals', label: 'Branch Edit Approvals', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    ];

    const navItems = user?.role === 'owner' ? ownerNavItems : user?.role === 'council' ? councilNavItems : user?.role === 'branch-admin' ? branchNavItems : familyNavItems;
    const sidebarTitle = user?.role === 'owner' ? user.email : user?.role === 'council' ? 'Family Council' : user?.role === 'branch-admin' ? 'The Bennetts' : 'Family Hub';
    
    const getRoleSubtitle = () => {
        if (user?.role === 'owner') return `${customLabels['owner'] || 'Owner'} Dashboard`;
        if (user?.role === 'council') return customLabels['council'] || 'Council Elder';
        if (user?.role === 'branch-admin') return `${customLabels['branch_admin'] || 'Branch Leader'} Dashboard`;
        if (user?.role === 'admin') return `${customLabels['admin'] || 'Family Admin'} Dashboard`;
        return `${customLabels['member'] || 'Member'} Dashboard`;
    };
    
    const sidebarSubtitle = getRoleSubtitle();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (!user) return null;

    // Check if we are in 'App' or 'WebView' mode
    const isAppView = new URLSearchParams(location.search).get('view') === 'app';

    if (isAppView) {
        return (
            <div className="min-h-screen bg-brand-sidebg dark:bg-brand-darkBg font-sans overflow-hidden">
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-brand-sidebg dark:bg-brand-darkBg font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-brand-darkCard border-b border-gray-100 dark:border-brand-darkBorder p-4 flex items-center justify-between z-50">
                <div className="flex items-center space-x-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-brand-darkText leading-none">{sidebarTitle}</h2>
                        <p className="text-[10px] text-gray-400 font-medium">{sidebarSubtitle}</p>
                    </div>
                    {user?.role === 'council' && assignedFamilies.length > 0 && (
                        <select
                            value={selectedFamilyId}
                            onChange={(e) => setSelectedFamilyId(e.target.value)}
                            className="bg-gray-50 dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-lg py-1.5 px-2 text-[10px] font-black text-gray-800 dark:text-brand-darkText outline-none"
                        >
                            {assignedFamilies.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <NotificationBell />
                    <ThemeToggle />
                    <button onClick={toggleMenu} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-brand-darkBorder rounded-lg transition-colors">
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleMenu}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-brand-darkCard border-r border-gray-100 dark:border-brand-darkBorder p-6 flex flex-col h-full overflow-y-auto transition-transform duration-300 transform
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="hidden lg:flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-brand-darkText break-all">{sidebarTitle}</h2>
                        <p className="text-xs text-gray-400 font-medium">{sidebarSubtitle}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        <NotificationBell />
                        <ThemeToggle />
                    </div>
                </div>

                {user?.role === 'council' && assignedFamilies.length > 0 && (
                    <div className="mb-6 p-4 bg-orange-50/50 dark:bg-brand-orange/5 border border-brand-orange/10 rounded-2xl">
                        <label className="block text-[9px] font-black text-brand-orange uppercase tracking-widest mb-1.5 px-0.5">Family Space Selector</label>
                        <select
                            value={selectedFamilyId}
                            onChange={(e) => setSelectedFamilyId(e.target.value)}
                            className="w-full bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl py-2 px-3 text-xs font-black text-gray-800 dark:text-brand-darkText outline-none focus:ring-2 focus:ring-brand-orange/20"
                        >
                            {assignedFamilies.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            path={item.path}
                            active={currentPath === item.path}
                            label={item.label}
                            onClick={() => setIsMobileMenuOpen(false)}
                            icon={item.icon}
                        />
                    ))}
                </nav>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-brand-darkBorder">
                    <SidebarItem
                        path={user?.role === 'owner' ? '/owner/audit-logs' : '/audit-logs'}
                        active={currentPath.includes('audit-logs')}
                        label="Audit Logs"
                        onClick={() => setIsMobileMenuOpen(false)}
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                    />
                    <div
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-colors text-red-500 hover:bg-red-50 mt-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className="text-sm font-medium">Logout</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 bg-brand-sidebg dark:bg-brand-darkBg min-h-screen">
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, { customLabels });
                    }
                    return child;
                })}
            </div>
        </div>
    );
};

export default Layout;
