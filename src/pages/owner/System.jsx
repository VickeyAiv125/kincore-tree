import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Download,
    Lock,
    UserPlus,
    Globe,
    Activity,
    HardDrive,
    ShieldAlert,
    Clock,
    Languages,
    Bell,
    Search,
    GitMerge,
    CheckCircle2,
    AlertTriangle,
    Save
} from 'lucide-react';
import { resolveFamilySpaceId } from '../../utils/familySpace';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DEFAULT_PLATFORM = {
    timezone: 'Europe/London',
    language: 'en-GB',
    push_notifications: true,
    audit_logging: 'forensic'
};

const DEFAULT_OPTIONS = {
    timezones: [
        { value: 'UTC', label: 'UTC +0:00' },
        { value: 'Europe/London', label: 'London, UTC +0:00 / +1:00' },
        { value: 'America/New_York', label: 'New York, UTC -5:00 / -4:00' },
        { value: 'America/Los_Angeles', label: 'Los Angeles, UTC -8:00 / -7:00' },
        { value: 'Asia/Kolkata', label: 'India, UTC +5:30' },
        { value: 'Asia/Dubai', label: 'Dubai, UTC +4:00' },
        { value: 'Asia/Singapore', label: 'Singapore, UTC +8:00' },
        { value: 'Australia/Sydney', label: 'Sydney, UTC +10:00 / +11:00' }
    ],
    languages: [
        { value: 'en-GB', label: 'English (UK)' },
        { value: 'en-US', label: 'English (US)' },
        { value: 'hi-IN', label: 'Hindi' },
        { value: 'ar-AE', label: 'Arabic' },
        { value: 'fr-FR', label: 'French' },
        { value: 'es-ES', label: 'Spanish' }
    ],
    audit_levels: [
        { value: 'basic', label: 'Basic' },
        { value: 'standard', label: 'Standard' },
        { value: 'forensic', label: 'Forensic Level' }
    ]
};

const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

const currentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
    } catch {
        return '';
    }
};

const System = () => {
    const [familyId, setFamilyId] = useState('');
    const [mergeSearch, setMergeSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedMergeTarget, setSelectedMergeTarget] = useState(null);
    const [mergePreview, setMergePreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [submittingMerge, setSubmittingMerge] = useState(false);

    const [storageUsed, setStorageUsed] = useState(0);
    const [storageQuota, setStorageQuota] = useState(0);
    const [activeMembers, setActiveMembers] = useState(0);
    const [memberLimit, setMemberLimit] = useState(100);
    const [loadingResources, setLoadingResources] = useState(true);

    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState('');
    const [transferring, setTransferring] = useState(false);

    const [governanceLocked, setGovernanceLocked] = useState(false);
    const [governanceLockPending, setGovernanceLockPending] = useState(false);
    const [submittingLock, setSubmittingLock] = useState(false);

    const [platformConfig, setPlatformConfig] = useState(DEFAULT_PLATFORM);
    const [platformOriginal, setPlatformOriginal] = useState(DEFAULT_PLATFORM);
    const [platformOptions, setPlatformOptions] = useState(DEFAULT_OPTIONS);
    const [savingPlatform, setSavingPlatform] = useState(false);
    const [editingField, setEditingField] = useState(null);

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        confirmText: 'Continue',
        cancelText: 'Cancel'
    });

    const showAlert = (message, type = 'info', title = 'System Message') => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'OK',
            onConfirm: () => setModal((prev) => ({ ...prev, isOpen: false }))
        });
    };

    const showConfirm = (message, onConfirm, title = 'Are you sure?') => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: () => {
                setModal((prev) => ({ ...prev, isOpen: false }));
                onConfirm();
            }
        });
    };

    const platformDirty = JSON.stringify(platformConfig) !== JSON.stringify(platformOriginal);

    const transferableMembers = familyMembers.filter((m) => {
        if (m.type && m.type !== 'account') return false;
        if (!m.id) return false;
        const me = currentUserId();
        if (me && m.id === me) return false;
        const role = String(m.role || '').toLowerCase().replace(/\s+/g, '-');
        if (role === 'owner' || role === 'family-owner') return false;
        return true;
    });

    const membersPct = memberLimit > 0
        ? Math.min((activeMembers / memberLimit) * 100, 100)
        : 0;

    const loadPage = useCallback(async () => {
        const id = await resolveFamilySpaceId();
        setFamilyId(id);
        if (!id) {
            setLoadingResources(false);
            showAlert('No family space found for this account. Re-login after joining or creating a family space.', 'error', 'Missing Family');
            return;
        }

        setLoadingResources(true);
        try {
            const [subRes, dashRes, lockRes, memRes, cfgRes] = await Promise.all([
                fetch(`${API}/families/${id}/subscription`, { headers: authHeaders() }),
                fetch(`${API}/families/${id}/dashboard`, { headers: authHeaders() }),
                fetch(`${API}/families/${id}/governance-lock`, { headers: authHeaders() }),
                fetch(`${API}/families/${id}/members`, { headers: authHeaders() }),
                fetch(`${API}/families/${id}/platform-config`, { headers: authHeaders() })
            ]);

            if (subRes.ok) {
                const subData = await subRes.json();
                setStorageUsed(subData.storage_used || 0);
                setStorageQuota(subData.storage_quota || 0);
                if (subData.member_limit) setMemberLimit(Number(subData.member_limit));
            }

            if (dashRes.ok) {
                const dashData = await dashRes.json();
                setActiveMembers(dashData.stats?.total_members || 0);
            }

            if (lockRes.ok) {
                const lockData = await lockRes.json();
                setGovernanceLocked(lockData.isLocked || false);
                setGovernanceLockPending(lockData.isPending || false);
            }

            if (memRes.ok) {
                const memData = await memRes.json();
                setFamilyMembers(Array.isArray(memData) ? memData : []);
            }

            if (cfgRes.ok) {
                const cfgData = await cfgRes.json();
                const cfg = { ...DEFAULT_PLATFORM, ...(cfgData.config || {}) };
                setPlatformConfig(cfg);
                setPlatformOriginal(cfg);
                if (cfgData.options) {
                    setPlatformOptions({
                        timezones: cfgData.options.timezones || DEFAULT_OPTIONS.timezones,
                        languages: cfgData.options.languages || DEFAULT_OPTIONS.languages,
                        audit_levels: cfgData.options.audit_levels || DEFAULT_OPTIONS.audit_levels
                    });
                }
                if (cfgData.member_limit) setMemberLimit(Number(cfgData.member_limit));
            }
        } catch (err) {
            console.error('Error fetching system page data:', err);
        } finally {
            setLoadingResources(false);
        }
    }, []);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (mergeSearch.trim().length >= 2) {
                setSearching(true);
                try {
                    const id = familyId || await resolveFamilySpaceId();
                    const res = await fetch(
                        `${API}/merge/search-families?query=${encodeURIComponent(mergeSearch)}&excludeId=${id}`,
                        { headers: authHeaders() }
                    );
                    const data = await res.json();
                    setSearchResults(data || []);
                } catch (e) {
                    console.error('Error searching families:', e);
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [mergeSearch, familyId]);

    const handleSelectTarget = async (target) => {
        setSelectedMergeTarget(target);
        setSearchResults([]);
        setLoadingPreview(true);
        try {
            const id = familyId || await resolveFamilySpaceId();
            const res = await fetch(
                `${API}/merge/preview?source_id=${id}&target_id=${target.id}`,
                { headers: authHeaders() }
            );
            const data = await res.json();
            setMergePreview(data.metrics);
        } catch (e) {
            console.error('Error loading merge preview:', e);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleInitiateMerge = async () => {
        if (!selectedMergeTarget) return;
        setSubmittingMerge(true);
        try {
            const id = familyId || await resolveFamilySpaceId();
            const res = await fetch(`${API}/merge/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify({
                    source_space_id: id,
                    target_space_id: selectedMergeTarget.id
                })
            });
            const data = await res.json();
            if (res.ok) {
                showAlert('Merge request sent to the target family owner.', 'success', 'Success');
                setSelectedMergeTarget(null);
                setMergePreview(null);
                setMergeSearch('');
            } else {
                showAlert(data.error || 'Failed to send merge request.', 'error', 'Error');
            }
        } catch (e) {
            console.error('Error initiating merge:', e);
            showAlert('Failed to send merge request.', 'error', 'Error');
        } finally {
            setSubmittingMerge(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const id = familyId || await resolveFamilySpaceId();
            if (!id) {
                showAlert('No active family space found.', 'error', 'Error');
                return;
            }
            const res = await fetch(`${API}/families/${id}/export?format=${format}`, {
                headers: authHeaders()
            });
            if (!res.ok) {
                let errorMsg = 'Failed to export vault data.';
                try {
                    const data = await res.json();
                    errorMsg = data.error || errorMsg;
                } catch {
                    // ignore
                }
                throw new Error(errorMsg);
            }

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = format === 'csv'
                ? `member_directory_${id}.csv`
                : `family_vault_${id}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Export error:', err);
            showAlert(err.message || 'Failed to export vault data.', 'error', 'Error');
        }
    };

    const handleLockGovernance = async () => {
        const id = familyId || await resolveFamilySpaceId();
        if (!id) {
            showAlert('No active family space found.', 'error', 'Error');
            return;
        }

        const action = governanceLocked ? 'unlock' : 'lock';
        const confirmMessage = governanceLocked
            ? 'Request unlocking governance? This goes to the Family Council for approval.'
            : 'Request locking governance? Edits freeze after Council approval.';

        showConfirm(confirmMessage, async () => {
            setSubmittingLock(true);
            try {
                const res = await fetch(`${API}/families/${id}/governance-lock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders()
                    },
                    body: JSON.stringify({ action })
                });
                const data = await res.json();
                if (res.ok) {
                    setGovernanceLockPending(true);
                    showAlert(
                        `Governance ${action} request submitted to the Family Council.`,
                        'success',
                        'Request Sent'
                    );
                } else {
                    showAlert(data.error || `Failed to request governance ${action}.`, 'error', 'Error');
                }
            } catch (err) {
                console.error(`Governance ${action} error:`, err);
                showAlert(`Failed to submit governance ${action} request.`, 'error', 'Error');
            } finally {
                setSubmittingLock(false);
            }
        }, `Confirm Governance ${action === 'lock' ? 'Lock' : 'Unlock'}`);
    };

    const handleTransferOwnership = async () => {
        if (!selectedOwner) return showAlert('Please select a member first.', 'error', 'Error');

        const id = familyId || await resolveFamilySpaceId();
        if (!id) return showAlert('No active family space found.', 'error', 'Error');

        showConfirm(
            'Transfer ownership of this family space? This cannot be undone. You will be demoted to Family Admin.',
            async () => {
                setTransferring(true);
                try {
                    const res = await fetch(`${API}/family-admin/${id}/governance/transfer-ownership`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...authHeaders()
                        },
                        body: JSON.stringify({ newOwnerId: selectedOwner, target_user_id: selectedOwner })
                    });

                    const data = await res.json();
                    if (res.ok) {
                        showAlert(
                            (data.message || 'Ownership transferred.') + ' You will be logged out to refresh permissions.',
                            'success',
                            'Transfer Complete'
                        );
                        setSelectedOwner('');
                        setTimeout(() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }, 4000);
                    } else {
                        throw new Error(data.error || 'Failed to initiate transfer');
                    }
                } catch (err) {
                    console.error('Transfer error:', err);
                    showAlert(err.message || 'Failed to initiate transfer.', 'error', 'Error');
                } finally {
                    setTransferring(false);
                }
            },
            'Transfer Ownership?'
        );
    };

    const handleSavePlatform = async () => {
        const id = familyId || await resolveFamilySpaceId();
        if (!id) return showAlert('No active family space found.', 'error', 'Error');

        setSavingPlatform(true);
        try {
            const res = await fetch(`${API}/families/${id}/platform-config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify({ config: platformConfig })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save configuration');
            const cfg = { ...DEFAULT_PLATFORM, ...(data.config || platformConfig) };
            setPlatformConfig(cfg);
            setPlatformOriginal(cfg);
            setEditingField(null);
            showAlert('Platform configuration saved.', 'success', 'Saved');
        } catch (err) {
            console.error('Platform config save error:', err);
            showAlert(err.message || 'Failed to save configuration.', 'error', 'Error');
        } finally {
            setSavingPlatform(false);
        }
    };

    const discardPlatform = () => {
        setPlatformConfig(platformOriginal);
        setEditingField(null);
    };

    const labelOf = (options, value) =>
        options.find((o) => o.value === value)?.label || value;

    const platformCards = [
        {
            key: 'timezone',
            icon: Clock,
            label: 'Timezone',
            display: labelOf(platformOptions.timezones, platformConfig.timezone),
            control: (
                <select
                    value={platformConfig.timezone}
                    onChange={(e) => setPlatformConfig((p) => ({ ...p, timezone: e.target.value }))}
                    className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl py-2.5 px-3 text-sm font-medium outline-none"
                >
                    {platformOptions.timezones.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            )
        },
        {
            key: 'language',
            icon: Languages,
            label: 'Default Language',
            display: labelOf(platformOptions.languages, platformConfig.language),
            control: (
                <select
                    value={platformConfig.language}
                    onChange={(e) => setPlatformConfig((p) => ({ ...p, language: e.target.value }))}
                    className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl py-2.5 px-3 text-sm font-medium outline-none"
                >
                    {platformOptions.languages.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            )
        },
        {
            key: 'push_notifications',
            icon: Bell,
            label: 'Push Notifications',
            display: platformConfig.push_notifications ? 'Enabled' : 'Disabled',
            control: (
                <button
                    type="button"
                    onClick={() => setPlatformConfig((p) => ({ ...p, push_notifications: !p.push_notifications }))}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                        platformConfig.push_notifications
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                    }`}
                >
                    {platformConfig.push_notifications ? 'Enabled' : 'Disabled'}
                </button>
            )
        },
        {
            key: 'audit_logging',
            icon: Activity,
            label: 'Audit Logging',
            display: labelOf(platformOptions.audit_levels, platformConfig.audit_logging),
            control: (
                <select
                    value={platformConfig.audit_logging}
                    onChange={(e) => setPlatformConfig((p) => ({ ...p, audit_logging: e.target.value }))}
                    className="w-full bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl py-2.5 px-3 text-sm font-medium outline-none"
                >
                    {platformOptions.audit_levels.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            )
        }
    ];

    return (
        <div className="flex flex-col text-left">
            <header className="mb-10 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight mb-2">
                    System Administration
                </h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    High-risk control center for managing critical family-space functions. Proceed with caution.
                </p>
            </header>

            <div className="space-y-12">
                <section className="space-y-6">
                    <div className="flex items-center space-x-4 mb-2">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-500">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-brand-darkText">Transfer Ownership</h2>
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Permanent Action</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] p-8">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Hand over total control of the family tree and vault to another account member. You will be demoted to Family Admin.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={selectedOwner}
                                onChange={(e) => setSelectedOwner(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-xl py-4 px-6 text-sm font-medium text-gray-900 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5"
                            >
                                <option value="" className="text-gray-500">Select a member...</option>
                                {transferableMembers.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()} ({member.role})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleTransferOwnership}
                                disabled={transferring || !selectedOwner}
                                className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                {transferring ? 'Transferring...' : 'Transfer Now'}
                            </button>
                        </div>
                        {transferableMembers.length === 0 && !loadingResources && (
                            <p className="text-xs text-gray-400 mt-4 font-medium">
                                No eligible account members available for transfer.
                            </p>
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                                <Globe size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-brand-darkText">Platform Configuration</h2>
                        </div>
                        {platformDirty && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={discardPlatform}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-800"
                                >
                                    Discard
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePlatform}
                                    disabled={savingPlatform}
                                    className="inline-flex items-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50"
                                >
                                    <Save size={14} />
                                    {savingPlatform ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {platformCards.map((item) => (
                            <div
                                key={item.key}
                                className="p-6 bg-gray-50 dark:bg-brand-darkBg/50 border border-gray-100 dark:border-brand-darkBorder rounded-3xl flex flex-col gap-3 hover:border-brand-orange/30 transition-all group"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center space-x-4 min-w-0">
                                        <item.icon className="text-gray-400 group-hover:text-brand-orange transition-colors shrink-0" size={20} />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                            {editingField !== item.key && (
                                                <p className="text-sm font-bold text-gray-900 dark:text-brand-darkText truncate">{item.display}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingField(editingField === item.key ? null : item.key)}
                                        className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline shrink-0"
                                    >
                                        {editingField === item.key ? 'Done' : 'Change'}
                                    </button>
                                </div>
                                {editingField === item.key && (
                                    <div className="pl-9">{item.control}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center space-x-4 mb-2">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <Activity size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-brand-darkText">Resource Monitoring</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] shadow-sm">
                            <HardDrive size={24} className="text-blue-500 mb-4" />
                            <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText">
                                {loadingResources ? '...' : formatBytes(storageUsed)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Storage Used {storageQuota > 0 && `(of ${formatBytes(storageQuota)})`}
                            </p>
                            <div className="w-full h-1 bg-gray-100 dark:bg-brand-darkBg mt-4 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${storageQuota > 0 ? Math.min((storageUsed / storageQuota) * 100, 100) : 0}%` }}
                                    className="h-full bg-blue-500 transition-all duration-500"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] shadow-sm">
                            <Users size={24} className="text-brand-orange mb-4" />
                            <p className="text-2xl font-black text-gray-900 dark:text-brand-darkText">
                                {loadingResources ? '...' : activeMembers}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Active Members {memberLimit > 0 && `(of ${memberLimit} seat plan)`}
                            </p>
                            <div className="w-full h-1 bg-gray-100 dark:bg-brand-darkBg mt-4 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${membersPct}%` }}
                                    className="h-full bg-brand-orange transition-all duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6 pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-brand-darkText">Merge Families</h2>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                            Search and request linking another family tree. Approval is required from the target owner; merge execution is reviewed when duplicates exist.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={mergeSearch}
                                onChange={(e) => setMergeSearch(e.target.value)}
                                placeholder="Search Surname / Space Code"
                                className="w-full bg-white dark:bg-brand-darkCard border border-gray-250 dark:border-brand-darkBorder rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold text-gray-800 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all shadow-sm"
                            />
                        </div>

                        {searching && <div className="text-xs font-bold text-brand-orange animate-pulse py-1">Searching...</div>}
                        {searchResults.length > 0 && (
                            <div className="bg-white dark:bg-brand-darkCard border border-gray-150 dark:border-brand-darkBorder rounded-2xl p-2 max-h-56 overflow-y-auto shadow-lg space-y-1">
                                {searchResults.map((space) => (
                                    <button
                                        key={space.id}
                                        onClick={() => handleSelectTarget(space)}
                                        className="w-full text-left p-3 rounded-xl text-xs font-semibold hover:bg-orange-50 dark:hover:bg-brand-orange/10 flex items-center justify-between group transition-all"
                                    >
                                        <span className="text-gray-800 dark:text-brand-darkText font-black group-hover:text-brand-orange">{space.name}</span>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold">{space.code}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedMergeTarget && (
                            <div className="bg-orange-50/50 dark:bg-brand-orange/5 border border-brand-orange/10 rounded-2xl p-6 mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black text-brand-orange uppercase tracking-wider">Target: {selectedMergeTarget.name}</span>
                                    <button onClick={() => { setSelectedMergeTarget(null); setMergePreview(null); }} className="text-[10px] font-extrabold text-gray-400 hover:text-red-500 uppercase tracking-widest">Cancel</button>
                                </div>

                                {loadingPreview ? (
                                    <div className="text-xs font-bold text-gray-400 py-2">Loading Merge Preview...</div>
                                ) : mergePreview ? (
                                    <div className="space-y-3 text-left">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 font-semibold">Total Members to Import:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-brand-darkText">{mergePreview.target_members_count || mergePreview.membersToMerge}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 font-semibold">Branches to Import:</span>
                                            <span className="font-extrabold text-gray-800 dark:text-brand-darkText">{mergePreview.branch_count || mergePreview.branchesToMerge}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 font-semibold">Overlapping Duplicates:</span>
                                            <span className={`font-extrabold ${((mergePreview.duplicate_count || mergePreview.duplicateConflicts) > 0) ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {mergePreview.duplicate_count ?? mergePreview.duplicateConflicts}
                                            </span>
                                        </div>
                                        {((mergePreview.duplicate_count || mergePreview.duplicateConflicts) > 0) && (
                                            <p className="text-[10px] text-red-400 font-medium italic">
                                                Duplicates detected. Council review and conflict resolution will be required.
                                            </p>
                                        )}

                                        <button
                                            onClick={() => showConfirm(`Send a merge request into ${selectedMergeTarget.name}? The target owner must approve.`, handleInitiateMerge, 'Send Merge Request?')}
                                            disabled={submittingMerge}
                                            className="w-full mt-4 bg-brand-orange text-white rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-orange-600 transition-all shadow-md shadow-brand-orange/10 disabled:opacity-50"
                                        >
                                            <GitMerge size={14} />
                                            <span>{submittingMerge ? 'Initiating...' : 'Send Merge Request'}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-red-500 py-2">Failed to load preview details.</div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-6 pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-brand-darkText">Export Data Vault</h2>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                            JSON includes members, lineage, branches, events, platform config, privacy, and governance settings.
                            CSV is a member directory only. Media files and document binaries are not included.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleExport('json')}
                            className="flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-900/10 group"
                        >
                            <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                            <span>Export as JSON</span>
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="flex items-center space-x-2 bg-white dark:bg-brand-darkCard text-gray-900 dark:text-brand-darkText border border-gray-100 dark:border-brand-darkBorder px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm group"
                        >
                            <Download size={18} className="group-hover:translate-y-1 transition-transform text-brand-orange" />
                            <span>Export Member CSV</span>
                        </button>
                    </div>
                </section>

                <section className="space-y-6 pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <div className="flex items-start justify-between p-10 bg-orange-50/50 dark:bg-brand-orange/5 rounded-[3rem] border border-orange-100/50 dark:border-brand-darkBorder">
                        <div className="space-y-4 max-w-xl text-left">
                            <div className="flex items-center space-x-3">
                                <ShieldAlert className="text-brand-orange" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-brand-darkText">Governance Lock</h2>
                            </div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                Freeze edits to family governance rules. Lock and unlock both require Family Council approval — not account 2FA.
                            </p>

                            {governanceLocked ? (
                                <div className="flex items-center space-x-4 flex-wrap gap-3">
                                    <div className="inline-flex items-center space-x-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-6 py-3.5 rounded-2xl font-bold text-sm border border-emerald-100 dark:border-emerald-500/20">
                                        <Lock size={18} />
                                        <span>Governance System LOCKED (Active)</span>
                                    </div>
                                    <button
                                        onClick={() => handleLockGovernance()}
                                        disabled={submittingLock || governanceLockPending}
                                        className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95 border border-red-100 dark:border-red-500/20 disabled:opacity-50"
                                    >
                                        <span>{submittingLock ? 'Submitting...' : (governanceLockPending ? 'Unlock Pending Approval' : 'Request Unlock')}</span>
                                    </button>
                                </div>
                            ) : governanceLockPending ? (
                                <div className="inline-flex items-center space-x-2 text-brand-orange bg-orange-50 dark:bg-brand-orange/10 px-6 py-3.5 rounded-2xl font-bold text-sm border border-orange-100/50 dark:border-brand-orange/20">
                                    <Clock size={18} className="animate-pulse" />
                                    <span>Lock Pending Council Approval</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleLockGovernance()}
                                    disabled={submittingLock}
                                    className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-brand-orange/20 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    <Lock size={18} />
                                    <span>{submittingLock ? 'Submitting...' : 'Request Governance Lock'}</span>
                                </button>
                            )}
                        </div>
                        <div className="hidden md:block">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-brand-darkBorder shadow-2xl flex items-center justify-center bg-orange-50 dark:bg-brand-orange/10">
                                <Lock size={48} className="text-brand-orange" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-150 dark:border-brand-darkBorder p-8 max-w-md w-full shadow-2xl relative text-center transform scale-100 transition-all duration-300">
                        <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm ${
                            modal.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                            modal.type === 'error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' :
                            modal.type === 'confirm' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                            'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                        }`}>
                            {modal.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                            {modal.type === 'error' && <ShieldAlert className="w-8 h-8" />}
                            {modal.type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
                            {modal.type === 'info' && <Globe className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-brand-darkText mb-3">
                            {modal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            {modal.message}
                        </p>
                        <div className="flex gap-4">
                            {modal.type === 'confirm' && (
                                <button
                                    onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-brand-darkBg text-gray-600 dark:text-brand-darkText rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-250 dark:hover:bg-brand-darkBorder transition-all active:scale-95"
                                >
                                    {modal.cancelText}
                                </button>
                            )}
                            <button
                                onClick={modal.onConfirm}
                                className="flex-1 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-brand-orange/20"
                            >
                                {modal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default System;
