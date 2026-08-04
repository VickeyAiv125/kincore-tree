import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Minus,
    Lock,
    UserCheck,
    Baby,
    Users,
    Activity,
    Calendar,
    Search,
    ChevronRight,
    Heart,
    Skull,
    Search as SearchIcon,
    GitBranch,
    Shield,
    RotateCcw,
    MapPin,
    FileText,
    Loader2
} from 'lucide-react';
import BranchTree from './BranchTree';

const StatCard = ({ icon: Icon, label, value, colorClass = "text-brand-orange", onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-brand-darkCard p-4 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-xs transition-all group ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95' : 'hover:shadow-sm'}`}
    >
        <div className="flex items-center space-x-3 mb-2">
            <div className={`w-8 h-8 rounded-lg bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center transition-colors ${onClick ? 'group-hover:bg-brand-orange/10' : ''}`}>
                <Icon size={16} className={colorClass} />
            </div>
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-2xl font-black text-gray-900 dark:text-brand-darkText">{value}</div>
    </div>
);

const MemberCard = ({ name, dob, dod, gender, location, childrenCount, avatar, isActive = false, status = {}, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center p-4 rounded-2xl border transition-all hover:scale-105 cursor-pointer w-56 shrink-0 relative ${isActive ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/10 ring-2 ring-brand-orange/20 shadow-sm' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard shadow-xs hover:border-brand-orange/30'}`}
    >
        {/* Status Signs/Icons */}
        <div className="absolute -top-2 -right-2 flex -space-x-1.5 z-10">
            {status.isPrivate && (
                <div className="w-6 h-6 bg-white dark:bg-brand-darkCard rounded-full shadow-sm border border-gray-100 dark:border-brand-darkBorder flex items-center justify-center text-gray-400">
                    <Lock size={10} />
                </div>
            )}
            {status.isClaimed && (
                <div className="w-6 h-6 bg-blue-500 rounded-full shadow-sm border-2 border-white dark:border-brand-darkCard flex items-center justify-center text-white">
                    <UserCheck size={10} strokeWidth={3} />
                </div>
            )}
            {status.isMinor && (
                <div className="w-6 h-6 bg-orange-500 rounded-full shadow-sm border-2 border-white dark:border-brand-darkCard flex items-center justify-center text-white">
                    <Baby size={10} />
                </div>
            )}
        </div>

        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-orange-100 dark:border-brand-orange/30 transition-colors bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center">
            <img src={avatar || `https://ui-avatars.com/api/?name=${name}&background=random`} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="ml-4 text-left overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-[11px] font-black text-gray-900 dark:text-brand-darkText leading-tight truncate">{name}</h4>
                <span className={`text-[10px] ${gender === 'Male' ? 'text-blue-500' : 'text-pink-500'} font-bold`}>
                    {gender === 'Male' ? '♂' : '♀'}
                </span>
            </div>

            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                {dob} {dod ? `— ${dod} †` : '—'}
            </p>

            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50 dark:border-brand-darkBorder/50">
                <div className="flex items-center gap-1">
                    <Users size={8} className="text-gray-400" />
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">{childrenCount || 0} Children</span>
                </div>
                {status.branch && <span className="text-[7px] font-black text-brand-orange uppercase bg-orange-50 dark:bg-brand-orange/10 px-1.5 py-0.5 rounded-sm">{status.branch}</span>}
            </div>
        </div>
    </div>
);

const BranchDashboard = ({ customLabels = {} }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branchInfo, setBranchInfo] = useState({ name: 'Loading...' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = localStorage.getItem('token');
                
                // Hardcoded fallback for testing as requested
                let branchId = storedUser?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';

                if (!branchId) {
                    setLoading(false);
                    return;
                }

                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                
                // 1. Fetch Stats
                const statsResp = await fetch(`${baseUrl}/admin/branch/stats/${branchId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResp.json();
                setStats(statsData.stats);
                setBranchInfo(statsData.branch_info);

                // 2. Fetch Members for Tree
                const membersResp = await fetch(`${baseUrl}/admin/branch/members/${branchId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const membersData = await membersResp.json();
                setMembers(membersData);

                setLoading(false);
            } catch (err) {
                console.error('>>> [FETCH_DASHBOARD_ERROR]', err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }
    return (
        <div className="flex min-h-screen w-full relative overflow-x-hidden bg-white dark:bg-brand-darkBg transition-colors">
            <div className="flex-1 p-4 sm:p-8 relative">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none mb-1">
                                    {customLabels['branch_admin'] ? `${customLabels['branch_admin']} Dashboard` : 'Admin Dashboard'}
                                </h2>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText transition-colors">Branch: <span className="text-brand-orange">{branchInfo?.name || 'Loading...'}</span></h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white bg-brand-orange px-2 py-1 rounded-md uppercase tracking-widest">
                                {customLabels['branch_admin'] || 'Branch Leader'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-brand-darkBg dark:text-gray-500 px-2 py-1 rounded-md transition-colors">ID: {branchInfo?.display_id || '---'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group flex-1 sm:flex-none sm:min-w-[300px]">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search relative by name or ID..."
                                className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-gray-600 dark:text-brand-darkText placeholder-gray-400 transition-all focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange shadow-xs"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/branch/members/add')}
                            className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Add Member
                        </button>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                    <StatCard icon={Users} label="Members" value={stats?.members || 0} />
                    <StatCard icon={Heart} label="Households" value={stats?.households || 0} colorClass="text-pink-500" />
                    <StatCard icon={GitBranch} label="Generations" value={stats?.generations || 0} colorClass="text-blue-500" />
                    <StatCard
                        icon={MapPin}
                        label="Migration Nodes"
                        value={stats?.migration_nodes || 0}
                        colorClass="text-green-500"
                        onClick={() => navigate('/migration')}
                    />
                    <StatCard
                        icon={FileText}
                        label="History Chapters"
                        value={stats?.history_chapters || 0}
                        colorClass="text-purple-500"
                        onClick={() => navigate('/owner/audit-logs')}
                    />
                    <StatCard icon={Shield} label="Media Assets" value={stats?.media_assets || 0} colorClass="text-brand-orange" />
                </div>

                {/* Branch Management Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: Users, label: "Manage Members", desc: "Review lineage & roles", color: "bg-blue-50 text-blue-600", path: "/branch/members" },
                        { icon: Shield, label: "Approvals", desc: `${stats?.pending_approvals || 0} pending requests`, color: "bg-orange-50 text-brand-orange", path: "/branch/approvals" },
                        { icon: Calendar, label: "Events", desc: `${stats?.upcoming_events || 0} upcoming events`, color: "bg-green-50 text-green-600", path: "/branch/events" },
                        { icon: MapPin, label: "Migration Map", desc: "Trace ancestry", color: "bg-purple-50 text-purple-600", path: "/migration" }
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="flex items-center p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group text-left"
                        >
                            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                                <action.icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{action.label}</h4>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{action.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tree View Header */}
                <div className="flex flex-col space-y-1 mb-8">
                    <h3 className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-[0.2em]">Genealogy View</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Visualizing lineage & relationships</p>
                </div>

                {/* Tree Area - Strictly Bounded Canvas Viewport */}
                <div className="mt-8 rounded-3xl border border-white/5 bg-brand-darkBg overflow-hidden h-[700px] relative w-full max-w-full">
                    <BranchTree 
                        branchId={branchInfo?.id} 
                        familySpaceId={branchInfo?.family_space_id} 
                    />
                </div>
            </div>
        </div>
    );
};

export default BranchDashboard;
