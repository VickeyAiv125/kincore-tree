import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Download,
    FileText,
    FileJson,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    User,
    Activity,
    Settings,
    Lock,
    Globe,
    Cpu,
    Fingerprint,
    History,
    Loader2
} from 'lucide-react';

const Audit = () => {
    const [expandedLog, setExpandedLog] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [exportStatus, setExportStatus] = useState(null); // 'json', 'csv', 'pdf', 'escalate'
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 20;

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const response = await fetch(`${baseUrl}/admin/business/audit-logs?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resData = await response.json();
            if (response.ok) {
                const rawLogs = resData.logs || [];
                const data = rawLogs.map(log => ({
                    id: log.id,
                    displayId: `LOG-${log.id.split('-')[0].toUpperCase()}`,
                    actor: log.actor?.first_name ? `${log.actor.first_name} ${log.actor.last_name}` : 'System',
                    role: log.actor?.role || 'Service',
                    action: log.action,
                    target: log.target_name || 'N/A',
                    branch: log.target_context || 'Global',
                    ip: log.ip_address || '0.0.0.0',
                    timestamp: new Date(log.created_at).toLocaleString(),
                    severity: log.severity || 'NOTICE',
                    category: log.category || 'GENERAL',
                    sessionId: log.session_id || 'N/A',
                    details: log.details || {}
                }));
                setLogs(data);
                setTotalPages(resData.totalPages || 1);
                setTotalCount(resData.totalCount || 0);
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = async (type) => {
        setExportStatus(type);
        setTimeout(() => setExportStatus(null), 2000);

        if (type === 'json') {
            if (!logs.length) return alert('No logs available to export.');
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `business_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } else if (type === 'csv') {
            if (!logs.length) return alert('No logs available to export.');
            const headers = ['Forensic ID', 'Severity', 'Category', 'Actor', 'Role', 'Action', 'Target Space', 'Branch/Context', 'Timestamp', 'IP Address', 'Session ID'];
            const csvRows = [
                headers.join(','),
                ...logs.map(log => [
                    log.displayId,
                    log.severity,
                    log.category,
                    log.actor,
                    log.role,
                    log.action,
                    log.target,
                    log.branch,
                    log.timestamp,
                    log.ip,
                    log.sessionId
                ].join(','))
            ];
            const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `business_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }
    };

    return (
        <div className="max-w-7xl mx-auto text-left py-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Business Hub</h2>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Compliance</h2>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight mb-4">Audit & Compliance Logs</h1>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl uppercase tracking-widest">
                    Forensic-grade immutable ledger of every administrative action taken across the platform.
                </p>
            </header>

            {/* Controls */}
            <div className="mb-10 space-y-6">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-orange group-focus-within:scale-110 transition-transform" size={22} />
                    <input
                        type="text"
                        placeholder="Search logs by actor, Family Space, or forensic ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl text-sm font-black text-gray-900 dark:text-brand-darkText outline-none shadow-sm focus:ring-4 focus:ring-brand-orange/10 transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setFilterType('All')}
                            className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'All' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-50 dark:bg-brand-darkBg border-gray-100 dark:border-brand-darkBorder text-gray-400 hover:border-brand-orange/30 hover:text-brand-orange'}`}
                        >
                            Filter: All Events
                        </button>
                        <button
                            onClick={() => setFilterType('CRITICAL')}
                            className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'CRITICAL' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 dark:bg-brand-darkBg border-gray-100 dark:border-brand-darkBorder text-gray-400 hover:border-red-500/30 hover:text-red-500'}`}
                        >
                            High Risk Only
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Export Ledger:</p>
                        <button
                            onClick={() => handleExport('json')}
                            className={`p-3 rounded-xl border transition-all shadow-sm ${exportStatus === 'json' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-brand-darkCard border-gray-100 dark:border-brand-darkBorder text-gray-400 hover:text-brand-orange hover:bg-orange-50/50'}`}
                        >
                            <FileJson size={20} className={exportStatus === 'json' ? 'animate-bounce' : ''} />
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className={`p-3 rounded-xl border transition-all shadow-sm ${exportStatus === 'csv' ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-brand-darkCard border-gray-100 dark:border-brand-darkBorder text-gray-400 hover:text-green-500 hover:bg-green-50/50'}`}
                        >
                            <FileSpreadsheet size={20} className={exportStatus === 'csv' ? 'animate-bounce' : ''} />
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className={`rounded-xl shadow-lg transition-all active:scale-95 flex items-center space-x-2 px-6 py-3 ${exportStatus === 'pdf' ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-brand-orange text-white shadow-brand-orange/20 hover:bg-orange-600'}`}
                        >
                            <Download size={18} className={exportStatus === 'pdf' ? 'animate-pulse' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{exportStatus === 'pdf' ? 'Generating...' : 'PDF Report'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-xl overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Severity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Category</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Actor</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Action</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Target</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="animate-spin text-brand-orange mb-4" size={32} />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching Immutable Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.filter(log =>
                                (filterType === 'All' || log.severity === filterType) &&
                                (log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || log.action.toLowerCase().includes(searchQuery.toLowerCase()) || log.target.toLowerCase().includes(searchQuery.toLowerCase()))
                            ).map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                        className={`group hover:bg-orange-50/10 dark:hover:bg-brand-orange/5 cursor-pointer transition-all ${expandedLog === log.id ? 'bg-orange-50/20 dark:bg-brand-orange/10 border-l-4 border-l-brand-orange' : ''}`}
                                    >
                                        <td className="px-8 py-6">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black tracking-tighter ${log.severity === 'CRITICAL' ? 'bg-red-50 text-red-500 shadow-[2px_2px_0_rgba(239,68,68,0.1)]' : 'bg-green-50 text-green-500'}`}>
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                            {log.category}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center text-gray-400">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-gray-900 dark:text-brand-darkText uppercase leading-none mb-1">{log.actor}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{log.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black text-brand-orange uppercase tracking-tight">{log.action}</td>
                                        <td className="px-8 py-6 text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase leading-none">
                                            {log.target}
                                            <span className="block text-[8px] text-gray-400 mt-1.5 font-bold uppercase">{log.branch}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono tracking-tighter">{log.timestamp}</p>
                                            <p className="text-[8px] font-black text-brand-orange/40 uppercase mt-0.5">{log.ip}</p>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black tracking-widest text-gray-300">FID: {log.displayId.split('-').pop()}</span>
                                                    {expandedLog === log.id ? <ChevronUp size={14} className="text-brand-orange mt-1" /> : <ChevronDown size={14} className="group-hover:text-brand-orange transition-colors mt-1" />}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedLog === log.id && (
                                        <tr>
                                            <td colSpan="7" className="px-12 py-10 bg-gray-50/50 dark:bg-brand-darkBg/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <Fingerprint size={12} className="text-brand-orange" />
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Session Integrity</p>
                                                            </div>
                                                            <div className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                                                                <p className="text-[10px] font-black text-gray-800 dark:text-brand-darkText uppercase mb-1">Session ID</p>
                                                                <p className="text-xs font-mono font-bold text-brand-orange">{log.sessionId}</p>
                                                                <div className="h-px bg-gray-50 dark:bg-brand-darkBorder my-3" />
                                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Forensic ID / Hash</p>
                                                                <p className="text-[8px] font-mono text-gray-300 break-all leading-tight">SHA-256: {log.id}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6 col-span-1">
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <History size={12} className="text-brand-orange" />
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Metadata Diff</p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(() => {
                                                                const metadataEntries = Object.entries(log.details || {}).filter(([k]) => 
                                                                    !['session_id', 'sessionId', 'diff', 'reason', 'context'].includes(k)
                                                                );
                                                                const diffEntries = log.details?.diff ? Object.entries(log.details.diff) : [];

                                                                if (metadataEntries.length === 0 && diffEntries.length === 0) {
                                                                    return (
                                                                        <div className="p-6 bg-white dark:bg-brand-darkCard rounded-2xl border border-dashed border-gray-200 text-center">
                                                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No state delta recorded</p>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <>
                                                                        {diffEntries.map(([field, values], i) => (
                                                                            <div key={`diff-${i}`} className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">{field}</p>
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div>
                                                                                        <p className="text-[8px] font-black text-gray-300 uppercase mb-1">From</p>
                                                                                        <p className="text-xs font-bold text-gray-400 line-through truncate uppercase">{String(values.old)}</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-[8px] font-black text-green-500 uppercase mb-1">To</p>
                                                                                        <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{String(values.new)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {metadataEntries.map(([field, value], i) => (
                                                                            <div key={`meta-${i}`} className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">{field.replace(/_/g, ' ')}</p>
                                                                                <div className="flex flex-col">
                                                                                    <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase break-all">
                                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col justify-between">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Compliance Context</p>
                                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase tracking-tight italic mb-3">
                                                                    "{log.details.reason || log.details.context || 'Administrative action via internal hub.'}"
                                                                </p>
                                                                {log.action === 'MANUAL_BACKUP_SNAPSHOT' && (
                                                                    <div className="mt-4 p-4 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl flex flex-col space-y-2">
                                                                        <p className="text-[9px] font-black text-brand-orange uppercase tracking-widest">Snapshot Artifact Storage</p>
                                                                        <p className="text-[10px] font-mono text-gray-800 dark:text-brand-darkText">Secured inside Supabase Database</p>
                                                                        <p className="text-[8px] font-bold text-brand-orange/70 uppercase">Table: <span className="font-mono bg-brand-orange/20 px-1 rounded">audit_logs</span></p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col space-y-2 mt-8">
                                                            <button
                                                                onClick={() => handleExport('escalate')}
                                                                className={`flex items-center justify-center space-x-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${exportStatus === 'escalate' ? 'bg-red-600 text-white shadow-red-500/40' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                                            >
                                                                <ShieldAlert size={14} className={exportStatus === 'escalate' ? 'animate-ping' : ''} />
                                                                <span>{exportStatus === 'escalate' ? 'Escalation Sent' : 'Escalate Forensic Audit'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 dark:border-brand-darkBorder bg-gray-50/10 dark:bg-brand-darkBg/30 transition-colors">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                        Showing {totalCount > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} logs
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl border border-gray-100 dark:border-brand-darkBorder text-[10px] font-black uppercase tracking-widest bg-white dark:bg-brand-darkCard text-gray-400 hover:text-brand-orange disabled:opacity-40 disabled:hover:text-gray-400 transition-all shadow-xs"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-4 py-2 rounded-xl border border-gray-100 dark:border-brand-darkBorder text-[10px] font-black uppercase tracking-widest bg-white dark:bg-brand-darkCard text-gray-400 hover:text-brand-orange disabled:opacity-40 disabled:hover:text-gray-400 transition-all shadow-xs"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Audit;
