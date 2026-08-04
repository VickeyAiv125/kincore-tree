import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '../../context/BranchContext';
import {
    GitBranch,
    MapPin,
    User,
    Users,
    Shield,
    ChevronDown,
    Search,
    X,
    ArrowRight,
    CheckCircle2,
    Info,
    Lock
} from 'lucide-react';

const InputField = ({ label, placeholder, type = "text", icon: Icon, value, onChange, error, required = false }) => (
    <div className="space-y-1.5 mb-6 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`block w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border ${error ? 'border-red-400' : 'border-transparent'} rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm`}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{error}</p>}
    </div>
);

const TextArea = ({ label, placeholder, value, onChange, rows = 3 }) => (
    <div className="space-y-1.5 mb-6 text-left">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
        </label>
        <textarea
            value={value}
            onChange={onChange}
            rows={rows}
            className="block w-full px-4 py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm resize-none"
            placeholder={placeholder}
        />
    </div>
);

const SearchSelect = ({ label, placeholder, icon: Icon, selectedValue, onSelect, required = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div className="space-y-1.5 mb-6 text-left relative">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : <Search className="h-4 w-4 text-gray-400" />}
                </div>
                <input
                    type="text"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="block w-full pl-11 pr-10 py-3.5 bg-[#F3F4F6]/50 dark:bg-brand-darkBg/50 border border-transparent rounded-2xl focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-brand-darkText font-medium transition-all text-sm"
                    placeholder={selectedValue ? selectedValue.name : placeholder}
                />
                {selectedValue && (
                    <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-orange">
                        <CheckCircle2 size={16} />
                    </button>
                )}
            </div>
            {isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-xl z-50 p-2 animate-fadeIn">
                    <p className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-brand-darkBorder mb-2">Simulated Search Results</p>
                    {['Arthur Harrison', 'George Windsor', 'Elizabeth Spencer'].map(name => (
                        <button
                            key={name}
                            onClick={() => onSelect({ id: Date.now(), name })}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-brand-darkBg rounded-xl transition-colors flex items-center space-x-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                <User size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-brand-darkText">{name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PermissionToggle = ({ label, options, value, onChange }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-50 dark:border-brand-darkBorder last:border-0 group">
        <label className="text-sm font-bold text-gray-700 dark:text-brand-darkText mb-3 sm:mb-0">{label}</label>
        <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1 rounded-xl w-fit">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-tight ${value === opt ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-orange' : 'text-gray-400 hover:text-gray-500'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

const CouncilCreateBranch = () => {
    const navigate = useNavigate();
    const { branchData, updateBranchData } = useBranch();
    const [errors, setErrors] = useState({});
    const [limitStatus, setLimitStatus] = useState({ reached: false, max: 50, current: 0, loading: true });

    React.useEffect(() => {
        const fetchLimit = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const user = JSON.parse(localStorage.getItem('user'));
                const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;
                
                if (!familyId) return;

                const response = await fetch(`${baseUrl}/branches/limit-status/${familyId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLimitStatus({
                        reached: data.limit_reached,
                        max: data.max_branches,
                        current: data.current_branches,
                        loading: false
                    });
                }
            } catch (err) {
                console.error("Limit check error:", err);
                setLimitStatus(prev => ({ ...prev, loading: false }));
            }
        };
        fetchLimit();
    }, []);

    const handleCreate = () => {
        const newErrors = {};
        if (!branchData.name) newErrors.name = 'Branch name is required';
        if (!branchData.rootAncestor) newErrors.rootAncestor = 'Root ancestor is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (branchData.requiresConfirmation) {
            alert('Branch created and sent for Owner approval.');
        } else {
            alert('Branch Created Successfully!');
        }
        navigate('/council/branches');
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-2xl mx-auto w-full">
            <header className="mb-10 text-left">
                <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Council Hub</h2>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <h2 className="text-gray-900 dark:text-brand-darkText text-sm font-bold opacity-30 dark:opacity-40 uppercase tracking-widest leading-none">Branches</h2>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Create New Branch</h1>
            </header>

            {!limitStatus.loading && limitStatus.reached && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-3xl p-6 mb-8 flex items-start space-x-4 text-left">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-red-900 dark:text-red-400 uppercase tracking-tight">Branch Limit Reached</h3>
                        <p className="text-xs font-bold text-red-700/80 dark:text-red-400/80 mt-1">
                            Your family space has reached the maximum allowed limit of {limitStatus.max} branches ({limitStatus.current}/{limitStatus.max}). You cannot create any more branches at this time.
                        </p>
                    </div>
                </div>
            )}

            <div className={`bg-white dark:bg-brand-darkCard rounded-3xl border border-gray-100 dark:border-brand-darkBorder shadow-sm p-8 flex-1 space-y-10 mb-8 ${limitStatus.reached ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Core Information */}
                <section>
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                            <GitBranch size={20} />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">Branch Information</h3>
                    </div>

                    <InputField
                        label="Branch Name"
                        placeholder="e.g. The Spencers of London"
                        required
                        value={branchData.name}
                        onChange={(e) => updateBranchData({ name: e.target.value })}
                        error={errors.name}
                    />

                    <TextArea
                        label="Branch Description"
                        placeholder="Define the purpose and history of this branch..."
                        rows={4}
                        value={branchData.description}
                        onChange={(e) => updateBranchData({ description: e.target.value })}
                    />

                    <InputField
                        label="Branch Region / Hometown"
                        placeholder="City, Country or Region"
                        icon={MapPin}
                        value={branchData.region}
                        onChange={(e) => updateBranchData({ region: e.target.value })}
                    />
                </section>

                {/* Lineage & Leadership */}
                <section className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                            <Users size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">Ancestry & Leadership</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Designate nodes for this lineage</p>
                        </div>
                    </div>

                    <SearchSelect
                        label="Root Ancestor Node"
                        placeholder="Search existing persons..."
                        required
                        selectedValue={branchData.rootAncestor}
                        onSelect={(node) => updateBranchData({ rootAncestor: node })}
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight -mt-4 mb-6 text-left flex items-center">
                        <Info size={12} className="mr-1 inline" /> The starting point for this branch tree
                    </p>

                    <SearchSelect
                        label="Branch Head"
                        placeholder="Select person leader..."
                        icon={Shield}
                        selectedValue={branchData.branchHead}
                        onSelect={(node) => updateBranchData({ branchHead: node })}
                    />

                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-brand-darkBg/30 p-4 rounded-2xl mb-4 group cursor-pointer" onClick={() => updateBranchData({ branchHead: branchData.branchHead ? { ...branchData.branchHead, linkedAccount: !branchData.branchHead.linkedAccount } : null })}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${branchData.branchHead?.linkedAccount ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-brand-darkBorder'}`}>
                            {branchData.branchHead?.linkedAccount && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 transition-colors uppercase tracking-tight">Optionally link to an existing user account</span>
                    </div>
                </section>

                {/* Governance & Confirmation */}
                <section className="pt-10 border-t border-gray-50 dark:border-brand-darkBorder">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-brand-darkText">Governance & Approval</h3>
                    </div>

                    <div className="space-y-6 mb-10 text-left">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invite Policy</label>
                        <div className="flex flex-wrap gap-8">
                            {['Open invite', 'Admin approval required'].map(policy => (
                                <label key={policy} className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        checked={branchData.invitePolicy === policy}
                                        onChange={() => updateBranchData({ invitePolicy: policy })}
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${branchData.invitePolicy === policy ? 'border-brand-orange bg-brand-orange' : 'border-gray-200 dark:border-brand-darkBorder'}`}>
                                        {branchData.invitePolicy === policy && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={`text-sm font-bold ${branchData.invitePolicy === policy ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400'}`}>{policy}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Council Specific Toggle */}
                    <div className="bg-orange-50/50 dark:bg-brand-orange/5 rounded-3xl p-6 border border-orange-100 dark:border-brand-orange/10 mb-10 text-left group transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <Lock size={16} className="text-brand-orange" />
                                <span className="text-sm font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">Requires Owner Confirmation</span>
                            </div>
                            <button
                                onClick={() => updateBranchData({ requiresConfirmation: !branchData.requiresConfirmation })}
                                className={`w-12 h-6 rounded-full transition-all relative ${branchData.requiresConfirmation ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-brand-darkBorder'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${branchData.requiresConfirmation ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                            If enabled, this branch must be approved by an Owner before it becomes active.
                        </p>
                    </div>

                    <div className="bg-[#F3F4F6]/20 dark:bg-brand-darkBg/20 rounded-[2rem] p-6 text-left">
                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-4">Branch Roles – Default Permissions</p>
                        <PermissionToggle
                            label="Who can add members"
                            options={['Branch Head', 'All Members']}
                            value={branchData.permissions.addMembers}
                            onChange={(val) => updateBranchData({ permissions: { ...branchData.permissions, addMembers: val } })}
                        />
                        <PermissionToggle
                            label="Who can edit branch history"
                            options={['Branch Head', 'All Members']}
                            value={branchData.permissions.editHistory}
                            onChange={(val) => updateBranchData({ permissions: { ...branchData.permissions, editHistory: val } })}
                        />
                        <PermissionToggle
                            label="Who can upload media"
                            options={['Branch Head', 'All Members']}
                            value={branchData.permissions.uploadMedia}
                            onChange={(val) => updateBranchData({ permissions: { ...branchData.permissions, uploadMedia: val } })}
                        />
                    </div>
                </section>
            </div>

            {/* Sticky Actions */}
            <div className="sticky bottom-0 left-0 right-0 sm:static bg-white/90 dark:bg-brand-darkCard/90 backdrop-blur-md sm:bg-transparent border-t border-gray-100 dark:border-brand-darkBorder sm:border-none p-4 mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30">
                <button
                    onClick={() => navigate('/council/branches')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreate}
                    disabled={limitStatus.reached}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center font-black disabled:opacity-50 disabled:pointer-events-none"
                >
                    Create Branch <ArrowRight size={16} className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default CouncilCreateBranch;
