import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import {
    Tag,
    DollarSign,
    Calendar,
    Clock,
    CheckSquare,
    FileText,
    Info,
    ArrowRight,
    Cloud,
    Download,
    Share2,
    Database
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const InputField = ({ label, placeholder, type = 'text', icon: Icon, value, onChange, prefix }) => (
    <div className="space-y-1.5 text-left mb-6">
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-brand-orange" />
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`block w-full ${Icon ? 'pl-11' : 'px-5'} py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 transition-all`}
                placeholder={placeholder}
            />
            {prefix && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{prefix}</span>
                </div>
            )}
        </div>
    </div>
);

const BillingCreatePlan = () => {
    const navigate = useNavigate();
    const { planData, updatePlanData } = useBusiness();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [storageGb, setStorageGb] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [branchLimit, setBranchLimit] = useState('');

    const features = [
        { id: 'storage', icon: Database, name: 'Cloud Storage', desc: 'Secure cloud storage for media' },
        { id: 'exports', icon: Download, name: 'Advanced Exports', desc: 'PDF, CSV, and GEDCOM support' },
        { id: 'trees', icon: Share2, name: 'Unlimited Trees', desc: 'No limit on total genealogy trees' },
        { id: 'collaborators', name: 'Collaborators', desc: 'Shared editing and governance' },
        { id: 'custom_pages', name: 'Public Pages', desc: 'Customizable family space landing pages' },
        { id: 'cloud', icon: Cloud, name: 'CDN Media', desc: 'Faster media delivery' },
    ];

    const toggleFeature = (id) => {
        const newFeatures = planData.features.includes(id)
            ? planData.features.filter((f) => f !== id)
            : [...planData.features, id];
        updatePlanData({ features: newFeatures });
    };

    const handleCreatePlan = async () => {
        if (!planData.name || !planData.price) {
            alert('Please fill in the required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const feature_flags = Object.fromEntries((planData.features || []).map((f) => [f, true]));
            const response = await fetch(`${API_BASE}/admin/business/plans`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: planData.name,
                    price: parseFloat(planData.price),
                    currency: planData.currency,
                    billingCycle: planData.cycle,
                    interval: planData.cycle === 'annual' ? 'year' : 'month',
                    trial_days: parseInt(planData.trialDays, 10) || 0,
                    features: planData.features,
                    feature_flags,
                    terms: planData.terms,
                    storage_gb: storageGb ? Number(storageGb) : null,
                    max_members: maxMembers ? Number(maxMembers) : null,
                    branch_limit: branchLimit ? Number(branchLimit) : null,
                    is_active: true
                })
            });

            if (response.ok) {
                alert('Billing Plan Created Successfully!');
                navigate('/business/billing');
            } else {
                const error = await response.json();
                alert('Failed to create plan: ' + (error.error || response.statusText));
            }
        } catch (err) {
            console.error('Failed to create plan:', err);
            alert('Failed to create plan: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-4xl mx-auto w-full pb-20">
            <header className="mb-10 text-left">
                <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Business Hub</h2>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Billing</h2>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight">Create Subscription Plan</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 sm:p-10 space-y-8">
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                                    <Tag size={20} />
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase">Plan Details</h3>
                            </div>
                            <InputField
                                label="Plan Name *"
                                placeholder="e.g. Enterprise Pro"
                                value={planData.name}
                                onChange={(e) => updatePlanData({ name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <InputField
                                    label="Regular Price *"
                                    placeholder="0.00"
                                    icon={DollarSign}
                                    type="number"
                                    value={planData.price}
                                    onChange={(e) => updatePlanData({ price: e.target.value })}
                                />
                                <div className="space-y-1.5 text-left mb-6">
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Currency</label>
                                    <select
                                        value={planData.currency}
                                        onChange={(e) => updatePlanData({ currency: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>GBP</option>
                                        <option>INR</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputField label="Storage GB" type="number" value={storageGb} onChange={(e) => setStorageGb(e.target.value)} placeholder="50" />
                                <InputField label="Max Members" type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} placeholder="500" />
                                <InputField label="Branch Limit" type="number" value={branchLimit} onChange={(e) => setBranchLimit(e.target.value)} placeholder="20" />
                            </div>
                        </section>

                        <section className="pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase">Lifecycle</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-4">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Interval</p>
                                    <div className="flex bg-gray-50 dark:bg-brand-darkBg p-1.5 rounded-2xl w-fit">
                                        {['monthly', 'annual'].map((cycle) => (
                                            <button
                                                key={cycle}
                                                type="button"
                                                onClick={() => updatePlanData({ cycle })}
                                                className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${planData.cycle === cycle ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm' : 'text-gray-400'}`}
                                            >
                                                {cycle}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <InputField
                                    label="Trial Duration"
                                    placeholder="e.g. 14"
                                    icon={Clock}
                                    type="number"
                                    prefix="Days"
                                    value={planData.trialDays}
                                    onChange={(e) => updatePlanData({ trialDays: e.target.value })}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 sm:p-10 text-left">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase">Legal & Terms</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Subscription Terms</label>
                            <textarea
                                rows={6}
                                value={planData.terms}
                                onChange={(e) => updatePlanData({ terms: e.target.value })}
                                className="w-full px-5 py-6 bg-gray-50 dark:bg-brand-darkBg border-none rounded-3xl text-sm font-bold text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 resize-none placeholder-gray-300"
                                placeholder="Include cancellation policy, refund policy, and usage limits..."
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 text-left h-fit sticky top-6">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                                <CheckSquare size={20} />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase">Feature Entitlements</h3>
                        </div>

                        <div className="space-y-3">
                            {features.map((feature) => (
                                <button
                                    key={feature.id}
                                    type="button"
                                    onClick={() => toggleFeature(feature.id)}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-start space-x-3 text-left ${planData.features.includes(feature.id) ? 'border-brand-orange bg-orange-50/50 dark:bg-brand-orange/5' : 'border-gray-50 dark:border-brand-darkBorder hover:border-gray-200'}`}
                                >
                                    <div className={`p-2 rounded-lg ${planData.features.includes(feature.id) ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-brand-darkBg text-gray-400'}`}>
                                        {feature.icon ? <feature.icon size={16} /> : <CheckSquare size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-black uppercase tracking-tight ${planData.features.includes(feature.id) ? 'text-brand-orange' : 'text-gray-400'}`}>{feature.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-0.5 leading-tight">{feature.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-gray-50 dark:bg-brand-darkBg rounded-3xl border border-gray-100 dark:border-brand-darkBorder">
                            <div className="flex items-center space-x-2 text-brand-orange mb-2">
                                <Info size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Pricing Strategy</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-relaxed">
                                Feature flags are stored on the plan and exposed via entitlements API for gating.
                            </p>
                        </div>

                        <div className="pt-8 mt-4">
                            <button
                                type="button"
                                onClick={handleCreatePlan}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-brand-orange text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/30 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center group disabled:opacity-60"
                            >
                                {isSubmitting ? 'Saving…' : <>Finalize Plan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/business/billing')}
                                className="w-full py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors mt-2"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingCreatePlan;
