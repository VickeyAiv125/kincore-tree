import React, { useState, useEffect, useCallback } from 'react';
import { useCouncil } from '../../context/CouncilContext';
import {
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Clock,
    User,
    AlertTriangle,
    GitBranch,
    Search,
    FileText,
    ExternalLink,
    Image,
    ChevronDown,
    Filter,
    ArrowRight
} from 'lucide-react';

const StatusBadge = ({ children, color }) => {
    const colors = {
        'purple': 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
        'orange': 'bg-orange-100 dark:bg-brand-orange/20 text-orange-600 dark:text-brand-orange',
        'green': 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400',
        'red': 'bg-red-100/50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${colors[color] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'}`}>
            {children}
        </span>
    );
};

const ApprovalItem = ({ id, name, type, branch, date, requestedBy, description, status, before, after, onAction }) => {
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleActionSubmit = (actionType) => {
        onAction(id, type, actionType, actionType === 'rejected' ? rejectReason : '');
        setShowRejectReason(false);
        setRejectReason('');
    };

    return (
        <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] overflow-hidden shadow-sm transition-all hover:shadow-md mb-8 group">
            <div className="p-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-brand-orange ring-1 ring-gray-100 dark:ring-brand-darkBorder transition-transform group-hover:scale-105">
                            <Clock size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h4 className="text-xl font-black text-gray-800 dark:text-brand-darkText tracking-tight">{name}</h4>
                                <StatusBadge color={type === 'Lineage Claim' ? 'orange' : type === 'Sensitive Setting' ? 'purple' : 'green'}>{type}</StatusBadge>
                                <div className="flex items-center space-x-1.5 bg-gray-100/50 dark:bg-brand-darkBg px-3 py-1 rounded-lg">
                                    <GitBranch size={12} className="text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{branch || 'Main Space'}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                        <User size={12} />
                                    </div>
                                    <span>Requested By: <span className="text-gray-600 dark:text-gray-300 font-extrabold">{requestedBy}</span></span>
                                </span>
                                <span className="flex items-center gap-2"><Clock size={12} /> {new Date(date).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {status === 'pending' ? (
                            <>
                                <button
                                    onClick={() => setShowRejectReason(!showRejectReason)}
                                    className="bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={() => handleActionSubmit('approved')}
                                    className="bg-brand-orange text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Approve Request
                                </button>
                            </>
                        ) : (
                            <div className={`px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border ${status === 'approved' ? 'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50/50 dark:bg-red-500/10 text-red-500 border-red-100 dark:border-red-500/20'}`}>
                                {status}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder hidden md:flex items-center justify-center z-10">
                        <ArrowRight size={14} className="text-gray-300" />
                    </div>

                    <div className="p-8 rounded-[2rem] bg-gray-50/80 dark:bg-brand-darkBg/30 border border-gray-100 dark:border-brand-darkBorder/50 backdrop-blur-sm">
                        <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Present State
                        </h5>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder flex items-center justify-center text-gray-400">
                                <User size={18} />
                            </div>
                            <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400 line-through decoration-red-400/40 decoration-2">{before || 'Unclaimed / Default'}</span>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-brand-orange/5 dark:bg-brand-orange/10 border border-brand-orange/20 backdrop-blur-sm">
                        <h5 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></div> Requested Change
                        </h5>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange border border-brand-orange/20 shadow-sm">
                                <CheckCircle2 size={18} />
                            </div>
                            <span className="text-[15px] font-black text-gray-900 dark:text-brand-darkText tracking-tight">{after || description}</span>
                        </div>
                    </div>
                </div>

                {type === 'Lineage Claim' && (
                    <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Verification Evidence (2 Files)
                            </h5>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 p-3 bg-white dark:bg-brand-darkCard rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Image size={18} />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <p className="text-[11px] font-bold text-gray-700 dark:text-brand-darkText truncate">identity_verification.jpg</p>
                                    <p className="text-[9px] font-medium text-gray-400 uppercase">Image • 2.4 MB</p>
                                </div>
                            </div>
                            <div className="flex-1 p-3 bg-white dark:bg-brand-darkCard rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <FileText size={18} />
                                </div>
                                <div className="text-left overflow-hidden">
                                    <p className="text-[11px] font-bold text-gray-700 dark:text-brand-darkText truncate">legal_affidavit.pdf</p>
                                    <p className="text-[9px] font-medium text-gray-400 uppercase">PDF • 1.1 MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showRejectReason && (
                    <div className="mt-10 pt-10 border-t border-gray-100 dark:border-brand-darkBorder animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 mb-5 text-red-500">
                            <AlertTriangle size={20} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Rejection Rationale Required</span>
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-200 dark:border-brand-darkBorder rounded-2xl p-6 text-[13px] font-bold text-gray-700 dark:text-brand-darkText focus:ring-4 focus:ring-red-400/10 focus:border-red-400 outline-none min-h-[140px] resize-none placeholder:text-gray-400 transition-all shadow-inner"
                            placeholder="Provide a detailed explanation for this rejection to communicate back to the requestor..."
                        />
                        <div className="flex justify-end items-center gap-6 mt-6">
                            <button onClick={() => setShowRejectReason(false)} className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Dismiss</button>
                            <button 
                                onClick={() => handleActionSubmit('rejected')}
                                className="bg-red-500 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CouncilApprovals = () => {
    const { selectedFamilyId } = useCouncil();
    const [activeTab, setActiveTab] = useState('All');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const tabs = ['All', 'Tree Update', 'Lineage Claim', 'Sensitive Setting', 'Merge Request'];

    const fetchAllApprovals = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const claimsUrl = selectedFamilyId 
                ? `${baseUrl}/admin/council/lineage-claims?familySpaceId=${selectedFamilyId}` 
                : `${baseUrl}/admin/council/lineage-claims`;
            
            const settingsUrl = selectedFamilyId
                ? `${baseUrl}/admin/council/sensitive-changes?familySpaceId=${selectedFamilyId}`
                : `${baseUrl}/admin/council/sensitive-changes`;

            const mergeUrl = selectedFamilyId
                ? `${baseUrl}/admin/council/merge-requests?familySpaceId=${selectedFamilyId}`
                : `${baseUrl}/admin/council/merge-requests`;

            const treeUrl = selectedFamilyId
                ? `${baseUrl}/admin/family-admin/${selectedFamilyId}/branch-approvals?status=pending_council`
                : `${baseUrl}/admin/family-admin/all/branch-approvals?status=pending_council`; // Using family-admin endpoint which handles this queue

            const headers = { 'Authorization': `Bearer ${token}` };

            const [resClaims, resSettings, resMerges, resTree] = await Promise.all([
                fetch(claimsUrl, { headers }),
                fetch(settingsUrl, { headers }),
                fetch(mergeUrl, { headers }),
                fetch(treeUrl, { headers })
            ]);

            let loadedClaims = [];
            if (resClaims.ok) {
                const data = await resClaims.json();
                loadedClaims = (data.claims || []).map(item => ({
                    id: item.id,
                    name: item.person_name || 'Lineage Claim Request',
                    type: 'Lineage Claim',
                    branch: item.branch_name || 'Main Tree',
                    date: item.created_at,
                    requestedBy: item.requested_by || item.user_email || 'User',
                    description: `Lineage claim for person: ${item.person_name}`,
                    before: 'Unclaimed node',
                    after: `Link node to user: ${item.requested_by || item.user_email || 'User'}`,
                    status: item.status
                }));
            }

            let loadedSettings = [];
            if (resSettings.ok) {
                const data = await resSettings.json();
                loadedSettings = (data.changes || []).map(item => ({
                    id: item.id,
                    name: item.setting_key || item.change_type || 'Sensitive Configuration',
                    type: 'Sensitive Setting',
                    branch: 'Settings Management',
                    date: item.created_at,
                    requestedBy: item.requested_by_email || item.requested_by || 'Owner',
                    description: item.details || `Modify ${item.setting_key || 'setting'} key`,
                    before: item.old_value ? `Original value: ${item.old_value}` : 'Default Settings',
                    after: item.new_value ? `New value: ${item.new_value}` : (item.details || 'Requested Update'),
                    status: item.status
                }));
            }

            let loadedMerges = [];
            if (resMerges.ok) {
                const data = await resMerges.json();
                loadedMerges = (data.merges || []).map(item => ({
                    id: item.id,
                    name: `Merge: ${item.source_family_name} into ${item.target_family_name}`,
                    type: 'Merge Request',
                    branch: 'Cross-Family Governance',
                    date: item.created_at,
                    requestedBy: item.requested_by_email || 'Admin',
                    description: `Consolidate family nodes from ${item.source_family_name}`,
                    before: 'Two separate family spaces',
                    after: 'Unified target family space',
                    status: item.status
                }));
            }

            let loadedTree = [];
            if (resTree.ok) {
                const data = await resTree.json();
                loadedTree = (data || []).map(item => {
                    const formatActionType = (t) => {
                        const types = { 'add_parent': 'Add Parent', 'add_child': 'Add Child', 'add_family_member': 'Add Member', 'edit_member': 'Edit Details' };
                        return types[t] || t.replace('_', ' ');
                    };
                    return {
                        id: item.id,
                        name: `${item.proposed_value?.first_name || 'Unknown'} ${item.proposed_value?.last_name || ''}`,
                        type: 'Tree Update',
                        branch: item.branch?.name || 'Main Tree',
                        date: item.created_at,
                        requestedBy: item.user ? `${item.user.first_name} ${item.user.last_name}` : 'Unknown User',
                        description: `Requested to ${formatActionType(item.request_type)}`,
                        before: item.current_value ? 'Existing Node' : 'Not in tree',
                        after: formatActionType(item.request_type),
                        status: item.status
                    };
                });
            }

            setRequests([...loadedTree, ...loadedClaims, ...loadedSettings, ...loadedMerges]);
        } catch (err) {
            console.error('Error fetching approvals queue:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedFamilyId]);

    useEffect(() => {
        fetchAllApprovals();
    }, [fetchAllApprovals]);

    const handleAction = async (id, type, status, rejectionReason) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            let endpoint = '';
            let bodyData = { status, rejectionReason };

            if (type === 'Tree Update') {
                endpoint = `${baseUrl}/admin/family-admin/${selectedFamilyId}/branch-approvals/${id}`;
                bodyData = { action: status, reviewer_comment: rejectionReason }; // Maps to the branch-approval format
            } else if (type === 'Lineage Claim') {
                endpoint = `${baseUrl}/admin/council/lineage-claims/${id}/action`;
            } else if (type === 'Sensitive Setting') {
                endpoint = `${baseUrl}/admin/council/sensitive-changes/${id}/action`;
            } else {
                endpoint = `${baseUrl}/admin/council/merge-requests/${id}/resolve`;
            }

            const res = await fetch(endpoint, {
                method: type === 'Tree Update' ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                fetchAllApprovals();
            } else {
                alert('Action execution failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredRequests = requests.filter(r => {
        if (activeTab === 'All') return true;
        return r.type === activeTab;
    });

    return (
        <div className="max-w-7xl mx-auto text-left py-6 px-4 sm:px-6 lg:px-8 pb-32">
            <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText leading-none mb-4 tracking-tight transition-colors">Council Approvals</h1>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-brand-orange bg-brand-orange/10 px-4 py-1.5 rounded-full uppercase tracking-widest">
                            Management Queue
                        </span>
                        <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            <Clock size={14} className="text-brand-orange" />
                            <span>Awaiting Global Decision</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Find specific request..."
                            className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder py-3 px-10 rounded-xl text-xs font-bold text-gray-800 dark:text-brand-darkText outline-none focus:ring-2 focus:ring-brand-orange/10 transition-all w-[240px] shadow-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                    </div>
                    <button className="p-3 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Elite Navigation Tabs */}
            <div className="relative mb-14">
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-brand-darkCard/30 p-2 rounded-[1.5rem] border border-gray-100 dark:border-brand-darkBorder/50 w-fit backdrop-blur-md shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-brand-darkText'}`}
                        >
                            {activeTab === tab && (
                                <div className="absolute inset-0 bg-brand-orange rounded-2xl shadow-lg shadow-brand-orange/30 animate-in fade-in zoom-in-95 duration-200" />
                            )}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {filteredRequests.map((request, idx) => (
                    <ApprovalItem key={idx} {...request} onAction={handleAction} />
                ))}
                {filteredRequests.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400 font-bold">
                        No pending requests in this category
                    </div>
                )}
            </div>

            <div className="mt-12 flex items-center justify-center">
                <button onClick={fetchAllApprovals} className="text-xs font-black text-gray-400 hover:text-brand-orange uppercase tracking-[0.2em] flex items-center space-x-3 group transition-colors">
                    <span>Reload Records</span>
                    <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default CouncilApprovals;
