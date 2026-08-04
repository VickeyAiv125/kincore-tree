import React, { useState, useEffect } from 'react';
import { Terminal, Search, Filter, Download, Trash2, ChevronRight, Hash, User, Activity, Box, Loader2 } from 'lucide-react';

const LogsExplorer = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/devops/logs?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Map system_logs to explorer format
                const mapped = (data || []).map(l => ({
                    time: new Date(l.timestamp).toLocaleString(),
                    level: l.level,
                    service: l.service,
                    msg: l.action,
                    actor: l.user_id || l.request_id || 'System',
                    metadata: l.metadata,
                    error: l.error_message
                }));
                setLogs(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Polling every 5 seconds for MVP
        return () => clearInterval(interval);
    }, []);

    const [isExportingSIEM, setIsExportingSIEM] = useState(false);

    const getLevelColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded';
            case 'ERROR': return 'text-red-500';
            case 'WARNING': return 'text-orange-500';
            case 'DEBUG': return 'text-blue-500';
            default: return 'text-green-500';
        }
    };

    const [selectedLog, setSelectedLog] = useState(null);
    const [serviceFilter, setServiceFilter] = useState('All Services');
    const [levelFilter, setLevelFilter] = useState('Levels: All');

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.msg.toLowerCase().includes(searchQuery.toLowerCase()) || 
            log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesService = serviceFilter === 'All Services' || 
                               log.service.includes(serviceFilter) || 
                               log.service === serviceFilter;

        let matchesLevel = true;
        if (levelFilter !== 'Levels: All') {
            if (levelFilter === 'ERROR') {
                matchesLevel = log.level === 'ERROR' || log.level === 'CRITICAL';
            } else {
                matchesLevel = log.level === levelFilter;
            }
        }

        return matchesSearch && matchesService && matchesLevel;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left h-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Global</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Logging</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">System Logs Explorer</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsExportingSIEM(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-orange transition-all"
                    >
                        <Terminal size={18} />
                        <span>SIEM Setup (Pending)</span>
                    </button>
                    <button 
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('token');
                                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                                const res = await fetch(`${baseUrl}/admin/devops/logs/export`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ format: 'csv', search: searchQuery })
                                });
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `logs_export_${Date.now()}.csv`;
                                a.click();
                            } catch (e) { console.error('Export failed', e); }
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-brand-darkBorder hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button 
                        onClick={() => setLogs([])}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-50 dark:bg-brand-darkBg text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-brand-darkBorder hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                    >
                        <Trash2 size={18} />
                        <span>Clear Buffer</span>
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                {/* Search & Filter Header */}
                <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder bg-gray-50/30 dark:bg-brand-darkBg/30">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search logs by keyword, action, or user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-6 py-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-4 focus:ring-brand-orange/10 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select 
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                    className="pl-12 pr-10 py-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 appearance-none outline-none focus:ring-4 focus:ring-brand-orange/10 cursor-pointer">
                                    <option value="All Services">All Services</option>
                                    <option value="API_GLOBAL">API_GLOBAL</option>
                                    <option value="BACKGROUND_JOBS">BACKGROUND_JOBS</option>
                                    <option value="ADMIN_PANEL">ADMIN_PANEL</option>
                                    <option value="SYSTEM">SYSTEM</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select 
                                    value={levelFilter}
                                    onChange={(e) => setLevelFilter(e.target.value)}
                                    className="pl-12 pr-10 py-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 appearance-none outline-none focus:ring-4 focus:ring-brand-orange/10 cursor-pointer">
                                    <option value="Levels: All">Levels: All</option>
                                    <option value="ERROR">Error (inc. Critical)</option>
                                    <option value="WARNING">Warning</option>
                                    <option value="INFO">Info</option>
                                    <option value="DEBUG">Debug</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log Terminal Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0B0D11] dark:bg-[#020202] font-mono text-sm text-left">
                    <div className="space-y-1.5">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Attaching to stream...</p>
                            </div>
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedLog(log)}
                                    className="flex items-start space-x-4 p-2 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer"
                                >
                                    <span className="text-gray-600 dark:text-gray-700 shrink-0 select-none">{idx + 1}</span>
                                    <span className="text-gray-500 dark:text-gray-600 shrink-0">{log.time}</span>
                                    <span className={`w-16 shrink-0 font-black ${getLevelColor(log.level)}`}>[{log.level}]</span>
                                    <span className="text-blue-400 dark:text-blue-500 shrink-0 font-bold">{log.service}:</span>
                                    <span className="text-gray-300 dark:text-gray-400 leading-relaxed break-all">{log.msg} <span className="opacity-40 italic">({log.actor})</span></span>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-gray-600">
                                <p className="text-[10px] font-black uppercase tracking-widest">Buffer empty. No logs matching query.</p>
                            </div>
                        )}
                        <div className="pt-4 flex items-center space-x-2 text-brand-orange animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Listening for live system logs...</span>
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="px-8 py-6 border-t border-gray-50 dark:border-brand-darkBorder bg-gray-50/30 dark:bg-brand-darkBg/30 flex items-center justify-between">
                    <div className="flex items-center space-x-12">
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-brand-darkBg rounded-full overflow-hidden">
                                <div className="h-full w-[42%] bg-brand-orange" />
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                Buffer: <span className="text-gray-900 dark:text-brand-darkText">Healthy</span>
                            </p>
                        </div>
                        <div className="flex flex-col text-left">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Retention</p>
                            <p className="text-[10px] font-bold text-gray-900 dark:text-brand-darkText uppercase opacity-60">Auto-rotate active</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Stream: Live</span>
                    </div>
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-2xl rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-50 dark:border-brand-darkBorder flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Log Details</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {selectedLog.actor}</p>
                            </div>
                            <span className={`px-3 py-1 rounded font-black text-[10px] uppercase tracking-widest ${getLevelColor(selectedLog.level)}`}>
                                {selectedLog.level}
                            </span>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{selectedLog.service}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{selectedLog.time}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Action / Message</p>
                                <div className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{selectedLog.msg}</p>
                                </div>
                            </div>

                            {selectedLog.error && (
                                <div>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Error Trace</p>
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 font-mono text-xs text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap">
                                        {selectedLog.error}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Metadata / Payload</p>
                                <div className="p-4 bg-[#0B0D11] dark:bg-[#020202] rounded-xl font-mono text-xs text-blue-400 overflow-x-auto">
                                    <pre>{JSON.stringify(selectedLog.metadata || {}, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-50 dark:border-brand-darkBorder flex justify-end">
                            <button onClick={() => setSelectedLog(null)} className="px-6 py-3 bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-all">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIEM Export Modal */}
            {isExportingSIEM && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-lg rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 dark:border-brand-darkBorder text-left">
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">Enterprise SIEM Setup</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 text-left">Connect to external security cluster</p>
                        </div>
                        <div className="p-10 space-y-10 text-left">
                            <div className="p-6 bg-orange-50 dark:bg-orange-950/10 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-relaxed">
                                    SIEM Integration (Splunk/ELK) is currently in <span className="font-black">BETA</span>. Please contact support to provision an API endpoint.
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                <button onClick={() => setIsExportingSIEM(false)} className="flex-1 py-4 bg-gray-50 dark:bg-brand-darkBg text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-brand-orange transition-all">Close Setup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogsExplorer;
