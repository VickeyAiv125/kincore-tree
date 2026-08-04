import React, { useState } from 'react';
import { useCouncil } from '../../context/CouncilContext';
import {
    Download,
    Search,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    User,
    FileText,
    Globe,
    FileJson,
    FileSpreadsheet,
    DownloadCloud,
    Plus,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notification from '../../components/common/Notification';

const CustomCalendar = ({ selectedDate, onSelect, onClose }) => {
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <motion.button
                key={d}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    onSelect(dateStr);
                    onClose();
                }}
                className={`h-10 w-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${isSelected
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                    : isToday
                        ? 'bg-orange-50 text-brand-orange border border-brand-orange/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-brand-darkBg'
                    }`}
            >
                {d}
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 mt-2 p-6 bg-white dark:bg-brand-darkCard rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-brand-darkBorder min-w-[320px] left-0"
        >
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl text-brand-orange transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h4 className="font-black text-gray-900 dark:text-brand-darkText tracking-tight">
                    {monthNames[month]} {year}
                </h4>
                <button onClick={handleNextMonth} className="p-2 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl text-brand-orange transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="h-10 w-10 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </motion.div>
    );
};

const FilterButton = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-5 py-2.5 rounded-xl border text-[11px] font-black transition-all shadow-xs ${
            isActive 
                ? 'border-brand-orange bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20 dark:border-brand-orange' 
                : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard text-gray-800 dark:text-brand-darkText hover:border-brand-orange/30 hover:bg-orange-50/10 dark:hover:bg-brand-orange/10'
        }`}
    >
        {label}
    </button>
);

const AuditLogs = () => {
    const [expandedLog, setExpandedLog] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [highRiskOnly, setHighRiskOnly] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activePicker, setActivePicker] = useState(null); // 'start', 'end' or null
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const limit = 20;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isBranchAdmin = user.role === 'branch';
    const { selectedFamilyId } = useCouncil();
    const familySpaceId = user.role === 'council' 
        ? selectedFamilyId 
        : (localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || localStorage.getItem('currentFamilySpaceId') || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd');
    const token = localStorage.getItem('token');

    React.useEffect(() => {
        const fetchLogs = async () => {
            if (user.role === 'council' && !familySpaceId) {
                // If council admin hasn't loaded any assigned family space yet, don't fetch
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const url = user.role === 'council'
                    ? `${baseUrl}/admin/council/audit-logs?familySpaceId=${familySpaceId}&page=${page}&limit=${limit}`
                    : `${baseUrl}/family-admin/${familySpaceId}/audit-logs?page=${page}&limit=${limit}`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch audit logs');
                }
                const resData = await response.json();
                
                const formatted = (resData.logs || []).map(log => {
                    const actorName = log.actor 
                        ? `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim() || log.actor.email
                        : 'System';
                    
                    const details = log.details || {};
                    
                    return {
                        id: log.id,
                        timestamp: new Date(log.created_at || log.created_at).toLocaleString(),
                        rawDate: log.created_at || log.created_at,
                        actor: actorName,
                        action: log.action || 'Admin Action',
                        branch: details.branch_name || details.branchName || 'Global Space',
                        ip: log.ip_address || '0.0.0.0',
                        details: details
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
    }, [familySpaceId, token, page, user.role]);

    const filteredLogs = logs.filter(log => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = log.actor.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.ip.toLowerCase().includes(query) ||
            log.branch.toLowerCase().includes(query);
            
        if (!matchesSearch) return false;
        
        if (highRiskOnly) {
            const isHighRisk = log.action.toLowerCase().includes('delete') || 
                               log.action.toLowerCase().includes('transfer') || 
                               log.action.toLowerCase().includes('role') || 
                               log.action.toLowerCase().includes('lock');
            if (!isHighRisk) return false;
        }

        if (startDate || endDate) {
            const logDate = new Date(log.rawDate);
            if (startDate) {
                const s = new Date(startDate + 'T00:00:00');
                if (logDate < s) return false;
            }
            if (endDate) {
                const e = new Date(endDate + 'T23:59:59');
                if (logDate > e) return false;
            }
        }
        
        return true;
    });

    const exportJSON = () => {
        if (!logs.length) return setNotification({ message: 'No logs available to export.', type: 'error' });
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setNotification({ message: 'JSON Ledger Exported Successfully', type: 'success' });
    };

    const exportCSV = () => {
        if (!logs.length) return setNotification({ message: 'No logs available to export.', type: 'error' });
        const headers = ['Timestamp', 'Actor', 'Action', 'Branch', 'IP Address', 'Target', 'Old Value', 'New Value'];
        const csvRows = [
            headers.join(','),
            ...logs.map(log => {
                const row = [
                    log.timestamp,
                    log.actor,
                    log.action,
                    log.branch,
                    log.ip,
                    log.details?.target || 'N/A',
                    log.details?.oldValue || 'N/A',
                    log.details?.newValue || 'N/A'
                ];
                return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
            })
        ];
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", csvContent);
        downloadAnchor.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setNotification({ message: 'CSV Exported Successfully', type: 'success' });
    };

    const exportPDF = async () => {
        if (!logs.length) return setNotification({ message: 'No logs available to export.', type: 'error' });
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
                    title: 'Audit Logs Report',
                    content: `Audit Report containing ${logs.length} log entries.\nDate: ${new Date().toLocaleString()}`,
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
                setNotification({ message: 'PDF generated successfully!', type: 'success' });
            } else {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error(error);
            setNotification({ message: error.message || 'Error generating PDF report.', type: 'error' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto text-left py-4 pb-20">
            {notification.message && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: 'success' })}
                />
            )}
            <header className="mb-10">
                <h1 className="text-[32px] font-black text-gray-900 dark:text-brand-darkText leading-tight mb-3">
                    {user.role === 'council' ? 'Council Audit Logs' : isBranchAdmin ? 'Branch Audit Logs' : 'Global Audit Logs'}
                </h1>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl">
                    {user.role === 'council'
                        ? 'A chronological ledger of actions taken within your assigned family spaces.'
                        : isBranchAdmin
                            ? 'A restricted chronological ledger of actions within your authorized branch.'
                            : 'A detailed chronological ledger of every administrative action taken across all branches.'}
                </p>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
                    Error loading logs: {error}
                </div>
            )}

            <div className="mb-8">
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search by member, action type, or IP/Device"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#FFE5DE]/40 dark:bg-brand-orange/5 border-none rounded-2xl py-5 px-14 text-xs font-bold text-gray-800 dark:text-brand-darkText outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-bold transition-colors"
                    />
                    <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative">
                        <button 
                            onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                            className={`px-5 py-2.5 rounded-xl border text-[11px] font-black transition-all shadow-xs flex items-center gap-2 ${startDate ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard text-gray-800 dark:text-brand-darkText hover:bg-gray-50 dark:hover:bg-brand-darkBg'}`}
                        >
                            <CalendarIcon size={14} />
                            {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString() : 'Start Date'}
                            {startDate && (
                                <X 
                                    size={12} 
                                    className="ml-1 hover:text-red-500" 
                                    onClick={(e) => { e.stopPropagation(); setStartDate(''); }} 
                                />
                            )}
                        </button>
                        <AnimatePresence>
                            {activePicker === 'start' && (
                                <CustomCalendar 
                                    selectedDate={startDate} 
                                    onSelect={(d) => { setStartDate(d); setActivePicker(null); }} 
                                    onClose={() => setActivePicker(null)} 
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                            className={`px-5 py-2.5 rounded-xl border text-[11px] font-black transition-all shadow-xs flex items-center gap-2 ${endDate ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard text-gray-800 dark:text-brand-darkText hover:bg-gray-50 dark:hover:bg-brand-darkBg'}`}
                        >
                            <CalendarIcon size={14} />
                            {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString() : 'End Date'}
                            {endDate && (
                                <X 
                                    size={12} 
                                    className="ml-1 hover:text-red-500" 
                                    onClick={(e) => { e.stopPropagation(); setEndDate(''); }} 
                                />
                            )}
                        </button>
                        <AnimatePresence>
                            {activePicker === 'end' && (
                                <CustomCalendar 
                                    selectedDate={endDate} 
                                    onSelect={(d) => { setEndDate(d); setActivePicker(null); }} 
                                    onClose={() => setActivePicker(null)} 
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <FilterButton label="High Risk Events" isActive={highRiskOnly} onClick={() => setHighRiskOnly(!highRiskOnly)} />
                </div>
            </div>

            <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] overflow-hidden shadow-sm transition-colors text-left">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F9FAFB]/50 dark:bg-brand-darkBg/50 border-b border-gray-50 dark:border-brand-darkBorder">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-left">Timestamp</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-left">Actor (User)</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-left">Action Type</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-left">Branch</th>
                                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap text-left">IP/Device</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {filteredLogs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr
                                        className={`group hover:bg-orange-50/10 dark:hover:bg-brand-orange/5 transition-colors cursor-pointer ${expandedLog === log.id ? 'bg-orange-50/10 dark:bg-brand-orange/5' : ''}`}
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        <td className="px-8 py-6 text-[11px] font-black text-gray-800 dark:text-brand-darkText whitespace-nowrap font-mono flex items-center space-x-3">
                                            {expandedLog === log.id ? <ChevronUp size={14} className="text-brand-orange" /> : <ChevronDown size={14} className="text-gray-400 group-hover:text-brand-orange" />}
                                            <span>{log.timestamp}</span>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 whitespace-nowrap">{log.actor}</td>
                                        <td className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${log.action.includes('Risk') ? 'bg-red-50 text-red-500' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-400'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 whitespace-nowrap">{log.branch}</td>
                                        <td className="px-8 py-6 text-[11px] font-black text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">{log.ip}</td>
                                    </tr>
                                    {expandedLog === log.id && log.details && (
                                        <tr>
                                            <td colSpan="5" className="px-12 py-8 bg-gray-50/50 dark:bg-brand-darkBg/30 animate-fadeIn">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Forensic Details</p>
                                                        <div className="space-y-3">
                                                            {(() => {
                                                                const metadataEntries = Object.entries(log.details || {}).filter(([k]) => 
                                                                    !['session_id', 'sessionId', 'diff', 'reason', 'context'].includes(k)
                                                                );
                                                                const diffEntries = log.details?.diff ? Object.entries(log.details.diff) : [];

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
                                                                            <div className="p-3 bg-white dark:bg-brand-darkCard rounded-xl border border-gray-100 dark:border-brand-darkBorder shadow-sm font-mono text-[10px] space-y-2">
                                                                                {metadataEntries.map(([key, val], i) => (
                                                                                    <div key={i} className="flex space-x-2 items-start">
                                                                                        <span className="text-brand-orange font-black uppercase text-[9px] w-24 shrink-0">{key}:</span>
                                                                                        <span className="text-gray-600 dark:text-gray-400 break-all whitespace-pre-wrap flex-1">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end items-end">
                                                        <button className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline flex items-center space-x-2">
                                                            <ShieldAlert size={12} />
                                                            <span>Report Anomaly</span>
                                                        </button>
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

            <div className="flex flex-wrap gap-4 justify-end mt-12 mb-20">
                <p className="w-full text-right text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Download Audit Ledger</p>
                <button
                    onClick={exportJSON}
                    className="flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-900/10 group"
                >
                    <FileJson size={16} className="group-hover:translate-y-1 transition-transform" />
                    <span>JSON Ledger</span>
                </button>
                <button
                    onClick={exportCSV}
                    className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard text-gray-900 dark:text-brand-darkText border border-gray-100 dark:border-brand-darkBorder px-8 py-4 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all active:scale-95 shadow-sm group"
                >
                    <FileSpreadsheet size={16} className="group-hover:translate-y-1 transition-transform text-green-500" />
                    <span>CSV / Excel</span>
                </button>
                <button
                    onClick={exportPDF}
                    className="flex items-center space-x-2 bg-brand-orange text-white px-10 py-4 rounded-2xl font-black text-xs shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 group"
                >
                    <Download size={16} className="group-hover:translate-y-1 transition-transform" />
                    <span>Print PDF Report</span>
                </button>
            </div>
        </div>
    );
};

export default AuditLogs;
