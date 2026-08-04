import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ROLE_OPTIONS = ['owner', 'family-admin', 'co-admin', 'branch-admin', 'editor', 'member'];

const PolicyRow = ({
    category,
    action,
    description,
    settings,
    onToggleChannel,
    onToggleRecipient,
    onChangeMeta,
    onTest,
    testing
}) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none group hover:bg-orange-50/10 dark:hover:bg-brand-orange/5 transition-all align-top">
        <td className="py-6 px-4 text-sm font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">{category}</td>
        <td className="py-6 px-4 text-left min-w-[220px]">
            <div className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{action}</div>
            {description && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{description}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
                <select
                    value={settings.frequency || 'instant'}
                    onChange={(e) => onChangeMeta('frequency', e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-lg px-2 py-1"
                >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily digest</option>
                    <option value="weekly">Weekly digest</option>
                </select>
                <select
                    value={settings.priority || 'normal'}
                    onChange={(e) => onChangeMeta('priority', e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-lg px-2 py-1"
                >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                </select>
                <button
                    type="button"
                    onClick={onTest}
                    disabled={testing}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:underline disabled:opacity-50"
                >
                    {testing ? 'Sending…' : 'Test'}
                </button>
            </div>
            <div className="mt-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Recipients</p>
                <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => {
                        const active = (settings.recipients || []).includes(role);
                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => onToggleRecipient(role)}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    active
                                        ? 'bg-brand-orange text-white border-brand-orange'
                                        : 'bg-white dark:bg-brand-darkCard text-gray-400 border-gray-200 dark:border-brand-darkBorder'
                                }`}
                            >
                                {role}
                            </button>
                        );
                    })}
                </div>
            </div>
        </td>
        <td className="py-6 px-4">
            <div className="flex justify-center" onClick={() => onToggleChannel('email')}>
                <div className={`w-5 h-5 rounded border-2 cursor-pointer transition-colors flex items-center justify-center hover:bg-orange-50 dark:hover:bg-brand-orange/10 ${settings.email ? 'border-brand-orange bg-brand-orange' : 'border-orange-200 dark:border-brand-darkBorder'}`}>
                    {settings.email && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
        </td>
        <td className="py-6 px-4">
            <div className="flex justify-center" onClick={() => onToggleChannel('push')}>
                <div className={`w-5 h-5 rounded border-2 cursor-pointer transition-colors flex items-center justify-center hover:bg-orange-50 dark:hover:bg-brand-orange/10 ${settings.push ? 'border-brand-orange bg-brand-orange' : 'border-orange-200 dark:border-brand-darkBorder'}`}>
                    {settings.push && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
        </td>
    </tr>
);

const Policies = () => {
    const [policiesData, setPoliciesData] = useState({});
    const [catalog, setCatalog] = useState([]);
    const [emailConfigured, setEmailConfigured] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [testingAction, setTestingAction] = useState(null);

    const getContext = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
        if (familyId === 'undefined' || familyId === 'null') familyId = null;
        return { familyId, token: localStorage.getItem('token') };
    };

    useEffect(() => {
        fetchPolicies();
        fetchLogs();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const { familyId, token } = getContext();
            if (!familyId) {
                setError('No family space identified');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings/notification-policies`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch policies');
            const data = await response.json();
            setPoliciesData(data.policies || {});
            setCatalog(data.catalog || []);
            setEmailConfigured(Boolean(data.email_configured));
            setError(null);
        } catch (err) {
            console.error('Error fetching policies:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const { familyId, token } = getContext();
            if (!familyId) return;
            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings/notification-logs?limit=30`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            setLogs(data.logs || []);
        } catch (err) {
            console.error('Error fetching notification logs:', err);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const { familyId, token } = getContext();

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings/notification-policies`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ policies: policiesData })
            });

            if (!response.ok) throw new Error('Failed to save policies');
            const data = await response.json();
            if (data.policies) setPoliciesData(data.policies);

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Settings Saved',
                message: 'Notification policies have been successfully updated.'
            });
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Save Failed',
                message: err.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    const patchPolicy = (action, updater) => {
        setPoliciesData((prev) => ({
            ...prev,
            [action]: updater(prev[action] || { email: false, push: false, recipients: [] })
        }));
    };

    const handleTest = async (action) => {
        try {
            setTestingAction(action);
            const { familyId, token } = getContext();
            const response = await fetch(`${API_BASE}/family-admin/${familyId}/settings/notification-policies/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Test failed');

            setStatusModal({
                show: true,
                type: 'success',
                title: 'Test Sent',
                message: data.result?.skipped
                    ? `Skipped: ${data.result.reason}`
                    : `Dispatched to ${data.result?.recipients || 0} recipient(s). Email ${data.result?.delivery?.email?.mocked ? 'mocked (set SMTP_*)' : 'attempted'}; push/in-app ${data.result?.delivery?.push?.sent || 0} sent.`
            });
            fetchLogs();
        } catch (err) {
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Test Failed',
                message: err.message
            });
        } finally {
            setTestingAction(null);
        }
    };

    const rows = (catalog.length
        ? catalog
        : Object.keys(policiesData).map((action) => ({ category: 'General', action }))
    ).filter((p) =>
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText mb-4 leading-tight">Notification Policies</h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        Control which family actions trigger Email and/or Push (in-app) notifications.
                    </p>
                    <p className={`mt-2 text-xs font-bold ${emailConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {emailConfigured
                            ? 'SMTP email provider connected'
                            : 'SMTP not configured — emails are mocked until SMTP_HOST / SMTP_USER / SMTP_PASS are set'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || loading}
                    className="bg-gray-900 dark:bg-brand-darkBorder text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-black active:scale-95 disabled:opacity-50 shadow-xl"
                >
                    {isSaving ? 'Saving...' : 'Save Policies'}
                </button>
            </header>

            <div className="relative mb-8 sm:mb-12">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search policies by category or action"
                    className="w-full bg-orange-50 dark:bg-brand-orange/10 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-gray-600 dark:text-brand-darkText placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/20 transition-all"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 md:p-8 transition-colors mb-10">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Policies...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500 font-bold">{error}</p>
                        <button onClick={fetchPolicies} className="mt-4 text-brand-orange font-bold underline">Retry</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[780px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
                                    <th className="pb-6 px-4 text-left">Category</th>
                                    <th className="pb-6 px-4 text-left">Action / Config</th>
                                    <th className="pb-6 px-4">Email</th>
                                    <th className="pb-6 px-4">Push / In-app</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((p) => {
                                    const settings = policiesData[p.action] || { email: false, push: false, recipients: [] };
                                    return (
                                        <PolicyRow
                                            key={p.action}
                                            category={p.category}
                                            action={p.action}
                                            description={p.description}
                                            settings={settings}
                                            testing={testingAction === p.action}
                                            onToggleChannel={(type) =>
                                                patchPolicy(p.action, (cur) => ({ ...cur, [type]: !cur[type] }))
                                            }
                                            onToggleRecipient={(role) =>
                                                patchPolicy(p.action, (cur) => {
                                                    const recipients = new Set(cur.recipients || []);
                                                    if (recipients.has(role)) recipients.delete(role);
                                                    else recipients.add(role);
                                                    return { ...cur, recipients: [...recipients] };
                                                })
                                            }
                                            onChangeMeta={(key, value) =>
                                                patchPolicy(p.action, (cur) => ({ ...cur, [key]: value }))
                                            }
                                            onTest={() => handleTest(p.action)}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <section className="bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText">Delivery Logs</h2>
                    <button onClick={fetchLogs} className="text-xs font-black uppercase tracking-widest text-brand-orange hover:underline">Refresh</button>
                </div>
                {logs.length === 0 ? (
                    <p className="text-sm text-gray-400 font-medium py-8 text-center">No notification deliveries yet. Save policies and use Test, or trigger a family event.</p>
                ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto">
                        {logs.map((log) => (
                            <div key={log.id} className="rounded-2xl border border-gray-100 dark:border-brand-darkBorder p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{log.action}</p>
                                    <p className="text-xs text-gray-400 mt-1">{log.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                                        {log.status} · {log.recipients || 0} recipients · {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                                        {log.test ? ' · TEST' : ''}
                                    </p>
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                                    <div>Email: {log.delivery?.email?.sent ?? 0}/{log.delivery?.email?.attempted ? 'yes' : 'off'}{log.delivery?.email?.mocked ? ' (mock)' : ''}</div>
                                    <div>Push: {log.delivery?.push?.sent ?? 0}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder">
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText text-center mb-2 uppercase tracking-tight">
                            {statusModal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
                            {statusModal.message}
                        </p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-brand-orange text-white"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Policies;
