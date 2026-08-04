import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveFamilySpaceId } from '../../utils/familySpace';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const formatNumber = (value) => {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? numeric.toLocaleString() : '0';
};

const formatKcc = (value) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return '0 KCC';
    return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 4 })} KCC`;
};

const timeAgo = (dateValue) => {
    if (!dateValue) return 'Just now';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const diff = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.floor(diff / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const StatsCard = ({ title, value, change = 'Live', isPositive = true, loading = false }) => (
    <div className="bg-white dark:bg-brand-darkCard p-5 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText mb-1">{loading ? '...' : value}</h3>
        <p className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {change}
        </p>
    </div>
);

const Dashboard = ({ customLabels = {} }) => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Missing session token. Please sign in again.');
                    setLoading(false);
                    return;
                }

                const id = await resolveFamilySpaceId();
                if (!id) {
                    setError('No family space found for this account.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE}/family-admin/${id}/dashboard?t=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Unable to load dashboard');

                setDashboard(data);
                setError('');
            } catch (err) {
                console.error('Failed to fetch family admin dashboard:', err);
                setError(err.message || 'Unable to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const stats = dashboard?.stats || {};
    const activity = dashboard?.activity_feed || [];
    const alerts = dashboard?.alerts || {};
    const claimResolution = dashboard?.performance?.claim_resolution;
    const growthData = dashboard?.performance?.member_growth || [];
    const growthLabels = growthData.length ? growthData.map((item) => item.month || item.label || '') : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const growthPath = growthData.length ? 'M0,120 Q80,90 150,105 T300,70 T400,45' : 'M0,120 Q50,80 100,100 T200,60 T300,90 T400,40';

    return (
        <div className="w-full max-w-7xl mx-auto">
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-brand-darkText">
                        {customLabels['admin'] ? `${customLabels['admin']} Dashboard` : 'Dashboard'}
                    </h1>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1">Family admin overview synced from backend</p>
                </div>
                {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                )}
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                <StatsCard title="Total Members" value={formatNumber(stats.total_members)} loading={loading} />
                <StatsCard title="Active Claims" value={formatNumber(stats.active_claims)} change={stats.active_claims > 0 ? 'Needs review' : 'Clear'} isPositive={!stats.active_claims} loading={loading} />
                <StatsCard title="Lineage Nodes" value={formatNumber(stats.lineage_nodes)} loading={loading} />
                <StatsCard title="Media Items" value={formatNumber(stats.media_items)} loading={loading} />
                <StatsCard title="KCC Balance" value={formatKcc(stats.kcc_balance)} change="Net family ledger" loading={loading} />
            </div>

            {/* Performance Overview */}
            <div className="mb-8">
                <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-5">Performance Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Member Growth Chart */}
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-colors">
                        <div className="mb-6">
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2">Member Growth</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-brand-darkText">{loading ? '...' : formatNumber(stats.total_members)}</h3>
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1">
                                Current family membership <span className="text-green-500">Live</span>
                            </p>
                        </div>
                        <div className="h-40 flex items-end justify-between relative">
                            {/* SVG Curve */}
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 160">
                                <path
                                    d={growthPath}
                                    fill="none"
                                    stroke="#FF6D4D"
                                    strokeWidth="3"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                            <div className="flex justify-between w-full mt-auto pt-2 relative z-10">
                                {growthLabels.map((m, index) => (
                                    <span key={`${m}-${index}`} className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{m || '-'}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Claim Resolution Rate Chart */}
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-colors">
                        <div className="mb-6">
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2">Claim Resolution Rate</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-brand-darkText">{loading ? '...' : claimResolution === null || claimResolution === undefined ? 'N/A' : `${claimResolution}%`}</h3>
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1">
                                Pending claims <span className={stats.active_claims > 0 ? 'text-red-500' : 'text-green-500'}>{formatNumber(stats.active_claims)}</span>
                            </p>
                        </div>
                        <div className="h-40 flex items-end justify-between gap-2">
                            {[20, 35, 50, 65, 80, Math.max(20, Math.min(100, Number(claimResolution || 0)) || 35)].map((height, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-orange-100 dark:bg-brand-orange/20 rounded-t-lg transition-all"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-2">
                                        Q{(i % 4) + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Left Side: Quick Actions & Primary CTAs */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/member-registry')}
                                className="py-3 px-4 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors"
                            >
                                Add Person
                            </button>
                            <button
                                onClick={() => navigate('/lineage-registry')}
                                className="py-3 px-4 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors"
                            >
                                Approve Requests
                            </button>
                            <button
                                onClick={() => navigate('/governance')}
                                className="py-3 px-4 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors"
                            >
                                Create Branch
                            </button>
                            <button
                                onClick={() => navigate('/events/create')}
                                className="py-3 px-4 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors"
                            >
                                Create Event
                            </button>
                        </div>
                    </div>

                    {/* Primary CTAs */}
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-4">Primary CTAs</h2>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => navigate('/lineage-registry')} className="py-3 px-5 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors">
                                View Pending Approvals
                            </button>
                            <button onClick={() => navigate('/lineage-registry')} className="py-3 px-5 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors">
                                Manage Tree
                            </button>
                            <button onClick={() => navigate('/subscription')} className="py-3 px-5 rounded-xl border-2 border-brand-orange text-brand-orange text-sm font-bold hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-colors">
                                Go to Billing
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Activity Feed & Alerts Panel */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-colors">
                        <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-5">Activity Feed</h2>
                        <div className="space-y-4">
                            {loading && <p className="text-xs font-bold text-gray-400">Loading activity...</p>}
                            {!loading && activity.length === 0 && <p className="text-xs font-bold text-gray-400">No recent family activity yet.</p>}
                            {activity.slice(0, 6).map((item, index) => (
                                <div key={`${item.type || 'activity'}-${index}`} className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-brand-orange/20 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{item.title || 'Family activity'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description || item.actor || 'Updated family records'} - {timeAgo(item.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-colors">
                        <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText mb-5">Alerts Panel</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-brand-orange/20 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">Pending moderation</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{loading ? '...' : formatNumber(alerts.pending_moderation)} items pending</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-brand-orange/20 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">Pending claims</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{loading ? '...' : formatNumber(alerts.pending_claims)} requests need review</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
