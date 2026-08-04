import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Search, DollarSign, Users, RotateCcw, Filter, ArrowUpRight, AlertTriangle, Store, Megaphone } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BillingView = () => {
    const [transactions, setTransactions] = useState([]);
    const [refundActivity, setRefundActivity] = useState([]);
    const [metricsData, setMetricsData] = useState({
        totalRevenue: 0,
        subscriptionRevenue: 0,
        marketplaceCommissions: 0,
        adRevenue: 0,
        anomalyRate: 0,
        anomalyCount: 0,
        pendingRefunds: 0,
        refundedCount: 0,
        invoiceCount: 0,
        currency: 'USD',
        commissionRatePercent: 0,
        growth: {}
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterScope, setFilterScope] = useState('All');
    const [filterOpen, setFilterOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/admin/auditor/billing`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Failed to load billing');

            setTransactions(data.transactions || []);
            setRefundActivity(data.refund_activity || []);
            setMetricsData({
                totalRevenue: data.metrics?.totalRevenue || 0,
                subscriptionRevenue: data.metrics?.subscriptionRevenue || 0,
                marketplaceCommissions: data.metrics?.marketplaceCommissions || 0,
                adRevenue: data.metrics?.adRevenue || 0,
                anomalyRate: Number(data.metrics?.anomalyRate) || 0,
                anomalyCount: data.metrics?.anomalyCount || 0,
                pendingRefunds: data.metrics?.pendingRefunds || 0,
                refundedCount: data.metrics?.refundedCount || 0,
                invoiceCount: data.metrics?.invoiceCount || 0,
                currency: data.metrics?.currency || 'USD',
                commissionRatePercent: data.metrics?.commissionRatePercent || 0,
                growth: data.metrics?.growth || {}
            });
        } catch (err) {
            console.error('Error fetching billing data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (transactions.length === 0) return;

        const headers = [
            'Invoice ID', 'Customer / Space', 'Amount', 'Status', 'Date',
            'Method', 'Type', 'Source', 'Provider', 'Reference', 'Anomaly', 'Anomaly Reasons', 'Refund Reason'
        ];

        const rows = transactions.map((t) => [
            t.id,
            `"${String(t.org || '').replace(/"/g, '""')}"`,
            t.amount_value ?? t.amount,
            t.status,
            t.date,
            `"${String(t.method || '').replace(/"/g, '""')}"`,
            `"${String(t.type || '').replace(/"/g, '""')}"`,
            t.source,
            t.payment_provider,
            t.ref,
            t.isAnomaly ? 'Yes' : 'No',
            `"${(t.anomalyReasons || []).join('; ').replace(/"/g, '""')}"`,
            `"${String(t.refund_reason || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_audit_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredTransactions = transactions.filter((t) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            !q
            || String(t.id || '').toLowerCase().includes(q)
            || String(t.org || '').toLowerCase().includes(q)
            || String(t.ref || '').toLowerCase().includes(q)
            || String(t.source || '').toLowerCase().includes(q);

        if (!matchesSearch) return false;

        if (filterScope === 'All') return true;
        if (filterScope === 'Anomalies') return t.isAnomaly;
        if (filterScope === 'Refunded') return t.status === 'Refunded';
        if (filterScope === 'Pending') return t.status === 'Pending';
        if (filterScope === 'Subscriptions') return t.source === 'SUBSCRIPTION';
        if (filterScope === 'Marketplace') return t.source === 'MARKETPLACE';
        if (filterScope === 'Standard') return String(t.type || '').toLowerCase().includes('standard');
        if (filterScope === 'Premium') return String(t.type || '').toLowerCase().includes('premium');
        return true;
    });

    const money = (v) =>
        `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const metrics = [
        {
            label: 'Platform Revenue',
            value: money(metricsData.totalRevenue),
            change: `7d growth ${metricsData.growth?.total_7d || '0%'}`,
            icon: DollarSign,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/10'
        },
        {
            label: 'Subscriptions',
            value: money(metricsData.subscriptionRevenue),
            change: `7d ${metricsData.growth?.subscriptions_7d || '0%'}`,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/10'
        },
        {
            label: 'Mall Commissions',
            value: money(metricsData.marketplaceCommissions),
            change: `${metricsData.commissionRatePercent || 0}% rate · 7d ${metricsData.growth?.marketplace_7d || '0%'}`,
            icon: Store,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/10'
        },
        {
            label: 'Ad Revenue',
            value: money(metricsData.adRevenue),
            change: metricsData.growth?.ads || '—',
            icon: Megaphone,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/10'
        },
        {
            label: 'Anomaly Rate',
            value: `${metricsData.anomalyRate}%`,
            change: `${metricsData.anomalyCount} flagged / ${metricsData.invoiceCount} invoices`,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/10'
        },
        {
            label: 'Pending Settlement',
            value: String(metricsData.pendingRefunds),
            change: `${metricsData.refundedCount} refunded`,
            icon: RotateCcw,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-brand-orange/10'
        }
    ];

    const filterOptions = ['All', 'Subscriptions', 'Marketplace', 'Pending', 'Refunded', 'Anomalies', 'Standard', 'Premium'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Financial</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Auditing</h2>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Financial Audit Console</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                        Live ledger · subscriptions + marketplace · {metricsData.currency}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-brand-orange transition-all shadow-sm"
                        >
                            <Filter size={14} />
                            <span>{filterScope === 'All' ? 'Filter Scope' : filterScope}</span>
                        </button>
                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-20 overflow-hidden py-2">
                                {filterOptions.map((scope) => (
                                    <button
                                        key={scope}
                                        type="button"
                                        onClick={() => { setFilterScope(scope); setFilterOpen(false); }}
                                        className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-brand-darkBg transition-colors ${
                                            filterScope === scope ? 'text-brand-orange bg-orange-50/50 dark:bg-brand-orange/10' : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {scope === 'All' ? 'All Invoices' : scope}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-orange-600 transition-all"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </header>

            {error && (
                <div className="px-5 py-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-brand-darkCard p-6 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm flex items-center justify-between group cursor-default"
                    >
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText">{m.value}</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{m.change}</span>
                        </div>
                        <div className={`p-4 ${m.bg} ${m.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                            <m.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                            <CreditCard size={20} />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase font-black">
                            Transaction Intelligence
                        </h3>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search invoice, space, source…"
                            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-brand-darkBg rounded-xl text-[10px] font-bold w-64 border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-8 pt-4 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-brand-darkBorder">
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer / Space</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type / Method</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Amount / Status</th>
                                <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Trail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        Loading Ledger...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : filteredTransactions.map((txn) => (
                                <tr
                                    key={`${txn.source}-${txn.id}-${txn.original_id}`}
                                    className={`group hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-all ${txn.isAnomaly ? 'bg-red-50/10' : ''}`}
                                >
                                    <td className="px-4 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-400">{txn.id}</span>
                                            <span className="text-[8px] font-black text-gray-300 uppercase mt-1">{txn.source}</span>
                                            {txn.isAnomaly && (
                                                <span className="text-[8px] font-black text-red-500 uppercase flex items-center mt-1">
                                                    <AlertTriangle size={8} className="mr-1" />
                                                    {(txn.anomalyReasons && txn.anomalyReasons[0]) || txn.auditReason || 'Anomaly'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{txn.org}</p>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-brand-darkText">{txn.type}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{txn.method}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">{txn.amount}</span>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                txn.status === 'Paid'
                                                    ? 'bg-green-100 text-green-600'
                                                    : txn.status === 'Refunded'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-orange-100 text-orange-600'
                                            }`}>
                                                {txn.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-right">
                                        <div className="flex flex-col items-end space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => { window.location.href = '/auditor/audit'; }}
                                                className="text-[9px] font-black text-brand-orange uppercase hover:underline flex items-center"
                                            >
                                                <span>View Logs</span>
                                                <ArrowUpRight size={10} className="ml-1" />
                                            </button>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                                                {txn.ref} • {txn.date}
                                            </p>
                                            {txn.refund_reason && (
                                                <p className="text-[8px] font-bold text-red-400 uppercase max-w-[180px] truncate" title={txn.refund_reason}>
                                                    Refund: {txn.refund_reason}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {refundActivity.length > 0 && (
                <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-brand-darkText mb-6">
                        Recent Refund Activity
                    </h3>
                    <div className="space-y-3">
                        {refundActivity.slice(0, 8).map((r) => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl"
                            >
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-brand-darkText">
                                        {r.action === 'BILLING_REFUND_ISSUED' ? 'Refund Issued' : 'Refund Rejected'}
                                        {r.source ? ` · ${r.source}` : ''}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 truncate max-w-md">
                                        {r.reason || 'No reason recorded'} · {r.target_id}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {r.amount != null && (
                                        <p className="text-sm font-black text-gray-900 dark:text-brand-darkText">{money(r.amount)}</p>
                                    )}
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                                        {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingView;
