import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings2,
    Save,
    Info,
    History,
    Globe,
    AlertTriangle,
    Cpu,
    Network,
    Bell,
    Shield,
    Key,
    Mail,
    Webhook
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ENV_TABS = [
    { label: 'Production', value: 'production' },
    { label: 'Staging', value: 'staging' },
    { label: 'Testing', value: 'testing' }
];

const QUEUE_OPTIONS = ['Supabase Postgres', 'Redis Streams', 'In-Memory (dev)'];

const ConfigGroup = ({ title, icon: Icon, badge, badgeTone = 'yellow', children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden text-left mb-6 hover:scale-[1.01] transition-all">
        <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-brand-orange/10 rounded-2xl text-brand-orange">
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{title}</h3>
            </div>
            {badge && (
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                    badgeTone === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : badgeTone === 'blue'
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                }`}>
                    {badge}
                </span>
            )}
        </div>
        <div className="p-8 pt-4 space-y-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, tooltip, disabled }) => (
    <div className="space-y-2 group">
        <label className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
            <span>{label}</span>
            {tooltip && <Info size={12} className="text-gray-300 group-hover:text-blue-500 cursor-help transition-colors" />}
        </label>
        <input
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange && !disabled && onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg border border-transparent focus:border-brand-orange/30 rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
    </div>
);

const ToggleRow = ({ label, enabled, onToggle, disabled }) => (
    <div className={`flex items-center justify-between pt-2 ${disabled ? 'opacity-50' : ''}`}>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <button
            type="button"
            disabled={disabled}
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${enabled ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-gray-700'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
    </div>
);

const defaultChannelState = () => ({
    slack: { is_active: false, config: { webhook_url: '', channel_name: '#alerts' } },
    email: { is_active: false, config: { recipients: '' } },
    webhook: { is_active: false, config: { url: '' } }
});

const SystemConfig = () => {
    const [selectedEnv, setSelectedEnv] = useState('testing');
    const [runtimeEnv, setRuntimeEnv] = useState('testing');
    const [showConfirm, setShowConfirm] = useState(false);
    const [changeReason, setChangeReason] = useState('');
    const [configs, setConfigs] = useState([]);
    const [history, setHistory] = useState([]);
    const [apiKeys, setApiKeys] = useState([]);
    const [channels, setChannels] = useState(defaultChannelState());
    const [channelDraft, setChannelDraft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState({ status: 'idle', message: '' });
    const [channelStatus, setChannelStatus] = useState('');

    const authHeaders = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    };

    const fetchConfigs = useCallback(async (env = selectedEnv) => {
        try {
            const res = await fetch(`${API_BASE}/admin/devops/configs?environment=${env}`, {
                headers: authHeaders()
            });
            const data = await res.json();
            if (res.ok) {
                setConfigs(Array.isArray(data) ? data : (data.configs || []));
                if (data.runtime_environment) setRuntimeEnv(data.runtime_environment);
            }
        } catch (err) {
            console.error('Failed to fetch configs:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedEnv]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/devops/configs/history`, {
                headers: authHeaders()
            });
            if (res.ok) setHistory(await res.json());
        } catch (e) {
            console.error('Failed to fetch config history:', e);
        }
    };

    const fetchApiKeys = async (env = selectedEnv) => {
        try {
            const res = await fetch(`${API_BASE}/admin/devops/api-keys?environment=${env}`, {
                headers: authHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setApiKeys(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Failed to fetch API keys:', e);
        }
    };

    const fetchChannels = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/devops/alerts/channels`, {
                headers: authHeaders()
            });
            if (!res.ok) return;
            const data = await res.json();
            const next = defaultChannelState();
            for (const row of data.channels || []) {
                const key = String(row.channel || '').toLowerCase();
                if (!next[key]) continue;
                next[key] = {
                    is_active: row.is_active !== false,
                    config: {
                        ...next[key].config,
                        ...(row.config || {})
                    }
                };
            }
            setChannels(next);
        } catch (e) {
            console.error('Failed to fetch alert channels:', e);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchConfigs(selectedEnv);
        fetchApiKeys(selectedEnv);
        fetchHistory();
        fetchChannels();
    }, [selectedEnv, fetchConfigs]);

    const handleConfigChange = (key, value) => {
        setConfigs((prev) => {
            const exists = prev.find((c) => c.key === key);
            if (exists) return prev.map((c) => (c.key === key ? { ...c, value } : c));
            return [...prev, { key, value }];
        });
    };

    const getConfigValue = (key, fallback = '') => {
        const config = configs.find((c) => c.key === key);
        if (!config) return fallback;
        let val = config.value;
        if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        return val ?? fallback;
    };

    const handleSave = async () => {
        if (!changeReason.trim()) {
            setSaveStatus({ status: 'error', message: 'Change reason is required.' });
            return;
        }
        setSaveStatus({ status: 'loading', message: 'Saving...' });
        try {
            const runtimeKeys = [
                'max_connections', 'api_timeout', 'maintenance_mode', 'global_rate_limit',
                'max_concurrent_jobs', 'poll_interval_seconds', 'load_alert_threshold',
                'enforce_mfa', 'queue_strategy', 'waf_status', 'encryption_level'
            ];
            const updates = configs.filter((c) => runtimeKeys.includes(c.key));
            const res = await fetch(`${API_BASE}/admin/devops/configs/bulk`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({
                    updates,
                    environment: selectedEnv,
                    reason: changeReason.trim()
                })
            });
            const body = await res.json().catch(() => ({}));
            if (res.ok) {
                setShowConfirm(false);
                setChangeReason('');
                const liveNote = body.applied_live
                    ? 'Applied live on this node.'
                    : `Saved for ${selectedEnv} (runtime is ${runtimeEnv}).`;
                setSaveStatus({ status: 'success', message: liveNote });
                fetchConfigs(selectedEnv);
                fetchHistory();
                setTimeout(() => setSaveStatus({ status: 'idle', message: '' }), 4000);
            } else {
                setSaveStatus({ status: 'error', message: body.error || 'Failed to save configuration.' });
            }
        } catch (err) {
            console.error('Failed to save configs:', err);
            setSaveStatus({ status: 'error', message: 'Network error occurred.' });
        }
    };

    const saveChannel = async (channelKey) => {
        const row = channels[channelKey];
        setChannelStatus('Saving…');
        try {
            const res = await fetch(`${API_BASE}/admin/devops/alerts/channels`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    channel: channelKey,
                    config: row.config,
                    is_active: row.is_active
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save channel');
            setChannelStatus(data.message || 'Channel saved');
            setChannelDraft(null);
            fetchChannels();
            setTimeout(() => setChannelStatus(''), 3000);
        } catch (err) {
            setChannelStatus(err.message);
        }
    };

    const channelIcon = (key) => {
        if (key === 'email') return Mail;
        if (key === 'webhook') return Webhook;
        return Globe;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20 text-left">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Global</h2>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Parameters</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText tracking-tight italic">Modify System Config</h1>
                        {saveStatus.status === 'success' && (
                            <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest rounded-xl">
                                {saveStatus.message}
                            </span>
                        )}
                        {saveStatus.status === 'error' && (
                            <span className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl">
                                {saveStatus.message}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Editing <span className="text-brand-orange">{selectedEnv}</span>
                        {' · '}
                        Runtime node: <span className="text-gray-600 dark:text-gray-300">{runtimeEnv}</span>
                        {selectedEnv !== runtimeEnv && ' · save will not apply live until this node runs that env'}
                    </p>
                </div>

                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-brand-darkBg p-2 rounded-2xl">
                    {ENV_TABS.map((env) => (
                        <button
                            key={env.value}
                            type="button"
                            onClick={() => setSelectedEnv(env.value)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedEnv === env.value
                                    ? 'bg-white dark:bg-brand-darkCard text-brand-orange shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {env.label}
                            {runtimeEnv === env.value ? ' ●' : ''}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="py-40 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Synchronizing Cluster Parameters...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <ConfigGroup title="Load Balancer" icon={Network}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Max Concurrent Conn" type="number" value={getConfigValue('max_connections', '5000')} onChange={(v) => handleConfigChange('max_connections', v)} tooltip="Impacts memory usage per node" />
                                <InputField label="API Timeout (ms)" type="number" value={getConfigValue('api_timeout', '30000')} onChange={(v) => handleConfigChange('api_timeout', v)} tooltip="Too high increases queue backlog" />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Maintenance Mode</label>
                                    <div className="w-full px-5 py-[14px] bg-gray-50 dark:bg-brand-darkBg rounded-2xl flex items-center justify-between h-[52px]">
                                        <span className="text-sm font-bold text-gray-900 dark:text-brand-darkText">
                                            {String(getConfigValue('maintenance_mode', '0')) === '1' ? 'Active' : 'Disabled'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleConfigChange('maintenance_mode', String(getConfigValue('maintenance_mode', '0')) === '1' ? '0' : '1')}
                                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${
                                                String(getConfigValue('maintenance_mode', '0')) === '1' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                                String(getConfigValue('maintenance_mode', '0')) === '1' ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                                <InputField label="Rate Limit (RPM)" type="number" value={getConfigValue('global_rate_limit', '1000')} onChange={(v) => handleConfigChange('global_rate_limit', v)} />
                            </div>
                        </ConfigGroup>

                        <ConfigGroup title="Worker Scaling" icon={Cpu}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Max Concurrent Jobs" type="number" value={getConfigValue('max_concurrent_jobs', '1')} onChange={(v) => handleConfigChange('max_concurrent_jobs', v)} />
                                <InputField label="Poll Interval (Seconds)" type="number" value={getConfigValue('poll_interval_seconds', '60')} onChange={(v) => handleConfigChange('poll_interval_seconds', v)} />
                                <InputField label="Load Alert Threshold (%)" type="number" value={getConfigValue('load_alert_threshold', '75')} onChange={(v) => handleConfigChange('load_alert_threshold', v)} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Queue Strategy</label>
                                    <select
                                        value={getConfigValue('queue_strategy', 'Supabase Postgres')}
                                        onChange={(e) => handleConfigChange('queue_strategy', e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none"
                                    >
                                        {QUEUE_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </ConfigGroup>

                        <ConfigGroup title="Security & Compliance" icon={Shield} badge="Policy Flags" badgeTone="blue">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="WAF Status"
                                    value={getConfigValue('waf_status', 'ACTIVE')}
                                    onChange={(v) => handleConfigChange('waf_status', v)}
                                    tooltip="Informational — edge WAF is managed externally"
                                />
                                <InputField
                                    label="Encryption Level"
                                    value={getConfigValue('encryption_level', 'AES-256-GCM')}
                                    onChange={(v) => handleConfigChange('encryption_level', v)}
                                    tooltip="Informational — database encryption baseline"
                                />
                                <ToggleRow
                                    label="Enforce MFA (admin sessions)"
                                    enabled={String(getConfigValue('enforce_mfa', '0')) === '1'}
                                    onToggle={() => handleConfigChange('enforce_mfa', String(getConfigValue('enforce_mfa', '0')) === '1' ? '0' : '1')}
                                />
                            </div>
                        </ConfigGroup>

                        <ConfigGroup title="Notification Channels" icon={Bell} badge={channelStatus || undefined} badgeTone="emerald">
                            <div className="space-y-4">
                                {Object.entries(channels).map(([key, row]) => {
                                    const Icon = channelIcon(key);
                                    const editing = channelDraft === key;
                                    return (
                                        <div key={key} className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                                                        <Icon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{key}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                            {row.is_active ? 'Active' : 'Inactive'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setChannels((prev) => ({
                                                            ...prev,
                                                            [key]: { ...prev[key], is_active: !prev[key].is_active }
                                                        }))}
                                                        className={`w-12 h-6 rounded-full relative transition-colors ${row.is_active ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-gray-700'}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${row.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setChannelDraft(editing ? null : key)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-brand-orange"
                                                    >
                                                        {editing ? 'Close' : 'Edit'}
                                                    </button>
                                                </div>
                                            </div>
                                            {editing && (
                                                <div className="space-y-3 pt-2">
                                                    {key === 'slack' && (
                                                        <>
                                                            <InputField
                                                                label="Webhook URL"
                                                                value={row.config.webhook_url || ''}
                                                                onChange={(v) => setChannels((prev) => ({
                                                                    ...prev,
                                                                    slack: { ...prev.slack, config: { ...prev.slack.config, webhook_url: v } }
                                                                }))}
                                                                placeholder="https://hooks.slack.com/..."
                                                            />
                                                            <InputField
                                                                label="Channel Name"
                                                                value={row.config.channel_name || ''}
                                                                onChange={(v) => setChannels((prev) => ({
                                                                    ...prev,
                                                                    slack: { ...prev.slack, config: { ...prev.slack.config, channel_name: v } }
                                                                }))}
                                                                placeholder="#alerts-production"
                                                            />
                                                        </>
                                                    )}
                                                    {key === 'email' && (
                                                        <InputField
                                                            label="Recipients (comma-separated)"
                                                            value={row.config.recipients || ''}
                                                            onChange={(v) => setChannels((prev) => ({
                                                                ...prev,
                                                                email: { ...prev.email, config: { ...prev.email.config, recipients: v } }
                                                            }))}
                                                            placeholder="ops@kincore.com, oncall@kincore.com"
                                                        />
                                                    )}
                                                    {key === 'webhook' && (
                                                        <InputField
                                                            label="Endpoint URL"
                                                            value={row.config.url || ''}
                                                            onChange={(v) => setChannels((prev) => ({
                                                                ...prev,
                                                                webhook: { ...prev.webhook, config: { ...prev.webhook.config, url: v } }
                                                            }))}
                                                            placeholder="https://example.com/hooks/alerts"
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => saveChannel(key)}
                                                        className="w-full py-3 bg-gray-900 dark:bg-brand-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        Save {key} Channel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ConfigGroup>

                        <ConfigGroup title="Platform API Keys" icon={Key} badge="Read-only" badgeTone="blue">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest -mt-2 mb-2">
                                Create / revoke keys in Business System Config. Showing {selectedEnv} keys.
                            </p>
                            <div className="space-y-3">
                                {apiKeys.length === 0 ? (
                                    <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-brand-darkBorder rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No keys for this environment</p>
                                    </div>
                                ) : apiKeys.map((key) => (
                                    <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl">
                                        <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{key.name}</p>
                                            <p className="text-[9px] font-mono text-gray-400">{key.prefix}•••• · {key.environment}</p>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${key.is_active !== false ? 'text-emerald-500' : 'text-gray-400'}`}>
                                            {key.is_active !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ConfigGroup>

                        <button
                            type="button"
                            onClick={() => { setChangeReason(''); setShowConfirm(true); }}
                            className="w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 bg-brand-orange text-white shadow-brand-orange/25 hover:opacity-90 active:scale-95"
                        >
                            <Save size={20} />
                            <span>Save Live Configuration</span>
                        </button>
                    </div>

                    <div className="space-y-6 sticky top-8 text-left">
                        <div className="bg-white dark:bg-brand-darkCard p-8 rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                            <div className="flex items-center space-x-3 mb-6">
                                <History size={20} className="text-gray-400" />
                                <h3 className="text-sm font-extrabold text-gray-900 dark:text-brand-darkText uppercase tracking-widest">Config History</h3>
                            </div>
                            <div className="space-y-4">
                                {history.length > 0 ? history.map((item) => (
                                    <div key={item.id || item.version} className="p-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl border border-gray-100 dark:border-brand-darkBorder">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-gray-900 dark:text-brand-darkText uppercase">{item.version}</span>
                                            {item.environment && (
                                                <span className="text-[8px] font-black uppercase tracking-widest text-brand-orange">{item.environment}</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase truncate mb-2">{item.reason}</p>
                                        {item.keys?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {item.keys.map((k) => (
                                                    <span key={k} className="px-2 py-1 bg-brand-orange/10 text-brand-orange rounded text-[8px] font-black uppercase tracking-widest">
                                                        {String(k).replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">{item.user} • {item.date}</p>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center border-2 border-dashed border-gray-50 dark:border-brand-darkBorder rounded-3xl">
                                        <History size={24} className="text-gray-200 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No History Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard max-w-lg w-full rounded-[3rem] p-12 border-2 border-red-500/20 shadow-2xl">
                        <div className="flex items-center space-x-4 mb-6 text-brand-orange">
                            <div className="p-4 bg-brand-orange/10 rounded-3xl">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-left">Confirm Changes</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed mb-4 text-left">
                            Apply configuration to <span className="text-brand-orange uppercase">{selectedEnv}</span>
                            {selectedEnv === runtimeEnv ? ' (live on this node).' : ` (runtime is ${runtimeEnv}; live apply deferred).`}
                        </p>
                        <textarea
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            placeholder="Change reason (required)…"
                            rows={3}
                            className="w-full mb-6 px-5 py-4 bg-gray-50 dark:bg-brand-darkBg rounded-2xl text-sm font-bold text-gray-900 dark:text-brand-darkText outline-none border border-transparent focus:border-brand-orange/30 resize-none"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-500 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saveStatus.status === 'loading' || !changeReason.trim()}
                                className={`py-4 bg-brand-orange text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-brand-orange/90 shadow-xl shadow-brand-orange/25 transition-all outline-none ${
                                    saveStatus.status === 'loading' || !changeReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {saveStatus.status === 'loading' ? 'Saving...' : 'Confirm & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemConfig;
