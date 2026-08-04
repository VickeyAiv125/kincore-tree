import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Save, Undo2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { resolveFamilySpaceId } from '../../utils/familySpace';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const PrivacySection = ({ title, description, children, audited }) => (
    <div className="py-8 border-b border-gray-50 dark:border-brand-darkBorder last:border-0 transition-colors">
        <div className="flex justify-between items-start gap-6 group">
            <div className="flex-1 pr-4">
                <h3 className="text-base font-black text-gray-900 dark:text-brand-darkText mb-1.5">{title}</h3>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-4 leading-relaxed max-w-2xl">{description}</p>
                {audited && (
                    <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                            Changes are audit-logged
                        </span>
                    </div>
                )}
            </div>
            <div className="shrink-0 flex items-center justify-end min-w-[100px]">
                {children}
            </div>
        </div>
    </div>
);

const Toggle = ({ checked = false, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} group`}>
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
        <div className="w-[52px] h-[30px] bg-gray-100 dark:bg-brand-darkBg rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:dark:bg-brand-darkText after:border-gray-200 dark:after:border-brand-darkBorder after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-orange dark:peer-checked:bg-brand-orange after:shadow-sm" />
    </label>
);

const DEFAULTS = {
    globalProfileVisibility: false,
    dnaDataAccess: false,
    externalSearchIndexing: false,
    branchLeaderVisibility: 'Limited',
    memberVisibility: 'Limited',
    lineageVisibility: true,
    sensitiveDataRedaction: true,
    postMortemAccess: true,
    autoApproveCousins: false
};

const PrivacySettings = () => {
    const [settings, setSettings] = useState(DEFAULTS);
    const [original, setOriginal] = useState(DEFAULTS);
    const [alerts, setAlerts] = useState([]);
    const [spaceVisibility, setSpaceVisibility] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);

    const [familyId, setFamilyId] = useState('');

    const fetchSettings = useCallback(async () => {
        const id = await resolveFamilySpaceId();
        setFamilyId(id);
        if (!id) {
            setLoading(false);
            setError('No family space found for this account. Re-login after joining/creating a family space.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/families/${id}/privacy`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to load privacy settings');
            const privacy = { ...DEFAULTS, ...(data.privacy || {}) };
            setSettings(privacy);
            setOriginal(privacy);
            setAlerts(data.alerts || []);
            setSpaceVisibility(data.visibility || '');
            setDirty(false);
        } catch (err) {
            console.error('Failed to fetch privacy settings', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const setField = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setDirty(true);
    };

    const handleSave = async () => {
        const id = familyId || await resolveFamilySpaceId();
        if (!id || saving) return;
        setSaving(true);
        setToast(null);
        try {
            const res = await fetch(`${API_BASE}/families/${id}/privacy`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ privacy: settings })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save privacy settings');
            const privacy = { ...DEFAULTS, ...(data.privacy || settings) };
            setSettings(privacy);
            setOriginal(privacy);
            setSpaceVisibility(data.visibility || spaceVisibility);
            setDirty(false);
            setToast({ ok: true, message: 'Privacy settings saved & audit logged' });
            fetchSettings();
            setTimeout(() => setToast(null), 3500);
        } catch (err) {
            setToast({ ok: false, message: err.message });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setSettings(original);
        setDirty(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col text-left w-full">
                <header className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight mb-2">Privacy Settings</h1>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Manage privacy for this family space only.</p>
                </header>
                <div className="text-center py-20 text-gray-400 italic font-bold uppercase tracking-widest">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col text-left w-full relative pb-28">
            {toast && (
                <div className={`fixed top-24 right-8 z-50 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl ${
                    toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {toast.message}
                </div>
            )}

            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 mb-2 text-brand-orange">
                        <Shield size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Family-scoped</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight mb-2">Privacy Settings</h1>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                        Controls apply to this family space only — not platform-wide.
                        {spaceVisibility ? ` · Space visibility: ${spaceVisibility}` : ''}
                    </p>
                </div>
            </header>

            {error && (
                <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                    {error}
                </div>
            )}

            {alerts.length > 0 && (
                <div className="mb-8 space-y-3">
                    {alerts.map((a) => (
                        <div
                            key={a.code}
                            className="flex items-start space-x-3 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30"
                        >
                            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">{a.code.replace(/_/g, ' ')}</p>
                                <p className="text-xs font-bold text-amber-800/80 dark:text-amber-200/80 mt-1">{a.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white dark:bg-brand-darkCard rounded-[2rem] border border-gray-100 dark:border-brand-darkBorder px-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText pt-8 pb-2">Discovery & Indexing</h2>
                <PrivacySection
                    title="Global Profile Visibility"
                    description="Allow this family's profiles to be discoverable outside the private family space (lists the space externally)."
                    audited
                >
                    <Toggle
                        checked={!!settings.globalProfileVisibility}
                        onChange={() => setField('globalProfileVisibility', !settings.globalProfileVisibility)}
                        disabled={saving}
                    />
                </PrivacySection>
                <PrivacySection
                    title="External Search Indexing"
                    description="Include members in Find Yourself / public person search. Off hides the space from external search regardless of person privacy_mode."
                    audited
                >
                    <Toggle
                        checked={!!settings.externalSearchIndexing}
                        onChange={() => setField('externalSearchIndexing', !settings.externalSearchIndexing)}
                        disabled={saving}
                    />
                </PrivacySection>

                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText pt-8 pb-2">Sensitive Data</h2>
                <PrivacySection
                    title="DNA Data Access"
                    description="When off, DNA fields are stripped from member profile API responses for everyone."
                    audited
                >
                    <Toggle
                        checked={!!settings.dnaDataAccess}
                        onChange={() => setField('dnaDataAccess', !settings.dnaDataAccess)}
                        disabled={saving}
                    />
                </PrivacySection>
                <PrivacySection
                    title="Sensitive Data Redaction"
                    description="When on, Limited viewers have birth date, location, and living status redacted (in addition to per-person hide flags)."
                    audited
                >
                    <Toggle
                        checked={!!settings.sensitiveDataRedaction}
                        onChange={() => setField('sensitiveDataRedaction', !settings.sensitiveDataRedaction)}
                        disabled={saving}
                    />
                </PrivacySection>
                <PrivacySection
                    title="Post-Mortem Access"
                    description="When off, biographies for deceased persons are hidden from Limited viewers."
                    audited
                >
                    <Toggle
                        checked={!!settings.postMortemAccess}
                        onChange={() => setField('postMortemAccess', !settings.postMortemAccess)}
                        disabled={saving}
                    />
                </PrivacySection>
                <PrivacySection
                    title="Lineage Visibility"
                    description="When off, parent/child/spouse relationship trees are hidden from Limited roles."
                    audited
                >
                    <Toggle
                        checked={!!settings.lineageVisibility}
                        onChange={() => setField('lineageVisibility', !settings.lineageVisibility)}
                        disabled={saving}
                    />
                </PrivacySection>

                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText pt-8 pb-2">Role Visibility</h2>
                <PrivacySection
                    title="Branch Leader Data Visibility"
                    description="Full lets Branch Admins see sensitive fields; Limited applies redaction rules."
                    audited
                >
                    <select
                        value={settings.branchLeaderVisibility}
                        onChange={(e) => setField('branchLeaderVisibility', e.target.value)}
                        disabled={saving}
                        className="bg-gray-100 dark:bg-brand-darkBg text-xs font-black text-gray-900 dark:text-brand-darkText rounded-xl px-4 py-2 border-0 focus:ring-2 focus:ring-brand-orange disabled:opacity-50 cursor-pointer outline-none"
                    >
                        <option value="Full">Full</option>
                        <option value="Limited">Limited</option>
                    </select>
                </PrivacySection>
                <PrivacySection
                    title="Member Data Visibility"
                    description="Applies to regular members and council/editor roles for sensitive field access."
                    audited
                >
                    <select
                        value={settings.memberVisibility}
                        onChange={(e) => setField('memberVisibility', e.target.value)}
                        disabled={saving}
                        className="bg-gray-100 dark:bg-brand-darkBg text-xs font-black text-gray-900 dark:text-brand-darkText rounded-xl px-4 py-2 border-0 focus:ring-2 focus:ring-brand-orange disabled:opacity-50 cursor-pointer outline-none"
                    >
                        <option value="Full">Full</option>
                        <option value="Limited">Limited</option>
                    </select>
                </PrivacySection>
            </div>

            {dirty && (
                <div className="fixed bottom-8 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-50 bg-gray-900 text-white px-8 py-5 rounded-full shadow-2xl flex items-center space-x-6 border border-white/10">
                    <div className="flex items-center space-x-2">
                        <CheckCircle2 size={16} className="text-brand-orange" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Unsaved privacy changes</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDiscard}
                        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                    >
                        <Undo2 size={14} />
                        <span>Discard</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        <Save size={14} />
                        <span>{saving ? 'Saving…' : 'Save & Audit'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PrivacySettings;
