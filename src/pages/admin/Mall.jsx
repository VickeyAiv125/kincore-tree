import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2, Clock, RefreshCw, Trash2 } from 'lucide-react';

// ─── PlenorHub public base (no auth required) ───────────────────────────────
const PH_BASE = 'https://api.plenorhub.com/api/v1/integration';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');
const getFamilyId = () => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return localStorage.getItem('selected_family_id') || u?.family_space_id || u?.family_id;
};

// ─── P2P Pending Row ─────────────────────────────────────────────────────────
const P2PRow = ({ item, onApprove, onReject, onEdit, onDelete, loading }) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none group hover:bg-orange-50/10 dark:hover:bg-brand-orange/5 transition-colors">
        <td className="py-5 pr-4 pl-1">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder shrink-0 flex items-center justify-center text-gray-300 dark:text-gray-600 text-xs font-black">
                    {item.image_urls?.[0] ? <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} /> : 'K'}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText leading-snug max-w-[160px]">{item.title}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{item.condition || '—'}</p>
                </div>
            </div>
        </td>
        <td className="py-5 px-4">
            <span className="text-xs font-bold text-brand-orange opacity-80 dark:opacity-90 block">
                {item.seller ? `${item.seller.first_name} ${item.seller.last_name}` : '—'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">{item.seller?.email || ''}</span>
        </td>
        <td className="py-5 px-4">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{item.category || '—'}</span>
        </td>
        <td className="py-5 px-4">
            <span className="text-sm font-black text-gray-800 dark:text-brand-darkText">{item.price ? `${parseFloat(item.price).toFixed(2)} KCC` : '—'}</span>
        </td>
        <td className="py-5 px-4">
            {item.moderation_status === 'approved' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600">
                    <CheckCircle size={10} /> Approved
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-500/10 text-amber-600">
                    <Clock size={10} /> Pending
                </span>
            )}
        </td>
        <td className="py-5 pl-4 pr-1">
            {item.moderation_status === 'pending' ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => onReject(item.id)}
                        disabled={loading}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-rose-500 uppercase tracking-widest hover:underline disabled:opacity-40"
                    >
                        <XCircle size={12} /> Reject
                    </button>
                    <button
                        onClick={onEdit}
                        disabled={loading}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-blue-500 uppercase tracking-widest hover:underline disabled:opacity-40"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={loading}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-red-500 uppercase tracking-widest hover:underline disabled:opacity-40"
                    >
                        Delete
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        disabled={loading}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-blue-500 uppercase tracking-widest hover:underline disabled:opacity-40"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={loading}
                        className="flex items-center gap-1 text-[10px] font-extrabold text-red-500 uppercase tracking-widest hover:underline disabled:opacity-40"
                    >
                        Delete
                    </button>
                </div>
            )}
        </td>
    </tr>
);

// ─── PlenorHub sub-components ────────────────────────────────────────────────
const fetchPH = async (path) => {
    const res = await fetch(`${PH_BASE}${path}`, {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`PlenorHub ${res.status}: ${res.statusText}`);
    return res.json();
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder">
        {[...Array(6)].map((_, i) => (
            <td key={i} className="py-5 px-4">
                <div className="h-3 bg-gray-100 dark:bg-brand-darkBorder rounded-full animate-pulse w-3/4" />
            </td>
        ))}
    </tr>
);

const StockBadge = ({ inStock, stock }) => {
    if (inStock === false || stock === 0) {
        return (
            <span className="inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-500/10 text-rose-500">
                Out of Stock
            </span>
        );
    }
    if (stock !== undefined && stock <= 5) {
        return (
            <span className="inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-500/10 text-amber-600">
                Low · {stock} left
            </span>
        );
    }
    return (
        <span className="inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600">
            In Stock {stock !== undefined ? `· ${stock}` : ''}
        </span>
    );
};

const ProductRow = ({ product }) => {
    const { name, price, currency, category, image_url, stock, in_stock, merchant } = product;
    const displayPrice = price !== undefined ? `${parseFloat(price).toFixed(2)} ${currency || 'KCC'}` : '—';

    return (
        <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none group hover:bg-orange-50/10 dark:hover:bg-brand-orange/5 transition-colors">
            {/* Product */}
            <td className="py-5 pr-4 pl-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder shrink-0">
                        {image_url ? (
                            <img
                                src={image_url}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-xs font-black">
                                K
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText leading-snug max-w-[180px]">
                        {name}
                    </p>
                </div>
            </td>

            {/* Merchant */}
            <td className="py-5 px-4">
                <div>
                    <span className="text-xs font-bold text-brand-orange opacity-80 dark:opacity-90 block">
                        {merchant?.name || '—'}
                    </span>
                    {merchant?.slug && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            @{merchant.slug}
                        </span>
                    )}
                </div>
            </td>

            {/* Category */}
            <td className="py-5 px-4">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {category || '—'}
                </span>
            </td>

            {/* Price */}
            <td className="py-5 px-4">
                <span className="text-sm font-black text-gray-800 dark:text-brand-darkText">
                    {displayPrice}
                </span>
                {merchant?.cashback_rate > 0 && (
                    <span className="block text-[10px] font-bold text-emerald-500 mt-0.5">
                        {merchant.cashback_rate}% cashback
                    </span>
                )}
            </td>

            {/* Stock */}
            <td className="py-5 px-4">
                <StockBadge inStock={in_stock} stock={stock} />
            </td>

            {/* Actions — static visual buttons as per original design */}
            <td className="py-5 pl-4 pr-1">
                <div className="flex flex-col items-start">
                    <button className="text-[10px] font-extrabold text-brand-orange uppercase tracking-widest hover:underline mb-1">Approve</button>
                    <button className="text-[10px] font-extrabold text-brand-orange uppercase tracking-widest hover:underline">Listing</button>
                </div>
            </td>
        </tr>
    );
};

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, page } = meta;
    const currentPage = current_page || page || 1;

    return (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-brand-darkBorder mt-2">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                Page {currentPage} of {last_page} · {meta.total} products
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl border border-gray-100 dark:border-brand-darkBorder text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-all"
                >
                    Prev
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= last_page}
                    className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl border border-gray-100 dark:border-brand-darkBorder text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-brand-orange hover:text-brand-orange transition-all"
                >
                    Next
                </button>
            </div>
        </div>
    );
};



// ─── Listing Modal (Create/Edit) ───────────────────────────────────────────
const ListingModal = ({ isOpen, onClose, onSuccess, showToast, initialData = null }) => {
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
        } else {
            setFormData({ title: '', description: '', price: '', category: '', condition: 'new' });
        }
        setImages([]);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const familyId = getFamilyId();
            const url = initialData 
                ? `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/families/${familyId}/marketplace/${initialData.id}`
                : `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/families/${familyId}/marketplace`;
            
            const method = initialData ? 'PATCH' : 'POST';
            
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: data
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || 'Failed to save listing');
            showToast(initialData ? 'Listing updated successfully' : 'Listing created successfully');
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-brand-darkText">{initialData ? 'Edit Listing' : 'Create New Listing'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XCircle size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20" placeholder="Product Title" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Price (KCC)</label>
                            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20" placeholder="0.00" />
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
                        <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20" placeholder="e.g. Electronics, Furniture" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-900 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20 h-24" placeholder="Describe your item..."></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Images</label>
                        <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-orange file:text-white hover:file:opacity-90" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-brand-orange text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : (initialData ? 'Save Changes' : 'Create Listing')}
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

// ─── Main Component ──────────────────────────────────────────────────────────
const Mall = () => {
    const [activeTab, setActiveTab] = useState('p2p');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [editData, setEditData] = useState(null);

    // ── P2P State ────────────────────────────────────────────────────────────
    const [p2pListings, setP2pListings] = useState([]);
    const [p2pLoading, setP2pLoading] = useState(false);
    const [p2pError, setP2pError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [p2pSearch, setP2pSearch] = useState('');
    const [p2pSearchInput, setP2pSearchInput] = useState('');
    const [p2pCategory, setP2pCategory] = useState('');

    const handleP2PSearchSubmit = (e) => {
        e.preventDefault();
        setP2pSearch(p2pSearchInput.trim());
    };

    const handleP2PCategoryChange = (val) => {
        setP2pCategory(val);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchP2P = useCallback(async () => {
        const familyId = getFamilyId();
        if (!familyId) return;
        setP2pLoading(true);
        setP2pError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/families/${familyId}/marketplace/pending`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load listings');
            setP2pListings(data);
        } catch (err) {
            setP2pError(err.message);
        } finally {
            setP2pLoading(false);
        }
    }, []);

    useEffect(() => { fetchP2P(); }, [fetchP2P]);

    const handleP2PAction = async (listingId, action) => {
        const familyId = getFamilyId();
        setActionLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/families/${familyId}/marketplace/${listingId}/${action}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Action failed');
            showToast(`Listing ${action}d successfully`);
            fetchP2P();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Filtered P2P listings
    
    const handleDelete = async () => {
        if (!deleteData) return;
        const familyId = getFamilyId();
        setActionLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`}/families/${familyId}/marketplace/${deleteData.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            showToast('Listing deleted successfully');
            fetchP2P();
            setIsDeleteModalOpen(false);
            setDeleteData(null);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setActionLoading(false);
        }
    };
    
    const filteredP2PListings = p2pListings.filter(item => {
        const matchesSearch = !p2pSearch || (item.title && item.title.toLowerCase().includes(p2pSearch.toLowerCase())) || 
            (item.seller && `${item.seller.first_name} ${item.seller.last_name}`.toLowerCase().includes(p2pSearch.toLowerCase()));
        const matchesCategory = !p2pCategory || item.category === p2pCategory;
        return matchesSearch && matchesCategory;
    });

    const pendingP2P = filteredP2PListings.filter(item => item.moderation_status === 'pending');
    const approvedP2P = filteredP2PListings.filter(item => item.moderation_status === 'approved');

    const p2pCategories = [...new Set(p2pListings.map(item => item.category).filter(Boolean))];

    // ── PlenorHub State ──────────────────────────────────────────────────────
    const [categories, setCategories] = useState([]);
    const [meta, setMeta]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    // filters
    const [search, setSearch]         = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [category, setCategory]     = useState('');
    const [page, setPage]             = useState(1);

    // ── Fetch categories once ────────────────────────────────────────────────
    useEffect(() => {
        fetchPH('/categories')
            .then((data) => setCategories(data.data || []))
            .catch(() => {}); // non-critical, silently ignore
    }, []);

    // ── Fetch products whenever filter/page changes ──────────────────────────
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ per_page: 20, page });
            if (search)   params.set('search', search);
            if (category) params.set('category', category);

            const data = await fetchPH(`/products?${params.toString()}`);
            setProducts(data.data || []);
            setMeta(data.meta || null);
        } catch (err) {
            setError(err.message || 'Failed to load products from PlenorHub.');
        } finally {
            setLoading(false);
        }
    }, [page, search, category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // ── Search submit (debounce via explicit submit) ─────────────────────────
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleCategoryChange = (val) => {
        setCategory(val);
        setPage(1);
    };

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col">
            <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeleteData(null); }} onConfirm={handleDelete} loading={actionLoading} title={deleteData?.name} />
            <ListingModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setEditData(null); }} onSuccess={fetchP2P} showToast={showToast} initialData={editData} />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="mb-6 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">
                    Kincore · K-Mall
                </h2>
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText">
                        Product Catalog
                    </h1>
                </div>
            </header>

            {/* P2P Tab */}
            {activeTab === 'p2p' && (
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Family Space Marketplace Listings
                        </p>
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setEditData(null); setIsCreateModalOpen(true); }} className="px-4 py-2 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 shadow-sm shadow-brand-orange/20 transition-all">
                                + Create Listing
                            </button>
                            <button onClick={fetchP2P} className="flex items-center gap-1 text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline">
                                <RefreshCw size={12} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* P2P Filters */}
                    <div className="flex flex-wrap gap-3 mb-6 items-center">
                        <form onSubmit={handleP2PSearchSubmit} className="flex gap-2 flex-1 min-w-[220px] max-w-sm">
                            <input
                                type="text"
                                value={p2pSearchInput}
                                onChange={(e) => setP2pSearchInput(e.target.value)}
                                placeholder="Search pending products..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-800 dark:text-brand-darkText placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shadow-brand-orange/20"
                            >
                                Search
                            </button>
                        </form>
                        <select
                            value={p2pCategory}
                            onChange={(e) => handleP2PCategoryChange(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder text-sm font-medium text-gray-700 dark:text-brand-darkText focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {p2pCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        {(p2pSearch || p2pCategory) && (
                            <button
                                onClick={() => {
                                    setP2pSearch('');
                                    setP2pSearchInput('');
                                    setP2pCategory('');
                                }}
                                className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {p2pLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-brand-orange" size={32} />
                        </div>
                    )}

                    {p2pError && !p2pLoading && (
                        <div className="py-10 text-center">
                            <p className="text-sm font-bold text-rose-500 mb-3">{p2pError}</p>
                            <button onClick={fetchP2P} className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline">Retry</button>
                        </div>
                    )}

                    {!p2pLoading && !p2pError && (
                        <div className="flex flex-col gap-8">
                            {/* Pending Requests Section */}
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 dark:text-brand-darkText mb-4">Pending Requests</h3>
                                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[760px]">
                                            <thead>
                                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    <th className="pb-6 pr-4 pl-1">Product</th>
                                                    <th className="pb-6 px-4">Seller</th>
                                                    <th className="pb-6 px-4">Category</th>
                                                    <th className="pb-6 px-4">Price</th>
                                                    <th className="pb-6 px-4">Status</th>
                                                    <th className="pb-6 pl-4 pr-1 text-brand-orange opacity-80">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingP2P.length > 0
                                                    ? pendingP2P.map(item => (
                                                        <P2PRow
                                                            key={item.id}
                                                            item={item}
                                                            loading={actionLoading}
                                                            onApprove={(id) => handleP2PAction(id, 'approve')}
                                                            onEdit={() => { setEditData(item); setIsCreateModalOpen(true); }}
                                                            onDelete={() => { setDeleteData(item); setIsDeleteModalOpen(true); }}
                                                            onReject={(id) => handleP2PAction(id, 'reject')}
                                                        />
                                                    ))
                                                    : (
                                                        <tr>
                                                            <td colSpan={6} className="py-20 text-center text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
                                                                No pending requests
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Approved Listings Section */}
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 dark:text-brand-darkText mb-4">Live Approved Listings</h3>
                                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[760px]">
                                            <thead>
                                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    <th className="pb-6 pr-4 pl-1">Product</th>
                                                    <th className="pb-6 px-4">Seller</th>
                                                    <th className="pb-6 px-4">Category</th>
                                                    <th className="pb-6 px-4">Price</th>
                                                    <th className="pb-6 px-4">Status</th>
                                                    <th className="pb-6 pl-4 pr-1 text-brand-orange opacity-80">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {approvedP2P.length > 0
                                                    ? approvedP2P.map(item => (
                                                        <P2PRow
                                                            key={item.id}
                                                            item={item}
                                                            loading={actionLoading}
                                                            onApprove={(id) => handleP2PAction(id, 'approve')}
                                                            onEdit={() => { setEditData(item); setIsCreateModalOpen(true); }}
                                                            onDelete={() => { setDeleteData(item); setIsDeleteModalOpen(true); }}
                                                            onReject={(id) => handleP2PAction(id, 'reject')}
                                                        />
                                                    ))
                                                    : (
                                                        <tr>
                                                            <td colSpan={6} className="py-20 text-center text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
                                                                No approved listings found
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Mall;
