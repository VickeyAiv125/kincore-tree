import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Loader2 } from 'lucide-react';

const Badge = ({ variant, children }) => {
    const variants = {
        Enterprise: 'bg-[#FFE8E2] dark:bg-brand-orange/20 text-[#FF6D4D] dark:text-brand-orange',
        Premium: 'bg-[#FDF5E6] dark:bg-orange-950/20 text-[#A0522D] dark:text-orange-400/80',
        Standard: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400/80',
        Basic: 'bg-[#FFF9E5] dark:bg-yellow-950/20 text-[#DAA520] dark:text-yellow-400/80',
        Active: 'bg-[#EAFAEA] dark:bg-green-900/20 text-[#2E8B57] dark:text-green-400',
        Suspended: 'bg-[#FFE8E2] dark:bg-red-900/20 text-[#FF6D4D] dark:text-red-400',
        PAID: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        OVERDUE: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-colors ${variants[variant] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400'}`}>
            {children}
        </span>
    );
};

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-100 dark:bg-brand-darkBg rounded-full h-1.5 overflow-hidden transition-colors">
        <div
            className={`${progress > 70 ? 'bg-red-500' : progress > 30 ? 'bg-yellow-500' : 'bg-green-500'} h-full rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
        />
    </div>
);

const FamilySpaces = () => {
    const navigate = useNavigate();
    const [familySpaces, setFamilySpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionStatus, setActionStatus] = useState(null);

    const fetchSpaces = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/business/risk-assessment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            const data = result.map(s => ({
                id: s.id,
                name: s.name,
                tier: s.plan_type || 'Standard',
                owner: s.owner ? `${s.owner.first_name} ${s.owner.last_name}` : 'Unknown',
                members: s.member_count || 0,
                storage: s.storage_used || 0,
                status: s.status === 'active' ? 'Active' : 'Suspended',
                billingStatus: s.billing_status || 'PAID',
                riskScore: s.risk_score || 0,
                nextPayment: s.next_billing_at ? new Date(s.next_billing_at).toLocaleDateString() : 'N/A',
                membersList: s.members_list || []
            }));
            setFamilySpaces(data);
            setSelectedSpace(prev => {
                if (!prev) return data[0] || null;
                const updated = data.find(s => s.id === prev.id);
                return updated || prev;
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching family spaces:', err);
            setError('Failed to fetch family spaces.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSpaces();
    }, [fetchSpaces]);

    const [actionModal, setActionModal] = useState({ isOpen: false, type: null, message: '', isSuccess: false });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, reason: '' });

    const handleAction = async (type) => {
        if (!selectedSpace) return;
        
        if (type === 'suspending' || type === 'reinstating') {
            setConfirmModal({ isOpen: true, type, reason: selectedSpace.status === 'Suspended' ? 'Reinstated by admin' : 'Administrative review' });
            return;
        }

        if (type === 'exporting') {
            setActionStatus('exporting');
            try {
                const headers = ['ID', 'Name', 'Tier', 'Owner', 'Members', 'Storage', 'Status', 'Billing Status', 'Risk Score', 'Next Payment'];
                const rows = familySpaces.map(s => [
                    s.id, s.name, s.tier, s.owner, s.members, s.storage, s.status, s.billingStatus, s.riskScore, s.nextPayment
                ]);

                const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `Family_Spaces_Report_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error('Export failed:', err);
                setActionModal({ isOpen: true, type: 'error', message: 'Export failed' });
            }
            setTimeout(() => setActionStatus(null), 2000);
        }
    };

    const confirmAction = async () => {
        const type = confirmModal.type;
        const isSuspended = selectedSpace.status === 'Suspended';
        const actionUrl = isSuspended 
            ? `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/business/spaces/${selectedSpace.id}/reinstate` 
            : `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/business/spaces/${selectedSpace.id}/suspend`;
        
        setConfirmModal({ isOpen: false, type: null, reason: '' });
        setActionStatus(type);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: confirmModal.reason })
            });
            
            if (response.ok) {
                setActionModal({ isOpen: true, type: 'success', message: isSuspended ? 'Space reinstated successfully' : 'Space suspended successfully' });
                fetchSpaces();
            } else {
                setActionModal({ isOpen: true, type: 'error', message: isSuspended ? 'Reinstatement failed' : 'Suspension failed' });
            }
        } catch (err) {
            console.error('Action failed:', err);
            setActionModal({ isOpen: true, type: 'error', message: isSuspended ? 'Reinstatement failed' : 'Suspension failed' });
        }
        
        setTimeout(() => setActionStatus(null), 2000);
    };

    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 sm:px-0">
            {/* Main Content Area - Scrollable Table */}
            <div className="flex flex-col bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors text-left min-h-[500px]">
                <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">Family Space Console</h1>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest leading-relaxed">Manage global family spaces, risk profiles, and subscription health.</p>
                    </div>
                    <button
                        onClick={() => navigate('/business/family-spaces/new')}
                        className="flex items-center space-x-2 bg-[#FF6D4D] text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-brand-orange/20 hover:bg-[#FF5D3D] transition-all active:scale-95 leading-none uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Launch New Space</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-8 pb-0">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="Search Family Spaces by name, head, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-[1.5rem] text-sm font-bold focus:ring-8 focus:ring-brand-orange/5 dark:text-brand-darkText placeholder-gray-400 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="p-8 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border-b border-gray-50 dark:border-brand-darkBorder">
                                <th className="px-6 py-6">Family Space Name</th>
                                <th className="px-6 py-6 text-center">Plan Status</th>
                                <th className="px-6 py-6 text-center">Financials</th>
                                <th className="px-6 py-6 w-52">Risk Integrity</th>
                                <th className="px-6 py-6 text-center">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder relative min-h-[400px]">
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-brand-darkCard/50 flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-brand-orange" size={48} />
                                </div>
                            )}
                            {familySpaces.filter(space =>
                                space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                space.owner.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((space, idx) => (
                                <tr
                                    key={idx}
                                    className={`group hover:bg-orange-50/20 dark:hover:bg-brand-orange/5 cursor-pointer transition-all ${selectedSpace?.id === space.id ? 'bg-orange-50/30 dark:bg-brand-orange/10' : ''}`}
                                    onClick={() => setSelectedSpace(space)}
                                >
                                    <td className="px-6 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-gray-900 dark:text-brand-darkText group-hover:text-brand-orange transition-colors tracking-tight">{space.name}</span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest opacity-60">Master Owner:</span>
                                                <span className="text-[9px] text-gray-900 dark:text-brand-darkText font-black uppercase tracking-widest">{space.owner}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <Badge variant={space.tier}>{space.tier}</Badge>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <Badge variant={space.billingStatus}>{space.billingStatus}</Badge>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex flex-col space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${space.riskScore > 70 ? 'bg-red-500 text-white' : space.riskScore > 30 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                                                    {space.riskScore}% {space.riskScore > 70 ? 'CRITICAL' : space.riskScore > 30 ? 'ELEVATED' : 'STABLE'}
                                                </span>
                                            </div>
                                            <ProgressBar progress={space.riskScore} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <Badge variant={space.status}>{space.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Side Console Detail View - Full Width Stacked */}
            <div className="w-full flex flex-col bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-xl transition-colors overflow-hidden text-left mb-20">
                <div className="p-8 border-b border-gray-50 dark:border-brand-darkBorder">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-brand-darkText">Space Console</h3>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1">Admin Controls</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 pb-32">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Space Name</label>
                            <input type="text" value={selectedSpace?.name || ''} readOnly className="w-full px-5 py-3 bg-gray-50/50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-semibold text-gray-900 dark:text-brand-darkText focus:outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plan Tier</label>
                                <input type="text" value={selectedSpace?.tier || ''} readOnly className="w-full px-5 py-3 bg-gray-50/50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[10px] font-bold text-brand-orange uppercase focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</label>
                                <input type="text" value={selectedSpace?.members || 0} readOnly className="w-full px-5 py-3 bg-gray-50/50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-semibold text-gray-900 dark:text-brand-darkText focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder space-y-5">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-brand-darkText uppercase tracking-wider">Billing Overview</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Status</span>
                                <Badge variant={selectedSpace?.billingStatus || 'PAID'}>{selectedSpace?.billingStatus || 'PAID'}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Next Payment</span>
                                <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300">{selectedSpace?.nextPayment || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-brand-darkText uppercase tracking-wider">Members Directory</h4>
                        {selectedSpace?.membersList && selectedSpace.membersList.length > 0 ? (
                            <div className="bg-gray-50/50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-brand-darkBorder max-h-60 overflow-y-auto custom-scrollbar">
                                {selectedSpace.membersList.map((m, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between text-xs transition-colors hover:bg-gray-100/50 dark:hover:bg-brand-darkBorder/30">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-bold text-gray-800 dark:text-brand-darkText">
                                                {m.first_name} {m.last_name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold lowercase">
                                                {m.email}
                                            </span>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            m.role === 'owner' 
                                                ? 'bg-orange-100 dark:bg-brand-orange/10 text-brand-orange' 
                                                : m.role === 'admin'
                                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-500'
                                                : 'bg-gray-100 dark:bg-brand-darkBorder text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {m.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider pl-1">No members joined yet.</p>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-brand-darkText uppercase tracking-wider">Risk Assessment</h4>
                            <span className="text-xs font-bold text-brand-orange">{selectedSpace?.riskScore || 0}%</span>
                        </div>
                        <ProgressBar progress={selectedSpace?.riskScore || 0} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white dark:bg-brand-darkBg rounded-xl border border-gray-50 dark:border-brand-darkBorder">
                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Health</p>
                                <p className={`text-xs font-bold ${(selectedSpace?.riskScore || 0) > 30 ? 'text-red-500' : 'text-green-500'}`}>{(selectedSpace?.riskScore || 0) > 70 ? 'CRITICAL' : (selectedSpace?.riskScore || 0) > 30 ? 'WARNING' : 'HEALTHY'}</p>
                            </div>
                            <div className="p-3 bg-white dark:bg-brand-darkBg rounded-xl border border-gray-50 dark:border-brand-darkBorder">
                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Stability</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">STABLE</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => handleAction(selectedSpace?.status === 'Suspended' ? 'reinstating' : 'suspending')}
                            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
                                actionStatus === 'suspending' || actionStatus === 'reinstating'
                                    ? (selectedSpace?.status === 'Suspended' ? 'bg-green-500 text-white animate-pulse' : 'bg-red-500 text-white animate-pulse')
                                    : (selectedSpace?.status === 'Suspended'
                                        ? 'bg-[#EAFAEA] dark:bg-green-900/20 text-[#2E8B57] dark:text-green-400 hover:bg-[#DAFAD2] dark:hover:bg-green-900/40'
                                        : 'bg-[#FFE8E2] dark:bg-red-900/20 text-[#FF6D4D] dark:text-red-400 hover:bg-[#FFD8D2] dark:hover:bg-red-900/40')
                            }`}
                        >
                            {actionStatus === 'suspending' 
                                ? 'Suspending...' 
                                : actionStatus === 'reinstating' 
                                ? 'Reinstating...' 
                                : selectedSpace?.status === 'Suspended' 
                                ? 'Reinstate Space' 
                                : 'Suspend Space'}
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAction('exporting')}
                                className={`flex items-center justify-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${actionStatus === 'exporting' ? 'bg-orange-500 text-white animate-bounce' : 'bg-gray-50 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500 hover:text-brand-orange'}`}
                            >
                                <Download size={14} className="mr-2" />
                                {actionStatus === 'exporting' ? 'Exporting...' : 'Export'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase mb-2">
                            {confirmModal.type === 'suspending' ? 'Suspend Space' : 'Reinstate Space'}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 mb-6">
                            Are you sure you want to {confirmModal.type === 'suspending' ? 'suspend' : 'reinstate'} <strong className="text-brand-orange">{selectedSpace?.name}</strong>?
                        </p>
                        
                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</label>
                            <input 
                                type="text" 
                                value={confirmModal.reason} 
                                onChange={(e) => setConfirmModal({...confirmModal, reason: e.target.value})}
                                className="w-full px-5 py-3 bg-gray-50/50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-semibold text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all" 
                            />
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setConfirmModal({ isOpen: false, type: null, reason: '' })}
                                className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-100 dark:bg-brand-darkBorder text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmAction}
                                className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 ${
                                    confirmModal.type === 'suspending' 
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                                        : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success/Error Modal */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${actionModal.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                            {actionModal.type === 'success' ? (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase mb-2">
                            {actionModal.type === 'success' ? 'Success' : 'Error'}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mb-8">{actionModal.message}</p>
                        <button 
                            onClick={() => setActionModal({ isOpen: false, type: null, message: '' })}
                            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-100 dark:bg-brand-darkBorder text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilySpaces;