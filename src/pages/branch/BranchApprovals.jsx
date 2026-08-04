import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, ShieldAlert, Clock, User, MessageCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Notification from '../../components/common/Notification';

const Badge = ({ children, color }) => {
    const colors = {
        'purple': 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
        'orange': 'bg-orange-100 dark:bg-brand-orange/20 text-orange-600 dark:text-brand-orange',
        'green': 'bg-green-100/50 dark:bg-green-900/30 text-green-500 dark:text-green-400',
        'red': 'bg-red-100/50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
    };
    return (
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${colors[color] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'}`}>
            {children}
        </span>
    );
};

const ApprovalCard = ({ id, name, type, badgeColor, date, requestedBy, description, status, before, after, onAction }) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleAction = async (action) => {
        setProcessing(true);
        await onAction(id, action);
        setProcessing(false);
    };

    return (
        <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2.5rem] overflow-hidden shadow-sm transition-all hover:shadow-md mb-6 text-left">
            <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-brand-orange">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-xl font-black text-gray-900 dark:text-brand-darkText">{name}</h4>
                                <Badge color={badgeColor}>{type}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><User size={12} className="text-brand-orange" /> {requestedBy}</span>
                                <span className="flex items-center gap-1.5"><Clock size={12} /> {date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {status === 'pending' ? (
                            type === 'Claim' ? (
                                <>
                                    <button
                                        onClick={() => handleAction('rejected')}
                                        disabled={processing}
                                        className="bg-red-50 dark:bg-red-500/10 text-red-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction('approved')}
                                        disabled={processing}
                                        className="bg-brand-orange text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        Approve Change
                                    </button>
                                </>
                            ) : (
                                <div className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600">
                                    Pending Family Admin
                                </div>
                            )
                        ) : (
                            <div className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${status === 'approved' ? 'bg-green-50 dark:bg-green-500/10 text-green-500' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                                {status}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-gray-50/50 dark:bg-brand-darkBg/30 border border-gray-50 dark:border-brand-darkBorder/50">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Before</h5>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200" />
                            <span className="text-xs font-bold text-gray-500 line-through decoration-red-400/50">{before || 'No data'}</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-brand-orange/5 dark:bg-brand-orange/10 border border-brand-orange/10">
                        <h5 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] mb-4">After</h5>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                                <CheckCircle2 size={14} />
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">{after || description}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BranchApprovals = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const tabs = ['pending', 'approved', 'rejected'];
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: 'success' });

    const fetchApprovals = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            const branchId = user?.branch_id || '6b8eb992-571f-4637-b031-a56007560cad';
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

            const response = await fetch(`${baseUrl}/admin/branch/approvals/${branchId}?_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            const formatted = data.map(app => ({
                id: app.id,
                name: app.item_name || app.person?.full_name || 'Unknown Person',
                type: app.type || 'Claim',
                badgeColor: app.type === 'Edit' ? 'purple' : 'orange',
                requestedBy: app.requested_by || `${app.user?.first_name || ''} ${app.user?.last_name || ''}`.trim(),
                date: new Date(app.created_at).toLocaleDateString(),
                description: app.description || 'Profile Claim Request',
                before: app.before || 'Unclaimed Node',
                after: app.after || 'Claimed by ' + (app.user?.first_name || 'User'),
                status: app.status,
                source: app.source || 'claims'
            }));
            
            setApprovals(formatted);
            setLoading(false);
        } catch (err) {
            console.error('>>> [FETCH_APPROVALS_ERROR]', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (approvalId, action) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            
            const response = await fetch(`${baseUrl}/admin/branch/approvals/action/${approvalId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });

            if (!response.ok) throw new Error('Failed to take action');

            setNotification({ message: `Request ${action} successfully!`, type: 'success' });
            fetchApprovals();
        } catch (err) {
            console.error('>>> [APPROVAL_ACTION_ERROR]', err);
            setNotification({ message: 'Error taking action: ' + err.message, type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto text-left py-4 px-4 sm:px-0">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: 'success' })} 
            />

            <header className="mb-12">
                <h1 className="text-2xl sm:text-[32px] font-black text-gray-900 dark:text-brand-darkText leading-none mb-6 sm:mb-10 transition-colors">Branch approvals</h1>
                <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText transition-colors uppercase tracking-tight">Change Requests</h2>
            </header>

            <div className="relative mb-14 overflow-x-auto scrollbar-hide">
                <div className="flex items-center space-x-0 border-b border-gray-100 dark:border-brand-darkBorder min-w-max transition-colors">
                    {['All', ...tabs].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`flex-1 md:flex-none md:w-56 py-4.5 text-[15px] font-bold transition-all relative ${activeTab === tab.toLowerCase() ? 'text-white' : 'text-gray-900 dark:text-brand-darkText hover:text-brand-orange dark:hover:text-brand-orange'}`}
                        >
                            {activeTab === tab.toLowerCase() && (
                                <div className="absolute inset-x-0 top-0 bottom-1 bg-brand-orange rounded-xl -z-10 shadow-lg shadow-brand-orange/20" />
                            )}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 md:space-y-0">
                {approvals.filter(r => activeTab === 'all' || r.status === activeTab).map((request, idx) => (
                    <ApprovalCard key={idx} {...request} onAction={handleAction} />
                ))}
                {approvals.length === 0 && (
                    <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-gray-100 dark:border-brand-darkBorder rounded-[3rem]">
                        No approval requests found
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchApprovals;
