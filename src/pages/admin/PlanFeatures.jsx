import React, { useState } from 'react';

const FeatureItem = ({ icon, title, description, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-6 border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors">
        <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText">{title}</h4>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">{description}</p>
            </div>
        </div>
        <div
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 ${enabled ? 'bg-brand-orange' : 'bg-gray-100 dark:bg-brand-darkBg'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white dark:bg-brand-darkText shadow-sm transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    </div>
);

const QuotaItem = ({ icon, title, description, value, unit }) => (
    <div className="flex flex-col py-6 border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText">{title}</h4>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">{description}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{value} <span className="text-xs">{unit}</span></span>
            </div>
        </div>
        <button className="bg-orange-50 dark:bg-brand-orange/10 text-brand-orange px-6 py-2 rounded-xl text-xs font-extrabold self-start hover:bg-orange-100 dark:hover:bg-brand-orange/20 transition-colors">
            Request Increase
        </button>
    </div>
);

const PlanFeatures = () => {
    const [features, setFeatures] = useState({
        'K-Mall': true,
        'KCC Coin': false,
    });

    return (
        <div className="flex flex-col max-w-4xl text-left">
            <nav className="flex flex-wrap items-center gap-y-2 gap-x-2 text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-widest transition-colors">
                <span className="whitespace-nowrap">Subscriptions</span>
                <span>/</span>
                <span className="whitespace-nowrap">Subscription Details</span>
                <span>/</span>
                <span className="text-gray-900 dark:text-brand-darkText whitespace-nowrap">Plan Features & Quotas</span>
            </nav>

            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-4 leading-tight">Plan Features & Quotas</h1>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Manage the features and quotas associated with this subscription plan.</p>
            </header>

            <section className="mb-12">
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 border-b-2 border-brand-orange inline-block pb-1">Active Features</h3>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5 sm:p-8 transition-colors">
                    <FeatureItem
                        title="K-Mall"
                        description="Access to the K-Mall marketplace"
                        enabled={features['K-Mall']}
                        onToggle={() => setFeatures(f => ({ ...f, 'K-Mall': !f['K-Mall'] }))}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                    />
                    <FeatureItem
                        title="KCC Coin"
                        description="Access to KCC Coin transactions"
                        enabled={features['KCC Coin']}
                        onToggle={() => setFeatures(f => ({ ...f, 'KCC Coin': !f['KCC Coin'] }))}
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1V8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 8V7m0 1v1m-3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>}
                    />
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-brand-darkText mb-8 border-b-2 border-brand-orange inline-block pb-1">Quotas</h3>
                <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5 sm:p-8 transition-colors">
                    <QuotaItem
                        title="Storage Limit"
                        description="Current storage limit for the plan"
                        value="500"
                        unit="GB"
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                    />
                    <QuotaItem
                        title="Member Limit"
                        description="Current member limit for the plan"
                        value="10"
                        unit=""
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    />
                </div>
            </section>
        </div>
    );
};

export default PlanFeatures;
