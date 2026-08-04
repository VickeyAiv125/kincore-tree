import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;

const RoleRow = ({ role, displayName, description, members, level, scope }) => (
    <tr className="border-b border-gray-50 dark:border-brand-darkBorder last:border-none transition-colors group hover:bg-orange-50/10 dark:hover:bg-brand-orange/5">
        <td className="py-6 pr-4">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest leading-none mb-1">Level {level}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-brand-darkText">{role}</span>
            </div>
        </td>
        <td className="py-6 px-4">
            <span className="bg-gray-50 dark:bg-brand-darkBg px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-brand-darkBorder">{displayName}</span>
        </td>
        <td className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description || 'Standard access level for this role.'}</td>
        <td className="py-6 px-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{scope}</span>
        </td>
        <td className="py-6 pl-4 text-sm font-black text-gray-800 dark:text-brand-darkText text-center">{members}</td>
    </tr>
);

const RadioOption = ({ label, checked = false, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center space-x-3 p-4 border rounded-xl mb-3 cursor-pointer transition-all ${checked ? 'bg-brand-orange/5 border-brand-orange/20 shadow-sm' : 'bg-white dark:bg-brand-darkCard border-gray-100 dark:border-brand-darkBorder hover:border-brand-orange/20 hover:bg-gray-50 dark:hover:bg-brand-darkBorder/30'}`}
    >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-brand-orange' : 'border-gray-200 dark:border-brand-darkBorder'}`}>
            {checked && <div className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-in zoom-in duration-200"></div>}
        </div>
        <span className={`text-sm font-bold transition-colors ${checked ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
    </div>
);

const GovernanceRoles = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideSubBranches, setHideSubBranches] = useState(false);
    const [allowLineageMerge, setAllowLineageMerge] = useState(true);
    const [visibility, setVisibility] = useState('All family members');
    const [actorRole, setActorRole] = useState('');
    const [canManageRoles, setCanManageRoles] = useState(false);
    const [adminDelegations, setAdminDelegations] = useState({
        canModifyRoles: true,
        canAssignFamilyAdmin: false,
        canAssignCoAdmin: false,
        canAddMembers: true,
        canRemoveMembers: true,
        canModifyGovernanceRules: false
    });
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            if (!familyId || familyId === 'DEFAULT_FAMILY_ID' && !user?.family_id) {
                setError('No family space identified');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/roles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch roles');
            const data = await response.json();
            setRoles(data.roles || []);
            setActorRole(data.actor_role || '');
            setCanManageRoles(Boolean(data.can_manage_roles));
            if (data.settings) {
                setHideSubBranches(data.settings.hideSubBranches || false);
                setAllowLineageMerge(data.settings.allowLineageMerge !== undefined ? data.settings.allowLineageMerge : true);
                setVisibility(data.settings.visibility || 'All family members');
                if (data.settings.adminDelegations) {
                    setAdminDelegations((prev) => ({ ...prev, ...data.settings.adminDelegations }));
                }
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id || 'DEFAULT_FAMILY_ID';
            if (familyId === 'undefined' || familyId === 'null') familyId = 'DEFAULT_FAMILY_ID';
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/family-admin/${familyId}/roles/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hideSubBranches,
                    allowLineageMerge,
                    visibility,
                    adminDelegations
                })
            });

            if (!response.ok) throw new Error('Failed to save settings');
            
            setStatusModal({
                show: true,
                type: 'success',
                title: 'Settings Saved',
                message: 'Your privacy and governance settings have been updated successfully.'
            });
        } catch (err) {
            console.error('Error saving settings:', err);
            setStatusModal({
                show: true,
                type: 'error',
                title: 'Update Failed',
                message: err.message
            });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Roles Table */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Governance & Roles</h1>
                </div>

                <div className="bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-hidden p-6 relative transition-colors">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-bold animate-pulse">Fetching roles...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <p className="text-red-500 font-bold">{error}</p>
                            <button onClick={fetchRoles} className="mt-4 text-brand-orange font-bold underline">Retry</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-left text-xs font-bold text-gray-400 dark:text-gray-500">
                                        <th className="pb-4 pr-4 uppercase tracking-widest">Role Rank</th>
                                        <th className="pb-4 px-4 uppercase tracking-widest">Alias</th>
                                        <th className="pb-4 px-4 uppercase tracking-widest">Description</th>
                                        <th className="pb-4 px-4 uppercase tracking-widest">Default Scope</th>
                                        <th className="pb-4 pl-4 text-center uppercase tracking-widest">Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role, idx) => (
                                        <RoleRow
                                            key={role.key || idx}
                                            role={role.role}
                                            level={role.level}
                                            displayName={role.display_name}
                                            description={role.description}
                                            scope={role.scope}
                                            members={role.active_members}
                                        />
                                    ))}
                                    {roles.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center text-gray-400">No roles found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex justify-end mt-6">
                        {canManageRoles && (
                            <button
                                onClick={() => navigate('/governance/add-role')}
                                className="bg-brand-orange text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-bold transform translate-y-2 hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Assign Role</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Settings */}
            <div className="lg:w-80">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText mb-8">Privacy & Visibility</h2>

                <div className="mb-8">
                    <p className="text-sm font-bold text-gray-800 dark:text-brand-darkText mb-4">Who can see this role?</p>
                    <RadioOption
                        label="All family members"
                        checked={visibility === 'All family members'}
                        onClick={() => setVisibility('All family members')}
                    />
                    <RadioOption
                        label="Specific branches"
                        checked={visibility === 'Specific branches'}
                        onClick={() => setVisibility('Specific branches')}
                    />
                    <RadioOption
                        label="Only admins"
                        checked={visibility === 'Only admins'}
                        onClick={() => setVisibility('Only admins')}
                    />
                </div>

                <div className="mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Branch Privacy</p>
                    <div className="space-y-4">
                        <div
                            onClick={() => setHideSubBranches(!hideSubBranches)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${hideSubBranches ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-gray-50 dark:bg-brand-darkBg border-transparent hover:border-brand-orange/20'}`}
                        >
                            <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">Hide Sub-Branches</p>
                                <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter mt-0.5">Invisible to other branches</p>
                            </div>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${hideSubBranches ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hideSubBranches ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div
                            onClick={() => setAllowLineageMerge(!allowLineageMerge)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${allowLineageMerge ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-gray-50 dark:bg-brand-darkBg border-transparent hover:border-brand-orange/20'}`}
                        >
                            <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">Allow Lineage Merge</p>
                                <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter mt-0.5">Enable branch-to-branch data sharing</p>
                            </div>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${allowLineageMerge ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowLineageMerge ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {actorRole === 'owner' && (
                    <div className="mb-8 pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Family Admin Delegations</p>
                        <p className="text-[11px] text-gray-500 mb-4">Control what Family Admin can do. Owner remains highest authority.</p>
                        {[
                            ['canModifyRoles', 'Can modify operational roles'],
                            ['canAssignFamilyAdmin', 'Can assign Family Admin'],
                            ['canAssignCoAdmin', 'Can assign Co-Admin'],
                            ['canAddMembers', 'Can add members'],
                            ['canRemoveMembers', 'Can remove members'],
                            ['canModifyGovernanceRules', 'Can modify governance rules']
                        ].map(([key, label]) => (
                            <div
                                key={key}
                                onClick={() => setAdminDelegations((prev) => ({ ...prev, [key]: !prev[key] }))}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer mb-3 ${adminDelegations[key] ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-gray-50 dark:bg-brand-darkBg border-transparent'}`}
                            >
                                <p className="text-xs font-bold text-gray-900 dark:text-brand-darkText">{label}</p>
                                <div className={`w-10 h-6 rounded-full relative ${adminDelegations[key] ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full ${adminDelegations[key] ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-8 pt-8 border-t border-gray-50 dark:border-brand-darkBorder">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ownership Transfer</p>
                    <button className="w-full py-4 bg-gray-900 dark:bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-[1.02] transition-all">
                        Initiate Global Transfer
                    </button>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-4">Restricted to Root Owner · Not role-assign</p>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handleSaveSettings}
                        className="bg-brand-orange text-white px-8 py-3 rounded-lg font-bold shadow-sm hover:bg-orange-600 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
            {/* Feedback Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-brand-darkBorder animate-in zoom-in duration-300">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                            statusModal.type === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                        }`}>
                            {statusModal.type === 'success' ? (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText text-center mb-2 uppercase tracking-tight">
                            {statusModal.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed px-4">
                            {statusModal.message}
                        </p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                statusModal.type === 'success'
                                    ? 'bg-brand-orange text-white shadow-brand-orange/25 hover:bg-orange-600'
                                    : 'bg-gray-900 dark:bg-brand-darkBorder text-white hover:bg-black'
                            }`}
                        >
                            {statusModal.type === 'success' ? 'Continue' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovernanceRoles;
