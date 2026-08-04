import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShoppingBag, User, ArrowUpRight, History, Package, ShieldCheck, AlertCircle, ChevronRight, ChevronDown, Loader2, XCircle, Trash2 } from 'lucide-react';

const KPICard = ({ title, value, color }) => (
    <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm transition-all hover:shadow-md dark:shadow-brand-orange/5 flex-1 transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 transition-colors">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">{value}</h3>
    </div>
);

const Badge = ({ children }) => {
    const variants = {
        Pending: 'bg-[#FFF9E5] dark:bg-yellow-950/20 text-[#DAA520] dark:text-yellow-400',
        Approved: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400',
        Rejected: 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
        Verified: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400',
        Open: 'bg-[#FFE8E2] dark:bg-orange-950/20 text-[#FF6D4D] dark:text-brand-orange',
        Closed: 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500',
    };
    return (
        <span className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${variants[children] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400'}`}>
            {children}
        </span>
    );
};

// ─── Temporary Credentials Modal (PlenorHub Provisioning) ──────────────────
const TempCredsModal = ({ isOpen, onClose, credentials }) => {
    if (!isOpen || !credentials) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-brand-darkCard rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-brand-darkBorder p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-brand-darkText mb-2">Merchant Approved!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    PlenorHub KCC ID identity has been provisioned. Please share these temporary credentials securely with the merchant:
                </p>
                <div className="bg-gray-50 dark:bg-brand-darkBg p-4 rounded-2xl text-left font-mono text-xs space-y-2 mb-6 border border-gray-100 dark:border-brand-darkBorder">
                    <div><span className="text-gray-400">Username:</span> <span className="font-bold text-gray-800 dark:text-brand-darkText">{credentials.username}</span></div>
                    <div><span className="text-gray-400">Password:</span> <span className="font-bold text-brand-orange">{credentials.password}</span></div>
                </div>
                <button onClick={onClose} className="w-full py-3 bg-brand-orange text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">
                    Done
                </button>
            </div>
        </div>
    );
};


// ─── Global Listing Modal (Edit) ───────────────────────────────────────────
const GlobalListingModal = ({ isOpen, onClose, onSuccess, showToast, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: 'new'
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                price: initialData.price || '',
                category: initialData.category || '',
                condition: initialData.condition || 'new'
            });
        }
        setImages([]);
    }, [initialData, isOpen]);

    if (!isOpen || !initialData) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/mall/listings/${initialData.id}`;
            
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }

            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || 'Failed to update global listing');
            showToast('Global Listing updated successfully');
            onSuccess();
            onClose();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-brand-darkCard rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-brand-darkBorder">
                <div className="p-6 border-b border-gray-100 dark:border-brand-darkBorder flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-brand-darkText">Edit Global Listing</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XCircle size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Price (KCC)</label>
                            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Condition</label>
                            <select required value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20">
                                <option value="new">New</option>
                                <option value="like-new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Category</label>
                        <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20 h-24"></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Images</label>
                        <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-orange file:text-white hover:file:opacity-90" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand-orange text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-brand-darkCard rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-brand-darkBorder text-center p-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-brand-darkText mb-2">Delete Listing?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to delete <span className="font-bold text-gray-700 dark:text-gray-300">"{title}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={loading} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-all">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Operations = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedItem, setExpandedItem] = useState(null);
    const [toast, setToast] = useState(null);
    const [globalListings, setGlobalListings] = useState([]);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('plenorhub');
    const [editData, setEditData] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchQueue = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/mall/queue`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                const formattedData = data.map(item => ({
                    id: item.id,
                    displayId: `LIS-${item.id.split('-')[0].toUpperCase()}`,
                    name: item.title,
                    seller: item.seller?.first_name ? `${item.seller.first_name} ${item.seller.last_name}` : 'Unknown Seller',
                    category: item.category || 'Uncategorized',
                    price: `${item.price} ${item.currency || 'KCC'}`,
                    status: item.moderation_status.charAt(0).toUpperCase() + item.moderation_status.slice(1),
                    risk: item.risk_score > 70 ? 'HIGH' : item.risk_score > 30 ? 'MEDIUM' : 'LOW',
                    description: item.description,
                    sellerStats: { 
                        sales: item.seller?.sales_count || 0, 
                        joined: item.seller?.created_at ? new Date(item.seller.created_at).getFullYear() : '—', 
                        disputes: item.seller?.dispute_count || 0, 
                        rating: item.seller?.rating != null ? item.seller.rating : null
                    },
                    familyHint: item.family_space?.name || item.family_space_id || null
                }));
                setQueue(formattedData);
            } else {
                setError(data.error || 'Failed to fetch moderation queue');
            }
            if (response.ok) setError(null);
        } catch (err) {
            console.error('Error fetching mall queue:', err);
            setError('Failed to fetch operations data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const handleModerate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/mall/listings/${id}/moderate`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: status.toLowerCase(),
                    notes: `Moderated via Admin Hub: ${status}`
                })
            });
            
            if (response.ok) {
                showToast(`Listing ${status} successfully.`);
                fetchQueue();
            } else {
                const errorData = await response.json();
                showToast(`Moderation failed: ` + (errorData.error || response.statusText), 'error');
            }
        } catch (err) {
            console.error('Moderation failed:', err);
            showToast('Action failed: ' + err.message, 'error');
        }
    };

    const handleDeleteGlobal = async () => {
        if (!deleteData) return;
        setGlobalLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/admin/mall/listings/${deleteData.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            showToast('Global Listing deleted successfully');
            fetchGlobalListings();
            setIsDeleteModalOpen(false);
            setDeleteData(null);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setGlobalLoading(false);
        }
    };

    const fetchGlobalListings = useCallback(async () => {
        try {
            setGlobalLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/mall/listings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setGlobalListings(data);
        } catch (err) {
            console.error('Failed to fetch global listings:', err);
        } finally {
            setGlobalLoading(false);
        }
    }, []);

    const [sellers, setSellers] = useState([]);
    const [sellersLoading, setSellersLoading] = useState(true);
    const [disputeList, setDisputeList] = useState([]);
    const [disputesLoading, setDisputesLoading] = useState(true);
    const [payoutStats, setPayoutStats] = useState({ pending_count: 0, completed_count: 0, rejected_count: 0, processing_count: 0, total_requested_usd: 0 });
    const [mallSource, setMallSource] = useState({ merchants: null, disputes: null, payouts: null, warning: null });
    const [tempCredsModal, setTempCredsModal] = useState({ isOpen: false, credentials: null });

    const fetchMallData = useCallback(async () => {
        try {
            setSellersLoading(true);
            setDisputesLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const headers = { Authorization: `Bearer ${token}` };
            const warnings = [];

            try {
                const resMerchants = await fetch(`${baseUrl}/admin/mall/merchants`, { headers, cache: 'no-store' });
                const data = await resMerchants.json().catch(() => ({}));
                if (resMerchants.ok) {
                    const list = Array.isArray(data) ? data : (data.merchants || data.data || []);
                    setSellers(list);
                    if (data.source) setMallSource((s) => ({ ...s, merchants: data.source }));
                    if (data.warning) warnings.push(data.warning);
                } else {
                    setSellers([]);
                    warnings.push(data.error || 'Failed to load merchants');
                }
            } catch (err) {
                console.error('Failed to fetch mall merchants:', err);
                setSellers([]);
            } finally {
                setSellersLoading(false);
            }

            try {
                const resDisputes = await fetch(`${baseUrl}/admin/mall/disputes`, { headers, cache: 'no-store' });
                const data = await resDisputes.json().catch(() => ({}));
                if (resDisputes.ok) {
                    const list = Array.isArray(data) ? data : (data.disputes || data.data || []);
                    setDisputeList(list);
                    if (data.source) setMallSource((s) => ({ ...s, disputes: data.source }));
                    if (data.warning) warnings.push(data.warning);
                } else {
                    setDisputeList([]);
                }
            } catch (err) {
                console.error('Failed to fetch mall disputes:', err);
                setDisputeList([]);
            } finally {
                setDisputesLoading(false);
            }

            try {
                const resPayouts = await fetch(`${baseUrl}/admin/mall/payouts/stats`, { headers, cache: 'no-store' });
                const data = await resPayouts.json().catch(() => ({}));
                if (resPayouts.ok) {
                    setPayoutStats({
                        pending_count: Number(data.pending_count) || 0,
                        completed_count: Number(data.completed_count) || 0,
                        rejected_count: Number(data.rejected_count) || 0,
                        processing_count: Number(data.processing_count) || 0,
                        total_requested_usd: Number(data.total_requested_usd) || 0
                    });
                    if (data.source) setMallSource((s) => ({ ...s, payouts: data.source }));
                    if (data.warning) warnings.push(data.warning);
                }
            } catch (err) {
                console.error('Failed to fetch mall payouts:', err);
            }

            setMallSource((s) => ({ ...s, warning: warnings[0] || null }));
        } catch (err) {
            console.error('Failed to fetch mall data:', err);
        }
    }, []);

    const handleApproveSeller = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/admin/mall/merchants/${id}/approve`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to approve merchant');
            showToast(data.message || 'Merchant approved successfully');
            if (data.temp_credentials) {
                setTempCredsModal({ isOpen: true, credentials: data.temp_credentials });
            }
            fetchMallData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRejectSeller = async (id) => {
        try {
            const reason = prompt('Enter rejection reason for merchant:', 'Incomplete documentation');
            if (!reason) return;
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/admin/mall/merchants/${id}/reject`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reject merchant');
            showToast(data.message || 'Merchant application rejected');
            fetchMallData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleArbitrateDispute = async (id, ruling) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/admin/mall/disputes/${id}/arbitrate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruling })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to arbitrate dispute');
            showToast(data.message || `Dispute resolved: ${ruling === 'favor_buyer' ? 'Favored Buyer' : 'Favored Seller'}`);
            fetchMallData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    useEffect(() => {
        fetchQueue();
        fetchGlobalListings();
        fetchMallData();
    }, [fetchQueue, fetchGlobalListings, fetchMallData]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-20 px-4 sm:px-0">
            <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeleteData(null); }} onConfirm={handleDeleteGlobal} loading={globalLoading} title={deleteData?.title} />
            <GlobalListingModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditData(null); }} onSuccess={fetchGlobalListings} showToast={showToast} initialData={editData} />
            <TempCredsModal isOpen={tempCredsModal.isOpen} onClose={() => setTempCredsModal({ isOpen: false, credentials: null })} credentials={tempCredsModal.credentials} />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg ${
                    toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                    {toast.msg}
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Platform Operations Dashboard</h1>
                <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('plenorhub')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'plenorhub' ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-500'}`}
                    >
                        PlenorHub (Mall)
                    </button>
                    <button
                        onClick={() => setActiveTab('p2p')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'p2p' ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-500'}`}
                    >
                        P2P Marketplace
                    </button>
                </div>
            </header>

            {activeTab === "p2p" && (
            <>
            {/* Moderation Queue */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Moderation Queue</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search products or sellers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-bold text-gray-900 dark:text-brand-darkText shadow-sm focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all w-60"
                            />
                        </div>
                        <div className="flex bg-gray-50 dark:bg-brand-darkBg p-1 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === status ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Listing ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller (Family/Branch)</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller Risk</th>
                                    <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder relative min-h-[200px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <Loader2 className="animate-spin text-brand-orange mx-auto" size={28} />
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">Loading Moderation Queue...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (() => {
                                    const filtered = queue.filter(item =>
                                        (filterStatus === 'All' || item.status === filterStatus) &&
                                        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.seller.toLowerCase().includes(searchQuery.toLowerCase()))
                                    );
                                    if (filtered.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-14 text-center">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">No listings found in moderation queue</span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                    return filtered.map((item, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr
                                                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                                className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group cursor-pointer"
                                            >
                                            <td className="px-6 py-5 text-sm font-semibold text-brand-orange">
                                                <div className="flex items-center space-x-2">
                                                    {expandedItem === item.id ? <ChevronDown size={14} /> : <ChevronRight size={14} className="group-hover:text-brand-orange transition-colors" />}
                                                    <span>{item.displayId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">{item.name}</td>
                                            <td className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                {item.seller}
                                                {item.familyHint && (
                                                    <span className="text-[10px] text-gray-400 block font-medium">{item.familyHint}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${item.risk === 'LOW' ? 'text-green-500 bg-green-50 dark:bg-green-900/10' : 'text-red-500 bg-red-50 dark:bg-red-900/10 animate-pulse'}`}>
                                                    {item.risk}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge>{item.status}</Badge>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-[#FF6D4D] text-right space-x-3 uppercase tracking-tight">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleModerate(item.id, 'Approved'); }}
                                                    className={`hover:underline ${item.status === 'Approved' ? 'opacity-30 pointer-events-none' : ''}`}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleModerate(item.id, 'Rejected'); }}
                                                    className={`text-red-500 hover:underline ${item.status === 'Rejected' ? 'opacity-30' : ''}`}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedItem === item.id && (
                                            <tr className="bg-gray-50/30 dark:bg-brand-darkBg/30 animate-in slide-in-from-top-2 duration-300">
                                                <td colSpan="6" className="px-8 py-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
                                                                    <Package size={14} className="text-brand-orange" />
                                                                    <span>Listing Details</span>
                                                                </h4>
                                                                <div className="bg-white dark:bg-brand-darkCard p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder space-y-4">
                                                                    <div className="flex justify-between border-b border-gray-50 pb-3">
                                                                        <span className="text-xs font-bold text-gray-400 uppercase">Category</span>
                                                                        <span className="text-xs font-black text-gray-800 dark:text-brand-darkText underline decoration-brand-orange/30 decoration-2 underline-offset-4">{item.category}</span>
                                                                    </div>
                                                                    <div className="flex justify-between border-b border-gray-50 pb-3">
                                                                        <span className="text-xs font-bold text-gray-400 uppercase">Price Point</span>
                                                                        <span className="text-xs font-black text-brand-orange">{item.price}</span>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <span className="text-xs font-bold text-gray-400 uppercase">Product Description</span>
                                                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 leading-relaxed italic">"{item.description}"</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
                                                                    <History size={14} className="text-brand-orange" />
                                                                    <span>Seller History & Rep</span>
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Sales</p>
                                                                        <p className="text-lg font-black text-gray-800 dark:text-brand-darkText">{item.sellerStats.sales}</p>
                                                                    </div>
                                                                    <div className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Member Since</p>
                                                                        <p className="text-lg font-black text-gray-800 dark:text-brand-darkText">{item.sellerStats.joined}</p>
                                                                    </div>
                                                                    <div className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dispute Rate</p>
                                                                        <p className={`text-lg font-black ${item.sellerStats.disputes > 5 ? 'text-red-500' : 'text-green-500'}`}>{item.sellerStats.sales > 0 ? ((item.sellerStats.disputes / item.sellerStats.sales) * 100).toFixed(1) : 0}%</p>
                                                                    </div>
                                                                    <div className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Global Rating</p>
                                                                        <p className="text-lg font-black text-brand-orange">
                                                                            {item.sellerStats.rating != null ? `${item.sellerStats.rating}/5.0` : '—'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ));
                            })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            </>
            )}

            {activeTab === "plenorhub" && (
            <>
            {mallSource.warning && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 px-5 py-4 text-xs font-medium text-amber-800 dark:text-amber-200">
                    <span className="font-black uppercase tracking-widest mr-2">Data source notice</span>
                    {mallSource.warning}
                    {(mallSource.merchants || mallSource.payouts) && (
                        <span className="ml-2 opacity-80">
                            (merchants: {mallSource.merchants || '—'}, payouts: {mallSource.payouts || '—'}, disputes: {mallSource.disputes || '—'})
                        </span>
                    )}
                </div>
            )}
            {/* Seller Verification */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Seller Verification</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller ID / Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {sellersLoading ? (
                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Sellers...</td></tr>
                                ) : sellers.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No sellers found</td></tr>
                                ) : sellers.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group">
                                        <td className="px-6 py-4 text-sm font-semibold text-brand-orange" title={item.name}>
                                            <div>{item.id}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300 font-bold">{item.name || item.business_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400">{item.type || item.category || 'Retail'}</td>
                                        <td className="px-6 py-4">
                                            <Badge>{item.status || 'Pending'}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-right space-x-3 uppercase tracking-tight">
                                            {(!item.status || item.status.toLowerCase() === 'pending') ? (
                                                <>
                                                    <button onClick={() => handleApproveSeller(item.rawId || item.id)} className="text-[#2E8B57] dark:text-green-400 hover:underline">Approve</button>
                                                    <button onClick={() => handleRejectSeller(item.rawId || item.id)} className="text-red-500 hover:underline">Reject</button>
                                                </>
                                            ) : (
                                                <span className={`text-xs font-bold ${item.status.toLowerCase() === 'verified' || item.status.toLowerCase() === 'approved' ? 'text-emerald-500' : 'text-gray-400 font-normal'}`}>{item.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Payout Overview */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Payout Overview</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <KPICard title="Total Requested Payouts" value={`$${(payoutStats.total_requested_usd || 0).toLocaleString()}`} />
                    <KPICard title="Pending / Active Queue" value={`${payoutStats.pending_count || 0} Pending (${payoutStats.processing_count || 0} Processing)`} />
                    <KPICard title="Settled / Rejected" value={`${payoutStats.completed_count || 0} Completed / ${payoutStats.rejected_count || 0} Rejected`} />
                </div>
            </section>

            {/* Dispute Resolution Board */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Dispute Resolution Board</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Dispute ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Buyer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {disputesLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Disputes...</td></tr>
                                ) : disputeList.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No active disputes</td></tr>
                                ) : disputeList.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group">
                                        <td className="px-6 py-4 text-sm font-semibold text-brand-orange">
                                            <div>{item.id}</div>
                                            {(item.amount || item.requested_amount) && <div className="text-[10px] text-gray-400 font-bold">{item.amount || item.requested_amount}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{item.buyer || item.buyer_name || 'Anonymous Buyer'}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">{item.seller || item.seller_name || item.merchant_name || 'Retail Seller'}</td>
                                        <td className="px-6 py-4">
                                            <Badge>{item.status || 'Open'}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-right space-x-3 uppercase tracking-tight">
                                            {(!item.status || item.status === 'Open' || item.status === 'Under Review') ? (
                                                <>
                                                    <button onClick={() => handleArbitrateDispute(item.id, 'favor_buyer')} className="text-blue-500 hover:underline">Favor Buyer</button>
                                                    <button onClick={() => handleArbitrateDispute(item.id, 'favor_seller')} className="text-brand-orange hover:underline">Favor Seller</button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-normal">{item.status_label || `Resolved (${item.ruling ? item.ruling.replace('favor_', '') : 'Closed'})`}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            </>
            )}

            {activeTab === 'p2p' && (
            <>
            {/* Global P2P Marketplace Listings */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">
                        Global P2P Marketplace
                    </h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 rounded-full bg-gray-100 dark:bg-brand-darkBg">
                        Admin Control
                    </span>
                </div>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Seller</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Family Space</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {globalLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</td></tr>
                                ) : globalListings.length > 0 ? globalListings.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{item.title}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-brand-orange">
                                            {item.seller ? item.seller.first_name + ' ' + item.seller.last_name : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                            {item.family_space_id ? item.family_space_id.split('-')[0].toUpperCase() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-gray-800 dark:text-brand-darkText">
                                            {item.price ? parseFloat(item.price).toFixed(2) + ' KCC' : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge>{item.moderation_status ? item.moderation_status.charAt(0).toUpperCase() + item.moderation_status.slice(1) : 'Unknown'}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => { setEditData(item); setIsEditModalOpen(true); }} className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest hover:underline">Edit</button>
                                            <button onClick={() => { setDeleteData(item); setIsDeleteModalOpen(true); }} className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No listings found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            </>
            )}
        </div>
    );
};

export default Operations;