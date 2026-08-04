import React, { useState } from 'react';
import { History, Search, Filter, Shield, Terminal, Globe, Cpu, Info, ChevronRight, AlertCircle, Download, FileJson, FileSpreadsheet } from 'lucide-react';

const AuditLogs = () => {
    const [expandedLog, setExpandedLog] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState('Severity: All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 20;

    React.useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const response = await fetch(`${baseUrl}/admin/audit-logs/global?page=${page}&limit=${limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch global audit logs');
                }
                const resData = await response.json();
                const rawLogs = resData.logs || [];
                
                const formatted = rawLogs.map(log => {
                    const actorName = log.actor 
                        ? `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim() || log.actor.email
                        : 'System';
                    
                    return {
                        id: log.id,
                        user: actorName,
                        action: log.action || 'Unknown Action',
                        time: new Date(log.created_at).toLocaleString(),
                        severity: log.severity || 'Info',
                        module: log.category || 'General',
                        target: log.target_name || 'System',
                        ip: log.ip_address || '0.0.0.0',
                        device: log.actor?.role || 'Service',
                        location: log.target_context || 'Global',
                        session: log.session_id || 'N/A',
                        payload: log.details || {}
                    };
                });
                
                setLogs(formatted);
                setTotalPages(resData.totalPages || 1);
                setTotalCount(resData.totalCount || 0);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [page]);

    const filteredLogs = logs.filter(log => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            log.user.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.ip.toLowerCase().includes(query) ||
            log.target.toLowerCase().includes(query);
            
        if (selectedSeverity === 'Severity: All') {
            return matchesSearch;
        }
        return matchesSearch && log.severity.toLowerCase() === selectedSeverity.toLowerCase();
    });

    const exportJSON = () => {
        if (!logs.length) return alert('No logs available to export.');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `auditor_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const exportCSV = () => {
        if (!logs.length) return alert('No logs available to export.');
        const headers = ['Timestamp', 'Actor/User', 'Action', 'Severity', 'Module', 'Target', 'IP Address', 'Device/Role', 'Location/Context', 'Session ID'];
        const csvRows = [
            headers.join(','),
            ...logs.map(log => {
                const row = [
                    log.time,
                    log.user,
                    log.action,
                    log.severity,
                    log.module,
                    log.target,
                    log.ip,
                    log.device,
                    log.location,
                    log.session
                ];
                return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
            })
        ];
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", csvContent);
        downloadAnchor.setAttribute("download", `auditor_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const exportPDF = async () => {
        if (!logs.length) return alert('No logs available to export.');
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const response = await fetch(`${baseUrl}/admin/devops/export-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: 'Auditor Global Audit Logs Report',
                    content: `Global Audit Report containing ${logs.length} log entries.\nDate: ${new Date().toLocaleString()}`,
                    logs: logs
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `report_${Date.now()}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } else {
                throw new Error('Failed to generate PDF');
            }
        } catch (error) {
            console.error(error);
            alert('Error generating PDF report. Please contact system admin.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Security</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Intelligence</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Access Audit Logs</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl h-fit">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400">Live Stream Active</span>
                    </div>
                    <button onClick={exportJSON} className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-brand-orange transition-all">
                        <FileJson size={14} />
                        <span>JSON</span>
                    </button>
                    <button onClick={exportCSV} className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-brand-orange transition-all">
                        <FileSpreadsheet size={14} />
                        <span>CSV</span>
                    </button>
                    <button onClick={exportPDF} className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-brand-orange transition-all">
                        <Download size={14} />
                        <span>PDF</span>
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden text-left">
                <div className="p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-500">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase font-black leading-none">System Event Stream</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Real-time forensic observation (Retention: 90 Days)</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Filter by user or IP..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-6 py-2.5 bg-gray-50 dark:bg-brand-darkBg border-none rounded-xl text-[10px] font-bold w-64" 
                            />
                        </div>
                        <div className="relative">
                            <select 
                                value={selectedSeverity}
                                onChange={(e) => setSelectedSeverity(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-brand-darkBg border-none rounded-xl text-[10px] font-bold appearance-none cursor-pointer"
                            >
                                <option>Severity: All</option>
                                <option>Critical</option>
                                <option>Warning</option>
                                <option>Info</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-brand-darkBorder">
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Severity</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User / Action / Session</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Module / Target</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Network Forensic</th>
                                <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {filteredLogs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className={`group transition-all cursor-pointer ${expandedLog === log.id ? 'bg-gray-50 dark:bg-brand-darkBg' : 'hover:bg-gray-50/50 dark:hover:bg-brand-darkBg/50'}`}>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-8 rounded-full ${log.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                                    log.severity === 'Warning' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                                    }`} />
                                                <span className={`text-[8px] font-black uppercase ${log.severity === 'Critical' ? 'text-red-500' :
                                                    log.severity === 'Warning' ? 'text-orange-500' : 'text-blue-500'
                                                    }`}>{log.severity}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{log.user}</p>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{log.action}</p>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase italic tracking-tighter">{log.session}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-brand-darkBg text-gray-500 text-[8px] font-black uppercase rounded">
                                                        {log.module}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-900 dark:text-brand-darkText">{log.target}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-600 dark:text-brand-darkText">
                                                    <Globe size={10} className="text-brand-orange" />
                                                    <span>{log.ip}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{log.device}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">{log.location}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <div className="flex flex-col items-end space-y-1 text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">{log.time}</p>
                                                <ChevronRight size={14} className={`text-gray-300 transition-all ${expandedLog === log.id ? 'rotate-90 text-brand-orange' : 'group-hover:text-brand-orange'}`} />
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedLog === log.id && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-6 bg-gray-50/50 dark:bg-brand-darkBg/20 border-b border-gray-100 dark:border-brand-darkBorder border-l-4 border-l-brand-orange animate-in slide-in-from-top-2 duration-300">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Forensic Detail View</h4>
                                                        <div className="space-y-3">
                                                            {(() => {
                                                                const metadataEntries = Object.entries(log.payload || {}).filter(([k]) => 
                                                                    !['session_id', 'sessionId', 'diff', 'reason', 'context'].includes(k)
                                                                );
                                                                const diffEntries = log.payload?.diff ? Object.entries(log.payload.diff) : [];

                                                                if (metadataEntries.length === 0 && diffEntries.length === 0) {
                                                                    return (
                                                                        <div className="p-4 bg-white dark:bg-brand-darkCard rounded-xl border border-dashed border-gray-200 text-center">
                                                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No detailed state delta</p>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <>
                                                                        {diffEntries.map(([field, values], i) => (
                                                                            <div key={`diff-${i}`} className="p-3 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">{field}</p>
                                                                                <div className="flex items-center space-x-4">
                                                                                    <div>
                                                                                        <p className="text-[8px] font-black text-gray-300 uppercase mb-1">From</p>
                                                                                        <p className="text-xs font-bold text-gray-400 line-through truncate uppercase">{String(values.old)}</p>
                                                                                    </div>
                                                                                    <span className="text-brand-orange font-black">→</span>
                                                                                    <div>
                                                                                        <p className="text-[8px] font-black text-green-500 uppercase mb-1">To</p>
                                                                                        <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{String(values.new)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {metadataEntries.length > 0 && (
                                                                            <div className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder font-mono text-[10px] space-y-2">
                                                                                {metadataEntries.map(([key, val], i) => (
                                                                                    <div key={i} className="flex space-x-2">
                                                                                        <span className="text-brand-orange font-black uppercase text-[9px] w-16">{key}:</span>
                                                                                        <span className="text-gray-600 dark:text-gray-400">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4 text-right">
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Actions</h4>
                                                        <div className="flex items-center justify-end space-x-3">
                                                            <button className="px-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[9px] font-black text-gray-400 uppercase hover:text-brand-orange transition-all">View All User Sessions</button>
                                                            <button className="px-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[9px] font-black text-gray-400 uppercase hover:text-brand-orange transition-all">Download Audit Report</button>
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

export default AuditLogs;
