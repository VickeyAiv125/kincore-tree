import React, { useState, useEffect } from 'react';
import {
    Activity,
    Zap,
    Settings2,
    Shield,
    Terminal,
    RefreshCcw,
    Clock,
    Server,
    Database,
    Globe,
    Cpu,
    AlertCircle,
    Package,
    History,
    ExternalLink,
    TrendingUp,
    Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DevOpsDashboard = () => {
    const navigate = useNavigate();
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deploy, setDeploy] = useState(null);
    const [selectedEnv, setSelectedEnv] = useState('testing');
    const [deployBusy, setDeployBusy] = useState(null); // 'deploy' | 'rollback' | null
    const [deployToast, setDeployToast] = useState(null);
    const [urlDraft, setUrlDraft] = useState({ api_url: '', frontend_url: '' });

    const [workers, setWorkers] = useState([]);
    const [allJobs, setAllJobs] = useState([]);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const ENV_TABS = [
        { key: 'production', label: 'Production' },
        { key: 'staging', label: 'Staging' },
        { key: 'testing', label: 'Testing' }
    ];

    const stats = [
        {
            label: 'System Health',
            value: metrics?.health?.api_uptime || '99.9%',
            sub: metrics?.health?.status === 'Healthy' ? 'All Systems Operational' : 'System Issues Detected',
            icon: Activity,
            color: metrics?.health?.status === 'Healthy' ? 'text-green-500' : 'text-orange-500',
            bg: metrics?.health?.status === 'Healthy' ? 'bg-green-50' : 'bg-orange-50'
        },
        {
            label: 'DB Latency',
            value: metrics?.health?.db_latency || '0ms',
            sub: 'Avg response time',
            icon: Zap,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Error Rate',
            value: metrics?.health?.error_rate || '0.00%',
            sub: 'System anomalies',
            icon: Shield,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Sync Latency',
            value: metrics?.health?.sync_latency || '0ms',
            sub: 'Data replication',
            icon: RefreshCcw,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
        {
            label: 'Active Incidents',
            value: incidents.filter(i => i.status === 'open').length.toString(),
            sub: 'Requires attention',
            icon: AlertCircle,
            color: incidents.some(i => i.severity === 'high' && i.status === 'open') ? 'text-red-500' : 'text-gray-500',
            bg: incidents.some(i => i.severity === 'high' && i.status === 'open') ? 'bg-red-50' : 'bg-gray-50'
        },
    ];

    const fetchWorkers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const workerList = data.workers || (Array.isArray(data) ? data : []);
                const activeWorkers = workerList.map(w => ({ ...w, loading: false }));
                setWorkers(activeWorkers);
            } else {
                setWorkers([]);
            }
        } catch (err) {
            console.error('Failed to fetch workers:', err);
            setWorkers([]);
        }
    };

    const fetchDeployStatus = async (env = selectedEnv) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/deploy-status?environment=${encodeURIComponent(env)}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setDeploy(data);
                setSelectedEnv(data.environment || env);
                setUrlDraft({
                    api_url: data.api_url || '',
                    frontend_url: data.frontend_url || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch deploy status:', err);
        }
    };

    const selectEnvironment = async (envKey) => {
        setSelectedEnv(envKey);
        await fetchDeployStatus(envKey);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE}/admin/devops/deploy/environments/${envKey}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ set_active: true })
            });
        } catch (_) { /* non-blocking */ }
    };

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const [metricsRes, incidentsRes, jobsRes] = await Promise.all([
                fetch(`${API_BASE}/admin/devops/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/admin/devops/incidents`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/admin/devops/jobs`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (metricsRes.ok) setMetrics(await metricsRes.json());
            if (incidentsRes.ok) setIncidents(await incidentsRes.json());
            if (jobsRes.ok) {
                const data = await jobsRes.json();
                setAllJobs(data.jobs || data || []);
            }

            await Promise.all([fetchWorkers(), fetchDeployStatus(selectedEnv)]);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Error fetching devops data:', error);
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    const handleDeployRevision = async () => {
        if (deployBusy) return;
        setDeployBusy('deploy');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/deploy`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    environment: selectedEnv,
                    notes: `Manual deploy revision → ${selectedEnv}`
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Deploy failed');
            setDeployToast({ ok: true, message: data.message || 'Revision deployed' });
            if (data.deploy) setDeploy(data.deploy);
            else await fetchDeployStatus(selectedEnv);
        } catch (err) {
            setDeployToast({ ok: false, message: err.message });
        } finally {
            setDeployBusy(null);
            setTimeout(() => setDeployToast(null), 3500);
        }
    };

    const handleRollback = async () => {
        if (deployBusy) return;
        if (!deploy?.previous_version) {
            setDeployToast({ ok: false, message: `No previous version on ${selectedEnv}. Deploy a revision first.` });
            setTimeout(() => setDeployToast(null), 3500);
            return;
        }
        if (!window.confirm(`Emergency rollback on ${selectedEnv} to ${deploy.previous_version}?`)) return;
        setDeployBusy('rollback');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/deploy/rollback`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    environment: selectedEnv,
                    reason: `Emergency rollback on ${selectedEnv}`
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Rollback failed');
            setDeployToast({ ok: true, message: data.message || 'Rollback complete' });
            if (data.deploy) setDeploy(data.deploy);
            await fetchData();
        } catch (err) {
            setDeployToast({ ok: false, message: err.message });
        } finally {
            setDeployBusy(null);
            setTimeout(() => setDeployToast(null), 3500);
        }
    };

    const handleSaveEnvUrls = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/deploy/environments/${selectedEnv}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_url: urlDraft.api_url || null,
                    frontend_url: urlDraft.frontend_url || null,
                    set_active: true
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save URLs');
            setDeployToast({ ok: true, message: `${selectedEnv} URLs saved` });
            if (data.deploy) setDeploy(data.deploy);
        } catch (err) {
            setDeployToast({ ok: false, message: err.message });
        } finally {
            setTimeout(() => setDeployToast(null), 3000);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    const handleWorkerAction = async (workerId, action) => {
        setWorkers(prev => prev.map(w => (w.id === workerId || w.node_name === workerId) ? { ...w, loading: true } : w));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/workers/${workerId}/trigger`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                fetchWorkers();
            }
        } catch (err) {
            console.error(`Failed to ${action} worker:`, err);
        } finally {
            setWorkers(prev => prev.map(w => (w.id === workerId || w.node_name === workerId) ? { ...w, loading: false } : w));
        }
    };

    const envIsProd = selectedEnv === 'production';
    const statusLabel = deploy?.status === 'rolled_back' ? 'Rolled Back' : (deploy?.status || 'Healthy');
    const statusOk = deploy?.status !== 'rolled_back';
    const runtimeEnv = deploy?.runtime_environment;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 dark:border-brand-darkBorder pb-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                    {metrics?.health?.status === 'Healthy' ? 'System Active' : 'System Alert'}
                                </p>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText tracking-tight uppercase italic">DevOps Command Center</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="group relative">
                            <div className={`px-4 py-2 bg-gray-50 dark:bg-brand-darkCard border ${metrics?.health?.status === 'Healthy' ? 'border-gray-100 dark:border-brand-darkBorder' : 'border-red-500/30'} rounded-xl flex items-center space-x-2 cursor-help transition-all hover:border-emerald-500/30`}>
                                <span className={`w-2 h-2 rounded-full ${metrics?.health?.status === 'Healthy' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">API</span>
                            </div>
                            <div className="absolute top-full left-0 mt-3 w-48 bg-gray-900 text-white p-4 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl scale-90 group-hover:scale-100 text-left">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${metrics?.health?.status === 'Healthy' ? 'text-emerald-400' : 'text-red-400'} mb-2`}>
                                    API Status: {metrics?.health?.status || 'Unknown'}
                                </p>
                                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">Uptime: {metrics?.health?.api_uptime || 'N/A'}</p>
                                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">Error Rate: {metrics?.health?.error_rate || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="group relative">
                            <div className={`px-4 py-2 bg-gray-50 dark:bg-brand-darkCard border ${(metrics?.services?.find(s => s.name === 'Primary Database')?.status || 'Operational') === 'Operational' ? 'border-gray-100 dark:border-brand-darkBorder' : 'border-red-500/30'} rounded-xl flex items-center space-x-2 cursor-help transition-all hover:border-emerald-500/30`}>
                                <span className={`w-2 h-2 rounded-full ${(metrics?.services?.find(s => s.name === 'Primary Database')?.status || 'Operational') === 'Operational' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DB</span>
                            </div>
                            <div className="absolute top-full left-0 mt-3 w-48 bg-gray-900 text-white p-4 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl scale-90 group-hover:scale-100 text-left">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${(metrics?.services?.find(s => s.name === 'Primary Database')?.status || 'Operational') === 'Operational' ? 'text-emerald-400' : 'text-red-400'} mb-2`}>DB Status: {metrics?.services?.find(s => s.name === 'Primary Database')?.status || 'Operational'}</p>
                                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">Latency: {metrics?.health?.db_latency || 'N/A'}</p>
                                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">Sync: {metrics?.health?.sync_latency || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Telemetry Sync</p>
                        <div className="flex items-center justify-end space-x-2">
                            <span className="text-xs font-black text-gray-900 dark:text-brand-darkText">{lastUpdated}</span>
                            <div className="w-1 h-1 bg-brand-orange rounded-full animate-ping" />
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`p-4 bg-gray-900 text-white rounded-2xl hover:bg-brand-orange transition-all shadow-xl shadow-brand-orange/10 ${isRefreshing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                    >
                        <RefreshCcw size={18} strokeWidth={3} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-brand-darkCard p-6 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm group hover:scale-[1.02] transition-all text-left">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.bg} dark:bg-opacity-10 rounded-2xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText mt-1">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Infrastructure Nodes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <div className="flex items-center justify-between mb-4 text-left">
                            <div className="flex items-center space-x-3">
                                <Server size={24} className="text-brand-orange" />
                                <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Worker Infrastructure</h2>
                            </div>
                            <button onClick={() => navigate('/devops/jobs')} className="text-[10px] font-black text-brand-orange uppercase tracking-widest flex items-center space-x-1 hover:opacity-70 transition-opacity">
                                <span>Advanced Monitoring</span>
                                <ExternalLink size={12} />
                            </button>
                        </div>

                            {loading || !metrics ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Infrastructure...</p>
                                </div>
                            ) : (
                                <div className="p-8 bg-gray-50 dark:bg-brand-darkBg rounded-3xl border border-gray-100 dark:border-brand-darkBorder transition-all text-left">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-white dark:bg-brand-darkCard rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-brand-darkBorder text-emerald-500">
                                                <Server size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Worker Pool Status</h3>
                                                <p className={`text-xs font-bold uppercase mt-1 flex items-center ${workers.filter(w => w.status === 'active' || w.status === 'idle').length > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${workers.filter(w => w.status === 'active' || w.status === 'idle').length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span> 
                                                    {workers.filter(w => w.status === 'active' || w.status === 'idle').length > 0 ? `${workers.filter(w => w.status === 'active' || w.status === 'idle').length} Workers Online` : '0 Workers Online (Offline)'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Scheduled Jobs</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText">{allJobs.filter(j => j.schedule_cron).length}</p>
                                            <p className="text-[9px] font-bold text-orange-500 uppercase mt-1">Active Routines</p>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Failed Jobs</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText">{allJobs.filter(j => j.status === 'failed' || j.status === 'warning').length}</p>
                                            <p className="text-[9px] font-bold text-red-500 uppercase mt-1">Needs Attention</p>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Total Jobs</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText">{allJobs.length}</p>
                                            <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">System Processes</p>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Last Heartbeat</p>
                                            <span className="text-3xl font-black text-gray-900 dark:text-brand-darkText">
                                                {workers.length > 0 && workers.some(w => w.last_heartbeat)
                                                    ? new Date(Math.max(...workers.map(w => new Date(w.last_heartbeat).getTime()))).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                    : '--'}
                                            </span>
                                            <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Pool Sync</p>
                                        </div>
                                    </div>

                                    {/* Worker Groups Section */}
                                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-brand-darkBorder">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <Server size={18} className="text-gray-400" />
                                            <h3 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Worker Infrastructure (Custom PostgreSQL Queue)</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                            {[
                                                { name: 'Main Worker', keywords: ['main', 'sync', 'sub', 'story'] },
                                                { name: 'PDF Worker', keywords: ['pdf'] },
                                                { name: 'Media Worker', keywords: ['media', 'thumb', 'storage'] },
                                                { name: 'Notification Worker', keywords: ['notify', 'email', 'abuse'] },
                                                { name: 'Audit Worker', keywords: ['audit'] },
                                                { name: 'Backup Worker', keywords: ['backup'] }
                                            ].map(group => {
                                                const activeWorker = workers.find(w => w.worker_group === group.name || group.keywords.some(k => w.worker_group?.toLowerCase().includes(k)));
                                                const activeJob = allJobs.find(j => j.status === 'running' && group.keywords.some(k => j.id?.toLowerCase().includes(k) || j.name?.toLowerCase().includes(k)));
                                                
                                                let status = 'Offline';
                                                let statusColor = 'text-gray-400';
                                                let dotColor = 'bg-gray-300 dark:bg-gray-600';
                                                let borderStyle = 'border-gray-100 dark:border-brand-darkBorder';

                                                if (activeJob) {
                                                    status = 'Online (Running)';
                                                    statusColor = 'text-emerald-500';
                                                    dotColor = 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]';
                                                    borderStyle = 'border-emerald-500/30';
                                                } else if (activeWorker && (activeWorker.status === 'active' || activeWorker.status === 'idle')) {
                                                    status = 'Online (Idle)';
                                                    statusColor = 'text-blue-500';
                                                    dotColor = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
                                                    borderStyle = 'border-blue-500/30';
                                                }

                                                return (
                                                    <div key={group.name} className={`flex flex-col items-center justify-center py-4 px-2 bg-white dark:bg-brand-darkCard border ${borderStyle} rounded-2xl transition-all hover:scale-[1.02] text-center`}>
                                                        <div className="flex items-center space-x-2 mb-2 w-full justify-center">
                                                            <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                                                            <span className="text-[9px] font-black text-gray-900 dark:text-brand-darkText tracking-widest uppercase truncate" title={group.name}>
                                                                {group.name.replace(' Worker', '')}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[8px] font-bold uppercase ${statusColor}`}>{status}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            )}
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard p-10 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <div className="flex items-center space-x-3 mb-10 text-left">
                            <Activity size={24} className="text-brand-orange" />
                            <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Active Alerts</h2>
                        </div>
                        <div className="space-y-4">
                            {incidents.filter(i => i.status === 'open').length > 0 ? (
                                incidents.filter(i => i.status === 'open').map(incident => (
                                    <div key={incident.id} className={`p-5 ${incident.severity === 'high' ? 'bg-red-50 dark:bg-red-950/10 border-red-500' : 'bg-orange-50 dark:bg-orange-950/10 border-orange-500'} border-l-4 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.01] text-left`}>
                                        <div className="flex items-center space-x-4">
                                            <AlertCircle className={incident.severity === 'high' ? 'text-red-500' : 'text-orange-500'} size={24} />
                                            <div className="text-left">
                                                <p className={`text-sm font-bold ${incident.severity === 'high' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>{incident.title}</p>
                                                <p className={`text-[10px] font-bold ${incident.severity === 'high' ? 'text-red-500/60' : 'text-orange-500/60'} uppercase`}>Triggered {new Date(incident.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate('/devops/incidents')} className={`px-4 py-2 ${incident.severity === 'high' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white text-[9px] font-black uppercase rounded-xl transition-all shadow-lg`}>View</button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 border-2 border-dashed border-gray-100 dark:border-brand-darkBorder rounded-[2rem] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                                        <Activity size={32} />
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">All Systems Clear</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">No active incidents detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Context & Controls */}
                <div className="space-y-8 text-left">
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <div className="flex items-center justify-between mb-6 text-left gap-3">
                            <div className="flex items-center space-x-3">
                                <Package size={24} className="text-brand-orange" />
                                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Deploy Status</h2>
                            </div>
                            {runtimeEnv && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-gray-100 dark:bg-brand-darkBg text-gray-500">
                                    Runtime: {runtimeEnv}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2 mb-6 p-1 bg-gray-50 dark:bg-brand-darkBg rounded-2xl">
                            {ENV_TABS.map((tab) => {
                                const summary = (deploy?.environments || []).find((e) => e.key === tab.key);
                                const active = selectedEnv === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => selectEnvironment(tab.key)}
                                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                            active
                                                ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {tab.label}
                                        {summary?.is_runtime && <span className="block text-[8px] text-emerald-500 mt-0.5">This host</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick status strip for all envs */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {(deploy?.environments || ENV_TABS.map((t) => ({ key: t.key, label: t.label, version: '—', status: '—' }))).map((e) => (
                                <button
                                    key={e.key}
                                    type="button"
                                    onClick={() => selectEnvironment(e.key)}
                                    className={`p-3 rounded-2xl border text-left transition-all ${
                                        selectedEnv === e.key
                                            ? 'border-brand-orange/40 bg-orange-50/50 dark:bg-brand-orange/5'
                                            : 'border-gray-100 dark:border-brand-darkBorder hover:border-brand-orange/20'
                                    }`}
                                >
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{e.label || e.key}</p>
                                    <p className="text-[11px] font-black text-gray-900 dark:text-brand-darkText mt-1">
                                        v{String(e.version || '1.0.0').replace(/^v/, '')}
                                    </p>
                                    <p className={`text-[8px] font-black uppercase mt-1 ${e.status === 'rolled_back' ? 'text-orange-500' : 'text-emerald-600'}`}>
                                        {e.status === 'rolled_back' ? 'Rolled Back' : (e.status || 'Healthy')}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {deployToast && (
                            <div className={`mb-4 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${deployToast.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'}`}>
                                {deployToast.message}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Version</span>
                                <span className="text-xs font-black text-gray-900 dark:text-brand-darkText">
                                    {deploy?.version ? `v${String(deploy.version).replace(/^v/, '')}` : '—'}
                                    {deploy?.git_sha ? <span className="text-gray-400 font-bold ml-1">({deploy.git_sha})</span> : null}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Environment</span>
                                <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase ${envIsProd ? 'bg-green-50 text-green-600' : selectedEnv === 'staging' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'}`}>
                                    <Globe size={10} />
                                    <span>{selectedEnv}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase">{deploy?.channel || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                <span className={`text-[10px] font-black uppercase ${statusOk ? 'text-emerald-600' : 'text-orange-500'}`}>{statusLabel}</span>
                            </div>
                            <div className="flex items-center justify-between text-left">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Success</span>
                                <span className="text-[10px] font-bold text-gray-900 dark:text-brand-darkText uppercase">
                                    {deploy?.last_success_at ? new Date(deploy.last_success_at).toLocaleString() : 'Never'}
                                </span>
                            </div>
                            {deploy?.previous_version && (
                                <div className="flex items-center justify-between text-left">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Previous</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">v{String(deploy.previous_version).replace(/^v/, '')}</span>
                                </div>
                            )}

                            <div className="space-y-3 pt-2 border-t border-gray-50 dark:border-brand-darkBorder">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Environment URLs</p>
                                <input
                                    type="url"
                                    placeholder="API URL (optional)"
                                    value={urlDraft.api_url}
                                    onChange={(e) => setUrlDraft((d) => ({ ...d, api_url: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darkBg border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-orange/20"
                                />
                                <input
                                    type="url"
                                    placeholder="Frontend URL (optional)"
                                    value={urlDraft.frontend_url}
                                    onChange={(e) => setUrlDraft((d) => ({ ...d, frontend_url: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-darkBg border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-orange/20"
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveEnvUrls}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-orange transition-colors"
                                >
                                    Save URLs
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-brand-darkBorder space-y-3">
                                <button
                                    type="button"
                                    onClick={handleDeployRevision}
                                    disabled={!!deployBusy}
                                    className="w-full py-4 bg-brand-orange text-white text-[10px] font-black uppercase rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-brand-orange/20"
                                >
                                    {deployBusy === 'deploy' ? 'Deploying…' : `Deploy Revision → ${selectedEnv}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRollback}
                                    disabled={!!deployBusy || !deploy?.previous_version}
                                    className="w-full py-4 bg-gray-900 dark:bg-brand-darkBg text-white text-[10px] font-black uppercase rounded-2xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {deployBusy === 'rollback' ? 'Rolling Back…' : `Emergency Rollback (${selectedEnv})`}
                                </button>
                            </div>
                            {Array.isArray(deploy?.history) && deploy.history.length > 0 && (
                                <div className="pt-2 space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recent ({selectedEnv})</p>
                                    {deploy.history.slice(0, 3).map((h, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[10px]">
                                            <span className={`font-black uppercase ${h.action === 'rollback' ? 'text-orange-500' : 'text-gray-500'}`}>{h.action}</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">v{String(h.version || '').replace(/^v/, '')}</span>
                                            <span className="text-gray-400">{h.at ? new Date(h.at).toLocaleDateString() : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left">
                        <div className="flex items-center space-x-3 mb-8">
                            <History size={24} className="text-brand-orange" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Service Health</h2>
                        </div>
                        <div className="space-y-6">
                            {(metrics?.services || []).map((s) => (
                                <div key={s.name} className="flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-400 italic">{s.name}</span>
                                        <span className={`text-[9px] font-black uppercase ${['Healthy', 'Operational'].includes(s.status) ? 'text-green-500' : 'text-orange-500'}`}>{s.status}</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-100 dark:bg-brand-darkBg rounded-full overflow-hidden">
                                        <div className={`h-full ${['Healthy', 'Operational'].includes(s.status) ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: ['Healthy', 'Operational'].includes(s.status) ? '100%' : '75%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/devops/monitoring');
                            }}
                            className="w-full mt-10 py-4 bg-gray-50 dark:bg-brand-darkBg hover:bg-gray-100 dark:hover:bg-brand-darkBorder text-gray-500 dark:text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-gray-200"
                        >
                            Full Health Matrix
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevOpsDashboard;
