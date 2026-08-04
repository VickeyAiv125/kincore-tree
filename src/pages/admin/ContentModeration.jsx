import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const ModerationRow = ({ report, onResolve }) => {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const getUrgencyStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-brand-urgency-high dark:bg-orange-500/20 text-brand-errorText dark:text-orange-400';
            case 'resolved': return 'bg-brand-urgency-low dark:bg-emerald-500/20 text-brand-successText dark:text-emerald-400';
            case 'dismissed': return 'bg-gray-100 dark:bg-brand-darkBg text-gray-500';
            default: return 'bg-gray-100 dark:bg-brand-darkBg text-gray-500';
        }
    };

    return (
        <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors group">
            <td className="py-6 pr-4 text-sm font-medium text-gray-800 dark:text-brand-darkText max-w-xs relative">
                <div className="flex flex-col gap-1">
                    <span className="truncate">{report.reason || 'No reason provided'}</span>
                    <button
                        onClick={() => setPreviewOpen(true)}
                        className="text-[10px] text-brand-orange hover:underline font-bold uppercase tracking-widest text-left"
                    >
                        View Details
                    </button>
                </div>
                {previewOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setPreviewOpen(false)}></div>
                        <div className="relative bg-white dark:bg-brand-darkCard rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Report Details</h4>
                            <div className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-2xl mb-6">
                                <p className="text-sm text-gray-700 dark:text-brand-darkText leading-relaxed italic">"{report.reason}"</p>
                                <p className="text-xs text-gray-400 mt-4">Target ID: {report.target_id}</p>
                                <p className="text-xs text-gray-400">Target Type: {report.target_type}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8">
                                <div>Reporter: <span className="text-gray-900 dark:text-white">{report.reporter?.first_name} {report.reporter?.last_name}</span></div>
                                <div>Status: <span className="text-brand-orange">{report.status}</span></div>
                            </div>
                            <button onClick={() => setPreviewOpen(false)} className="w-full py-4 bg-gray-900 dark:bg-brand-darkBorder text-white rounded-xl font-black text-xs uppercase tracking-widest">Close</button>
                        </div>
                    </div>
                )}
            </td>
            <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400">{report.reason}</td>
            <td className="py-6 px-4">
                <div className="text-xs font-bold text-gray-800 dark:text-brand-darkText">{report.reporter?.email || 'System'}</div>
                <div className="text-[9px] font-semibold text-gray-400 uppercase">Target: {report.target_type}</div>
            </td>
            <td className="py-6 px-4">
                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider block text-center w-24 ${getUrgencyStyles(report.status)}`}>
                    {report.status}
                </span>
            </td>
            <td className="py-6 pl-4 text-sm font-bold relative">
                {report.status === 'pending' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onResolve(report.id, 'warn_user')}
                            className="text-gray-900 dark:text-brand-darkText underline opacity-80 hover:opacity-100 transition-opacity"
                        >
                            Resolve
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-brand-orange hover:bg-brand-active transition-colors shrink-0"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                            {showActions && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl shadow-2xl z-50 p-2 overflow-hidden ring-1 ring-black/5">
                                    <button onClick={() => onResolve(report.id, 'remove_content')} className="w-full text-left px-4 py-3 text-xs hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-700 dark:text-brand-darkText font-bold">Remove Content</button>
                                    <button onClick={() => onResolve(report.id, 'warn_user')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400">Warn User</button>
                                    <button onClick={() => onResolve(report.id, 'suspend_account')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400">Suspend Account</button>
                                    <div className="h-px bg-gray-50 dark:bg-brand-darkBorder my-1"></div>
                                    <button onClick={() => onResolve(report.id, 'dismiss')} className="w-full text-left px-4 py-3 text-xs hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-brand-errorText font-bold">Dismiss Report</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
};

const ContentModeration = () => {
    const [activeTab, setActiveTab] = useState('queue');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchReports();
    }, [activeTab]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            if (!familyId || familyId === 'DEFAULT_FAMILY_ID' && !user?.family_id) {
                setError('No family space identified');
                setLoading(false);
                return;
            }

            const status = activeTab === 'queue' ? 'pending' : 'all';
            const response = await fetch(`${API_BASE}/family-admin/${familyId}/moderation?status=${status}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch reports');
            const data = await response.json();
            setReports(data.reports || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (reportId, action) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/moderation/${reportId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action, notes: 'Resolved by family admin' })
            });

            if (!response.ok) throw new Error('Failed to resolve report');
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Report Resolved',
                message: 'The content report has been updated and the action has been logged.'
            });
            fetchReports();
        } catch (err) {
            console.error('Error resolving report:', err);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Action Failed',
                message: err.message || 'Error resolving report'
            });
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest leading-none">Admin Control</h2>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText tracking-tighter">Content Moderation</h1>
                </div>
                <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400'}`}
                    >
                        Active Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8 transition-colors">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Reports...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500 font-bold">{error}</p>
                        <button onClick={fetchReports} className="mt-4 text-brand-orange font-bold underline">Retry</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                    <th className="pb-6 pr-4">Flagged Content</th>
                                    <th className="pb-6 px-4">Violation Type</th>
                                    <th className="pb-6 px-4">Involved Parties</th>
                                    <th className="pb-6 px-4 text-center w-24">Status</th>
                                    <th className="pb-6 pl-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder/30">
                                {reports.map((report) => (
                                    <ModerationRow key={report.id} report={report} onResolve={handleResolve} />
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No reports found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Feedback Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder animate-in zoom-in duration-300">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                            statusModal.type === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                        }`}>
                            {statusModal.type === 'success' ? (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText text-center mb-2 uppercase tracking-tight">
                            {statusModal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
                            {statusModal.message}
                        </p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                statusModal.type === 'success'
                                    ? 'bg-brand-orange text-white shadow-brand-orange/25 hover:bg-orange-600'
                                    : 'bg-gray-900 dark:bg-brand-darkBorder text-white hover:bg-black'
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentModeration;
