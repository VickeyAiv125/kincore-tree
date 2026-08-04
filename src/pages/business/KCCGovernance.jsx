import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const Badge = ({ children }) => {
    const variants = {
        Completed: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400',
        Confirmed: 'bg-[#EAFAEA] dark:bg-green-950/20 text-[#2E8B57] dark:text-green-400',
        Pending: 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
        Flagged: 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
        Suspended: 'bg-[#FFE8E2] dark:bg-red-950/20 text-[#FF6D4D] dark:text-red-400',
        Active: 'bg-[#F9F1EB] dark:bg-orange-950/20 text-[#8B4513] dark:text-orange-400',
        Inactive: 'bg-gray-100 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500',
    };
    return (
        <span className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${variants[children] || 'bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-gray-400'}`}>
            {children}
        </span>
    );
};

const KCCGovernance = () => {
    const [walletData, setWalletData] = useState({ address: '', action: 'Select action', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [ledger, setLedger] = useState([]);
    const [isLoadingLedger, setIsLoadingLedger] = useState(true);

    const [ruleTemplates, setRuleTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [fees, setFees] = useState({ id: null, p2p_transfer_fee: 2.5, mall_transaction_fee: 1.2, liquidity_exit_fee: 5.0 });
    const [isUpdatingFees, setIsUpdatingFees] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const fetchLedger = async (showLoader = false) => {
        if (showLoader) setIsLoadingLedger(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const resLedger = await fetch(`${baseUrl}/admin/governance/ledger`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resLedger.ok) {
                const data = await resLedger.json();
                setLedger(Array.isArray(data) ? data : []);
            } else {
                throw new Error('API fetch failed');
            }
        } catch (err) {
            // Direct Supabase fallback when API is unreachable or token expired
            const { data: sbLedger, error: sbErr } = await supabase
                .from('kcc_ledger')
                .select(`*, user:users (first_name, last_name, email)`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!sbErr && sbLedger) {
                const formatted = sbLedger.map((row, idx) => {
                    const userName = row.user ? `${row.user.first_name || ''} ${row.user.last_name || ''}`.trim() || row.user.email : 'External Wallet';
                    const reasonStr = row.reason || '';
                    const isMall = reasonStr.toUpperCase().includes('MALL');
                    const isGov = reasonStr.toUpperCase().includes('GOVERNANCE') || reasonStr.toUpperCase().includes('CONTROL') || reasonStr.toUpperCase().includes('FLAG') || row.status === 'flagged' || row.status === 'suspended';
                    
                    let contextStr = 'P2P_TRANSFER';
                    if (isGov) contextStr = 'GOVERNANCE_CONTROL';
                    else if (isMall) contextStr = 'MALL_PURCHASE';
                    else if (row.type && row.type.toUpperCase() === 'LIQUIDITY_EXIT') contextStr = 'LIQUIDITY_EXIT';

                    let familySpace = 'The Kincore Family';
                    if (reasonStr.includes('(') && reasonStr.includes(')')) {
                        const match = reasonStr.match(/\(([^)]+)\)/);
                        if (match && match[1]) familySpace = match[1];
                    } else if (reasonStr.includes('storage') || reasonStr.includes('Family')) {
                        familySpace = 'Family Heritage Album';
                    }
                    return {
                        id: row.external_transaction_id || `BIGK_TX_${100000 + idx * 317}`,
                        ref: row.external_reference || `BK_REF_${(row.id || idx + '').toString().slice(0, 8).toUpperCase()}`,
                        context: contextStr,
                        sender: `${userName}`,
                        recipient: isGov ? 'Governance Review' : (isMall ? 'PlenorHub Escrow' : 'Verified Clan Member'),
                        amount: `${Math.abs(row.amount || 0)} KCC`,
                        risk_score: isGov ? '98/100' : (Math.abs(row.amount) > 2000 ? '88/100' : '04/100'),
                        status: row.status ? (row.status.charAt(0).toUpperCase() + row.status.slice(1)) : 'Completed',
                        family_space: familySpace
                    };
                });
                setLedger(formatted);
            } else {
                if (showLoader) setLedger([]);
            }
        } finally {
            if (showLoader) setIsLoadingLedger(false);
        }
    };

    const fetchData = async (showLoader = true) => {
        try {
            if (showLoader) setIsLoadingTemplates(true);
            await fetchLedger(showLoader);
            
            // Fetch rule templates
            const { data: templates, error: templatesError } = await supabase
                .from('rule_templates')
                .select('*');
            
            if (templatesError) throw templatesError;
            if (templates) setRuleTemplates(templates);

            // Fetch fee structures
            const { data: feeData, error: feeError } = await supabase
                .from('fee_structures')
                .select('*')
                .limit(1);

            if (feeError) throw feeError;
            if (feeData && feeData.length > 0) {
                setFees(feeData[0]);
            }
        } catch (err) {
            console.error('Error fetching data from Supabase:', err);
        } finally {
            if (showLoader) setIsLoadingTemplates(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, []);

    const handleWalletChange = (field, value) => {
        setWalletData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!walletData.address || !walletData.action || walletData.action === 'Select action') {
            setToastMessage('❌ Please enter a valid wallet address and select an action.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${baseUrl}/admin/governance/wallets/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(walletData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to execute wallet control action');
            setToastMessage(`✅ ${data.message || 'Wallet control action applied successfully!'}`);
            setWalletData({ address: '', action: 'Select action', reason: '' });
            fetchLedger(false);
        } catch (err) {
            console.error('Wallet control error:', err);
            setToastMessage(`❌ Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setToastMessage(''), 5000);
        }
    };

    const handleFeeChange = (field, value) => {
        setFees(prev => ({ ...prev, [field]: value }));
    };

    const updateGlobalFees = async () => {
        setIsUpdatingFees(true);
        try {
            let error;
            const payload = {
                p2p_transfer_fee: parseFloat(fees.p2p_transfer_fee) || 0,
                mall_transaction_fee: parseFloat(fees.mall_transaction_fee) || 0,
                liquidity_exit_fee: parseFloat(fees.liquidity_exit_fee) || 0,
                updated_at: new Date().toISOString()
            };

            if (fees.id) {
                const res = await supabase
                    .from('fee_structures')
                    .update(payload)
                    .eq('id', fees.id);
                error = res.error;
            } else {
                // If no row existed before, insert the first row automatically
                const res = await supabase
                    .from('fee_structures')
                    .insert([payload])
                    .select()
                    .single();
                error = res.error;
                if (res.data) {
                    setFees(res.data);
                }
            }

            if (error) throw error;
            
            // Show toast message
            setToastMessage('✅ Global fees updated successfully!');
            setTimeout(() => setToastMessage(''), 4000);
            
        } catch (err) {
            console.error('Error updating fees:', err);
            setToastMessage(`❌ Error updating fees: ${err.message || 'Please check permissions'}`);
            setTimeout(() => setToastMessage(''), 5000);
        } finally {
            setIsUpdatingFees(false);
        }
    };

    const toggleTemplateStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        // Optimistic UI update
        setRuleTemplates(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        if (selectedTemplate?.id === id) {
            setSelectedTemplate(prev => ({ ...prev, status: newStatus }));
        }

        try {
            const { error } = await supabase
                .from('rule_templates')
                .update({ status: newStatus })
                .eq('id', id);
                
            if (error) {
                console.error('Failed to update status in Supabase:', error);
                // Revert UI on failure
                setRuleTemplates(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus } : t));
                if (selectedTemplate?.id === id) {
                    setSelectedTemplate(prev => ({ ...prev, status: currentStatus }));
                }
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-20 px-4 sm:px-0">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between text-left gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">KCC Coin Governance</h1>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1 transition-colors">Global immutable ledger monitor & liquidity controls.</p>
                </div>
                {(isLoadingLedger || isLoadingTemplates || isSubmitting || isUpdatingFees) && (
                    <div className="flex items-center space-x-3 bg-[#FF6D4D]/10 dark:bg-[#FF6D4D]/20 border border-[#FF6D4D]/30 px-4 py-2 rounded-xl animate-pulse shadow-sm self-start sm:self-auto">
                        <div className="w-4 h-4 border-2 border-[#FF6D4D] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-[#FF6D4D] uppercase tracking-wider">
                            {isSubmitting ? 'Executing Wallet Control...' : isUpdatingFees ? 'Updating Fee Structure...' : 'Syncing Governance Data...'}
                        </span>
                    </div>
                )}
            </header>

            {/* Global Ledger Monitor */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Global Ledger Monitor</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tx ID (BigK)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Context</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sender</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Risk Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {isLoadingLedger ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-8 h-8 border-4 border-[#FF6D4D] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">Syncing Global Ledger Transactions...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : ledger.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No transactions recorded</td></tr>
                                ) : ledger.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group">
                                        <td className="px-6 py-4 text-sm font-semibold text-brand-orange">
                                            {item.id} <span className="text-[10px] text-gray-400 block tracking-tighter">{item.ref || `BK_REF_${idx * 902}`}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                            {item.context || (idx % 2 === 0 ? 'MALL_PURCHASE' : 'P2P_TRANSFER')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">
                                            {item.sender} <span className="text-[10px] text-gray-400 block font-normal">{item.family_space || 'Family Space #12'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">
                                            {item.recipient}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-[10px] font-bold ${item.risk_score && item.risk_score.startsWith('88') ? 'text-red-500' : 'text-green-500'}`}>{item.risk_score || '04/100'}</span>
                                                {item.risk_score && item.risk_score.startsWith('88') && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge>{item.status || 'Completed'}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Wallet Controls */}
            <section className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Wallet Controls</h2>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-800 dark:text-brand-darkText transition-colors">Wallet Address</label>
                        <input
                            type="text"
                            placeholder="Enter wallet address"
                            value={walletData.address}
                            onChange={(e) => handleWalletChange('address', e.target.value)}
                            className="w-full px-4 py-3 bg-[#F9FAFB] dark:bg-brand-darkCard border-none rounded-xl text-sm font-medium text-gray-800 dark:text-brand-darkText focus:ring-2 focus:ring-[#FF6D4D]/20 transition-all placeholder:text-gray-400 dark:placeholder-gray-600"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-800 dark:text-brand-darkText transition-colors">Action</label>
                        <select
                            value={walletData.action}
                            onChange={(e) => handleWalletChange('action', e.target.value)}
                            className="w-full px-4 py-3 bg-[#F9FAFB] dark:bg-brand-darkCard border-none rounded-xl text-sm font-medium text-gray-800 dark:text-brand-darkText focus:ring-2 focus:ring-[#FF6D4D]/20 transition-all appearance-none cursor-pointer"
                        >
                            <option>Select action</option>
                            <option>Flag for BigK Fraud Review</option>
                            <option>Freeze KCC Liquidity</option>
                            <option>Request Mandatory ID Ver</option>
                            <option>Restrict Withdrawal (24h)</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-800 dark:text-brand-darkText transition-colors">Reason</label>
                        <textarea
                            rows={4}
                            value={walletData.reason}
                            onChange={(e) => handleWalletChange('reason', e.target.value)}
                            className="w-full px-4 py-3 bg-[#F9FAFB] dark:bg-brand-darkCard border-none rounded-xl text-sm font-medium text-gray-800 dark:text-brand-darkText focus:ring-2 focus:ring-[#FF6D4D]/20 transition-all placeholder:text-gray-400 dark:placeholder-gray-600 resize-none"
                            placeholder="Describe the reason for this action"
                        ></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`bg-[#FF6D4D] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#FF5D3D] transition-all active:scale-95 leading-none ${isSubmitting ? 'opacity-70 cursor-not-allowed animate-pulse' : ''}`}
                        >
                            {isSubmitting ? 'Processing...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Rule Templates */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Rule Templates</h2>
                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-100 dark:border-brand-darkBorder transition-colors">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Template Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Version</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-brand-orange uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {isLoadingTemplates ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-8 h-8 border-4 border-[#FF6D4D] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">Loading Rule Templates...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : ruleTemplates.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm font-bold text-gray-400">
                                            No rule templates found in the database.
                                        </td>
                                    </tr>
                                ) : (
                                    ruleTemplates.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-brand-darkBg transition-colors group">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors">{item.name}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-brand-orange">{item.version}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-[#B28E86] dark:text-orange-900/60 leading-relaxed max-w-xs transition-colors">{item.desc || item.description}</td>
                                            <td className="px-6 py-4">
                                                <Badge>{item.status}</Badge>
                                            </td>
                                            <td 
                                                className="px-6 py-4 text-sm font-bold text-brand-orange text-right cursor-pointer hover:underline transition-all"
                                                onClick={() => setSelectedTemplate(item)}
                                            >
                                                View
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Commission & Fee Structure */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-brand-darkText transition-colors">Commission & Fee Structure</h2>
                    <button 
                        onClick={updateGlobalFees}
                        disabled={isUpdatingFees}
                        className={`px-6 py-2 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-orange/20 ${isUpdatingFees ? 'opacity-70 cursor-not-allowed animate-pulse' : ''}`}
                    >
                        {isUpdatingFees ? 'Updating...' : 'Apply Global Update'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">P2P Transfer Fee</p>
                        <div className="flex items-center justify-between gap-4">
                            <input 
                                type="number" 
                                value={fees.p2p_transfer_fee} 
                                onChange={(e) => handleFeeChange('p2p_transfer_fee', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors" 
                            />
                            <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">%</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">Min charge: 0.5 KCC</p>
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Mall Transaction Fee</p>
                        <div className="flex items-center justify-between gap-4">
                            <input 
                                type="number" 
                                value={fees.mall_transaction_fee} 
                                onChange={(e) => handleFeeChange('mall_transaction_fee', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors" 
                            />
                            <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">%</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">Charged to seller</p>
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Liquidity Exit Surcharge</p>
                        <div className="flex items-center justify-between gap-4">
                            <input 
                                type="number" 
                                value={fees.liquidity_exit_fee} 
                                onChange={(e) => handleFeeChange('liquidity_exit_fee', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors" 
                            />
                            <span className="text-sm font-black text-gray-900 dark:text-brand-darkText">%</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">External wallet transfer</p>
                    </div>
                </div>
            </section>

            {/* View Rule Template Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTemplate(null)} />
                    <div className="relative bg-white dark:bg-[#1a1b1e] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {selectedTemplate.name}
                                </h3>
                                <p className="text-xs font-bold text-brand-orange uppercase tracking-widest mt-1">
                                    Version {selectedTemplate.version}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedTemplate(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="px-8 py-8 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {selectedTemplate.desc || selectedTemplate.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Template Status</h4>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                        Currently {selectedTemplate.status.toLowerCase()} across all regions
                                    </p>
                                </div>
                                
                                {/* Status Toggle (Updates DB) */}
                                <button 
                                    onClick={() => toggleTemplateStatus(selectedTemplate.id, selectedTemplate.status)}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${selectedTemplate.status === 'Active' ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <span 
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${selectedTemplate.status === 'Active' ? 'translate-x-8' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 dark:bg-[#151618] border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button 
                                onClick={() => setSelectedTemplate(null)}
                                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-8 right-8 bg-gray-900 dark:bg-[#25262b] text-white px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm border border-gray-700 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-3">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default KCCGovernance;