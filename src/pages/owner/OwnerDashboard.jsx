import React, { useEffect, useState } from 'react';

const StatCard = ({ title, value, change, isPositive = true, loading = false }) => (
    <div className="bg-[#FFF5F3] dark:bg-brand-orange/5 rounded-[1.5rem] p-8 border border-transparent dark:border-brand-darkBorder flex flex-col items-start transition-all hover:shadow-sm dark:hover:shadow-brand-orange/5">
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">{title}</p>
        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-2">
            {loading ? '...' : value}
        </h3>
        {change !== undefined && (
            <p className={`text-[10px] font-extrabold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {isPositive ? '+' : ''}{change}%
            </p>
        )}
    </div>
);

const ActivityItem = ({ icon, title, description, isLast = false }) => (
    <div className="flex items-start space-x-6 relative pb-8 group">
        {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100 dark:bg-brand-darkBorder group-last:hidden transition-colors" />}
        <div className="z-10 w-6 h-6 rounded-full border-2 border-orange-200 dark:border-brand-orange/50 bg-white dark:bg-brand-darkCard flex items-center justify-center p-1.5 shrink-0 transition-colors">
            {icon || <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        </div>
        <div className="text-left">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-1">{title}</h4>
            <p className="text-sm text-brand-orange font-medium opacity-90">{description}</p>
        </div>
    </div>
);

const OwnerDashboard = ({ customLabels = {} }) => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

                // Prioritize selected_family_id from session
                const familyId = localStorage.getItem('selected_family_id') || storedUser?.family_id || 'DEFAULT_FAMILY_ID';
                const endpoint = `${baseUrl}/families/${familyId}/dashboard?t=${Date.now()}`;

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    setStats(data.stats);

                    // Map API activities to UI format
                    const formattedActivities = [
                        ...(data.activity.new_members || []).map(m => ({
                            title: 'New Member Joined',
                            description: `${m.users.first_name} ${m.users.last_name} joined the family`,
                            icon: <svg className="w-full h-full text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        })),
                        ...(data.activity.new_lineage || []).map(p => ({
                            title: 'New Person Added',
                            description: `${p.full_name} added to the lineage`,
                            icon: <svg className="w-full h-full text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        }))
                    ];
                    setActivities(formattedActivities.slice(0, 5));
                }
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight mb-2">
                    {customLabels['owner'] || 'Owner'} Dashboard
                </h1>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Members" value={stats?.total_members || '0'} loading={loading} />
                <StatCard title="Active Branches" value={stats?.trees_active || '0'} loading={loading} />
                <StatCard title="Pending Approvals" value={stats?.pending_requests || '0'} isPositive={false} loading={loading} />
                <StatCard title="Privacy Alerts" value={stats?.privacy_alerts || '0'} loading={loading} />
            </div>

            {/* Governance Status */}
            <div className="mb-16">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">Governance Status</h3>
                <div className="max-w-4xl">
                    <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText mb-4">Governance Health</p>
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-orange-100 dark:bg-brand-orange/10">
                            <div style={{ width: `${stats?.governance_health || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-orange transition-all duration-1000"></div>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-brand-orange mt-3">{stats?.governance_health || 0}%</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-16">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-10">Recent Family Activity</h3>
                <div className="max-w-2xl ml-1">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <ActivityItem
                                key={index}
                                {...activity}
                                isLast={index === activities.length - 1}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">No recent activity detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
