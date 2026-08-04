import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, History, ShieldAlert, ChevronRight, ChevronDown, ChevronUp, User, Clock, Loader2, Download, X, CheckCircle } from 'lucide-react';

const Badge = ({ children }) => {
    const variants = {
        Open: 'bg-[#FFE8E2] dark:bg-brand-orange/20 text-[#FF6D4D] dark:text-brand-orange',
        Closed: 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500',
        L1: 'bg-blue-50 dark:bg-blue-900/10 text-blue-500',
        L2: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-500',
        L3: 'bg-red-50 dark:bg-red-900/10 text-red-500 animate-pulse',
        Harassment: 'bg-gray-100 dark:bg-brand-darkBg text-gray-600',
        Spam: 'bg-[#FFF9E5] dark:bg-yellow-950/20 text-[#DAA520] dark:text-yellow-400',
        'Hate Speech': 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
        Fraud: 'bg-[#FFF9E5] dark:bg-yellow-950/20 text-[#DAA520] dark:text-yellow-400',
        Violence: 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${variants[children] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400'}`}>
            {children}
        </span>
    );
};

const Safety = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedFamilies, setBlockedFamilies] = useState([]);
    const [taskStatus, setTaskStatus] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');
    const [expandedCase, setExpandedCase] = useState(null);
    const [activeTab, setActiveTab] = useState('Users');
    const [toastMsg, setToastMsg] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [rateLimit, setRateLimit] = useState('');

    const fetchSafetyData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            // 1. Fetch Reports
            const reportsRes = await fetch(`${baseUrl}/admin/safety/reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const reportsData = await reportsRes.json();
            if (reportsRes.ok) {
                setReports(reportsData.map(r => {
                    // Calculate dynamic SLA based on 24 hour target
                    let slaText = '24h remaining';
                    if (r.created_at) {
                        const created = new Date(r.created_at);
                        const now = new Date();
                        const diffHours = (now - created) / (1000 * 60 * 60);
                        const remaining = 24 - diffHours;
                        
                        if (r.status === 'resolved' || r.status === 'closed') {
                            slaText = 'Resolved';
                        } else if (remaining <= 0) {
                            slaText = 'EXPIRED';
                        } else if (remaining < 1) {
                            slaText = `${Math.floor(remaining * 60)}m remaining`;
                        } else {
                            slaText = `${Math.floor(remaining)}h remaining`;
                        }
                    }

                    return {
                        id: r.id,
                        user_id: r.reported_user_id || r.target_id,
                        user: r.reported_user ? `${r.reported_user.first_name} ${r.reported_user.last_name}` : `Target: ${r.target_type}`,
                        type: r.report_type,
                        level: r.priority_level,
                        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
                        reporter: r.reporter ? `${r.reporter.first_name} ${r.reporter.last_name}` : 'System',
                        assigned: r.resolver ? `${r.resolver.first_name} ${r.resolver.last_name}` : 'Unassigned',
                        sla: slaText,
                        reason: r.reason,
                        created_at: r.created_at,
                        updated_at: r.updated_at,
                        metadata: r.metadata
                    };
                }));
            }

            // 2. Fetch Purged Users (GDPR)
            const dashboardRes = await fetch(`${baseUrl}/admin/business/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dashboardData = await dashboardRes.json();
            if (dashboardRes.ok && dashboardData.alerts?.critical_incident_logs) {
                const purges = dashboardData.alerts.critical_incident_logs.filter(log => log.type === 'ACCOUNT_TAKEOVER');
                setBlockedUsers(purges.map(p => ({
                    id: p.source.replace('User ID: ', '') || 'Unknown',
                    username: 'PURGED USER',
                    reason: 'Permanently deleted via GDPR Purge'
                })));
            }

            // 3. Fetch Suspended Families
            const familiesRes = await fetch(`${baseUrl}/admin/business/risk-assessment?status=suspended`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const familiesData = await familiesRes.json();
            if (familiesRes.ok) {
                setBlockedFamilies(familiesData.map(f => ({
                    id: f.id,
                    username: f.name, // using username column in table to display family name
                    reason: f.status_reason || 'Family Space Suspended'
                })));
            }

            // 4. Fetch Global Rate Limit Config
            const configsRes = await fetch(`${baseUrl}/admin/devops/configs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const configsData = await configsRes.json();
            if (configsRes.ok) {
                const limit = configsData.find(c => c.key === 'global_rate_limit');
                if (limit && limit.value) {
                    let val = limit.value;
                    if (typeof val === 'string') {
                        val = val.replace(/^"|"$/g, '');
                    } else if (typeof val === 'object') {
                        val = JSON.stringify(val).replace(/^"|"$/g, '');
                    }
                    setRateLimit(val || '1000');
                } else {
                    setRateLimit('1000');
                }
            }

        } catch (err) {
            console.error('Error fetching safety data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSafetyData();
    }, [fetchSafetyData]);

    const handleUnblock = async (id, type) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            let url, method, body;

            if (type === 'Users') {
                url = `${baseUrl}/admin/users/${id}/status`;
                method = 'PATCH';
                body = JSON.stringify({ status: 'active' });
            } else if (type === 'Families') {
                url = `${baseUrl}/admin/business/spaces/${id}/reinstate`;
                method = 'POST';
                body = JSON.stringify({ reason: 'Reinstated by Admin via Safety Dashboard' });
            } else {
                return; // IPs not implemented yet
            }

            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body
            });

            if (res.ok) {
                setToastMsg(`${type.slice(0, -1)} unblocked successfully.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                fetchSafetyData();
            } else {
                const error = await res.json();
                setToastMsg('Failed to unblock: ' + (error.error || res.statusText));
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (err) {
            console.error('Unblock error:', err);
            setToastMsg('Failed to unblock: ' + err.message);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleModerate = async (id, status = 'Closed') => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const response = await fetch(`${baseUrl}/admin/safety/reports/${id}/moderate`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: status.toLowerCase(), 
                    notes: 'Moderated via Safety Dashboard' 
                })
            });
            
            if (response.ok) {
                setToastMsg(`Case ${id} ${status} successfully.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                fetchSafetyData();
            } else {
                const error = await response.json();
                setToastMsg('Action failed: ' + (error.error || response.statusText));
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (err) {
            console.error('Moderation failed:', err);
            setToastMsg('Action failed: ' + err.message);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleEscalate = (id) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, level: r.level === 'L1' ? 'L2' : 'L3' } : r));
    };

    const updateRateLimit = async () => {
        setTaskStatus(prev => ({ ...prev, 'rate-limit': 'running' }));
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            
            const res = await fetch(`${baseUrl}/admin/devops/configs/bulk`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    updates: [{ key: 'global_rate_limit', value: rateLimit }],
                    reason: 'Updated rate limit from Trust & Safety panel'
                })
            });
            
            if (res.ok) {
                setTaskStatus(prev => ({ ...prev, 'rate-limit': 'done' }));
                setToastMsg('Rate limit updated successfully');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    setTaskStatus(prev => ({ ...prev, 'rate-limit': 'idle' }));
                }, 3000);
            } else {
                setTaskStatus(prev => ({ ...prev, 'rate-limit': 'idle' }));
                setToastMsg('Failed to update rate limit');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (err) {
            console.error('Error updating rate limit:', err);
            setTaskStatus(prev => ({ ...prev, 'rate-limit': 'idle' }));
            setToastMsg('Network error updating rate limit');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const runConfig = (taskId) => {
        setTaskStatus(prev => ({ ...prev, [taskId]: 'running' }));
        setTimeout(() => setTaskStatus(prev => ({ ...prev, [taskId]: 'done' })), 1500);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(reports, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Abuse_Reports_Export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getTimeline = (report) => {
        const timeline = [];
        if (report.created_at) timeline.push({ date: new Date(report.created_at).toLocaleString(), action: 'Reported', actor: report.reporter });
        if (report.updated_at && report.status !== 'Pending') timeline.push({ date: new Date(report.updated_at).toLocaleString(), action: 'Investigated/Updated', actor: report.assigned !== 'Unassigned' ? report.assigned : 'System' });
        if (report.status === 'Resolved' || report.status === 'Closed') timeline.push({ date: new Date(report.updated_at).toLocaleString(), action: 'Resolved', actor: report.assigned !== 'Unassigned' ? report.assigned : 'System' });
        return timeline;
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl pb-20 px-4 sm:px-0 relative">
            
            {showToast && (
                <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-[150] animate-in slide-in-from-right-10 flex items-center space-x-3">
                    <CheckCircle size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">{toastMsg}</span>
                </div>
            )}

            <header>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Trust, Safety & Abuse Management</h1>
            </header>

            {/* Global Abuse Reports */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText leading-none transition-colors">Global Abuse Reports</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search Case ID or User..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText shadow-sm focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all w-60"
                            />
                        </div>
                        <div className="flex bg-gray-50 dark:bg-brand-darkBg p-1 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                            {['All', 'L1', 'L2', 'L3'].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setFilterLevel(lvl)}
                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterLevel === lvl ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400'}`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange/90 transition-colors shadow-sm">
                            <Download size={14} />
                        </button>
                    </div>
                </div>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/30 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Case ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reported User</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">SLA Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Assignee</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder relative min-h-[200px]">
                                {loading && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-brand-darkCard/50 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-brand-orange" size={32} />
                                    </div>
                                )}
                                {reports.filter(r =>
                                    (filterLevel === 'All' || r.level === filterLevel) &&
                                    (r.user.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
                                ).map((report, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr
                                            onClick={() => setExpandedCase(expandedCase === report.id ? null : report.id)}
                                            className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-5 text-[10px] font-bold text-gray-400 transition-colors uppercase">
                                                <div className="flex items-center space-x-2">
                                                    {expandedCase === report.id ? <ChevronDown size={14} className="text-brand-orange" /> : <ChevronRight size={14} className="group-hover:text-brand-orange transition-colors" />}
                                                    <span>CASE-{report.id.toString().substring(0, 5)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge>{report.level}</Badge>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">
                                                 {report.user} <span className="text-[10px] text-gray-400 block font-normal">UID: {report.user_id?.substring(0, 8) || 'N/A'}</span>
                                             </td>
                                             <td className="px-6 py-5">
                                                 <div className="flex flex-col space-y-1">
                                                     <span className={`text-[10px] font-bold ${report.sla.includes('EXPIRED') ? 'text-red-500' : 'text-green-500'}`}>
                                                         {report.sla}
                                                     </span>
                                                     <div className="w-16 h-1 bg-gray-100 dark:bg-brand-darkBg rounded-full overflow-hidden">
                                                         <div className={`h-full ${report.sla.includes('EXPIRED') ? 'bg-red-500 w-full' : 'bg-green-500 w-2/3'}`} />
                                                     </div>
                                                 </div>
                                             </td>
                                             <td className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                 {report.assigned}
                                             </td>
                                             <td className="px-6 py-5 text-center">
                                                 <Badge>{report.status}</Badge>
                                             </td>
                                             <td className="px-6 py-5 text-sm font-bold text-brand-orange text-right space-x-3 uppercase tracking-tight transition-all">
                                                 <button
                                                     onClick={(e) => { e.stopPropagation(); handleModerate(report.id); }}
                                                     className={`hover:underline ${report.status === 'Closed' ? 'opacity-30 pointer-events-none' : ''}`}
                                                 >
                                                     Moderate
                                                 </button>
                                                 <button
                                                     onClick={(e) => { e.stopPropagation(); handleEscalate(report.id); }}
                                                     className={`text-gray-400 hover:text-gray-600 ${report.level === 'L3' ? 'opacity-30' : ''}`}
                                                 >
                                                     Escalate
                                                 </button>
                                             </td>
                                         </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {expandedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-xl rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {(() => {
                            const report = reports.find(r => r.id === expandedCase);
                            if (!report) return null;
                            return (
                                <>
                                <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex justify-between items-center text-left bg-gray-50/50 dark:bg-brand-darkBg/50">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic text-left">Case Details</h3>
                                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mt-1 text-left">CASE-{report.id.toString().substring(0, 8)}</p>
                                    </div>
                                    <button onClick={() => setExpandedCase(null)} className="p-2 bg-white dark:bg-brand-darkCard text-gray-400 rounded-xl hover:text-red-500 transition-colors shadow-sm">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-8 text-left max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {/* Evidence Section */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                                            <ShieldAlert size={14} className="text-brand-orange" />
                                            <span>Evidence & Context</span>
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-brand-darkBg p-5 rounded-2xl border border-gray-100 dark:border-brand-darkBorder space-y-4">
                                            <div className="flex justify-between border-b border-gray-200 dark:border-brand-darkBorder pb-3">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Report Category</span>
                                                <span className="text-[10px] font-black text-gray-800 dark:text-brand-darkText uppercase">{report.type}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Provided Reason</span>
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed italic">"{report.reason}"</p>
                                            </div>
                                            {report.metadata && Object.keys(report.metadata).length > 0 && (
                                                <div className="space-y-2 pt-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Additional Metadata</span>
                                                    <pre className="text-[9px] text-gray-500 overflow-x-auto bg-white dark:bg-brand-darkCard p-2 rounded-lg border border-gray-100 dark:border-brand-darkBorder">
                                                        {JSON.stringify(report.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Section */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                                            <History size={14} className="text-brand-orange" />
                                            <span>Timeline</span>
                                        </h4>
                                        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-brand-darkBorder pl-8">
                                            {getTimeline(report).map((h, hi) => (
                                                <div key={hi} className="relative">
                                                    <div className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-brand-orange ring-4 ring-white dark:ring-brand-darkCard" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{h.action}</span>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Clock size={10} className="text-gray-300" />
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{h.date}</span>
                                                            <span className="text-[9px] font-black text-brand-orange/60 uppercase">— {h.actor}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Technical Controls */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Technical Controls</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder transition-colors">
                    <div className="flex-1 pr-4">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-brand-darkText transition-colors">IP Rate Limiting (Requests/Minute)</h4>
                        <p className="text-xs font-semibold text-[#B28E86] dark:text-orange-900/60 mt-1 transition-colors">Limit the number of requests from a single IP address per 60s window to prevent abuse.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input 
                            type="number" 
                            value={rateLimit}
                            onChange={(e) => setRateLimit(e.target.value)}
                            className="w-24 px-4 py-2.5 bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none focus:border-brand-orange/50 transition-colors"
                        />
                        <button
                            onClick={updateRateLimit}
                            disabled={taskStatus['rate-limit'] === 'running'}
                            className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 leading-none ${taskStatus['rate-limit'] === 'done' ? 'bg-green-500 text-white' : taskStatus['rate-limit'] === 'running' ? 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 animate-pulse' : 'bg-[#FFE8E2] dark:bg-brand-orange/20 text-brand-orange hover:bg-[#FFD8D2] dark:hover:bg-brand-orange/30'}`}
                        >
                            {taskStatus['rate-limit'] === 'done' ? 'Saved' : taskStatus['rate-limit'] === 'running' ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Blocklist Manager */}
            <section className="space-y-6 pt-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Blocklist Manager</h3>

                {/* Tabs */}
                <div className="flex items-center space-x-8 border-b border-gray-100 dark:border-brand-darkBorder overflow-x-auto custom-scrollbar transition-colors">
                    {['Users', 'Families', 'IP Addresses'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-400 dark:text-gray-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/30 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Block Reason</th>
                                    <th className="px-6 py-5 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {(() => {
                                    let currentData = [];
                                    if (activeTab === 'Users') currentData = blockedUsers;
                                    else if (activeTab === 'Families') currentData = blockedFamilies;
                                    
                                    return (
                                        <>
                                            {currentData.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group">
                                                    <td className="px-6 py-5 text-sm font-semibold text-[#B28E86] dark:text-orange-900/60 uppercase transition-colors">{item.id}</td>
                                                    <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">{item.username}</td>
                                                    <td className="px-6 py-5 text-xs font-semibold text-[#B28E86] dark:text-orange-900/60 leading-relaxed transition-colors">{item.reason}</td>
                                                    <td className="px-6 py-5 text-sm font-bold text-brand-orange text-right uppercase tracking-tight transition-all">
                                                        {activeTab === 'Users' ? (
                                                            <span className="text-gray-400 cursor-not-allowed">Purged (Irreversible)</span>
                                                        ) : (
                                                            <button onClick={() => handleUnblock(item.id, activeTab)} className="hover:underline cursor-pointer">Unblock</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {currentData.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No blocked items in this category</td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Safety;