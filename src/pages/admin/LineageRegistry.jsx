import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const ClaimRow = ({ claim, onReview }) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors group">
        <td className="py-6 pr-4 text-sm font-medium text-gray-800 dark:text-brand-darkText group-hover:text-brand-orange transition-colors">
            {claim.requester_name || 'Anonymous'}
        </td>
        <td className="py-6 px-4 text-sm text-gray-800 dark:text-brand-darkText font-semibold transition-colors">
            {claim.person_name || 'Unnamed Node'}
        </td>
        <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors uppercase tracking-tight">
            {claim.branch_name || 'Main Tree'}
        </td>
        <td className="py-6 px-4 text-sm text-gray-400 dark:text-gray-500 font-bold transition-colors">
            {claim.generation || 'N/A'}
        </td>
        <td className="py-6 px-4 text-[10px] text-gray-500 dark:text-gray-400 transition-colors uppercase tracking-widest leading-relaxed">
            {claim.claim_type || 'Node Claim'}
        </td>
        <td className="py-6 px-4 text-sm text-gray-400 dark:text-gray-500 font-semibold transition-colors">
            {new Date(claim.created_at).toLocaleDateString()}
        </td>
        <td className="py-6 pl-4 text-sm font-bold">
            {claim.status === 'pending' ? (
                <button 
                    onClick={() => onReview(claim)}
                    className="text-brand-orange hover:text-orange-600 underline transition-colors uppercase tracking-tighter"
                >
                    Review
                </button>
            ) : (
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest ${
                        claim.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
                    }`}>
                        {claim.status}
                    </span>
                    <button 
                        onClick={() => onReview(claim)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-brand-darkText underline transition-colors uppercase tracking-tighter"
                    >
                        View
                    </button>
                </div>
            )}
        </td>
    </tr>
);

const LineageRegistry = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
            const token = localStorage.getItem('token');

            if (!familyId || familyId === 'undefined') {
                setError('No family space identified');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/claims?status=all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch claims');
            const data = await response.json();
            const mapped = (data.claims || []).map(c => ({
                ...c,
                requester_name: c.user ? `${c.user.first_name || ''} ${c.user.last_name || ''}`.trim() : 'Anonymous',
                person_name: c.person?.full_name || 'Unnamed Person',
                branch_name: c.person?.branch?.name || 'Main Tree',
                claim_type: c.type ? (c.type.toUpperCase() === 'CLAIM' ? 'Node Claim' : 'Profile Edit') : 'Node Claim',
                requester_id: c.user_id,
                generation: c.person?.generation || 'N/A'
            }));
            setClaims(mapped);
        } catch (err) {
            console.error('Error fetching claims:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (claimId, status) => {
        try {
            setResolving(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'd8eefc0a-6497-4bf5-8077-f2b35a3ed5cd';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/claims/${claimId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, action: status })
            });

            if (!response.ok) throw new Error('Failed to resolve claim');
            
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Action Successful',
                message: `Claim request has been successfully ${status}.`
            });
            fetchClaims();
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Action Failed',
                message: err.message
            });
        } finally {
            setResolving(false);
        }
    };

    const handleOpenReview = (claim) => {
        setSelectedClaim(claim);
        setReviewModalOpen(true);
    };

    const pendingClaims = claims.filter(c => c.status === 'pending');
    const historyClaims = claims.filter(c => c.status !== 'pending');
    const currentClaimsList = activeTab === 'pending' ? pendingClaims : historyClaims;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">Lineage Registry</h1>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest leading-relaxed">Verification & claim management for global node validation.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-100 dark:border-brand-darkBorder">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 px-6 font-black text-xs uppercase tracking-widest transition-all ${
                        activeTab === 'pending' 
                            ? 'text-brand-orange border-b-2 border-brand-orange' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                    }`}
                >
                    Pending Claims ({pendingClaims.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-6 font-black text-xs uppercase tracking-widest transition-all ${
                        activeTab === 'history' 
                            ? 'text-brand-orange border-b-2 border-brand-orange' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                    }`}
                >
                    Claim History ({historyClaims.length})
                </button>
            </div>

            <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 sm:p-8 mb-10 transition-colors mx-4 sm:mx-0">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left transition-colors">
                                    <th className="pb-6 pr-4">Requester</th>
                                    <th className="pb-6 px-4">Target Node</th>
                                    <th className="pb-6 px-4">Branch</th>
                                    <th className="pb-6 px-4">Gen</th>
                                    <th className="pb-6 px-4">Type</th>
                                    <th className="pb-6 px-4">Claimed At</th>
                                    <th className="pb-6 pl-4 text-brand-orange opacity-80">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentClaimsList.map((row) => (
                                    <ClaimRow key={row.id} claim={row} onReview={handleOpenReview} />
                                ))}
                                {currentClaimsList.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                            {activeTab === 'pending' ? 'No pending claims' : 'No claim history'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Claim Modal */}
            {reviewModalOpen && selectedClaim && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder animate-in zoom-in duration-300 text-left">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight italic">Review Claim Request</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Verify node ownership credentials</p>
                            </div>
                            <button 
                                onClick={() => setReviewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Target Tree Node</span>
                                    <p className="text-base font-bold text-gray-800 dark:text-brand-darkText">{selectedClaim.person_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Branch</span>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedClaim.branch_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Generation</span>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedClaim.generation}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Submitted At</span>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{new Date(selectedClaim.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Requester (Claimant)</span>
                                    <p className="text-base font-bold text-gray-800 dark:text-brand-darkText">{selectedClaim.requester_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Claimant ID</span>
                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 tracking-tighter">{selectedClaim.requester_id?.substring(0, 8)}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Request Type</span>
                                        <span className="px-2.5 py-1 bg-brand-active dark:bg-brand-orange/10 text-brand-orange rounded-full text-[9px] font-black uppercase tracking-widest block w-max mt-0.5">{selectedClaim.claim_type}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Verification Evidence</span>
                                    {selectedClaim.evidence_url ? (
                                        <a href={selectedClaim.evidence_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-brand-active/20 dark:bg-brand-orange/5 border border-brand-orange/10 rounded-xl hover:border-brand-orange transition-colors w-full mt-1">
                                            <svg className="w-5 h-5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider">View Attached Document</span>
                                        </a>
                                    ) : (
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic mt-1">No evidence provided</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-urgency-medium/10 dark:bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
                            <span className="text-xl">ℹ</span>
                            <p className="text-[11px] font-bold text-brand-orange uppercase tracking-wide">
                                Requester {selectedClaim.requester_name} is claiming {selectedClaim.person_name || 'a node'} in the {selectedClaim.branch_name || 'tree'}.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-end">
                            <button 
                                onClick={() => setReviewModalOpen(false)}
                                className="bg-white dark:bg-brand-darkCard text-gray-500 dark:text-gray-400 px-6 py-4 rounded-xl font-black text-[11px] border border-gray-100 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-all active:scale-95 leading-none uppercase tracking-widest"
                            >
                                Close
                            </button>
                            {selectedClaim.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => {
                                            handleResolve(selectedClaim.id, 'rejected');
                                            setReviewModalOpen(false);
                                        }}
                                        disabled={resolving}
                                        className="bg-brand-error/20 dark:bg-rose-500/10 text-brand-errorText dark:text-rose-400 px-6 py-4 rounded-xl font-black text-[11px] border border-brand-error dark:border-rose-500/20 hover:bg-brand-error/30 transition-all active:scale-95 leading-none uppercase tracking-widest disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleResolve(selectedClaim.id, 'approved');
                                            setReviewModalOpen(false);
                                        }}
                                        disabled={resolving}
                                        className="bg-brand-orange text-white px-6 py-4 rounded-xl font-black text-[11px] shadow-lg shadow-brand-orange/20 hover:bg-orange-600 transition-all active:scale-95 leading-none uppercase tracking-widest disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Success/Error Feedback Modal */}
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

export default LineageRegistry;
