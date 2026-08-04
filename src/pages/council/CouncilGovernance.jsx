import React, { useState, useEffect, useCallback } from 'react';
import { useCouncil } from '../../context/CouncilContext';
import {
    Gavel,
    ShieldCheck,
    Settings2,
    Save,
    Undo2,
    AlertTriangle,
    Info,
    MoveRight,
    Key,
    Clock
} from 'lucide-react';

const ControlGroup = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-brand-darkCard rounded-[2.5rem] border border-gray-100 dark:border-brand-darkBorder overflow-hidden shadow-sm transition-colors">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-brand-darkBg flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-brand-darkText uppercase tracking-widest">{title}</h2>
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const Toggle = ({ checked = false, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer group">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-[60px] h-[32px] bg-gray-100 dark:bg-brand-darkBg rounded-full peer peer-checked:after:translate-x-[28px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:dark:bg-brand-darkText after:border-gray-200 dark:after:border-brand-darkBorder after:border after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 peer-checked:bg-brand-orange dark:peer-checked:bg-brand-orange shadow-inner"></div>
    </label>
);

const CouncilGovernance = () => {
    const { selectedFamilyId } = useCouncil();
    const [isDirty, setIsDirty] = useState(false);
    const [threshold, setThreshold] = useState(66);
    const [roles, setRoles] = useState({
        elder: 'Council Elder',
        member: 'Council Member',
        clerk: 'Family Clerk'
    });
    const [delegations, setDelegations] = useState({
        canAddMembers: true,
        canRemoveMembers: true,
        canModifyRoles: false,
        canModifyGovRules: false
    });

    const fetchConfig = useCallback(async () => {
        if (!selectedFamilyId) return;
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/voting-configs?familySpaceId=${selectedFamilyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.config) {
                    setThreshold(data.config.threshold || 66);
                    if (data.config.roles) {
                        setRoles(data.config.roles);
                    }
                    if (data.config.delegations) {
                        setDelegations(data.config.delegations);
                    }
                    setIsDirty(false);
                }
            }
        } catch (err) {
            console.error('Error fetching voting config:', err);
        }
    }, [selectedFamilyId]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleRoleChange = (role, val) => {
        setRoles(prev => ({ ...prev, [role]: val }));
        setIsDirty(true);
    };

    const handleDelegationToggle = (key) => {
        setDelegations(prev => ({ ...prev, [key]: !prev[key] }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!selectedFamilyId) return alert('Select a family space first');
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const res = await fetch(`${baseUrl}/admin/council/voting-configs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    familySpaceId: selectedFamilyId,
                    threshold: Number(threshold),
                    roles,
                    delegations
                })
            });
            if (res.ok) {
                setIsDirty(false);
                alert('Governance configuration applied successfully');
            } else {
                alert('Failed to save governance configuration');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left py-10 pb-40 relative">
            <header className="mb-14 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-brand-darkText leading-none mb-4 tracking-tight">Council Governance</h1>
                    <div className="flex items-center space-x-2">
                        <Gavel size={14} className="text-brand-orange" />
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Protocols & Access Control</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <ControlGroup title="Custom Role Labels" icon={Key}>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Senior Authority Title</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={roles.elder}
                                        onChange={(e) => handleRoleChange('elder', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-[1.5rem] py-5 px-6 text-sm font-black text-gray-900 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                                    />
                                    <MoveRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Active Council Title</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={roles.member}
                                        onChange={(e) => handleRoleChange('member', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-[1.5rem] py-5 px-6 text-sm font-black text-gray-900 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                                    />
                                    <MoveRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Administrative Role Title</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={roles.clerk}
                                        onChange={(e) => handleRoleChange('clerk', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-100 dark:border-brand-darkBorder rounded-[1.5rem] py-5 px-6 text-sm font-black text-gray-900 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all"
                                    />
                                    <MoveRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </ControlGroup>

                    <ControlGroup title="Voting Dynamics" icon={ShieldCheck}>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-brand-darkText mb-1 flex items-center space-x-2">
                                            <span>Resolution Threshold</span>
                                            <Info size={14} className="text-gray-300 cursor-help" />
                                        </h3>
                                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500">Minimum majority required for council decisions</p>
                                    </div>
                                    <span className="text-2xl font-black text-brand-orange leading-none">{threshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="51"
                                    max="100"
                                    value={threshold}
                                    onChange={(e) => { setThreshold(e.target.value); setIsDirty(true) }}
                                    className="w-full h-2 bg-gray-100 dark:bg-brand-darkBg rounded-full appearance-none cursor-pointer accent-brand-orange"
                                />
                                <div className="flex justify-between mt-3 text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest px-1">
                                    <span>Simple Majority (51%)</span>
                                    <span>Unanimous (100%)</span>
                                </div>
                            </div>
                        </div>
                    </ControlGroup>
                </div>

                <div className="space-y-8">
                    <ControlGroup title="Admin Delegations" icon={Settings2}>
                        <div className="space-y-6">
                            {[
                                { t: "Family Admin can add new members", d: "Allows standard admins to bypass council vote for verified claims.", k: "canAddMembers" },
                                { t: "Family Admin can remove members", d: "Revocation of tree access for moderation or privacy breaches.", k: "canRemoveMembers" },
                                { t: "Family Admin can modify roles", d: "Elevate or demote family members within assigned branch.", k: "canModifyRoles" },
                                { t: "Family Admin can modify gov rules", d: "Ability to change thresholds and titles shown on this page.", k: "canModifyGovRules" }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-start py-4 border-b border-gray-50 dark:border-brand-darkBg last:border-0">
                                    <div className="pr-8">
                                        <h3 className="text-xs font-black text-gray-900 dark:text-brand-darkText mb-1">{item.t}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed">{item.d}</p>
                                    </div>
                                    <Toggle checked={delegations[item.k]} onChange={() => handleDelegationToggle(item.k)} />
                                </div>
                            ))}
                        </div>
                    </ControlGroup>

                    <ControlGroup title="Lifecycle Handling" icon={Clock}>
                        <div className="p-4 bg-orange-50 dark:bg-brand-orange/5 rounded-2xl border border-brand-orange/10 mb-6 flex items-start space-x-4">
                            <AlertTriangle className="text-brand-orange shrink-0 mt-0.5" size={18} />
                            <p className="text-[11px] font-medium text-orange-900 dark:text-brand-orange leading-relaxed">
                                Gaps in lineage lifecycle (deceased records, minor transitions) are currently handled by Council Elder by default.
                            </p>
                        </div>
                        <button className="w-full py-5 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-brand-darkBorder text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-brand-orange hover:text-brand-orange transition-all">
                            Configure Asset Transitions
                        </button>
                    </ControlGroup>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-50 transition-all duration-500 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-gray-900/95 dark:bg-brand-darkCard/95 backdrop-blur-xl border border-white/10 dark:border-brand-darkBorder rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl shadow-brand-orange/20">
                    <div className="flex items-center space-x-4 ml-6">
                        <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                            <Settings2 size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white leading-none mb-1">Unsaved Policy Changes</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol updates affect all sub-branches</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={fetchConfig}
                            className="px-8 py-4 rounded-2xl text-xs font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors flex items-center space-x-2"
                        >
                            <Undo2 size={16} strokeWidth={3} />
                            <span>Discard</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-brand-orange text-white px-10 py-5 rounded-3xl font-black text-sm shadow-xl shadow-brand-orange/30 hover:bg-orange-600 transition-all active:scale-95 flex items-center space-x-3"
                        >
                            <Save size={18} strokeWidth={3} />
                            <span>Apply Policy</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouncilGovernance;
