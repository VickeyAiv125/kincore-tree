import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '../../context/BranchContext';
import Notification from '../../components/common/Notification';
import {
    GitBranch,
    MapPin,
    User,
    Users,
    Shield,
    X,
    ArrowRight,
    CheckCircle2,
    Info,
    FileText,
    Search
} from 'lucide-react';

const PremiumInput = ({ label, placeholder, icon: Icon, value, onChange, type = "text", error, required }) => (
    <div className="space-y-2 mb-8">
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10">
                <Icon size={22} className="text-brand-orange" />
            </div>
            {type === "textarea" ? (
                <textarea
                    rows="4"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 ${error ? 'focus:ring-red-400/20 ring-1 ring-red-400' : 'focus:ring-brand-orange/5'} transition-all resize-none`}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 ${error ? 'focus:ring-red-400/20 ring-1 ring-red-400' : 'focus:ring-brand-orange/5'} transition-all`}
                />
            )}
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">{error}</p>}
    </div>
);

const SearchSelect = ({ label, placeholder, icon: Icon, selectedValue, onSelect, required, error }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const formatNodeDisplayName = (item) => {
        if (!item) return '';
        const explicitName = item.full_name || item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim();
        if (explicitName && explicitName !== 'Unknown' && !explicitName.includes('@')) {
            return explicitName;
        }
        const targetStr = (explicitName && explicitName.includes('@')) ? explicitName : item.email;
        if (targetStr && targetStr.includes('@')) {
            const prefix = targetStr.split('@')[0];
            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        return explicitName || item.email || '';
    };

    React.useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }
        const debounce = setTimeout(async () => {
            setLoading(true);
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const user = JSON.parse(localStorage.getItem('user'));
                const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;

                if (!familyId) {
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${baseUrl}/tree/search?query=${query}&family_space_id=${familyId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                if (response.ok) setResults(data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div className="space-y-2 mb-8 relative text-left">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group text-left">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-brand-darkCard rounded-2xl shadow-sm flex items-center justify-center group-focus-within:scale-110 transition-transform z-10 border border-gray-50 dark:border-brand-darkBorder">
                    <Icon size={22} className="text-brand-orange" />
                </div>
                <input
                    type="text"
                    value={query || (selectedValue ? formatNodeDisplayName(selectedValue) : '')}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (selectedValue) onSelect(null);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-12 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 focus:ring-brand-orange/5 transition-all text-left placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    placeholder={placeholder}
                />
                {selectedValue && !query && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-orange animate-in zoom-in duration-300">
                        <CheckCircle2 size={18} />
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs font-bold text-red-500 mt-2 ml-1 text-left flex items-center gap-1.5 animate-in fade-in">
                    <span>{error}</span>
                </p>
            )}
            {isFocused && (query.length >= 2 || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] shadow-2xl z-[100] p-4 animate-fadeIn text-left backdrop-blur-xl">
                    <p className="p-2 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-brand-darkBorder mb-2 text-left">
                        {loading ? 'Searching Library...' : results.length > 0 ? 'Verified Nodes Found' : 'No matches found in tree'}
                    </p>
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {results.map(person => (
                            <button
                                key={person.id}
                                onClick={() => {
                                    onSelect(person);
                                    setQuery('');
                                    setIsFocused(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-brand-orange/10 rounded-xl transition-all flex items-center justify-between group/item"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-brand-darkBg flex items-center justify-center text-brand-orange group-hover/item:scale-110 transition-transform">
                                        <User size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-700 dark:text-brand-darkText">
                                            {formatNodeDisplayName(person)}
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                            {person.gender || 'Person'} • {person.is_alive ? 'Living' : 'Deceased'}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover/item:text-brand-orange group-hover/item:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PermissionToggle = ({ label, options, value, onChange }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-50 dark:border-brand-darkBorder last:border-0 group">
        <label className="text-sm font-black text-gray-700 dark:text-brand-darkText uppercase tracking-tight mb-3 sm:mb-0">{label}</label>
        <div className="flex bg-gray-100 dark:bg-brand-darkBg p-1.5 rounded-2xl w-fit shadow-inner">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`px-5 py-2 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${value === opt ? 'bg-white dark:bg-brand-darkCard shadow-md text-brand-orange' : 'text-gray-400 hover:text-gray-500'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 bg-orange-50 dark:bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shadow-sm">
            <Icon size={24} />
        </div>
        <div className="text-left">
            <h3 className="text-xl font-black text-gray-900 dark:text-brand-darkText uppercase tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}
        </div>
    </div>
);

const CreateBranch = () => {
    const navigate = useNavigate();
    const { branchData, updateBranchData } = useBranch();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [emblemFile, setEmblemFile] = useState(null);
    const fileInputRef = useRef(null);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEmblemFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        const newErrors = {};
        if (!branchData.name) newErrors.name = 'Branch name is required';

        if (branchData.branchAdmin && !branchData.branchAdmin.email) {
            alert('⚠️ Selected Branch Admin has no email address found. An email is required to assign someone as Branch Admin.');
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const user = JSON.parse(localStorage.getItem('user'));
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;

            const body = new FormData();
            body.append('family_space_id', familyId);
            body.append('name', branchData.name);
            body.append('description', branchData.description || '');
            body.append('region', branchData.region || '');
            body.append('root_person_id', branchData.rootAncestor?.id || '');
            body.append('head_person_id', branchData.branchHead?.id || '');

            // For Branch Admin: Must be a User ID or Person ID with email
            const adminUserId = branchData.branchAdmin?.is_virtual ? branchData.branchAdmin.id : (branchData.branchAdmin?.claimed_by || branchData.branchAdmin?.id);
            body.append('branch_admin_id', adminUserId || '');
            body.append('founding_year', branchData.foundingYear || '');
            body.append('migration_origin', branchData.migrationOrigin || '');
            body.append('visibility', branchData.visibility || 'family');
            body.append('invite_policy', branchData.invitePolicy === 'Open invite' ? 'open' : 'admin_approval');
            body.append('can_add_members', branchData.permissions?.addMembers === 'Branch Head' ? 'head_only' : 'all_members');
            body.append('can_edit_history', branchData.permissions?.editHistory === 'Branch Head' ? 'head_only' : 'all_members');
            body.append('can_upload_media', branchData.permissions?.uploadMedia === 'Branch Head' ? 'head_only' : 'all_members');

            if (emblemFile) {
                body.append('emblem', emblemFile);
            }

            const response = await fetch(`${baseUrl}/branches`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body
            });

            if (response.ok) {
                setNotification({ message: 'Family Branch Created!', type: 'success' });
                setTimeout(() => navigate('/owner/branches'), 1500);
            } else {
                const err = await response.json();
                setNotification({ message: err.error || 'Family RBAC Verification Failed', type: 'error' });
            }
        } catch (err) {
            console.error('Create branch error:', err);
            setNotification({ message: 'Server connection failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-3xl mx-auto w-full text-left relative">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, message: '' })}
            />
            <header className="mb-10 flex items-center justify-between font-bold">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Global Management</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Create New Branch</h1>
                </div>
                <button onClick={() => navigate('/owner/branches')} className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors">
                    <X size={24} />
                </button>
            </header>

            {!limitStatus.loading && limitStatus.reached && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-[2rem] p-6 mb-8 flex items-start space-x-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-red-900 dark:text-red-400 uppercase tracking-tight">Branch Limit Reached</h3>
                        <p className="text-xs font-bold text-red-700/80 dark:text-red-400/80 mt-1">
                            Your family space has reached the maximum allowed limit of {limitStatus.max} branches ({limitStatus.current}/{limitStatus.max}). You cannot create any more branches at this time. Please contact a platform administrator to increase your quota.
                        </p>
                    </div>
                </div>
            )}

            <div className={`bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-10 space-y-12 mb-8 ${limitStatus.reached ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Core Info */}
                <section>
                    <SectionHeader icon={GitBranch} title="Identity Details" subtitle="Core branch identification" />
                    <PremiumInput
                        label="Branch Title"
                        icon={GitBranch}
                        placeholder="e.g. The Churchill Branch"
                        required
                        value={branchData.name}
                        onChange={(e) => updateBranchData({ name: e.target.value })}
                        error={errors.name}
                    />
                    <PremiumInput
                        label="Historical Description"
                        icon={FileText}
                        type="textarea"
                        placeholder="Define the purpose and history of this branch..."
                        value={branchData.description}
                        onChange={(e) => updateBranchData({ description: e.target.value })}
                    />
                    <PremiumInput
                        label="Origin Region"
                        icon={MapPin}
                        placeholder="City, Country or Region"
                        value={branchData.region}
                        onChange={(e) => updateBranchData({ region: e.target.value })}
                    />
                </section>

                {/* Leadership */}
                <section className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <SectionHeader icon={Users} title="Lineage & Leadership" subtitle="Connect to the family tree" />
                    <SearchSelect
                        label="Root Ancestor Node"
                        placeholder="Search existing persons..."
                        icon={Users}
                        required
                        selectedValue={branchData.rootAncestor}
                        onSelect={(node) => updateBranchData({ rootAncestor: node })}
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight -mt-4 mb-8 text-left flex items-center">
                        <Info size={12} className="mr-1 inline text-brand-orange" /> Starting point for this branch lineage
                    </p>

                    <SearchSelect
                        label="Branch Head"
                        placeholder="Select person leader..."
                        icon={Shield}
                        selectedValue={branchData.branchHead}
                        onSelect={(node) => updateBranchData({ branchHead: node })}
                    />

                    <SearchSelect
                        label="Branch Admin"
                        placeholder="Select operational manager..."
                        icon={Shield}
                        selectedValue={branchData.branchAdmin}
                        onSelect={(node) => updateBranchData({ branchAdmin: node })}
                        error={branchData.branchAdmin && !branchData.branchAdmin.email ? "⚠️ No email found for this member. An email address is required to assign them as Branch Admin." : null}
                    />
                </section>

                {/* Advanced Metadata */}
                <section className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <SectionHeader icon={Info} title="Advanced Metadata" subtitle="Context for lineage and history" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        <PremiumInput
                            label="Branch Founding Year"
                            icon={FileText}
                            placeholder="e.g. 1920"
                            value={branchData.foundingYear}
                            onChange={(e) => updateBranchData({ foundingYear: e.target.value })}
                        />
                        <PremiumInput
                            label="Migration Origin"
                            icon={MapPin}
                            placeholder="Origin city/country"
                            value={branchData.migrationOrigin}
                            onChange={(e) => updateBranchData({ migrationOrigin: e.target.value })}
                        />
                    </div>
                    <div className="space-y-4 pt-10 text-left">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Branch Emblem / Symbol</label>
                        <div className="flex items-center space-x-6">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-[2rem] flex items-center justify-center text-brand-orange shadow-inner overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            >
                                {previewUrl || branchData?.emblemUrl ? (
                                    <img src={previewUrl || branchData.emblemUrl} alt="Emblem" className="w-full h-full object-cover" />
                                ) : (
                                    <Shield size={32} />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-brand-orange shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Upload Emblem
                            </button>
                        </div>
                    </div>
                </section>

                {/* Governance */}
                <section className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <SectionHeader icon={Shield} title="Governance & Access" subtitle="Access and permission rules" />

                    <div className="space-y-6 mb-10">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Branch Visibility</label>
                            <div className="flex flex-wrap gap-4">
                                {['Public Branch', 'Family-only', 'Private Branch'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => updateBranchData({ visibility: v === 'Public Branch' ? 'public' : v === 'Family-only' ? 'family' : 'private' })}
                                        className={`px-6 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${(branchData.visibility || 'family') === (v === 'Public Branch' ? 'public' : v === 'Family-only' ? 'family' : 'private') ? 'border-brand-orange bg-orange-50 dark:bg-brand-orange/10 text-brand-orange' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard text-gray-400'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Invite Policy</label>
                            <div className="flex flex-wrap gap-4">
                                {['Open invite', 'Admin approval required'].map(policy => (
                                    <button
                                        key={policy}
                                        onClick={() => updateBranchData({ invitePolicy: policy })}
                                        className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all ${branchData.invitePolicy === policy ? 'border-brand-orange bg-orange-50 dark:bg-brand-orange/10' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${branchData.invitePolicy === policy ? 'border-brand-orange' : 'border-gray-200'}`}>
                                            {branchData.invitePolicy === policy && <div className="w-2 h-2 bg-brand-orange rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-tight ${branchData.invitePolicy === policy ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400'}`}>{policy}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 mb-4">Governance Rules</label>
                            <div className="space-y-1">
                                <PermissionToggle
                                    label="Who can add members?"
                                    options={['All Members', 'Branch Head']}
                                    value={branchData.permissions?.addMembers || 'Branch Head'}
                                    onChange={(val) => updateBranchData({ permissions: { ...branchData.permissions, addMembers: val } })}
                                />
                                <PermissionToggle
                                    label="Who can edit history?"
                                    options={['All Members', 'Branch Head']}
                                    value={branchData.permissions?.editHistory || 'Branch Head'}
                                    onChange={(val) => updateBranchData({ permissions: { ...branchData.permissions, editHistory: val } })}
                                />
                                <PermissionToggle
                                    label="Who can upload media?"
                                    options={['All Members', 'Branch Head']}
                                    value={branchData.permissions?.uploadMedia || 'All Members'}
                                    onChange={(val) => updateBranchData({ permissions: { ...branchData.permissions, uploadMedia: val } })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-end">
                    <button
                        onClick={() => navigate('/owner/branches')}
                        disabled={loading}
                        className="px-10 py-4 rounded-2xl font-black text-[10px] text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 disabled:opacity-50"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={loading || limitStatus.reached}
                        className="px-12 py-4 rounded-2xl font-black text-[10px] text-white bg-brand-orange uppercase tracking-[0.2em] shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? 'Generating Branch...' : 'Create Family Branch'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateBranch;
