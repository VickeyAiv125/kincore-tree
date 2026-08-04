import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Search, AlertCircle } from 'lucide-react';


const MemberRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [familySpaceId] = useState(localStorage.getItem('family_space_id') || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!familySpaceId) {
            setLoading(false);
            return;
        }
        fetchRequests();
    }, [familySpaceId]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/family-admin/${familySpaceId}/branch-approvals?status=pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch requests');
            const data = await res.json();
            // branch-approvals table acts as the Member Requests queue in Admin Controlled mode
            setRequests(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/family-admin/${familySpaceId}/branch-approvals/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, reviewer_comment: `Family Admin ${action} the request.` })
            });
            if (!res.ok) throw new Error('Failed to resolve request');
            setRequests(prev => prev.filter(req => req.id !== id));
            // Trigger a success toast here ideally
        } catch (err) {
            alert('Failed to resolve request: ' + err.message);
        }
    };

    const formatActionType = (type) => {
        const types = {
            'add_parent': 'Add Parent',
            'add_child': 'Add Child',
            'add_family_member': 'Add Member',
            'edit_member': 'Edit Details'
        };
        return types[type] || type.replace('_', ' ');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tighter">Member Requests</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Review pending edits and additions</p>
            </header>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-3">
                    <AlertCircle size={20} />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            {!loading && requests.length === 0 ? (
                <div className="bg-white dark:bg-brand-darkCard p-12 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder text-center">
                    <Shield size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight mb-2">No Pending Requests</h2>
                    <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
                        You will get requests here when the Business Admin changes the governance mode to "Admin Controlled".
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white dark:bg-brand-darkCard p-6 rounded-3xl border border-gray-100 dark:border-brand-darkBorder flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {formatActionType(req.request_type)}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 flex items-center">
                                        <Clock size={12} className="mr-1" /> {new Date(req.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText">
                                    {req.proposed_value?.first_name} {req.proposed_value?.last_name}
                                </h3>
                                <p className="text-sm font-bold text-gray-500 mt-1">
                                    Requested by: <span className="text-gray-900 dark:text-gray-300">{req.user?.first_name} {req.user?.last_name}</span>
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleResolve(req.id, 'rejected')}
                                    className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                    title="Reject"
                                >
                                    <XCircle size={20} />
                                </button>
                                <button
                                    onClick={() => handleResolve(req.id, 'approved')}
                                    className="px-6 py-3 bg-gray-900 dark:bg-brand-orange text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-brand-orange/90 transition-colors flex items-center space-x-2"
                                >
                                    <CheckCircle size={18} />
                                    <span>Approve</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemberRequests;
