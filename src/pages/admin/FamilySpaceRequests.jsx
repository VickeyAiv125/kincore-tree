import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    ShieldAlert, 
    User,
    Mail,
    RefreshCw
} from 'lucide-react';


const FamilySpaceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/business/spaces/requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            } else {
                console.error('Failed to fetch requests');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/business/spaces/requests/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                setRequests(requests.map(req => {
                    if (req.id === id) {
                        return { 
                            ...req, 
                            status: action === 'approve' ? 'active' : 'rejected',
                            settings: { ...req.settings, approval_status: action === 'approve' ? 'approved' : 'rejected' }
                        };
                    }
                    return req;
                }));
            } else {
                alert('Action failed. Please try again.');
            }
        } catch (error) {
            console.error('Error resolving request:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Family Space Onboarding Requests</h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Review and manage pending family space creations</p>
                </div>
                <button 
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder text-gray-700 dark:text-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-all"
                >
                    <RefreshCw size={14} />
                    Refresh List
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-brand-darkBg rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Clock className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">No Pending Requests</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Family requests will be shown here if Manual Approval Mode is enabled from config.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{req.name}</h3>
                                    {req.status === 'pending' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-800 uppercase tracking-widest">
                                            Pending Review
                                        </span>
                                    )}
                                    {req.status === 'rejected' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 uppercase tracking-widest">
                                            Rejected
                                        </span>
                                    )}
                                    {req.status === 'active' && req.settings?.approval_status === 'approved' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800 uppercase tracking-widest">
                                            Approved
                                        </span>
                                    )}
                                </div>
                                {req.cover_image ? (
                                    <img src={req.cover_image} alt={req.name} className="w-12 h-12 rounded-xl object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center">
                                        <ShieldAlert size={24} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 min-h-[40px]">
                                {req.description || 'No description provided.'}
                            </p>

                            <div className="bg-gray-50 dark:bg-brand-darkBg rounded-xl p-4 mb-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Requested By</h4>
                                <div className="flex items-center gap-3 mb-2">
                                    <User size={14} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {req.owner?.first_name} {req.owner?.last_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {req.owner?.email}
                                    </span>
                                </div>
                            </div>

                            {req.status === 'pending' && (
                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        disabled={actionLoading === req.id}
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === req.id ? 'Processing...' : (
                                            <>
                                                <XCircle size={14} />
                                                Reject
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        disabled={actionLoading === req.id}
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-brand-orange text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === req.id ? 'Processing...' : (
                                            <>
                                                <CheckCircle size={14} />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FamilySpaceRequests;
