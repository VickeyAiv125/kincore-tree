import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const BillingRow = ({ date, amount, status, invoice }) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors">
        <td className="py-6 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">{date}</td>
        <td className="py-6 px-4 text-sm font-bold text-gray-800 dark:text-brand-darkText">{amount}</td>
        <td className="py-6 px-4">
            <span className="bg-orange-100 dark:bg-brand-orange/10 text-brand-orange px-8 py-2 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest">
                {status}
            </span>
        </td>
        <td className="py-6 pl-4 text-sm font-extrabold text-gray-900 dark:text-brand-darkText cursor-pointer hover:underline">{invoice}</td>
    </tr>
);

const Subscription = () => {
    const [subData, setSubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isManaging, setIsManaging] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, type: '', message: '' });

    useEffect(() => {
        fetchSubscription();
    }, []);

    const getFamilyId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
    };

    const fetchSubscription = async () => {
        const familyId = getFamilyId();
        if (!familyId) return setLoading(false);
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/families/${familyId}/subscription`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubData(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscription', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (tier) => {
        const familyId = getFamilyId();
        if (!familyId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/families/${familyId}/subscription`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_tier: tier })
            });
            if (res.ok) {
                setFeedbackModal({ isOpen: true, type: 'success', message: 'Subscription tier updated successfully!' });
                setIsManaging(false);
                fetchSubscription(); // Refresh to get updated billing history and quota
            } else {
                const err = await res.json();
                setFeedbackModal({ isOpen: true, type: 'error', message: err.error || 'Failed to update subscription' });
            }
        } catch (error) {
            setFeedbackModal({ isOpen: true, type: 'error', message: 'An unexpected error occurred.' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading subscription details...</div>;

    const plans = {
        free: { name: 'Free Plan', desc: '500 MB', price: '$0.00 / mo', features: ['Basic Access', '500 MB Storage'] },
        standard: { name: 'Standard Plan', desc: '5 GB', price: '$19.99 / mo', features: ['Advanced Access', '5 GB Secure Cloud Storage', 'Priority Support'] },
        premium: { name: 'Family Premium', desc: '50 GB', price: '$49.99 / mo', features: ['Unlimited Members', '50 GB Secure Cloud Storage', 'Advanced Governance Module'] }
    };

    const currentPlan = plans[subData?.current_plan] || plans.free;

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex flex-col">
            {/* Feedback Modal */}
            {feedbackModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-brand-darkCard rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${feedbackModal.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                            {feedbackModal.type === 'success' ? (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-2">
                            {feedbackModal.type === 'success' ? 'Success!' : 'Error'}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">{feedbackModal.message}</p>
                        <button 
                            onClick={() => setFeedbackModal({ isOpen: false, type: '', message: '' })}
                            className="w-full py-3 bg-brand-orange text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <header className="mb-10 text-left">
                <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 mb-2 uppercase tracking-widest">Kinecore</h2>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-10">Subscription & Billing</h1>

                {/* Current Plan */}
                <div className="mb-10">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-6">Current Plan</h3>
                    
                    {isManaging ? (
                        <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 transition-colors">
                            <h4 className="text-lg font-extrabold mb-4 text-gray-900 dark:text-brand-darkText">Select a New Plan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {Object.entries(plans).map(([key, plan]) => (
                                    <div key={key} className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${subData?.current_plan === key ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/10' : 'border-gray-100 hover:border-gray-300 dark:border-brand-darkBorder'}`}
                                         onClick={() => handleUpdatePlan(key)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-gray-900 dark:text-brand-darkText">{plan.name}</h5>
                                            <span className="text-xs font-black text-brand-orange">{plan.price}</span>
                                        </div>
                                        <p className="text-[10px] font-black text-brand-orange uppercase mt-1">{plan.desc}</p>
                                        <ul className="mt-4 space-y-2 text-xs text-gray-500">
                                            {plan.features.map((f, i) => <li key={i}>• {f}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setIsManaging(false)} className="text-xs font-bold text-gray-400 hover:text-gray-900">Cancel</button>
                        </div>
                    ) : (
                        <div className="flex flex-col xl:flex-row gap-8 items-start">
                            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 flex-1 transition-colors">
                                <div className="flex items-center space-x-6">
                                    <div className="w-14 h-14 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">{currentPlan.name}</h4>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Active</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-start sm:items-end">
                                    <ul className="mb-4 text-xs font-bold text-gray-500 space-y-1">
                                        {currentPlan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2"><svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> {f}</li>
                                        ))}
                                    </ul>
                                    <button onClick={() => setIsManaging(true)} className="bg-gray-50 dark:bg-brand-darkBg text-gray-400 dark:text-gray-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">Manage Subscription</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Storage Quota */}
                <div className="mb-12">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText mb-6">Storage Quota</h3>
                    <div className="flex justify-between items-end mb-4 pr-2">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Total Consumption: {formatBytes(subData?.storage_used || 0)} / {formatBytes(subData?.storage_quota || 1)}
                        </p>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-brand-darkText opacity-60">
                            {subData?.usage_percentage || 0}% used
                        </p>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-brand-darkBg rounded-full overflow-hidden transition-colors">
                        <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${Math.min(subData?.usage_percentage || 0, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest">Calculated dynamically based on real file usage</p>
                </div>

                {/* Billing History */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8">Billing History</h3>
                    
                    {subData?.billing_history?.length === 0 ? (
                        <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder p-12 text-center text-gray-500 text-sm font-medium">
                            No billing history found. Subscription upgrades will appear here.
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8 transition-colors">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            <th className="pb-6 pr-4">Date</th>
                                            <th className="pb-6 px-4">Amount</th>
                                            <th className="pb-6 px-4">Status</th>
                                            <th className="pb-6 pl-4 text-brand-orange opacity-80">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subData?.billing_history?.map((log, i) => (
                                            <BillingRow 
                                                key={i} 
                                                date={new Date(log.created_at).toLocaleDateString()} 
                                                amount={log.details?.price ? `$${log.details.price}` : '$0.00'} 
                                                status="PAID"
                                                invoice={log.details?.new_tier?.toUpperCase() + ' PLAN'}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </div>
    );
};

export default Subscription;
