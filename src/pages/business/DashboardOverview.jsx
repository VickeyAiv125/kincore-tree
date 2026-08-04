import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    BarChart,
    Bar
} from 'recharts';
import { AlertCircle, ShieldAlert, Activity, Globe, TrendingUp, Users, HardDrive, Loader2 } from 'lucide-react';

const KPICard = ({ title, value, growth, icon: Icon, color = "orange", subtext }) => (
    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:shadow-md dark:shadow-brand-orange/5 flex flex-col justify-between h-full">
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${color === 'red' ? 'bg-red-50 dark:bg-red-900/10 text-red-500' : 'bg-brand-orange/10 text-brand-orange'}`}>
                    <Icon size={20} />
                </div>
                {growth && (
                    <p className={`text-xs font-bold transition-colors ${growth.startsWith('+') ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {growth}
                    </p>
                )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-extrabold text-gray-800 dark:text-brand-darkText transition-colors">{value}</h3>
        </div>
        {subtext && <p className="text-[10px] font-medium text-gray-400 mt-3 border-t border-gray-100 dark:border-brand-darkBorder pt-3">{subtext}</p>}
    </div>
);

const AlertRow = ({ type, message, time, severity }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-brand-darkBorder last:border-0 hover:bg-gray-50/50 dark:hover:bg-brand-darkBg px-6 transition-colors group">
        <div className="flex items-center space-x-4">
            <div className={`w-2 h-2 rounded-full ${severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : severity === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
            <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">{type}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{message}</p>
            </div>
        </div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase whitespace-nowrap">{time}</span>
    </div>
);

const PlatformHealth = ({ label, value, status }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</span>
        <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{value}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </div>
    </div>
);

const DashboardOverview = () => {
    const navigate = useNavigate();
    const [lastAction, setLastAction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/business/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setDashboardData(data);
                setError(null);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to sync live data. Showing last known state.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleAction = (label, target) => {
        setLastAction(label);
        setTimeout(() => {
            setLastAction(null);
            if (target) navigate(target);
        }, 800);
    };

    const chartData = dashboardData?.risk_metrics?.risk_trend_data || [];
    const growthChartData = dashboardData?.stats?.growth_data || [];

    const alerts = dashboardData?.alerts?.critical_incident_logs?.map(inc => ({
        type: inc.title,
        message: `Type: ${inc.type} • Source: ${inc.source}`,
        time: new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: inc.severity || 'INFO'
    })) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-brand-darkText transition-colors">Business Governance</h1>
                    <p className="text-sm text-gray-400 font-medium tracking-tight mt-1">Operator: Platform SuperAdmin • Last Sync: {new Date(dashboardData?.generated_at || Date.now()).toLocaleTimeString()}</p>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
                    dashboardData?.health?.api_status === 'critical' 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' 
                        : dashboardData?.health?.api_status === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30'
                            : 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30'
                }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                        dashboardData?.health?.api_status === 'critical' 
                            ? 'bg-red-500' 
                            : dashboardData?.health?.api_status === 'warning'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                    }`} />
                    <span className={`text-[10px] font-bold uppercase ${
                        dashboardData?.health?.api_status === 'critical' 
                            ? 'text-red-600 dark:text-red-400' 
                            : dashboardData?.health?.api_status === 'warning'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                    }`}>
                        {dashboardData?.health?.api_status === 'critical' 
                            ? 'System Offline' 
                            : dashboardData?.health?.api_status === 'warning'
                                ? 'Degraded Performance'
                                : 'System Operational'}
                    </span>
                </div>
            </div>

            {/* Top Row: Governance KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Critical Alerts" 
                    value={loading ? "..." : (dashboardData?.alerts?.critical_alerts_count || "0")} 
                    growth={error ? "SYNC ERR" : (loading ? "" : "Urgent")} 
                    icon={ShieldAlert} 
                    color="red" 
                />
                <KPICard 
                    title="Abuse Reports" 
                    value={loading ? "..." : (dashboardData?.alerts?.pending_abuse_count || "0")} 
                    growth={loading ? "" : "Live"} 
                    icon={AlertCircle} 
                />
                <KPICard 
                    title="Active Cases" 
                    value={loading ? "..." : (dashboardData?.alerts?.active_cases_count || "0")} 
                    growth={loading ? "" : "Live"} 
                    icon={Activity} 
                />
                <KPICard 
                    title="Family Spaces" 
                    value={loading ? "..." : (dashboardData?.stats?.total_spaces?.toLocaleString() || "0")} 
                    growth={loading ? "" : (dashboardData?.stats?.spaces_growth_pct || "0%")} 
                    icon={Globe} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Critical Incident Log */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors h-full">
                        <div className="flex items-center justify-between bg-gray-50/50 dark:bg-brand-darkBg py-4 px-6 border-b border-gray-100 dark:border-brand-darkBorder">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-brand-darkText uppercase tracking-wider">Critical Incident Log</h3>
                            <button
                                onClick={() => handleAction('DISPATCHES', '/business/audit')}
                                className={`text-[10px] font-bold transition-all ${lastAction === 'DISPATCHES' ? 'text-green-500 scale-110' : 'text-brand-orange hover:opacity-80'}`}
                            >
                                {lastAction === 'DISPATCHES' ? 'LOADING...' : 'VIEW ALL DISPATCHES'}
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-brand-darkBorder min-h-[200px] relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-brand-darkCard/50 flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-brand-orange" size={24} />
                                </div>
                            )}
                            {alerts.length > 0 ? alerts.map((alert, idx) => (
                                <AlertRow key={idx} {...alert} />
                            )) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <ShieldAlert size={32} className="mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No active incidents</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Right Column: Platform Health & Config Stats */}
                <div className="space-y-6 text-brand-darkText">
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Platform Health Summary</h3>
                        <div className="space-y-3">
                            <PlatformHealth label="API Latency" value={dashboardData?.health?.latency_ms ? `${dashboardData.health.latency_ms}ms` : "45ms"} status={dashboardData?.health?.api_status || "healthy"} />
                            <PlatformHealth label="Error Rate" value={dashboardData?.health?.error_rate || "0.00%"} status="healthy" />
                            <PlatformHealth label="DB Health" value={dashboardData?.health?.uptime_pct ? `${dashboardData.health.uptime_pct}%` : "99.9%"} status="healthy" />
                        </div>
                        <button
                            onClick={() => handleAction('RELIABILITY', '/business/reliability')}
                            className={`w-full mt-4 py-2 text-[10px] font-bold rounded-lg transition-all ${lastAction === 'RELIABILITY' ? 'bg-brand-orange text-white' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-darkBorder'}`}
                        >
                            {lastAction === 'RELIABILITY' ? 'OPENING...' : 'OPEN RELIABILITY CONSOLE'}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Risk Snapshot</h3>
                        <div className="h-[120px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <Area type="monotone" dataKey="value" stroke="#FF6D4D" fill="#FF6D4D" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">High Risk Spaces</span>
                            <span className="text-sm font-extrabold text-red-500">{dashboardData?.risk_metrics?.high_risk_spaces || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Secondary Growth Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-brand-darkCard p-8 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-brand-darkText transition-colors">Space Growth (7d)</h3>
                            <p className="text-xs text-gray-400 font-medium">Monitoring family onboarding velocity</p>
                        </div>
                        <TrendingUp className="text-brand-orange" size={20} />
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthChartData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F1F1" />
                                <XAxis dataKey="month" hide />
                                <Bar dataKey="value" fill="#FF6D4D" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:scale-[1.02]">
                        <KPICard 
                            title="Total Users" 
                            value={loading ? "..." : (dashboardData?.stats?.total_users?.toLocaleString() || "0")} 
                            growth={loading ? "" : (dashboardData?.stats?.users_growth_pct || "0%")} 
                            icon={Users} 
                            color="orange" 
                        />
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:scale-[1.02]">
                        <KPICard 
                            title="Storage (Agg)" 
                            value={loading ? "..." : `${dashboardData?.stats?.storage_agg_mb || 0} MB`} 
                            growth="" 
                            icon={HardDrive} 
                            color="orange" 
                            subtext={loading ? "" : `${dashboardData?.stats?.storage_agg_mb || 0} MB is used across all families`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
