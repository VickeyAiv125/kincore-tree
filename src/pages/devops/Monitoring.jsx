import React, { useState, useEffect } from 'react';
import {
    Activity,
    Cpu,
    Database,
    Globe,
    Zap,
    TrendingUp,
    AlertCircle,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    ShieldAlert,
    CreditCard,
    Search,
    Loader2,
    Clock
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const StatCard = ({ label, value, subValue, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-950/20 text-${color}-500`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span className="text-xs font-black">{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-brand-darkText tracking-tight">{value}</h3>
        <p className="text-xs font-bold text-gray-400 mt-1">{subValue}</p>
    </div>
);

const Monitoring = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [timeframe, setTimeframe] = useState('live'); // 'live' or '24h'
    const [toggleMsg, setToggleMsg] = useState(null);

    const handleToggle = (newTimeframe) => {
        if (timeframe === newTimeframe) return;
        setTimeframe(newTimeframe);
        setToggleMsg(`Data view updated to ${newTimeframe.toUpperCase()}`);
        setTimeout(() => setToggleMsg(null), 3000);
    };

    const fetchMonitoringData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/metrics?timeframe=${timeframe}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMetrics(data);
                setErrorMsg(null);
            } else {
                setErrorMsg(data.error || 'API returned an error');
                setMetrics(null);
            }
        } catch (err) {
            console.error('Failed to fetch monitoring data:', err);
            setErrorMsg(err.message);
            setMetrics(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitoringData();
        const interval = setInterval(fetchMonitoringData, 15000);
        return () => clearInterval(interval);
    }, [timeframe]);

    if (loading && !metrics) {
        return (
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Accessing Telemetry Grid...</p>
            </div>
        );
    }

    if (errorMsg && !metrics) {
        return (
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-sm font-bold text-red-500">Backend API Error: {errorMsg}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Please check backend console logs</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">System</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Observability</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight italic">Monitoring Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                    {toggleMsg && (
                        <span className="text-xs font-bold text-emerald-500 animate-pulse transition-opacity duration-300">
                            {toggleMsg}
                        </span>
                    )}
                    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-brand-darkBg p-2 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                        <button 
                            onClick={() => handleToggle('live')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeframe === 'live' ? 'bg-white dark:bg-brand-darkCard text-gray-900 dark:text-brand-darkText shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            Live
                        </button>
                        <button 
                            onClick={() => handleToggle('24h')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeframe === '24h' ? 'bg-white dark:bg-brand-darkCard text-gray-900 dark:text-brand-darkText shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            24H
                        </button>
                    </div>
                </div>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Avg Latency" 
                    value={metrics?.health?.db_latency || '0ms'} 
                    subValue="Real-time DB Response" 
                    icon={Zap} 
                    color="blue" 
                />
                <StatCard 
                    label="Error Rate" 
                    value={metrics?.health?.error_rate || '0.00%'} 
                    subValue="System anomalies" 
                    icon={AlertCircle} 
                    color="red" 
                />
                <StatCard 
                    label="API Uptime" 
                    value={metrics?.health?.api_uptime || '99.9%'} 
                    subValue="Last 30 Days" 
                    icon={TrendingUp} 
                    color="emerald" 
                />
                <StatCard 
                    label="Sync Latency" 
                    value={metrics?.health?.sync_latency || '0ms'} 
                    subValue="Replication lag" 
                    icon={Activity} 
                    color="orange" 
                />
            </div>

            {/* Main Charts - Pending Integration Markers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latency History */}
                <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <Activity size={24} className="text-brand-orange" />
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Latency History</h3>
                        </div>
                    </div>
                    {metrics?.telemetry_history?.length > 0 ? (
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.telemetry_history.map(t => ({
                                    time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    DB: t.db_latency_ms,
                                    Storage: t.storage_latency_ms
                                }))}>
                                    <defs>
                                        <linearGradient id="colorDB" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                                        itemStyle={{ color: '#e5e7eb' }}
                                    />
                                    <Area type="monotone" dataKey="DB" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDB)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-brand-darkBg/50 rounded-3xl border border-dashed border-gray-200 dark:border-brand-darkBorder">
                            <div className="text-center">
                                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collecting Telemetry...</p>
                                <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">Waiting for next cron cycle</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resource Usage */}
                <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <Cpu size={24} className="text-blue-500" />
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Resource Usage</h3>
                        </div>
                    </div>
                    {metrics?.usage ? (
                        <div className="space-y-4 h-[300px] overflow-y-auto pr-2 no-scrollbar">
                            {/* API Server Usage */}
                            <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-left">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>API Server Usage</span>
                                    <span className="text-emerald-500">{metrics.usage.api.uptime_formatted} uptime</span>
                                </h4>
                                <div className="h-16 w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-brand-darkBg rounded-xl border border-dashed border-gray-200 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hardware Metrics Pending</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Render API Integration Required</p>
                                </div>
                            </div>

                            {/* Database Usage */}
                            <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-left">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Database Usage</span>
                                    <span className="text-brand-orange">{metrics.health.status}</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Avg Response</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{metrics.usage.database.avg_time_ms}ms</p>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Sync Delay</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{metrics.health.sync_latency}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Storage Usage */}
                            <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-left">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Storage Usage</span>
                                    <span className="text-blue-500">{metrics.usage.storage.total_gb} GB</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder flex justify-between items-center px-3">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Error Rate</span>
                                        <span className="text-xs font-black text-gray-900 dark:text-brand-darkText">{metrics.usage.storage.error_rate}</span>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder flex justify-between items-center px-3">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">API Latency</span>
                                        <span className="text-xs font-black text-gray-900 dark:text-brand-darkText">{metrics.usage.storage.latency_ms}ms</span>
                                    </div>
                                </div>
                            </div>

                            {/* Background Jobs Usage */}
                            <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-left">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Background Jobs</span>
                                    <span className="text-emerald-500">{metrics.usage.jobs.workers} Active Workers</span>
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Pending</p>
                                        <p className="text-sm font-black text-orange-500">{metrics.usage.jobs.pending}</p>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Failed</p>
                                        <p className="text-sm font-black text-red-500">{metrics.usage.jobs.failed}</p>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Retried</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{metrics.usage.jobs.retried}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[300px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-brand-darkBg/50 rounded-3xl border border-dashed border-gray-200 dark:border-brand-darkBorder">
                            <div className="text-center">
                                <Cpu className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collecting Resource Data...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Uptime Charts */}
            <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                <div className="flex items-center justify-between mb-10 text-left">
                    <div className="flex items-center space-x-3">
                        <Activity size={24} className="text-brand-orange" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">System Uptime Status</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last 24 Hours</span>
                    </div>
                </div>
                <div className="space-y-10">
                    {[
                        { name: 'API Cluster', status: 'Operational', type: 'api' },
                        { name: 'Database Cluster', status: 'Operational', type: 'database' }
                    ].map((system) => (
                        <div key={system.name} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <h4 className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">{system.name}</h4>
                                </div>
                                <span className="text-[9px] font-black uppercase text-emerald-500">{system.status}</span>
                            </div>
                            <div className="flex items-center justify-center h-8 rounded-lg">
                                <div className="w-full h-8 flex">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const now = Date.now();
                                        const blockStart = now - (24 - i) * 60 * 60 * 1000;
                                        const blockEnd = now - (23 - i) * 60 * 60 * 1000;
                                        
                                        // Filter telemetry points for this 1-hour window
                                        const blockTelemetry = (metrics?.telemetry_history || []).filter(t => {
                                            const tTime = new Date(t.created_at).getTime();
                                            return tTime >= blockStart && tTime <= blockEnd;
                                        });

                                        let isHighLatency = false;
                                        let title = "Operational";

                                        if (blockTelemetry.length > 0) {
                                            let avgLatency = 0;
                                            if (system.type === 'api') {
                                                const sum = blockTelemetry.reduce((acc, curr) => acc + (curr.storage_latency_ms || 0), 0);
                                                avgLatency = sum / blockTelemetry.length;
                                                isHighLatency = avgLatency > 800; // threshold for API (proxy via storage network call)
                                                title = isHighLatency ? `High API Latency (${Math.round(avgLatency)}ms)` : `Operational (${Math.round(avgLatency)}ms)`;
                                            } else {
                                                const sum = blockTelemetry.reduce((acc, curr) => acc + (curr.db_latency_ms || 0), 0);
                                                avgLatency = sum / blockTelemetry.length;
                                                isHighLatency = avgLatency > 500; // threshold for DB
                                                title = isHighLatency ? `High DB Latency (${Math.round(avgLatency)}ms)` : `Operational (${Math.round(avgLatency)}ms)`;
                                            }
                                        } else {
                                            title = "No telemetry recorded in this window";
                                        }

                                        return (
                                            <div 
                                                key={i} 
                                                title={title}
                                                className={`h-full flex-1 mx-[1px] rounded-sm ${isHighLatency ? 'bg-red-500' : 'bg-emerald-500'} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Service Health Grid */}
            <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left">
                <div className="flex items-center space-x-3 mb-10">
                    <BarChart3 size={24} className="text-brand-orange" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Service Health Matrix</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(metrics?.services || []).map((service) => (
                        <div key={service.name} className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${['Healthy', 'Operational'].includes(service.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {service.status}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{service.region || 'Global'}</span>
                            </div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-1">{service.name}</h4>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Latency</span>
                                <span className="text-[10px] font-black text-gray-900 dark:text-brand-darkText uppercase">{service.latency}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Monitoring;
