import React, { useState, useEffect } from 'react';
import {
    Play,
    Pause,
    RotateCw,
    Trash2,
    Zap,
    Clock,
    AlertCircle,
    FileText,
    Calendar,
    MoreVertical,
    Search,
    Filter,
    CheckSquare,
    Square,
    Layers,
    TrendingUp,
    Box,
    Settings2,
    Plus,
    Terminal
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const colors = {
        Running: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
        Paused: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400',
        Queued: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
        Failed: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400',
        Success: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
        Cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
        cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    };
    return (
        <span className={`${colors[status] || 'bg-gray-50 text-gray-500'} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 w-max`}>
            {status === 'Running' && <div className="w-2.5 h-2.5 border-[2px] border-green-500 border-t-transparent rounded-full animate-spin" />}
            <span>{status}</span>
        </span>
    );
};

const JobControl = () => {
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [recentTriggers, setRecentTriggers] = useState([]);
    const [recentlyTriggeredUI, setRecentlyTriggeredUI] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [diagnosticsJob, setDiagnosticsJob] = useState(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedJobForSchedule, setSelectedJobForSchedule] = useState(null);
    const [cronInput, setCronInput] = useState('');
    const [priorityInput, setPriorityInput] = useState('50');
    const [workerGroupInput, setWorkerGroupInput] = useState('Main Worker');
    const [timeoutInput, setTimeoutInput] = useState('300000');
    const [reasonInput, setReasonInput] = useState('');
    const [metrics, setMetrics] = useState({ poolStatus: 'Offline', activeWorkers: 0, averageRuntime: '0ms' });
    const [bulkBusy, setBulkBusy] = useState(false);
    const [actionToast, setActionToast] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const [jobsRes, workersRes] = await Promise.all([
                fetch(`${API_BASE}/admin/devops/jobs`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/admin/devops/workers`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (jobsRes.ok) {
                const data = await jobsRes.json();
                setJobs(data.jobs || []);
                setRecentTriggers(data.recent_triggers || []);
            }
            if (workersRes.ok) {
                const wData = await workersRes.json();
                setWorkers(Array.isArray(wData.workers) ? wData.workers : []);
                setMetrics(wData.metrics || { poolStatus: 'Offline', activeWorkers: 0, averageRuntime: '0ms' });
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleTrigger = async (jobId) => {
        // Optimistic UI update for instant feedback
        setRecentlyTriggeredUI(prev => ({ ...prev, [jobId]: Date.now() }));
        setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: 'running' } : j));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/jobs/${jobId}/trigger`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                fetchJobs();
            }
        } catch (err) {
            console.error('Failed to trigger job:', err);
            fetchJobs(); // Revert
        }
    };

    const handlePauseResume = async (job) => {
        // Optimistic UI update
        const newStatus = !job.is_enabled;
        setJobs(prevJobs => prevJobs.map(j => j.id === job.id ? { ...j, is_enabled: newStatus } : j));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/jobs/${job.id}/pause`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_enabled: newStatus })
            });
            if (res.ok) fetchJobs();
            else fetchJobs(); // Revert
        } catch (err) {
            console.error('Failed to toggle job state:', err);
            fetchJobs(); // Revert
        }
    };

    const handleUpdateSchedule = async (jobId, payload) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/jobs/${jobId}/schedule`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) fetchJobs();
        } catch (err) {
            console.error('Failed to update job schedule:', err);
        } finally {
            setScheduleModalOpen(false);
            setCronInput('');
            setReasonInput('');
            setPriorityInput('50');
            setTimeoutInput('300000');
            setWorkerGroupInput('Main Worker');
        }
    };

    const handleRetry = async (jobId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/jobs/${jobId}/retry`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (res.ok) fetchJobs();
        } catch (err) {
            console.error('Failed to retry job:', err);
        }
    };

    const handleBulkAction = async (action) => {
        if (!selectedJobs.length || bulkBusy) return;
        if (action === 'kill' && !window.confirm(`Kill ${selectedJobs.length} selected job(s)?`)) return;
        setBulkBusy(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/jobs/bulk`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, job_ids: selectedJobs })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || `Bulk ${action} failed`);
            setActionToast({ ok: true, message: data.message || `Bulk ${action} done` });
            setSelectedJobs([]);
            fetchJobs();
        } catch (err) {
            setActionToast({ ok: false, message: err.message });
        } finally {
            setBulkBusy(false);
            setTimeout(() => setActionToast(null), 3500);
        }
    };

    const toggleSelect = (id) => {
        if (selectedJobs.includes(id)) {
            setSelectedJobs(selectedJobs.filter(j => j !== id));
        } else {
            setSelectedJobs([...selectedJobs, id]);
        }
    };

    const filteredJobs = jobs.map(job => {
        // If triggered within the last 3.5 seconds, force UI to show running to bridge the gap between Queue -> Worker Pickup
        if (recentlyTriggeredUI[job.id] && Date.now() - recentlyTriggeredUI[job.id] < 3500) {
            return { ...job, status: 'running' };
        }
        return job;
    }).filter(job => {
        const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) || job.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || job.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <>
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Background</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Jobs Control</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Background Job Control</h1>
                </div>
                <div className="flex items-center space-x-4 text-left">
                    <div className="px-4 py-2 border border-gray-100 dark:border-brand-darkBorder rounded-xl bg-gray-50 dark:bg-brand-darkBg flex items-center space-x-2">
                        {metrics.poolStatus === 'Active' || metrics.poolStatus === 'Degraded' ? (
                            <>
                                <div className={`w-2 h-2 rounded-full ${metrics.poolStatus === 'Degraded' ? 'bg-yellow-500' : 'bg-emerald-500'} animate-pulse`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${metrics.poolStatus === 'Degraded' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                    Worker Pool: {metrics.poolStatus} ({metrics.activeWorkers})
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-[10px] font-black uppercase text-red-500 tracking-widest leading-none">Workers Offline</span>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={() => { setSelectedJobForSchedule(null); setScheduleModalOpen(true); }}
                        className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 dark:bg-brand-orange dark:hover:bg-brand-orange/90 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-transparent cursor-pointer transition-all">
                        <Plus size={18} />
                        <span>Schedule Job</span>
                    </button>
                </div>
            </header>

            {actionToast && (
                <div className={`fixed top-24 right-8 z-[60] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl ${actionToast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {actionToast.message}
                </div>
            )}

            {/* Selection Toolbar */}
            {selectedJobs.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-8 py-5 rounded-full shadow-2xl flex items-center space-x-8 animate-in slide-in-from-bottom-10 duration-500 border border-white/10">
                    <div className="flex items-center space-x-3 pr-8 border-r border-white/10">
                        <span className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-black">{selectedJobs.length}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Jobs Selected</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => handleBulkAction('kill')}
                            className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            <span>{bulkBusy ? 'Working…' : 'Kill Process'}</span>
                        </button>
                        <button
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => handleBulkAction('retry')}
                            className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest hover:text-green-500 transition-colors disabled:opacity-50"
                        >
                            <RotateCw size={16} />
                            <span>{bulkBusy ? 'Working…' : 'Retry All'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Jobs Table Container */}
            <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden text-left translate-y-0">
                <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by job name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 appearance-none cursor-pointer">
                                <option value="All">Status: All</option>
                                <option value="running">Running</option>
                                <option value="failed">Failed</option>
                                <option value="paused">Paused</option>
                                <option value="idle">Idle</option>
                            </select>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gray-50 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-brand-darkBorder hover:text-brand-orange transition-all">
                            <MoreVertical size={18} />
                            <span>More</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-brand-darkBorder">
                                <th className="px-8 py-6 w-10">
                                    <button onClick={() => setSelectedJobs(selectedJobs.length === filteredJobs.length && filteredJobs.length > 0 ? [] : filteredJobs.map(j => j.id))}>
                                        {selectedJobs.length === filteredJobs.length && filteredJobs.length > 0 ? <CheckSquare className="text-brand-orange" size={20} /> : <Square className="text-gray-200" size={20} />}
                                    </button>
                                </th>
                                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Name & Purpose</th>
                                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Run Time</th>
                                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Run Time</th>
                                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Worker / Priority / Config</th>
                                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration & Error</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-0">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Job Pool...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className={`group hover:bg-gray-50/50 dark:hover:bg-brand-darkBg/60 transition-all border-b border-gray-50/50 dark:border-brand-darkBorder/30 ${selectedJobs.includes(job.id) ? 'bg-orange-50/10' : ''}`}>
                                        <td className="px-8 py-10">
                                            <button onClick={() => toggleSelect(job.id)}>
                                                {selectedJobs.includes(job.id) ? <CheckSquare className="text-brand-orange" size={20} /> : <Square className="text-gray-200 group-hover:text-gray-300" size={20} />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-4 rounded-2xl ${job.status === 'failed' ? 'bg-red-50 text-red-500' : job.status === 'paused' ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-400 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-sm'}`}>
                                                    <Box size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase leading-none mb-2 text-left">{job.name}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic text-left">{job.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex items-center space-x-2 text-gray-400 text-left">
                                                <Clock size={14} className="group-hover:text-brand-orange transition-colors" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{job.last_run ? new Date(job.last_run).toLocaleTimeString() : 'Never'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex items-center space-x-2 text-gray-400 text-left">
                                                <Calendar size={14} className="group-hover:text-brand-orange transition-colors" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {job.next_run 
                                                        ? new Date(job.next_run).toLocaleTimeString() 
                                                        : (job.schedule_cron ? `Scheduled` : 'Manual / On-Demand')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex flex-col space-y-1 text-left">
                                                <span className="text-[10px] font-black text-gray-600 dark:text-brand-darkText uppercase tracking-widest">{job.job_type || 'Main Worker'}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Priority: {job.priority || 50}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Timeout: {job.timeout_limit ? `${job.timeout_limit/1000}s` : '5m'}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Retries: {job.retry_count || 0} / 3</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex items-center space-x-4">
                                                <StatusBadge status={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-10">
                                            <div className="flex flex-col space-y-1 text-left max-w-[150px]">
                                                <div className="flex items-center justify-start">
                                                    <span className="text-[10px] font-black text-gray-600 dark:text-brand-darkText uppercase">{job.last_run_duration || job.avg_duration || '--'}</span>
                                                </div>
                                                {job.status === 'failed' && job.failure_reason && (
                                                    <p className="text-[9px] font-bold text-red-500 uppercase truncate mt-2" title={job.failure_reason}>
                                                        Error: {job.failure_reason}
                                                    </p>
                                                )}
                                                {job.status !== 'failed' && job.failure_reason?.startsWith('SOFT:') && (
                                                    <p className="text-[9px] font-bold text-amber-500 uppercase truncate mt-2" title={job.failure_reason}>
                                                        Soft: {job.failure_reason.replace(/^SOFT:\s*/i, '')}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-10 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                {job.status === 'running' ? (
                                                    <button onClick={() => handlePauseResume(job)} className="p-3 bg-yellow-50 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-md" title="Pause Job">
                                                        <Pause size={18} />
                                                    </button>
                                                ) : job.status === 'failed' ? (
                                                    <button onClick={() => handleTrigger(job.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md" title="Retry Failed Job">
                                                        <RotateCw size={18} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleTrigger(job.id)} className="p-3 bg-brand-orange/10 text-brand-orange rounded-xl hover:bg-brand-orange hover:text-white transition-all shadow-md" title="Trigger Now">
                                                        <Play size={18} />
                                                    </button>
                                                )}
                                                
                                                <button onClick={() => setDiagnosticsJob(job)} className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-200 transition-all shadow-md" title="View Logs">
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Jobs Found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-gray-50 dark:border-brand-darkBorder bg-gray-50/30 dark:bg-brand-darkBg/30 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Showing {filteredJobs.length} of {jobs.length} active background processes</p>
                    <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Auto-Refresh: Active</span>
                    </div>
                </div>
            </div>
            </div>

            {/* Failure Diagnostics Modal */}
            {diagnosticsJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-2xl rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 dark:border-brand-darkBorder flex justify-between items-center text-left">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic text-left">
                                    {diagnosticsJob.status === 'failed' ? 'Failure Diagnostics' : 'Execution Logs'}
                                </h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 text-left ${diagnosticsJob.status === 'failed' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {diagnosticsJob.name} • {diagnosticsJob.id}
                                </p>
                            </div>
                        </div>
                        <div className="p-10 space-y-8 text-left">
                            <div className="bg-gray-900 text-emerald-400 p-8 rounded-3xl font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner">
                                {diagnosticsJob.status === 'failed' ? (
                                    <>
                                        <p className="opacity-40 mb-2">// Stack Trace: Latest failure {diagnosticsJob.last_run ? new Date(diagnosticsJob.last_run).toLocaleString() : 'Unknown'}</p>
                                        <p className="text-red-400">Error: {diagnosticsJob.failure_reason || 'Unknown error occurred during execution'}</p>
                                        <p className="ml-4 mt-2">at executeJob (worker_core.js:201:15)</p>
                                        <p className="ml-4">at async Object.process (worker_fleet.js:88:21)</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="opacity-40 mb-2">// Execution Report: Latest run {diagnosticsJob.last_run ? new Date(diagnosticsJob.last_run).toLocaleString() : 'Unknown'}</p>
                                        <p className="text-emerald-400">Status: Job completed successfully. No errors to report.</p>
                                        <p className="mt-2 text-emerald-600/60">// Duration: {diagnosticsJob.last_run_duration || diagnosticsJob.avg_duration || 'Unknown'}</p>
                                    </>
                                )}
                                <p className="mt-4 text-emerald-600/60 opacity-40">// Context:</p>
                                <p>Job ID: {diagnosticsJob.id}</p>
                                <p>Retry Count: {diagnosticsJob.retry_count || 0}</p>
                            </div>
                            <div className="flex space-x-4">
                                {diagnosticsJob.status === 'failed' && (
                                    <button onClick={() => setDiagnosticsJob(null)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange transition-all">Retry with Debug Logs</button>
                                )}
                                <button onClick={() => setDiagnosticsJob(null)} className="flex-1 py-4 bg-gray-50 dark:bg-brand-darkBg text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-brand-orange transition-all">Close Log</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Job Modal */}
            {scheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-2xl rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 dark:border-brand-darkBorder flex justify-between items-center text-left">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic text-left">Schedule Job</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 text-left">Define Cron Pattern for Execution</p>
                            </div>
                        </div>
                        <form className="p-10 space-y-6 text-left h-[60vh] overflow-y-auto" onSubmit={(e) => { 
                            e.preventDefault(); 
                            handleUpdateSchedule(selectedJobForSchedule, {
                                cron: cronInput,
                                priority: priorityInput,
                                worker_group: workerGroupInput,
                                timeout_limit: timeoutInput,
                                reason: reasonInput
                            }); 
                        }}>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Target Job</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-brand-darkBorder focus:ring-2 focus:ring-brand-orange/20"
                                    value={selectedJobForSchedule || ''}
                                    onChange={(e) => setSelectedJobForSchedule(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a system job...</option>
                                    {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Cron Expression</label>
                                <input 
                                    type="text" 
                                    name="cron"
                                    value={cronInput}
                                    onChange={(e) => setCronInput(e.target.value)}
                                    placeholder="0 0 * * *" 
                                    required
                                    className="w-full bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-brand-darkBorder focus:ring-2 focus:ring-brand-orange/20 font-mono mb-4"
                                />
                                <div className="bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-3">Quick Presets (Click to apply):</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Every 5 Mins', val: '*/5 * * * *' },
                                            { label: 'Hourly', val: '0 * * * *' },
                                            { label: 'Midnight', val: '0 0 * * *' },
                                            { label: 'Monday 9AM', val: '0 9 * * 1' },
                                            { label: '1st of Month', val: '0 0 1 * *' },
                                            { label: 'Custom', val: '* * * * *' },
                                        ].map((preset, idx) => (
                                            <button 
                                                key={idx}
                                                type="button" 
                                                onClick={() => setCronInput(preset.val)}
                                                className="px-3 py-3 bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-gray-800 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:border-brand-orange hover:text-brand-orange transition-colors flex flex-col items-start group"
                                            >
                                                <span>{preset.label}</span>
                                                <span className="font-mono text-gray-400 opacity-50 group-hover:opacity-100 group-hover:text-brand-orange transition-colors mt-1">{preset.val}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Priority (1=High, 100=Low)</label>
                                    <input 
                                        type="number" 
                                        value={priorityInput}
                                        onChange={(e) => setPriorityInput(e.target.value)}
                                        required
                                        min="1" max="100"
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-brand-darkBorder focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Timeout (ms)</label>
                                    <input 
                                        type="number" 
                                        value={timeoutInput}
                                        onChange={(e) => setTimeoutInput(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-brand-darkBorder focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Worker Group</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-brand-darkBorder focus:ring-2 focus:ring-brand-orange/20"
                                        value={workerGroupInput}
                                        onChange={(e) => setWorkerGroupInput(e.target.value)}
                                        required
                                    >
                                        <option value="Main Worker">Main Worker</option>
                                        <option value="PDF Worker">PDF Worker</option>
                                        <option value="Media Worker">Media Worker</option>
                                        <option value="Notification Worker">Notification Worker</option>
                                        <option value="Audit Worker">Audit Worker</option>
                                        <option value="Backup Worker">Backup Worker</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Reason for Change</label>
                                    <input 
                                        type="text" 
                                        value={reasonInput}
                                        onChange={(e) => setReasonInput(e.target.value)}
                                        placeholder="e.g. Updating interval per #TKT-102" 
                                        required
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-brand-darkBorder focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button type="submit" className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange transition-all">Save Schedule</button>
                                <button type="button" onClick={() => { setScheduleModalOpen(false); setCronInput(''); setReasonInput(''); setPriorityInput('50'); setTimeoutInput('300000'); setWorkerGroupInput('Main Worker'); }} className="flex-1 py-4 bg-gray-50 dark:bg-brand-darkBg text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-brand-orange transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default JobControl;
