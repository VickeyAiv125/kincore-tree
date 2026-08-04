import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const InputField = ({ label, placeholder, type = 'text', value, onChange }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-sm font-bold text-gray-800 dark:text-brand-darkText transition-colors">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-[#F9FAFB] dark:bg-brand-darkCard border-none rounded-2xl text-sm font-medium text-gray-800 dark:text-brand-darkText focus:ring-2 focus:ring-[#FF6D4D]/20 dark:focus:ring-brand-orange/40 placeholder-gray-400 dark:placeholder-gray-600 transition-all"
        />
    </div>
);

const Badge = ({ children }) => {
    const variants = {
        Paid: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400',
        Refunded: 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
        Pending: 'bg-[#FFF9E5] dark:bg-yellow-950/20 text-[#DAA520] dark:text-yellow-400',
    };
    return (
        <span className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${variants[children] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400'}`}>
            {children}
        </span>
    );
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center space-x-3 animate-in slide-in-from-bottom-8 fade-in ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
            <span className="font-bold text-sm">{message}</span>
        </div>
    );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-brand-darkCard w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-brand-darkBorder animate-in zoom-in-95">
            <h3 className="text-xl font-extrabold text-gray-800 dark:text-brand-darkText mb-2">{title}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="button" onClick={onConfirm} className="flex-1 py-3 bg-[#FF6D4D] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#FF5D3D] transition-colors active:scale-95">Confirm</button>
            </div>
        </div>
    </div>
);

const Billing = () => {
    const navigate = useNavigate();

    const [revenueStats, setRevenueStats] = useState({
        subscription_revenue: 0,
        marketplace_commissions: 0,
        marketplace_revenue: 0,
        ad_revenue: 0,
        total_revenue_7d: 0,
        growth: {}
    });
    const [invoices, setInvoices] = useState([]);
    const [plans, setPlans] = useState([]);
    const [billingConfig, setBillingConfig] = useState({
        marketplace_rate_percent: 10,
        ad_revenue_manual: 0,
        currency: 'USD'
    });

    const [loading, setLoading] = useState(true);
    const [isOperating, setIsOperating] = useState(false);
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);

    const [planName, setPlanName] = useState('');
    const [planPrice, setPlanPrice] = useState('');
    const [storage, setStorage] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [branchLimit, setBranchLimit] = useState('');
    const [featuresText, setFeaturesText] = useState('');

    const [refundInvoiceId, setRefundInvoiceId] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [commissionRate, setCommissionRate] = useState('10');
    const [adRevenueManual, setAdRevenueManual] = useState('0');

    const authHeaders = (extra = {}) => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        ...extra
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const headers = authHeaders();
            const fetchOpts = { headers, cache: 'no-store' };

            const [revRes, invRes, plansRes, cfgRes] = await Promise.all([
                fetch(`${API_BASE}/admin/business/revenue`, fetchOpts),
                fetch(`${API_BASE}/admin/business/billing/invoices`, fetchOpts),
                fetch(`${API_BASE}/admin/business/plans`, fetchOpts),
                fetch(`${API_BASE}/admin/business/billing/config`, fetchOpts)
            ]);

            if (cfgRes.status === 401 || revRes.status === 401) {
                setToast({ message: 'Session expired — please log in again', type: 'error' });
            }

            const revData = revRes.ok ? await revRes.json().catch(() => ({})) : {};
            const invData = invRes.ok ? await invRes.json().catch(() => ({ invoices: [] })) : { invoices: [] };
            const plansData = plansRes.ok ? await plansRes.json().catch(() => []) : [];
            const cfgData = cfgRes.ok ? await cfgRes.json().catch(() => ({ config: {} })) : { config: {} };

            setRevenueStats({
                subscription_revenue: revData.subscription_revenue || 0,
                marketplace_commissions: revData.marketplace_commissions ?? revData.marketplace_revenue ?? 0,
                marketplace_revenue: revData.marketplace_revenue || 0,
                ad_revenue: revData.ad_revenue || 0,
                total_revenue_7d: revData.total_revenue_7d || 0,
                growth: revData.growth || {}
            });

            setInvoices(Array.isArray(invData.invoices) ? invData.invoices : []);
            setPlans(Array.isArray(plansData) ? plansData : []);

            const cfg = cfgData.config || {};
            setBillingConfig({
                marketplace_rate_percent: cfg.marketplace_rate_percent ?? 10,
                ad_revenue_manual: cfg.ad_revenue_manual ?? 0,
                currency: cfg.currency || 'USD'
            });
            setCommissionRate(String(cfg.marketplace_rate_percent ?? 10));
            setAdRevenueManual(String(cfg.ad_revenue_manual ?? 0));
        } catch (error) {
            console.error('Failed to fetch billing data', error);
            setToast({ message: 'Failed to load billing data', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDefineTier = () => {
        if (!planName) {
            setToast({ message: 'Plan Name is required', type: 'error' });
            return;
        }

        setModal({
            title: 'Create New Tier',
            message: `Create the "${planName}" tier with limits and feature gating?`,
            onConfirm: async () => {
                setIsOperating(true);
                try {
                    const features = featuresText
                        ? featuresText.split(',').map((f) => f.trim()).filter(Boolean)
                        : [];
                    const res = await fetch(`${API_BASE}/admin/business/plans`, {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({
                            name: planName,
                            price: parseFloat(planPrice) || 0,
                            features,
                            interval: 'month',
                            is_active: true,
                            storage_gb: storage ? Number(storage) : null,
                            max_members: maxMembers ? Number(maxMembers) : null,
                            branch_limit: branchLimit ? Number(branchLimit) : null,
                            feature_flags: Object.fromEntries(features.map((f) => [f.toLowerCase().replace(/\s+/g, '_'), true]))
                        })
                    });

                    if (res.ok) {
                        setToast({ message: 'New tier created successfully!', type: 'success' });
                        setPlanName('');
                        setPlanPrice('');
                        setStorage('');
                        setMaxMembers('');
                        setBranchLimit('');
                        setFeaturesText('');
                        fetchData();
                    } else {
                        const err = await res.json();
                        setToast({ message: err.error || 'Failed to create tier', type: 'error' });
                    }
                } catch (e) {
                    setToast({ message: 'Network error', type: 'error' });
                } finally {
                    setIsOperating(false);
                    setModal(null);
                }
            }
        });
    };

    const handleSaveCommission = async () => {
        setIsOperating(true);
        try {
            const payload = {
                marketplace_rate_percent: Number(commissionRate) || 0,
                ad_revenue_manual: Number(adRevenueManual) || 0,
                currency: billingConfig.currency || 'USD'
            };
            const res = await fetch(`${API_BASE}/admin/business/billing/config`, {
                method: 'PATCH',
                headers: authHeaders(),
                cache: 'no-store',
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || (res.status === 401 ? 'Session expired — log in again' : 'Failed to save'));

            const saved = data.config || payload;
            setBillingConfig(saved);
            setCommissionRate(String(saved.marketplace_rate_percent ?? payload.marketplace_rate_percent));
            setAdRevenueManual(String(saved.ad_revenue_manual ?? payload.ad_revenue_manual));
            setRevenueStats((prev) => ({
                ...prev,
                ad_revenue: Number(saved.ad_revenue_manual ?? payload.ad_revenue_manual) || 0,
                growth: { ...(prev.growth || {}), ads: Number(saved.ad_revenue_manual) > 0 ? 'SET' : '0%' }
            }));

            setToast({ message: 'Commission & ad revenue saved', type: 'success' });
            // Force fresh server read (avoid stale 304 empty body)
            await fetchData();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        } finally {
            setIsOperating(false);
        }
    };

    const handleRefund = () => {
        if (!refundInvoiceId || !refundReason) {
            setToast({ message: 'Invoice ID and Reason are required', type: 'error' });
            return;
        }

        const inv = invoices.find(
            (i) =>
                i.id === refundInvoiceId ||
                i.original_id === refundInvoiceId ||
                String(i.id).toLowerCase() === String(refundInvoiceId).toLowerCase()
        );
        if (!inv) {
            setToast({ message: 'Invoice not found in current view', type: 'error' });
            return;
        }

        setModal({
            title: 'Process Refund',
            message: `Refund ${inv.id} (${inv.source}) for ${inv.amount_display || inv.amount}?`,
            onConfirm: async () => {
                setIsOperating(true);
                try {
                    const res = await fetch(`${API_BASE}/admin/business/billing/refund`, {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({
                            subscription_id: inv.original_id,
                            order_id: inv.source === 'MARKETPLACE' ? inv.original_id : undefined,
                            source: inv.source,
                            amount: inv.amount,
                            reason: refundReason
                        })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setToast({ message: data.message || 'Refund processed', type: 'success' });
                        setRefundInvoiceId('');
                        setRefundReason('');
                        fetchData();
                    } else {
                        setToast({ message: data.error || 'Failed to process refund', type: 'error' });
                    }
                } catch (e) {
                    setToast({ message: 'Network error', type: 'error' });
                } finally {
                    setIsOperating(false);
                    setModal(null);
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange" />
            </div>
        );
    }

    const growth = revenueStats.growth || {};

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-20 px-4 sm:px-0">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {modal && <ConfirmModal title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}

            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Billing & Monetization</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 transition-colors">Revenue, plans, invoices, commissions, and refunds.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/business/billing/plans/create')}
                        className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder text-gray-700 dark:text-brand-darkText px-4 py-2 rounded-xl font-bold text-xs hover:border-brand-orange/40"
                    >
                        Advanced Plan Builder
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/business/billing/refunds')}
                        className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder text-gray-700 dark:text-brand-darkText px-4 py-2 rounded-xl font-bold text-xs hover:border-brand-orange/40"
                    >
                        Refund Flow
                    </button>
                    <div className="flex items-center space-x-2 bg-brand-orange/10 px-4 py-2 rounded-xl border border-brand-orange/20">
                        <span className="text-xs font-bold text-brand-orange uppercase">Active Plans: {String(plans.length).padStart(2, '0')}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue (7d)', value: `$${(revenueStats.total_revenue_7d || 0).toLocaleString()}`, growth: growth.total_7d || '0%' },
                    { label: 'Subscriptions (all)', value: `$${(revenueStats.subscription_revenue || 0).toLocaleString()}`, growth: growth.subscriptions_7d || '0%' },
                    { label: 'Marketplace Commissions', value: `$${(revenueStats.marketplace_commissions || 0).toLocaleString()}`, growth: growth.marketplace_7d || '0%' },
                    { label: 'Ad Revenue', value: `$${(revenueStats.ad_revenue || 0).toLocaleString()}`, growth: growth.ads || '0%' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-center justify-between mt-2">
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-brand-darkText">{stat.value}</h3>
                            <span className={`text-xs font-bold ${String(stat.growth).startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{stat.growth}</span>
                        </div>
                    </div>
                ))}
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Commission & Ads</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-brand-darkBg p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                    <InputField label="Marketplace Commission %" type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="10" />
                    <InputField label="Ad Revenue (manual USD)" type="number" value={adRevenueManual} onChange={(e) => setAdRevenueManual(e.target.value)} placeholder="0" />
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleSaveCommission}
                            disabled={isOperating}
                            className="w-full bg-[#FF6D4D] text-white px-6 py-3 rounded-xl font-bold text-xs disabled:opacity-70"
                        >
                            Save Config
                        </button>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Existing Tiers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.length > 0 ? plans.map((plan) => (
                        <div key={plan.id || plan.name} className="bg-white dark:bg-brand-darkCard p-4 rounded-xl border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-brand-darkText">{plan.name}</h3>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${plan.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {plan.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">${plan.price} / {plan.interval || 'month'}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                                Storage {plan.storage_gb ?? '—'}GB · Members {plan.max_members ?? '—'} · Branches {plan.branch_limit ?? '—'}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {(plan.features || []).map((feat, j) => (
                                    <span key={j} className="text-[10px] font-bold bg-gray-50 dark:bg-brand-darkBg text-gray-500 px-2 py-1 rounded">{feat}</span>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full p-4 text-center text-sm font-bold text-gray-400 bg-gray-50 dark:bg-brand-darkBg rounded-xl border border-dashed">
                            No tiers defined yet.
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Define New Tier</h2>
                    <button
                        type="button"
                        onClick={handleDefineTier}
                        disabled={isOperating}
                        className="bg-[#FF6D4D] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-[#FF5D3D] transition-all active:scale-95 disabled:opacity-70 min-w-[120px]"
                    >
                        {isOperating ? 'Saving…' : 'Create Tier'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-brand-darkBg p-6 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                    <div className="space-y-4">
                        <InputField label="Tier ID / Name" placeholder="e.g. Enterprise Elite" value={planName} onChange={(e) => setPlanName(e.target.value)} />
                        <InputField label="Storage Allowance (GB)" placeholder="e.g. 5000" type="number" value={storage} onChange={(e) => setStorage(e.target.value)} />
                        <InputField label="Price (Monthly)" placeholder="e.g. 29.99" type="number" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                        <InputField label="Max Members per Space" placeholder="e.g. 500" type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
                        <InputField label="Branch Creation Limit" placeholder="e.g. 20" type="number" value={branchLimit} onChange={(e) => setBranchLimit(e.target.value)} />
                        <InputField label="Features (Comma Separated)" placeholder="e.g. Priority Support, Custom Domain" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Invoice History</h2>
                <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm font-medium text-gray-400">No invoices found.</td>
                                    </tr>
                                )}
                                {invoices.map((inv) => (
                                    <tr
                                        key={`${inv.source}-${inv.original_id}`}
                                        className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group cursor-pointer"
                                        onClick={() => setRefundInvoiceId(inv.id)}
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500 group-hover:text-brand-orange">{inv.id}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-brand-orange/10 text-brand-orange uppercase">{inv.source}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{inv.customer}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-brand-darkText">{inv.amount_display || `$${Number(inv.amount || 0).toFixed(2)}`}</td>
                                        <td className="px-6 py-4"><Badge>{inv.status}</Badge></td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">{inv.method}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">Refund Manager</h2>
                    <button type="button" onClick={() => navigate('/business/billing/refunds')} className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline">
                        Open full refund flow →
                    </button>
                </div>
                <div className="space-y-4">
                    <InputField label="Invoice ID" placeholder="Click a row above or paste ID" value={refundInvoiceId} onChange={(e) => setRefundInvoiceId(e.target.value)} />
                    <InputField label="Refund Reason" placeholder="Enter refund reason" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
                    <button
                        type="button"
                        onClick={handleRefund}
                        disabled={isOperating}
                        className="bg-[#FF6D4D] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-[#FF5D3D] transition-all active:scale-95 w-fit mt-2 disabled:opacity-70 min-w-[150px]"
                    >
                        {isOperating ? 'Processing…' : 'Process Refund'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Billing;
