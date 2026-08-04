import React, { useState, useEffect, useCallback } from 'react';
import { resolveFamilySpaceId } from '../../utils/familySpace';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const formatKcc = (value) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return '0';
    return numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const TransactionRow = ({ date, txid, user_name, amount, type, source }) => {
    const signed = Number(amount || 0);
    const isCredit = type === 'Credit' || signed > 0;
    return (
        <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors group hover:bg-orange-50/30 dark:hover:bg-brand-orange/5">
            <td className="py-6 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {date ? new Date(date).toLocaleDateString() : '—'}
            </td>
            <td className="py-6 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 font-mono tracking-tighter">
                {txid ? `${String(txid).substring(0, 10)}…` : '—'}
            </td>
            <td className="py-6 px-4">
                <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-brand-darkBg overflow-hidden border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user_name || 'System')}&background=random`}
                            alt=""
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-brand-darkText">
                        {user_name || 'System'}
                    </span>
                </div>
            </td>
            <td className="py-6 px-4">
                <p className="text-xs font-bold text-gray-700 dark:text-brand-darkText text-left">
                    {source || 'Family Activity'}
                </p>
            </td>
            <td className={`py-6 px-4 text-sm font-black text-right ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isCredit && signed > 0 ? '+' : ''}{formatKcc(signed)} KCC
            </td>
            <td className="py-6 px-4 text-right">
                <span className={`inline-block px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isCredit ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500'}`}>
                    {isCredit ? 'Credit' : 'Debit'}
                </span>
            </td>
        </tr>
    );
};

const KCCCoin = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [netBalance, setNetBalance] = useState(0);
    const [credits, setCredits] = useState(0);
    const [debits, setDebits] = useState(0);
    const [attribution, setAttribution] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const familyId = await resolveFamilySpaceId();
            if (!familyId) {
                setError('No family space found for this account. Re-login after joining a family.');
                setTransactions([]);
                return;
            }

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/family-admin/${familyId}/kcc-ledger`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            const ledgerData = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(ledgerData.error || 'Failed to load family KCC ledger');
            }

            const txList = ledgerData.transactions || [];
            setNetBalance(Number(ledgerData.net_balance ?? ledgerData.total_coins ?? 0));
            setCredits(Number(ledgerData.total_credits || 0));
            setDebits(Number(ledgerData.total_debits || 0));
            setAttribution(ledgerData.attribution || '');

            const normalized = txList.map((tx) => {
                const amount = parseFloat(tx.amount || 0);
                const typeHint = String(tx.type || tx.transaction_type || '').toLowerCase();
                const isDebit =
                    amount < 0
                    || ['spend', 'debit', 'transfer_out', 'withdraw', 'burn'].includes(typeHint)
                    || tx.direction === 'debit';
                return {
                    id: tx.id,
                    date: tx.created_at || tx.timestamp,
                    txid: tx.external_transaction_id || tx.external_reference || tx.reference || tx.id,
                    user_name: tx.user
                        ? `${tx.user.first_name || ''} ${tx.user.last_name || ''}`.trim() || tx.user.email
                        : (tx.wallet?.handle || tx.source_wallet?.handle || 'Member'),
                    amount,
                    type: isDebit ? 'Debit' : 'Credit',
                    source: tx.reason || tx.transaction_type || tx.type || tx.source || 'Family Activity'
                };
            });

            setTransactions(normalized);
        } catch (err) {
            console.error('KCC Ledger fetch error:', err);
            setError(err.message || 'Failed to load ledger data.');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-3 leading-tight">
                    KCC Coin Ledger
                </h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
                    Family-scoped coin activity from the local KCC ledger mirror.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-orange-50 dark:bg-brand-orange/10 rounded-3xl p-6 transition-colors">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                            Net Family Balance
                        </p>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText leading-none">
                            {loading ? '…' : `${formatKcc(netBalance)} KCC`}
                        </h2>
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Credits</p>
                        <p className="text-2xl font-black text-emerald-500">{loading ? '…' : `+${formatKcc(credits)}`}</p>
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Debits</p>
                        <p className="text-2xl font-black text-rose-500">{loading ? '…' : `−${formatKcc(debits)}`}</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText">
                            Immutable Ledger
                        </h3>
                        {attribution && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Scope: {attribution.replace(/_/g, ' ')}
                            </span>
                        )}
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8 transition-colors">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                    Loading ledger…
                                </p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center">
                                <p className="text-red-500 font-bold text-sm mb-1">{error}</p>
                                <p className="text-gray-400 text-xs mb-4">
                                    Family ledger uses the local KCC mirror for this family space.
                                </p>
                                <button
                                    onClick={fetchData}
                                    className="text-brand-orange font-bold underline text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            <th className="pb-6 px-4 text-left">Date</th>
                                            <th className="pb-6 px-4 text-left">Transaction ID</th>
                                            <th className="pb-6 px-4 text-left">User</th>
                                            <th className="pb-6 px-4 text-left">Source / Activity</th>
                                            <th className="pb-6 px-4 text-right">Amount</th>
                                            <th className="pb-6 px-4 text-right">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder/30">
                                        {transactions.map((t, i) => (
                                            <TransactionRow
                                                key={t.id || i}
                                                txid={t.txid}
                                                user_name={t.user_name}
                                                source={t.source}
                                                amount={t.amount}
                                                date={t.date}
                                                type={t.type}
                                            />
                                        ))}
                                        {transactions.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
                                                >
                                                    No transactions recorded for this family yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default KCCCoin;
