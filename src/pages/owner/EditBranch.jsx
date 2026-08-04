import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Activity,
    Heart
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
                    className={`w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 ${error ? 'focus:ring-red-400/20 ring-1 ring-red-400' : 'focus:ring-brand-orange/5'} transition-all resize-none text-left`}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-gray-50 dark:bg-brand-darkBg/50 border-none rounded-[1.5rem] py-5 pl-[4.5rem] pr-8 text-sm font-bold text-gray-700 dark:text-brand-darkText outline-none focus:ring-4 ${error ? 'focus:ring-red-400/20 ring-1 ring-red-400' : 'focus:ring-brand-orange/5'} transition-all text-left`}
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

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }
        const debounce = setTimeout(async () => {
            setLoading(true);
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
                const user = JSON.parse(localStorage.getItem('user'));
                // Try multiple sources for family ID
                const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;

                if (!familyId) {
                    console.error('No family ID found for search');
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
                        if (selectedValue) onSelect(null); // Clear selection if typing
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
                                    setQuery(''); // Clear query after selection
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

const EditBranch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [branchData, setBranchData] = useState({
        name: '',
        description: '',
        region: '',
        foundingYear: '',
        migrationOrigin: '',
        rootAncestor: null,
        branchHead: null,
        branchAdmin: null,
        emblemUrl: '',
        emblemFile: null,
        visibility: 'family',
        invitePolicy: 'Admin approval required',
        permissions: {
            addMembers: 'Branch Head',
            editHistory: 'Branch Head',
            uploadMedia: 'All Members'
        }
    });

    const fileInputRef = useRef(null);

    const updateBranchData = (newData) => {
        setBranchData(prev => ({ ...prev, ...newData }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            updateBranchData({
                emblemFile: file,
                emblemUrl: URL.createObjectURL(file)
            });
        }
    };

    const fetchBranch = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const response = await fetch(`${baseUrl}/branches/single/${id}?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) {
                setBranchData({
                    name: data.name,
                    description: data.description || '',
                    region: data.region || '',
                    foundingYear: data.founding_year || '',
                    migrationOrigin: data.migration_origin || '',
                    visibility: data.visibility || 'family',
                    invitePolicy: data.invite_policy === 'open' ? 'Open invite' : 'Admin approval required',
                    rootAncestor: data.root_person ? { ...data.root_person, id: data.root_person_id } : null,
                    branchHead: data.persons ? { ...data.persons, id: data.head_person_id } : null,
                    branchAdmin: data.branch_admin ? {
                        ...data.branch_admin,
                        id: data.branch_admin_id,
                        is_virtual: true // Mark as virtual so handleUpdate uses .id
                    } : null,
                    emblemUrl: data.emblem_url || '',
                    emblemFile: null,
                    permissions: {
                        addMembers: data.can_add_members === 'head_only' ? 'Branch Head' : 'All Members',
                        editHistory: data.can_edit_history === 'head_only' ? 'Branch Head' : 'All Members',
                        uploadMedia: data.can_upload_media === 'head_only' ? 'Branch Head' : 'All Members'
                    },
                    memberCount: data.memberCount || 0,
                    householdCount: data.householdCount || 0,
                    generationCount: data.generationCount || 0
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranch();
    }, [id]);

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();

        if (branchData.branchAdmin && !branchData.branchAdmin.email) {
            alert('⚠️ Selected Branch Admin has no email address found. An email is required to assign someone as Branch Admin.');
            return;
        }

        setUpdating(true);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
            const user = JSON.parse(localStorage.getItem('user'));
            const familyId = localStorage.getItem('selected_family_id') || user?.family_id || user?.family_space_id;

            const body = new FormData();
            body.append('family_space_id', familyId);
            body.append('name', branchData.name);
            body.append('description', branchData.description);
            body.append('region', branchData.region);
            body.append('founding_year', branchData.foundingYear || '');
            body.append('migration_origin', branchData.migrationOrigin);
            body.append('root_person_id', branchData.rootAncestor?.id || '');
            body.append('head_person_id', branchData.branchHead?.id || '');

            // For Branch Admin: Must be a User ID or Person ID with email
            const adminUserId = branchData.branchAdmin?.is_virtual ? branchData.branchAdmin.id : (branchData.branchAdmin?.claimed_by || branchData.branchAdmin?.id);
            body.append('branch_admin_id', adminUserId || '');
            body.append('visibility', branchData.visibility);
            body.append('invite_policy', branchData.invitePolicy === 'Open invite' ? 'open' : 'admin_approval');
            body.append('can_add_members', branchData.permissions.addMembers === 'Branch Head' ? 'head_only' : 'all_members');
            body.append('can_edit_history', branchData.permissions.editHistory === 'Branch Head' ? 'head_only' : 'all_members');
            body.append('can_upload_media', branchData.permissions.uploadMedia === 'Branch Head' ? 'head_only' : 'all_members');

            if (branchData.emblemFile) {
                body.append('emblem', branchData.emblemFile);
            }

            const response = await fetch(`${baseUrl}/branches/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body
            });

            if (response.ok) {
                setNotification({ message: 'Branch updated successfully!', type: 'success' });
                setTimeout(() => navigate('/owner/branches'), 1500);
            } else {
                const err = await response.json();
                setNotification({ message: err.error || 'Family RBAC Verification Failed', type: 'error' });
            }
        } catch (err) {
            console.error('Update error:', err);
            setNotification({ message: 'Server connection failed', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-3xl mx-auto w-full text-left relative">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, message: '' })}
            />
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-1">Global Management</h2>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-brand-darkText">Edit Branch Configuration</h1>
                </div>
                <button onClick={() => navigate('/owner/branches')} className="p-4 bg-gray-50 dark:bg-brand-darkBg/50 rounded-2xl text-gray-400 hover:text-brand-orange transition-colors">
                    <X size={24} />
                </button>
            </header>

            <div className="bg-white dark:bg-brand-darkCard rounded-[3rem] border border-gray-100 dark:border-brand-darkBorder shadow-sm p-10 space-y-12 mb-8">

                {/* Branch Snapshot */}
                <section>
                    <SectionHeader icon={Activity} title="Branch Snapshot" subtitle="Key metrics and structured insights" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: 'Members', value: branchData.memberCount || '0', icon: Users },
                            { label: 'Households', value: branchData.householdCount || '0', icon: Heart },
                            { label: 'Generations', value: branchData.generationCount || '0', icon: GitBranch },
                            { label: 'Migration Nodes', value: branchData.nodeCount || '0', icon: MapPin },
                            { label: 'History Chapters', value: '0', icon: FileText },
                            { label: 'Media Assets', value: '0', icon: Shield },
                        ].map((stat, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-brand-darkBg/50 p-4 rounded-2xl border border-gray-100 dark:border-brand-darkBorder transition-all hover:bg-white dark:hover:bg-brand-darkCard group text-left">
                                <div className="flex items-center space-x-2 mb-1">
                                    <stat.icon size={14} className="text-brand-orange" />
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-xl font-black text-gray-900 dark:text-brand-darkText">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Identity */}
                <section>
                    <SectionHeader icon={GitBranch} title="Identity Details" subtitle="Refine branch identification" />
                    <PremiumInput
                        label="Branch Title"
                        icon={GitBranch}
                        value={branchData?.name || ""}
                        onChange={(e) => updateBranchData({ name: e.target.value })}
                        required
                    />
                    <PremiumInput
                        label="Historical Description"
                        icon={FileText}
                        type="textarea"
                        value={branchData?.description || ""}
                        onChange={(e) => updateBranchData({ description: e.target.value })}
                    />
                    <PremiumInput
                        label="Origin Region"
                        icon={MapPin}
                        value={branchData?.region || ""}
                        onChange={(e) => updateBranchData({ region: e.target.value })}
                    />
                </section>

                {/* Lineage */}
                <section className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <SectionHeader icon={Users} title="Lineage & Leadership" subtitle="Manage lineage authority" />
                    <SearchSelect
                        label="Root Ancestor Node"
                        icon={Users}
                        selectedValue={branchData?.rootAncestor}
                        onSelect={(node) => updateBranchData({ rootAncestor: node })}
                        required
                    />
                    <SearchSelect
                        label="Branch Head"
                        icon={Shield}
                        selectedValue={branchData?.branchHead}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-left">
                        <PremiumInput
                            label="Branch Founding Year"
                            icon={FileText}
                            value={branchData.foundingYear}
                            onChange={(e) => updateBranchData({ foundingYear: e.target.value })}
                        />
                        <PremiumInput
                            label="Migration Origin"
                            icon={MapPin}
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
                                {branchData?.emblemUrl ? (
                                    <img src={branchData.emblemUrl} alt="Emblem" className="w-full h-full object-cover" />
                                ) : (
                                    <Shield size={32} />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-4 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-brand-orange shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Replace Emblem
                            </button>
                        </div>
                    </div>
                </section>

                {/* Governance */}
                <section className="pt-12 border-t border-gray-50 dark:border-brand-darkBorder">
                    <SectionHeader icon={Shield} title="Governance & Access" subtitle="Manage access and permissions" />

                    <div className="space-y-6 mb-10 text-left">
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
                                        className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all ${branchData?.invitePolicy === policy ? 'border-brand-orange bg-orange-50 dark:bg-brand-orange/10' : 'border-gray-100 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${branchData?.invitePolicy === policy ? 'border-brand-orange' : 'border-gray-200'}`}>
                                            {branchData?.invitePolicy === policy && <div className="w-2 h-2 bg-brand-orange rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-tight ${branchData?.invitePolicy === policy ? 'text-gray-900 dark:text-brand-darkText' : 'text-gray-400'}`}>{policy}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-brand-darkBg/30 rounded-[2.5rem] p-8 text-left">
                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-6 text-left">Permission Overrides</p>
                        <PermissionToggle
                            label="Who can add members"
                            options={['Branch Head', 'All Members']}
                            value={branchData?.permissions?.addMembers || 'Branch Head'}
                            onChange={(val) => updateBranchData({ permissions: { ...(branchData?.permissions || {}), addMembers: val } })}
                        />
                        <PermissionToggle
                            label="Edit branch history"
                            options={['Branch Head', 'All Members']}
                            value={branchData?.permissions?.editHistory || 'Branch Head'}
                            onChange={(val) => updateBranchData({ permissions: { ...(branchData?.permissions || {}), editHistory: val } })}
                        />
                        <PermissionToggle
                            label="Media Upload privileges"
                            options={['Branch Head', 'All Members']}
                            value={branchData?.permissions?.uploadMedia || 'All Members'}
                            onChange={(val) => updateBranchData({ permissions: { ...(branchData?.permissions || {}), uploadMedia: val } })}
                        />
                    </div>
                </section>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-end">
                <button
                    onClick={() => navigate('/owner/branches')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-brand-darkBg hover:bg-gray-200 dark:hover:bg-brand-darkBorder transition-all uppercase text-sm tracking-widest"
                >
                    Discard Changes
                </button>
                <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-white bg-brand-orange shadow-lg shadow-brand-orange/25 hover:bg-orange-600 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
                >
                    {updating ? 'Updating...' : 'Update Branch Settings'} <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default EditBranch;
