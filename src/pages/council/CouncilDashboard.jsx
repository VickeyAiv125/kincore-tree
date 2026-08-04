import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCouncil } from '../../context/CouncilContext';
import {
    Users,
    GitBranch,
    ClipboardCheck,
    Activity,
    Plus,
    Calendar,
    ArrowRight,
    RefreshCw,
    UserPlus,
    LayoutGrid,
    Clock,
    Shield,
    Gavel,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    FileText,
    ArrowLeft,
    Check,
    X,
    Filter,
    Download,
    FileJson,
    FileSpreadsheet
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, link, isAlert }) => (
    <Link
        to={link}
        className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between min-h-[180px] transition-all hover:shadow-md hover:-translate-y-1 group relative overflow-hidden"
    >
        {isAlert && (
            <div className="absolute top-6 right-6 flex items-center space-x-2">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
        )}
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
            <Icon className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-gray-900 dark:text-brand-darkText">{value}</p>
        </div>
    </Link>
);

const QuickAction = ({ label, icon: Icon, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-3 rounded-[1.25rem] shadow-sm hover:shadow-md transition-all active:scale-95 group w-full min-w-0"
    >
        <div className={`w-9 h-9 shrink-0 ${color} rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
            <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-black text-gray-800 dark:text-brand-darkText uppercase tracking-tighter truncate">{label}</span>
    </button>
);

const CouncilDashboard = () => {
    const navigate = useNavigate();
    const { assignedFamilies, selectedFamilyId, selectedFamily, setSelectedFamilyId, reloadFamilies } = useCouncil();

    const [activeTab, setActiveTab] = useState('overview'); // overview, governance, disputes, audit
    const [stats, setStats] = useState({ total_members: 0, active_branches: 0, pending_approvals: 0 });
    const [activities, setActivities] = useState([]);
    const [cases, setCases] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);

    // Pagination for Audit Logs
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotalPages, setAuditTotalPages] = useState(1);

    // Dispute Rationale State
    const [resolvingDisputeId, setResolvingDisputeId] = useState(null);
    const [disputeRationale, setDisputeRationale] = useState('');

    // Case creation modal / form state
    const [showCreateCase, setShowCreateCase] = useState(false);
    const [newCaseTitle, setNewCaseTitle] = useState('');
    const [newCaseDesc, setNewCaseDesc] = useState('');
    const [newCaseThreshold, setNewCaseThreshold] = useState(50);

    // Fetch General Stats
    const fetchDashboardStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const url = selectedFamilyId 
                ? `${baseUrl}/admin/council/dashboard?familySpaceId=${selectedFamilyId}` 
                : `${baseUrl}/admin/council/dashboard`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.stats) setStats(data.stats);
                if (data.recent_activity) setActivities(data.recent_activity);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoadingStats(false);
        }
    }, [selectedFamilyId]);

    // Fetch Governance Cases
    const fetchCases = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const url = selectedFamilyId 
                ? `${baseUrl}/admin/council/governance-cases?familySpaceId=${selectedFamilyId}` 
                : `${baseUrl}/admin/council/governance-cases`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCases(data.cases || []);
            }
        } catch (err) {
            console.error(err);
        }
    }, [selectedFamilyId]);

    // Fetch Disputes
    const fetchDisputes = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const url = selectedFamilyId 
                ? `${baseUrl}/admin/council/disputes?familySpaceId=${selectedFamilyId}` 
                : `${baseUrl}/admin/council/disputes`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDisputes(data.disputes || []);
            }
        } catch (err) {
            console.error(err);
        }
    }, [selectedFamilyId]);

    // Fetch Audit Logs
    const fetchAuditLogs = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const url = selectedFamilyId 
                ? `${baseUrl}/admin/council/audit-logs?familySpaceId=${selectedFamilyId}&page=${auditPage}&limit=5` 
                : `${baseUrl}/admin/council/audit-logs?page=${auditPage}&limit=5`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data.logs || []);
                setAuditTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        }
    }, [selectedFamilyId, auditPage]);

    useEffect(() => {
        reloadFamilies();
    }, [reloadFamilies]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    useEffect(() => {
        if (activeTab === 'governance') fetchCases();
        if (activeTab === 'disputes') fetchDisputes();
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab, selectedFamilyId, fetchCases, fetchDisputes, fetchAuditLogs, auditPage]);

    // Vote on Case
    const handleVote = async (caseId, voteType) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/governance-cases/${caseId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ vote: voteType })
            });
            if (res.ok) {
                fetchCases();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Create a new governance case
    const handleCreateCase = async (e) => {
        e.preventDefault();
        if (!selectedFamilyId) return alert('Please select a family space first');

        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/governance-cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    familySpaceId: selectedFamilyId,
                    title: newCaseTitle,
                    description: newCaseDesc,
                    threshold: newCaseThreshold
                })
            });
            if (res.ok) {
                setShowCreateCase(false);
                setNewCaseTitle('');
                setNewCaseDesc('');
                fetchCases();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Resolve Dispute
    const handleResolveDispute = async (disputeId) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/disputes/${disputeId}/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resolutionNotes: disputeRationale })
            });
            if (res.ok) {
                setResolvingDisputeId(null);
                setDisputeRationale('');
                fetchDisputes();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const exportJSON = () => {
        if (!auditLogs.length) return alert('No logs available to export.');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `council_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const exportCSV = () => {
        if (!auditLogs.length) return alert('No logs available to export.');
        const headers = ['Timestamp', 'Actor/User', 'IP Address', 'Action Type', 'Target Type', 'Target ID'];
        const csvRows = [
            headers.join(','),
            ...auditLogs.map(log => {
                const actorName = log.actor 
                    ? `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim() || log.actor.email
                    : 'System';
                const row = [
                    new Date(log.created_at).toLocaleString(),
                    actorName,
                    log.ip_address || '0.0.0.0',
                    log.action || 'Unknown Action',
                    log.target_type || 'N/A',
                    log.target_id || 'Global'
                ];
                return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
            })
        ];
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", csvContent);
        downloadAnchor.setAttribute("download", `council_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const exportPDF = async () => {
        if (!auditLogs.length) return alert('No logs available to export.');
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
                    title: 'Council Audit Logs Report',
                    content: `Audit Report containing ${auditLogs.length} log entries.\nDate: ${new Date().toLocaleString()}`
                ,
                        logs: auditLogs
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
        <div className="max-w-7xl mx-auto text-left py-6 px-4 sm:px-6 lg:px-8 pb-32">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText leading-none mb-4">Council Panel</h1>
                    <div className="flex items-center space-x-3">
                        {assignedFamilies.length > 0 ? (
                            <select
                                value={selectedFamilyId || ''}
                                onChange={(e) => setSelectedFamilyId(e.target.value)}
                                className="text-sm font-bold text-brand-orange bg-brand-orange/10 px-4 py-1.5 rounded-full uppercase tracking-widest outline-none cursor-pointer border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors"
                            >
                                <option value="">All Assigned Families ({assignedFamilies.length})</option>
                                {assignedFamilies.map((fam) => (
                                    <option key={fam.id} value={fam.id} className="text-gray-900 bg-white dark:bg-brand-darkCard">
                                        {fam.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-sm font-bold text-brand-orange bg-brand-orange/10 px-4 py-1.5 rounded-full uppercase tracking-widest">
                                {selectedFamily ? selectedFamily.name : 'All Assigned Families'}
                            </span>
                        )}
                        <button 
                            onClick={() => { fetchDashboardStats(); reloadFamilies(); }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-brand-darkCard rounded-full transition-colors group"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-400 group-active:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-3xl">
                    <QuickAction
                        label="Add Member"
                        icon={UserPlus}
                        onClick={() => navigate('/council/members/add')}
                        color="bg-blue-600"
                    />
                    <QuickAction
                        label="Create Event"
                        icon={Calendar}
                        onClick={() => navigate('/council/events/create')}
                        color="bg-emerald-600"
                    />
                    <QuickAction
                        label="Approve Claims"
                        icon={ClipboardCheck}
                        onClick={() => navigate('/council/approvals')}
                        color="bg-purple-500"
                    />
                    <QuickAction
                        label="Gov Rules"
                        icon={Gavel}
                        onClick={() => navigate('/council/governance')}
                        color="bg-[#6366F1]"
                    />
                </div>
            </header>

            {/* Quick Stats Grid */}
            <section className="mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard
                        label="Total Members"
                        value={stats.total_members}
                        icon={Users}
                        color="bg-blue-100/50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        link="/council/members"
                    />
                    <StatCard
                        label="Active Branches"
                        value={stats.active_branches}
                        icon={GitBranch}
                        color="bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        link="/council/branches"
                    />
                    <StatCard
                        label="Pending Approvals"
                        value={stats.pending_approvals}
                        icon={ClipboardCheck}
                        color="bg-orange-100/50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                        link="/council/approvals"
                        isAlert={stats.pending_approvals > 0}
                    />
                    <StatCard
                        label="Governed Spaces"
                        value={assignedFamilies.length}
                        icon={LayoutGrid}
                        color="bg-purple-100/50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                        link="/council/dashboard"
                    />
                </div>
            </section>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 dark:border-brand-darkBorder mb-8">
                {['overview', 'governance', 'disputes'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === tab 
                                ? 'border-brand-orange text-brand-orange' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-brand-darkText'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Governed Families List */}
                    <div className="lg:col-span-1 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-6 uppercase tracking-wider flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-brand-orange" />
                            <span>Governed Spaces</span>
                        </h3>
                        <div className="space-y-4">
                            {assignedFamilies.map(fam => (
                                <div key={fam.id} className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-extrabold text-sm text-gray-800 dark:text-brand-darkText">{fam.name}</h4>
                                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">Active</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{fam.description || 'No description provided.'}</p>
                                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        <span>Code: <span className="text-gray-600 dark:text-brand-darkText font-black">{fam.code}</span></span>
                                        <span>Since: {new Date(fam.assigned_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="lg:col-span-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-wider">Recent Actions</h3>
                            <button onClick={() => navigate('/audit-logs')} className="text-xs font-black text-brand-orange hover:underline uppercase">View Full Audit Log</button>
                        </div>
                        <div className="space-y-4">
                            {activities.slice(0, 5).map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-brand-darkBg rounded-xl transition-all">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-brand-orange" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-brand-darkText">
                                                {log.users ? `${log.users.first_name || ''} ${log.users.last_name || ''}`.trim() : 'System Admin'}
                                            </p>
                                            <p className="text-[11px] text-gray-400">{log.action}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-[10px] text-gray-400">
                                        <p className="font-bold uppercase">{new Date(log.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'governance' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-wider">Cross-Family Governance Cases</h3>
                            <p className="text-xs text-gray-400 font-bold mt-1">Track case statuses across their lifecycle stages</p>
                        </div>
                        <button 
                            onClick={() => setShowCreateCase(true)}
                            className="bg-brand-orange text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 hover:bg-orange-600 transition-all active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Propose Case</span>
                        </button>
                    </div>

                    {showCreateCase && (
                        <form onSubmit={handleCreateCase} className="bg-white dark:bg-brand-darkCard border border-brand-orange/30 rounded-3xl p-8 space-y-6">
                            <h4 className="font-black text-lg text-gray-900 dark:text-brand-darkText uppercase tracking-wider">New Governance Case Proposal</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Proposal Title</label>
                                    <input 
                                        type="text" 
                                        value={newCaseTitle} 
                                        onChange={(e) => setNewCaseTitle(e.target.value)}
                                        required 
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl p-4 text-xs font-black text-gray-800 dark:text-brand-darkText outline-none"
                                        placeholder="e.g. Expand Council Seats to Branch Leaders"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Majority Threshold (%)</label>
                                    <input 
                                        type="number" 
                                        value={newCaseThreshold} 
                                        onChange={(e) => setNewCaseThreshold(e.target.value)}
                                        required 
                                        min="51" 
                                        max="100"
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl p-4 text-xs font-black text-gray-800 dark:text-brand-darkText outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Description & Rationale</label>
                                <textarea 
                                    value={newCaseDesc} 
                                    onChange={(e) => setNewCaseDesc(e.target.value)}
                                    required 
                                    className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl p-4 text-xs font-bold text-gray-800 dark:text-brand-darkText outline-none min-h-[100px] resize-none"
                                    placeholder="Explain the background and desired outcome of this resolution..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowCreateCase(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                                <button type="submit" className="bg-brand-orange text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-all">Submit Proposal</button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {cases.map(item => (
                            <div key={item.id} className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        {/* Governance Lifecycle Tracking */}
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                                item.status === 'resolved' 
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                                    : item.status === 'voting' 
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {item.stage || item.status}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{new Date(item.ends_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-2">{item.title}</h4>
                                    <p className="text-xs text-gray-400 font-bold mb-6">{item.description}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                        <span>Current Votes: For: {item.votes_for} | Against: {item.votes_against}</span>
                                        <span>Passes at: {item.threshold}%</span>
                                    </div>
                                    {item.status === 'voting' && (
                                        <div className="flex items-center space-x-3 pt-2">
                                            <button 
                                                onClick={() => handleVote(item.id, 'for')}
                                                className="flex-1 bg-brand-orange text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <Check size={14} />
                                                <span>Vote For</span>
                                            </button>
                                            <button 
                                                onClick={() => handleVote(item.id, 'against')}
                                                className="flex-1 border border-gray-200 dark:border-brand-darkBorder text-gray-400 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-all flex items-center justify-center space-x-2"
                                            >
                                                <X size={14} />
                                                <span>Vote Against</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'disputes' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-wider px-2">Lineage Dispute Queue</h3>
                        <p className="text-xs text-gray-400 font-bold mt-1 px-2">Resolve conflicting lineage claims by comparing claimant justifications</p>
                    </div>

                    <div className="space-y-6">
                        {disputes.map(dispute => (
                            <div key={dispute.id} className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-800 dark:text-brand-darkText uppercase">Disputed Node: {dispute.person_name}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">Dispute ID: {dispute.id}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                        dispute.status === 'resolved' 
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                    }`}>
                                        {dispute.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Claimant 1 */}
                                    <div className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange text-[10px] font-black">1</div>
                                            <span className="text-xs font-black text-gray-800 dark:text-brand-darkText">{dispute.claimed_by_1.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">"{dispute.reason_1}"</p>
                                    </div>

                                    {/* Claimant 2 */}
                                    <div className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange text-[10px] font-black">2</div>
                                            <span className="text-xs font-black text-gray-800 dark:text-brand-darkText">{dispute.claimed_by_2.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">"{dispute.reason_2}"</p>
                                    </div>
                                </div>

                                {dispute.status === 'pending' ? (
                                    resolvingDisputeId === dispute.id ? (
                                        <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-brand-darkBorder/40">
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Resolution Decision & Rationale</label>
                                            <textarea 
                                                value={disputeRationale}
                                                onChange={(e) => setDisputeRationale(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl p-4 text-xs font-bold text-gray-800 dark:text-brand-darkText outline-none resize-none"
                                                placeholder="State the decision and evidence reviewed to resolve this lineage dispute..."
                                            />
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => setResolvingDisputeId(null)} className="px-5 py-2 text-xs font-black uppercase text-gray-400">Cancel</button>
                                                <button onClick={() => handleResolveDispute(dispute.id)} className="bg-brand-orange text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-all">Submit Resolution</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-brand-darkBorder/40">
                                            <button 
                                                onClick={() => setResolvingDisputeId(dispute.id)}
                                                className="bg-brand-orange text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-all"
                                            >
                                                Resolve Dispute
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <div className="pt-4 border-t border-gray-50 dark:border-brand-darkBorder/40 text-xs font-bold text-gray-400">
                                        <span className="uppercase text-[10px] font-black text-emerald-500">Resolution Decision: </span>
                                        {dispute.resolved_notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-wider">Audit Log Across Governed Spaces</h3>
                            <p className="text-xs text-gray-400 font-bold mt-1">Cross-family security audits with pagination</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9FAFB]/50 dark:bg-brand-darkBg/50 border-b border-gray-50 dark:border-brand-darkBorder">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Actor</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Action Type</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Target</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-all">
                                            <td className="px-10 py-6">
                                                <p className="text-xs font-black text-gray-800 dark:text-brand-darkText">{log.actor ? `${log.actor.first_name || ''} ${log.actor.last_name || ''}`.trim() || log.actor.email : 'System'}</p>
                                                <p className="text-[10px] text-gray-400">{log.ip_address}</p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-[9px] font-black bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">{log.target_type} ({log.target_id || 'Global'})</span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center px-4 pt-4 mb-8">
                        <button 
                            disabled={auditPage <= 1}
                            onClick={() => setAuditPage(prev => Math.max(1, prev - 1))}
                            className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder px-6 py-2.5 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-darkBg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous Page
                        </button>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Page {auditPage} of {auditTotalPages}
                        </span>
                        <button 
                            disabled={auditPage >= auditTotalPages}
                            onClick={() => setAuditPage(prev => Math.min(auditTotalPages, prev + 1))}
                            className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder px-6 py-2.5 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-darkBg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next Page
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-end mt-12 mb-8 px-2">
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
            )}
        </div>
    );
};

export default CouncilDashboard;
