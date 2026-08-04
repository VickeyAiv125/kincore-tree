import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, UserX, CornerUpRight, Clock, User, Eye, Box, Download, AlertCircle, X } from 'lucide-react';

const AbuseWorkflow = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);
    const [modalType, setModalType] = useState(null); // 'evidence' | 'timeline'

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const response = await fetch(`${baseUrl}/admin/safety/reports`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch abuse reports');
                const data = await response.json();
                
                const reportArray = Array.isArray(data) ? data : (data.reports || data.data || []);
                
                const formatted = reportArray.map(r => {
                    const slaHours = r.sla_status === 'overdue' ? -1 : parseInt(r.sla_status) || 2;
                    let slaStatus = 'on-track';
                    if (r.status === 'closed') slaStatus = 'completed';
                    else if (slaHours < 0) slaStatus = 'breached';
                    else if (slaHours <= 1) slaStatus = 'warning';

                    const formatDate = (dateStr) => {
                        if (!dateStr) return 'N/A';
                        const d = new Date(dateStr);
                        return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    };

                    return {
                        id: r.id ? r.id.substring(0,8).toUpperCase() : 'UNKNOWN',
                        rawId: r.id,
                        user: r.reporter ? `${r.reporter.first_name} ${r.reporter.last_name}` : r.reporter_id ? `User_${r.reporter_id.substring(0,4)}` : 'Unknown',
                        space: r.target_type ? r.target_type.toUpperCase() : 'SYSTEM',
                        report: r.reason || 'General Report',
                        status: r.status === 'closed' || r.status === 'resolved' ? 'Resolved' : r.status === 'in_progress' ? 'Investigating' : 'Critical',
                        urgency: r.priority_level === 'L1' ? 'High' : 'Medium',
                        sla: r.status === 'closed' || r.status === 'resolved' ? 'Resolved' : r.sla_status || '2h remaining',
                        slaStatus,
                        assigned: r.assigned_to ? `Mod_${r.assigned_to.substring(0,4)}` : 'Unassigned',
                        time: formatDate(r.created_at),
                        updatedTime: r.updated_at ? formatDate(r.updated_at) : 'Pending update',
                        resolution: r.details || 'N/A',
                        resolver: r.resolver ? `${r.resolver.first_name} ${r.resolver.last_name}` : null
                    };
                });
                setCases(formatted);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const exportJSON = () => {
        if (!cases.length) return alert('No cases available to export.');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cases, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `abuse_workflow_export_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const criticalCount = cases.filter(c => c.status === 'Critical' || c.status === 'Investigating').length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Trust & Safety</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Governance</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Abuse Workflow</h1>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl flex items-center space-x-2">
                    <AlertTriangle size={14} className="text-brand-orange" />
                    <span className="text-[10px] font-black uppercase text-brand-orange shadow-[0_0_10px_rgba(255,109,77,0.2)]">{criticalCount} Critical Open Cases</span>
                </div>
            </header>

            {loading && (
                <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">
                    Loading abuse reports...
                </div>
            )}

            {error && (
                <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-500 font-bold">
                    <p className="uppercase tracking-widest text-xs mb-2">Failed to load data</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-6">
                    {cases.length === 0 ? (
                        <div className="bg-white dark:bg-brand-darkCard p-12 rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                            <ShieldCheck size={48} className="text-green-500 mb-2 opacity-50" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">All Clear</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest max-w-md mx-auto">There are currently no abuse reports requiring your attention. The platform is secure.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cases.map((c) => (
                                <div key={c.id} className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm flex flex-col group hover:border-brand-orange/20 transition-all relative overflow-hidden">
                                    {/* SLA Indicator Line */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${c.slaStatus === 'breached' ? 'bg-red-500' :
                                        c.slaStatus === 'warning' ? 'bg-orange-500' :
                                            c.slaStatus === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                        }`} />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.id}</span>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase">{c.time}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${c.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                            c.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-[9px] font-black text-brand-orange uppercase tracking-widest mb-1">{c.space}</p>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-1">{c.user}</h4>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{c.report}</p>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-brand-darkBg rounded-xl">
                                            <div className="flex items-center space-x-2">
                                                <Clock size={12} className={c.slaStatus === 'breached' ? 'text-red-500' : 'text-gray-400'} />
                                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">SLA Health</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase ${c.slaStatus === 'breached' ? 'text-red-500' : 'text-gray-600 dark:text-brand-darkText'}`}>
                                                {c.sla}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-brand-darkBg rounded-xl">
                                            <div className="flex items-center space-x-2">
                                                <User size={12} className="text-gray-400" />
                                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Assignee</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-gray-600 dark:text-brand-darkText">
                                                {c.assigned}
                                            </span>
                                        </div>
                                        {c.status === 'Resolved' && (
                                            <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20 text-left">
                                                <div className="flex items-center space-x-2">
                                                    <ShieldCheck size={12} className="text-green-500" />
                                                    <span className="text-[10px] font-extrabold text-green-600 uppercase tracking-widest">Outcome</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-green-600">
                                                    {c.resolution}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => { setSelectedCase(c); setModalType('evidence'); }} className="py-4 bg-white dark:bg-brand-darkCard border-2 border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[9px] font-black uppercase text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all flex items-center justify-center space-x-2">
                                            <Eye size={14} />
                                            <span>Evidence</span>
                                        </button>
                                        <button onClick={() => { setSelectedCase(c); setModalType('timeline'); }} className="py-4 bg-white dark:bg-brand-darkCard border-2 border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[9px] font-black uppercase text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all flex items-center justify-center space-x-2">
                                            <CornerUpRight size={14} />
                                            <span>Timeline</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Export Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="bg-gray-50/50 dark:bg-brand-darkBg/30 p-8 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-brand-darkBorder flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm text-gray-400">
                                <Box size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Case Archive Explorer</h4>
                            </div>
                            <button onClick={exportJSON} className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-brand-orange transition-all shadow-sm">
                                <Download size={14} />
                                <span>Export Archive</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Evidence / Timeline */}
            {selectedCase && modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-brand-darkCard w-full max-w-xl rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-brand-darkBorder relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setSelectedCase(null); setModalType(null); }}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-6">
                            {modalType === 'evidence' ? 'Case Evidence File' : 'Case Timeline'} - {selectedCase.id}
                        </h3>

                        {modalType === 'evidence' ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Identity</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{selectedCase.user} @ {selectedCase.space}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reported Violation</p>
                                    <p className="text-sm font-bold text-red-500">{selectedCase.report}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resolution / Notes</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText">{selectedCase.resolution}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Raw Database Payload</p>
                                    <pre className="text-[10px] font-mono text-gray-500 overflow-x-auto">
                                        {JSON.stringify(selectedCase, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-brand-darkBorder before:to-transparent">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-brand-darkCard bg-brand-orange shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                        <time className="text-[10px] font-bold text-gray-400 uppercase">{selectedCase.time}</time>
                                        <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText mt-1">Reported by {selectedCase.user}</p>
                                    </div>
                                </div>
                                {selectedCase.status !== 'Critical' && selectedCase.status !== 'Pending' && selectedCase.status !== 'Open' && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-brand-darkCard bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                            <time className="text-[10px] font-bold text-gray-400 uppercase">{selectedCase.updatedTime}</time>
                                            <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText mt-1">Under Investigation / Review</p>
                                        </div>
                                    </div>
                                )}
                                {selectedCase.status === 'Resolved' && (
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-brand-darkCard bg-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 dark:bg-brand-darkBg p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                            <time className="text-[10px] font-bold text-gray-400 uppercase">{selectedCase.updatedTime}</time>
                                            <p className="text-sm font-bold text-green-500 mt-1">Resolved {selectedCase.resolver ? `by ${selectedCase.resolver}` : ''}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={() => { setSelectedCase(null); setModalType(null); }}
                                className="px-6 py-3 bg-gray-100 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                            >
                                Close Modal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AbuseWorkflow;
