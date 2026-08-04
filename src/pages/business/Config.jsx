import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Zap,
    PieChart,
    Bell,
    Lock,
    History,
    CheckCircle2,
    Save,
    Search,
    Sliders,
    Eye,
    Globe,
    HardDrive,
    Trash2,
    Key,
    Download,
    ChevronRight,
    ShieldAlert,
    Minus
} from 'lucide-react';
import {
    MATRIX_ROLES,
    MATRIX_ACTIONS,
    CONFIG_DEFAULTS,
    OVERAGE_RULE_OPTIONS
} from '../../constants/permissionMatrix';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NUMERIC_CONFIG_KEYS = new Set([
    'max_branches_default',
    'security_session_expiry',
    'audit_retention_days',
    'rollout_genealogy_matching',
    'rollout_kcc_microtrans',
    'storage_free_plan_gb',
    'storage_premium_plan_gb',
    'storage_upload_max_mb'
]);

const CONFIG_SECTIONS = [
    { title: 'Default Governance & Role Permissions', key: 'governance roles permissions matrix' },
    { title: 'Family Space Onboarding Rules', key: 'onboarding approval branches spaces' },
    { title: 'Global Storage & Quota Policy', key: 'storage quota free premium overage plan gb' },
    { title: 'Storage Provider Status', key: 'storage provider supabase upload limit types' },
    { title: 'Notification Policy', key: 'notification push email digest alerts' },
    { title: 'Session & Security Policy', key: 'session security expiry timeout' },
    { title: 'Audit Log Retention', key: 'audit log retention days compliance' },
    { title: 'Feature Flags & Integration Status', key: 'feature flags api keys rollout genealogy kcc integration' },
    { title: 'Data Export & Compliance', key: 'export compliance gdpr purge archive' }
];

const ConfigSection = ({ title, icon: Icon, children, sectionKey, searchQuery }) => {
    const haystack = `${title} ${sectionKey || ''}`.toLowerCase();
    if (searchQuery?.trim() && !haystack.includes(searchQuery.trim().toLowerCase())) {
        return null;
    }
    return (
    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden text-left transition-all hover:shadow-md">
        <div className="p-8 pb-4 flex items-center space-x-3">
            <div className="p-2.5 bg-orange-50 dark:bg-brand-orange/10 rounded-xl text-brand-orange">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight uppercase font-black">{title}</h3>
        </div>
        <div className="p-8 pt-4 space-y-8">
            {children}
        </div>
    </div>
    );
};

const Toggle = ({ enabled, onToggle, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
        <div className="space-y-0.5">
            <p className="text-[13px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{label}</p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{description}</p>
        </div>
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${enabled ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-brand-darkBorder'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${enabled ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

const Config = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState({ ...CONFIG_DEFAULTS });
    const [originalConfigs, setOriginalConfigs] = useState({ ...CONFIG_DEFAULTS });
    const [apiKeys, setApiKeys] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [isOperating, setIsOperating] = useState(false);
    const [operationStatus, setOperationStatus] = useState(null); // { success: boolean, message: string }
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [showMatrixModal, setShowMatrixModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyEnvironment, setNewKeyEnvironment] = useState('production');
    const [generatedKey, setGeneratedKey] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const [purgeQuery, setPurgeQuery] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const timestamp = Date.now();
            const [configRes, keysRes, dashboardRes] = await Promise.all([
                fetch(`${API_BASE}/admin/devops/configs?t=${timestamp}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store'
                }),
                fetch(`${API_BASE}/admin/devops/api-keys?t=${timestamp}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store'
                }),
                fetch(`${API_BASE}/admin/business/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store'
                })
            ]);

            const configData = await configRes.json().catch(() => []);
            const keysData = await keysRes.json().catch(() => []);
            const dashData = await dashboardRes.json().catch(() => ({}));

            const configMap = { ...CONFIG_DEFAULTS };
            (Array.isArray(configData) ? configData : []).forEach((c) => {
                let val = c.value;
                if (typeof val === 'string') {
                    try { val = JSON.parse(val); } catch (e) { /* keep string */ }
                }
                if (val === 'true' || val === true) val = true;
                else if (val === 'false' || val === false) val = false;
                configMap[c.key] = val;
            });

            setConfigs(configMap);
            setOriginalConfigs(configMap);
            handleSearchUser('');
            setApiKeys(Array.isArray(keysData) ? keysData : []);
            setDashboardStats(dashData?.stats || null);
        } catch (err) {
            console.error('Error fetching system config:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearchUser = async (val = '') => {
        if (foundUser) setFoundUser(null);
        setPurgeQuery(val);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/compliance/search?query=${encodeURIComponent(val)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            setSuggestions([]);
        }
    };

    const handleSelectUser = (user) => {
        setFoundUser(user);
        setPurgeQuery(user.email);
        setSuggestions([]);
    };

    const handlePurgeUser = async () => {
        if (!foundUser) return;
        setIsOperating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/compliance/purge/${foundUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setOperationStatus({ success: true, message: 'User Data Permanently Purged' });
                setFoundUser(null);
                setPurgeQuery('');
                setTimeout(() => setOperationStatus(null), 3000);
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Purge failed');
            }
        } catch (err) {
            setOperationStatus({ success: false, message: err.message });
        } finally {
            setIsOperating(false);
            setPendingAction(null);
        }
    };

    useEffect(() => {
        fetchData();

        // Poll dashboard stats to reflect job-storage updates
        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/admin/business/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDashboardStats(data?.stats || null);
                }
            } catch (err) {
                console.error('Background stats sync failed:', err);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [fetchData]);

    const updateValue = (key, value) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsOperating(true);
        setOperationStatus(null);
        try {
            const token = localStorage.getItem('token');
            const payload = Object.entries(configs).map(([key, value]) => {
                if (typeof value === 'boolean') return { key, value };
                if (NUMERIC_CONFIG_KEYS.has(key)) return { key, value: Number(value) || 0 };
                return { key, value: value == null ? '' : String(value) };
            });

            const res = await fetch(`${API_BASE}/admin/devops/configs/bulk`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ configs: payload })
            });

            if (!res.ok) throw new Error('Sync failed with platform controllers');
            
            setOperationStatus({ success: true, message: 'Platform Policy Synchronized Successfully' });
            setTimeout(() => setOperationStatus(null), 3000);
            fetchData();
        } catch (err) {
            setOperationStatus({ success: false, message: err.message });
        } finally {
            setIsOperating(false);
        }
    };

    const handleCreateApiKey = async () => {
        if (!newKeyName) return;
        setIsOperating(true);
        setShowNameModal(false);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/api-keys`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newKeyName, environment: newKeyEnvironment || 'production' })
            });
            const data = await res.json();
            if (res.ok) {
                setGeneratedKey(data.api_key);
                setShowKeyModal(true);
                setNewKeyName('');
                setNewKeyEnvironment('production');
                fetchData();
            } else {
                throw new Error(data.error || 'Key generation failed');
            }
        } catch (err) {
            setOperationStatus({ success: false, message: err.message });
        } finally {
            setIsOperating(false);
        }
    };

    const handleDeleteKey = async (id) => {
        setIsOperating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/devops/api-keys/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setOperationStatus({ success: true, message: 'API Key Revoked Successfully' });
                setTimeout(() => setOperationStatus(null), 3000);
                fetchData();
            }
        } catch (err) {
            setOperationStatus({ success: false, message: err.message });
        } finally {
            setIsOperating(false);
            setPendingAction(null);
        }
    };

    const isDirty = JSON.stringify(configs) !== JSON.stringify(originalConfigs);

    const hasVisibleSections = useMemo(() => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return CONFIG_SECTIONS.some((s) => `${s.title} ${s.key}`.toLowerCase().includes(q));
    }, [searchQuery]);
    
    // Calculate storage metrics
    const totalStorageGB = dashboardStats ? (parseFloat(dashboardStats.storage_agg_mb) / 1024).toFixed(2) : '0.00';
    const totalSpaces = dashboardStats?.total_spaces || 1; // Prevent division by zero
    const averageStorageMB = dashboardStats ? (parseFloat(dashboardStats.storage_agg_mb) / totalSpaces).toFixed(2) : '0.00';

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-7xl mx-auto w-full pb-32 px-4 sm:px-0">
            <header className="mb-12 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Business Hub</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Settings</h2>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-brand-darkText tracking-tight mb-2">System Configuration & Credentials</h1>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl uppercase tracking-widest">
                        Manage system infrastructure, product governance, and security policies.
                    </p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search settings..."
                        className="pl-12 pr-6 py-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-xs font-bold text-gray-900 dark:text-brand-darkText shadow-sm focus:ring-2 focus:ring-brand-orange/20 w-full sm:w-80 transition-all outline-none"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {!hasVisibleSections && (
                    <div className="lg:col-span-2 py-16 text-center rounded-[2.5rem] border border-dashed border-gray-200 dark:border-brand-darkBorder">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No settings match “{searchQuery}”</p>
                    </div>
                )}
                {/* 1. Governance & Permissions */}
                <ConfigSection title="Default Governance & Role Permissions" icon={Shield} sectionKey="governance roles permissions matrix" searchQuery={searchQuery}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Governance Defaults</label>
                            <select
                                value={configs['GOVERNANCE_MODE'] || 'admin_controlled'}
                                onChange={(e) => updateValue('GOVERNANCE_MODE', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 appearance-none"
                            >
                                <option value="open_collaborative">Open Collaborative</option>
                                <option value="admin_controlled">Admin Controlled</option>
                                <option value="council_governed">Council Governed</option>
                                <option value="locked_preservation">Locked / Preservation Mode</option>
                            </select>
                        </div>
                        <div onClick={() => setShowMatrixModal(true)} className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-orange-50 dark:hover:bg-brand-orange/10 transition-all border border-transparent hover:border-brand-orange/20">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white dark:bg-brand-darkCard rounded-xl text-brand-orange shadow-sm">
                                    <Sliders size={20} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Permissions Matrix</p>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Family role policy + Business Admin scope</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-brand-orange transition-all" />
                        </div>
                    </div>
                </ConfigSection>

                {/* 2. Family Space Onboarding */}
                <ConfigSection title="Family Space Onboarding Rules" icon={Globe} sectionKey="onboarding approval branches spaces" searchQuery={searchQuery}>
                    <div className="space-y-4">
                        <Toggle
                            label="Manual Approval Mode"
                            description="All new Family Space requests require Business Admin review"
                            enabled={Boolean(configs['MANUAL_APPROVAL_MODE'])}
                            onToggle={() => updateValue('MANUAL_APPROVAL_MODE', !configs['MANUAL_APPROVAL_MODE'])}
                        />

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Max Branches per Space (Default)</label>
                            <input
                                type="number"
                                value={configs['max_branches_default'] ?? 50}
                                onChange={(e) => updateValue('max_branches_default', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                    </div>
                </ConfigSection>

                {/* 3. Resource Quotas */}
                <ConfigSection title="Global Storage & Quota Policy" icon={PieChart} sectionKey="storage quota free premium overage plan gb" searchQuery={searchQuery}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Default Free Plan Storage (GB)</label>
                            <input
                                type="number"
                                min="1"
                                value={configs['storage_free_plan_gb'] ?? 500}
                                onChange={(e) => updateValue('storage_free_plan_gb', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Default Premium Plan Storage (GB)</label>
                            <input
                                type="number"
                                min="1"
                                value={configs['storage_premium_plan_gb'] ?? 2000}
                                onChange={(e) => updateValue('storage_premium_plan_gb', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Overage Rule</label>
                            <select
                                value={configs['storage_overage_rule'] || 'warn_restrict_upgrade'}
                                onChange={(e) => updateValue('storage_overage_rule', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20 appearance-none"
                            >
                                {OVERAGE_RULE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            Storage upgrades remain available from the Family Admin subscription page. Plan-specific overrides can still exceed these defaults.
                        </p>
                    </div>
                </ConfigSection>

                {/* 4. Storage Configuration & Status */}
                <ConfigSection title="Storage Provider Status" icon={HardDrive} sectionKey="storage provider supabase upload limit types" searchQuery={searchQuery}>
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-50 dark:border-brand-darkBorder flex items-center justify-between bg-gray-50/50 dark:bg-brand-darkBg/30">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-white dark:bg-brand-darkCard rounded-xl text-brand-orange shadow-sm border border-gray-100 dark:border-brand-darkBorder">
                                    <HardDrive size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Current Provider</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase">Supabase Storage</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Metrics */}
                        <div className="grid grid-cols-2 divide-x divide-gray-50 dark:divide-brand-darkBorder border-b border-gray-50 dark:border-brand-darkBorder">
                            <div className="p-6">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Platform Storage Used</p>
                                <div className="flex items-end space-x-2">
                                    <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText leading-none">{totalStorageGB}</p>
                                    <p className="text-sm font-bold text-gray-400 mb-0.5">GB</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Average Storage per Family Space</p>
                                <div className="flex items-end space-x-2">
                                    <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText leading-none">~{averageStorageMB}</p>
                                    <p className="text-sm font-bold text-gray-400 mb-0.5">MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Rules — editable */}
                        <div className="p-6 space-y-5 bg-gray-50/20 dark:bg-brand-darkBg/10 border-t border-gray-50 dark:border-brand-darkBorder">
                            <p className="text-[10px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Active Policies & Rules</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Upload File Size Limit (MB)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={configs['storage_upload_max_mb'] ?? 100}
                                        onChange={(e) => updateValue('storage_upload_max_mb', e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-sm font-black text-brand-orange outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Allowed File Types</label>
                                    <input
                                        type="text"
                                        value={configs['storage_allowed_types'] || CONFIG_DEFAULTS.storage_allowed_types}
                                        onChange={(e) => updateValue('storage_allowed_types', e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-xs font-black text-gray-700 dark:text-brand-darkText uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Access Rules</span>
                                    <span className="text-[10px] font-black text-gray-700 dark:text-brand-darkText uppercase tracking-widest">Mixed: Public Media / Private Reports</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ConfigSection>

                {/* 5. Notifications */}
                <ConfigSection title="Notification Policy" icon={Bell} sectionKey="notification push email digest alerts" searchQuery={searchQuery}>
                    <div className="space-y-4">
                        <Toggle
                            label="Push Notifications"
                            description="Real-time alerts for system events"
                            enabled={Boolean(configs['notification_push_enabled'])}
                            onToggle={() => updateValue('notification_push_enabled', !configs['notification_push_enabled'])}
                        />
                        <Toggle
                            label="Email Digests"
                            description="Weekly activity summaries per family space"
                            enabled={Boolean(configs['notification_email_digest'])}
                            onToggle={() => updateValue('notification_email_digest', !configs['notification_email_digest'])}
                        />
                    </div>
                </ConfigSection>

                {/* 6. Security Policies */}
                <ConfigSection title="Session & Security Policy" icon={Lock} sectionKey="session security expiry timeout" searchQuery={searchQuery}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Session Expiry (Seconds)</label>
                            <input
                                type="number"
                                value={configs['security_session_expiry'] || 3600}
                                onChange={(e) => updateValue('security_session_expiry', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border-none rounded-2xl text-sm font-black text-gray-900 dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                    </div>
                </ConfigSection>

                {/* 7. Maintenance */}
                <ConfigSection title="Audit Log Retention" icon={History} sectionKey="audit log retention days compliance" searchQuery={searchQuery}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Audit Log Retention (Days)</label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="range"
                                    min="30"
                                    max="365"
                                    step="30"
                                    value={configs['audit_retention_days'] || 90}
                                    onChange={(e) => updateValue('audit_retention_days', e.target.value)}
                                    className="flex-1 accent-brand-orange h-1.5 bg-gray-100 dark:bg-brand-darkBorder rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="w-16 text-center text-sm font-black text-brand-orange bg-orange-50 dark:bg-brand-orange/10 py-2 rounded-xl border border-orange-100 dark:border-brand-orange/10">
                                    {configs['audit_retention_days'] || 90}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/business/audit')} className="w-full p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder text-left hover:bg-gray-100 dark:hover:bg-brand-darkBg transition-all flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <Eye size={16} className="text-gray-400" />
                                <span className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">View Master Audit Log</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-orange transition-all" />
                        </button>
                    </div>
                </ConfigSection>

                {/* 8. Integrations & API Lifecycle */}
                <ConfigSection title="Feature Flags & Integration Status" icon={Zap} sectionKey="feature flags api keys rollout genealogy kcc integration" searchQuery={searchQuery}>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Active Production Keys</label>
                                <button 
                                    onClick={() => setShowNameModal(true)} 
                                    className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline"
                                >
                                    + Generate New Key
                                </button>
                            </div>
                            <div className="space-y-3">
                                {apiKeys.map((key) => (
                                    <div key={key.id} className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-white dark:bg-brand-darkCard rounded-xl shadow-sm text-gray-400">
                                                <Key size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{key.name}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                    ID: {key.prefix}... • Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => setPendingAction({ id: key.id, message: `Confirm revocation of access for "${key.name}". This cannot be undone.` })} 
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                                                title="Revoke Key"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-brand-darkBorder">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Feature Rollout Control</label>
                                <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-lg uppercase">Global Alpha</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-gray-50/50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[11px] font-black text-gray-800 dark:text-brand-darkText uppercase tracking-tight">AI Genealogy Matching</p>
                                        <span className="text-xs font-black text-brand-orange">{configs['rollout_genealogy_matching'] || 0}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={configs['rollout_genealogy_matching'] || 0}
                                        onChange={(e) => updateValue('rollout_genealogy_matching', e.target.value)}
                                        className="w-full h-1 bg-gray-200 dark:bg-brand-darkBorder rounded-lg appearance-none cursor-pointer accent-brand-orange"
                                    />
                                </div>
                                <div className="p-4 bg-gray-50/50 dark:bg-brand-darkBg/50 rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[11px] font-black text-gray-800 dark:text-brand-darkText uppercase tracking-tight">KCC Micro-Transactions</p>
                                        <span className="text-xs font-black text-brand-orange">{configs['rollout_kcc_microtrans'] || 0}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={configs['rollout_kcc_microtrans'] || 0}
                                        onChange={(e) => updateValue('rollout_kcc_microtrans', e.target.value)}
                                        className="w-full h-1 bg-gray-200 dark:bg-brand-darkBorder rounded-lg appearance-none cursor-pointer accent-brand-orange"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ConfigSection>

                {/* 9. Data & Compliance */}
                <ConfigSection title="Data Export & Compliance" icon={Globe} sectionKey="export compliance gdpr purge archive" searchQuery={searchQuery}>
                    <div className="space-y-4">
                        <button 
                            onClick={async () => {
                                try {
                                    setIsOperating(true);
                                    const token = localStorage.getItem('token');
                                    const res = await fetch(`${API_BASE}/admin/devops/export`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (!res.ok) throw new Error('Export failed');
                                    
                                    const blob = await res.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Kincore_Platform_Archive_${new Date().toISOString().split('T')[0]}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    
                                    setOperationStatus({ success: true, message: 'Platform Archive Generated & Downloaded' });
                                    setTimeout(() => setOperationStatus(null), 4000);
                                } catch (err) {
                                    setOperationStatus({ success: false, message: err.message });
                                } finally {
                                    setIsOperating(false);
                                }
                            }} 
                            className="w-full flex items-center justify-between p-5 bg-gray-900 text-white rounded-[2rem] hover:bg-black transition-all group"
                        >
                            <div className="flex items-center space-x-4">
                                <Download size={20} className="text-brand-orange" />
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest">Full Dataset Archive</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase opacity-60">Complete JSON/CSV preserving lineage</p>
                                </div>
                            </div>
                            <ChevronRight size={16} />
                        </button>
                        <div className="p-5 bg-gray-50 dark:bg-brand-darkBg rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder">
                            <div className="flex items-center space-x-2 mb-4">
                                <Trash2 size={16} className="text-red-400" />
                                <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">GDPR Data Purge</p>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-relaxed mb-4">Permanently delete user data upon verified request</p>
                            <div className="relative space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Enter user email or Forensic ID..." 
                                    value={purgeQuery}
                                    onChange={(e) => handleSearchUser(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl text-[10px] font-bold outline-none dark:text-brand-darkText focus:ring-2 focus:ring-brand-orange/20" 
                                />
                                {purgeQuery.length >= 2 && suggestions.length === 0 && !isOperating && !foundUser && (
                                    <div className="mt-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl p-6 text-center animate-in fade-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching identities found</p>
                                    </div>
                                )}
                                {suggestions.length > 0 && (
                                    <div className="mt-4 bg-gray-50/50 dark:bg-brand-darkBg/30 border border-gray-100 dark:border-brand-darkBorder rounded-2xl max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {suggestions.map((s) => (
                                            <button 
                                                key={s.id}
                                                onClick={() => handleSelectUser(s)}
                                                className="w-full px-5 py-4 text-left hover:bg-white dark:hover:bg-brand-darkCard transition-all flex items-center justify-between group border-b border-gray-100/50 dark:border-brand-darkBorder/30 last:border-0"
                                            >
                                                <div>
                                                    <p className="text-[11px] font-black text-gray-900 dark:text-brand-darkText uppercase">{s.full_name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.email}</p>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-orange" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {foundUser && (
                                <div className="mt-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Target Identified</p>
                                            <p className="text-xs font-black text-gray-900 dark:text-brand-darkText">{foundUser.full_name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{foundUser.email}</p>
                                        </div>
                                        <button 
                                            onClick={() => setPendingAction({ 
                                                type: 'purge_user', 
                                                id: foundUser.id, 
                                                message: `DANGER: You are about to permanently purge all data for ${foundUser.email}. This cannot be recovered.` 
                                            })}
                                            className="px-4 py-2 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all"
                                        >
                                            Purge Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ConfigSection>
            </div>

            {/* Sticky Actions */}
            {isDirty && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-brand-darkCard/80 backdrop-blur-xl border border-gray-100 dark:border-brand-darkBorder px-10 py-5 rounded-[2.5rem] shadow-2xl z-50 flex items-center space-x-8 min-w-[320px]">
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Unsaved Changes</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Modify and commit to apply globally</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setConfigs(originalConfigs)}
                            className="px-6 py-3 font-black text-[10px] text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Discard
                        </button>
                    <button
                        onClick={handleSave}
                        disabled={isOperating}
                        className="px-8 py-3 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all flex items-center space-x-2"
                    >
                        {isOperating ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        <span>{isOperating ? 'Syncing...' : 'Save Config'}</span>
                    </button>
                </div>
            </div>
            )}

            {/* Global Action Overlay */}
            {(isOperating || operationStatus) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard border border-white/10 p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-6">
                        {operationStatus ? (
                            <>
                                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-bounce ${operationStatus.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {operationStatus.success ? <CheckCircle2 size={40} /> : <ShieldAlert size={40} />}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">
                                        {operationStatus.success ? 'Action Complete' : 'Operation Failed'}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                                        {operationStatus.message}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setOperationStatus(null)} 
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${operationStatus.success ? 'bg-gray-900 hover:bg-black text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                >
                                    Dismiss
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-20 h-20 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight animate-pulse">Syncing Platform</h3>
                                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Applying policies to production clusters...</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Secure Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-brand-darkCard border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-xl w-full space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-500/10 text-brand-orange rounded-2xl">
                                <Key size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">API Key Generated</h3>
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Warning: Key is only shown once</p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-brand-darkBg rounded-3xl border border-gray-100 dark:border-brand-darkBorder break-all">
                            <code className="text-sm font-mono font-bold text-brand-orange select-all">
                                {generatedKey}
                            </code>
                        </div>
                        <div className="space-y-4">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedKey);
                                    setOperationStatus({ success: true, message: 'Key Copied to Clipboard' });
                                    setTimeout(() => setOperationStatus(null), 2000);
                                }}
                                className="w-full py-5 bg-brand-orange text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center space-x-3"
                            >
                                <Save size={16} />
                                <span>Copy to Clipboard</span>
                            </button>
                            <button onClick={() => setShowKeyModal(false)} className="w-full py-5 bg-gray-100 dark:bg-brand-darkBorder text-gray-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">I have saved this key</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revocation Confirmation */}
            {pendingAction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-brand-darkCard border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-6">
                        <div className="mx-auto w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                            <ShieldAlert size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Revoke Access?</h3>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                                {pendingAction.message}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setPendingAction(null)} className="py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                            <button 
                                onClick={() => {
                                    if (pendingAction.type === 'purge_user') handlePurgeUser();
                                    else handleDeleteKey(pendingAction.id);
                                }} 
                                className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
                            >
                                {pendingAction.type === 'purge_user' ? 'Purge Data' : 'Revoke Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* API Key Naming Modal */}
            {showNameModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-brand-darkCard border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-md w-full space-y-6 scale-in-center">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-500/10 text-brand-orange rounded-2xl">
                                <Key size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Key Identity</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assign a name for this credential</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="e.g. Production Mobile App" 
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 outline-none dark:text-brand-darkText"
                                autoFocus
                            />
                            <select
                                value={newKeyEnvironment}
                                onChange={(e) => setNewKeyEnvironment(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 outline-none dark:text-brand-darkText appearance-none"
                            >
                                <option value="production">Production</option>
                                <option value="staging">Staging</option>
                                <option value="testing">Testing</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button onClick={() => setShowNameModal(false)} className="py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                                <button 
                                    onClick={handleCreateApiKey} 
                                    disabled={!newKeyName}
                                    className="py-4 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Matrix Modal */}
            {showMatrixModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-8 animate-in fade-in">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] w-full max-w-5xl border border-gray-100 dark:border-brand-darkBorder shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-brand-darkBorder flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Permission Matrix</h3>
                                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Aligned with family role policy (owner → family-admin → co-admin → branch-admin → editor → member)
                                </p>
                            </div>
                            <button onClick={() => setShowMatrixModal(false)} className="p-3 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                                ✕
                            </button>
                        </div>
                        <div className="px-6 pt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex flex-wrap gap-4">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Allowed</span>
                            <span className="flex items-center gap-1"><Minus size={12} className="text-amber-500" /> Owner-delegated only</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-gray-300 inline-block" /> Not allowed</span>
                        </div>
                        <div className="overflow-auto flex-1 custom-scrollbar p-2">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white/95 dark:bg-brand-darkCard/95 backdrop-blur-sm z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-brand-darkBorder">Action</th>
                                        {MATRIX_ROLES.map((role) => (
                                            <th key={role.key} className="px-4 py-4 text-[9px] font-black text-gray-900 dark:text-brand-darkText text-center uppercase tracking-widest border-b border-gray-100 dark:border-brand-darkBorder">{role.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                    {MATRIX_ACTIONS.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-brand-darkBg/50 transition-colors">
                                            <td className="px-6 py-3 text-[11px] sm:text-xs font-black text-gray-800 dark:text-gray-300 uppercase tracking-wider">{row.action}</td>
                                            {row.perms.map((hasPerm, pIdx) => (
                                                <td key={pIdx} className="px-4 py-3 text-center">
                                                    {hasPerm === 1 ? (
                                                        <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                                                    ) : hasPerm === 0.5 ? (
                                                        <Minus size={16} className="text-amber-500 mx-auto" title="Requires Owner delegation" />
                                                    ) : (
                                                        <div className="w-2 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Config;