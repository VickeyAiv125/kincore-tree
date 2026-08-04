import React, { useState, useEffect, useCallback } from 'react';
import Notification from '../../components/common/Notification';
import { AlertTriangle, Save, Undo2, Shield } from 'lucide-react';
import { resolveFamilySpaceId } from '../../utils/familySpace';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DEFAULT_PERMISSIONS = {
    demoteAdmins: true,
    archiveBranches: true,
    approvalNeeded: true,
    moderateMedia: true,
    crossBranchEdits: false,
    mandatory2FA: false,
    proposeRules: true,
    adultVoting: true,
    financialReports: false
};

const RuleCard = ({ number, value, onChange, disabled }) => (
    <div className="mb-6">
        <label className="block text-xs font-black text-gray-900 dark:text-brand-darkText mb-3 ml-1 uppercase tracking-widest">Rule {number}</label>
        <div className={`bg-[#F9FAFB] dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-2xl h-32 w-full transition-all overflow-hidden ${disabled ? 'opacity-60' : 'hover:border-brand-orange/30 focus-within:ring-4 focus-within:ring-brand-orange/5'}`}>
            <textarea
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Define foundational rule #${number}...`}
                className="w-full h-full bg-transparent p-5 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600 disabled:cursor-not-allowed"
            />
        </div>
    </div>
);

const AuthoritySlider = ({ label, value, onChange, disabled }) => (
    <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-bold text-gray-900 dark:text-brand-darkText tracking-widest uppercase">{label}</label>
            <span className="text-xs font-black text-brand-orange">{value}%</span>
        </div>
        <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-brand-orange disabled:opacity-50"
        />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-300 mt-2">
            <span>Restricted</span>
            <span>Full</span>
        </div>
    </div>
);

const PermissionCheckbox = ({ label, checked = false, onChange, disabled = false }) => (
    <div
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`flex items-center space-x-4 mb-5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
    >
        <div className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${checked ? 'bg-orange-50 dark:bg-brand-orange/20 border-brand-orange' : 'bg-white dark:bg-brand-darkBg border-gray-200 dark:border-brand-darkBorder group-hover:border-brand-orange/30'}`}>
            {checked && (
                <svg className="w-3 h-3 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )}
        </div>
        <span className="text-[13px] font-bold text-gray-800 dark:text-brand-darkText">{label}</span>
    </div>
);

const GovernancePolicy = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [canEdit, setCanEdit] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [roleHierarchy, setRoleHierarchy] = useState([]);
    const [rules, setRules] = useState({ rule_1: '', rule_2: '', rule_3: '' });
    const [authorities, setAuthorities] = useState({ financial_authority: 100, asset_authority: 100 });
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
    const [original, setOriginal] = useState(null);

    const applySnapshot = (data) => {
        const next = {
            rules: { rule_1: data.rule_1 || '', rule_2: data.rule_2 || '', rule_3: data.rule_3 || '' },
            authorities: {
                financial_authority: data.financial_authority ?? 100,
                asset_authority: data.asset_authority ?? 100
            },
            permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions || {}) }
        };
        setRules(next.rules);
        setAuthorities(next.authorities);
        setPermissions(next.permissions);
        setOriginal(next);
        setRoleHierarchy(data.role_hierarchy || []);
        setCanEdit(data.can_edit !== false);
        setIsLocked(!!data.is_locked);
        setDirty(false);
    };

    const fetchSettings = useCallback(async () => {
        try {
            const family_space_id = await resolveFamilySpaceId();
            if (!family_space_id) {
                setNotification({
                    message: 'No family space found for this account. Ensure you are owner of a family space, then re-login.',
                    type: 'error'
                });
                return;
            }

            const res = await fetch(`${API}/governance/settings?family_space_id=${family_space_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to load governance settings');
            applySnapshot(data);
        } catch (err) {
            console.error('Error fetching governance settings:', err);
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const markDirty = () => setDirty(true);

    const handleSave = async () => {
        setSaving(true);
        try {
            const family_space_id = await resolveFamilySpaceId();
            if (!family_space_id) throw new Error('No family space found for this account');
            const res = await fetch(`${API}/governance/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    family_space_id,
                    ...rules,
                    ...authorities,
                    permissions
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save settings');
            applySnapshot({ ...data, can_edit: canEdit, is_locked: false });
            setNotification({ message: 'Governance policies updated successfully', type: 'success' });
        } catch (err) {
            console.error(err);
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (!original) return;
        setRules(original.rules);
        setAuthorities(original.authorities);
        setPermissions(original.permissions);
        setDirty(false);
    };

    const togglePermission = (key) => {
        if (!canEdit || isLocked) return;
        setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
        markDirty();
    };

    const readOnly = !canEdit || isLocked;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col text-left w-full relative pb-28">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: 'success' })}
            />

            <header className="mb-10">
                <div className="flex items-center space-x-2 mb-2 text-brand-orange">
                    <Shield size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Family-scoped</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-brand-darkText leading-tight mb-2">
                    Governance Rules Policy
                </h1>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    Foundational rules for this family space only — not platform-global.
                </p>
            </header>

            {isLocked && (
                <div className="mb-8 flex items-start space-x-3 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Governance Lock Active</p>
                        <p className="text-xs font-bold text-amber-800/80 dark:text-amber-200/80 mt-1">
                            Policies are read-only until Council approves an unlock (System → Governance Lock).
                        </p>
                    </div>
                </div>
            )}

            {!canEdit && !isLocked && (
                <div className="mb-8 px-5 py-4 rounded-2xl bg-gray-100 dark:bg-brand-darkBg text-[10px] font-black uppercase tracking-widest text-gray-500">
                    View only — you are not permitted to modify governance policies
                </div>
            )}

            <section className="mb-14">
                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-8 tracking-tight">Constitution Rules</h2>
                <RuleCard number={1} value={rules.rule_1} disabled={readOnly} onChange={(v) => { setRules((p) => ({ ...p, rule_1: v })); markDirty(); }} />
                <RuleCard number={2} value={rules.rule_2} disabled={readOnly} onChange={(v) => { setRules((p) => ({ ...p, rule_2: v })); markDirty(); }} />
                <RuleCard number={3} value={rules.rule_3} disabled={readOnly} onChange={(v) => { setRules((p) => ({ ...p, rule_3: v })); markDirty(); }} />
            </section>

            <section className="mb-14">
                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-8 tracking-tight">Authority Boundaries</h2>
                <AuthoritySlider
                    label="Financial Decision Authority"
                    value={authorities.financial_authority}
                    disabled={readOnly}
                    onChange={(v) => { setAuthorities((p) => ({ ...p, financial_authority: v })); markDirty(); }}
                />
                <AuthoritySlider
                    label="Asset Management Authority"
                    value={authorities.asset_authority}
                    disabled={readOnly}
                    onChange={(v) => { setAuthorities((p) => ({ ...p, asset_authority: v })); markDirty(); }}
                />
            </section>

            <section className="mb-14">
                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-8 tracking-tight">Role Management & Hierarchy</h2>
                <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50/50 dark:bg-brand-darkBg/50 border-b border-gray-50 dark:border-brand-darkBorder">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">System Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Authority Level</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Scope</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-brand-darkBorder">
                                {(roleHierarchy.length
                                    ? roleHierarchy
                                    : [
                                        { role: 'Family Owner', authority: 'Total Control', scope: 'Global' },
                                        { role: 'Family Admin', authority: 'Operations Manager', scope: 'Global' },
                                        { role: 'Branch Admin', authority: 'Branch Governance', scope: 'Branch' },
                                        { role: 'Editor', authority: 'Content Contributor', scope: 'Assigned' },
                                        { role: 'Member', authority: 'View & Personal Edit', scope: 'Personal' }
                                    ]
                                ).map((item, idx) => (
                                    <tr key={item.key || idx} className="hover:bg-gray-50/30 dark:hover:bg-brand-darkBg/30 transition-colors">
                                        <td className="px-6 py-5 text-sm font-black text-gray-900 dark:text-brand-darkText">
                                            {item.role}
                                            {item.level != null && (
                                                <span className="ml-2 text-[9px] font-black text-brand-orange uppercase">L{item.level}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-brand-orange">{item.authority}</td>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-400 text-right uppercase tracking-tighter">{item.scope}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="mb-14">
                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-8 tracking-tight">Administrative Authority</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-orange-50/30 dark:bg-brand-orange/5 border border-orange-100/50 dark:border-brand-darkBorder rounded-[2rem]">
                        <PermissionCheckbox label="Owners can demote Family Admins" checked={permissions.demoteAdmins} disabled={readOnly} onChange={() => togglePermission('demoteAdmins')} />
                        <PermissionCheckbox label="Admins can archive old branches" checked={permissions.archiveBranches} disabled={readOnly} onChange={() => togglePermission('archiveBranches')} />
                        <PermissionCheckbox label="Editors require approval for tree edits" checked={permissions.approvalNeeded} disabled={readOnly} onChange={() => togglePermission('approvalNeeded')} />
                    </div>
                    <div className="p-6 bg-orange-50/30 dark:bg-brand-orange/5 border border-orange-100/50 dark:border-brand-darkBorder rounded-[2rem]">
                        <PermissionCheckbox label="Branch Admins can moderate branch media" checked={permissions.moderateMedia} disabled={readOnly} onChange={() => togglePermission('moderateMedia')} />
                        <PermissionCheckbox label="Allow cross-branch historical edits" checked={permissions.crossBranchEdits} disabled={readOnly} onChange={() => togglePermission('crossBranchEdits')} />
                        <PermissionCheckbox label="Mandatory 2FA for all administrative roles" checked={permissions.mandatory2FA} disabled={readOnly} onChange={() => togglePermission('mandatory2FA')} />
                    </div>
                </div>
            </section>

            <section className="mb-14">
                <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText mb-8 tracking-tight">Governance Decision Policy</h2>
                <PermissionCheckbox label="Allow family members to propose new governance rules" checked={permissions.proposeRules} disabled={readOnly} onChange={() => togglePermission('proposeRules')} />
                <PermissionCheckbox label="Enable voting rights for all adult members" checked={permissions.adultVoting} disabled={readOnly} onChange={() => togglePermission('adultVoting')} />
                <PermissionCheckbox label="Grant access to financial reports for designated roles" checked={permissions.financialReports} disabled={readOnly} onChange={() => togglePermission('financialReports')} />
            </section>

            {dirty && !readOnly && (
                <div className="fixed bottom-8 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-50 bg-gray-900 text-white px-8 py-5 rounded-full shadow-2xl flex items-center space-x-6 border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Unsaved governance changes</span>
                    <button type="button" onClick={handleDiscard} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white">
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

export default GovernancePolicy;
