import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const MemberRow = ({ id, name, branch, generation, status, years, claimStatus }) => {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);

    return (
        <tr className="border-b border-gray-100 dark:border-brand-darkBorder last:border-none transition-colors">
            <td className="py-6 pr-4 text-sm font-medium text-gray-800 dark:text-brand-darkText">{name}</td>
            <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400 font-mono text-[11px] tracking-tighter">{years}</td>
            <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400">{branch}</td>
            <td className="py-6 px-4 text-sm text-gray-400 dark:text-gray-500 font-bold">{generation}</td>
            <td className="py-6 px-4">
                <span className={`px-5 py-1.5 rounded-2xl text-[10px] uppercase font-extrabold tracking-wider ${status === 'Active' ? 'bg-brand-success text-brand-successText dark:bg-emerald-400/10 dark:text-emerald-400' : 'bg-brand-error text-brand-errorText dark:bg-rose-400/10 dark:text-rose-400'}`}>
                    {status}
                </span>
            </td>
            <td className="py-6 px-4">
                <span className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest border ${claimStatus === 'Claimed' ? 'border-brand-success text-brand-successText' :
                    claimStatus === 'Pending' ? 'border-brand-orange text-brand-orange' :
                        'border-gray-200 text-gray-400'
                    }`}>
                    {claimStatus}
                </span>
            </td>
            <td className="py-6 pl-4 text-xs font-bold space-x-2 relative">
                <button
                    onClick={() => navigate(`/governance/view-profile/${id}`)}
                    className="text-gray-900 dark:text-brand-darkText underline opacity-80 hover:opacity-100 transition-opacity"
                >
                    View
                </button>
                <span className="dark:text-gray-600">|</span>
                <div className="inline-block relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="text-brand-orange underline opacity-80 hover:opacity-100 transition-opacity"
                    >
                        Tools
                    </button>
                    {showActions && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl shadow-2xl z-50 p-2 overflow-hidden">
                            <button onClick={() => navigate('/governance/edit-lineage')} className="w-full text-left px-4 py-3 text-xs hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-700 dark:text-brand-darkText flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span> Edit Lineage
                            </button>
                            <div className="h-px bg-gray-50 dark:bg-brand-darkBorder my-1"></div>
                            <button onClick={() => navigate('/governance/add-parents')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400">Add Parent</button>
                            <button onClick={() => navigate('/governance/add-child')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400">Add Child</button>
                            <button onClick={() => navigate('/governance/add-spouse')} className="w-full text-left px-4 py-3 text-xs hover:bg-gray-50 dark:hover:bg-brand-orange/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400">Add Spouse</button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

const MemberRegistry = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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

            // Fetch Members
            const membersRes = await fetch(`${API_BASE}/families/${familyId}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const membersData = await membersRes.json();

            // Fetch Claims
            const claimsRes = await fetch(`${API_BASE}/family-admin/${familyId}/claims`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const claimsData = await claimsRes.json();

            if (membersRes.ok) {
                setMembers(membersData.map(m => ({
                    id: m.id,
                    name: m.name,
                    years: m.birth_year ? `${m.birth_year} - ${m.death_year || 'Present'}` : 'Member',
                    branch: m.branch_name || 'Main Tree',
                    generation: m.generation || 'N/A',
                    status: m.status || 'Active',
                    claimStatus: m.user_id ? 'Claimed' : 'Unclaimed'
                })));
            }

            if (claimsRes.ok) {
                setClaims(claimsData.claims || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveClaim = async (claimId, action) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/claims/${claimId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });

            if (!response.ok) throw new Error('Failed to resolve claim');
            
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Action Successful',
                message: `The claim has been successfully ${action}ed.`
            });
            fetchData();
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Action Failed',
                message: err.message
            });
        }
    };

    const filteredMembers = members.filter(m => 
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.branch?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingClaims = claims.filter(c => c.status === 'pending');

    return (
        <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">Family Registry & Claims Queue</h1>

            {/* Pending Claims Section */}
            {pendingClaims.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-brand-darkText mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-brand-orange" />
                        Pending Claims ({pendingClaims.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingClaims.map(claim => (
                            <div key={claim.id} className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-5 shadow-sm transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{claim.requester_name || claim.requester_email}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Wants to claim: {claim.target_name}</p>
                                    </div>
                                    <span className="bg-orange-50 dark:bg-brand-orange/10 text-brand-orange px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">Pending</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleResolveClaim(claim.id, 'approve')}
                                        className="flex-1 py-2 bg-brand-success/10 text-brand-successText dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-success/20 transition-all flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle size={12} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleResolveClaim(claim.id, 'reject')}
                                        className="flex-1 py-2 bg-brand-error/10 text-brand-errorText dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-error/20 transition-all flex items-center justify-center gap-1"
                                    >
                                        <XCircle size={12} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Member Registry Section */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-brand-darkText">Member Registry</h2>
                <button
                    onClick={() => navigate('/clan-tree')}
                    className="text-[10px] font-black text-brand-orange hover:underline uppercase tracking-widest flex items-center gap-1"
                >
                    <Users size={12} /> View Full Tree
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-brand-orange/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search members by name or branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-active dark:bg-brand-orange/10 border-transparent rounded-full px-16 py-4 focus:ring-0 outline-none text-brand-orange font-medium placeholder-brand-orange/40 text-sm md:text-base transition-colors"
                />
            </div>

            {/* Registry Table */}
            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 transition-colors">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Registry...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500 font-bold">{error}</p>
                        <button onClick={fetchData} className="mt-4 text-brand-orange font-bold underline">Retry</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    <th className="pb-4 pr-4">Name</th>
                                    <th className="pb-4 px-4">Years</th>
                                    <th className="pb-4 px-4">Branch</th>
                                    <th className="pb-4 px-4">Gen</th>
                                    <th className="pb-4 px-4">Status</th>
                                    <th className="pb-4 px-4">Claim</th>
                                    <th className="pb-4 pl-4 text-brand-orange/80">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder/30">
                                {filteredMembers.map((m) => (
                                    <MemberRow key={m.id} {...m} />
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No members found</td>
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

export default MemberRegistry;
