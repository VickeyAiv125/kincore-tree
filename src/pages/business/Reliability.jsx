import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Shield, Zap, Database, Server, HardDrive, RefreshCw, AlertTriangle, CheckCircle, Clock, Loader2, Play, Pause, RotateCw } from 'lucide-react';
import JobControl from '../devops/JobControl';

const StatusBadge = ({ children }) => {
    const variants = {
        Success: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400',
        Warning: 'bg-[#FFF5EB] dark:bg-yellow-950/20 text-[#D88C50] dark:text-yellow-400',
        Danger: 'bg-[#FFE2E2] dark:bg-red-950/20 text-[#E25C5C] dark:text-red-400',
        Error: 'bg-[#FFE2E2] dark:bg-red-950/20 text-[#E25C5C] dark:text-red-400',
        Info: 'bg-[#E3F2FD] dark:bg-blue-950/20 text-[#1D72B8] dark:text-blue-400',
        Running: 'bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange animate-pulse',
    };
    return (
        <span className={`px-4 py-1.5 rounded-lg text-xs font-bold leading-none transition-colors ${variants[children] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400'}`}>
            {children}
        </span>
    );
};

const SectionHeader = ({ title }) => (
    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">{title}</h2>
);

const Reliability = () => {
    const [activeTasks, setActiveTasks] = useState({}); // { [taskId]: status }
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [healthData, setHealthData] = useState(null);
    const [backupData, setBackupData] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [toastMsg, setToastMsg] = useState('');
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [backupReason, setBackupReason] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const [metricsRes, backupRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/devops/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/devops/backups/latest`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const metricsData = await metricsRes.json();
            const backupInfo = await backupRes.json();

            setHealthData(metricsData);
            if (backupInfo && backupInfo.status !== 'none_found') {
                setBackupData(backupInfo);
            }
            
            setLastUpdated(new Date());
            if (isRefreshing) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (err) {
            console.error('Error fetching reliability data:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setToastMsg('System Health Refreshed');
        fetchData();
    };

    const showNotification = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const runTask = async (taskId, customMsg, payload = null) => {
        setActiveTasks(prev => ({ ...prev, [taskId]: 'running' }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/devops/jobs/${taskId}/trigger`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: payload ? JSON.stringify(payload) : undefined
            });
            if (!res.ok) throw new Error('Trigger failed');
            
            setActiveTasks(prev => ({ ...prev, [taskId]: 'success' }));
            setToastMsg(customMsg || `${taskId.toUpperCase()} Operation Successful`);
            setShowToast(true);

            setTimeout(() => {
                setActiveTasks(prev => {
                    const next = { ...prev };
                    delete next[taskId];
                    return next;
                });
                setShowToast(false);
                fetchData();
            }, 5000);
        } catch (err) {
            console.error('Job trigger failed:', err);
            setActiveTasks(prev => ({ ...prev, [taskId]: 'error' }));
            setToastMsg(`Error: ${err.message}`);
            setShowToast(true);
            setTimeout(() => {
                setActiveTasks(prev => {
                    const next = { ...prev };
                    delete next[taskId];
                    return next;
                });
                setShowToast(false);
            }, 5000);
        }
    };



    const infraStatus = healthData?.services || [
        { name: 'Primary Database', status: 'Operational', latency: '12ms', region: 'us-east-1' },
        { name: 'Auth Service', status: 'Operational', latency: '45ms', region: 'global' },
        { name: 'File Storage', status: 'Operational', latency: '8ms', region: 'us-east-1' },
        { name: 'Platform Uptime', status: 'Operational', latency: '99.9%', region: 'global' },
    ];

    return (
        <div className="relative space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl pb-20 px-4 sm:px-0 text-left">
            {/* Global Action Overlay */}
            {Object.values(activeTasks).includes('running') && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl flex flex-col items-center space-y-6 max-w-sm text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                            <Zap className="absolute inset-0 m-auto text-brand-orange animate-pulse" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">System Operation in Progress</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-2">Dispatched to cloud controller. Please do not refresh the page.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Backup Confirmation Modal */}
            {isBackupModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl w-full max-w-md">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl">
                                <HardDrive size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Initiate Backup</h3>
                        </div>
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-6">Please provide a reason for initiating this manual point-in-time snapshot. This will be recorded in the audit logs.</p>
                        
                        <div className="space-y-4 mb-8">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Reason for Snapshot</label>
                            <input
                                type="text"
                                value={backupReason}
                                onChange={(e) => setBackupReason(e.target.value)}
                                placeholder="e.g. Pre-migration backup, Major release"
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl p-4 text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsBackupModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsBackupModalOpen(false);
                                    runTask('JOB-BACKUP', 'Database Snapshot Initiated', { reason: backupReason || 'Routine Manual Backup' });
                                    setBackupReason('');
                                }}
                                disabled={!backupReason.trim()}
                                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-brand-orange text-white shadow-lg shadow-brand-orange/20 hover:bg-[#E65000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed bottom-10 right-10 text-white px-6 py-3 rounded-2xl shadow-2xl z-[150] animate-in slide-in-from-right-10 flex items-center space-x-3 ${toastMsg.toLowerCase().startsWith('error') ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toastMsg.toLowerCase().startsWith('error') ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-xs font-black uppercase tracking-widest">{toastMsg}</span>
                </div>
            )}

            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Platform Reliability & Stability</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 transition-colors">Monitoring infrastructure health and manual job overrides.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Sync</p>
                        <p className="text-[10px] font-bold text-brand-orange">{lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder px-4 py-2.5 rounded-xl font-bold text-xs hover:border-brand-orange transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        <span className="uppercase tracking-widest text-gray-400">Force Refresh</span>
                    </button>
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/20 px-4 py-2.5 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Health: {healthData?.health?.api_uptime || '99.99%'}</span>
                    </div>
                </div>
            </header>

            {/* Product Health Dashboard Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'API Uptime', value: healthData?.health?.api_uptime || '100%', status: 'Success' },
                    { label: 'DB Latency (P99)', value: healthData?.health?.db_latency || '14ms', status: 'Success' },
                    { label: 'Error Rate', value: healthData?.health?.error_rate || '0.00%', status: healthData?.health?.status === 'Healthy' ? 'Success' : 'Warning' },
                    { label: 'Family Space Sync', value: healthData?.health?.sync_latency || '42ms', status: 'Success' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-brand-darkCard p-8 rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:shadow-md">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-brand-darkText tracking-tighter">{stat.value}</h3>
                            <div className={`w-3 h-3 rounded-full ${stat.status === 'Success' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)] animate-pulse'}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Infrastructure Map */}
            <section className="space-y-6">
                <SectionHeader title="Infrastructure Monitor" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {infraStatus.map((infra, idx) => (
                        <div key={idx} className="bg-white dark:bg-brand-darkCard p-6 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:border-brand-orange/30">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${infra.status === 'Operational' ? 'bg-green-50 dark:bg-green-900/10 text-green-500' : 'bg-red-50 dark:bg-red-900/10 text-red-500'}`}>
                                    {infra.name.includes('DB') ? <Database size={18} /> : infra.name.includes('AI') ? <Zap size={18} /> : <Server size={18} />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${infra.status === 'Operational' ? 'text-green-500 bg-green-50 dark:bg-green-900/10' : 'text-red-500 bg-red-50 dark:bg-red-900/10 animate-pulse'}`}>
                                    {infra.status}
                                </span>
                            </div>
                            <h4 className="text-sm font-black text-gray-800 dark:text-brand-darkText uppercase tracking-tight mb-1">{infra.name}</h4>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{infra.region}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                <span className="text-[10px] font-black text-brand-orange uppercase">{infra.latency}</span>
                            </div>
                            
                            {infra.details && infra.details.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-brand-darkBorder space-y-2">
                                    {infra.details.map((detail, dIdx) => (
                                        <div key={dIdx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-gray-400">{detail.label}</span>
                                            <span className={detail.color}>{detail.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Background Job Monitor */}
            <section className="space-y-6">
                <JobControl />
            </section>

            {/* Backup & Disaster Recovery */}
            <section className="space-y-6">
                <SectionHeader title="Emergency & Lifecycle" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl">
                                <HardDrive size={24} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Manual Backup Protocol</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Point-in-Time Restore</span>
                                    <span className={`text-[10px] font-black uppercase ${backupData?.status === 'completed' ? 'text-green-500' : backupData?.status === 'pending' ? 'text-brand-orange animate-pulse' : 'text-gray-400'}`}>
                                        {backupData?.status === 'completed' ? 'Verified' : backupData?.status === 'pending' ? 'Processing' : 'Ready'}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed uppercase mb-4">Create an immediate immutable snapshot of the entire family tree database.</p>
                                
                                {backupData && (
                                    <div className="mb-6 space-y-2 border-l-2 border-brand-orange/30 pl-4 py-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Snapshot</span>
                                            <span className="text-[10px] font-black text-gray-800 dark:text-brand-darkText">{new Date(backupData.last_snapshot).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coverage</span>
                                            <span className="text-[10px] font-black text-gray-800 dark:text-brand-darkText truncate max-w-[150px]">{backupData.coverage}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Initiated By</span>
                                            <span className="text-[10px] font-black text-gray-800 dark:text-brand-darkText truncate max-w-[150px]">{backupData.initiated_by}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reason</span>
                                            <span className="text-[10px] font-black text-gray-800 dark:text-brand-darkText truncate max-w-[150px]" title={backupData.reason}>{backupData.reason}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Retention</span>
                                            <span className="text-[10px] font-black text-gray-800 dark:text-brand-darkText">{backupData.retention_period}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsBackupModalOpen(true)}
                                    disabled={activeTasks['JOB-BACKUP'] === 'running' || backupData?.status === 'pending'}
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${activeTasks['JOB-BACKUP'] === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : activeTasks['JOB-BACKUP'] === 'running' || backupData?.status === 'pending' ? 'bg-gray-400 text-white animate-pulse' : 'bg-gray-900 text-white shadow-gray-900/20 hover:bg-black'}`}
                                >
                                    {activeTasks['JOB-BACKUP'] === 'success' ? 'Snapshot Created' : activeTasks['JOB-BACKUP'] === 'running' || backupData?.status === 'pending' ? 'Processing Snapshot...' : 'Initiate Snapshot'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Disaster Recovery Status & Escalation</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between space-x-3 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-left">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-blue-600 uppercase">Disaster Recovery Status</p>
                                            <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Platform Readiness</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg text-green-500 bg-green-50 dark:bg-green-900/10">
                                        Ready
                                    </span>
                                </div>

                                <button
                                    onClick={() => showNotification('Navigating to Incident Declaration...')}
                                    className="flex items-center space-x-3 p-5 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/20 transition-all text-left group"
                                >
                                    <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-red-600 uppercase">Create Emergency Incident</p>
                                        <p className="text-[10px] font-bold text-red-400 uppercase mt-1">Declare a major outage</p>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => showNotification('Enabling Maintenance Mode...')}
                                    className="flex items-center space-x-3 p-5 bg-orange-50/50 hover:bg-orange-50 dark:bg-brand-orange/5 dark:hover:bg-brand-orange/10 rounded-2xl border border-brand-orange/20 transition-all text-left group"
                                >
                                    <div className="p-2 bg-brand-orange/20 text-brand-orange rounded-xl group-hover:scale-110 transition-transform">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-brand-orange uppercase">Enable Maintenance Mode</p>
                                        <p className="text-[10px] font-bold text-brand-orange/60 uppercase mt-1">Restrict platform access</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => showNotification('Opening Recovery Checklist...')}
                                    className="flex items-center space-x-3 p-5 bg-gray-50 hover:bg-gray-100 dark:bg-brand-darkBg dark:hover:bg-brand-darkBorder rounded-2xl border border-gray-100 dark:border-brand-darkBorder transition-all text-left group"
                                >
                                    <div className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl group-hover:scale-110 transition-transform">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-brand-darkText uppercase">View Recovery Checklist</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Step-by-step procedures</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Reliability;